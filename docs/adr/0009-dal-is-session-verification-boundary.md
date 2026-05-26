# ADR-0009: The DAL Is the Session Verification Boundary

## Status

Accepted

## Context

Before this refactor, session verification (`verifySession()`) was scattered: some functions verified at the action layer, some inside the DAL, and some not at all. This made it hard to reason about which entry points were protected and created opportunities for callers to forget to verify.

The project has two categories of DAL functions:

1. **Session-verified** — functions that operate on user-scoped data (submissions, threads, replies). These should own their own `verifySession()` call so no caller can accidentally skip it.
2. **Unverified** — functions called from paths where no session exists or where BetterAuth is already the authority (magic-link capture, user cascade delete). These must remain session-free by design.

## Decision

The DAL is the session verification boundary for user-scoped data:

- Functions in `dal/prospects.ts` that operate on authenticated user data call `verifySession()` from `dal/session.ts` internally. Their signatures expose only domain IDs — callers do not pass a `userId`.
- Server Actions that call these functions do **not** call `verifySession()` themselves. They are thin wrappers.
- The exception is `dal/prospects-unverified.ts`, which holds functions called from trusted server paths where session verification is intentionally absent. See ADR-0003 (magic-link capture) for one such path.

Defense-in-depth verification at the action layer was explicitly rejected: it duplicates responsibility, creates confusion about which layer is authoritative, and does not add security because the action layer is already server-only.

## Consequences

- `verifySession()` lives in `dal/session.ts` as a shared primitive, importable by any DAL module.
- `dal/prospects-unverified.ts` is the canonical home for intentionally-unverified functions. Adding a function there requires a written justification in a comment or ADR.
- Server Actions remain simple: parse, call DAL, return result.
- References: ADR-0003 (pre-auth case), ADR-0008 (magic-link capture mechanism).
