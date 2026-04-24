// ─── Shared blog generation pipeline ────────────────────────────────────────
// Used by: /api/generate-post (GitHub Actions cron)
//          /api/admin/generate-post-stream (admin UI with live progress)

// ─── Gemini REST helper ──────────────────────────────────────────────────────
export async function geminiGenerate(
  apiKey: string,
  prompt: string,
  useSearch = false,
  jsonMode = false,
  model = "gemini-2.5-flash",
): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  if (useSearch) {
    body.tools = [{ google_search: {} }];
  }
  // jsonMode forces the model to return a valid JSON string (incompatible with search grounding)
  if (jsonMode && !useSearch) {
    body.generationConfig = { responseMimeType: "application/json" };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

  const data = await res.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: {
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      };
    }>;
  };

  const candidate = data.candidates?.[0];
  const text = (candidate?.content?.parts?.[0]?.text ?? "") as string;

  // Extract verified source URLs from grounding metadata (search-enabled steps only).
  // These are the actual pages Gemini searched — pass them to the write step so it
  // can cite real URLs instead of fabricating them.
  if (useSearch) {
    const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];
    const urlLines = chunks
      .filter((c) => c.web?.uri)
      .map((c) => `- [${c.web!.title ?? c.web!.uri!}](${c.web!.uri!})`)
      .filter((line, i, arr) => arr.indexOf(line) === i); // deduplicate
    if (urlLines.length > 0) {
      return (
        text +
        "\n\nVERIFIED SOURCE URLS (from Google Search grounding — use these exact URLs in the Sources section, do not invent others):\n" +
        urlLines.join("\n")
      );
    }
  }

  return text;
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
export type ExistingPost = { slug: string; title: string };

// Max research words passed to the write step.
// Keeps prompt tokens manageable; 1500×2 = 3000 words total context for the writer.
const RESEARCH_MAX_WORDS = 1500;

function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + " …";
}

