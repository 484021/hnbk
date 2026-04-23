import { type ClassValue, clsx } from "clsx";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

/** Format a date string to human-readable. */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
