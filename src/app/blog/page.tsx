import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI orchestration, business automation, and custom software from the HNBK team.",
};

// Placeholder posts — will be pulled from Supabase blog_posts table
const posts = [
  {
    tag: "AI Agents",
    date: "April 18, 2026",
    title: "What is AI Agent Orchestration and why does your business need it?",
    excerpt:
      "Most businesses hear 'AI' and think chatbots. Here's what's actually happening at the cutting edge — and why it matters for SMBs right now.",
    slug: "what-is-ai-agent-orchestration",
  },
  {
    tag: "Operations",
    date: "April 12, 2026",
    title: "The 5 workflows every SMB should automate first",
    excerpt:
      "Not all automation is created equal. These five workflow categories deliver the highest ROI for most small and mid-sized businesses.",
    slug: "5-workflows-smb-automate-first",
  },
  {
    tag: "Custom Software",
    date: "April 5, 2026",
    title: "When off-the-shelf software stops working for your business",
    excerpt:
      "There's a point in every company's growth where generic tools become a bottleneck. Here's how to know when you've hit it — and what to do.",
    slug: "when-off-the-shelf-stops-working",
  },
];

export default function BlogPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="glass rounded-2xl p-7 flex flex-col gap-4 border border-white/8 hover:border-brand-purple/25 hover:-translate-y-1 transition-[transform,border-color] duration-300"
            >
              <div className="flex items-center justify-between">
                <Badge variant="purple">{post.tag}</Badge>
                <span className="text-xs text-text-subtle">{post.date}</span>
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
      </SectionWrapper>
    </>
  );
}