export async function writeArticle(
  apiKey: string,
  topic: string,
  researchBroadText: string,
  researchLocalText: string,
  existingPosts: ExistingPost[] = [],
): Promise<string> {
  // Truncate research to stay within Vercel's 60s function limit
  const broadTruncated = truncateWords(researchBroadText, RESEARCH_MAX_WORDS);
  const localTruncated = truncateWords(researchLocalText, RESEARCH_MAX_WORDS);

  const internalLinksBlock =
    existingPosts.length > 0
      ? `
INTERNAL LINKING (important for SEO):
You have access to these existing HNBK blog posts. Where a post is TOPICALLY RELEVANT to what you are writing, naturally hyperlink 2–3 of them using <a href="/blog/[slug]">anchor text</a>. Use descriptive anchor text, not "click here". Only link where it reads naturally — never force a link.
${existingPosts.map((p) => `- /blog/${p.slug} — "${p.title}"`).join("\n")}
`
      : "";

  return geminiGenerate(
    apiKey,
    `You are a senior content writer and industry expert for HNBK (hnbk.solutions), a Toronto-based AI and automation company serving Greater Toronto Area SMBs.

Write a DEFINITIVE, AUTHORITATIVE guide on: "${topic}"

You have been provided with research findings below. You MUST use these findings — cite specific statistics and reference current events. This article should be the most comprehensive, useful piece on this topic that a GTA SMB owner can find.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — BROAD TRENDS & STATS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${broadTruncated || "No pre-research available — use your own knowledge of current industry trends."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESEARCH BRIEF — GTA/ONTARIO SPECIFIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${localTruncated || "No pre-research available — use your own knowledge of Ontario/GTA context."}
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
${internalLinksBlock}
REQUIRED ARTICLE STRUCTURE (follow this order exactly — do not skip any section):

CRITICAL: Do NOT output any section label or heading for section 1. The article must open directly with a <p> tag — no "Hook", "HOOK", "1.", or any other label before the first paragraph. The hook is invisible structure for you, not text for the reader.

1. HOOK (first 2 paragraphs, ~120 words) — NO HEADING, start directly with <p>
   - Open with a relatable scenario a GTA owner in this industry would immediately recognize
   - Name a specific GTA city in the first paragraph (e.g. "a Markham accounting firm" or "a Scarborough restaurant owner")
   - Reference a current stat or recent news item from the research brief in the first 2 paragraphs
   - No jargon in the first paragraph — write like you are talking to a busy owner, not a tech conference
   - The word "Hook" must NEVER appear anywhere in the output HTML

2. WHAT THIS IS COSTING YOU (~200 words, use this as the H2 heading)
   - Quantify the problem in CAD and hours per week — use stats from the research brief
   - Use a specific example: "A typical Toronto [industry] business with 10 staff spends roughly $X/month on [task]"
   - Reference relevant Ontario context (WSIB rates, Ontario minimum wage $17.20/hr, HST, OHSA, construction season)
   - Cite at least 2 statistics — use anchored footnote superscripts: <sup><a href="#source-1">[1]</a></sup>, <sup><a href="#source-2">[2]</a></sup>, etc.

3. HOW TO FIX IT: 3–5 STEPS (~600 words, one H2 per step)
   - Each step is concrete and actionable — what to do, what tool or approach to use, what result to expect
   - Use real tool categories or approach names (not just "use AI") — e.g. "automated follow-up sequences", "job costing software", "AI dispatch routing"
   - Include at least 1 CAD cost estimate or hours-saved figure per step
   - Cite statistics with anchored footnote superscripts where used — e.g. <sup><a href="#source-3">[3]</a></sup>

4. WHAT THE NUMBERS SAY (~200 words, H2 heading: "What the Numbers Say")
   - Cite 3–5 specific statistics from the research brief, each marked with an anchored footnote superscript <sup><a href="#source-N">[N]</a></sup>
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

7. SOURCES (required — place AFTER the closing CTA, at the very end of content)
   - Add: <hr><h2>Sources</h2><ol> ... </ol>
   - List EVERY source cited with a superscript in the article, in order
   - For sources WITH a URL in the VERIFIED SOURCE URLS block: <li id="source-N">[N] <a href="EXACT_URL_FROM_RESEARCH" target="_blank" rel="noopener noreferrer">Source name</a>. "Statistic or finding." Month Year.</li>
   - For sources WITHOUT a URL in the VERIFIED SOURCE URLS block: <li id="source-N">[N] Source name. "Statistic or finding." Month Year.</li> — NO anchor tag, NO invented URL
   - NEVER fabricate a URL. Copy URLs character-for-character from the VERIFIED SOURCE URLS block only.
   - Only cite sources whose data actually appears in the research briefs — do not invent new sources

MANDATORY QUALITY REQUIREMENTS:
- Total length: 1,400–1,800 words (not counting the Sources list)
- MUST use footnote superscripts <sup>[N]</sup> for every cited statistic — minimum 4 citations
- All financial figures in CAD
- Use <blockquote> for any direct quotes from named sources
- HTML tags allowed: <h2> <h3> <p> <ul> <ol> <li> <strong> <blockquote> <sup> <a> <hr> only — no <div> no <span>
- <a> tags IN ARTICLE BODY: ONLY for internal HNBK blog links from the list provided above — no other links anywhere in the body text
- <a> tags IN SOURCES <ol> ONLY: use the exact URL from the "VERIFIED SOURCE URLS" block in the research briefs above — these are the only external URLs permitted
- CRITICAL URL RULE: Do NOT invent, guess, or construct any URL. If a source cited in the article has no matching URL in the VERIFIED SOURCE URLS block, format it as plain text with NO anchor tag. An article containing any fabricated URL will be rejected and regenerated.
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
  "content": "full HTML using only allowed tags, ends with Sources section"
}`,
    false,  // no search grounding — research is already in the prompt context
    true,   // jsonMode: forces Gemini to return a valid JSON string
    "gemini-2.5-pro",  // highest quality model — lowest hallucination rate
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

// ─── Strip structural section labels Gemini sometimes leaks into the HTML ────
// Removes "Hook", "HOOK", "1. HOOK" etc. that come from the prompt structure.
export function sanitiseContent(html: string): string {
  return html
    // Remove any heading tag whose ENTIRE text is a structural label
    .replace(/<h[1-6][^>]*>\s*(?:\d+\.\s*)?hook\s*<\/h[1-6]>/gi, "")
    // Remove a bare <p> whose entire text is just "Hook" at the start
    .replace(/^\s*<p>\s*(?:\d+\.\s*)?hook\s*<\/p>\s*/i, "")
    // Remove plain-text "Hook" or "HOOK" that appears before the first <p>
    .replace(/^\s*(?:\d+\.\s*)?hook\s*\n/i, "")
    // Collapse any triple-newlines left behind
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Parse Gemini JSON response ──────────────────────────────────────────────
// Robust: tries direct parse first, then extracts the outermost {...} block
// from the response in case Gemini added preamble or postamble text.
export function parsePostData(rawText: string): PostData {
  // 1. Strip markdown code fences
  const stripped = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // 2. Try direct parse
  try {
    const data = JSON.parse(stripped) as PostData;
    if (data.content) data.content = sanitiseContent(data.content);
    return data;
  } catch {
    // fall through to extraction
  }

  // 3. Find the outermost { ... } block (handles preamble/postamble text)
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const data = JSON.parse(stripped.slice(start, end + 1)) as PostData;
      if (data.content) data.content = sanitiseContent(data.content);
      return data;
    } catch {
      // fall through
    }
  }

  // 4. Nothing worked — throw with a diagnostic snippet
  throw new Error(
    `Could not extract JSON from Gemini response. Preview: ${
      rawText.slice(0, 300)
    }`,
  );
}

// ─── Retry write with a strict JSON-only instruction ─────────────────────────
// Called by the write step when parsePostData throws, to give Gemini one more
// chance with an unambiguous "return only JSON" instruction prepended.
export async function retryWriteAsJson(
  apiKey: string,
  topic: string,
  researchBroadText: string,
  researchLocalText: string,
  existingPosts: ExistingPost[] = [],
): Promise<string> {
  const internalLinksBlock =
    existingPosts.length > 0
      ? `\nExisting HNBK posts you may link to (only when topically natural, 2-3 max):\n${existingPosts.map((p) => `- /blog/${p.slug} — "${p.title}"`).join("\n")}\n`
      : "";

  // Truncate research for retry prompt too
  const broadTruncated = truncateWords(researchBroadText, RESEARCH_MAX_WORDS);
  const localTruncated = truncateWords(researchLocalText, RESEARCH_MAX_WORDS);

  return geminiGenerate(
    apiKey,
    `IMPORTANT: Your previous response could not be parsed as JSON. You MUST return ONLY a valid JSON object — no explanatory text, no markdown fences, no preamble, no postamble. Start your response with { and end with }. Nothing else.

Now write the blog article for topic: "${topic}"

Research context (broad):
${broadTruncated || "Not available — use your own knowledge."}

Research context (GTA/Ontario):
${localTruncated || "Not available — use your own knowledge."}
${internalLinksBlock}
Return this exact JSON shape:
{
  "title": "50-65 char SEO title with long-tail keyword",
  "slug": "url-slug-3-to-7-words",
  "excerpt": "2-sentence Google snippet",
  "meta_description": "150-160 char SEO meta",
  "tags": ["GTA or Toronto or Ontario", "Industry tag", "Topic tag"],
  "content": "full HTML. Use <sup><a href=\"#source-N\">[N]</a></sup> for every cited stat. End with <hr><h2>Sources</h2><ol><li id=\"source-N\">[N] Source name or <a href=\"EXACT_URL_FROM_VERIFIED_SOURCE_URLS_BLOCK_ONLY\" target=\"_blank\" rel=\"noopener noreferrer\">Source name</a>. Finding. Date.</li>...</ol>. CRITICAL: only use URLs that appear verbatim in the VERIFIED SOURCE URLS block in the research context above — never invent or guess a URL. If no verified URL exists for a source, omit the anchor entirely. Allowed tags: h2 h3 p ul ol li strong blockquote sup a hr. Open directly with <p>, NO Hook heading. <a> in article body = internal HNBK links only."
}`,
    false,  // no search grounding — JSON mode is incompatible with grounding
    true,   // jsonMode: forces valid JSON output
    "gemini-2.5-pro",  // highest quality model — lowest hallucination rate
  );
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

  // Check for any leaked structural label that sanitiseContent() missed
  const hasLeakedLabel = /<h[1-6][^>]*>\s*(?:\d+\.\s*)?hook\s*<\/h[1-6]>/i.test(
    postData.content,
  ) || /^\s*(?:\d+\.\s*)?hook\b/i.test(postData.content);

  const issues: string[] = [];
  if (!hasGeoTag) issues.push("no geo tag (GTA/Toronto/Ontario/etc.)");
  if (wordCount < 1000)
    issues.push(`content too short: ${wordCount} words (minimum 1000)`);
  if (hasLeakedLabel)
    issues.push("content still contains structural label 'Hook' — generation failed");

  return { valid: issues.length === 0, issues, wordCount };
}
