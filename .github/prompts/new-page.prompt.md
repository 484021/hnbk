---
mode: agent
description: Scaffold a new inner page from scratch
---

Create a new inner page for the HNBK website.

## Page Details
- **Route**: `/{{routeName}}`
- **File path**: `src/app/{{routeName}}/page.tsx`
- **Page title**: {{pageTitle}}
- **Page purpose**: {{pagePurpose}}

## Requirements
Before writing any code:
1. Read `.github/copilot-instructions.md`
2. Read an existing inner page for reference — `src/app/services/page.tsx` is the best reference
3. Read `src/components/ui/SectionWrapper.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Badge.tsx`

## What to Build
Create `src/app/{{routeName}}/page.tsx` as a **Server Component** (no `"use client"`) with:

### Metadata (required)
```tsx
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "{{pageTitle}}",
  description: "Page description under 160 characters.",
};
```

### Page Structure
1. **Hero section**: `<SectionWrapper className="bg-bg-base pt-24 sm:pt-28" gridMesh>`
   - One `<Badge>` above the h1
   - `<h1>` with `font-black` and optional `gradient-text` span
   - Brief description paragraph
2. **Content sections**: Alternate `bg-bg-base` and `bg-bg-card`
3. **CTA section**: Final `<SectionWrapper className="bg-bg-card text-center">` with a `Button` linking to `/contact`

### Conventions
- `<h1>` in hero only, `<h2>` for subsequent sections
- `pt-24 sm:pt-28` on hero section for navbar clearance
- Inner pages use `.glass` cards (not solid bento pattern — that's for homepage only)
- Max 1 decorative glow orb in hero section

## After Building
- Run `get_errors` on the new file and fix all TypeScript errors
- Confirm the route is accessible at `localhost:3000/{{routeName}}`
