import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/adminAuth";
import { createServiceClient } from "@/lib/supabase";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(ADMIN_COOKIE)?.value ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!verifyAdminCookie(cookieVal, password)) {
    redirect("/admin");
  }

  const { slug } = await params;
  const supabase = createServiceClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, meta_description, tags, published, published_at")
    .eq("slug", slug)
    .single();

  if (!post) {
    redirect("/admin");
  }

  return <EditForm post={post} />;
}
