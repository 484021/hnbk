import type { Metadata } from "next";
import Link from "next/link";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { caseStudies } from "@/lib/case-studies";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "See how HNBK has helped SMBs automate operations and scale with AI.",
  alternates: { canonical: "https://hnbk.solutions/case-studies" },
};

const comingSoon = [
  {
    industry: "E-Commerce",
    title: "AI-powered inventory & reorder orchestration",
  },
  {
    industry: "Professional Services",
    title: "Automated client onboarding pipeline",
  },
];

export default function CaseStudiesPage() {
  const featured = caseStudies[0];

  return (
    <>
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28 text-center" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-5">
            <Badge variant="blue">Results</Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            Real businesses,{" "}
            <span className="gradient-text">measurable outcomes</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            Here&apos;s what our clients have achieved working with HNBK.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper className="bg-bg-base">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured real case study — spans 2 columns */}
          <Link
            href={`/case-studies/${featured.slug}`}
            className="md:col-span-2 group bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-5 hover:border-brand-purple/30 hover:-translate-y-1 transition-[transform,border-color] duration-300"
          >
            <div className="flex items-center justify-between">
              <Badge variant="purple">{featured.industry}</Badge>
              <span className="text-xs text-text-subtle">{featured.client} · {featured.location}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary leading-snug mb-2">
                {featured.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                {featured.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 border-t border-white/8 pt-4">
              {featured.results.map((r) => (
                <div key={r.label} className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-text-primary">{r.value}</span>
                  <span className="text-xs text-text-subtle">{r.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {featured.tags.map((t) => (
                <span key={t} className="text-xs text-text-subtle bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1.5 text-sm text-brand-purple-light font-semibold mt-auto w-fit group-hover:gap-2.5 transition-[gap] duration-200">
              Read case study <ArrowRight size={14} />
            </span>
          </Link>

          {/* Coming soon — first */}
          <div className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-4 opacity-60">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{comingSoon[0].industry}</Badge>
              <span className="flex items-center gap-1 text-xs text-text-subtle">
                <Clock size={11} /> Coming soon
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-primary leading-snug">
              {comingSoon[0].title}
            </h3>
            <p className="text-sm text-text-subtle mt-auto">
              Case study in progress
            </p>
          </div>

          {/* Coming soon — second */}
          <div className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-4 opacity-60">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{comingSoon[1].industry}</Badge>
              <span className="flex items-center gap-1 text-xs text-text-subtle">
                <Clock size={11} /> Coming soon
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-primary leading-snug">
              {comingSoon[1].title}
            </h3>
            <p className="text-sm text-text-subtle mt-auto">
              Case study in progress
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-text-muted mb-6">
            Want to see what&apos;s possible for your business?
          </p>
          <Button href="/contact" variant="primary" size="lg">
            Book a Strategy Call
            <ArrowRight size={15} />
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
