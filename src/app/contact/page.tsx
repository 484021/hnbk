import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import { ContactForm } from "@/components/sections/ContactForm";
import { Mail, Phone, Calendar } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free strategy call with HNBK. We'll audit your operations and show you exactly what AI can do.",
  alternates: { canonical: "https://hnbk.solutions/contact" },
};

export default function ContactPage() {
  return (
    <>
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute -top-10 right-1/3 w-100 h-100 opacity-20"
          style={{ background: "radial-gradient(circle, rgba(162,59,236,0.5) 0%, transparent 70%)" }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div>
            <Badge variant="purple" className="mb-5">Get In Touch</Badge>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5">
              Let&apos;s talk about{" "}
              <span className="gradient-text">transforming your operations</span>
            </h1>
            <p className="text-lg text-text-muted leading-relaxed mb-10">
              Book a free strategy call. We&apos;ll audit your current operations,
              identify your top automation opportunities, and show you exactly
              what&apos;s possible — with no obligation.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              <a
                href="tel:+16478809350"
                className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center group-hover:border-brand-purple/30 transition-colors">
                  <Phone size={16} />
                </div>
                <span className="text-sm">(647) 880-9350</span>
              </a>
              <a
                href="mailto:hello@hnbk.solutions"
                className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center group-hover:border-brand-purple/30 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="text-sm">hello@hnbk.solutions</span>
              </a>
              <a
                href="https://www.instagram.com/hnbk.solutions/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-muted hover:text-text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl glass border border-white/8 flex items-center justify-center group-hover:border-brand-purple/30 transition-colors">
                  <InstagramIcon size={16} />
                </div>
                <span className="text-sm">@hnbk.solutions</span>
              </a>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center gap-3 mb-3">
                <Calendar size={18} className="text-brand-purple-light" />
                <h3 className="font-bold text-text-primary">What to expect</h3>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-text-muted">
                <li>→ 20-minute discovery call</li>
                <li>→ We map your top 3 automation opportunities</li>
                <li>→ You get a clear proposal within 24 hours</li>
                <li>→ No commitment required</li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass rounded-2xl p-8 border border-white/8">
            <h2 className="text-xl font-bold mb-6">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
