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

## Relationships

- A **Prospect** has one or more **Submissions**
- A **Prospect** becomes a **User** by clicking a **Magic Link**
- A **User** can view all their **Submissions** in the **Portal**
- A **Session** belongs to exactly one **User**
- A **Submission** is linked to a **User** via `userId` foreign key (see ADR-0002)

## Example dialogue

> **Dev:** "When a Prospect submits the form twice, do they get two magic links?"
> **Domain expert:** "Yes — each Submission triggers a magic link. But once they're a User with an active Session, both Submissions appear in their Portal."

## Flagged ambiguities

- "User" was sometimes used to mean the person filling out the form — resolved: that person is a **Prospect** until authenticated, then a **User**.
