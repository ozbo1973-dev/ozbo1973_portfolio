# ADR-0007: User deletion blocked when Admin Replies exist; User can archive instead

## Status
Accepted

## Context
Users can currently hard-delete their own Root Submissions from the Portal. With conversation threading, a Thread may contain Admin Replies. Allowing a User to delete a Root Submission with Admin Replies would destroy content the Admin authored.

## Decision
- A User may hard-delete a Root Submission only if it has **no Admin Replies** (i.e., no Reply documents where `userId == adminUserId`).
- If Admin Replies exist, the delete action is blocked server-side. The UI replaces the Delete button with an Archive button.
- A User may archive any Root Submission regardless of Reply state. Archiving moves the Thread to a separate Archived section in the Portal (mirrors the Admin Console pattern).
- If a Root Submission has only User Replies (no Admin Replies), deletion is still permitted and cascades to those User Replies.
- Admin cascade-delete (ADR-0006 pattern) is unaffected — Admin can always hard-delete.

## Consequences
- `deleteSubmissionAction` must check for Admin Replies before allowing deletion. Returns a typed error if blocked.
- A new `archiveSubmissionAction` (user-scoped) is needed in `src/app/actions/archiveSubmission.ts`.
- `getThreadsByUserId()` in `src/lib/dal/prospects.ts` must return both active and archived threads, or a separate `getArchivedThreadsByUserId()` is needed.
- The Portal gains an Archived section (new tab or section below active threads).
- `SubmissionCard` needs conditional Delete vs Archive button based on whether Admin Replies exist.

## Alternatives considered
- **Always allow user deletion, cascade replies**: Destroys Admin-authored content. Rejected.
- **Block deletion entirely once any reply exists**: Too restrictive — User should be able to clean up their own reply-only threads. Rejected.
