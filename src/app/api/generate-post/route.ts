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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          `You are a content strategist for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Greater Toronto Area (GTA) small and mid-sized businesses.

Pick ONE specific, high-value blog article topic for ${month}.

TARGET READER:
- GTA business owner (Toronto, Mississauga, Brampton, Markham, Vaughan, Scarborough, North York, Etobicoke)
- 5–100 employees, owner-operated
- Industries: construction/trades, restaurants, professional services (accounting, law, mortgage, real estate), medical/dental clinics, retail, trucking/logistics, property management
- Pain points: rising labour costs, WSIB compliance paperwork, missed customer follow-ups, manual scheduling, poor cash flow visibility, slow quote turnaround
- Wants: save 5–15 hrs/week, cut costs by 20–30%, grow without hiring

TOPIC REQUIREMENTS:
- Specific to ONE of the above industries or pain points — not generic "AI for business"
- Phrased like something a GTA owner would type into Google today (long-tail search intent)
- References a GTA city, Ontario regulation, or seasonal context when natural (WSIB, Ontario min wage, HST, construction season April–October, year-end tax prep)
- Actionable and practical — the reader should know exactly what the article will teach them
- 5–12 words long
- Avoid generic topics; favour underserved niches in GTA industries

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
      `You are a content writer for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Greater Toronto Area SMBs.

Write a comprehensive, SEO-optimized blog article on: "${topic}"

ABOUT HNBK:
- Services: AI agent orchestration, custom software, business automation, AI strategy consulting
- Audience: GTA business owners, 5–100 employees, owner-operated, looking to grow without hiring
- Voice: Authoritative, practical, plain English — no jargon, no AI hype, specific real-world examples

TARGET READER PERSONA:
- Owner or GM of a GTA small business (Toronto, Mississauga, Brampton, Markham, Vaughan, Scarborough, Etobicoke, North York)
- Industries: construction/trades, restaurants, professional services (accounting, law, real estate), clinics, retail, trucking, manufacturing, property management
- Skeptical of "AI will fix everything" promises — needs specific CAD dollar amounts and hours saved to believe it
- Does not have an IT team; needs solutions that are practical without technical expertise

REQUIRED ARTICLE STRUCTURE (follow this order exactly — do not skip any section):

1. HOOK (first 2 paragraphs, ~100 words)
   - Open with a relatable scenario a GTA owner in this industry would immediately recognize
   - Name a specific pain point and hint at the cost it is creating
   - No jargon in the first paragraph — write like you are talking to a busy owner, not a tech conference

2. WHAT THIS IS COSTING YOU (~150 words, use this as the H2 heading)
   - Quantify the problem in CAD and hours per week
   - Use a specific example: "A typical Toronto [industry] business with 10 staff spends roughly $X/month on [task]"
   - Reference relevant Ontario context where applicable (WSIB rates, Ontario minimum wage $17.20/hr, HST filing, construction season)

3. HOW TO FIX IT: 3–5 STEPS (~500 words, one H2 per step)
   - Each step is concrete and actionable — what to do, what tool or approach to use, what result to expect
   - Use real tool categories or approach names (not just "use AI") — e.g. "automated follow-up sequences", "job costing software", "AI dispatch routing"
   - Include at least 1 CAD cost estimate or hours-saved figure per step

4. REAL-WORLD GTA EXAMPLE (~200 words, H2 heading: "How [Business Name] Did It")
   - Invent a plausible GTA business: give it a name, city, industry, and employee count
   - Example format: "Maple Crest Plumbing, a Brampton contractor with 14 employees..."
   - Show a specific before/after: hours per week saved, CAD cost reduction, or revenue impact
   - Keep numbers realistic — not $1M savings, more like "saved 11 hours/week and $2,400/month in admin time"

5. CLOSING CTA (final 2 sentences only — do not add a heading)
   - Invite the reader to learn more or book a free call — no pressure language
   - Must mention HNBK by name and include hnbk.solutions
   - Example: "If you want to see exactly how this would work for your [industry] business, HNBK helps GTA owners build these systems — visit hnbk.solutions to book a free 30-minute walkthrough."

ADDITIONAL REQUIREMENTS:
- Total length: 1,000–1,400 words
- All financial figures in CAD
- Include current stats or recent trends (use Google Search grounding)
- HTML tags: <h2> <h3> <p> <ul> <li> <strong> <blockquote> <hr> only — no <div> no <span> no <a>
- Tags array: MUST include at least 1 geo tag (choose from: GTA, Toronto, Ontario, Mississauga, Brampton) AND at least 1 industry or topic tag
- title: 50–60 characters, includes a long-tail keyword
- meta_description: 150–160 characters, includes a benefit and a keyword
- excerpt: 2 sentences, reads naturally as a Google search snippet

CRITICAL: Return ONLY a raw JSON object. No markdown code fences. No text before or after. Just valid JSON.

{
  "title": "SEO title, 50–60 characters, includes long-tail keyword",
  "slug": "url-slug-lowercase-hyphens-only-3-to-7-words",
  "excerpt": "2-sentence summary, 150–160 characters total, reads like a Google snippet",
  "meta_description": "SEO meta, 150–160 characters, includes benefit + keyword",
  "tags": ["GTA or Toronto or Ontario", "Industry tag", "Topic tag"],
  "content": "full HTML using only allowed tags"
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
