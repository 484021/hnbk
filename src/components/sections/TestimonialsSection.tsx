"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeader from "@/components/ui/SectionHeader";
import { Star } from "@phosphor-icons/react";
import { spring, springFast, containerVariants, itemVariants } from "@/lib/motion";
import { useSectionAnimation } from "@/hooks/useSectionAnimation";

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
    text: "HNBK provides quality services that help improve our online presence \u2014 which is essential in today's market. The optimizations and efficiencies brought upon by their solutions make everything quick and seamless. Highly recommend HNBK for any website and automation needs.",
    name: "Erwin Ong",
    role: "Senior Marketing Executive",
    initials: "EO",
    color: "from-white/12 to-white/5",
  },
];

export default function TestimonialsSection() {
  const { prefersReduced, ref, inView } = useSectionAnimation();

  return (
    <SectionWrapper id="testimonials" className="bg-bg-card">
      <div ref={ref}>
          <SectionHeader
            badge="Client Results"
            badgeVariant="cyan"
            heading={<>Real businesses,{" "}<span className="gradient-text">real results</span></>}
            inView={inView}
            prefersReduced={prefersReduced}
            className="text-center mb-14"
          />

        {/* Testimonial cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
          variants={prefersReduced ? undefined : containerVariants}
          initial={prefersReduced ? false : "hidden"}
          animate={inView ? "visible" : "hidden"}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={prefersReduced ? undefined : itemVariants}
              whileHover={prefersReduced ? {} : { y: -3, transition: springFast }}
              className="bg-bg-elevated border border-white/8 rounded-2xl p-8 flex flex-col gap-6 hover:border-white/16 transition-[border-color] duration-300"
            >
              <span className="text-6xl font-black leading-none text-brand-purple/30 -mb-4">&ldquo;</span>

              <div className="flex gap-1">
                {Array.from({ length: t.stars }, (_, j) => (
                  <Star key={`${t.name}-star-${j}`} size={13} weight="fill" className="text-amber-400" />
                ))}
              </div>

              <p className="text-text-muted leading-relaxed text-sm flex-1">{t.text}</p>

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
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
