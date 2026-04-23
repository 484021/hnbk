---
applyTo: "**/*.tsx,**/*.css"
---

# Tailwind CSS v4 Rules

## Critical — v3 to v4 Migration

These v3 classes are BROKEN in this project. Never use them:

| ❌ NEVER (v3 broken) | ✅ ALWAYS (v4 correct) |
|---|---|
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-l` | `bg-linear-to-l` |
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `bg-gradient-to-b` | `bg-linear-to-b` |
| `bg-gradient-to-br` | `bg-linear-to-br` |
| `bg-gradient-to-tr` | `bg-linear-to-tr` |
| `flex-shrink-0` | `shrink-0` |
| `flex-shrink` | `shrink` |
| `flex-grow` | `grow` |
| `flex-grow-0` | `grow-0` |
| `transition-all` | `transition-[transform,opacity]` (be specific) |
| `z-[100]` | `z-100` |
| `z-[50]` | `z-50` |

## Design Token Usage
Use semantic token classes, not raw hex values:
```
bg-bg-base        (not #08080F)
bg-bg-card        (not #0D0D1A)
bg-bg-elevated    (not #111128)
text-text-primary (not #FAFBFC)
text-text-muted   (not #A0A0B8)
text-text-subtle  (not #64647A)
brand-purple      (not #A23BEC)
brand-purple-light (not #C06FFF)
brand-blue        (not #3B82F6)
brand-cyan        (not #06B6D4)
```

## Card Patterns
**Solid card** (use in redesigned homepage sections):
```
bg-bg-card border border-white/8 rounded-2xl p-7
```

**Elevated card** (featured/highlighted cards):
```
bg-bg-elevated border border-white/8 rounded-2xl p-7
```

**Glass card** (preserved for forms, navbar, inner pages):
```
glass  (CSS utility class — do not recreate inline)
```

## Border Opacity
Use opacity modifiers, not hardcoded hex:
- `border-white/8` = 8% white border (subtle)
- `border-white/16` = 16% white border (bright)
- `border-brand-purple/30` = purple hover border

## Responsive Breakpoints
- `sm:` = 640px+
- `md:` = 768px+
- `lg:` = 1024px+
- `xl:` = 1280px+
- Mobile-first: base class = mobile, modifiers = larger

## Arbitrary Values
Prefer Tailwind scale over arbitrary values when possible:
- Widths/heights: use scale (`w-96`, `h-48`) not `w-[384px]`
- For truly custom sizes only: `w-[600px]` is acceptable

## CSS in globals.css
- Design tokens live in `@theme {}` block — do not add tokens inline
- New keyframe animations go in `@keyframes` block
- New utility classes go at bottom of file with a comment header
