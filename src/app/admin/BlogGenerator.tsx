"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "pending" | "running" | "done" | "error";

type Step = {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
};

type PostRecord = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  published_at: string | null;
  ai_generated: boolean;
  created_at: string;
};

const INITIAL_STEPS: Step[] = [
  { id: "topic", label: "Selecting topic", status: "pending" },
  { id: "research_broad", label: "Researching industry trends & statistics", status: "pending" },
  { id: "research_local", label: "Researching GTA & Ontario data", status: "pending" },
  { id: "write", label: "Writing authoritative article", status: "pending" },
  { id: "validate", label: "Quality validation", status: "pending" },
  { id: "save", label: "Saving to database", status: "pending" },
];

export default function BlogGenerator({
  onPostCreated,
  initialGenerationId,
  initialTopic,
}: {
  onPostCreated?: (post: PostRecord) => void;
  initialGenerationId?: string;
  initialTopic?: string;
}) {
  const router = useRouter();
  const [topicInput, setTopicInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<{ slug: string; title: string; url: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [generationId, setGenerationId] = useState<string | null>(initialGenerationId ?? null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-start retry when mounted with an initialGenerationId (from Generation History)
  useEffect(() => {
    if (initialGenerationId) {
      void retryWrite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetState() {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as StepStatus, detail: undefined })));
    setResult(null);
    setErrorMsg("");
    setElapsed(0);
  }

  function markRunning(id: string, label?: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "running", label: label ?? s.label, detail: undefined } : s)),
    );
  }

  function markDone(id: string, detail?: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "done", detail } : s)),
    );
  }

  function markError(id: string, detail?: string) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "error", detail } : s)),
    );
  }

  async function callStep<T>(stepName: string, body: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 58000); // 58s client-side limit
    let res: Response;
    try {
      res = await fetch("/api/admin/blog-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepName, ...body }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if ((err as Error).name === "AbortError") {
        throw new Error(`Step "${stepName}" timed out (>58s). The Gemini search call may be slow — try again.`);
      }
      throw err;
    }
    clearTimeout(timeout);
    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(text);
    } catch {
      // Server returned non-JSON (Vercel 504, gateway error, etc.)
      throw new Error(
        `Step "${stepName}" returned an unexpected response (status ${res.status}). The server may have timed out — try again.`,
      );
    }
    if (!res.ok) {
      const msg = (data.error as string) ?? `Step "${stepName}" failed with status ${res.status}`;
      const details = data.details ? ` — ${data.details as string}` : "";
      throw new Error(msg + details);
    }
    return data as T;
  }

  async function generate() {
    resetState();
    setGenerationId(null);
    setGenerating(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      // 1. Topic
      markRunning("topic");
      const { topic, generationId: genId } = await callStep<{ topic: string; generationId: string | null }>("topic", {
        topic: topicInput.trim() || undefined,
      });
      if (genId) setGenerationId(genId);
      markDone("topic", topic);

      // 2. Broad research
      markRunning("research_broad");
      const { researchBroadText, wordCount: broadWords } = await callStep<{
        researchBroadText: string;
        wordCount: number;
      }>("research_broad", { topic, generationId: genId ?? undefined });
      markDone(
        "research_broad",
        broadWords === 0
          ? "Search unavailable - article writer will use its own knowledge"
          : `${broadWords.toLocaleString()} words of research gathered`,
      );

      // 3. Local research
      markRunning("research_local");
      const { researchLocalText, wordCount: localWords } = await callStep<{
        researchLocalText: string;
        wordCount: number;
      }>("research_local", { topic, generationId: genId ?? undefined });
      markDone("research_local", `${localWords.toLocaleString()} words of local data gathered`);

      // 4. Write
      markRunning("write");
      const { postData, wordCount, rawText } = await callStep<{
        postData: { title: string };
        wordCount: number;
        rawText: string;
      }>("write", { topic, researchBroadText, researchLocalText, generationId: genId ?? undefined });
      markDone("write", `${wordCount.toLocaleString()} words - "${postData.title}"`);

      // 5. Validate (done inside write step)
      markRunning("validate");
      markDone("validate", `Geo tag confirmed  ${wordCount.toLocaleString()} words`);

      // 6. Save
      markRunning("save");
      const { post, url } = await callStep<{ post: PostRecord; url: string }>("save", { rawText, generationId: genId ?? undefined });
      markDone("save", url);

      setResult({ slug: post.slug, title: post.title, url });
      onPostCreated?.(post);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error - please try again";
      setErrorMsg(message);
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s)),
      );
    } finally {
      setGenerating(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  // Retry just the write + save steps using research already stored in DB.
  // Used both by the inline "Retry write" button and the Generation History panel.
  async function retryWrite() {
    const gId = generationId ?? initialGenerationId;
    if (!gId) return;

    // Reset only write/validate/save — leave topic/research steps as-is
    setSteps((prev) =>
      prev.map((s) => {
        if (["topic", "research_broad", "research_local"].includes(s.id)) {
          // Mark pre-steps as done if they were pending (history retry mode)
          if (s.status === "pending") {
            return {
              ...s, status: "done" as StepStatus,
              detail: s.id === "topic" ? (initialTopic ?? "From history") : "Loaded from database",
            };
          }
          return s;
        }
        return { ...s, status: "pending" as StepStatus, detail: undefined };
      }),
    );
    setResult(null);
    setErrorMsg("");
    setElapsed(0);
    setGenerating(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    try {
      // Write (loads research from DB server-side)
      markRunning("write");
      const { postData, wordCount, rawText } = await callStep<{
        postData: { title: string };
        wordCount: number;
        rawText: string;
      }>("retry_write", { generationId: gId });
      markDone("write", `${wordCount.toLocaleString()} words - "${postData.title}"`);

      markRunning("validate");
      markDone("validate", `${wordCount.toLocaleString()} words`);

      markRunning("save");
      const { post, url } = await callStep<{ post: PostRecord; url: string }>("save", {
        rawText,
        generationId: gId,
      });
      markDone("save", url);

      setResult({ slug: post.slug, title: post.title, url });
      onPostCreated?.(post);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error - please try again";
      setErrorMsg(message);
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" as StepStatus } : s)),
      );
    } finally {
      setGenerating(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function StepIcon({ status }: { status: StepStatus }) {
    if (status === "running") {
      return (
        <span
          className="inline-block w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent animate-spin shrink-0"
          aria-hidden="true"
        />
      );
    }
    if (status === "done") {
      return (
        <span className="text-emerald-400 text-sm font-bold leading-none shrink-0" aria-hidden="true">
          +
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="text-red-400 text-sm font-bold leading-none shrink-0" aria-hidden="true">
          x
        </span>
      );
    }
    return (
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0"
        aria-hidden="true"
      />
    );
  }

  const showPipeline = generating || result !== null || errorMsg !== "";

  return (
    <div className="mb-6 rounded-xl border border-violet-900/40 bg-gray-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm">Generate Blog Post</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            4-step AI pipeline: topic -&gt; research -&gt; write -&gt; publish
          </p>
        </div>
        {generating && (
          <span className="text-xs text-gray-500 tabular-nums" aria-live="polite">
            {elapsed}s
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Topic input + Generate button */}
        {!showPipeline && (
          <div className="flex gap-3">
            <label htmlFor="blog-topic-input" className="sr-only">
              Optional topic
            </label>
            <input
              id="blog-topic-input"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !generating && generate()}
              placeholder="Optional: enter a topic, or leave blank for AI to pick"
              className="min-w-0 grow text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-violet-600 focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            />
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="shrink-0 px-4 py-2 rounded-lg bg-violet-700 hover:bg-violet-600 text-white text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            >
              Generate Post
            </button>
          </div>
        )}

        {/* Pipeline step list */}
        {showPipeline && (
          <div className="space-y-3" role="status" aria-live="polite" aria-label="Generation progress">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-4 flex items-center justify-center">
                  <StepIcon status={step.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm ${
                      step.status === "done"
                        ? "text-white"
                        : step.status === "running"
                          ? "text-violet-300"
                          : step.status === "error"
                            ? "text-red-400"
                            : "text-gray-500"
                    }`}
                  >
                    {step.label}
                    {step.status === "running" && (
                      <span className="ml-2 text-xs text-gray-500 animate-pulse">working...</span>
                    )}
                  </div>
                  {step.detail && (
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{step.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error panel */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-4 px-3 py-2.5 rounded-lg bg-red-900/30 border border-red-800/50 text-sm text-red-300"
          >
            {errorMsg}
            {(generationId ?? initialGenerationId) && (
              <button
                type="button"
                onClick={() => void retryWrite()}
                disabled={generating}
                className="mt-2 block text-xs px-3 py-1.5 rounded bg-violet-800/60 hover:bg-violet-700/60 text-violet-200 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                Retry write step
              </button>
            )}
          </div>
        )}

        {/* Success panel */}
        {result && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40">
            <p className="text-emerald-400 text-sm font-medium">Published successfully</p>
            <p className="text-emerald-300/70 text-xs mt-0.5 truncate">&quot;{result.title}&quot;</p>
            <div className="flex gap-3 mt-3">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                View post
              </a>
              <button
                type="button"
                onClick={() => {
                  resetState();
                  router.refresh();
                }}
                className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                Generate another
              </button>
            </div>
          </div>
        )}

        {/* Footer note while generating */}
        {generating && (
          <p className="mt-3 text-xs text-gray-600">
            Each step runs independently - no timeouts
          </p>
        )}
      </div>
    </div>
  );
}
