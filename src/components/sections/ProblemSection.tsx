"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import { AlarmClock, Link2, TrendingUp } from "lucide-react";

const problems = [
  {
    icon: AlarmClock,
    title: "Hours lost to repetitive tasks",
    body: "Your team spends 40–60% of their day on work that doesn't require human judgment — data entry, follow-ups, status updates, reporting.",
    color: "text-brand-purple-light",
    bg: "bg-brand-purple/10 border-brand-purple/20",
  },
  {
    icon: Link2,
    title: "Tools that don't talk to each other",
    body: "Your CRM, your inbox, your spreadsheets, your project tools — all disconnected. Information gets lost. Decisions slow to a crawl.",
    color: "text-text-muted",
    bg: "bg-white/5 border-white/10",
  },
  {
    icon: TrendingUp,
    title: "Can't scale without hiring",
    body: "Every time you win more business, you need more people to deliver it. Growth eats your margins. AI breaks that equation.",
    color: "text-text-muted",
    bg: "bg-white/5 border-white/10",
  },
];

export default function ProblemSection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper id="problem" className="bg-bg-base">
      <div ref={ref}>
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <Badge variant="neutral">The Problem</Badge>
          </motion.div>
          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black leading-tight mb-5"
          >
            Your team is drowning in{" "}
            <span className="gradient-text">work that AI can do.</span>
          </motion.h2>
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-muted leading-relaxed"
          >
            Most businesses lose hours every day to repetitive tasks, slow
            decisions, and tools that don&apos;t communicate. Your best people
            spend their time on work beneath their potential.
          </motion.p>
        </div>

        {/* Bento grid: intro card + 3 problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {problems.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={prefersReduced ? false : { opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: prefersReduced ? 0 : 0.1 * i + 0.3 }}
                className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-4 hover:border-white/16 transition-[border-color] duration-300"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${p.bg}`}>
                  <Icon size={18} className={p.color} />
                </div>
                <h3 className="text-lg font-bold text-text-primary leading-snug">{p.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{p.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
