# ADR-0003: updateProspectUserId Has No Auth Check by Design

## Status

Accepted

## Context

`updateProspectUserId()` links a ProspectiveCustomer record to a BetterAuth userId. It has no session verification inside the function. This looks like a missing auth check but is intentional.

## Decision

Do not add an auth check to `updateProspectUserId()`. Its only call site is `submitContactForm`, a server action that:

1. Runs a security guard (IP, user-agent, honeypot, referer) before any DB access
2. Creates the ProspectiveCustomer record itself in the same execution
3. Derives the userId from `getUserIdByEmail()` using the same Zod-validated email

The call happens during an unauthenticated public submission — no session exists yet. The user authenticates via magic link after this point. Adding a session check would be the wrong tool: the protection is the guard at the action boundary, not ownership verification at the data layer.

## Consequences

- `updateProspectUserId()` must only be called from `submitContactForm` or an equivalent guard-protected context
- If a new authenticated call site is ever added (e.g. admin re-linking), it should be a separate DAL function with explicit session verification
