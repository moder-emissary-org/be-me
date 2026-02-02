# **freeze Visitor authorization rules**

* Fully consistent with the **Visitor MVP Contract**
* Fully consistent with **User / Apartment / Society contracts**
* Minimal, explicit, and enforceable at the **service layer**
* Free of workflow creep

This section is **authoritative once stated**.

---

### Visitor Authorization Rules — Final Freeze (MVP)

> **Model:** Visitor
> **Nature:** High-criticality, operational, state-dependent
> **Authorization Style:** Sequential + state-aware
> **Source of Authority:** User (role + apartment + society)

---

## 1. Core Invariants (Non-Negotiable)

These apply to **all Visitor operations**, regardless of role:

1. `visitor.societyId === user.societyId`
2. Visitor always belongs to **exactly one apartment**
3. Visitor state transitions are **strict and linear**
4. Visitor authorization is enforced **server-side only**

If any invariant fails → **request is rejected**

---

## 2. Visitor Lifecycle (Locked)

```text
pending → upcoming → current → past
```

No skips.
No reversals in MVP.

---

## 3. Role × Action × State Matrix (Frozen)

### 🟦 Guard

| Action         | Allowed When            | Conditions      |
| -------------- | ----------------------- | --------------- |
| Create Visitor | Always                  | Society match   |
| View Visitor   | Always                  | Society match   |
| Mark Approved  | ❌                       | Never           |
| Mark Entry     | `status === "upcoming"` | Approval exists |
| Mark Exit      | `status === "current"`  | Entry exists    |
| Update Details | `pending` only          | Before approval |

**Guard authority is operational, not decision-making.**

---

### 🟩 Resident

| Action            | Allowed When           | Conditions     |
| ----------------- | ---------------------- | -------------- |
| View Visitor      | Always                 | Owns apartment |
| Approve Visitor   | `status === "pending"` | Owns apartment |
| Reject Visitor    | ❌ (MVP)                | Not supported  |
| Mark Entry / Exit | ❌                      | Never          |
| Create Visitor    | ❌                      | Never          |

Approval results in:

```ts
approvedBy = residentUserId
status = "upcoming"
```

---

### 🟥 Admin

| Action            | Allowed When | Conditions    |
| ----------------- | ------------ | ------------- |
| View Visitor      | Always       | Society match |
| Approve Visitor   | ❌            | Never         |
| Mark Entry / Exit | ❌            | Never         |
| Modify Visitor    | ❌ (MVP)      | Read-only     |

**Admin role is supervisory only.**

---

## 4. Approval Rules (Explicit)

Approval is defined as:

* A **single irreversible action**
* Performed only by a **resident**
* Resident must satisfy:

  ```ts
  user.apartmentId === visitor.apartmentId
  ```
* Approval is **recorded**, not negotiated

No:

* Re-approval
* Delegation
* Expiry logic
* Multi-resident voting

---

## 5. Entry / Exit Rules (Explicit)

* Only guards can:

  * Set `actualEntryAt`
  * Set `actualExitAt`
* Entry requires:

  * `status === "upcoming"`
  * `approvedBy` exists
* Exit requires:

  * `status === "current"`

These timestamps are the **only source of physical presence truth**.

---

## 6. What Is Explicitly Disallowed (Frozen)

* Admin approvals
* Resident self-entry
* Guard self-approval
* Multi-apartment visitors
* Skipping lifecycle states
* Notification-dependent correctness

Any future feature violating these requires a **contract revision**, not a patch.

---

## 7. Enforcement Location (Locked)

All Visitor authorization rules are enforced in:

> **Backend service layer only**

* Frontend checks are UX-only
* Middleware may pre-filter by role
* Final authority always lives in Visitor service logic

---

## 8. Final Freeze Statement

* Visitor authorization is **role + state dependent**
* Authority is **distributed**, not centralized
* Visitor remains the **only model**
* Approval is a **shared-state mutation**
* Guards operate, residents decide, admins observe

**Visitor Authorization Rules — MVP are now frozen.**

---

### Next Logical Freeze (Recommended)

1. **Complaint Authorization Rules**, or
2. **Global Authorization Matrix (all models)**

Say which one you want to lock next.
