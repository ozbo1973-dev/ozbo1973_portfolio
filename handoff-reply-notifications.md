# Handoff: Reply Notification Emails — PRD + GitHub Issues

## Next session goal

Convert the finalized design (below) into a PRD and GitHub Issues ready for implementation. Use `/to-prd` then `/to-issues`.

---

## What was decided

A grilling session (`/grill-with-docs`) produced a fully-resolved design for sending notification emails when Admin or User posts a Reply in a Thread.

### Feature summary

When the **Admin** posts a Reply, the **User** receives a notification email containing:
- Admin's name
- Reply body
- A Magic Link (single-use, 24hr, `callbackURL: "/portal"`) so the User can sign in and view the Thread

When a **User** posts a Reply, the **Admin** receives a notification email containing:
- User's name
- Reply body
- A note to check the Admin Console (no Magic Link — Admin authenticates separately)

---

## Finalized design decisions (all grilling questions resolved)

| # | Decision |
|---|----------|
| 1 | Every Admin Reply notification includes a fresh Magic Link — even if the User has an active Session |
| 2 | Email logic lives in **server actions**, not DAL functions |
| 3 | New DAL helper `getRootSubmissionOwner(rootId)` added to `src/lib/dal/admin.ts` — returns `{ email: string; name: string } | null` using shared `db` + `ObjectId` (already imported) |
| 4 | Admin notification email uses `process.env.NOTIFICATION_EMAIL` — no DB lookup needed |
| 5 | One shared `ReplyNotificationEmail` template — accepts `senderName`, `replyBody`, optional `magicLinkUrl`; renders sign-in button if magic link present, plain note if not |
| 6 | Magic Link `callbackURL` is `/portal` (not a deep link to the Thread) |
| 7 | Notification failure is fire-and-forget — `console.error` on failure, never surfaces to sender |
| 8 | `getRootSubmissionOwner` shape: `Promise<{ email: string; name: string } | null>` |

---

## Implementation scope (3 steps)

### Step 1 — DAL helper
**File:** `src/lib/dal/admin.ts`
- Add `getRootSubmissionOwner(rootId: string): Promise<{ email: string; name: string } | null>`
- Find Root Submission by `rootId`, then query `db.collection("user").findOne({ _id: new ObjectId(submission.userId) })`
- Return `null` if submission or user not found

### Step 2 — Email template
**File:** `src/components/reply-notification-email.tsx` (new)
- Props: `senderName: string`, `replyBody: string`, `magicLinkUrl?: string`
- If `magicLinkUrl` present: render sign-in button (match style of `magic-link-email.tsx`)
- If not: render "Log in to the Admin Console to respond" note

### Step 3a — Wire into `createAdminReplyAction`
**File:** `src/app/actions/admin/createAdminReply.ts`
After `createAdminReply(...)` succeeds:
1. Call `getRootSubmissionOwner(rootId)` — if null, skip notification
2. `registerMagicLinkCapture(owner.email)` + `auth.api.signInMagicLink({ body: { email: owner.email, callbackURL: "/portal" }, headers: h })`
3. `await urlCapture` to get Magic Link URL
4. Fire-and-forget: `sendReplyNotification({ to: owner.email, senderName: adminSession.name, replyBody, magicLinkUrl })`

### Step 3b — Wire into `createUserReplyAction`
**File:** `src/app/actions/createUserReply.ts`
After `createUserReply(...)` succeeds:
1. Fire-and-forget: `sendReplyNotification({ to: process.env.NOTIFICATION_EMAIL!, senderName: session.name, replyBody: parsed.data.body })`

### Step 3c — Add `sendReplyNotification` to `sendNotifications.ts`
**File:** `src/lib/contact/sendNotifications.ts`
- New export: `sendReplyNotification({ to, senderName, replyBody, magicLinkUrl? })`
- Fire-and-forget pattern matching `sendNotifications`

---

## Key files

| File | Role |
|------|------|
| `src/lib/dal/admin.ts` | Add `getRootSubmissionOwner` |
| `src/lib/dal/prospects.ts` | `createUserReply` — no changes needed |
| `src/app/actions/admin/createAdminReply.ts` | Wire notification (Step 3a) |
| `src/app/actions/createUserReply.ts` | Wire notification (Step 3b) |
| `src/lib/contact/sendNotifications.ts` | Add `sendReplyNotification` (Step 3c) |
| `src/components/reply-notification-email.tsx` | New email template (Step 2) |
| `src/lib/auth/auth.ts` | `registerMagicLinkCapture` — no changes needed |
| `src/components/magic-link-email.tsx` | Style reference for new template |
| `CONTEXT.md` | Domain glossary — use canonical terms |

---

## Domain language (from CONTEXT.md)

Use these terms precisely in the PRD and issues:
- **Reply** — a Submission with non-null `parentId`
- **Thread** — Root Submission + all Replies
- **User** — authenticated identity (not "customer" or "client")
- **Admin** — User with `role: "admin"`
- **Magic Link** — single-use auth URL (not "login link")
- **Portal** — `/portal` (not "dashboard")
- **Admin Console** — `/admin` (not "admin panel")

---

## Suggested skills for next session

1. `/to-prd` — generate PRD from this handoff context
2. `/to-issues` — break PRD into independently-grabbable GitHub Issues

---

## Branch context

Current branch: `feature/conversation-threading_1`
Recent commits: see `git log` — threading feature is in progress; this notification work extends it.
