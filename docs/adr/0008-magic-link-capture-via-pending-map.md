# ADR-0008: Magic link URL captured via in-process Promise Map, not refactored into a seam

## Status
Accepted

## Context
`submitContactForm` needs the magic link URL to include in the notification email sent to the Prospect. better-auth's `magicLink` plugin delivers the URL exclusively via a `sendMagicLink` callback — it does not return the URL to the caller of `auth.api.signInMagicLink`. There is no supported API to retrieve the URL after the fact.

To bridge this, `auth.ts` maintains a `pendingCaptures` Map keyed by email. Before calling `signInMagicLink`, the action registers a Promise resolver for that email. The `sendMagicLink` callback resolves it when the URL arrives. The action then awaits the Promise to obtain the URL.

Architecture reviews have noted this as a candidate for refactoring — specifically, whether `submitContactForm` should be deepened behind a seam that hides the Map.

## Decision
Keep the `pendingCaptures` Map as the implementation. Do not introduce an abstraction over it.

The Map is a constraint imposed by better-auth's plugin API, not a design choice. Moving `sendNotifications` into the `sendMagicLink` callback (the only way to eliminate the Map) would put email-sending logic inside the auth configuration module — worse locality, not better. No second adapter exists or is planned, so a `IMagicLinkStore` interface would be a hypothetical seam with no concrete benefit.

## Consequences
- The Map is global mutable state. If two requests for the same email arrive concurrently, the second registration overwrites the first resolver, causing the first to hang. This is acceptable: the contact form rate-limiter (3 submissions per 5 minutes per IP) makes this scenario practically unreachable.
- Tests that exercise the magic link flow must mock `registerMagicLinkCapture` or supply a resolved Promise.
- If better-auth's plugin API gains a way to return the URL synchronously or via a hook result, revisit this decision and simplify.

## Alternatives considered
- **Move `sendNotifications` into the `sendMagicLink` callback**: Eliminates the Map but puts notification logic inside auth config. Rejected — poor locality.
- **Extract `IMagicLinkStore` interface**: One adapter (the Map), no second in sight. Hypothetical seam. Rejected per project architecture principles.
