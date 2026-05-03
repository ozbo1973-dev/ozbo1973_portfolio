# ADR-0001: Separate Navigation Context into Registry, Adapter, and Pure Computation

## Status

Accepted

## Context

The `NavigationProvider` (`src/context/navigation-context.tsx`) handles three concerns in one blob:

1. **Section registry** — which section IDs exist, hardcoded as a string array
2. **Scroll adapter** — reads DOM positions (`offsetTop`, `offsetHeight`) and listens to `window.scroll`
3. **Active-section computation** — derives which section is active from scroll position and DOM measurements

This coupling makes the active-section logic untestable without a real DOM. The navbar height offsets (`64` / `96`) are magic numbers duplicated between the scroll handler and the `scrollToSection` function. Section IDs are hardcoded in both the context and each section component with no shared contract — adding or renaming a section requires changes in multiple files with no type enforcement.

## Decision

### 1. Single source of truth in `config.ts`

Add `SECTION_IDS` and navbar height constants to `src/lib/config.ts`:

```ts
export const SECTION_IDS = ["home", "about", "skills", "projects", "contact"] as const
export type SectionId = typeof SECTION_IDS[number]

export const NAV_HEIGHT_SCROLLED = 64   // h-16
export const NAV_HEIGHT_DEFAULT = 96    // h-24
```

Section components import their ID constant from here instead of hardcoding strings.

### 2. `SectionType` derived from config

`src/types.d.ts` currently maintains a manual union. Replace it with a derived type so adding a section to config automatically updates the type contract.

### 3. Pure `getActiveSection` function

Extract active-section computation to `src/lib/navigation.ts`:

```ts
function getActiveSection(
  scrollY: number,
  sections: { id: SectionId; top: number; height: number }[],
  navbarHeight: number
): SectionId | null
```

All inputs are plain numbers — no DOM dependency. Unit-testable without mocking.

### 4. Scroll adapter stays in `NavigationProvider`

The scroll listener reads DOM positions and calls `getActiveSection`. This remains in the provider — extracting it to a separate hook is deferred until there is a concrete reason.

### 5. `isScrolled` stays DOM-measured

`isScrolled` drives visual navbar behavior and depends on the hero section's actual rendered height. It is not part of the pure computation and stays as a DOM read inside the scroll handler.

## Alternatives Considered

**Dynamic section registration at mount time** — section components call a `registerSection()` function when they mount. Rejected: more complex, introduces render-order dependencies, and offers no benefit over a static config for a fixed single-page layout.

**Runtime navbar height measurement** — read `navbar.getBoundingClientRect().height` instead of constants. Rejected: adds DOM coupling back into the pure function and the constants already match the Tailwind classes (`h-16`, `h-24`).

**Separate `useSectionPositions` hook** — extract the DOM-reading adapter into its own hook. Deferred: the pure function extraction already achieves the testability goal. The adapter hook is a one-file refactor with no logic changes if needed later.

## Consequences

- Active-section logic is unit-testable with plain number inputs
- Navbar height is defined once; changing it updates both scroll logic and scroll-to behavior
- Section ID contract is enforced by TypeScript — adding a section requires updating one array in config
- `NavigationProvider` retains one DOM concern (`isScrolled`) which is acceptable
