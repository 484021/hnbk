"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(20, "Please provide a bit more detail (min 20 characters)"),
});

type FormData = z.infer<typeof schema>;

const services = [
  "AI Agent Orchestration",
  "Custom Software Development",
  "AI Integration",
  "AI Strategy & Consulting",
  "Not sure yet — let's talk",
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
        <CheckCircle size={56} className="text-brand-purple-light" />
        <h2 className="text-3xl font-black">Message received!</h2>
        <p className="text-text-muted max-w-sm">
          Thanks for reaching out. We&apos;ll be in touch within 24 hours to
          schedule your strategy call.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Full Name *" id="name" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Jane Smith"
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Email *" id="email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="jane@company.com"
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Company" id="company" error={errors.company?.message}>
          <input
            {...register("company")}
            placeholder="Acme Inc."
            className={inputClass(false)}
          />
        </Field>
        <Field label="Phone" id="phone" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+1 (416) 555-0100"
            className={inputClass(false)}
          />
        </Field>
      </div>
      <Field label="Service of Interest" id="service" error={errors.service?.message}>
        <div className="relative">
          <select
            {...register("service")}
            className={cn(inputClass(false), "appearance-none pr-10 cursor-pointer")}
          >
            <option value="">Select a service...</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none" />
        </div>
      </Field>
      <Field label="Tell us about your business & goals *" id="message" error={errors.message?.message}>
        <textarea
          {...register("message")}
          rows={5}
          placeholder="What does your team currently struggle with? What would you love to automate? What are your goals over the next 6–12 months?"
          className={cn(inputClass(!!errors.message), "resize-none")}
        />
      </Field>

      {serverError && (
        <p className="text-red-400 text-sm border border-red-500/30 bg-red-500/10 px-4 py-3 rounded-xl">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : (
          <>
            Send Message
            <Send size={15} />
          </>
        )}
      </Button>

      <p className="text-xs text-text-subtle text-center">
        We respect your privacy. No spam, ever.
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${id}-error`;
  const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  const cloned = React.cloneElement(child, {
    id,
    "aria-describedby": error ? errorId : undefined,
    "aria-invalid": error ? (true as unknown as string) : undefined,
  } as React.HTMLAttributes<HTMLElement>);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-muted">{label}</label>
      {cloned}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-bg-elevated border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 transition-all",
    hasError
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-white/10 hover:border-white/20 focus:ring-brand-purple/30 focus:border-brand-purple/40",
  );
}


