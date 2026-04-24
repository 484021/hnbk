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

  return <AdminDashboard initialPosts={data ?? []} initialGenerations={generationsData ?? []} />;
}
