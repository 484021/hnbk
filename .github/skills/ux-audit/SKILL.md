# Skill: UX Audit

Use this skill when asked to **audit the website** for accessibility, performance, design consistency, or conversion issues.

## Step 1 — Inventory All Files
List all files to audit:
```
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
src/app/*/page.tsx  (all inner pages)
src/components/layout/Navbar.tsx
src/components/layout/Footer.tsx
src/components/sections/*.tsx  (all sections)
src/components/ui/*.tsx  (all UI primitives)
src/app/api/*/route.ts  (API routes)
```

## Step 2 — Read Files in Batches
Read files in parallel where possible. Group by type:
- Batch 1: layout.tsx, globals.css, Navbar.tsx, Footer.tsx
- Batch 2: all section components
- Batch 3: all page files
- Batch 4: UI primitives + API routes

## Step 3 — Check Against Each Category

### 🔴 Critical (launch blockers)
- Missing skip-to-content link
- Form fields without labels (`<input>` missing `id` + `<label htmlFor>`)
- Broken encoding (e.g., `â€"` instead of `—`)
- API routes without input validation (no Zod)
- `<img>` tags instead of `next/image`

### 🟠 High (fix before shipping)
- Icon-only buttons missing `aria-label`
- Missing `focus-visible:ring-*` on interactive elements
- Missing `useReducedMotion()` in animated components
- `transition-all` usage (performance regression)
- Deprecated Tailwind v3 classes (`bg-gradient-*`, `flex-shrink-0`)
- Missing `aria-current="page"` on active nav links
- Missing `aria-expanded` + `aria-controls` on mobile menu toggle

### 🟡 Medium (improve soon)
- Heading hierarchy violations (skipped levels, multiple h1s)
- Missing `alt` text on images
- Unsubstantiated quantitative claims ("40-60%" without qualifier)
- Glass cards in sections that should use solid pattern
- Missing page metadata (`title`, `description`)
- `pt-36` hardcoded top padding (should use responsive `pt-24 sm:pt-28`)

### 🟢 Low (nice to have)
- Missing Open Graph images
- Inconsistent section background alternation
- Touch targets below 44px
- Missing `loading="lazy"` on below-fold images (next/image handles this)

## Step 4 — Write the Report
```markdown
## UX Audit Report — [Date]

### Summary
[N] Critical | [N] High | [N] Medium | [N] Low

### 🔴 Critical
1. **[file path]** — [Issue] → [Suggested fix]

### 🟠 High
1. **[file path]** — [Issue] → [Suggested fix]

### 🟡 Medium
1. **[file path]** — [Issue] → [Suggested fix]

### 🟢 Low
1. **[file path]** — [Issue] → [Suggested fix]
```

## Step 5 — Prioritize Fixes
After the report, list the top 5 highest-priority fixes in order of impact and effort:
1. (Critical items first)
2. (Then high-impact high items)
3. ...
