import type { Variants } from "framer-motion";

// ─── Spring presets ─────────────────────────────────────────────────────────

export const spring = { type: "spring", stiffness: 260, damping: 28 } as const;
export const springFast = { type: "spring", stiffness: 380, damping: 30 } as const;

// ─── Stagger container / item variants ──────────────────────────────────────

export const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: spring },
};

// ─── Inline motion prop helper ───────────────────────────────────────────────

/** Returns `initial`, `animate`, and `transition` props for a standard fade-up entrance. */
export function fadeUp(
  inView: boolean,
  prefersReduced: boolean | null,
  delay = 0,
) {
  if (prefersReduced) return { initial: false as const, animate: {}, transition: {} };
  return {
    initial: { opacity: 0, y: 20 } as const,
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { ...spring, delay },
  };
}
