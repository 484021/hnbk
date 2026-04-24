"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
};

export default function EditForm({ post }: { post: Post }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: post.title,
    excerpt: post.excerpt,
    meta_description: post.meta_description ?? "",
    tags: (post.tags ?? []).join(", "),
    content: post.content,
    published: post.published,
    published_at: post.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch(`/api/admin/posts/${post.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          meta_description: form.meta_description.trim() || null,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          content: form.content,
          published: form.published,
          published_at: form.published_at
            ? new Date(form.published_at).toISOString()
            : null,
        }),
      });
      if (res.ok) {
        setMsg("Saved.");
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? "Save failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";
  const labelClass = "block text-sm text-gray-300 mb-1";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="text-gray-400 hover:text-white text-sm transition-colors"
          aria-label="Back to dashboard"
        >
          ← Dashboard
        </button>
        <h1 className="font-bold text-white truncate">{post.slug}</h1>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="ef-title" className={labelClass}>Title</label>
            <input
              id="ef-title"
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="ef-excerpt" className={labelClass}>Excerpt</label>
            <textarea
              id="ef-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="ef-meta" className={labelClass}>Meta description (150–160 chars)</label>
            <input
              id="ef-meta"
              type="text"
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              maxLength={170}
              className={fieldClass}
            />
            <p className="text-xs text-gray-500 mt-1">{form.meta_description.length} / 160</p>
          </div>

          <div>
            <label htmlFor="ef-tags" className={labelClass}>Tags (comma-separated)</label>
            <input
              id="ef-tags"
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                id="ef-published"
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="accent-violet-500 w-4 h-4"
              />
              <label htmlFor="ef-published" className="text-sm text-gray-300">Published</label>
            </div>
            <div className="flex-1">
              <label htmlFor="ef-pub-date" className={labelClass}>Publish date/time</label>
              <input
                id="ef-pub-date"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => set("published_at", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="ef-content" className={labelClass}>
              Content (HTML — h2, p, ul, li, strong, blockquote)
            </label>
            <textarea
              id="ef-content"
              rows={24}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className={`${fieldClass} font-mono text-xs leading-relaxed`}
            />
          </div>

          {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white py-2 transition-colors"
            >
              View post ↗
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
