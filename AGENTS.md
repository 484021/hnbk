<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Instructions
The canonical project-wide instructions live in `.github/copilot-instructions.md`.
Read that file before making any code changes. It contains:
- Stack overview and file structure
- Design token reference (colors, spacing, typography)
- Tailwind v4 migration rules (critical — many v3 classes are broken)
- Component API conventions (SectionWrapper, Button, Badge)
- Animation patterns (useReducedMotion required on all animated components)
- Accessibility requirements
- Build commands (`pnpm build` must exit 0)

## Specialized Agents
- `.github/agents/ui-designer.agent.md` — UI design and component work
- `.github/agents/ux-auditor.agent.md` — Accessibility and UX audits (read-only)
- `.github/agents/fullstack-dev.agent.md` — Full-stack feature implementation

## Skills
- `.github/skills/design-section/SKILL.md` — Step-by-step workflow for building/redesigning sections
- `.github/skills/ux-audit/SKILL.md` — Comprehensive audit workflow

## Reusable Prompts
- `.github/prompts/new-section.prompt.md` — Scaffold a new homepage section
- `.github/prompts/redesign-section.prompt.md` — Redesign a section in bento-grid style
- `.github/prompts/new-page.prompt.md` — Scaffold a new inner page
