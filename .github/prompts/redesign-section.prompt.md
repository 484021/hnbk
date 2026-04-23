---
mode: agent
description: Redesign an existing section in bento-grid style
---

Redesign an existing homepage section to match the HNBK bento-grid aesthetic inspired by Linear, Vercel, Resend, and Raycast.

## Section to Redesign
- **File**: `src/components/sections/{{sectionFile}}`
- **Requested changes**: {{changes}}

## Requirements
Before redesigning:
1. Read the current section file completely — understand all data structures and current narrative
2. Read `.github/copilot-instructions.md` for design system reference
3. Read `.github/skills/design-section/SKILL.md` for the full bento design workflow
4. Note the section's position in page.tsx (what comes before/after) to ensure correct background alternation

## Design Constraints
- **Keep all content** — do not remove or change copy unless explicitly told to
- **Replace `.glass` cards** with `bg-bg-card border border-white/8 rounded-2xl` pattern
- **One glow max** — remove extra orbs
- **Asymmetric grid** where appropriate — a "featured" card signals the primary message
- **Tailwind v4 only** — `bg-linear-to-*`, `shrink-0`, no `transition-all`
- **`useReducedMotion()`** — MUST be present

## What to Deliver
A complete replacement of the section file — same file path, new implementation.
After writing: run `get_errors` and fix all TypeScript errors before reporting done.
