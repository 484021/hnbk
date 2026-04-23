---
applyTo: "src/components/**/*.tsx"
---

# Animation Guidelines (Framer Motion)

## Required: useReducedMotion
Every animated `"use client"` component MUST declare this at the top of the function body:
```tsx
import { motion, useReducedMotion, useInView } from "framer-motion";

export default function MySection() {
  const prefersReduced = useReducedMotion();
  // ...
}
```

When `prefersReduced` is `true`, skip all animations — return immediate final state:
```tsx
// Pattern for individual animations:
animate={prefersReduced ? { opacity: 1, y: 0 } : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}

// Pattern for helper function:
function rm<T>(variants: T, fallback: T): T {
  return prefersReduced ? fallback : variants;
}
```

## Standard useInView Pattern
```tsx
const ref = useRef<HTMLDivElement>(null);
const inView = useInView(ref, { once: true, margin: "-80px" });

return (
  <div ref={ref}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
```

## Stagger Delays for Grid Items
Use index-based delay: `delay: 0.1 * i + 0.2`
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 24 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6, delay: 0.1 * i + 0.2 }}
  >
```

## Section Heading Animation
3-step stagger: badge → h2 → paragraph
```tsx
// badge: delay 0
// h2: delay 0.1
// paragraph: delay 0.2
// grid items: delay 0.1 * i + 0.35
```

## Easing
Preferred easing for hero/entrance: `ease: [0.22, 1, 0.36, 1]` (custom spring-like)
Standard transitions: `duration: 0.6` for most elements, `duration: 0.7` for hero

## Transitions — Never Use transition-all
`transition-all` is a performance anti-pattern. Be specific:
```tsx
// ❌ Bad
className="transition-all duration-300"

// ✅ Good
className="transition-[transform,border-color] duration-300"
className="transition-[opacity,transform] duration-200"
className="transition-colors duration-200"
```

## AnimatePresence
Use for conditional show/hide (mobile menu, modals):
```tsx
import { AnimatePresence } from "framer-motion";

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
```
