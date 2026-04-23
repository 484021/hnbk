---
applyTo: "src/app/**"
---

# Next.js 15 App Router Rules

## Server vs Client Components
- Default to **Server Components** — no `"use client"` unless you need state, effects, event handlers, or browser APIs
- Add `"use client"` at the top of any file using: `useState`, `useEffect`, `useRef`, `useReducedMotion`, `useInView`, event handlers (`onClick`, `onChange`), or `usePathname`
- Framer Motion components always require `"use client"`

## Metadata
Every `page.tsx` MUST export a `metadata` object:
```tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description under 160 characters.",
};
```
Use `template: "%s | HNBK"` in root layout; inner pages only set `title: "Short Name"`.

## Route Conventions
- `src/app/page.tsx` — homepage
- `src/app/[route]/page.tsx` — inner page (static by default)
- `src/app/api/[route]/route.ts` — API route (always server-only; do not `"use client"`)
- Dynamic routes: `src/app/[slug]/page.tsx` — params is now a **Promise** in Next.js 15: `const { slug } = await params`

## Layout
- `src/app/layout.tsx` is the root layout — do not remove skip-to-content link, `<main id="main-content">`, Navbar, or Footer
- Never add a second root `<html>` or `<body>` tag in nested layouts

## Images
- Use `next/image` `<Image>` for all images — never raw `<img>`
- Logo: `<Image src="/hnbk-logo.png" alt="HNBK" width={130} height={34} className="h-8 w-auto" priority />`

## Links
- Use `next/link` `<Link>` for all internal navigation
- External links: use `<a target="_blank" rel="noopener noreferrer">`

## API Routes
- Always validate request bodies with `zod` before processing
- Return `NextResponse.json(...)` with appropriate HTTP status codes
- Never expose raw error stack traces to the client
