import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { getCaseStudyBySlug, caseStudies } from "@/lib/case-studies";
import { ArrowRight, Check, MapPin, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import InstagramPipelineDemo from "@/components/sections/InstagramPipelineDemo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return {};
  return {
    title: cs.title,
    description: cs.summary,
    alternates: { canonical: `https://hnbk.solutions/case-studies/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  return (
    <>
      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(162,59,236,0.5) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-text-muted transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            All case studies
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <Badge variant="purple">{cs.industry}</Badge>
            <span className="flex items-center gap-1.5 text-sm text-text-subtle">
              <MapPin size={13} />
              {cs.location}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5 text-text-primary">
            {cs.title}
          </h1>
          <p className="text-xl text-text-muted leading-relaxed max-w-2xl mb-10">
            {cs.summary}
          </p>

          {/* Inline key metrics */}
          <div className="flex flex-wrap gap-8 border-t border-white/8 pt-8">
            {cs.results.map((r) => (
              <div key={r.label} className="flex flex-col gap-1">
                <span className="text-3xl font-black text-text-primary">
                  {r.value}
                </span>
                <span className="text-sm text-text-subtle">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Body */}
      <SectionWrapper className="bg-bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — narrative */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-4">
                The Challenge
              </p>
              <p className="text-text-muted leading-relaxed text-lg">
                {cs.challenge}
              </p>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-4">
                The Solution
              </p>
              <p className="text-text-muted leading-relaxed text-lg">
                {cs.solution}
              </p>
            </section>

            <section>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-5">
                What We Built
              </p>
              <ul className="flex flex-col gap-4">
                {cs.whatWeBuilt.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-brand-purple/20 border border-brand-purple/30">
                      <Check size={11} className="text-brand-purple-light" />
                    </span>
                    <span className="text-text-muted leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right — results sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              {cs.results.map((r) => (
                <div
                  key={r.label}
                  className="bg-bg-elevated border border-white/8 rounded-2xl p-5 flex flex-col gap-1"
                >
                  <span className="text-2xl font-black text-text-primary">
                    {r.value}
                  </span>
                  <span className="text-sm font-semibold text-brand-purple-light">
                    {r.label}
                  </span>
                  <span className="text-xs text-text-subtle leading-snug mt-1">
                    {r.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-bg-elevated border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-3">
                Technologies
              </p>
              <div className="flex flex-wrap gap-2">
                {cs.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs text-text-muted bg-white/5 border border-white/8 px-3 py-1 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-bg-elevated border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-3">
                Client
              </p>
              <p className="text-text-primary font-semibold">{cs.client}</p>
              <p className="text-sm text-text-subtle mt-1">
                {cs.industry} · {cs.location}
              </p>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {/* Live Demo — shown when a demoHref is linked */}
      {cs.demoHref && (
        <SectionWrapper className="bg-bg-base">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-purple/20 border border-brand-purple/30">
                <Zap size={16} className="text-brand-purple-light" />
              </span>
              <div>
                <p className="text-lg font-bold text-text-primary">See it in action</p>
                <p className="text-sm text-text-subtle">
                  This is the actual pipeline — try it with your own topic.
                </p>
              </div>
              <Link
                href={cs.demoHref}
                className="ml-auto text-xs font-semibold text-brand-purple-light hover:underline hidden sm:block"
              >
                Full demo page →
              </Link>
            </div>
            <InstagramPipelineDemo compact />
          </div>
        </SectionWrapper>
      )}

      {/* CTA */}
      <SectionWrapper className="bg-bg-base text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">
            Want similar results for{" "}
            <span className="gradient-text">your business?</span>
          </h2>
          <p className="text-text-muted mb-8">
            Book a free strategy call and we&apos;ll show you exactly what&apos;s
            possible.
          </p>
          <Button href="/contact" variant="primary" size="lg">
            Book a Strategy Call <ArrowRight size={15} />
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
