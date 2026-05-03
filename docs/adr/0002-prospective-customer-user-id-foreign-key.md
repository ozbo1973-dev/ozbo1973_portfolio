# ADR-0002: Link ProspectiveCustomer to BetterAuth User via userId Foreign Key

## Status

Accepted

## Context

BetterAuth manages its own `user` collection separate from the app's `ProspectiveCustomer` collection. We need a stable way to associate a prospective customer's form submission(s) with their authenticated identity.

Two options were considered:

- **Email-based linking**: query `ProspectiveCustomer` by `session.user.email`
- **Foreign key**: add `userId` (BetterAuth `user.id`) to `ProspectiveCustomer`

## Decision

Add a `userId` field to `ProspectiveCustomer` referencing the BetterAuth `user.id`. Set it when the magic link is sent (the BetterAuth user record exists at that point).

## Consequences

- The relationship is many-to-one: one `user` can have multiple `ProspectiveCustomer` submissions
- `userId` is the stable identity key — immune to email changes
- Future features (new requests, comments) can scope mutations to the authenticated user without relying on email matching
- Email remains on `ProspectiveCustomer` as submitted data, but is not used as the join key
