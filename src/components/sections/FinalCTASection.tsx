"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { ArrowRight, Calendar, Check } from "lucide-react";

export default function FinalCTASection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper className="bg-bg-base relative overflow-hidden">
      {/* Single left-anchored purple glow */}
      <div
        className="orb absolute -bottom-32 -left-32 w-125 h-125 opacity-20"
        style={{ background: "radial-gradient(circle, rgba(162,59,236,0.6) 0%, transparent 65%)" }}
      />

      <div ref={ref} className="relative z-10 max-w-3xl">
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-sm font-semibold text-brand-purple-light tracking-widest uppercase mb-6"
        >
          Ready to start?
        </motion.p>

        <motion.h2
          initial={prefersReduced ? false : { opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
        >
          Your operations,{" "}
          <span className="gradient-text">orchestrated by AI.</span>
        </motion.h2>

        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg text-text-muted mb-10 max-w-xl"
        >
          Book a free strategy call. We&apos;ll audit your operations, identify
          your top automation opportunities, and show you exactly what&apos;s possible.
        </motion.p>

        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <Button href="/contact" variant="primary" size="lg">
            <Calendar size={16} />
            Book a Free Strategy Call
          </Button>
          <Button href="/services" variant="outline" size="lg">
            Explore Services
            <ArrowRight size={16} />
          </Button>
        </motion.div>

        <motion.ul
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-6"
        >
          {["No commitment required", "Response within 24 hours", "Month-to-month"].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-subtle">
              <Check size={13} className="text-text-muted shrink-0" />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </SectionWrapper>
  );
}
