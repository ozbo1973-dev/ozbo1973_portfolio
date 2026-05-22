# Handoff: Implement Reply Notification Emails — Issues #128 and #129

## Next session goal

Implement issues #128 and #129 using TDD on a short-lived `ai/issue-<N>` branch off `feature/conversation-threading_1`, then open PRs back into that feature branch.

Use the workflow:
1. `/git-ai-issue-start` — branch setup
2. `/tdd` — Red → Green → Refactor for each slice
3. Commit with `RALPH:` prefix, close issue with `gh issue close`

---

## Context

### PRD
GitHub Issue #127 — "PRD: Reply Notification Emails"
https://github.com/ozbo1973-dev/ozbo1973_portfolio/issues/127

### Implementation issues

| Issue | Title | Blocked by |
|-------|-------|------------|
| [#128](https://github.com/ozbo1973-dev/ozbo1973_portfolio/issues/128) | feat: Admin Reply notification email (end-to-end) | None — start here |
| [#129](https://github.com/ozbo1973-dev/ozbo1973_portfolio/issues/129) | feat: User Reply notification email (end-to-end) | #128 |

### Branch context
- Feature branch: `feature/conversation-threading_1`
- Work branches to create: `ai/issue-128`, `ai/issue-129`
- PRs target `feature/conversation-threading_1`, never `main`

---

## What was decided (from PRD #127)

| # | Decision |
|---|----------|
| 1 | Every Admin Reply notification includes a fresh Magic Link — even if the User has an active session |
| 2 | Email logic lives in server actions, not DAL functions |
| 3 | New DAL helper `getRootSubmissionOwner(rootId)` in `src/lib/dal/admin.ts` — returns `{ email: string; name: string } \| null` |
| 4 | Admin notification email uses `process.env.NOTIFICATION_EMAIL` as sender — no DB lookup for recipient on admin side |
| 5 | One shared `ReplyNotificationEmail` template — `senderName`, `replyBody`, optional `magicLinkUrl`; sign-in button if magic link present, plain note if not |
| 6 | Magic Link `callbackURL` is `/portal` |
| 7 | Notification failure is fire-and-forget — `console.error` on failure, never surfaces to sender |

---

## Issue #128 — Admin Reply notification (full vertical slice)

**New files:**
- `src/lib/dal/admin.ts` — add `getRootSubmissionOwner(rootId: string)`
- `src/components/reply-notification-email.tsx` — new template (Magic Link path only for this issue)
- `src/lib/contact/sendNotifications.ts` — add `sendReplyNotification({ to, senderName, replyBody, magicLinkUrl? })`
- `src/app/actions/admin/createAdminReply.ts` — wire notification after successful reply

**Admin Reply wiring sequence:**
1. `getRootSubmissionOwner(rootId)` — skip if null
2. `registerMagicLinkCapture(owner.email)` + `auth.api.signInMagicLink({ body: { email: owner.email, callbackURL: "/portal" }, headers: h })`
3. `await urlCapture` to get Magic Link URL
4. Fire-and-forget `sendReplyNotification({ to: owner.email, senderName: adminSession.name, replyBody, magicLinkUrl })`

**Magic Link capture pattern** — already established in `src/lib/auth/actions/signIn.ts`. Replicate exactly.

**Style reference for template** — `src/components/magic-link-email.tsx`

**Tests to write (prior art: `src/lib/dal/__tests__/admin.test.ts`, `src/app/actions/admin/__tests__/createAdminReply.test.ts`):**
- `getRootSubmissionOwner`: found / submission missing / user missing
- `sendReplyNotification`: success / Resend failure / with magic link present
- `createAdminReplyAction`: notification sent / skipped when owner null / action still returns success when notification fails

---

## Issue #129 — User Reply notification (full vertical slice)

**Changes (after #128 is merged):**
- `src/components/reply-notification-email.tsx` — add no-magic-link render path (Admin Console note)
- `src/app/actions/createUserReply.ts` — wire fire-and-forget `sendReplyNotification` after successful reply

**User Reply wiring:**
- `sendReplyNotification({ to: process.env.NOTIFICATION_EMAIL!, senderName: session.name, replyBody: parsed.data.body })`
- No Magic Link
- Failure must never cause `{ success: false }`

**Tests (prior art: `src/app/actions/__tests__/createUserReply.test.ts`):**
- `ReplyNotificationEmail` no-magic-link render path
- `createUserReplyAction`: notification sent / action succeeds when notification fails

---

## Key files

| File | Role |
|------|------|
| `src/lib/dal/admin.ts` | Add `getRootSubmissionOwner` |
| `src/app/actions/admin/createAdminReply.ts` | Wire Admin notification |
| `src/app/actions/createUserReply.ts` | Wire User notification |
| `src/lib/contact/sendNotifications.ts` | Add `sendReplyNotification` |
| `src/components/reply-notification-email.tsx` | New shared email template |
| `src/lib/auth/auth.ts` | `registerMagicLinkCapture` — no changes needed |
| `src/components/magic-link-email.tsx` | Style reference |
| `src/lib/dal/__tests__/admin.test.ts` | Prior art for DAL tests |
| `src/app/actions/admin/__tests__/createAdminReply.test.ts` | Prior art for action tests |

---

## Domain language

- **Reply** — Submission with non-null `parentId`
- **Thread** — Root Submission + all Replies
- **User** — authenticated identity (not "customer")
- **Admin** — User with `role: "admin"`
- **Magic Link** — single-use auth URL (not "login link")
- **Portal** — `/portal`
- **Admin Console** — `/admin`

---

## Suggested skills for next session

1. `git-ai-issue-start` — set up `ai/issue-128` off `feature/conversation-threading_1`
2. `/tdd` — Red → Green → Refactor for each slice
3. After #128 PR merged: repeat for #129
