---
mode: agent
description: Scaffold a new homepage section from scratch
---

Create a new homepage section component for the HNBK website.

## Section Details
- **Section name**: {{sectionName}}
- **Section purpose**: {{sectionPurpose}}
- **Background**: {{background}} (bg-bg-base or bg-bg-card)
- **Bento layout**: {{layoutPattern}} (equal-grid / featured-plus-supporting / two-column / full-width-plus-row)

## Requirements
Before writing any code:
1. Read `.github/copilot-instructions.md`
2. Read `src/components/ui/SectionWrapper.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`
3. Read `src/app/globals.css` for available utility classes
4. Read an existing section for reference (e.g., `src/components/sections/ServicesSection.tsx`)

## What to Build
Create `src/components/sections/{{ComponentName}}.tsx` with:
- `"use client"` directive
- `useReducedMotion()` from framer-motion — required
- `useInView` for scroll-triggered animations
- `SectionWrapper` with appropriate `id`, `className`, and optional `gridMesh`
- Solid card pattern: `bg-bg-card border border-white/8 rounded-2xl p-7`
- Max 1 decorative glow orb if needed
- All headings: section uses `<h2>`, cards use `<h3>`
- Tailwind v4 classes only: `bg-linear-to-*`, `shrink-0`, not `bg-gradient-*`

## After Building
- Run `get_errors` on the new file
- Fix any TypeScript errors
- Tell me which line in `src/app/page.tsx` to add the import and where to place the section in the page composition
