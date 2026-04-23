import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog Post",
  description: "Insights on AI orchestration, business automation, and custom software from the HNBK team.",
};

export default function BlogPostPage() {
  return (
    <SectionWrapper className="bg-bg-base pt-24 sm:pt-28 text-center" gridMesh>
      <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
        <Badge variant="cyan">Coming Soon</Badge>
        <h1 className="text-4xl sm:text-5xl font-black leading-tight">
          This post is <span className="gradient-text">on its way</span>
        </h1>
        <p className="text-lg text-text-muted">
          We&apos;re putting the finishing touches on this article. Check back soon.
        </p>
        <Button href="/blog" variant="outline" size="md">
          <ArrowLeft size={15} />
          Back to Blog
        </Button>
      </div>
    </SectionWrapper>
  );
}
