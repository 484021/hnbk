import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  external?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-white text-bg-base font-semibold shadow-lg shadow-black/20 hover:bg-white/90 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
  outline:
    "border border-white/25 text-text-primary hover:bg-white/5 hover:border-white/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
  ghost:
    "text-text-muted hover:text-text-primary hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
};

const sizeClasses: Record<Size, string> = {
  sm:  "px-4 py-2 text-sm rounded-lg",
  md:  "px-6 py-3 text-sm rounded-xl",
  lg:  "px-8 py-4 text-base rounded-xl",
};

export default function Button({
  href,
  onClick,
  variant = "primary",
  size = "md",
  children,
  className,
  type = "button",
  disabled = false,
  external = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    disabled && "opacity-50 pointer-events-none",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
