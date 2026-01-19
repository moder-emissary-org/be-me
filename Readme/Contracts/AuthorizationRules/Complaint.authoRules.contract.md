## Complaint Model — MVP Contract

### 1. What the Complaint Model Represents

A Complaint represents a **resident-initiated operational issue** tied to a **specific apartment within a society**, requiring administrative action and resolution tracking.

It is:

* A **workflow entity**
* A **resident → admin operational signal**
* A **time-bound issue lifecycle record**

Complaint is **not** a discussion thread, chat, or ticketing system.

---

### 2. Why the Complaint Model Exists

The Complaint system is the **primary MVP value driver**.

It exists to:

1. Replace informal complaint handling (calls, WhatsApp, paper logs)
2. Provide **traceability** and **accountability**
3. Give admins a **single operational queue**
4. Give residents **visibility and closure**

Without this model:

* MVP has no core utility
* Admin adoption collapses
* Resident trust is low

---

### 3. Ownership & Scope Rules (Critical)

* Complaint is **owned by a User (resident)** via `userId`
* Complaint belongs to **exactly one Apartment**
* Complaint belongs to **exactly one Society**
* Cross-society access is strictly forbidden

This triple binding (`user → apartment → society`) is **non-negotiable**.

---

### 4. What Complaint Can and Cannot Do

#### Complaint CAN:

* Be created by a resident
* Be updated in status by admin
* Be viewed by scoped roles
* Track lifecycle via timestamps

#### Complaint CANNOT:

* Assign authority
* Trigger notifications (in MVP)
* Escalate automatically
* Be transferred across apartments or societies
* Be edited freely after creation

Complaint is **stateful**, not autonomous.

---

### 5. Authorization Rules (Role-Based)

#### Resident

**Allowed**

* Create complaint for own apartment only
* Read own complaints
* View status and admin updates

**Not Allowed**

* Update status
* Change priority
* Edit complaint after creation
* View others’ complaints

---

#### Admin (RWA / Society Admin)

**Allowed**

* Read all complaints in society
* Update `status`
* Update `priority`
* Close complaints

**Not Allowed**

* Create complaints on behalf of residents
* Modify complaint ownership
* Change apartment or society reference

---

#### Guard

**Allowed**

* No access in MVP

Guards are intentionally excluded to preserve role clarity.

---

### 6. CRUD Authorization Matrix

| Action        | Resident      | Admin        | Guard |
| ------------- | ------------- | ------------ | ----- |
| Create        | Own apartment | No           | No    |
| Read          | Own only      | Society-wide | No    |
| Update text   | No            | No           | No    |
| Update status | No            | Yes          | No    |
| Delete        | No            | No           | No    |

Deletion is **disallowed** to preserve audit integrity.

---

### 7. Status Lifecycle (MVP-Strict)

```
pending → in_progress → resolved → closed
```

Rules:

* Only admin can move states forward
* No backward transitions
* `closed` is terminal
* No auto-resolution

---

### 8. How Complaint Fits into System Flow

1. Resident submits complaint
2. Complaint enters admin queue (`pending`)
3. Admin takes action (`in_progress`)
4. Issue resolved (`resolved`)
5. Admin formally closes (`closed`)

No side channels. No hidden states.

---

### 9. Invariants (Hard Rules)

* Complaint must always have:

  * userId
  * apartmentId
  * societyId
* User.apartmentId must match complaint.apartmentId
* User.societyId must match complaint.societyId
* Complaint is immutable in identity

---

### 10. Future Add-Ons (Explicitly Deferred)

Non-breaking enhancements:

* Admin remarks / resolution notes
* Attachments (images, docs)
* SLA timestamps
* Category tagging
* Resident feedback after resolution
* Escalation levels

All future additions remain **additive**, not structural.

---

### 11. Final Lock Statement

* Complaint is the **core MVP workflow model**
* Authority lives on **User role**, not on Complaint
* Status mutation is **admin-only**
* This contract is **MVP-frozen**

Next logical model in sequence:
**Notice / Announcement model** (if included)
or
**Cross-model authorization invariants** (system-wide rules)

Confirm where to proceed.
