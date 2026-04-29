"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeader from "@/components/ui/SectionHeader";
import { Alarm, LinkBreak, TrendUp } from "@phosphor-icons/react";
import { spring, springFast, containerVariants, itemVariants } from "@/lib/motion";
import { useSectionAnimation } from "@/hooks/useSectionAnimation";

const problems = [
  {
    icon: Alarm,
    title: "Hours lost to repetitive tasks",
    body: "Your team spends 40\u201360% of their day on work that doesn't require human judgment \u2014 data entry, follow-ups, status updates, reporting.",
    color: "text-brand-purple-light",
    bg: "bg-brand-purple/10 border-brand-purple/20",
  },
  {
    icon: LinkBreak,
    title: "Tools that don't talk to each other",
    body: "Your CRM, your inbox, your spreadsheets, your project tools \u2014 all disconnected. Information gets lost. Decisions slow to a crawl.",
    color: "text-text-muted",
    bg: "bg-white/5 border-white/10",
  },
  {
    icon: TrendUp,
    title: "Can't scale without hiring",
    body: "Every time you win more business, you need more people to deliver it. Growth eats your margins. AI breaks that equation.",
    color: "text-text-muted",
    bg: "bg-white/5 border-white/10",
  },
];

export default function ProblemSection() {
  const { prefersReduced, ref, inView } = useSectionAnimation();

  return (
    <SectionWrapper id="problem" className="bg-bg-base">
      <div ref={ref}>
        <SectionHeader
          badge="The Problem"
          badgeVariant="neutral"
          heading={<>Your team is drowning in{" "}<span className="gradient-text">work that AI can do.</span></>}
          body="Most businesses lose hours every day to repetitive tasks, slow decisions, and tools that don\u2019t communicate. Your best people spend their time on work beneath their potential."
          align="left"
          inView={inView}
          prefersReduced={prefersReduced}
          className="max-w-2xl mb-14"
        />

        {/* Bento grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
        >
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                variants={prefersReduced ? undefined : itemVariants}
                whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
                className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-4 hover:border-white/16 transition-[border-color] duration-300"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${p.bg}`}>
                  <Icon size={20} weight="duotone" className={p.color} />
                </div>
                <h3 className="text-lg font-bold text-text-primary leading-snug">{p.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{p.body}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
