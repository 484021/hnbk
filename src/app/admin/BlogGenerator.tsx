"use client";

import { useState, useRef } from "react";
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

type SSEEvent =
  | { type: "step"; id: string; label: string; status: StepStatus; detail?: string }
  | { type: "complete"; slug: string; title: string; url: string; post: PostRecord }
  | { type: "error"; message: string };

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
}: {
  onPostCreated?: (post: PostRecord) => void;
}) {
  const router = useRouter();
  const [topicInput, setTopicInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<{ slug: string; title: string; url: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  function resetState() {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" as StepStatus, detail: undefined })));
    setResult(null);
    setErrorMsg("");
    setElapsed(0);
  }

  function updateStep(id: string, updates: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  async function generate() {
    resetState();
    setGenerating(true);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    let completed = false;

    try {
      const res = await fetch("/api/admin/generate-post-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput.trim() || undefined }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by blank lines (\n\n)
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
          if (!dataLine) continue;

          let event: SSEEvent;
          try {
            event = JSON.parse(dataLine.slice(6));
          } catch {
            continue;
          }

          if (event.type === "step") {
            updateStep(event.id, {
              label: event.label,
              status: event.status,
              detail: event.detail,
            });
          } else if (event.type === "complete") {
            completed = true;
            setResult({ slug: event.slug, title: event.title, url: event.url });
            onPostCreated?.(event.post);
          } else if (event.type === "error") {
            completed = true;
            setErrorMsg(event.message);
            setSteps((prev) =>
              prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s)),
            );
          }
        }
      }

      // Stream closed without a complete or error event — likely a timeout
      if (!completed) {
        setErrorMsg(
          "Generation timed out (60s limit). Refresh the page — the post may still have been saved.",
        );
        setSteps((prev) =>
          prev.map((s) => (s.status === "running" ? { ...s, status: "error" } : s)),
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error — please try again");
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
          ✓
        </span>
      );
    }
    if (status === "error") {
      return (
        <span className="text-red-400 text-sm font-bold leading-none shrink-0" aria-hidden="true">
          ✗
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
            4-step AI pipeline: topic → research → write → publish
          </p>
        </div>
        {generating && (
          <span className="text-xs text-gray-500 tabular-nums" aria-live="polite">
            {elapsed}s
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Topic input + Generate button — shown when idle */}
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
                      <span className="ml-2 text-xs text-gray-500 animate-pulse">working…</span>
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
          </div>
        )}

        {/* Success panel */}
        {result && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-900/20 border border-emerald-800/40">
            <p className="text-emerald-400 text-sm font-medium">Published successfully</p>
            <p className="text-emerald-300/70 text-xs mt-0.5 truncate">"{result.title}"</p>
            <div className="flex gap-3 mt-3">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                View post →
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

        {/* Generating — footer note */}
        {generating && (
          <p className="mt-3 text-xs text-gray-600">
            This takes 40–60 seconds — do not close this tab
          </p>
        )}
      </div>
    </div>
  );
}
