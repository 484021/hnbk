import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import {
  selectTopic,
  researchBroad,
  researchLocal,
  writeArticle,
  retryWriteAsJson,
  parsePostData,
  sanitiseSlug,
  validatePost,
} from "@/lib/blogPipeline";

// Each step is a single Gemini call — comfortably under 60s on Vercel Hobby
export const maxDuration = 60;

type StepName = "topic" | "research_broad" | "research_local" | "write" | "save" | "retry_write";

type StepRequest = {
  step: StepName;
  topic?: string;
  researchBroadText?: string;
  researchLocalText?: string;
  rawText?: string;
  generationId?: string;
};

// ─── POST /api/admin/blog-step ───────────────────────────────────────────────
// The client calls this endpoint once per step, passing accumulated context.
// Each call performs exactly ONE operation (one Gemini call or one DB write),
// which keeps execution time well under the 60s Vercel Hobby limit.
export async function POST(req: NextRequest) {
  // Auth via admin session cookie
  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!password || !verifyAdminCookie(cookieVal, password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing GEMINI_API_KEY" },
      { status: 500 },
    );
  }

  let body: StepRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { step } = body;

  // ── Step: topic ─────────────────────────────────────────────────────────────
  if (step === "topic") {
    const supabase = createServiceClient();
    let topic: string;

    if (body.topic?.trim()) {
      topic = body.topic.trim();
    } else {
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

      try {
        topic = await selectTopic(apiKey, recentTitles);
      } catch (err) {
        return NextResponse.json(
          { error: "Topic generation failed", details: String(err) },
          { status: 502 },
        );
      }
    }

    // Persist generation row — non-fatal if it fails
    let generationId: string | null = null;
    try {
      const { data: gen } = await supabase
        .from("blog_generations")
        .insert({ topic, status: "in_progress" })
        .select("id")
        .single();
      generationId = gen?.id ?? null;
    } catch {
      // tracking is best-effort — pipeline still runs without it
    }

    return NextResponse.json({ topic, generationId });
  }

  // ── Step: research_broad ────────────────────────────────────────────────────
  if (step === "research_broad") {
    if (!body.topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }
    let text: string;
    try {
      text = await researchBroad(apiKey, body.topic);
    } catch (err) {
      return NextResponse.json(
        { error: "Broad research failed", details: String(err) },
        { status: 502 },
      );
    }
    if (body.generationId) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("blog_generations")
          .update({ research_broad: text })
          .eq("id", body.generationId);
      } catch { /* non-fatal */ }
    }
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return NextResponse.json({ researchBroadText: text, wordCount });
  }

  // ── Step: research_local ──────────────────────────────────────────────────────
  if (step === "research_local") {
    if (!body.topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }
    let localText: string;
    try {
      localText = await researchLocal(apiKey, body.topic);
    } catch (err) {
      return NextResponse.json(
        { error: "Local research failed", details: String(err) },
        { status: 502 },
      );
    }
    if (body.generationId) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("blog_generations")
          .update({ research_local: localText })
          .eq("id", body.generationId);
      } catch { /* non-fatal */ }
    }
    const localWordCount = localText.split(/\s+/).filter(Boolean).length;
    return NextResponse.json({ researchLocalText: localText, wordCount: localWordCount });
  }

  // ── Step: write ─────────────────────────────────────────────────────────────
  if (step === "write") {
    if (!body.topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }

    // Fetch existing published posts for internal linking
    const supabaseWrite = createServiceClient();
    let existingPosts: { slug: string; title: string }[] = [];
    try {
      const { data: postRows } = await supabaseWrite
        .from("blog_posts")
        .select("slug, title")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(20);
      existingPosts = postRows ?? [];
    } catch {
      // proceed without internal links
    }

    let rawText: string;
    try {
      rawText = await writeArticle(
        apiKey,
        body.topic,
        body.researchBroadText ?? "",
        body.researchLocalText ?? "",
        existingPosts,
      );
    } catch (err) {
      if (body.generationId) {
        try {
          const supabase = createServiceClient();
          await supabase
            .from("blog_generations")
            .update({ status: "failed", error_details: String(err) })
            .eq("id", body.generationId);
        } catch { /* non-fatal */ }
      }
      return NextResponse.json(
        { error: "Article generation failed", details: String(err) },
        { status: 502 },
      );
    }
    let postData;
    try {
      postData = parsePostData(rawText);
    } catch {
      // Gemini returned non-JSON (preamble text, refusal, etc.) — retry once
      // with an explicit "return only JSON" instruction
      let retryRaw: string;
      try {
        retryRaw = await retryWriteAsJson(
          apiKey,
          body.topic,
          body.researchBroadText ?? "",
          body.researchLocalText ?? "",
          existingPosts,
        );
      } catch (retryErr) {
        return NextResponse.json(
          { error: "Article generation failed on retry", details: String(retryErr) },
          { status: 502 },
        );
      }
      try {
        postData = parsePostData(retryRaw);
      } catch {
        return NextResponse.json(
          { error: "Failed to parse Gemini response as JSON after retry", raw: retryRaw.slice(0, 500) },
          { status: 500 },
        );
      }
    }

    if (!postData.title || !postData.content || !postData.slug) {
      return NextResponse.json(
        { error: "Gemini response missing required fields (title/slug/content)" },
        { status: 500 },
      );
    }

    const { valid, issues, wordCount } = validatePost(postData);
    if (!valid) {
      return NextResponse.json(
        { error: "Quality checks failed", issues },
        { status: 422 },
      );
    }

    if (body.generationId) {
      try {
        const supabase = createServiceClient();
        await supabase
          .from("blog_generations")
          .update({ raw_write_output: rawText })
          .eq("id", body.generationId);
      } catch { /* non-fatal */ }
    }

    return NextResponse.json({ postData, wordCount, rawText });
  }

  // ── Step: save ──────────────────────────────────────────────────────────────
  if (step === "save") {
    if (!body.rawText) {
      return NextResponse.json({ error: "Missing rawText" }, { status: 400 });
    }

    let postData;
    try {
      postData = parsePostData(body.rawText);
    } catch {
      return NextResponse.json({ error: "Failed to parse post data" }, { status: 500 });
    }

    postData.slug = sanitiseSlug(postData.slug);

    const supabase = createServiceClient();
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
      if (body.generationId) {
        try {
          await supabase
            .from("blog_generations")
            .update({ status: "failed", error_details: dbError?.message ?? "Insert failed" })
            .eq("id", body.generationId);
        } catch { /* non-fatal */ }
      }
      return NextResponse.json(
        { error: "Database insert failed", details: dbError?.message },
        { status: 500 },
      );
    }

    if (body.generationId) {
      try {
        await supabase
          .from("blog_generations")
          .update({ post_id: saved.id, status: "complete" })
          .eq("id", body.generationId);
      } catch { /* non-fatal */ }
    }

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
      // email failure is non-fatal
    }

    return NextResponse.json({
      post: {
        id: saved.id,
        slug: saved.slug,
        title: saved.title,
        published: saved.published,
        published_at: saved.published_at,
        ai_generated: saved.ai_generated,
        created_at: saved.created_at,
      },
      url: `/blog/${saved.slug}`,
    });
  }

  // ── Step: retry_write ────────────────────────────────────────────────────────
  // Loads research from DB by generationId — no need to re-send large text over the wire.
  // Returns same shape as write step so the client can proceed to save unchanged.
  if (step === "retry_write") {
    if (!body.generationId) {
      return NextResponse.json({ error: "Missing generationId" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Load stored research
    const { data: gen, error: genError } = await supabase
      .from("blog_generations")
      .select("topic, research_broad, research_local")
      .eq("id", body.generationId)
      .single();

    if (genError || !gen) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    // Reset to in_progress
    try {
      await supabase
        .from("blog_generations")
        .update({ status: "in_progress", error_details: null })
        .eq("id", body.generationId);
    } catch { /* non-fatal */ }

    // Fetch existing posts for internal linking
    let existingPostsRetry: { slug: string; title: string }[] = [];
    try {
      const { data: postRows } = await supabase
        .from("blog_posts")
        .select("slug, title")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(20);
      existingPostsRetry = postRows ?? [];
    } catch { /* proceed without */ }

    let rawText: string;
    try {
      rawText = await writeArticle(
        apiKey,
        gen.topic,
        gen.research_broad ?? "",
        gen.research_local ?? "",
        existingPostsRetry,
      );
    } catch (err) {
      try {
        await supabase
          .from("blog_generations")
          .update({ status: "failed", error_details: String(err) })
          .eq("id", body.generationId);
      } catch { /* non-fatal */ }
      return NextResponse.json(
        { error: "Article generation failed", details: String(err) },
        { status: 502 },
      );
    }

    let postData;
    try {
      postData = parsePostData(rawText);
    } catch {
      let retryRaw: string;
      try {
        retryRaw = await retryWriteAsJson(
          apiKey,
          gen.topic,
          gen.research_broad ?? "",
          gen.research_local ?? "",
          existingPostsRetry,
        );
      } catch (retryErr) {
        try {
          await supabase
            .from("blog_generations")
            .update({ status: "failed", error_details: String(retryErr) })
            .eq("id", body.generationId);
        } catch { /* non-fatal */ }
        return NextResponse.json(
          { error: "Article generation failed on retry", details: String(retryErr) },
          { status: 502 },
        );
      }
      try {
        postData = parsePostData(retryRaw);
        rawText = retryRaw;
      } catch {
        return NextResponse.json(
          { error: "Failed to parse Gemini response as JSON after retry" },
          { status: 500 },
        );
      }
    }

    if (!postData.title || !postData.content || !postData.slug) {
      return NextResponse.json(
        { error: "Gemini response missing required fields (title/slug/content)" },
        { status: 500 },
      );
    }

    const { valid, issues, wordCount } = validatePost(postData);
    if (!valid) {
      return NextResponse.json({ error: "Quality checks failed", issues }, { status: 422 });
    }

    try {
      await supabase
        .from("blog_generations")
        .update({ raw_write_output: rawText })
        .eq("id", body.generationId);
    } catch { /* non-fatal */ }

    return NextResponse.json({ postData, wordCount, rawText, topic: gen.topic });
  }

  return NextResponse.json({ error: `Unknown step: ${step}` }, { status: 400 });
}
