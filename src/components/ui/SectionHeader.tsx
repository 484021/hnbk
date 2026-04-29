"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import { fadeUp } from "@/lib/motion";
import type { ReactNode } from "react";

type BadgeVariant = "purple" | "blue" | "cyan" | "neutral";

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: BadgeVariant;
  heading: ReactNode;
  body?: string;
  align?: "left" | "center";
  inView: boolean;
  prefersReduced: boolean | null;
  className?: string;
}

/**
 * Shared animated section header: optional Badge + h2 + optional body paragraph.
 * Delegates animation state from the parent's useSectionAnimation hook.
 */
export default function SectionHeader({
  badge,
  badgeVariant = "purple",
  heading,
  body,
  align = "center",
  inView,
  prefersReduced,
  className = "",
}: SectionHeaderProps) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const flex = align === "center" ? "flex justify-center" : "";

  return (
    <div className={`${textAlign} ${className}`}>
      {badge && (
        <motion.div {...fadeUp(inView, prefersReduced, 0)} className={`${flex} mb-4`}>
          <Badge variant={badgeVariant}>{badge}</Badge>
        </motion.div>
      )}

      <motion.h2
        {...fadeUp(inView, prefersReduced, 0.08)}
        className="text-4xl sm:text-5xl font-black leading-tight"
      >
        {heading}
      </motion.h2>

      {body && (
        <motion.p
          {...fadeUp(inView, prefersReduced, 0.15)}
          className={`text-lg text-text-muted mt-5 ${align === "center" ? "max-w-xl mx-auto" : "max-w-xl"}`}
        >
          {body}
        </motion.p>
      )}
    </div>
  );
}
