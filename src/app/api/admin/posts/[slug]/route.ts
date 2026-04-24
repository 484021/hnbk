import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

function isAuthed(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  return verifyAdminCookie(cookieVal, password);
}

const ALLOWED_FIELDS = new Set([
  "title",
  "excerpt",
  "content",
  "meta_description",
  "tags",
  "published",
  "published_at",
  "updated_at",
]);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ post: data });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Whitelist fields — never let slug/id/created_at be overwritten
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of Object.keys(body)) {
    if (ALLOWED_FIELDS.has(key)) {
      updates[key] = body[key];
    }
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("slug", slug)
    .select("slug, title, published_at, published")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ post: data });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await context.params;
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
