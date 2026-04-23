import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { MapPin, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "HNBK — a Toronto-based AI Orchestration & Custom Software company built to help SMBs scale operations with intelligence.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute -top-10 right-1/4 w-80 h-80 opacity-25"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl">
          <div className="mb-5">
            <Badge variant="purple">Our Story</Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            We believe every business{" "}
            <span className="gradient-text">deserves enterprise-grade AI</span>
          </h1>
          <p className="text-lg text-text-muted leading-relaxed max-w-2xl">
            HNBK was built on a simple observation: the tools that were
            transforming Fortune 500 companies were completely inaccessible to
            the small and mid-sized businesses that needed them most.
          </p>
        </div>
      </SectionWrapper>

      {/* Mission */}
      <SectionWrapper className="bg-bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="blue" className="mb-5">Our Mission</Badge>
            <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">
              Make AI accessible, practical, and profitable for growing businesses
            </h2>
            <p className="text-text-muted leading-relaxed mb-5">
              We don&apos;t sell AI hype. We build systems that create real,
              measurable outcomes — hours saved, decisions accelerated, revenue
              multiplied. Every engagement starts with your operations and ends
              with a working system that proves its own value.
            </p>
            <p className="text-text-muted leading-relaxed">
              Based in Toronto, we work with SMBs across North America helping
              them transform how they operate — not through massive enterprise
              projects, but through focused, high-leverage deployments that
              deliver results in days, not months.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {[
              {
                icon: MapPin,
                label: "Toronto, Ontario",
                sub: "Serving businesses across North America",
              },
              {
                icon: Clock,
                label: "48-hour deployment",
                sub: "From discovery call to live AI agents",
              },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass rounded-2xl p-6 flex items-center gap-5 border border-white/8">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-brand-purple-light" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">{label}</p>
                  <p className="text-sm text-text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper className="bg-bg-base">
        <div className="text-center mb-14">
          <Badge variant="cyan" className="mb-4">How We Work</Badge>
          <h2 className="text-3xl sm:text-4xl font-black">
            The principles that guide every engagement
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              emoji: "🎯",
              title: "Outcomes over outputs",
              body: "We don't measure success in deliverables. We measure it in time saved, revenue generated, and decisions accelerated.",
            },
            {
              emoji: "⚡",
              title: "Speed as a feature",
              body: "We move fast. Most engagements deliver working systems in under a week. Speed of implementation is part of the value.",
            },
            {
              emoji: "🔒",
              title: "Practical, not experimental",
              body: "We use proven tools and architectures. Your business doesn't need to be a research project — it needs systems that work.",
            },
            {
              emoji: "🔗",
              title: "Integrate, don't replace",
              body: "We work with your existing tools, not against them. The best AI layer is invisible — it just makes everything faster.",
            },
            {
              emoji: "📊",
              title: "Transparent reporting",
              body: "You always know what's working and what isn't. We surface the data that matters and make it easy to act on.",
            },
            {
              emoji: "🤝",
              title: "Long-term partnership",
              body: "We don't disappear after launch. As your business evolves, your AI systems evolve with it.",
            },
          ].map((v) => (
            <div key={v.title} className="glass rounded-2xl p-6 flex flex-col gap-3 border border-white/8 hover:border-brand-purple/20 transition-colors">
              <span className="text-3xl">{v.emoji}</span>
              <h3 className="font-bold text-text-primary">{v.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="bg-bg-card text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Let&apos;s build something{" "}
          <span className="gradient-text">that actually works</span>
        </h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          Book a free strategy call and see what AI can do for your specific
          operations.
        </p>
        <Button href="/contact" variant="primary" size="lg">
          Book a Strategy Call
          <ArrowRight size={15} />
        </Button>
      </SectionWrapper>
    </>
  );
}
