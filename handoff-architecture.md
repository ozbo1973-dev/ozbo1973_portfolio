# Handoff: Architecture Refactor — Candidates 1 & 3 (Revised)

## Focus for next session

Implement two architectural fixes. Both have been grilled and the design is locked. Commit slicing is deferred — handle in the implementation session.

This revision supersedes the prior handoff. It captures bugs discovered during grilling that the original plan missed, and resolves a domain contradiction (ADR-0005 vs. shipped User-side archive).

---

## Candidate 1 — DAL is the session verification boundary

### Principle

The DAL owns session verification. Actions are thin wrappers — they do not call `verifySession()` and do not thread `userId` into DAL calls. There is exactly one security boundary for user-scoped data, and it lives in the DAL.

Exception: a small set of functions are called from trusted server paths where session verification is either impossible (pre-authentication) or inappropriate (auth-system cascade). These live in a separately-named file so the boundary is explicit.

### File layout (post-refactor)

| File | Role |
|------|------|
| `src/lib/dal/session.ts` | New. Holds `verifySession` (moved from `prospects.ts`). |
| `src/lib/dal/prospects.ts` | Session-verified DAL. Every function calls `verifySession()` internally. |
| `src/lib/dal/prospects-unverified.ts` | New. Holds `updateProspectUserId` + `deleteAllSubmissionsByUser`. Header docstring explains both unverified cases with ADR references. |
| `src/lib/dal/index.ts` | **Deleted.** |
| `src/lib/dal/admin.ts` | Unchanged in this refactor. Already uses `verifyAdminSession`. |
| `src/lib/dal/users.ts` | Import path updated for `deleteAllSubmissionsByUser`. |

### Function-level changes

**Move + tighten (signatures lose `userId`):**

- `deleteSubmission` → `prospects.ts`. Calls `verifySession()`. New signature: `deleteSubmission(id)`.
- `userArchiveSubmission` → `prospects.ts`. Calls `verifySession()`. New signature: `userArchiveSubmission(id)`.
- `getArchivedThreadsByUserId` → `prospects.ts`. Calls `verifySession()`. New signature: `getArchivedThreadsByUserId()`.

**Move (unverified, intentional):**

- `updateProspectUserId` → `prospects-unverified.ts`. No session check. Justified by ADR-0003 (pre-auth magic-link capture).
- `deleteAllSubmissionsByUser` → `prospects-unverified.ts`. No session check. Justified as auth-system cascade (called from `users.ts::deleteUser`).

**Delete:**

- `getSubmissionsByUserId(userId)` in `dal/index.ts` — duplicate of the session-aware version in `prospects.ts`. Remove.
- `dal/index.ts` itself — empty after the moves above. Delete the file.

**Move `verifySession`:**

- `verifySession` → `src/lib/dal/session.ts`. Every caller updates its import. `prospects.ts` no longer exports it.

### Bugs discovered during grilling — fix in the same commits as the moves

**Bug 1: `userArchiveSubmission` ignores ownership.**
Current code accepts `_userId` (underscore-prefixed, never used). Any authenticated user can archive any Submission by ID. Fix as part of the move:

```ts
export async function userArchiveSubmission(id: string): Promise<void> {
  const { userId } = await verifySession();
  await connectDB();
  const archivedAt = new Date();
  const root = await ProspectiveCustomer.findOneAndUpdate(
    { _id: id, userId },
    { archivedAt },
  );
  if (!root) return; // not owned; silent no-op
  await ProspectiveCustomer.updateMany({ parentId: id }, { archivedAt });
}
```

Note: the reply cascade is **not** scoped by `userId`. Per ADR-0006, the Thread is archived as a unit — Admin Replies under the User's Root must also receive `archivedAt`. Ownership is enforced on the root only.

**Bug 2: `deleteSubmission` orphans User replies.**
ADR-0007 line 13 specifies that deleting a Root cascades to User Replies. Current code only deletes the root. Fix as part of the move:

