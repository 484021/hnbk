# HNBK — Project-Wide Copilot Instructions

## Stack
- **Framework**: Next.js 15 (App Router, `src/` directory, `layout.tsx` root)
- **Styling**: Tailwind CSS v4 — `@import "tailwindcss"` in `globals.css`, tokens in `@theme {}` block
- **Language**: TypeScript (strict mode)
- **Animation**: Framer Motion — every animated `"use client"` component MUST call `useReducedMotion()`
- **Icons**: `lucide-react`
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`
- **DB**: Supabase (`src/lib/supabase.ts`)
- **Email**: Resend (used in `src/app/api/contact/route.ts`)

---

## Design Tokens (defined in `src/app/globals.css` `@theme {}`)

```
Background  bg-bg-base (#08080F)  bg-bg-card (#0D0D1A)  bg-bg-elevated (#111128)
Text        text-text-primary (#FAFBFC)  text-text-muted (#A0A0B8)  text-text-subtle (#64647A)
Brand       brand-purple (#A23BEC)  brand-purple-light (#C06FFF)
            brand-blue (#3B82F6)  brand-cyan (#06B6D4)
Border      border-white/8  border-white/16
```

**Solid card pattern** (preferred in redesigned sections):
```
bg-bg-card border border-white/8 rounded-2xl p-7
```

**Glass card** (preserved for inner pages, forms, navbar):
```
.glass  (defined in globals.css — bg rgba(13,13,26,0.7) + backdrop-blur)
```

**Gradient text**: use `className="gradient-text"` utility (defined in globals.css)

**Grid mesh background**: `gridMesh` prop on `SectionWrapper` or `className="grid-mesh"`

---

## Tailwind v4 Rules — CRITICAL

| ❌ Deprecated (v3) | ✅ Use instead (v4) |
|---|---|
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-br` | `bg-linear-to-br` |
| `flex-shrink-0` | `shrink-0` |
| `flex-grow` | `grow` |
| `z-[100]` | `z-100` |
| `w-[600px]` for arbitrary | `w-150` (use scale if possible) |
| `transition-all` | Specific transitions: `transition-[transform,border-color]` |

Never use `bg-gradient-*` — always `bg-linear-*`.

---

## Component Conventions

### SectionWrapper (`src/components/ui/SectionWrapper.tsx`)
```tsx
<SectionWrapper id="section-id" className="bg-bg-base" gridMesh>
  {/* content at max-w-7xl auto px */}
</SectionWrapper>
```
Props: `id?`, `className?`, `gridMesh?: boolean`

### Button (`src/components/ui/Button.tsx`)
Variants: `primary` | `outline` | `ghost`  
Sizes: `sm` | `md` | `lg`  
Supports `href` (renders `<Link>`), `external`, `type`, `disabled`.

### Badge (`src/components/ui/Badge.tsx`)
Variants: `purple` | `blue` | `cyan` | `neutral`

---

## Animation Patterns

Every animated `"use client"` component MUST include:
```tsx
const prefersReduced = useReducedMotion();
```
When `prefersReduced` is true, skip animations or use immediate `opacity: 1, y: 0`.

Standard `useInView` pattern:
```tsx
const ref = useRef(null);
const inView = useInView(ref, { once: true, margin: "-80px" });
// animate={inView ? { opacity: 1, y: 0 } : {}}
```

Stagger delays: `0.1 * i + 0.2` base offset for grid children.

---

## Accessibility Requirements
- All icon-only interactive elements need `aria-label`
- All form `<input>` / `<textarea>` / `<select>` need matching `id` + `<label htmlFor>`
- Focus styles: `focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2`
- Skip-to-content link exists in `src/app/layout.tsx` — do not remove it
- `<main id="main-content">` wraps all page content

---

## File Structure
```
src/
  app/           — pages (App Router)
    api/         — API routes (server-only)
    globals.css  — Tailwind + design tokens
    layout.tsx   — root layout (Navbar, Footer, skip link, metadata)
    page.tsx     — homepage
    [route]/page.tsx — inner pages
  components/
    layout/      — Navbar.tsx, Footer.tsx
    sections/    — homepage + page sections (mostly "use client")
    ui/          — Badge, Button, SectionWrapper (shared primitives)
  lib/           — supabase.ts, utils.ts
  types/         — index.ts
```

---

## Commands
```bash
pnpm build      # production build — must exit 0
pnpm dev        # dev server on localhost:3000
pnpm lint       # ESLint
```

---

## Design Direction (current phase)
Bento-grid / modular dark-theme aesthetic inspired by Linear, Vercel, Resend, Raycast.
- Card-heavy layouts with clear visual hierarchy
- Solid card pattern (not glass/blur) for redesigned homepage sections
- Asymmetric grid layouts (featured card + supporting cards)
- Minimal decorative elements — 1 subtle glow max per section
- Typography: large bold headlines (`font-black`), muted body text

Logo: `/public/hnbk-logo.png` with `className="h-8 w-auto"` — renders in natural colors (purple crown + white text). No filter.
