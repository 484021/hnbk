import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { createServiceClient } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  topic: z.string().min(3).max(200).trim(),
});

const RATE_LIMIT_MINUTES = 60;

export async function POST(req: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, topic } = parsed.data;

  const supabase = createServiceClient();

  // Rate limit: 1 generation per email per hour
  const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("demo_leads")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "You've already generated a post recently. Please try again in an hour." },
      { status: 429 },
    );
  }

  // Persist lead before calling AI (so we capture intent even on API failure)
  await supabase.from("demo_leads").insert({
    name,
    email,
    topic,
    demo: "instagram-pipeline",
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Step 1: Generate caption, hashtags, and image prompt with Gemini
  let caption = "";
  let hashtags: string[] = [];
  let imagePrompt = "";

  try {
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert Instagram content strategist for small and medium businesses.

Create an engaging Instagram post for the following topic: "${topic}"

Requirements:
- Caption: 1–3 punchy sentences, conversational, ends with a soft call-to-action. Max 150 chars.
- Hashtags: exactly 8 relevant hashtags (include the # symbol), mix of popular and niche.
- ImagePrompt: a detailed prompt for an AI image generator. Describe a vibrant, professional, eye-catching square image (1:1) that represents this topic for Instagram. Be specific about style (e.g. "bright flat-lay", "moody dark editorial", "clean minimalist product shot"). Do NOT mention any text, logos, or words in the image.

Respond ONLY with valid JSON in this exact shape:
{"caption":"...","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8"],"imagePrompt":"..."}`,
            },
          ],
        },
      ],
    });

    const raw = textResponse.text ?? "";
    // Strip possible markdown code fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(jsonStr) as {
      caption: string;
      hashtags: string[];
      imagePrompt: string;
    };
    caption = parsed.caption ?? "";
    hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 8) : [];
    imagePrompt = parsed.imagePrompt ?? "";
  } catch (err) {
    console.error("[demo/instagram-post] Gemini text error:", err);
    return NextResponse.json(
      { error: "Failed to generate post content. Please try again." },
      { status: 502 },
    );
  }

  // Step 2: Generate image with Imagen 3
  let imageBase64: string | null = null;
  let mimeType: string | null = null;

  try {
    const imageResponse = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        outputMimeType: "image/jpeg",
      },
    });

    const candidate = imageResponse.generatedImages?.[0];
    if (candidate?.image?.imageBytes) {
      // imageBytes is a Uint8Array — convert to base64
      const bytes = candidate.image.imageBytes;
      const b64 =
        typeof bytes === "string"
          ? bytes
          : Buffer.from(bytes as Uint8Array).toString("base64");
      imageBase64 = b64;
      mimeType = "image/jpeg";
    }
  } catch (err) {
    console.error("[demo/instagram-post] Imagen error:", err);
    // Image generation failed — return text result only (graceful degradation)
    imageBase64 = null;
    mimeType = null;
  }

  return NextResponse.json({
    caption,
    hashtags,
    imageBase64,
    mimeType,
  });
}
