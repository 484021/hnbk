"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import { Robot, Code, PlugsConnected, Lightbulb, ArrowRight } from "@phosphor-icons/react";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
const springFast = { type: "spring", stiffness: 380, damping: 30 } as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: spring },
};

const featured = {
  icon: Robot,
  title: "AI Agent Orchestration",
  description:
    "Deploy multi-agent systems that automate complex, multi-step workflows across your entire operation â€” from lead qualification to invoice processing. Agents that work together, never sleep, and get faster over time.",
  features: ["Custom agent pipelines", "Cross-platform automation", "Real-time monitoring", "Self-improving workflows"],
  href: "/services#orchestration",
  badge: "purple" as const,
  badgeLabel: "Core Service",
};

const supporting = [
  {
    icon: Code,
    title: "Custom Software",
    description: "Purpose-built applications designed around your exact business processes â€” no off-the-shelf compromises.",
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
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const FeaturedIcon = featured.icon;

  return (
    <SectionWrapper id="services" className="bg-bg-card" gridMesh>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-brand-purple/40 to-transparent" />

      <div ref={ref}>
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={spring}
            className="flex justify-center mb-4"
          >
            <Badge variant="purple">What We Build</Badge>
          </motion.div>
          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.08 }}
            className="text-4xl sm:text-5xl font-black leading-tight mb-5"
          >
            Four ways we{" "}
            <span className="gradient-text">transform</span> your operations
          </motion.h2>
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.15 }}
            className="text-lg text-text-muted max-w-xl mx-auto"
          >
            Whether you need end-to-end AI automation or targeted integrations,
            we have a solution built for your stage.
          </motion.p>
        </div>

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
        >
          {/* Featured card â€” spans 2 cols on lg */}
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

          {/* Supporting cards â€” stack on right */}
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
