import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "crypto";

// ─── Gemini REST helper ──────────────────────────────────────────────────────
async function geminiGenerate(
  apiKey: string,
  prompt: string,
  useSearch = false,
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (useSearch) {
    body.tools = [{ google_search: {} }];
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err.slice(0, 400)}`);
  }

  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text as string) ?? "";
}

// ─── Constant-time auth via HMAC digest comparison ──────────────────────────
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

// ─── POST /api/generate-post ─────────────────────────────────────────────────
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
    // empty body is fine — topic will be auto-selected
  }

  // 3. Pick topic with Gemini if none provided
  if (!topic) {
    try {
      const month = new Date().toLocaleDateString("en-CA", {
        month: "long",
        year: "numeric",
      });
      topic = (
        await geminiGenerate(
          apiKey,
          `You are a content strategist for HNBK (hnbk.solutions), a Toronto-based company offering AI agent orchestration, business automation, and custom software to Canadian SMBs.

Pick ONE specific, high-value blog article topic for ${month}. Requirements:
- Appeals to Canadian small/mid-sized business owners (5–200 employees)
- Practical and actionable, not theoretical
- Covers AI agents, automation, operational efficiency, or custom software
- Specific enough to rank for a long-tail keyword
- 5–12 words long

Respond with ONLY the topic title. No explanation, no punctuation at the end.`,
        )
      ).trim();
    } catch (err) {
      return NextResponse.json(
        { error: "Topic generation failed", details: String(err) },
        { status: 502 },
      );
    }
  }

  // 4. Research + write with Google Search grounding (single call)
  let rawText: string;
  try {
    rawText = await geminiGenerate(
      apiKey,
      `You are a content writer for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Canadian SMBs.

Write a comprehensive, SEO-optimized blog article on: "${topic}"

About HNBK:
- Services: AI agent orchestration, custom software, business automation, AI strategy consulting
- Audience: Canadian business owners, 5–200 employees, looking to scale without hiring
- Voice: Authoritative, practical, consultant-level — no fluff, specific examples

Requirements:
- 900–1200 words
- Include current stats or trends (use Google Search grounding)
- H2 headings to structure the piece
- Canadian context where relevant (CAD costs, Canadian industries)
- End with a 2-sentence soft CTA mentioning HNBK at hnbk.solutions

CRITICAL: Return ONLY a raw JSON object. No markdown code fences. No text before or after. Just valid JSON.

{
  "title": "SEO title, 50–60 characters",
  "slug": "url-slug-lowercase-hyphens-only",
  "excerpt": "2-sentence summary, 150–160 characters total",
  "meta_description": "SEO meta description, 150–160 characters",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "content": "full HTML — only <h2> <p> <ul> <li> <strong> <blockquote> <hr> tags"
}`,
      true, // Google Search grounding enabled
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Article generation failed", details: String(err) },
      { status: 502 },
    );
  }

  // 5. Parse JSON — strip markdown fences Gemini sometimes wraps output in
  type PostData = {
    title: string;
    slug: string;
    excerpt: string;
    meta_description: string;
    tags: string[];
    content: string;
  };

  let postData: PostData;
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    postData = JSON.parse(cleaned) as PostData;
  } catch {
    return NextResponse.json(
      {
        error: "Failed to parse Gemini response as JSON",
        raw: rawText.slice(0, 800),
      },
      { status: 500 },
    );
  }

  if (!postData.title || !postData.content || !postData.slug) {
    return NextResponse.json(
      { error: "Gemini response missing required fields (title/slug/content)" },
      { status: 500 },
    );
  }

  // Sanitise slug — lowercase alphanumeric + hyphens only
  postData.slug = postData.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 6. Save to Supabase — published=true but published_at is 24h in the future
  const supabase = createServiceClient();
  const publishAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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

  // 7. Email notification — non-fatal
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const toEmail = process.env.CONTACT_TO_EMAIL ?? "hello@hnbk.solutions";
    const publishLocal = new Date(publishAt).toLocaleString("en-CA", {
      timeZone: "America/Toronto",
      dateStyle: "medium",
      timeStyle: "short",
    });
    await resend.emails.send({
      from: "HNBK Blogger <noreply@hnbk.solutions>",
      to: toEmail,
      subject: `New AI post ready: "${postData.title}"`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
          <h2 style="color:#A23BEC;">New Blog Post Generated</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;font-weight:bold;width:140px;">Title</td><td>${postData.title}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Slug</td><td>/blog/${postData.slug}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Auto-publishes</td><td>${publishLocal} ET</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Tags</td><td>${(postData.tags ?? []).join(", ")}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <p style="color:#555;font-size:14px;">
            <strong>To cancel:</strong> delete row with slug <code>${postData.slug}</code> from Supabase → blog_posts before ${publishLocal}.<br />
            <strong>Preview after publish:</strong> <a href="https://hnbk.solutions/blog/${postData.slug}">hnbk.solutions/blog/${postData.slug}</a>
          </p>
        </div>
      `,
    });
  } catch {
    // email failure is non-fatal — post is already saved
  }

  return NextResponse.json(
    { slug: saved?.slug, published_at: saved?.published_at, topic },
    { status: 201 },
  );
}
