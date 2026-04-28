"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const mobileMenuVariants = {
  hidden: { opacity: 0, scale: 0.97, y: -8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header
      className={cn(
        "fixed z-50 left-1/2 -translate-x-1/2 transition-[top,width] duration-500",
        scrolled
          ? "top-0 w-full"
          : "top-4 w-[94%] max-w-6xl",
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between px-5 py-3 transition-[background-color,border-color,border-radius,box-shadow] duration-500",
          scrolled
            ? "bg-bg-card/92 backdrop-blur-2xl border-b border-white/8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
            : "glass rounded-2xl",
        )}
      >
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="HNBK home">
          <Image
            src="/hnbk-logo.png"
            alt="HNBK"
            width={130}
            height={34}
            className="h-8 w-auto"
            style={{ filter: "invert(1) hue-rotate(180deg)" }}
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative px-3 py-2 text-sm rounded-lg transition-colors duration-200 group flex flex-col items-center",
                    isActive
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5",
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-purple" />
                  )}
                  {!isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-px bg-white/30 rounded-full group-hover:w-4 transition-[width] duration-200" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop CTA + ThemeToggle */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-text-primary border border-white/15 rounded-full hover:bg-white/5 hover:border-white/25 transition-[background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-text-muted hover:text-text-primary transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
        >
          {isOpen ? <X size={22} weight="bold" /> : <List size={22} weight="regular" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={prefersReduced ? undefined : mobileMenuVariants}
            initial={prefersReduced ? false : "hidden"}
            animate="visible"
            exit={prefersReduced ? undefined : "exit"}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            id="mobile-nav-menu"
            role="navigation"
            aria-label="Mobile navigation"
            className="mt-2 rounded-2xl p-5 flex flex-col gap-1 bg-bg-card/95 backdrop-blur-2xl border border-white/8"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "text-text-primary bg-white/5 font-semibold"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0" />
                  )}
                </Link>
              );
            })}
            <div className="pt-2 mt-1 border-t border-white/8 flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium text-text-primary border border-white/15 rounded-full hover:bg-white/5 hover:border-white/25 transition-[background-color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              >
                Book a Call
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
