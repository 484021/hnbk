import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical insights on AI orchestration, business automation, and custom software for Canadian SMBs — from the HNBK team.",
  alternates: { canonical: "https://hnbk.ca/blog" },
  openGraph: {
    title: "The HNBK Blog — AI & Automation Insights",
    description:
      "Practical insights on AI orchestration, business automation, and custom software for Canadian SMBs.",
    url: "https://hnbk.ca/blog",
  },
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  published_at: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, tags, published_at")
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  const posts: Post[] = data ?? [];

  return (
    <>
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28 text-center" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-100 h-75 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(162,59,236,0.4) 0%, transparent 70%)" }}
        />
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-5">
            <Badge variant="cyan">Insights</Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            The <span className="gradient-text">HNBK Blog</span>
          </h1>
          <p className="text-lg text-text-muted">
            Practical insights on AI, automation, and building better operations.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-bg-base">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">Posts coming soon — check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="glass rounded-2xl p-7 flex flex-col gap-4 border border-white/8 hover:border-brand-purple/25 hover:-translate-y-1 transition-[transform,border-color] duration-300"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{post.tags[0] ?? "Insights"}</Badge>
                  <span className="text-xs text-text-subtle">{formatDate(post.published_at)}</span>
                </div>
                <h2 className="text-lg font-bold text-text-primary leading-snug flex-1">
                  {post.title}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">{post.excerpt}</p>
                <Button href={`/blog/${post.slug}`} variant="ghost" size="sm" className="w-fit px-0 mt-auto">
                  Read more <ArrowRight size={13} />
                </Button>
              </article>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
