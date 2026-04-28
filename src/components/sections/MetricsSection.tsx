"use client";

import { motion, useInView, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";

const springConfig = { type: "spring", stiffness: 260, damping: 28 } as const;

const metrics = [
  { value: 10, suffix: "x", label: "Faster Operations", qualifier: "avg. across deployments" },
  { value: 80, suffix: "%", label: "Manual Work Eliminated", qualifier: "target automation rate" },
  { value: 48, suffix: "h", label: "Average Onboarding", qualifier: "Starter deployments" },
];

function AnimatedCounter({
  target,
  suffix,
  active,
}: {
  target: number;
  suffix: string;
  active: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toString() + suffix);

  useEffect(() => {
    if (active && !prefersReduced) {
      motionVal.set(target);
    }
  }, [active, prefersReduced, motionVal, target]);

  if (prefersReduced) {
    return <span>{target}{suffix}</span>;
  }
  return <motion.span>{display}</motion.span>;
}

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
            transition={{ ...springConfig, delay: prefersReduced ? 0 : 0.1 * i + 0.1 }}
            className="flex flex-col items-center justify-center gap-1.5 py-12 px-8"
          >
            <p className="text-4xl sm:text-5xl font-black gradient-text">
              <AnimatedCounter target={m.value} suffix={m.suffix} active={inView} />
            </p>
            <p className="text-sm font-semibold text-text-primary tracking-wide">{m.label}</p>
            <p className="text-xs text-text-subtle">{m.qualifier}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

