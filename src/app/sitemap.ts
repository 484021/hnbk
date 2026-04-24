import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("published", true)
    .lte("published_at", new Date().toISOString());

  const blogEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `https://hnbk.solutions/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://hnbk.solutions",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://hnbk.solutions/services",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://hnbk.solutions/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://hnbk.solutions/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://hnbk.solutions/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://hnbk.solutions/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...blogEntries,
  ];
}
