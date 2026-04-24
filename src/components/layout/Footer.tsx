import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const footerLinks = {
  Services: [
    { label: "AI Agent Orchestration", href: "/services#orchestration" },
    { label: "Custom Software", href: "/services#software" },
    { label: "AI Integration", href: "/services#integration" },
    { label: "AI Strategy", href: "/services#strategy" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Blog", href: "/blog" },
    { label: "Pricing", href: "/pricing" },
  ],
  Connect: [
    { label: "Contact Us", href: "/contact" },
    { label: "Book a Strategy Call", href: "/contact#book" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-bg-card border-t border-white/8">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-linear-to-r from-transparent via-brand-purple/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Link href="/" aria-label="HNBK home">
              <Image src="/hnbk-logo.png" alt="HNBK" width={120} height={32} className="h-8 w-auto" style={{ filter: "invert(1) hue-rotate(180deg)" }} />
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              AI Orchestration & Custom Software for growing businesses. We
              automate the work so your team can focus on what matters.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="mailto:hello@hnbk.solutions"
                className="flex items-center gap-2 text-sm text-text-subtle hover:text-text-primary transition-colors"
                aria-label="Email HNBK"
              >
                <Mail size={14} />
                hello@hnbk.solutions
              </a>
              <a
                href="tel:+16478809350"
                className="flex items-center gap-2 text-sm text-text-subtle hover:text-text-primary transition-colors"
                aria-label="Call HNBK"
              >
                <Phone size={14} />
                (647) 880-9350
              </a>
            </div>
            {/* Social */}
            <a
              href="https://www.instagram.com/hnbk.solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-text-subtle hover:text-brand-purple-light transition-colors w-fit"
              aria-label="HNBK on Instagram"
            >
              <InstagramIcon size={18} />
              <span className="text-sm">@hnbk.solutions</span>
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-text-subtle">
                {category}
              </h3>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-subtle">
            © {new Date().getFullYear()} HNBK. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-text-subtle hover:text-text-muted transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-text-subtle hover:text-text-muted transition-colors">
              Terms of Service
            </Link>
            <p className="text-xs text-text-subtle">
              Toronto, Ontario, Canada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
