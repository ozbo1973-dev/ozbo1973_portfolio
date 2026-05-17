# ADR-0004: Archive as a Flag, Not a Separate Collection

## Status

Accepted

## Context

The Admin Console needs an "archive" action that lets the Admin move a Submission out of the active Inbox after reviewing it. The idea doc (`docs/ideas/admin-page.md`) describes this as moving to "an archive table," which suggests a second collection (e.g. `ArchivedSubmission`).

Two viable shapes:

1. **Separate collection.** Archiving copies the doc into `ArchivedSubmission` and deletes the original from `ProspectiveCustomer`. Each tab queries its own collection.
2. **Flag on `ProspectiveCustomer`.** Add an `archivedAt: Date | null` field. Inbox = `archivedAt: null`. Archive = `archivedAt: { $ne: null }`. Both tabs query the same collection.

A future feature will let customers reply to a Submission (threading via the existing `parentId` field). With a separate collection, `parentId` would point at an ID that no longer exists in `ProspectiveCustomer` once the parent is archived — breaking the foreign-key model documented in ADR-0002. Cross-collection joins would be needed for any thread that crossed the archive boundary.

## Decision

Use a flag (`archivedAt: Date | null`) on the existing `ProspectiveCustomer` collection. Do not introduce a second collection.

The Inbox query filters `archivedAt: null`. The Archive query filters `archivedAt: { $ne: null }`. Archiving is a single-field update; un-archiving (if ever added) is the inverse.

## Consequences

- `parentId` references remain valid regardless of archive state — threading does not need to be archive-aware.
- One collection means simpler queries, no cross-collection joins, no transactional move logic.
- Existing user-scoped queries (`getSubmissionsByUserId`) are not filtered by `archivedAt` — see ADR-0005 for the rationale (archive is admin-private).
- Adding an index on `archivedAt` may be useful if the inbox grows large; not needed at current volume.
- The idea doc's "archive table" wording is no longer literal — future readers should consult this ADR before assuming a second collection exists.