```ts
export async function deleteSubmission(id: string): Promise<DeleteSubmissionOutcome> {
  const { userId } = await verifySession();
  await connectDB();
  const adminReplies = await ProspectiveCustomer.find({
    parentId: id,
    userId: { $ne: userId },
  });
  if (adminReplies.length > 0) return { deleted: false, blocked: true };
  const deleted = await ProspectiveCustomer.findOneAndDelete({ _id: id, userId });
  if (!deleted) return { deleted: false };
  await ProspectiveCustomer.deleteMany({ parentId: id, userId });
  return { deleted: true };
}
```

`{ parentId: id, userId }` on the cascade is belt-and-suspenders: the blocked-check already established no non-user replies exist, but scoping defends against an Admin-reply race.

### Action call sites — simplification

Actions become thin wrappers. No `verifySession()` call. No `userId` parameter. Examples:

```ts
// deleteSubmission.ts (post-refactor)
"use server";
import { deleteSubmission } from "@/lib/dal/prospects";
export async function deleteSubmissionAction(id: string): Promise<DeleteSubmissionResult> {
  const outcome = await deleteSubmission(id);
  if ("blocked" in outcome && outcome.blocked) {
    return { success: false, blocked: true, error: "Cannot delete: admin replies exist. Archive instead." };
  }
  if (!outcome.deleted) return { success: false, error: "Submission not found" };
  return { success: true };
}
```

```ts
// archiveSubmission.ts (post-refactor)
"use server";
import { userArchiveSubmission } from "@/lib/dal/prospects";
export async function archiveSubmissionAction(id: string): Promise<ArchiveSubmissionResult> {
  try {
    await userArchiveSubmission(id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to archive submission." };
  }
}
```

### Callers to update (imports)

- `src/app/actions/deleteSubmission.ts` — remove `verifySession()` call; import `deleteSubmission` from `dal/prospects`
- `src/app/actions/archiveSubmission.ts` — remove `verifySession()` call; import `userArchiveSubmission` from `dal/prospects`
- `src/app/portal/page.tsx` — import `verifySession`, `getThreadsByUserId`, `getArchivedThreadsByUserId` all from `dal/prospects` (or `dal/session` for `verifySession`); update call to `getArchivedThreadsByUserId()` (no arg)
- `src/app/portal/_components/PortalContent.tsx` — `ProspectRecord` from `dal/prospects`
- `src/app/portal/_components/NewRequestForm.tsx` — `ProspectRecord` from `dal/prospects`
- `src/app/actions/submitPortalRequest.ts` — `createProspect` from `dal/prospects`
- `src/lib/dal/users.ts` — `deleteAllSubmissionsByUser` from `dal/prospects-unverified`
- `src/app/actions/submitContactForm.ts` — `updateProspectUserId` from `dal/prospects-unverified`
- Any other caller of `verifySession` — repoint to `dal/session`

### Tests

- Mock `verifySession` directly (`vi.mock("@/lib/dal/session", ...)`) in DAL unit tests. Keeps tests focused on the Mongo query shape rather than session plumbing.
- Add one "no-session redirects" test per session-verified DAL function — locks the security guarantee in against future regression.
- Update `src/lib/dal/__tests__/index.test.ts` (or relocate to `prospects.test.ts`).

---

## Candidate 3 — `getUserByEmail` consolidation

### Decision

Three near-identical functions in `src/lib/auth/getUserIdByEmail.ts` collapse to one. Each currently opens its own `MongoClient`.

**Replace with:**

```ts
// src/lib/auth/getUserByEmail.ts (file renamed)
import { db } from "@/lib/auth/auth";
import { ObjectId } from "mongodb";

export async function getUserByEmail(
  email: string,
): Promise<{ id: string; role: string | null; emailVerified: boolean } | null> {
  const user = await db.collection("user").findOne({ email });
  if (!user) return null;
  return {
    id: user._id.toString(),
    role: (user.role as string) ?? null,
    emailVerified: Boolean(user.emailVerified),
  };
}
```

