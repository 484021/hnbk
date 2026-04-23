"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    stars: 5,
    text: "Working with Santhosh has been outstanding! He combines creativity with professionalism, making the entire process smooth and stress-free. He listens carefully, understands the vision, and then delivers beyond expectations. As someone that never settles for 'good enough', Santhosh is the one I would highly recommend.",
    name: "Peter Nie",
    role: "Professional Racket Stringer",
    initials: "PN",
    color: "from-white/15 to-white/5",
  },
  {
    stars: 5,
    text: "HNBK provides quality services that help improve our online presence — which is essential in today's market. The optimizations and efficiencies brought upon by their solutions make everything quick and seamless. Highly recommend HNBK for any website and automation needs.",
    name: "Erwin Ong",
    role: "Senior Marketing Executive",
    initials: "EO",
    color: "from-white/12 to-white/5",
  },
];

export default function TestimonialsSection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper id="testimonials" className="bg-bg-card">
      <div ref={ref}>
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <Badge variant="cyan">Client Results</Badge>
          </motion.div>
          <motion.h2
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black leading-tight"
          >
            Real businesses,{" "}
            <span className="gradient-text">real results</span>
          </motion.h2>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={prefersReduced ? false : { opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: prefersReduced ? 0 : 0.15 * i + 0.3 }}
              className="bg-bg-elevated border border-white/8 rounded-2xl p-8 flex flex-col gap-6 hover:border-white/16 transition-[border-color] duration-300"
            >
              {/* Large opening quote */}
              <span className="text-6xl font-black leading-none text-brand-purple/30 -mb-4">&ldquo;</span>

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }, (_, j) => (
                  <Star key={`${t.name}-star-${j}`} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-text-muted leading-relaxed text-sm flex-1">
                {t.text}
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-white/8">
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-subtle">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
