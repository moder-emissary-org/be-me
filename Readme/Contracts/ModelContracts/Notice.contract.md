# Notice Model — MVP Contract Report

> **Status:** Finalized & Locked
> **Criticality:** Medium (Informational, Non-Operational)
> **Depends on:** Society, User
> **Primary Operator:** Admin
> **Audience:** Residents (read-only)

---

## 1. Role of Notice in the MVP

In the MVP, a **Notice represents a society-wide informational announcement** published by an admin for residents.

It exists to answer:

1. What information does the society want to communicate?
2. Who published it?
3. Which society does it belong to?
4. Is it currently visible?

> Notice is a **broadcast information object**, not a workflow, alert, or communication channel.

---

## 2. What Notice Is (And Is Not)

### Notice **IS**

* A society-scoped announcement
* Admin-created and admin-controlled
* Read-only for residents
* Pull-based (user opens app to read)

### Notice **IS NOT**

* A notification system
* A message or chat
* A targeted delivery mechanism
* A confirmation or acknowledgement flow
* A legal or governance record

---

## 3. Final Notice Schema (MVP)

```ts
Notice {
  title: string
  body: string

  societyId: ObjectId
  createdBy: ObjectId   // User (admin)

  isActive: boolean
  timestamps
}
```

---

## 4. Field Definitions — What & Why

### `title`

**What:**
Short, human-readable headline.

**Why:**
Supports quick scanning and list views.

---

### `body`

**What:**
Full notice content.

**Why:**
Sufficient for all common society announcements in MVP.

---

### `societyId`

**What:**
Tenant boundary reference.

**Why:**

* Ensures strict data isolation
* Enables efficient society-scoped reads

---

### `createdBy`

**What:**
User who created the notice (admin).

**Why:**
Auditability and ownership trace.

---

### `isActive`

**What:**
Visibility flag.

**Why:**

* Allows hiding without deletion
* Preserves historical records
* Avoids destructive operations in MVP

---

### `timestamps`

**What:**
Creation and update times.

**Why:**
Sorting, freshness, and audit safety.

---

## 5. Authorization & Behavioral Rules (Implied)

* Only **admins** can create notices
* Only **admins** can update notices
* Residents can **read only**
* Guards have **no access**
* Notices are always scoped to exactly one society
* Notices are never deleted in MVP

(Enforced in service logic.)

---

## 6. Explicitly Out of Scope (MVP)

* Push notifications
* WhatsApp / SMS delivery
* Targeting by apartment or role
* Read receipts or acknowledgements
* Attachments or media
* Expiry or scheduling logic

These are intentionally excluded to maintain MVP stability.

---

## 7. Future Considerations (Non-Breaking)

This model is designed to expand safely.

### Phase 2

* Expiry timestamps
* Priority levels
* Attachments
* Read tracking

### Phase 3

* Targeted notices
* Notification delivery
* Analytics and engagement metrics

**Core Notice identity and broadcast nature remain unchanged.**

---

## 8. Final Contract Statement

* Notice is a **non-operational informational model**
* It is admin-controlled and resident-read-only
* It avoids delivery guarantees or workflow semantics
* It composes cleanly with Society and User
* It will not require refactoring as features grow

**Notice Model — MVP Contract is now finalized and locked.**

---

Next logical lock (recommended):
**Complaint Authorization Contract** or
**System-wide Authorization Matrix (role × action × scope)**
