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

  // 2.5. Fetch recent post titles for topic deduplication (non-fatal)
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
    // proceed without deduplication if this fails
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

AVOID THESE RECENTLY PUBLISHED TOPICS (do not repeat the same industry, pain point, or angle as any of these):
${recentTitles.length > 0 ? recentTitles.map((t, i) => `${i + 1}. ${t}`).join("\n") : "None yet — this is the first post."}

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

  // 4. Deep research — two dedicated Google-Search-grounded calls before writing
  // This gives the article writer concrete, current facts rather than having to
  // research and write simultaneously.

  // 4a. Broad research: latest statistics, trends, and industry data
  let researchBroad = "";
  try {
    researchBroad = await geminiGenerate(
      apiKey,
      `You are a research analyst. Your only job right now is to GATHER FACTS — do not write an article.

Research topic: "${topic}"

TIME WINDOW: Focus ONLY on information published in the last 1–3 months (January–April 2026). Ignore older data unless no recent data exists.

Using Google Search, find and return the following:

1. STATISTICS (find 6–10 specific data points from the last 1–3 months):
   - Include the exact number, what it measures, the source name, and the publication date
   - Example: "67% of Canadian SMBs report labour as their #1 cost (CFIB, March 2026)"
   - Prioritise Canadian/Ontario data; use US/global only if Canadian not available
   - Flag any stat older than 3 months with "[older data]"

2. BREAKING NEWS & TRENDS (find 4–6 items from the last 1–3 months only):
   - Brief headline + publication date + key fact from each
   - Focus on what has changed or been announced recently — not evergreen background info

3. CURRENT INDUSTRY CONTEXT (as of early 2026):
   - What is happening in this industry RIGHT NOW in Canada
   - Any announcements, policy changes, or market shifts from Jan–Apr 2026

4. RECENT EXPERT OPINIONS OR QUOTES (last 3 months if findable):
   - Name, title, organisation, date, and the key insight

Return as plain text with clear section headers. Be specific, include dates — no fluff.`,
      true, // Google Search grounding
    );
  } catch {
    researchBroad = ""; // fall back — article writer will do its own search
  }

  // 4b. Local research: GTA/Ontario-specific data, regulations, and examples
  let researchLocal = "";
  try {
    researchLocal = await geminiGenerate(
      apiKey,
      `You are a research analyst focused on Ontario and the Greater Toronto Area. GATHER FACTS ONLY — do not write an article.

Research topic: "${topic}"

TIME WINDOW: Focus ONLY on information from the last 1–3 months (January–April 2026). For regulations, include any changes announced since January 2025.

Using Google Search, find GTA and Ontario-specific information:

1. ONTARIO REGULATIONS & PROGRAMS relevant to this topic:
   - WSIB, OHSA, ESA, Ministry of Labour, CRA, HST rules, Ontario grants
   - Any regulatory changes or announcements from Jan 2025–Apr 2026 (include effective dates)

2. GTA MARKET DATA (most recent available, ideally Jan–Apr 2026):
   - Local statistics, adoption rates, or costs specific to Ontario/GTA businesses
   - Compare to national averages if available

3. LOCAL NEWS & CASE STUDIES (last 1–3 months preferred):
   - Ontario or GTA businesses doing something notable in this area recently
   - Local industry associations (e.g. BILD, OREA, ORA, OBAA) reports or statements from Jan–Apr 2026
   - Include publication dates for each item

4. ONTARIO ECONOMIC CONTEXT (most recent data available):
   - Labour market conditions in early 2026, minimum wage ($17.20/hr as of Oct 2024)
   - Any GTA-specific business challenges or cost pressures reported in the last 3 months

Return as plain text with clear section headers. Be specific — include numbers, dates, and sources.`,
      true, // Google Search grounding
    );
  } catch {
    researchLocal = ""; // fall back
  }

  // 5. Write authoritative article using the research findings
  let rawText: string;
  try {
    rawText = await geminiGenerate(
      apiKey,
      `You are a senior content writer and industry expert for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Greater Toronto Area SMBs.

Write a DEFINITIVE, AUTHORITATIVE guide on: "${topic}"

You have been provided with research findings below. You MUST use these findings — cite specific statistics and reference current events. This article should be the most comprehensive, useful piece on this topic that a GTA SMB owner can find.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — BROAD TRENDS & STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${researchBroad || "No pre-research available — use Google Search grounding to find current data."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — GTA/ONTARIO SPECIFIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${researchLocal || "No pre-research available — use Google Search grounding to find Ontario-specific data."}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ABOUT HNBK:
- Services: AI agent orchestration, custom software, business automation, AI strategy consulting
- Audience: GTA business owners, 5–100 employees, owner-operated, looking to grow without hiring
- Voice: Authoritative, practical, plain English — no jargon, no AI hype, specific real-world examples
- Position: trusted expert and advisor, not a salesperson

TARGET READER PERSONA:
- Owner or GM of a GTA small business (Toronto, Mississauga, Brampton, Markham, Vaughan, Scarborough, Etobicoke, North York)
- Industries: construction/trades, restaurants, professional services (accounting, law, real estate), clinics, retail, trucking, manufacturing, property management
- Skeptical of "AI will fix everything" promises — needs specific CAD dollar amounts and hours saved to believe it
- Does not have an IT team; needs solutions that are practical without technical expertise

REQUIRED ARTICLE STRUCTURE (follow this order exactly — do not skip any section):

1. HOOK (first 2 paragraphs, ~120 words)
   - Open with a relatable scenario a GTA owner in this industry would immediately recognize
   - Name a specific GTA city in the first paragraph (e.g. "a Markham accounting firm" or "a Scarborough restaurant owner")
   - Reference a current stat or recent news item from the research brief in the first 2 paragraphs
   - No jargon in the first paragraph — write like you are talking to a busy owner, not a tech conference

2. WHAT THIS IS COSTING YOU (~200 words, use this as the H2 heading)
   - Quantify the problem in CAD and hours per week — use stats from the research brief
   - Use a specific example: "A typical Toronto [industry] business with 10 staff spends roughly $X/month on [task]"
   - Reference relevant Ontario context (WSIB rates, Ontario minimum wage $17.20/hr, HST, OHSA, construction season)
   - Cite at least 2 statistics with source names

3. HOW TO FIX IT: 3–5 STEPS (~600 words, one H2 per step)
   - Each step is concrete and actionable — what to do, what tool or approach to use, what result to expect
   - Use real tool categories or approach names (not just "use AI") — e.g. "automated follow-up sequences", "job costing software", "AI dispatch routing"
   - Include at least 1 CAD cost estimate or hours-saved figure per step
   - Integrate research statistics to support each recommendation

4. WHAT THE NUMBERS SAY (~200 words, H2 heading: "What the Numbers Say")
   - Cite 3–5 specific statistics from the research brief, each with source name and year
   - Show the scale of the problem or the scale of the opportunity
   - Connect the statistics to the GTA/Ontario context

5. REAL-WORLD GTA EXAMPLE (~200 words, H2 heading: "How [Business Name] Did It")
   - Invent a plausible GTA business: give it a name, city, industry, and employee count
   - Example format: "Maple Crest Plumbing, a Brampton contractor with 14 employees..."
   - Show a specific before/after: hours per week saved, CAD cost reduction, or revenue impact
   - State an approximate payback period (e.g. "recovered their setup costs within 6 weeks")
   - Keep numbers realistic — not $1M savings, more like "saved 11 hours/week and $2,400/month in admin time"

6. CLOSING CTA (final 2 sentences only — do not add a heading)
   - Invite the reader to learn more or book a free call — no pressure language
   - The first sentence must reference the article's specific industry or task — not a generic "automate your business"
   - Must mention HNBK by name and include hnbk.solutions
   - Example: "If you want to see exactly how this would work for your [industry] business, HNBK helps GTA owners build these systems — visit hnbk.solutions to book a free 30-minute walkthrough."

MANDATORY QUALITY REQUIREMENTS:
- Total length: 1,400–1,800 words
- Must cite AT LEAST 3 specific statistics with source name and year (use research brief above)
- All financial figures in CAD
- Use <blockquote> for any direct quotes from named sources
- HTML tags: <h2> <h3> <p> <ul> <li> <strong> <blockquote> <hr> only — no <div> no <span> no <a>
- Tags array: MUST include at least 1 geo tag (choose from: GTA, Toronto, Ontario, Mississauga, Brampton) AND at least 1 industry or topic tag
- title: 50–65 characters, includes a long-tail keyword
- meta_description: 150–160 characters, includes a benefit and a keyword
- excerpt: 2 sentences, reads naturally as a Google search snippet

CRITICAL: Return ONLY a raw JSON object. No markdown code fences. No text before or after. Just valid JSON.

{
  "title": "SEO title, 50–65 characters, includes long-tail keyword",
  "slug": "url-slug-lowercase-hyphens-only-3-to-7-words",
  "excerpt": "2-sentence summary, 150–160 characters total, reads like a Google snippet",
  "meta_description": "SEO meta, 150–160 characters, includes benefit + keyword",
  "tags": ["GTA or Toronto or Ontario", "Industry tag", "Topic tag"],
  "content": "full HTML using only allowed tags"
}`,
      true, // Google Search grounding — supplements the pre-research
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

  // 5.5. Quality validation — reject posts that miss key GTA persona requirements
  const geoTagSet = new Set([
    "gta", "toronto", "ontario", "mississauga", "brampton",
    "markham", "vaughan", "scarborough", "etobicoke", "north york",
  ]);
  const hasGeoTag = (postData.tags ?? []).some((t) => geoTagSet.has(t.toLowerCase()));
  const wordCount = postData.content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const validationIssues: string[] = [];
  if (!hasGeoTag) validationIssues.push("no geo tag (GTA/Toronto/Ontario/etc.)");
  if (wordCount < 1000) validationIssues.push(`content too short: ${wordCount} words (minimum 1000)`);

  if (validationIssues.length > 0) {
    console.error("[blog] quality validation failed:", validationIssues.join("; "));
    return NextResponse.json(
      { error: "Generated post failed quality checks", issues: validationIssues },
      { status: 500 },
    );
  }

  // Sanitise slug — lowercase alphanumeric + hyphens only
  postData.slug = postData.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 6. Save to Supabase — published=true, published_at = now (live immediately)
  // Guard against slug collision — append YYYY-MM-DD suffix if slug already exists
  const { data: existingSlug } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("slug", postData.slug)
    .maybeSingle();

  if (existingSlug) {
    postData.slug = `${postData.slug}-${new Date().toISOString().slice(0, 10)}`;
  }

  const publishAt = new Date().toISOString(); // publish immediately

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
            <strong>To unpublish:</strong> set <code>published = false</code> on slug <code>${postData.slug}</code> in Supabase → blog_posts.
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
