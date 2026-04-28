import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import InstagramPipelineDemo from "@/components/sections/InstagramPipelineDemo";
import { ArrowRight, Search, PenLine, ImageIcon, Send } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Live Demo: Instagram Content Pipeline",
  description:
    "Watch our AI pipeline research a topic, write a caption, generate a visual, and produce a ready-to-post Instagram post — in real time.",
  alternates: { canonical: "https://hnbk.solutions/demo/instagram-pipeline" },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Search,
    title: "Trend Research",
    description:
      "Gemini scans current trends, seasonal context, and audience signals for your topic — in seconds.",
  },
  {
    step: "02",
    icon: PenLine,
    title: "Caption Writing",
    description:
      "A branded caption and 8 targeted hashtags are written with your voice and a clear call-to-action.",
  },
  {
    step: "03",
    icon: ImageIcon,
    title: "Visual Generation",
    description:
      "Imagen 3 produces a professional square image matched to the post content — no Photoshop needed.",
  },
  {
    step: "04",
    icon: Send,
    title: "Auto-Publish",
    description:
      "In production, the post is quality-checked and pushed live via the Meta Graph API on schedule.",
  },
];

export default function InstagramPipelineDemoPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(162,59,236,0.45) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/case-studies/instagram-content-automation"
            className="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-text-muted transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to case study
          </Link>

          <div className="flex justify-center mb-5">
            <Badge variant="purple">Live Demo</Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
            Watch the AI pipeline{" "}
            <span className="gradient-text">work in real time</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-3">
            Enter any topic or niche. Our pipeline researches it, writes the caption, generates the image, and gives you a ready-to-post Instagram card — in about 15 seconds.
          </p>
          <p className="text-sm text-text-subtle">
            This is the same pipeline we deployed for{" "}
            <Link
              href="/case-studies/instagram-content-automation"
              className="text-brand-purple-light hover:underline"
            >
              Nova Social
            </Link>
            .
          </p>
        </div>
      </SectionWrapper>

      {/* Demo */}
      <SectionWrapper className="bg-bg-card">
        <InstagramPipelineDemo />
      </SectionWrapper>

      {/* How It Works */}
      <SectionWrapper className="bg-bg-base">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">How the pipeline works</h2>
            <p className="text-text-muted">
              Four autonomous steps. Zero manual work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="bg-bg-card border border-white/8 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-purple/15 border border-brand-purple/25">
                    <Icon size={18} className="text-brand-purple-light" />
                  </span>
                  <span className="text-3xl font-black text-white/8 leading-none">{step}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary mb-1.5">{title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="bg-bg-card text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">
            Ready to deploy this for{" "}
            <span className="gradient-text">your business?</span>
          </h2>
          <p className="text-text-muted mb-8">
            We can have this running for your brand in two weeks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/contact" variant="primary" size="lg">
              Book a Strategy Call <ArrowRight size={15} />
            </Button>
            <Button href="/case-studies/instagram-content-automation" variant="outline" size="lg">
              Read the Case Study
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
