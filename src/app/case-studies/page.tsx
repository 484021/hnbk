import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "See how HNBK has helped SMBs automate operations and scale with AI.",
  alternates: { canonical: "https://hnbk.ca/case-studies" },
};

// Placeholder — data will come from Supabase once case_studies table is populated
const placeholders = [
  {
    industry: "Professional Services",
    title: "Automating client onboarding for a legal firm",
    result: "4 hours saved per client · 100% document accuracy",
    tags: ["AI Agents", "Document Processing"],
  },
  {
    industry: "E-Commerce",
    title: "AI-powered inventory & reorder orchestration",
    result: "37% reduction in stockouts · $80k saved annually",
    tags: ["Agent Orchestration", "Integrations"],
  },
  {
    industry: "Marketing Agency",
    title: "Automated reporting pipeline for 12 client accounts",
    result: "18 hours/week reclaimed · zero manual reporting",
    tags: ["Custom Software", "AI Integration"],
  },
];

export default function CaseStudiesPage() {
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
          {placeholders.map((cs) => (
            <article
              key={cs.title}
              className="glass rounded-2xl p-7 flex flex-col gap-4 border border-white/8 hover:border-brand-purple/25 hover:-translate-y-1 transition-[transform,border-color] duration-300"
            >
              <Badge variant="neutral">{cs.industry}</Badge>
              <h3 className="text-lg font-bold text-text-primary leading-snug">{cs.title}</h3>
              <p className="text-sm text-brand-purple-light font-semibold">{cs.result}</p>
              <div className="flex flex-wrap gap-2">
                {cs.tags.map((t) => (
                  <span key={t} className="text-xs text-text-subtle bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
              <Button href="/contact" variant="ghost" size="sm" className="mt-auto w-fit px-0">
                Discuss this use case <ArrowRight size={13} />
              </Button>
            </article>
          ))}
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
