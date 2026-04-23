"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";

const metrics = [
  {
    value: "10x",
    label: "Faster Operations",
    qualifier: "avg. across deployments",
  },
  {
    value: "80%",
    label: "Manual Work Eliminated",
    qualifier: "target automation rate",
  },
  {
    value: "48h",
    label: "Average Onboarding",
    qualifier: "Starter deployments",
  },
];

export default function MetricsSection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <SectionWrapper className="bg-bg-card py-0">
      <div
        ref={ref}
        className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/8"
      >
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={prefersReduced ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.1 * i + 0.1 }}
            className="flex flex-col items-center justify-center gap-1.5 py-12 px-8"
          >
            <p className="text-4xl sm:text-5xl font-black gradient-text">{m.value}</p>
            <p className="text-sm font-semibold text-text-primary tracking-wide">{m.label}</p>
            <p className="text-xs text-text-subtle">{m.qualifier}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
