Understood. Below is the **final, Markdown-friendly User Model — MVP Contract Report only**, aligned with the **already locked Society and Apartment contracts**.

This is written as a **canonical reference document** you can keep in your repo.

---

# User Model — MVP Contract Report

- **Status:** Locked
- **Depends on:** Society (tenant boundary), Apartment (physical locator)
- **Auth Provider:** Clerk (authentication only)

---

## 1. Role of User in the MVP

In the MVP, **User is the sole authority and behavior carrier**.

User answers:

1. *Who is acting?*
2. *What are they allowed to do?*
3. *Within which society does their authority apply?*
4. *Optionally, which apartment are they associated with?*

> **All authorization decisions are made using the User model.**

---

## 2. Core Design Rules (Non-Negotiable)

* Authentication is handled **only by Clerk**
* Backend owns **all authorization logic**
* Society is the **tenant boundary**
* Apartment is a **physical locator**
* User stores **no secrets**
* User authority never leaks into Society or Apartment

---

## 3. Final User Schema — MVP (Authoritative)

```ts
User {
  clerkUserId: string        // Auth identity (unique)
  fullName: string           // Display-only
  email: string              // Display / filtering only
  role: "resident" | "admin" | "guard"
  societyId: ObjectId        // Tenant boundary
  apartmentId?: ObjectId     // Physical association (role-based)
  isActive: boolean          // Soft control
  timestamps
}
```

---

## 4. Field-by-Field Justification

### `clerkUserId` (Required)

**What:**
Unique identifier from Clerk.

**Why:**

* Single source of authentication truth
* Stable identity mapping
* Decouples auth provider from business logic

**Rules:**

* Must be unique
* Indexed
* Never nullable

---

### `fullName` (Required)

**What:**
Human-readable display name.

**Why:**

* Used in UI, admin dashboards, complaints
* No business logic depends on it

**Notes:**

* Not validated against any external system
* Display-only

---

### `email` (Required)

**What:**
User email (denormalized from Clerk).

**Why:**

* Admin visibility
* Filtering and search
* Display purposes

**Rules:**

* Not used for authentication
* Clerk remains the source of truth

---

### `role` (Required)

```ts
"resident" | "admin" | "guard"
```

**Why these roles only:**

* `resident` → primary product user
* `admin` → RWA / society authority
* `guard` → visitor logging

**Explicitly Excluded:**

* Owner vs tenant split
* Manager hierarchies
* Role trees

These add governance complexity without MVP value.

---

### `societyId` (Required)

**What:**
Tenant boundary reference.

**Why:**

* Every user must belong to exactly one society
* Enables strict data isolation
* Required for all authorization checks

---

### `apartmentId` (Optional)

**What:**
Physical association to an apartment.

**Why:**

* Residents need it
* Guards and admins do not

**Rules (Enforced in Service Layer):**

* `resident` → **must have** `apartmentId`
* `admin` → **must not require** `apartmentId`
* `guard` → **must not require** `apartmentId`

---

### `isActive` (Default: true)

**What:**
Soft-deactivation flag.

**Why:**

* Operational control
* Safe alternative to deletes
* No auth coupling

---

## 5. Explicitly Excluded From User (MVP)

❌ Passwords <br>
❌ OAuth tokens <br>
❌ Contact numbers <br>
❌ Address data <br>
❌ Role hierarchies <br>
❌ Cross-society membership <br>
❌ Ownership or tenancy proofs <br>

**Reason:**
All of the above either belong to Clerk, future governance layers, or non-MVP features.

---

## 6. Authorization Invariants (Must Always Hold)

* User authority is scoped **only by `societyId`**
* No user acts outside their society
* Apartment never grants authority
* Society never embeds authority
* All permissions resolve from `User.role`

---

## 7. Future Expansion (Safe, Non-Breaking)

This model supports future growth without refactor:

### Phase 2

* Role metadata
* Soft role expansion (e.g., staff types)

### Phase 3

* Fine-grained permissions
* Tower-scoped roles (when Tower becomes an entity)

**Core identity remains unchanged.**

---

## 8. Final Contract Statement

* User is the **only authority holder**
* Clerk is the **only authentication provider**
* No secrets are stored
* Tenant boundaries are explicit
* Physical location is optional and role-based
* This User model will **not require refactoring** as the product grows

**User Model — MVP Contract is now locked.**

---

If you want, next we can:

* Freeze **authorization rules** (action × role × scope)
* Design **Complaint schema** against this contract
* Design **Visitor schema** (guard-centric)

Say the next step.
