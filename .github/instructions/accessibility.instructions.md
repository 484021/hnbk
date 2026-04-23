---
applyTo: "**/*.tsx"
---

# Accessibility Requirements

## Interactive Elements
Every button, link, or interactive element with only an icon (no visible text) MUST have `aria-label`:
```tsx
// ❌ Missing label
<button onClick={toggle}><X size={20} /></button>

// ✅ Correct
<button onClick={toggle} aria-label="Close menu"><X size={20} /></button>
```

## Form Fields
Every `<input>`, `<textarea>`, and `<select>` MUST have:
1. A unique `id` attribute
2. A `<label>` with matching `htmlFor`
3. Optional: `aria-describedby` pointing to hint/error text

```tsx
<label htmlFor="email">Email address</label>
<input id="email" type="email" name="email" />
```

## Focus Styles
All interactive elements MUST have visible focus styles using `focus-visible:ring-*`:
```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
```
Never use `outline-none` without a `focus-visible:ring-*` replacement.

## Landmark Roles
- `<header>` wraps the navbar
- `<main id="main-content">` wraps page content (set in `layout.tsx`)
- `<footer>` wraps the footer
- `<nav>` wraps navigation lists with `aria-label` if more than one nav exists

## Navigation
- Active nav links: `aria-current="page"`
- Mobile menu toggle button: `aria-expanded={isOpen}` + `aria-controls="menu-id"`
- Mobile menu container: `id="menu-id"` matching `aria-controls`

## Images
- All `<Image>` components need meaningful `alt` text
- Decorative images: `alt=""`
- Logo: `alt="HNBK"`

## Headings
- Each page has exactly one `<h1>`
- Heading hierarchy: h1 → h2 → h3 (never skip levels)
- Section headings: `<h2>` for top-level sections, `<h3>` for cards within sections

## ARIA
- Dynamic content regions that update: `aria-live="polite"`
- Form errors: `role="alert"` + `aria-invalid="true"` on invalid fields
- Modal dialogs: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`

## Color Contrast
- Body text (`text-text-muted` #A0A0B8 on #08080F): passes AA
- Subtle text (`text-text-subtle` #64647A): use only for decorative/secondary info — not required to be AA for large text
- Never use `text-text-subtle` for critical information or form labels

## Touch Targets
All interactive elements: minimum 44×44px touch target on mobile. Use `min-h-11 min-w-11` for small buttons.
