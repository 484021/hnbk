import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "cyan" | "neutral";
  className?: string;
}

const variantClasses = {
  purple:  "bg-brand-purple/15 text-brand-purple-light border-brand-purple/30",
  blue:    "bg-white/8 text-text-muted border-white/12",
  cyan:    "bg-white/5 text-text-subtle border-white/8",
  neutral: "bg-white/5 text-text-muted border-white/10",
};

export default function Badge({
  children,
  variant = "purple",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
