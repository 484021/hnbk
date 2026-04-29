"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeader from "@/components/ui/SectionHeader";
import { spring, springFast, containerVariants, itemVariants } from "@/lib/motion";
import { useSectionAnimation } from "@/hooks/useSectionAnimation";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We spend time inside your operations — mapping workflows, identifying bottlenecks, and pinpointing the highest-leverage automation opportunities. No assumptions, just real analysis.",
    detail: "1–2 hour discovery call + operations audit",
  },
  {
    number: "02",
    title: "Orchestrate",
    description:
      "We design and deploy AI agents that work together across your entire workflow — connected to your existing tools, tailored to your exact processes, and tested rigorously before launch.",
    detail: "Custom build in as little as 48 hours",
  },
  {
    number: "03",
    title: "Scale",
    description:
      "We don't disappear after launch. We monitor performance, surface insights, and continuously expand your AI capabilities as your business evolves and grows.",
    detail: "Ongoing optimization & expansion",
  },
];

export default function HowItWorksSection() {
  const { prefersReduced, ref, inView } = useSectionAnimation();

  return (
    <SectionWrapper id="how-it-works" className="bg-bg-base">
      <div ref={ref}>
        <SectionHeader
          badge="How It Works"
          badgeVariant="blue"
          heading={<>From discovery to{" "}<span className="gradient-text">deployment in days,</span><br className="hidden sm:block" /> not months</>}
          inView={inView}
          prefersReduced={prefersReduced}
          className="text-center mb-16"
        />

        {/* 3-column horizontal bento */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={prefersReduced ? undefined : itemVariants}
              whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
              className="bg-bg-card border border-white/8 rounded-2xl p-8 flex flex-col gap-5 hover:border-white/16 transition-[border-color] duration-300 relative overflow-hidden"
            >
              {/* Large watermark number */}
              <span className="absolute top-4 right-6 text-[80px] font-black leading-none text-white/4 select-none pointer-events-none">
                {step.number}
              </span>

              {/* Step badge */}
              <div className="w-10 h-10 rounded-full bg-brand-purple/80 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-brand-purple/30 shrink-0">
                {step.number}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                <h3 className="text-xl font-black text-text-primary">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
              </div>

              <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-purple-light bg-brand-purple/10 border border-brand-purple/20 px-3 py-1.5 rounded-full w-fit">
                {step.detail}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
