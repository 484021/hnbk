import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Props = { params: Promise<{ slug: string }> };

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string | null;
  og_image_url: string | null;
  tags: string[];
  author: string;
  published_at: string | null;
  updated_at: string;
};

type RelatedPost = {
  slug: string;
  title: string;
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

function formatDateShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, meta_description, excerpt, og_image_url, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .single();

  if (!post) return { title: "Post Not Found" };

  const description = post.meta_description ?? post.excerpt;
  const ogImage = post.og_image_url ?? "https://hnbk.solutions/og-image.png";

  return {
    title: post.title,
    description,
    alternates: { canonical: `https://hnbk.solutions/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `https://hnbk.solutions/blog/${slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, meta_description, og_image_url, tags, author, published_at, updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .single<Post>();

  if (!post) notFound();

  // Fetch related posts: prefer tag overlap, fallback to most recent, exclude current
  let relatedPosts: RelatedPost[] = [];
  try {
    // Try tag-overlap first
    if (post.tags.length > 0) {
      const { data: tagMatches } = await supabase
        .from("blog_posts")
        .select("slug, title, tags, published_at")
        .eq("published", true)
        .lte("published_at", new Date().toISOString())
        .neq("slug", slug)
        .overlaps("tags", post.tags)
        .order("published_at", { ascending: false })
        .limit(4);
      relatedPosts = tagMatches ?? [];
    }
    // Top up with recent posts if fewer than 4 tag matches
    if (relatedPosts.length < 4) {
      const excludeSlugs = [slug, ...relatedPosts.map((p) => p.slug)];
      const { data: recentFill } = await supabase
        .from("blog_posts")
        .select("slug, title, tags, published_at")
        .eq("published", true)
        .lte("published_at", new Date().toISOString())
        .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
        .order("published_at", { ascending: false })
        .limit(4 - relatedPosts.length);
      relatedPosts = [...relatedPosts, ...(recentFill ?? [])];
    }
  } catch {
    // sidebar is non-critical
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description ?? post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "HNBK" },
    publisher: {
      "@type": "Organization",
      name: "HNBK",
      logo: { "@type": "ImageObject", url: "https://hnbk.solutions/hnbk-logo.png" },
    },
    url: `https://hnbk.solutions/blog/${post.slug}`,
    mainEntityOfPage: `https://hnbk.solutions/blog/${post.slug}`,
    image: post.og_image_url ?? "https://hnbk.solutions/og-image.png",
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-100 h-75 opacity-15"
          style={{ background: "radial-gradient(circle, rgba(162,59,236,0.4) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="purple">{tag}</Badge>
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight text-text-primary mb-6">
            {post.title}
          </h1>
          <p className="text-xl text-text-muted leading-relaxed mb-8">{post.excerpt}</p>
          <div className="flex items-center gap-6 text-sm text-text-subtle border-t border-white/8 pt-6">
            <span className="flex items-center gap-2">
              <User size={14} />
              {post.author}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(post.published_at)}
              </span>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Body + Sidebar */}
      <SectionWrapper className="bg-bg-base pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">

          {/* Main content */}
          <div>
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Footer nav */}
            <div className="mt-16 pt-8 border-t border-white/8 flex items-center justify-between flex-wrap gap-4">
              <Button href="/blog" variant="outline" size="sm">
                <ArrowLeft size={14} />
                All posts
              </Button>
              <Link
                href="/contact"
                className="text-sm text-brand-purple-light hover:text-white transition-colors"
              >
                Work with HNBK →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          {relatedPosts.length > 0 && (
            <aside className="lg:sticky lg:top-28 self-start flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-text-subtle uppercase tracking-widest mb-1">
                More Posts
              </h2>
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block bg-bg-card border border-white/8 rounded-2xl p-5 hover:border-brand-purple/30 transition-[border-color] duration-300"
                >
                  {related.tags[0] && (
                    <span className="inline-block text-xs font-medium text-brand-purple-light bg-brand-purple/10 border border-brand-purple/20 rounded-full px-2.5 py-0.5 mb-3">
                      {related.tags[0]}
                    </span>
                  )}
                  <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-white transition-colors mb-2">
                    {related.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-subtle">{formatDateShort(related.published_at)}</span>
                    <span className="text-xs text-brand-purple-light group-hover:text-white transition-colors">Read →</span>
                  </div>
                </Link>
              ))}
            </aside>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}

