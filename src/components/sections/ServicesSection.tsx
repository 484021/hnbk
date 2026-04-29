"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import SectionHeader from "@/components/ui/SectionHeader";
import { Robot, Code, PlugsConnected, Lightbulb, ArrowRight } from "@phosphor-icons/react";
import { spring, springFast, containerVariants, itemVariants } from "@/lib/motion";
import { useSectionAnimation } from "@/hooks/useSectionAnimation";

const featured = {
  icon: Robot,
  title: "AI Agent Orchestration",
  description:
    "Deploy multi-agent systems that automate complex, multi-step workflows across your entire operation \u2014 from lead qualification to invoice processing. Agents that work together, never sleep, and get faster over time.",
  features: ["Custom agent pipelines", "Cross-platform automation", "Real-time monitoring", "Self-improving workflows"],
  href: "/services#orchestration",
  badge: "purple" as const,
  badgeLabel: "Core Service",
};

const supporting = [
  {
    icon: Code,
    title: "Custom Software",
    description: "Purpose-built applications designed around your exact business processes \u2014 no off-the-shelf compromises.",
    href: "/services#software",
    badge: "blue" as const,
  },
  {
    icon: PlugsConnected,
    title: "AI Integration",
    description: "Embed intelligence into your existing CRM, ERP, and business tools without replacing what already works.",
    href: "/services#integration",
    badge: "cyan" as const,
  },
  {
    icon: Lightbulb,
    title: "AI Strategy",
    description: "Map your AI roadmap with expert guidance. Identify your highest-leverage opportunities and prioritize what moves the needle.",
    href: "/services#strategy",
    badge: "neutral" as const,
  },
];

export default function ServicesSection() {
  const { prefersReduced, ref, inView } = useSectionAnimation();
  const FeaturedIcon = featured.icon;

  return (
    <SectionWrapper id="services" className="bg-bg-card" gridMesh>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-brand-purple/40 to-transparent" />

      <div ref={ref}>
          <SectionHeader
            badge="What We Build"
            badgeVariant="purple"
            heading={<>Four ways we{" "}<span className="gradient-text">transform</span> your operations</>}
            body="Whether you need end-to-end AI automation or targeted integrations, we have a solution built for your stage."
            inView={inView}
            prefersReduced={prefersReduced}
            className="text-center mb-14"
          />

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
        >
          {/* Featured card "” spans 2 cols on lg */}
          <motion.div
            variants={prefersReduced ? undefined : itemVariants}
            whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
            className="lg:col-span-2"
          >
            <Link href={featured.href} className="block h-full group">
              <div className="h-full bg-bg-elevated border border-brand-purple/25 rounded-2xl p-8 flex flex-col gap-6 hover:border-brand-purple/50 transition-[border-color] duration-300">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center">
                    <FeaturedIcon size={24} weight="duotone" className="text-brand-purple-light" />
                  </div>
                  <Badge variant="purple">{featured.badgeLabel}</Badge>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <h3 className="text-2xl font-black text-text-primary">{featured.title}</h3>
                  <p className="text-text-muted leading-relaxed">{featured.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {featured.features.map((f) => (
                    <span key={f} className="text-xs text-text-subtle bg-white/5 px-3 py-1 rounded-full border border-white/8">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm text-brand-purple-light font-medium group-hover:gap-3 transition-[gap] duration-200">
                  Explore <ArrowRight size={14} weight="bold" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Supporting cards "” stack on right */}
          <div className="flex flex-col gap-4">
            {supporting.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  variants={prefersReduced ? undefined : itemVariants}
                  whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
                  className="flex-1"
                >
                  <Link href={s.href} className="block h-full group">
                    <div className="h-full bg-bg-card border border-white/8 rounded-2xl p-6 flex flex-col gap-3 hover:border-white/16 transition-[border-color] duration-300">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center">
                          <Icon size={18} weight="duotone" className="text-text-muted" />
                        </div>
                        <Badge variant={s.badge} className="text-[10px]">{s.title.split(" ")[0]}</Badge>
                      </div>
                      <h3 className="text-base font-bold text-text-primary">{s.title}</h3>
                      <p className="text-xs text-text-muted leading-relaxed flex-1">{s.description}</p>
                      <span className="text-xs text-brand-purple-light font-medium flex items-center gap-1 group-hover:gap-2 transition-[gap] duration-200">
                        Learn more <ArrowRight size={11} weight="bold" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
