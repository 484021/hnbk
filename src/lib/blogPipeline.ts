// ─── Shared blog generation pipeline ────────────────────────────────────────
// Used by: /api/generate-post (GitHub Actions cron)
//          /api/admin/generate-post-stream (admin UI with live progress)

// ─── Gemini REST helper ──────────────────────────────────────────────────────
export async function geminiGenerate(
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

// ─── Topic selection ─────────────────────────────────────────────────────────
export async function selectTopic(
  apiKey: string,
  recentTitles: string[],
): Promise<string> {
  const month = new Date().toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
  });
  return (
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
}

// ─── Broad research ──────────────────────────────────────────────────────────
export async function researchBroad(
  apiKey: string,
  topic: string,
): Promise<string> {
  return geminiGenerate(
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
    true,
  );
}

// ─── GTA / Ontario local research ────────────────────────────────────────────
export async function researchLocal(
  apiKey: string,
  topic: string,
): Promise<string> {
  return geminiGenerate(
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
    true,
  );
}

// ─── Article writer ──────────────────────────────────────────────────────────
export async function writeArticle(
  apiKey: string,
  topic: string,
  researchBroadText: string,
  researchLocalText: string,
): Promise<string> {
  return geminiGenerate(
    apiKey,
    `You are a senior content writer and industry expert for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Greater Toronto Area SMBs.

Write a DEFINITIVE, AUTHORITATIVE guide on: "${topic}"

You have been provided with research findings below. You MUST use these findings — cite specific statistics and reference current events. This article should be the most comprehensive, useful piece on this topic that a GTA SMB owner can find.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — BROAD TRENDS & STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${researchBroadText || "No pre-research available — use Google Search grounding to find current data."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — GTA/ONTARIO SPECIFIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${researchLocalText || "No pre-research available — use Google Search grounding to find Ontario-specific data."}
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
    true,
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
export type PostData = {
  title: string;
  slug: string;
  excerpt: string;
  meta_description: string;
  tags: string[];
  content: string;
};

// ─── Parse Gemini JSON response ──────────────────────────────────────────────
export function parsePostData(rawText: string): PostData {
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  return JSON.parse(cleaned) as PostData;
}

// ─── Sanitise slug ───────────────────────────────────────────────────────────
export function sanitiseSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Quality validation ──────────────────────────────────────────────────────
export function validatePost(postData: PostData): {
  valid: boolean;
  issues: string[];
  wordCount: number;
} {
  const geoTagSet = new Set([
    "gta", "toronto", "ontario", "mississauga", "brampton",
    "markham", "vaughan", "scarborough", "etobicoke", "north york",
  ]);
  const hasGeoTag = (postData.tags ?? []).some((t) =>
    geoTagSet.has(t.toLowerCase()),
  );
  const wordCount = postData.content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const issues: string[] = [];
  if (!hasGeoTag) issues.push("no geo tag (GTA/Toronto/Ontario/etc.)");
  if (wordCount < 1000)
    issues.push(`content too short: ${wordCount} words (minimum 1000)`);

  return { valid: issues.length === 0, issues, wordCount };
}
