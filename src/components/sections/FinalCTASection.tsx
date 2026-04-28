"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { ArrowRight, CalendarBlank, Check } from "@phosphor-icons/react";

const spring = { type: "spring", stiffness: 260, damping: 28 } as const;

export default function FinalCTASection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper className="bg-bg-base relative overflow-hidden">
      <div
        className="orb absolute -bottom-32 -left-32 w-125 h-125 opacity-20"
        style={{ background: "radial-gradient(circle, rgba(162,59,236,0.6) 0%, transparent 65%)" }}
      />

      <div ref={ref} className="relative z-10 max-w-3xl">
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="text-sm font-semibold text-brand-purple-light tracking-widest uppercase mb-6"
        >
          Ready to start?
        </motion.p>

        <motion.h2
          initial={prefersReduced ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
        >
          Your operations,{" "}
          <span className="gradient-text">orchestrated by AI.</span>
        </motion.h2>

        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.15 }}
          className="text-lg text-text-muted mb-10 max-w-xl"
        >
          Book a free strategy call. We&apos;ll audit your operations, identify
          your top automation opportunities, and show you exactly what&apos;s possible.
        </motion.p>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring, delay: 0.22 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <Button href="/contact" variant="primary" size="lg">
            <CalendarBlank size={16} weight="regular" />
            Book a Free Strategy Call
          </Button>
          <Button href="/services" variant="outline" size="lg">
            Explore Services
            <ArrowRight size={16} weight="bold" />
          </Button>
        </motion.div>

        <motion.ul
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-6"
        >
          {["No commitment required", "Response within 24 hours", "Month-to-month"].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-subtle">
              <Check size={13} weight="bold" className="text-text-muted shrink-0" />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </SectionWrapper>
  );
}
