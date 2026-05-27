# ADR-0010: archivedAt Is Dual-Purpose (supersedes ADR-0005)

## Status

Accepted — supersedes ADR-0005

## Context

ADR-0005 recorded that `archivedAt` was admin-private: only the Admin could set it (via the Admin Console archive action), and the User's Portal would ignore it entirely.

The shipped Portal contradicts this. Users can archive their own Threads via `userArchiveSubmission()`, and the Portal's Archived section (`getArchivedThreadsByUserId()`) surfaces them. Two independent actors now write to the same `archivedAt` field for different purposes:

- **Admin** — marks a Thread as reviewed and moves it from the Inbox to the Admin's Archived view.
- **User** — hides a Thread from their active Portal view, moving it to their own Archived section.

## Decision

`archivedAt` is dual-purpose. It is set by both the Admin (review state) and the User (personal hide). No separate `userArchivedAt` field is needed because each view already filters within its own scope:

- The Admin's Inbox/Archived views query all records regardless of who submitted them; the Admin's archive is an inbox-management action.
- The User's Portal and Archived views are scoped to `userId`; the User's archive is a personal-organization action.

The two uses do not conflict in practice because Admin and User views are entirely separate surfaces.

## Consequences

- `archivedAt` semantics differ slightly by context: "reviewed by Admin" vs "hidden by User." Code reading the field must be aware of which scope it is operating in.
- A future feature that needs to distinguish between the two archive types (e.g. show the User that their Thread was reviewed by Admin) should introduce a separate field rather than try to infer meaning from `archivedAt` alone.
- ADR-0005 is superseded by this decision.
- ADR-0006 (cascade to replies) applies to both archive paths: `archiveSubmission` in `dal/admin.ts` and `userArchiveSubmission` in `dal/prospects.ts`.
