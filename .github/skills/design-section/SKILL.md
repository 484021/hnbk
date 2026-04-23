# Skill: Design a Section

Use this skill when asked to **design or redesign a homepage section** using the HNBK bento-grid design system.

## Step 1 — Read Context
Before writing any code, read:
1. The existing section file (if redesigning): understand current data, props, and narrative role
2. `.github/copilot-instructions.md` for the full design token reference
3. `src/app/globals.css` for available utility classes (`.glass`, `.gradient-text`, `.grid-mesh`, `.orb`)
4. `src/components/ui/` — read `Button.tsx`, `Badge.tsx`, `SectionWrapper.tsx` for API

## Step 2 — Determine Narrative Role
Answer these questions before designing:
- What is this section trying to communicate? (pain point, proof, solution, CTA, etc.)
- Where does it sit in the homepage flow? (early = simpler; middle = complex; end = high-conviction)
- What is the one key thing a user should take away?

## Step 3 — Choose a Bento Layout
Select a grid pattern based on content complexity:

**Pattern A — Equal Grid** (3 items of similar weight):
```
[  Card 1  ] [  Card 2  ] [  Card 3  ]
```

**Pattern B — Featured + Supporting** (one hero idea + details):
```
[      Featured Card (2/3)      ] [ Card ]
[  Card  ] [  Card  ] [  Card   ]
```

**Pattern C — Two-Column Narrative** (explanation left, visual right):
```
[  Headline + Body + CTA  ] [  Visual Card  ]
```

**Pattern D — Full-Width + Row** (intro + details below):
```
[        Full-Width Intro Card        ]
[ Card ] [ Card ] [ Card ] [ Card ]
```

## Step 4 — Apply the Design Tokens
- Section background: alternate `bg-bg-base` and `bg-bg-card` between sections
- Card background: `bg-bg-card` (default) or `bg-bg-elevated` (featured)
- Card border: `border border-white/8`
- Card rounding: `rounded-2xl`
- Card padding: `p-7` (standard), `p-8` (large featured)
- Hover state: `hover:border-brand-purple/30 transition-[border-color] duration-300`
- Heading: `font-black text-4xl sm:text-5xl`
- Body: `text-text-muted leading-relaxed`
- Feature chip: `text-xs bg-white/5 border border-white/8 px-3 py-1 rounded-full`
- One glow max: `<div className="orb absolute ..." style={{ background: "radial-gradient(...)" }} />`

## Step 5 — Implement with Animation
Every animated section MUST:
```tsx
"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export default function MySection() {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  
  // heading stagger: delays 0, 0.1, 0.2
  // grid items: delay 0.1 * i + 0.35
  
  return (
    <SectionWrapper ...>
      <div ref={ref}>
        ...
      </div>
    </SectionWrapper>
  );
}
```

When `prefersReduced` is true: use `animate={{ opacity: 1, y: 0 }}` immediately (no delay).

## Step 6 — Verify
1. Run `get_errors` on the new file — fix any TypeScript errors
2. Check: no `bg-gradient-*` classes, no `flex-shrink-0`, no `transition-all`
3. Check: `useReducedMotion()` is called
4. Check: one `<h2>` per section (not h1), `<h3>` for card titles
5. Check: section background alternates correctly with adjacent sections
