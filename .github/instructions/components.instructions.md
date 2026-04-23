---
applyTo: "src/components/**/*.tsx"
---

# Component Authoring Guidelines

## SectionWrapper
Always wrap page sections in `SectionWrapper`. It provides `section-py` spacing, `max-w-7xl` centering, and optional `grid-mesh` background.

```tsx
import SectionWrapper from "@/components/ui/SectionWrapper";

<SectionWrapper id="section-id" className="bg-bg-base" gridMesh>
  {/* your content */}
</SectionWrapper>
```

Props:
- `id?: string` — anchor link target
- `className?: string` — override background or add classes
- `gridMesh?: boolean` — enable grid background pattern

## Button
```tsx
import Button from "@/components/ui/Button";

<Button href="/contact" variant="primary" size="lg">
  Book a Call
</Button>
```

- `variant`: `"primary"` | `"outline"` | `"ghost"`
- `size`: `"sm"` | `"md"` | `"lg"`
- `href`: renders as `<Link>` for internal, add `external` prop for `target="_blank"`
- `type`: `"button"` | `"submit"` | `"reset"` (for forms)

## Badge
```tsx
import Badge from "@/components/ui/Badge";

<Badge variant="purple">Label Text</Badge>
```

- `variant`: `"purple"` | `"blue"` | `"cyan"` | `"neutral"`
- Use for section category labels and tag indicators

## Bento Card Pattern
For homepage sections (solid, not glass):
```tsx
<div className="bg-bg-card border border-white/8 rounded-2xl p-7">
  {/* card content */}
</div>
```

Featured/highlighted card:
```tsx
<div className="bg-bg-elevated border border-brand-purple/30 rounded-2xl p-7 ring-1 ring-brand-purple/20">
  {/* featured content */}
</div>
```

## Icon Usage
- Always import from `lucide-react`
- Icon-only buttons/links MUST have `aria-label`
- Standard icon size in cards/buttons: `size={16}` or `size={18}`
- Heading icons: `size={22}` or `size={24}`

## Props Patterns
- Use `interface` not `type` for component props
- Export default (not named) for page and section components
- Use `cn()` from `@/lib/utils` for conditional class merging:
  ```tsx
  import { cn } from "@/lib/utils";
  className={cn("base-classes", condition && "conditional-class")}
  ```

## Single Glow Rule
Each section gets at most **one** decorative glow orb. Use a `<div className="orb absolute ...">` with `style={{ background: "radial-gradient(...)" }}`. Do not stack multiple orbs in one section.
