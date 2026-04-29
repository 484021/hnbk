import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Consolidates the standard section animation setup:
 * - `prefersReduced` from useReducedMotion
 * - `ref` to attach to the section's root element
 * - `inView` from useInView (fires once, with a configurable margin)
 */
export function useSectionAnimation(margin = "-80px") {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin });
  return { prefersReduced, ref, inView } as const;
}