- Reuses the `db` instance exported from `src/lib/auth/auth.ts:7` — same client BetterAuth uses. No new `MongoClient`.
- Returns the full shape on every call. Callers destructure what they need.
- Caller-side email normalization stays as-is (CONTEXT.md invariant — DAL does not re-normalize).
- File renamed: `getUserIdByEmail.ts` → `getUserByEmail.ts`.

### Callers to update

- `src/app/actions/submitContactForm.ts` — was using `getUserByEmail` (id, emailVerified). New shape includes `role` too; ignore it.
- `src/lib/auth/actions/signIn.ts` — was using `getUserIdAndRoleByEmail`. Destructure `{ id, role }` from the new shape.
- `src/app/actions/__tests__/submitContactForm.test.ts` — mock shape change.
- `src/lib/auth/__tests__/signIn.test.ts` — mock shape change.

---

## Documentation changes

### New ADRs

**ADR-0009: DAL is the session verification boundary.**
Documents the rule: session-verified DAL functions own `verifySession()`; actions do not re-verify. Exception path is `prospects-unverified.ts`. Consequences section references ADR-0003 (pre-auth case) and ADR-0008 (magic-link capture).

**ADR-0010: `archivedAt` is dual-purpose** (supersedes ADR-0005).
ADR-0005 said archive is admin-private. The shipped Portal contradicts this: Users can archive their own Threads (`userArchiveSubmission`, `getArchivedThreadsByUserId`, Portal Archived section). This ADR records that:

- `archivedAt` is set by **both** Admin (review state) and User (personal hide)
- Admin's Inbox/Archived views filter on `archivedAt` against all Submissions
- User's Portal active/Archived views filter on `archivedAt` scoped to their own Submissions
- The field is overloaded by design; there is no need to separate `userArchivedAt` because each view filters within its own scope

### ADR touch-ups

**ADR-0003** — update the "Decision" section to reference the new file location: `updateProspectUserId` now lives in `src/lib/dal/prospects-unverified.ts`. The reasoning is unchanged.

**ADR-0006** — line 13 references `src/lib/dal/admin.ts` for the cascade. Add a note that the cascade also lives in `src/lib/dal/prospects.ts::userArchiveSubmission` for the User-side archive (per ADR-0010).

### CONTEXT.md

Add to the **Invariants** section:

> **The DAL is the session verification boundary for user-scoped data.** Functions in `dal/prospects.ts` call `verifySession()` internally; actions do not re-verify. The exception is `dal/prospects-unverified.ts`, which holds functions called from trusted server paths (magic-link capture, user cascade delete) — see ADR-0009.

No new glossary terms — "session-verified DAL" is implementation language, not domain language.

---

## Implementation order

1. **Candidate 3 first** — smaller, self-contained, no security implications.
2. **Candidate 1 second** — larger, security-sensitive.

Commit slicing for Candidate 1 is deferred to the implementation session. Run `pnpm lint` and `pnpm build` after each candidate.

---

## What was ruled out (do not re-litigate)

- **Candidate 2 — `submitContactForm` orchestration / `pendingCaptures` Map**: ADR-0008. The Map is load-bearing.
- **Candidate 4 — NavigationContext DOM coupling**: Already well-structured.
- **Candidate 5 — In-memory rate limiter seam**: Single-instance app, hypothetical seam.
- **Defense-in-depth at the action layer** (action calls `verifySession()` *and* DAL calls `verifySession()`): rejected. The DAL is the single authoritative boundary. Two boundaries teach future code that both are load-bearing, which is how the current dualism arose.
- **Splitting `prospects-unverified.ts` into per-reason files**: rejected at two functions; revisit if a third unverified function appears that doesn't fit either existing reason.
- **Separate `userArchivedAt` field**: rejected. View-scope filtering on a shared `archivedAt` is sufficient.

---

## Out of scope but flagged

- `dal/admin.ts` has not been refactored for parallel structure. It uses `verifyAdminSession` already, so the security boundary is intact, but the file is larger than necessary. Separate session.
- An "unarchive" feature for either Admin or User would need to revisit ADR-0006's cascade (currently one-way). No work needed unless that feature is requested.
