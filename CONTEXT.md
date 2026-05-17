# Ozbo1973 Portfolio

A portfolio and contact system for Brady Bovero. Prospects submit inquiries via the contact form; after authenticating via magic link they become Users who can view their submissions in the Portal.

## Language

**Prospect**:
A person who has submitted the contact form. Represented by a `ProspectiveCustomer` record in the database.
_Avoid_: Lead, customer, client, visitor

**User**:
An authenticated identity managed by BetterAuth. A Prospect becomes a User when they click their magic link.
_Avoid_: Account, member, logged-in user

**Submission**:
A single contact form entry by a Prospect. Many Submissions can belong to one User.
_Avoid_: Inquiry, form entry, record

**Portal**:
The authenticated view at `/portal` where a User reviews their Submissions.
_Avoid_: Dashboard, admin, client area

**Magic Link**:
A single-use authentication URL emailed to a Prospect after form submission. Clicking it establishes a User session.
_Avoid_: Login link, auth link

**Session**:
The authenticated state of a User, managed by BetterAuth. Verified server-side via `verifySession()` before any protected data access.
_Avoid_: Token, JWT, auth state

**Sign-In Page**:
The dedicated page at `/sign-in` where an existing User can request a new Magic Link by entering their email. Only Users who already have an account (created via form submission) can authenticate here.
_Avoid_: Login page, auth page

**Parent Submission**:
An optional reference (`parentId`) on a Submission pointing to another Submission. Reserved for future admin threading — unused in the current UI.
_Avoid_: Thread, parent message, reply

**Admin**:
A User with `role: "admin"` (managed by BetterAuth). The single authorized identity allowed to access the Admin Console. Distinct from a regular User.
_Avoid_: Owner, moderator, superuser

**Admin Console**:
The authenticated view at `/admin` where the Admin reviews the Inbox and manages Archived Submissions. Parallel to the Portal but reserved for the Admin.
_Avoid_: Dashboard, admin panel, backoffice

**Inbox**:
The live set of Submissions the Admin has not yet acted on. Implemented as all `ProspectiveCustomer` records not yet archived.
_Avoid_: Unread, pending, queue

**Archived Submission**:
A Submission the Admin has explicitly chosen to archive — a deliberate act marking the Admin's review as done. Distinct from the Submission's own lifecycle (which may still receive future replies via threading). Represented by a non-null `archivedAt` field on the existing `ProspectiveCustomer` record (see ADR-0004).
_Avoid_: Read submission, dismissed submission, closed submission

## Relationships

- A **Prospect** has one or more **Submissions**
- A **Prospect** becomes a **User** by clicking a **Magic Link**
- A **User** can view all their **Submissions** in the **Portal**
- A **Session** belongs to exactly one **User**
- A **Submission** is linked to a **User** via `userId` foreign key (see ADR-0002)
- A **Submission** may optionally reference a **Parent Submission** via `parentId` (future threading)
- Deleting a **User** cascade-deletes all their **Submissions**

## Example dialogue

> **Dev:** "When a Prospect submits the form twice, do they get two magic links?"
> **Domain expert:** "Yes — each Submission triggers a magic link. But once they're a User with an active Session, both Submissions appear in their Portal."

## Invariants

- **Email is always stored lowercase.** Normalization happens at the action entry point (`submitContactForm`, `signIn`) before any DB write or query. Never normalize only at query time.
- **A returning email on the contact form creates a new Submission but not a new User.** BetterAuth reuses the existing User record and sends a fresh Magic Link.
- **Client-side forms use `onSubmit` + `startTransition`.** Never use `form action={asyncFn}` without `startTransition`.

## Flagged ambiguities

- "User" was sometimes used to mean the person filling out the form — resolved: that person is a **Prospect** until authenticated, then a **User**.
