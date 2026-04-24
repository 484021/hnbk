import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";
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

// Give the function the full 60s allowed on Vercel Hobby
export const maxDuration = 60;

// --- Constant-time bearer token comparison -----------------------------------
function validateBearer(header: string, secret: string): boolean {
  try {
    const expected = `Bearer ${secret}`;
    const key = Buffer.from("hnbk-blog-auth");
    const a = crypto.createHmac("sha256", key).update(header).digest();
    const b = crypto.createHmac("sha256", key).update(expected).digest();
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// --- POST /api/generate-post -------------------------------------------------
export async function POST(req: NextRequest) {
  // 1. Auth
  const secret = process.env.BLOG_GENERATION_SECRET ?? "";
  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured: missing BLOG_GENERATION_SECRET" },
      { status: 500 },
    );
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (!validateBearer(authHeader, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing GEMINI_API_KEY" },
      { status: 500 },
    );
  }

  // 2. Optional topic from request body
  let topic: string | undefined;
  try {
    const body = await req.json();
    if (typeof body.topic === "string" && body.topic.trim()) {
      topic = body.topic.trim();
    }
  } catch {
    // empty body is fine
  }

  // 3. Fetch recent post titles for topic deduplication (non-fatal)
  const supabase = createServiceClient();
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

  // 4. Topic selection
  if (!topic) {
    try {
      topic = await selectTopic(apiKey, recentTitles);
    } catch (err) {
      return NextResponse.json(
        { error: "Topic generation failed", details: String(err) },
        { status: 502 },
      );
    }
  }

  // 5. Deep research - two Google-Search-grounded calls
  let researchBroadText = "";
  try {
    researchBroadText = await researchBroad(apiKey, topic);
  } catch {
    // fall back - article writer will do its own search
  }

  let researchLocalText = "";
  try {
    researchLocalText = await researchLocal(apiKey, topic);
  } catch {
    // fall back
  }

  // 6. Write article
  let rawText: string;
  try {
    rawText = await writeArticle(apiKey, topic, researchBroadText, researchLocalText);
  } catch (err) {
    return NextResponse.json(
      { error: "Article generation failed", details: String(err) },
      { status: 502 },
    );
  }

  // 7. Parse JSON — retry once if Gemini returned non-JSON
  let postData;
  try {
    postData = parsePostData(rawText);
  } catch {
    try {
      const retryRaw = await retryWriteAsJson(apiKey, topic, researchBroadText, researchLocalText);
      postData = parsePostData(retryRaw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse Gemini response as JSON after retry", raw: rawText.slice(0, 500) },
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

  // 8. Quality validation
  const { valid, issues } = validatePost(postData);
  if (!valid) {
    console.error("[blog] quality validation failed:", issues.join("; "));
    return NextResponse.json(
      { error: "Generated post failed quality checks", issues },
      { status: 500 },
    );
  }

  // 9. Sanitise slug + collision guard
  postData.slug = sanitiseSlug(postData.slug);
  const { data: existingSlug } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("slug", postData.slug)
    .maybeSingle();
  if (existingSlug) {
    postData.slug = `${postData.slug}-${new Date().toISOString().slice(0, 10)}`;
  }

  // 10. Save to Supabase - live immediately
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
    .select("slug, published_at")
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Database insert failed", details: dbError.message },
      { status: 500 },
    );
  }

  // 11. Email notification - non-fatal
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
            <strong>View live post:</strong> <a href="https://hnbk.solutions/blog/${postData.slug}">hnbk.solutions/blog/${postData.slug}</a><br />
            <strong>To unpublish:</strong> set <code>published = false</code> on slug <code>${postData.slug}</code> in Supabase.
          </p>
        </div>
      `,
    });
  } catch {
    // email failure is non-fatal
  }

  return NextResponse.json(
    { slug: saved?.slug, published_at: saved?.published_at, topic },
    { status: 201 },
  );
}