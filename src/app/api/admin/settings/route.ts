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

export const AUTOMATION_KEYS = [
  "blog_automation_enabled",
  "research_automation_enabled",
] as const;

export type AutomationSettings = {
  blog_automation_enabled: boolean;
  research_automation_enabled: boolean;
};

// GET /api/admin/settings
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", AUTOMATION_KEYS);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: AutomationSettings = {
    blog_automation_enabled: true,
    research_automation_enabled: true,
  };
  for (const row of data ?? []) {
    if (row.key === "blog_automation_enabled" || row.key === "research_automation_enabled") {
      result[row.key] = row.value === "true";
    }
  }
  return NextResponse.json(result);
}

// PATCH /api/admin/settings
export async function PATCH(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<AutomationSettings>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  for (const key of AUTOMATION_KEYS) {
    if (typeof body[key] === "boolean") {
      const { error } = await supabase
        .from("settings")
        .upsert({ key, value: String(body[key]), updated_at: now });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
