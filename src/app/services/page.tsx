import type { Metadata } from "next";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Bot, Code2, Plug, Lightbulb, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI Agent Orchestration, Custom Software Development, AI Integration, and AI Strategy & Consulting — tailored for SMBs.",
  alternates: { canonical: "https://hnbk.solutions/services" },
};

const services = [
  {
    id: "orchestration",
    icon: Bot,
    badge: "AI Agents" as const,
    badgeVariant: "purple" as const,
    title: "AI Agent Orchestration",
    subtitle: "Automate the complex. Operate at scale.",
    description:
      "AI Agent Orchestration means deploying networks of intelligent agents that work together autonomously — handling multi-step tasks, making decisions, and coordinating across your entire operation. Think of it as hiring a team that never sleeps, never makes the same mistake twice, and gets faster over time.",
    useCases: [
      "Automated lead qualification and CRM updates",
      "Invoice processing and approval workflows",
      "Customer support triage and response drafting",
      "Inventory monitoring and purchase order generation",
      "Marketing content scheduling and distribution",
      "Financial reporting and anomaly detection",
    ],
    color: "from-brand-purple/20 to-transparent",
  },
  {
    id: "software",
    icon: Code2,
    badge: "Custom Build" as const,
    badgeVariant: "blue" as const,
    title: "Custom Software Development",
    subtitle: "Software that fits your business, not the other way around.",
    description:
      "Off-the-shelf tools make you adapt your processes to their constraints. We build the inverse — purpose-built applications designed around exactly how you work. From internal dashboards to client-facing platforms, we architect, build, and ship software that becomes a competitive advantage.",
    useCases: [
      "Internal operations dashboards",
      "Client portal and project management tools",
      "Custom CRM or ERP modules",
      "API development and third-party integrations",
      "Data pipeline and reporting applications",
      "Web and mobile application development",
    ],
    color: "from-white/8 to-transparent",
  },
  {
    id: "integration",
    icon: Plug,
    badge: "AI Layer" as const,
    badgeVariant: "cyan" as const,
    title: "AI Integration",
    subtitle: "Make your existing tools smarter.",
    description:
      "You don't have to replace what works. We embed AI intelligence into your current stack — adding a layer of automation, analysis, and decision-making on top of the tools your team already uses. Faster workflows, smarter insights, zero disruption.",
    useCases: [
      "HubSpot / Salesforce AI enrichment",
      "Slack and Teams intelligent bots",
      "Document analysis and extraction",
      "Email triage and auto-drafting",
      "Predictive analytics on your existing data",
      "AI-powered search across internal knowledge bases",
    ],
    color: "from-white/5 to-transparent",
  },
  {
    id: "strategy",
    icon: Lightbulb,
    badge: "Consulting" as const,
    badgeVariant: "neutral" as const,
    title: "AI Strategy & Consulting",
    subtitle: "Know exactly where AI moves your needle.",
    description:
      "Most businesses don't fail at AI because the technology doesn't work — they fail because they don't know where to start, what to prioritize, or how to manage the change. We provide clear-eyed guidance: where AI creates the most value in your business, what to build first, and how to get your team on board.",
    useCases: [
      "Operations audit and bottleneck mapping",
      "AI ROI analysis and business case development",
      "Implementation roadmap and prioritization",
      "Vendor and tool evaluation",
      "Team training and change management",
      "AI governance and risk assessment",
    ],
    color: "from-white/8 to-transparent",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>
        <div
          className="orb absolute -top-20 left-1/4 w-96 h-96 opacity-30"
          style={{ background: "radial-gradient(circle, rgba(162,59,236,0.5) 0%, transparent 70%)" }}
        />
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-5">
            <Badge variant="purple">What We Build</Badge>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            Services built to{" "}
            <span className="gradient-text">transform operations</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            From AI agent pipelines to full custom software, we deliver
            solutions that create measurable operational gains for SMBs.
          </p>
        </div>
      </SectionWrapper>

      {/* Service detail sections */}
      {services.map((service, i) => {
        const Icon = service.icon;
        return (
          <SectionWrapper
            key={service.id}
            id={service.id}
            className={i % 2 === 0 ? "bg-bg-base" : "bg-bg-card"}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3 mb-6">
                  <Badge variant={service.badgeVariant}>{service.badge}</Badge>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">
                  {service.title}
                </h2>
                <p className="text-lg text-brand-purple-light font-semibold mb-5">
                  {service.subtitle}
                </p>
                <p className="text-text-muted leading-relaxed mb-8">
                  {service.description}
                </p>
                <Button href="/contact" variant="primary">
                  Talk to Us About This
                  <ArrowRight size={15} />
                </Button>
              </div>

              <div className={`glass rounded-2xl p-8 ${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${service.color} flex items-center justify-center border border-white/10 mb-6`}
                >
                  <Icon size={22} className="text-text-primary" />
                </div>
                <h3 className="text-sm font-semibold tracking-widest uppercase text-text-subtle mb-5">
                  Common Use Cases
                </h3>
                <ul className="flex flex-col gap-3">
                  {service.useCases.map((uc) => (
                    <li key={uc} className="flex items-start gap-3 text-sm text-text-muted">
                      <Check size={14} className="text-brand-purple-light mt-0.5 shrink-0" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionWrapper>
        );
      })}

      {/* CTA */}
      <SectionWrapper className="bg-bg-card text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Not sure which service fits best?
        </h2>
        <p className="text-text-muted mb-8 max-w-lg mx-auto">
          Book a free discovery call and we&apos;ll map the right approach for your
          specific situation.
        </p>
        <Button href="/contact" variant="primary" size="lg">
          Book a Free Discovery Call
        </Button>
      </SectionWrapper>
    </>
  );
}
