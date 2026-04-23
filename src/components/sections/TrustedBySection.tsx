"use client";

import { motion, useReducedMotion } from "framer-motion";

const logos = [
  { name: "OpenAI", text: "OpenAI" },
  { name: "Anthropic", text: "Anthropic" },
  { name: "n8n", text: "n8n" },
  { name: "Make", text: "Make" },
  { name: "Zapier", text: "Zapier" },
  { name: "Supabase", text: "Supabase" },
  { name: "Vercel", text: "Vercel" },
  { name: "Slack", text: "Slack" },
];

// Duplicate for seamless loop
const track = [...logos, ...logos];

export default function TrustedBySection() {
  const prefersReduced = useReducedMotion();
  return (
    <section className="relative bg-bg-card border-y border-white/8 py-10 overflow-hidden">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-bg-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-bg-card to-transparent z-10 pointer-events-none" />

      <p className="text-center text-xs font-semibold tracking-widest uppercase text-text-subtle mb-8">
        Integrating with the tools your team already uses
      </p>

      <div className="flex overflow-hidden">
        <motion.div
          className="flex items-center gap-16 pr-16 whitespace-nowrap"
          animate={prefersReduced ? {} : { x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {track.map((logo, i) => (
            <span
              key={i}
              className="text-lg font-bold text-text-subtle/60 hover:text-text-muted transition-colors duration-300 shrink-0"
            >
              {logo.text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
