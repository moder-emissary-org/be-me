# Notice Authorization Rules — MVP Contract

> **Model:** Notice
> **Scope:** Society
> **Mutation Owner:** Admin
> **Audience:** Residents (read-only)
> **Enforcement Layer:** Backend service logic (post-auth)

---

## 1. Authorization Philosophy (Notice-Specific)

The Notice model is **informational, not operational**.

Therefore:

* Authorization is **strict and minimal**
* Only one role mutates
* No partial ownership rules
* No cross-society visibility
* No user-driven state transitions

Notice authorization is intentionally **boring and rigid**.

---

## 2. Role Definitions (Contextual)

| Role     | Contextual Meaning for Notice                 |
| -------- | --------------------------------------------- |
| Admin    | Governing authority for society communication |
| Resident | Information consumer                          |
| Guard    | Operational staff — excluded                  |

---

## 3. Authorization Rules by Action

### 3.1 Create Notice

**Who:**
✔ Admin only

**Conditions:**

* `user.role === "admin"`
* `user.societyId === notice.societyId`

**Denied:**

* Residents
* Guards

**Why:**
Notices represent official society communication.

---

### 3.2 Read Notice

**Who:**
✔ Admin
✔ Resident

**Conditions:**

* `user.societyId === notice.societyId`
* `notice.isActive === true` (for residents)

**Notes:**

* Admins may read active and inactive notices
* Residents cannot read inactive notices

**Why:**
Residents consume information; admins manage it.

---

### 3.3 Update Notice

**Who:**
✔ Admin only

**Conditions:**

* `user.role === "admin"`
* `user.societyId === notice.societyId`
* `notice.createdBy` is not required to match user

**Allowed Updates:**

* `title`
* `body`
* `isActive`

**Denied:**

* Changing `societyId`
* Changing `createdBy`

**Why:**
Notices are society-owned, not user-owned.

---

### 3.4 Delete Notice

**Who:**
✘ Nobody (MVP)

**Behavior:**

* Physical deletion is forbidden
* Soft hide via `isActive = false` only

**Why:**
Preserves audit safety and avoids destructive operations.

---

## 4. Field-Level Authorization Constraints

| Field        | Rule                     |
| ------------ | ------------------------ |
| `societyId`  | Immutable after creation |
| `createdBy`  | Immutable after creation |
| `timestamps` | System-controlled only   |
| `isActive`   | Admin-only mutation      |

---

## 5. Cross-Model Invariants

These rules must **always** hold:

* A Notice always belongs to exactly **one society**
* A user can only access notices within their society
* No Notice may reference users or societies outside scope
* No Notice may be targeted at apartments in MVP

Violations are **hard errors**, not silent failures.

---

## 6. Explicitly Out of Scope (Authorization)

* Resident acknowledgements
* Read receipts
* Role-based targeting
* Apartment-level visibility
* External delivery permissions (SMS / WhatsApp)

These require new models or flags and are excluded.

---

## 7. Enforcement Notes (Implementation)

* Authorization is enforced **after Clerk auth**
* JWT identity → internal User resolution → Notice authorization
* Client-side checks are UX-only
* Backend is final authority

---

## 8. Final Authorization Lock Statement

* Notice authorization is **society-scoped and admin-controlled**
* Residents are **read-only consumers**
* Guards are **fully excluded**
* No destructive actions are allowed
* Rules are **stable and non-negotiable** for MVP

**Notice Authorization Rules — MVP Contract is now finalized and locked.**

---

If you want to proceed cleanly, the **only remaining major lock** is:

> **Complaint Authorization Rules Contract**

Say the word when ready.
