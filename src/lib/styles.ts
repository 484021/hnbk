/**
 * Shared className helpers for form elements.
 * Centralises the long Tailwind string so components don't repeat it.
 */
export function formInputClass(hasError = false): string {
  const base =
    "w-full bg-bg-elevated border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 transition-all";
  const error = "border-red-500/50 focus:ring-red-500/30";
  const normal = "border-white/10 hover:border-white/20 focus:ring-brand-purple/30 focus:border-brand-purple/40";
  return `${base} ${hasError ? error : normal}`;
}

/**
 * Variant for demo/gate forms that use focus-visible and a card-offset ring.
 */
export const demoInputClass =
  "w-full bg-bg-elevated border border-white/8 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card transition-[border-color] hover:border-white/16";
