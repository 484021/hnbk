import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return !!password && verifyAdminCookie(cookieVal, password);
}

// PATCH /api/admin/deep-research/[id] — mark entry used + store post_id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: { post_id?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("deep_research")
    .update({
      status: body.status ?? "used",
      post_id: body.post_id ?? null,
    })
    .eq("id", id)
    .select("id, status, post_id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
