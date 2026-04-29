"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Check, Lightning } from "@phosphor-icons/react";
import { spring, springFast, containerVariants, itemVariants, fadeUp } from "@/lib/motion";
import { useSectionAnimation } from "@/hooks/useSectionAnimation";

const tiers = [
  {
    name: "Starter",
    price: "$2,500",
    period: "/mo",
    description: "For businesses ready to take their first step into AI automation.",
    features: [
      "Up to 3 AI agents",
      "1 custom integration",
      "Monthly performance reporting",
      "Email support",
      "Basic workflow automation",
    ],
    cta: "Get Started",
    href: "/contact?plan=starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$5,000",
    period: "/mo",
    description: "For scaling operations that need broader coverage and faster iteration.",
    features: [
      "Up to 10 AI agents",
      "3 custom integrations",
      "Weekly performance reporting",
      "Dedicated support (Slack)",
      "Advanced workflow orchestration",
      "Custom dashboards",
    ],
    cta: "Get Started",
    href: "/contact?plan=growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Full AI transformation. Unlimited scope, on-site capability.",
    features: [
      "Unlimited AI agents",
      "Unlimited integrations",
      "Custom software development",
      "On-site consulting",
      "SLA & dedicated engineer",
      "Priority roadmap access",
    ],
    cta: "Talk to Us",
    href: "/contact?plan=enterprise",
    highlight: false,
  },
];

export default function PricingPreview() {
  const { prefersReduced, ref, inView } = useSectionAnimation();

  return (
    <SectionWrapper id="pricing" className="bg-bg-base" gridMesh>
      <SectionHeader
        badge="Simple Pricing"
        badgeVariant="purple"
        heading={<>Transparent pricing,{" "}<span className="gradient-text">predictable results</span></>}
        body="No hidden fees. No surprise invoices. Just a clear investment in your operations."
        inView={inView}
        prefersReduced={prefersReduced}
        className="text-center mb-14"
      />

      <motion.div
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
        variants={prefersReduced ? undefined : containerVariants}
        initial={prefersReduced ? false : "hidden"}
        animate={inView ? "visible" : "hidden"}
      >
        {tiers.map((tier) => (
          <motion.div
            key={tier.name}
            variants={prefersReduced ? undefined : itemVariants}
            whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
            className={`relative rounded-2xl p-8 flex flex-col gap-5 border transition-[border-color] duration-300 ${
              tier.highlight
                ? "bg-bg-elevated border-brand-purple/40 ring-1 ring-brand-purple/20 shadow-xl shadow-brand-purple/10"
                : "bg-bg-card border-white/8 hover:border-white/16"
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 text-xs font-bold bg-white text-bg-base px-4 py-1.5 rounded-full shadow-lg">
                  <Lightning size={10} weight="fill" /> Most Popular
                </span>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-text-subtle mb-2">
                {tier.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-primary">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-text-subtle text-sm">{tier.period}</span>
                )}
              </div>
              <p className="text-sm text-text-muted mt-2">{tier.description}</p>
            </div>

            <ul className="flex flex-col gap-3 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-text-muted">
                  <Check size={14} weight="bold" className="text-brand-purple-light mt-0.5 shrink-0" />
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
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
