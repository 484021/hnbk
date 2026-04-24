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

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
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
    .single();

  if (!post) return { title: "Post Not Found" };

  const description = post.meta_description ?? post.excerpt;
  const ogImage = post.og_image_url ?? "https://hnbk.ca/og-image.png";

  return {
    title: post.title,
    description,
    alternates: { canonical: `https://hnbk.ca/blog/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `https://hnbk.ca/blog/${slug}`,
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
    .single<Post>();

  if (!post) notFound();

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
      logo: { "@type": "ImageObject", url: "https://hnbk.ca/hnbk-logo.png" },
    },
    url: `https://hnbk.ca/blog/${post.slug}`,
    mainEntityOfPage: `https://hnbk.ca/blog/${post.slug}`,
    image: post.og_image_url ?? "https://hnbk.ca/og-image.png",
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

      {/* Body */}
      <SectionWrapper className="bg-bg-base pb-24">
        <div className="max-w-3xl mx-auto">
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
      </SectionWrapper>
    </>
  );
}

