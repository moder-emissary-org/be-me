Understood. Below is the **corrected, finalized, and re-locked Visitor Model — MVP Contract Report**, with the **approval authority fixed** to reflect real operational behavior, **without expanding scope or introducing resident workflows**.

This version **supersedes the previous one** and should be treated as **authoritative going forward**.

---

# Visitor Model — MVP Contract Report

- **Status:** Finalized & Locked (Revised)
- **Criticality:** High (Operational, Daily-Use Model)
- **Depends on:** Society, Apartment, User
- **Primary Operator:** Guard
- **Approval Authority:** Resident (implicit, MVP)

---

## 1. Role of Visitor in the MVP

In the MVP, a **Visitor represents a real-world, time-bound entry event** into a society.

It exists to answer:

1. Who is visiting?
2. Why are they visiting?
3. Which apartment are they visiting?
4. What is the current state of their visit?
5. When did they enter and exit?

> Visitor is an **operational security record**, not an identity, CRM, or communication object.

---

## 2. What Visitor Is (And Is Not)

### Visitor **IS**

* A time-based entry record
* A guard-operated workflow
* Always scoped to one society
* Always associated with one apartment
* Authorized by the apartment’s resident (implicitly, in MVP)

### Visitor **IS NOT**

* A user account
* A resident workflow system
* A notification or messaging system
* An OTP / QR / biometric flow
* A long-term contact directory

---

## 3. Final Visitor Schema (MVP)

```ts
Visitor {
  name: string
  contactNumber: string
  purpose: string

  status: "pending" | "upcoming" | "current" | "past"

  societyId: ObjectId
  apartmentId: ObjectId

  expectedAt: Date
  actualEntryAt?: Date
  actualExitAt?: Date

  approvedBy?: ObjectId   // User (resident of the apartment)
  timestamps
}
```

---

## 4. Field Definitions — What & Why

### `name`

**What:**
Visitor’s human-readable name.

**Why:**
Required for guard verification and resident recognition.

---

### `contactNumber`

**What:**
Visitor’s contact number.

**Why:**

* On-ground identification
* Guard coordination if required
* Trust signal during entry

**Notes:**
Stored minimally; not used for messaging in MVP.

---

### `purpose`

**What:**
Reason for visit (guest, delivery, maintenance, etc.).

**Why:**
Provides context for authorization and auditability.

---

### `status`

**What:**
Current lifecycle state of the visit.

```text
pending   → authorization awaited
upcoming  → authorized, not yet arrived
current   → inside society
past      → exited
```

**Why:**
This lifecycle cleanly models **authorization + time + physical presence** without ambiguity.

---

### `societyId`

**What:**
Tenant boundary reference.

**Why:**

* Strict data isolation
* Society-scoped guard operations
* Query safety and performance

---

### `apartmentId`

**What:**
Target apartment for the visit.

**Why:**
Every visitor must be tied to a physical unit for ownership and traceability.

---

### `expectedAt`

**What:**
Expected arrival time.

**Why:**

* Pre-authorization context
* Guard preparation
* Schedule clarity

---

### `actualEntryAt`

**What:**
Actual entry timestamp.

**Why:**
Marks the beginning of physical presence.

---

### `actualExitAt`

**What:**
Actual exit timestamp.

**Why:**
Marks completion of the visit and closes the record.

---

### `approvedBy`

**What:**
Resident user associated with the target apartment who authorized the visit.

**Why:**

* Establishes accountability
* Reflects real-world authority
* Enables future resident-driven workflows without schema changes

**Notes:**
In MVP, approval is **recorded by the guard** based on offline resident confirmation.

---

### `timestamps`

**What:**
Creation and update times.

**Why:**
Auditability, debugging, and operational safety.

---

## 5. Authorization & Behavioral Rules (Implied)

* Guards **create** visitor records
* Guards **record authorization** after resident confirmation
* Residents **authorize visits implicitly** (outside the system in MVP)
* Guards **control entry and exit**
* Admins have **oversight and audit access only**
* Visitor always belongs to **exactly one society**
* Visitor always targets **exactly one apartment**

(Enforced strictly in service logic.)

---

## 6. Explicitly Out of Scope (MVP)

* Resident UI or self-approval actions
* OTP / QR-based entry
* Facial recognition / biometrics
* Notifications (SMS / WhatsApp / Push)
* Visitor photo capture
* Blacklists or watchlists
* Multi-apartment visits

These are intentionally excluded to protect MVP stability and execution speed.

---

## 7. Future Considerations (Non-Breaking)

This model is designed to evolve safely.

### Phase 2

* Resident visibility dashboards
* Admin remarks
* Visit categorization
* Soft expiration logic

### Phase 3

* Resident-initiated approvals
* OTP / QR workflows
* Visitor history analytics
* Tower-level filtering (when Tower becomes an entity)

**Core Visitor identity and lifecycle remain unchanged.**

---

## 8. Final Contract Statement

* Visitor is a **high-impact operational model**
* It is guard-centric, resident-authorized, and tenant-safe
* It reflects real-world society operations accurately
* It avoids premature UI, security, or communication complexity
* It will not require refactoring as the product grows

**Visitor Model — MVP Contract is finalized, corrected, and locked.**

---

If you are ready, the **only remaining structural task** is to freeze the **authorization matrix (role × action × scope)** across all models using this corrected authority flow.

Say the word.
