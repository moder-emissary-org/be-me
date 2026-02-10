## Agenda

1. Purpose of the `/me` Route
2. Role of `/me` in the Authority-First MVP Architecture
3. What Problems `/me` Solves
4. Core Responsibilities of the `/me` Route
5. Response Composition (What `/me` Must Return)
6. Explicit Non-Responsibilities (What `/me` Must Never Return)
7. Canonical MVP Response Contract
8. Why `/me` Must Be Finalized Before Any Other Routes
9. Final Decision Summary

---

## 1. Purpose of the `/me` Route

The `/me` route exists to **resolve the authenticated caller into a concrete, backend-owned identity with authority and scope**.

It answers a single, critical question:

> “Given a valid Clerk-authenticated request, who is this user in our system and what are they allowed to do?”

This route is **foundational infrastructure**, not a feature.

---

## 2. Role of `/me` in the Authority-First MVP Architecture

In the MVP, authentication is handled by **Clerk**, but **authorization and identity ownership live entirely in the backend**.

The `/me` route is the **bridge** between:

* External identity (Clerk)
* Internal authority (MongoDB-backed User model)
* Tenant boundary (Society)

Every downstream API, UI layout, and permission decision implicitly depends on the correctness and stability of this route.

---

## 3. What Problems `/me` Solves

The `/me` route eliminates several systemic problems early:

* Prevents frontend guessing about user role or scope
* Avoids duplicating identity resolution across APIs
* Centralizes authority derivation
* Provides a single source of truth for “current user”
* Enables deterministic UI routing and API behavior

Without `/me`, every route becomes ambiguous and fragile.

---

## 4. Core Responsibilities of the `/me` Route

The `/me` route has **exactly four responsibilities**:

1. Resolve the internal User using `clerkUserId`
2. Return the user’s **authority** (role and derived permissions)
3. Return the user’s **scope** (society and apartment context)
4. Communicate basic **system state flags**

It must do **nothing else**.

---

## 5. Response Composition (What `/me` Must Return)

### A. Identity (Backend-Owned)

Purpose: Identify *who* the caller is internally.

Required:

* Internal user ID
* Clerk user ID
* Role
* Active status

Optional (only if already stored):

* Name
* Email

This data is **not UI profile data**; it is operational identity.

---

### B. Authority

Purpose: Define *what the user can do*.

Required:

* Role (`admin | resident | guard`)

Recommended:

* Derived permissions array

Permissions are returned even if enforcement is still role-based. This future-proofs the frontend and avoids contract changes.

---

### C. Scope / Tenant Context

Purpose: Define *where the user operates*.

Required:

* Society ID
* Society name

Conditional:

* Apartment reference (residents only)

This ensures every action is implicitly society-scoped and prevents cross-tenant ambiguity.

---

### D. System & Lifecycle Flags

Purpose: Communicate backend state relevant to access and flow control.

Recommended:

* `isActive`
* `onboardingComplete`

These flags allow safe short-circuiting of flows without introducing new endpoints later.

---

## 6. Explicit Non-Responsibilities (What `/me` Must Never Return)

The `/me` route must **never** include:

* Other users
* Lists of apartments
* Society configuration or settings
* Feature flags
* Visitor data
* UI configuration
* Anything requiring additional authorization logic

If additional data is needed, it belongs in a **separate, role-protected endpoint**.

---

## 7. Canonical MVP Response Contract (Conceptual)

The response must be **stable, minimal, and boring**.

Conceptual structure:

```json
{
  user: {
    id,
    clerkUserId,
    name?,
    role,
    isActive
  },
  authority: {
    role,
    permissions[]
  },
  scope: {
    society: {
      id,
      name
    },
    apartment: null | { id, label }
  },
  meta: {
    onboardingComplete
  }
}
```

This contract is intentionally flat, readable, and predictable.

---

## 8. Why `/me` Must Be Finalized Before Any Other Routes

Finalizing `/me` early enables:

* Deterministic frontend layout and navigation
* Clean role-based routing in Next.js
* Simplified controller logic everywhere else
* Elimination of identity resolution duplication
* Stable contracts across the entire MVP

Any route built before `/me` is finalized risks rework.

---

## 9. Final Decision Summary

* `/me` is an **identity + authority resolution endpoint**
* It is **not** a profile or data aggregation endpoint
* Its response is intentionally minimal and stable
* It must be implemented **once and frozen** for the MVP
* All other routes may safely depend on it

This route forms the **root of trust** for the entire system.

---

When you’re ready, the correct next step is:

* Define the **service-layer contract** for resolving the current user
* Only then write the controller (thin, unsurprising, ≤20 lines)

Say the word and we’ll lock the service contract next.
