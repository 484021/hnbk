"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BlogGenerator from "./BlogGenerator";

type Post = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  published_at: string | null;
  ai_generated: boolean;
  created_at: string;
};

type Generation = {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  post_id: string | null;
};

function postStatus(post: Post): { label: string; className: string } {
  if (!post.published) return { label: "Draft", className: "bg-gray-700 text-gray-300" };
  const now = new Date();
  const pub = post.published_at ? new Date(post.published_at) : null;
  if (!pub || pub > now) {
    const dateStr = pub
      ? pub.toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "Unknown";
    return { label: `Scheduled ${dateStr}`, className: "bg-amber-900/60 text-amber-300" };
  }
  return { label: "Live", className: "bg-emerald-900/60 text-emerald-300" };
}

function genStatusBadge(status: string): { label: string; className: string } {
  if (status === "complete") return { label: "Complete", className: "bg-emerald-900/60 text-emerald-300" };
  if (status === "failed") return { label: "Failed", className: "bg-red-900/60 text-red-300" };
  return { label: "In Progress", className: "bg-amber-900/60 text-amber-300" };
}

export default function AdminDashboard({
  initialPosts,
  initialGenerations = [],
}: {
  initialPosts: Post[];
  initialGenerations?: Generation[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [retryGen, setRetryGen] = useState<{ id: string; topic: string } | null>(null);

  async function publishNow(slug: string) {
    setBusy(slug);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true, published_at: new Date().toISOString() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.slug === slug ? { ...p, published: true, published_at: updated.post.published_at } : p,
          ),
        );
        setMsg(`"${slug}" published.`);
      } else {
        const d = await res.json();
        setMsg(`Error: ${d.error}`);
      }
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function deletePost(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(slug);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
        setMsg(`Deleted "${slug}".`);
      } else {
        const d = await res.json();
        setMsg(`Error: ${d.error}`);
      }
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">HNBK Admin</h1>
          <p className="text-gray-400 text-xs mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* New generation (normal or retry mode) */}
        <BlogGenerator
          key={retryGen?.id ?? "default"}
          onPostCreated={(post) => {
            setPosts((prev) => [post, ...prev]);
            if (retryGen) {
              // Update generation status in local state
              setGenerations((prev) =>
                prev.map((g) => (g.id === retryGen.id ? { ...g, status: "complete", post_id: post.id } : g)),
              );
              setRetryGen(null);
            }
          }}
          initialGenerationId={retryGen?.id}
          initialTopic={retryGen?.topic}
        />

        {msg && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-gray-800 text-gray-200 text-sm">
            {msg}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-400 text-center py-20">No posts yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Title</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Created</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const status = postStatus(post);
                  const isBusy = busy === post.slug;
                  const isScheduled = status.label.startsWith("Scheduled");
                  return (
                    <tr key={post.id} className="border-b border-gray-800/60 hover:bg-gray-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white truncate max-w-xs">{post.title}</div>
                        <div className="text-gray-500 text-xs truncate max-w-xs mt-0.5">{post.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        {post.ai_generated && (
                          <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-900/60 text-violet-300">
                            AI
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                        {new Date(post.created_at).toLocaleDateString("en-CA")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isScheduled && (
                            <button
                              onClick={() => publishNow(post.slug)}
                              disabled={isBusy}
                              className="text-xs px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                            >
                              {isBusy ? "…" : "Publish now"}
                            </button>
                          )}
                          <Link
                            href={`/admin/posts/${post.slug}`}
                            className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deletePost(post.slug, post.title)}
                            disabled={isBusy}
                            className="text-xs px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800/60 text-red-300 disabled:opacity-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Generation History ──────────────────────────────────────────── */}
        {generations.length > 0 && (
          <div className="mt-10">
            <h2 className="text-white font-semibold text-sm mb-3">Generation History</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900">
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Topic</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3 hidden sm:table-cell">Created</th>
                    <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generations.map((gen) => {
                    const badge = genStatusBadge(gen.status);
                    const canRetry = gen.status === "failed" || gen.status === "in_progress";
                    const isRetrying = retryGen?.id === gen.id;
                    return (
                      <tr key={gen.id} className="border-b border-gray-800/60 hover:bg-gray-900/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-white truncate max-w-xs">{gen.topic}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                          {new Date(gen.created_at).toLocaleDateString("en-CA")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canRetry && (
                            <button
                              onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                setRetryGen({ id: gen.id, topic: gen.topic });
                              }}
                              disabled={isRetrying}
                              className="text-xs px-2.5 py-1 rounded bg-violet-800/60 hover:bg-violet-700/60 text-violet-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                            >
                              {isRetrying ? "Retrying…" : "Retry write"}
                            </button>
                          )}
                          {gen.status === "complete" && gen.post_id && (
                            <span className="text-xs text-gray-500">Published</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
