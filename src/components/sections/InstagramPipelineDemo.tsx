"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Loader2, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import InstagramMockCard from "@/components/ui/InstagramMockCard";
import Button from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type DemoState = "gate" | "generate" | "loading" | "result" | "error";

interface GenerateResult {
  caption: string;
  hashtags: string[];
  imageBase64: string | null;
  mimeType: string | null;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const gateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Enter a valid email address").max(200).trim(),
});

const generateSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200).trim(),
});

type GateFormData = z.infer<typeof gateSchema>;
type GenerateFormData = z.infer<typeof generateSchema>;

// ─── Pipeline steps ───────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { label: "Researching trending topics…", icon: "🔍" },
  { label: "Writing caption & hashtags…", icon: "✍️" },
  { label: "Generating visual…", icon: "🎨" },
  { label: "Finalizing post…", icon: "✨" },
];

const PRESET_NICHES = [
  "Toronto bakery — seasonal specials",
  "Real estate agent — market update",
  "Fitness studio — morning routine tips",
  "Restaurant — behind the scenes kitchen",
  "Landscaping — spring lawn care",
  "Digital marketing agency — client wins",
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  compact?: boolean;
}

export default function InstagramPipelineDemo({ compact = false }: Props) {
  const prefersReduced = useReducedMotion();
  const [state, setState] = useState<DemoState>("gate");
  const [userData, setUserData] = useState<GateFormData | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gate form
  const gateForm = useForm<GateFormData>({
    resolver: zodResolver(gateSchema),
  });

  // Generate form
  const generateForm = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
  });

  // Advance pipeline step animation during loading
  useEffect(() => {
    if (state === "loading") {
      setPipelineStep(0);
      stepTimerRef.current = setInterval(() => {
        setPipelineStep((prev) => {
          if (prev < PIPELINE_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 2500);
    } else {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
    }
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [state]);

  // ─── Handlers ───────────────────────────────────────────────

  const handleGateSubmit = (data: GateFormData) => {
    setUserData(data);
    setState("generate");
  };

  const handleGenerate = async (data: GenerateFormData) => {
    if (!userData) return;
    setState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/demo/instagram-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          topic: data.topic,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(
          json.error ?? "Something went wrong. Please try again.",
        );
        setState("error");
        return;
      }

      setResult(json as GenerateResult);
      setState("result");
    } catch {
      setErrorMsg("Network error — please check your connection and try again.");
      setState("error");
    }
  };

  const handleTryAnother = () => {
    generateForm.reset();
    setState("generate");
  };

  const handleRetry = () => {
    setState(userData ? "generate" : "gate");
    setErrorMsg("");
  };

  // ─── Animation helpers ──────────────────────────────────────

  const fadeIn = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

  const pt = compact ? "pt-0" : "pt-2";

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className={`w-full ${pt}`}>
      {/* ── GATE STATE ── */}
      {state === "gate" && (
        <motion.div key="gate" {...fadeIn} className="max-w-lg mx-auto">
          <div className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-purple/20 border border-brand-purple/30">
                <Zap size={16} className="text-brand-purple-light" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">Try the live demo</p>
                <p className="text-xs text-text-subtle">Real AI. Real output. Takes ~15 seconds.</p>
              </div>
            </div>

            <form
              onSubmit={gateForm.handleSubmit(handleGateSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gate-name" className="text-sm font-medium text-text-muted">
                  Your name
                </label>
                <input
                  id="gate-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Smith"
                  className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card transition-[border-color] hover:border-white/16"
                  {...gateForm.register("name")}
                />
                {gateForm.formState.errors.name && (
                  <p className="text-xs text-red-400">{gateForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="gate-email" className="text-sm font-medium text-text-muted">
                  Work email
                </label>
                <input
                  id="gate-email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@yourcompany.com"
                  className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card transition-[border-color] hover:border-white/16"
                  {...gateForm.register("email")}
                />
                {gateForm.formState.errors.email && (
                  <p className="text-xs text-red-400">{gateForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white text-bg-base font-semibold text-sm rounded-xl px-6 py-3 hover:bg-white/90 hover:-translate-y-0.5 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card"
              >
                Unlock Demo <ArrowRight size={14} />
              </button>

              <p className="text-center text-xs text-text-subtle">
                No spam. We&apos;ll only reach out if you want us to.
              </p>
            </form>
          </div>
        </motion.div>
      )}

      {/* ── GENERATE STATE ── */}
      {state === "generate" && (
        <motion.div key="generate" {...fadeIn} className="max-w-lg mx-auto">
          <div className="bg-bg-card border border-white/8 rounded-2xl p-7 flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                Hey {userData?.name?.split(" ")[0]} 👋
              </p>
              <p className="text-xs text-text-subtle">
                Enter a topic or niche and we&apos;ll generate a full Instagram post in real time.
              </p>
            </div>

            <form
              onSubmit={generateForm.handleSubmit(handleGenerate)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="demo-topic" className="text-sm font-medium text-text-muted">
                  Topic / niche
                </label>
                <input
                  id="demo-topic"
                  type="text"
                  placeholder="e.g. Toronto coffee shop — new autumn menu"
                  className="w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card transition-[border-color] hover:border-white/16"
                  {...generateForm.register("topic")}
                />
                {generateForm.formState.errors.topic && (
                  <p className="text-xs text-red-400">
                    {generateForm.formState.errors.topic.message}
                  </p>
                )}
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2">
                {PRESET_NICHES.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => generateForm.setValue("topic", niche, { shouldValidate: true })}
                    className="text-xs text-text-subtle bg-white/5 border border-white/8 px-3 py-1 rounded-full hover:border-brand-purple/30 hover:text-text-muted transition-[border-color,color] cursor-pointer"
                  >
                    {niche}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-white text-bg-base font-semibold text-sm rounded-xl px-6 py-3 hover:bg-white/90 hover:-translate-y-0.5 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card"
              >
                Generate Post <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ── LOADING STATE ── */}
      {state === "loading" && (
        <motion.div key="loading" {...fadeIn} className="max-w-lg mx-auto">
          <div className="bg-bg-card border border-white/8 rounded-2xl p-8 flex flex-col gap-6 items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-brand-purple/30 bg-brand-purple/10">
              <Loader2 size={22} className="text-brand-purple-light animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary mb-1">
                Pipeline running…
              </p>
              <p className="text-xs text-text-subtle">This takes about 15 seconds</p>
            </div>

            {/* Step indicators */}
            <div className="w-full flex flex-col gap-2">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === pipelineStep;
                const isDone = i < pipelineStep;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-[background-color,opacity] duration-500 ${
                      isActive
                        ? "bg-brand-purple/10 border border-brand-purple/20 opacity-100"
                        : isDone
                        ? "opacity-60"
                        : "opacity-25"
                    }`}
                  >
                    <span className="text-base" aria-hidden>
                      {isDone ? "✅" : step.icon}
                    </span>
                    <span
                      className={`text-sm ${
                        isActive ? "text-text-primary font-medium" : "text-text-subtle"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isActive && (
                      <Loader2 size={13} className="ml-auto text-brand-purple-light animate-spin shrink-0" />
                    )}
                    {isDone && (
                      <CheckCircle2 size={13} className="ml-auto text-green-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── RESULT STATE ── */}
      {state === "result" && result && (
        <motion.div key="result" {...fadeIn} className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1">
              <CheckCircle2 size={12} /> Post generated
            </span>
            <p className="text-sm text-text-subtle">
              Generated in real time by the HNBK AI pipeline
            </p>
          </div>

          <InstagramMockCard
            caption={result.caption}
            hashtags={result.hashtags}
            imageBase64={result.imageBase64}
            mimeType={result.mimeType}
            username={userData?.name?.toLowerCase().replace(/\s+/g, "_") ?? "your_brand"}
          />

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={handleTryAnother}
              className="flex-1 flex items-center justify-center gap-2 border border-white/16 text-text-muted text-sm font-medium rounded-xl px-5 py-3 hover:bg-white/5 hover:text-text-primary transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              <RefreshCw size={14} /> Try Another Topic
            </button>
            <Button href="/contact" variant="primary" size="md" className="flex-1 justify-center">
              Build This For Me <ArrowRight size={14} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── ERROR STATE ── */}
      {state === "error" && (
        <motion.div key="error" {...fadeIn} className="max-w-lg mx-auto">
          <div className="bg-bg-card border border-red-500/20 rounded-2xl p-7 flex flex-col gap-4 items-center text-center">
            <p className="text-sm text-red-400 font-medium">{errorMsg}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm text-text-muted border border-white/16 rounded-xl px-5 py-2.5 hover:bg-white/5 transition-[background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
