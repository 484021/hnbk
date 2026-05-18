import { cookies } from "next/headers";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const authed = verifyAdminCookie(cookieVal, password);

  if (!authed) {
    return <AdminLogin />;
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, published, published_at, ai_generated, created_at")
    .order("created_at", { ascending: false });

  const { data: generationsData } = await supabase
    .from("blog_generations")
    .select("id, topic, status, created_at, post_id")
    .order("created_at", { ascending: false })
    .limit(20);

  let researchData = null;
  try {
    const { data } = await supabase
      .from("deep_research")
      .select("id, topic_summary, research_text, status, created_at, post_id")
      .order("created_at", { ascending: false })
      .limit(30);
    researchData = data;
  } catch {
    // Table may not exist yet — admin panel still loads fine
  }

  let initialBlogEnabled = true;
  let initialResearchEnabled = true;
  try {
    const { data: settingsRows } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["blog_automation_enabled", "research_automation_enabled"]);
    for (const row of settingsRows ?? []) {
      if (row.key === "blog_automation_enabled") initialBlogEnabled = row.value !== "false";
      if (row.key === "research_automation_enabled") initialResearchEnabled = row.value !== "false";
    }
  } catch {
    // Settings table may not exist yet — default to enabled
  }

  return (
    <AdminDashboard
      initialPosts={data ?? []}
      initialGenerations={generationsData ?? []}
      initialResearch={researchData ?? []}
      initialBlogEnabled={initialBlogEnabled}
      initialResearchEnabled={initialResearchEnabled}
    />
  );
}
