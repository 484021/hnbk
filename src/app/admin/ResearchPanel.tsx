"use client";

import { useState } from "react";
import Link from "next/link";

export type ResearchEntry = {
  id: string;
  topic_summary: string;
  research_text: string;
  status: "pending" | "used";
  created_at: string;
  post_id: string | null;
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

type WriteState = "idle" | "writing" | "saving" | "done" | "error";

function StatusBadge({ status }: { status: "pending" | "used" }) {
  if (status === "used") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/60 text-emerald-300">
        Used
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-900/60 text-amber-300">
      Pending
    </span>
  );
}

function ResearchRow({
  entry,
  writingId,
  onWritePost,
}: {
  entry: ResearchEntry;
  writingId: string | null;
  onWritePost: (entry: ResearchEntry) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isWriting = writingId === entry.id;
  const anyWriting = writingId !== null;

  return (
    <tr className="border-b border-gray-800/60 hover:bg-gray-900/40 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-white">{entry.topic_summary}</div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-gray-500 hover:text-gray-300 mt-0.5 transition-colors"
        >
          {expanded ? "Hide preview ↑" : "Show preview ↓"}
        </button>
        {expanded && (
          <div className="mt-2 text-xs text-gray-400 bg-gray-900 rounded p-3 max-w-xl whitespace-pre-wrap max-h-48 overflow-y-auto">
            {entry.research_text.slice(0, 1000)}
            {entry.research_text.length > 1000 && "…"}
          </div>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={entry.status} />
      </td>
      <td className="px-4 py-3 text-gray-400 text-sm hidden sm:table-cell whitespace-nowrap">
        {new Date(entry.created_at).toLocaleDateString("en-CA")}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {entry.status === "pending" && (
          <button
            onClick={() => onWritePost(entry)}
            disabled={anyWriting}
            className="text-xs px-2.5 py-1 rounded bg-violet-800/60 hover:bg-violet-700/60 text-violet-200 disabled:opacity-40 transition-colors"
            aria-label={`Write blog post from research: ${entry.topic_summary}`}
          >
            {isWriting ? "Writing…" : "Write Post"}
          </button>
        )}
        {entry.status === "used" && entry.post_id && (
          <span className="text-xs text-gray-500">Published</span>
        )}
      </td>
    </tr>
  );
}

export default function ResearchPanel({
  initialEntries,
  onPostCreated,
}: {
  initialEntries: ResearchEntry[];
  onPostCreated?: (post: PostRecord) => void;
}) {
  const [entries, setEntries] = useState<ResearchEntry[]>(initialEntries);
  const [writingId, setWritingId] = useState<string | null>(null);
  const [writeState, setWriteState] = useState<WriteState>("idle");
  const [activeEntry, setActiveEntry] = useState<ResearchEntry | null>(null);
  const [resultPost, setResultPost] = useState<{ slug: string; title: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleWritePost(entry: ResearchEntry) {
    setWritingId(entry.id);
    setActiveEntry(entry);
    setWriteState("writing");
    setResultPost(null);
    setErrorMsg("");

    try {
      // ── Step: write ──────────────────────────────────────────────────────
      const writeRes = await fetch("/api/admin/blog-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "write",
          topic: entry.topic_summary,
          researchBroadText: entry.research_text,
          researchLocalText: "",
        }),
      });

      if (!writeRes.ok) {
        const d = await writeRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Write failed (HTTP ${writeRes.status})`);
      }

      const writeData = await writeRes.json();
      const rawText: string = writeData.rawText ?? "";
      if (!rawText) throw new Error("Write step returned no content");

      // ── Step: save ───────────────────────────────────────────────────────
      setWriteState("saving");

      const saveRes = await fetch("/api/admin/blog-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "save", rawText }),
      });

      if (!saveRes.ok) {
        const d = await saveRes.json().catch(() => ({}));
        throw new Error(d.error ?? `Save failed (HTTP ${saveRes.status})`);
      }

      const saveData = await saveRes.json();
      const post: PostRecord = saveData.post;
      if (!post?.slug) throw new Error("Save step returned no post record");

      // ── Mark research entry as used ──────────────────────────────────────
      await fetch(`/api/admin/deep-research/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "used", post_id: post.id }),
      });

      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: "used", post_id: post.id } : e)),
      );
      setResultPost({ slug: post.slug, title: post.title });
      setWriteState("done");
      onPostCreated?.(post);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setWriteState("error");
    } finally {
      setWritingId(null);
    }
  }

  function resetWriter() {
    setWriteState("idle");
    setActiveEntry(null);
    setResultPost(null);
    setErrorMsg("");
  }

  if (entries.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="text-white font-semibold text-sm mb-3">Deep Research</h2>
        <p className="text-gray-400 text-sm">
          No research entries yet. The nightly workflow runs at 5:00 AM UTC (midnight EDT).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-white font-semibold text-sm mb-1">Deep Research</h2>
      <p className="text-gray-500 text-xs mb-3">
        AI-researched SMB tech discoveries. Click &quot;Write Post&quot; to generate a full article from the research.
      </p>

      {/* Active writer status */}
      {writeState !== "idle" && activeEntry && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-gray-800 bg-gray-900 text-sm">
          <p className="text-gray-300 font-medium mb-1 truncate">{activeEntry.topic_summary}</p>
          {writeState === "writing" && (
            <p className="text-amber-400 text-xs">Writing article from research…</p>
          )}
          {writeState === "saving" && (
            <p className="text-amber-400 text-xs">Saving post to database…</p>
          )}
          {writeState === "done" && resultPost && (
            <div className="flex items-center gap-3">
              <p className="text-emerald-400 text-xs">Published: {resultPost.title}</p>
              <Link
                href={`/blog/${resultPost.slug}`}
                target="_blank"
                className="text-xs px-2 py-0.5 rounded bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-200 transition-colors"
              >
                View post ↗
              </Link>
              <button onClick={resetWriter} className="text-xs text-gray-500 hover:text-gray-300">
                Dismiss
              </button>
            </div>
          )}
          {writeState === "error" && (
            <div className="flex items-center gap-3">
              <p className="text-red-400 text-xs">Error: {errorMsg}</p>
              <button onClick={resetWriter} className="text-xs text-gray-500 hover:text-gray-300">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Topic</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Date</th>
              <th className="text-right text-gray-400 font-medium px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <ResearchRow
                key={entry.id}
                entry={entry}
                writingId={writingId}
                onWritePost={handleWritePost}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
