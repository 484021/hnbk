import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

function isAuthed(req: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const cookieVal = req.cookies.get(ADMIN_COOKIE)?.value ?? "";
  return verifyAdminCookie(cookieVal, password);
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, tags, published, published_at, ai_generated, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
