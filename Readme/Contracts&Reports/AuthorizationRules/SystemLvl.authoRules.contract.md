# System-Level Authorization — MVP Discussion Layer

> **Level:** Cross-model
> **Purpose:** Define how authorization is evaluated globally
> **Applies To:** All domain models
> **Enforced By:** Backend only

---

## 1. Core Authorization Philosophy (System-Wide)

### 1.1 Backend Is the Final Authority

* Clerk handles **authentication only**
* Backend resolves **internal User**
* Backend enforces **all authorization**
* Client checks are **UX hints only**

There is no exception to this.

---

## 2. Society as the Primary Authorization Boundary

### 2.1 Society Is the Root Scope

Every authorization decision starts with:

```text
user.societyId === resource.societyId
```

If this fails:

* Access is denied immediately
* No role checks are evaluated
* No partial reads are allowed

Society is a **hard tenant wall**, not a soft filter.

---

## 3. Role-Based Authority Is Contextual, Not Global

Roles (`admin`, `resident`, `guard`) do **not** grant blanket permissions.

Permissions are evaluated as:

```text
role × action × resource × scope
```

Example:

* A guard may create Visitors
* The same guard may not read Complaints
* A resident may approve Visitors but not create them

Roles are **interpreted per model**, not system-wide.

---

## 4. Ownership vs Authority (Critical Distinction)

### Ownership

* Based on **relationship** (e.g., resident → apartment)
* Grants **limited, contextual rights**

### Authority

* Based on **role** (e.g., admin)
* Grants **broader but still scoped rights**

Example:

* Resident owns complaints from their apartment
* Admin has authority over all complaints in society

Ownership never crosses society boundaries.

---

## 5. Immutable vs Mutable Fields (Global Rule)

Across all models:

### Immutable After Creation

* `societyId`
* `createdBy`
* Foreign keys defining scope (`apartmentId`, `userId`)

### Mutable Only via Authorized Actions

* Status fields
* Visibility flags
* Operational timestamps

This prevents privilege escalation via updates.

---

## 6. Action Classes (System Vocabulary)

All actions fall into one of these buckets:

1. **Create** – introduce a new entity
2. **Read** – fetch or list entities
3. **Update** – mutate allowed fields
4. **Transition** – move between states (status changes)
5. **Soft Hide** – visibility control (e.g., `isActive`)
6. **Delete** – forbidden in MVP

Each model defines which roles can perform which classes.

---

## 7. State Transitions Are More Restricted Than Updates

A key system rule:

> **Not all updates are equal.**

* Editing text ≠ changing status
* Changing status implies **real-world effects**
* Status transitions require **stronger authorization**

This applies especially to:

* Visitor
* Complaint

---

## 8. Guardrails Against Accidental Privilege Expansion

### 8.1 No Cross-Role Implicit Permissions

* Admin does not auto-inherit resident rights
* Guard does not inherit admin rights
* Each role’s permissions are explicit

### 8.2 No Cross-Model Permission Bleed

* Permission on Visitor does not imply permission on Complaint
* Permission on Apartment does not imply permission on Society

---

## 9. System-Wide Denial Defaults

If a rule is not explicitly allowed:

* It is denied
* There are no “assumed” permissions
* No silent fallbacks

Authorization is **opt-in, not opt-out**.

---

## 10. Enforcement Order (Canonical)

Every request follows this order:

1. Authenticate (Clerk)
2. Resolve internal User
3. Validate user is active
4. Enforce society boundary
5. Enforce role-based permission
6. Enforce ownership (if applicable)
7. Enforce action-specific rules
8. Execute business logic

Skipping any step is a bug.

---

## 11. Why This Matters

This system-level layer ensures:

* Models stay simple
* Authorization logic stays centralized
* No future feature accidentally breaks isolation
* New models can plug in safely

This is the **bedrock** on which individual model contracts sit.

---

### Next Natural Step (When You’re Ready)

Freeze this into a **System Authorization Contract**, then express it as:

* A **role × action × model matrix**
* Or **policy-style rules (pseudo-code)**

Say how you want to proceed.
