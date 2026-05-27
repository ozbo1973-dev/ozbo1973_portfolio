# ADR-0005: Archive State Is Admin-Private

## Status

Superseded by ADR-0010

## Context

The Admin Console's archive action marks a Submission as reviewed by the Admin. The User who submitted it sees their Submissions in the Portal via `getSubmissionsByUserId()` (`src/lib/dal/prospects.ts`).

Three semantics were possible for how archive interacts with the Portal:

1. **Admin-private.** Archive is the Admin's review state only. The User's Portal continues to show all their Submissions regardless of archive state.
2. **Shared hide.** Archive removes the Submission from the User's Portal as well.
3. **Marked but visible.** The User sees the Submission with a visual "closed by admin" indicator.

The Admin Console's archive is a workflow signal for the Admin, not a state change in the Submission's own lifecycle. The Submission may still receive customer replies in the future (via the planned threading feature), at which point it would re-surface in the Admin's Inbox — and a User who can't see their own submission can't reply to it.

## Decision

Archive is admin-private. `getSubmissionsByUserId()` does not filter by `archivedAt`. The User has no awareness that their Submission was archived.

## Consequences

- Portal queries are unchanged by the introduction of archive.
- A future dev adding a User-facing feature must not add `archivedAt: null` filters to user-scoped queries without revisiting this decision.
- When threading lands, a customer reply on an archived Submission can naturally un-archive it (or follow whatever semantics threading prefers) without needing a "visibility" reconciliation step.
- The Admin cannot use archive to hide a Submission from its User. If that is ever required, a separate field (e.g. `hiddenFromUserAt`) should be introduced rather than overloading `archivedAt`.
