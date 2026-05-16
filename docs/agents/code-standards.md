# Code Standards

### Claude Reference

Place under "Agent skills" in AGENTS.md as "Code standards".

---

## TypeScript

- Strict mode enabled (`tsconfig.json`)
- `interface` for component props; `type` for union/alias types
- Explicit return types on server actions; infer elsewhere
- No type assertions unless unavoidable

## Naming

- Files and directories: kebab-case
- Components and types: PascalCase
- Functions and variables: camelCase
- Constants: UPPER_SNAKE_CASE

## Imports

- Path alias `@/*` maps to `src/*` — use it everywhere
- Default exports for components; named exports for utilities and hooks
- Group order: framework (Next.js/React) → `@/` aliases → third-party

## Components

- Default to Server Components; add `"use client"` only when required
- Wrap sections in `SectionWrapper` for consistent layout
- Use `cn()` (from `@/lib/utils`) for all className composition
- Use CVA (`cva`) for components with multiple variants (see `src/components/ui/button.tsx`)

## Forms

- Server actions with `"use server"` directive for all mutations
- Wrap async server action calls in `startTransition` on the client
- Validate with Zod in the server action; never trust client input
- Return `ActionResult` shape: `{ success, error?, fieldErrors?, redirect? }`
- Use `toast.success` / `toast.error` for user feedback

## Styling

- Tailwind CSS v4 via CSS-first config in `globals.css`
- All classes applied inline; no external component CSS files
- Responsive classes are standard (`md:`, `lg:`, custom `xs:`)

## Comments

- Inline section markers in JSX (`/* Section name */`) are acceptable
- No JSDoc blocks; no multi-line comment blocks
- Only comment non-obvious constraints or workarounds

## Error Handling

- Server actions catch errors and return safe messages to the client
- Do not expose internal error details
- Field-level errors returned in `ActionResult.fieldErrors`

## Testing

- Every public function must have at least one test
- Use descriptive test names that explain the expected behavior
