"use client";

import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ArrowRight, Bot, Check, Clock, Zap } from "lucide-react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const agentTasks: { id: number; status: "done" | "running" | "queued"; label: string; time: string }[] = [
  { id: 1, status: "done", label: "Lead qualified & added to CRM", time: "2s ago" },
  { id: 2, status: "done", label: "Follow-up email drafted & scheduled", time: "4s ago" },
  { id: 3, status: "running", label: "Generating weekly performance report", time: "now" },
  { id: 4, status: "queued", label: "Invoice reconciliation — 14 items", time: "queued" },
  { id: 5, status: "queued", label: "Slack digest: 3 channels summarized", time: "queued" },
];

const statusConfig = {
  done: { color: "text-white/60", dot: "bg-white/40", label: "Done" },
  running: { color: "text-brand-purple-light", dot: "bg-brand-purple animate-pulse", label: "Running" },
  queued: { color: "text-text-subtle", dot: "bg-white/20", label: "Queued" },
};

export default function HeroSection() {
  const prefersReduced = useReducedMotion();

  function animate(delay: number) {
    return prefersReduced
      ? { initial: {}, animate: {} }
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease } },
        };
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-bg-base pt-24 pb-20">
      {/* Single subtle glow */}
      <div
        className="orb absolute -top-40 left-1/4 w-175 h-175 opacity-20"
        style={{ background: "radial-gradient(circle, rgba(162,59,236,0.5) 0%, transparent 65%)" }}
      />

      {/* Grid mesh */}
      <div className="absolute inset-0 grid-mesh opacity-50" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-bg-base to-transparent pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

          {/* ── Left column ── */}
          <div className="flex flex-col items-start gap-6">
            <motion.div {...animate(0)}>
              <Badge variant="purple">
                <Zap size={11} />
                AI Orchestration for SMBs
              </Badge>
            </motion.div>

            <motion.h1
              {...animate(0.1)}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
            >
              Your business,
              <br />
              <span className="gradient-text">running on AI.</span>
            </motion.h1>

            <motion.p
              {...animate(0.22)}
              className="text-lg sm:text-xl text-text-muted max-w-xl leading-relaxed"
            >
              HNBK integrates AI agents and custom software into your operations —
              eliminating manual work, accelerating decisions, and multiplying your
              team&apos;s output without multiplying headcount.
            </motion.p>

            <motion.div
              {...animate(0.34)}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Button href="/contact" variant="primary" size="lg">
                Book a Strategy Call
                <ArrowRight size={16} />
              </Button>
              <Button href="/case-studies" variant="outline" size="lg">
                See Our Work
              </Button>
            </motion.div>

            <motion.ul
              {...animate(0.46)}
              className="flex flex-col gap-2 mt-2"
            >
              {["No commitment · 20-min call", "Live within 48 hours", "Month-to-month, cancel anytime"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text-subtle">
                  <Check size={13} className="text-white/60 shrink-0" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ── Right column — Agent activity card ── */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease }}
            className="hidden lg:block"
          >
            <div className="bg-bg-card border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center">
                    <Bot size={14} className="text-brand-purple-light" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">HNBK Agent</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-text-subtle" />
                  <span className="text-xs text-text-subtle">Live</span>
                </div>
              </div>

              {/* Task list */}
              <div className="flex flex-col divide-y divide-white/5">
                {agentTasks.map((task) => {
                  const cfg = statusConfig[task.status];
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="flex-1 text-sm text-text-muted truncate">{task.label}</span>
                      <span className={`text-xs shrink-0 ${cfg.color}`}>{task.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Card footer */}
              <div className="px-5 py-4 border-t border-white/8 flex items-center justify-between">
                <span className="text-xs text-text-subtle">2 agents running · 3 queued</span>
                <span className="text-xs text-brand-purple-light font-medium">View all →</span>
              </div>
            </div>

            {/* Floating stat pill */}
            <div className="mt-4 flex justify-end">
              <div className="inline-flex items-center gap-2 bg-bg-elevated border border-white/8 rounded-full px-4 py-2 text-xs text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                18 hrs saved this week
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}


