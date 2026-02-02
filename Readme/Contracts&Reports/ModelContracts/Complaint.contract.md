Below is the **final, Markdown-friendly Complaint Model — MVP Contract Summary**, written as a **locked, authoritative document**.
There is **no comparison**, **no review language**, and **no alternatives**—only **what it is, why it exists, and how it safely expands later**.

---

# Complaint Model — MVP Contract

- **Status:** Finalized & Locked
- **Depends on:** Society, Apartment, User
- **Primary Value Object:** Yes (core MVP feature)

---

## 1. Role of Complaint in the MVP

In the MVP, a **Complaint represents a single issue raised by a resident** within a society.

It exists to answer:

1. What problem was reported?
2. Who reported it?
3. Where did it occur?
4. What is its current resolution state?

A Complaint is a **workflow-tracked record**, not a conversation or task system.

---

## 2. Final Complaint Schema (MVP)

```ts
Complaint {
  title: string
  description: string
  status: "open" | "in_progress" | "resolved"
  priority: "low" | "medium" | "high"
  userId: ObjectId
  societyId: ObjectId
  apartmentId: ObjectId
  timestamps
}
```

---

## 3. Field Definitions — What & Why

### `title`

**What:**
Short, human-readable summary of the issue.

**Why:**
Allows quick scanning by admins and clear identification in lists.

---

### `description`

**What:**
Detailed explanation of the complaint.

**Why:**
Core content required for understanding and resolution.

---

### `status`

**What:**
Current lifecycle state of the complaint.

```text
open → in_progress → resolved
```

**Why:**
Tracks resolution progress without introducing governance complexity.

---

### `priority`

**What:**
Relative urgency indicator.

**Why:**
Enables basic sorting and attention management without enforcing workflows.

---

### `userId`

**What:**
Reference to the user who raised the complaint.

**Why:**
Establishes ownership, accountability, and permission checks.

---

### `societyId`

**What:**
Tenant boundary reference.

**Why:**
Ensures strict data isolation and enables efficient society-scoped queries.

---

### `apartmentId`

**What:**
Physical location associated with the complaint.

**Why:**
Provides concrete context and ensures every complaint maps to a unit.

---

### `timestamps`

**What:**
Automatic creation and update times.

**Why:**
Auditability, debugging, and operational clarity.

---

## 4. Authorization & Behavioral Rules (Implied)

* Only **residents** can create complaints
* Complaints are always scoped to **one society**
* Complaints are always tied to **one apartment**
* Only **admins** can update complaint status
* No cross-society access is allowed

(Enforced in service logic, not schema.)

---

## 5. Explicitly Out of Scope (MVP)

* Comment threads
* Attachments or images
* Admin assignment
* Categories or tags
* Notifications or messaging
* SLA or escalation logic

These are intentionally excluded to keep the MVP focused and stable.

---

## 6. Future Add-Ons (Non-Breaking)

This contract is designed to expand safely:

### Phase 2

* Admin remarks
* Categories
* Read-only history log

### Phase 3

* Attachments
* Assignment workflows
* Tower- or block-specific filtering
* Analytics and reporting

**The core Complaint identity and relationships remain unchanged.**

---

## 7. Final Contract Statement

* Complaint is the **primary MVP value object**
* It is tightly scoped, tenant-safe, and behavior-driven
* It composes cleanly with Society, Apartment, and User
* It will not require refactoring as the product grows

**Complaint Model — MVP Contract is now finalized and locked.**
