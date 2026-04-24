import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import {
  selectTopic,
  researchBroad,
  researchLocal,
  writeArticle,
  parsePostData,
  sanitiseSlug,
  validatePost,
} from "@/lib/blogPipeline";

// Give the function the full 60s allowed on Vercel Hobby
export const maxDuration = 60;

// ─── POST /api/admin/generate-post-stream ────────────────────────────────────
// Returns a Server-Sent Events stream so the admin UI can show live progress.
export async function POST(req: NextRequest) {
  // Auth via admin session cookie
  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password || !verifyAdminCookie(cookieVal, password)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (!apiKey) {
    return new Response("Server misconfigured: missing GEMINI_API_KEY", { status: 500 });
  }

  // Optional topic from request body
  let requestTopic: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.topic === "string" && body.topic.trim()) {
      requestTopic = body.topic.trim();
    }
  } catch {
    // empty body is fine
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // Initial ping so Vercel flushes headers before any Gemini call starts
      controller.enqueue(encoder.encode(": ping\n\n"));

      try {
        const supabase = createServiceClient();

        // Fetch recent post titles for deduplication (non-fatal)
        let recentTitles: string[] = [];
        try {
          const { data: recentPosts } = await supabase
            .from("blog_posts")
            .select("title")
            .order("created_at", { ascending: false })
            .limit(30);
          recentTitles = (recentPosts ?? []).map((p: { title: string }) => p.title);
        } catch {
          // proceed without deduplication
        }

        // ── Step 1: Topic ──────────────────────────────────────────────────
        let topic = requestTopic;
        if (!topic) {
          emit({ type: "step", id: "topic", label: "Selecting topic", status: "running" });
          topic = await selectTopic(apiKey, recentTitles);
          emit({ type: "step", id: "topic", label: "Selecting topic", status: "done", detail: topic });
        } else {
          emit({ type: "step", id: "topic", label: "Topic provided", status: "done", detail: topic });
        }

        // ── Step 2: Broad research ─────────────────────────────────────────
        emit({
          type: "step",
          id: "research_broad",
          label: "Researching industry trends & statistics",
          status: "running",
        });
        let researchBroadText = "";
        try {
          researchBroadText = await researchBroad(apiKey, topic);
        } catch {
          // fall back — article writer will search on its own
        }
        const broadWords = researchBroadText.split(/\s+/).filter(Boolean).length;
        emit({
          type: "step",
          id: "research_broad",
          label: "Researching industry trends & statistics",
          status: "done",
          detail: `${broadWords.toLocaleString()} words of research gathered`,
        });

        // ── Step 3: Local research ─────────────────────────────────────────
        emit({
          type: "step",
          id: "research_local",
          label: "Researching GTA & Ontario data",
          status: "running",
        });
        let researchLocalText = "";
        try {
          researchLocalText = await researchLocal(apiKey, topic);
        } catch {
          // fall back
        }
        const localWords = researchLocalText.split(/\s+/).filter(Boolean).length;
        emit({
          type: "step",
          id: "research_local",
          label: "Researching GTA & Ontario data",
          status: "done",
          detail: `${localWords.toLocaleString()} words of local data gathered`,
        });

        // ── Step 4: Write ──────────────────────────────────────────────────
        emit({
          type: "step",
          id: "write",
          label: "Writing authoritative article",
          status: "running",
        });
        const rawText = await writeArticle(apiKey, topic, researchBroadText, researchLocalText);

        let postData;
        try {
          postData = parsePostData(rawText);
        } catch {
          throw new Error("Failed to parse article JSON from Gemini — invalid JSON response");
        }

        if (!postData.title || !postData.content || !postData.slug) {
          throw new Error("Gemini response missing required fields (title/slug/content)");
        }

        const wordCount = postData.content
          .replace(/<[^>]+>/g, " ")
          .split(/\s+/)
          .filter(Boolean).length;

        emit({
          type: "step",
          id: "write",
          label: "Writing authoritative article",
          status: "done",
          detail: `${wordCount.toLocaleString()} words — "${postData.title}"`,
        });

        // ── Step 5: Validate ───────────────────────────────────────────────
        emit({ type: "step", id: "validate", label: "Quality validation", status: "running" });
        const { valid, issues } = validatePost(postData);
        if (!valid) {
          emit({
            type: "step",
            id: "validate",
            label: "Quality validation",
            status: "error",
            detail: issues.join("; "),
          });
          throw new Error(`Quality checks failed: ${issues.join("; ")}`);
        }
        emit({
          type: "step",
          id: "validate",
          label: "Quality validation",
          status: "done",
          detail: `✓ Geo tag  ✓ ${wordCount.toLocaleString()} words`,
        });

        // ── Step 6: Save ───────────────────────────────────────────────────
        emit({ type: "step", id: "save", label: "Saving to database", status: "running" });

        postData.slug = sanitiseSlug(postData.slug);
        const { data: existingSlug } = await supabase
          .from("blog_posts")
          .select("slug")
          .eq("slug", postData.slug)
          .maybeSingle();
        if (existingSlug) {
          postData.slug = `${postData.slug}-${new Date().toISOString().slice(0, 10)}`;
        }

        const publishAt = new Date().toISOString();
        const { data: saved, error: dbError } = await supabase
          .from("blog_posts")
          .insert({
            slug: postData.slug,
            title: postData.title,
            excerpt: postData.excerpt ?? "",
            content: postData.content,
            meta_description: postData.meta_description ?? null,
            tags: Array.isArray(postData.tags) ? postData.tags : [],
            author: "HNBK Team",
            published: true,
            ai_generated: true,
            published_at: publishAt,
          })
          .select("id, slug, title, published, published_at, ai_generated, created_at")
          .single();

        if (dbError || !saved) {
          throw new Error(`Database insert failed: ${dbError?.message ?? "no data returned"}`);
        }

        emit({
          type: "step",
          id: "save",
          label: "Saving to database",
          status: "done",
          detail: `/blog/${saved.slug}`,
        });

        // Email notification — non-fatal
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const toEmail = process.env.CONTACT_TO_EMAIL ?? "hello@hnbk.solutions";
          await resend.emails.send({
            from: "HNBK Blogger <noreply@hnbk.solutions>",
            to: toEmail,
            subject: `New post live: "${postData.title}"`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
                <h2 style="color:#A23BEC;">New Blog Post Published</h2>
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:6px 0;font-weight:bold;width:140px;">Title</td><td>${postData.title}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Slug</td><td>/blog/${postData.slug}</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Published</td><td>Live now</td></tr>
                  <tr><td style="padding:6px 0;font-weight:bold;">Tags</td><td>${(postData.tags ?? []).join(", ")}</td></tr>
                </table>
                <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
                <p style="color:#555;font-size:14px;">
                  <strong>View live post:</strong>
                  <a href="https://hnbk.solutions/blog/${postData.slug}">hnbk.solutions/blog/${postData.slug}</a>
                </p>
              </div>
            `,
          });
        } catch {
          // email failure is non-fatal — post is already live
        }

        // ── Complete ───────────────────────────────────────────────────────
        emit({
          type: "complete",
          slug: saved.slug,
          title: saved.title,
          url: `/blog/${saved.slug}`,
          post: {
            id: saved.id,
            slug: saved.slug,
            title: saved.title,
            published: saved.published,
            published_at: saved.published_at,
            ai_generated: saved.ai_generated,
            created_at: saved.created_at,
          },
        });
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
