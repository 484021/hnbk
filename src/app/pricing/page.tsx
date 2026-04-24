import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Check, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent, predictable pricing for AI Orchestration and Custom Software. Starter from $2,500/mo.",
  alternates: { canonical: "https://hnbk.ca/pricing" },
};

const tiers = [
  {
    name: "Starter",
    price: "$2,500",
    period: "/mo",
    description:
      "For businesses taking their first step into AI automation. Get real results quickly with a focused deployment.",
    features: [
      "Up to 3 AI agents",
      "1 custom integration",
      "Monthly performance reporting",
      "Email support",
      "Basic workflow automation",
      "Onboarding & documentation",
    ],
    notIncluded: ["Custom software development", "Dedicated Slack channel", "On-site consulting"],
    cta: "Get Started",
    href: "/contact?plan=starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$5,000",
    period: "/mo",
    description:
      "For scaling teams that need broader AI coverage, faster iteration, and hands-on support.",
    features: [
      "Up to 10 AI agents",
      "3 custom integrations",
      "Weekly performance reporting",
      "Dedicated Slack support channel",
      "Advanced workflow orchestration",
      "Custom dashboards & analytics",
      "Monthly strategy review call",
    ],
    notIncluded: ["Custom software development", "On-site consulting"],
    cta: "Start Growing",
    href: "/contact?plan=growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "Full AI transformation with unlimited scope, custom software, and on-site capability.",
    features: [
      "Unlimited AI agents",
      "Unlimited integrations",
      "Custom software development",
      "On-site consulting sessions",
      "Dedicated engineer (fractional)",
      "SLA & priority response",
      "Priority roadmap access",
      "Executive strategy reviews",
    ],
    notIncluded: [],
    cta: "Talk to Us",
    href: "/contact?plan=enterprise",
    highlight: false,
  },
];

const faq = [
  {
    q: "Is there a setup fee?",
    a: "No. Your monthly fee covers everything — discovery, build, deployment, and ongoing support. No surprise invoices.",
  },
  {
    q: "How quickly can we get started?",
    a: "After our discovery call, most Starter deployments are live within 48–72 hours. Growth and Enterprise timelines vary by scope.",
  },
  {
    q: "Can we switch plans?",
    a: "Yes. As your needs grow, you can upgrade at any time. We'll scope the expansion and adjust billing at the start of the next month.",
  },
  {
    q: "What if we want to cancel?",
    a: "Month-to-month. No long-term contracts. We keep clients because the results speak for themselves.",
  },
  {
    q: "Do you work with our existing tools?",
    a: "Yes. We integrate with your existing CRM, ERP, communication tools, and databases. No rip-and-replace required.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28 text-center" gridMesh>
        <div
          className="orb absolute top-0 left-1/2 -translate-x-1/2 w-125 h-75 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(162,59,236,0.6) 0%, transparent 70%)" }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-5">
            <Badge variant="purple">Simple Pricing</Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            Simple, transparent pricing{" "}
            <span className="gradient-text">for every stage</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl mx-auto">
            No hidden fees. No surprise invoices. Just a clear investment in
            making your operations more efficient.
          </p>
        </div>
      </SectionWrapper>

      {/* Pricing cards */}
      <SectionWrapper className="bg-bg-base">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 flex flex-col gap-5 border transition-all ${
                tier.highlight
                  ? "bg-bg-elevated border-brand-purple/40 shadow-xl shadow-brand-purple/15"
                  : "glass border-white/8"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-xs font-bold bg-white text-bg-base px-4 py-1.5 rounded-full shadow-lg">
                    <Zap size={10} /> Most Popular
                  </span>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-2">
                  {tier.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-text-primary">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-text-subtle text-sm">{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-text-muted">{tier.description}</p>
              </div>

              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text-muted">
                    <Check size={14} className="text-brand-purple-light mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {tier.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-text-subtle/50 line-through">
                    <Check size={14} className="text-text-subtle/30 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                href={tier.href}
                variant={tier.highlight ? "primary" : "outline"}
                className="w-full justify-center mt-2"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-text-subtle mt-10">
          All plans are month-to-month. Cancel anytime. No contracts.
        </p>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper className="bg-bg-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-6">
            {faq.map((item) => (
              <div key={item.q} className="glass rounded-xl p-6 border border-white/8">
                <h3 className="font-bold text-text-primary mb-2">{item.q}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper className="bg-bg-base text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Still have questions?
        </h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">
          Book a 20-minute call and we&apos;ll answer everything — no pitch, just
          clarity.
        </p>
        <Button href="/contact" variant="primary" size="lg">
          Book a Free Call
          <ArrowRight size={15} />
        </Button>
      </SectionWrapper>
    </>
  );
}
