"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Check, Zap } from "lucide-react";

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
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper id="pricing" className="bg-bg-base" gridMesh>
      <div ref={ref} className="text-center mb-14">
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-4"
        >
          <Badge variant="purple">Simple Pricing</Badge>
        </motion.div>
        <motion.h2
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-black leading-tight mb-5"
        >
          Transparent pricing,{" "}
          <span className="gradient-text">predictable results</span>
        </motion.h2>
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-text-muted max-w-lg mx-auto"
        >
          No hidden fees. No surprise invoices. Just a clear investment in your
          operations.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={prefersReduced ? false : { opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: prefersReduced ? 0 : 0.12 * i + 0.3 }}
            className={`relative rounded-2xl p-8 flex flex-col gap-5 border transition-[border-color] duration-300 ${
              tier.highlight
                ? "bg-bg-elevated border-brand-purple/40 ring-1 ring-brand-purple/20 shadow-xl shadow-brand-purple/10"
                : "bg-bg-card border-white/8 hover:border-white/16"
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
                  <Check size={14} className="text-brand-purple-light mt-0.5 shrink-0" />
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
      </div>
    </SectionWrapper>
  );
}
