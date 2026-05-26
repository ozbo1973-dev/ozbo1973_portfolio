# ADR-0006: Archiving a Root Submission cascades to all its Replies

## Status
Accepted

## Context
When conversation threading is introduced, a Thread consists of a Root Submission and zero or more Replies. The existing archive mechanism sets `archivedAt` on a single `ProspectiveCustomer` document. The Inbox and Archived views filter on `parentId: null`, so Replies never appear as top-level items. The question is what happens to Replies when the Admin archives their Root Submission.

## Decision
Archiving a Root Submission cascades `archivedAt` to all Reply documents where `parentId == rootId`. The Admin never archives individual Replies — the Archive button only appears on Root Submissions. The Archived view treats the Thread as a unit.

## Consequences
- `archiveSubmission(id)` in `src/lib/dal/admin.ts` must update the root document **and** all documents where `parentId == id`. A second cascade site exists for the User-side archive: `userArchiveSubmission(id)` in `src/lib/dal/prospects.ts` (per ADR-0010).
- Replies will never appear in the Inbox as orphaned, unarchived documents after their Root is archived.
- If a Root Submission is unarchived in the future, a corresponding cascade would be needed — but there is no unarchive feature currently.
- The mental model is: you archive a conversation, not a message.

## Alternatives considered
- **Archive root only**: Replies become orphaned — no UI surface to view them, but they exist in the DB unarchived. Rejected: silent data inconsistency.
- **Archive each message individually**: Adds UI complexity and a confusing partial-archive state. Rejected: over-engineered for a single-admin system.
