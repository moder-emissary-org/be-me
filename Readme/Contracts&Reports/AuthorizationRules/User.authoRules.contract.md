Understood. We will now **freeze User Authorization Rules** in a way that is:

* Directly derived from the **User model contract**
* Consistent with **Society, Apartment, Visitor, and Complaint contracts**
* Explicit about **what User controls and what it never controls**
* Safe for MVP and non-breaking for future phases

This section is **authoritative once stated**.

---

# User Authorization Rules — Final Freeze (MVP)

- **Model:** User
- **Role:** Policy carrier & identity anchor
- **Authorization Basis:** `role × societyId × apartmentId × isActive`
- **Scope:** Single society per user (MVP)

---

## 1. Core Invariants (Non-Negotiable)

These apply to **all authorization decisions involving a User**:

1. `user.isActive === true` is required for **any action**
2. `user.societyId` defines the **maximum authorization boundary**
3. A user can belong to **only one society** in MVP
4. Roles are **exclusive**: `resident | admin | guard`
5. Role is assigned **out-of-band** (not self-managed)

If any invariant fails → **access denied**

---

## 2. User Roles — Canonical Meaning (Locked)

### 🟩 Resident

* Represents an **apartment-linked individual**
* Has **ownership-based authority**
* Can authorize actions **only within own apartment**

Required invariant:

```ts
user.apartmentId !== null
```

---

### 🟥 Admin

* Represents **society-level governance**
* Has **oversight and management authority**
* Is **not involved in daily operations**

Required invariant:

```ts
user.apartmentId === null || optional
```

(Admin may or may not live in a flat; authority is not derived from apartment.)

---

### 🟦 Guard

* Represents **operational executor**
* Performs **physical-world actions**
* Has **no ownership or decision authority**

Required invariant:

```ts
user.apartmentId === null
```

---

## 3. Role × Capability Matrix (Frozen)

### 🟩 Resident Capabilities

| Capability                               | Allowed | Scope         |
| ---------------------------------------- | ------- | ------------- |
| View own profile                         | ✅       | Self          |
| Update own profile (display fields only) | ✅       | Self          |
| View apartment-linked data               | ✅       | Own apartment |
| Approve visitors                         | ✅       | Own apartment |
| Create complaints                        | ✅       | Own apartment |
| Manage visitors                          | ❌       | —             |
| Manage other users                       | ❌       | —             |
| Perform operational actions              | ❌       | —             |

---

### 🟥 Admin Capabilities

| Capability                | Allowed | Scope   |
| ------------------------- | ------- | ------- |
| View all users            | ✅       | Society |
| Create / deactivate users | ✅       | Society |
| View all complaints       | ✅       | Society |
| Update complaint status   | ✅       | Society |
| View all visitors         | ✅       | Society |
| Approve visitors          | ❌       | —       |
| Perform guard actions     | ❌       | —       |

Admin authority is **horizontal (society-wide)**, not **vertical (operational)**.

---

### 🟦 Guard Capabilities

| Capability                  | Allowed | Scope   |
| --------------------------- | ------- | ------- |
| View assigned society data  | ✅       | Society |
| Create visitors             | ✅       | Society |
| Record visitor entry / exit | ✅       | Society |
| View complaints             | ❌       | —       |
| Approve visitors            | ❌       | —       |
| Manage users                | ❌       | —       |

Guard authority is **procedural**, not **decisional**.

---

## 4. Society Scoping Rules (Explicit)

For **every request**, the backend must enforce:

```ts
user.societyId === resource.societyId
```

No cross-society reads or writes are allowed in MVP.

This rule applies uniformly to:

* Users
* Apartments
* Visitors
* Complaints

---

## 5. Apartment Scoping Rules (Explicit)

Apartment-based authority applies **only to Residents**.

```ts
user.role === "resident"
AND user.apartmentId === resource.apartmentId
```

Admins and guards **never gain authority** through apartments.

---

## 6. User Self-Management Rules (Locked)

* Users may update:

  * `fullName`
  * (optionally) display-only fields
* Users may **not** update:

  * `role`
  * `societyId`
  * `apartmentId`
  * `isActive`

These fields are **admin-managed only**.

---

## 7. Deactivation Rules (Critical)

* `isActive = false` immediately revokes:

  * Authentication access
  * Authorization access
* Historical records remain intact
* Deactivated users:

  * Cannot approve
  * Cannot operate
  * Cannot authenticate

---

## 8. Enforcement Location (Locked)

User authorization is enforced at **three layers**:

1. **Authentication**: Clerk (identity only)
2. **Request filtering**: Middleware (role + society)
3. **Final authority**: Service layer (model-specific logic)

Backend service logic is the **final authority**.

---

## 9. What Is Explicitly Disallowed (Frozen)

* Multi-role users
* Cross-society users
* User-managed role changes
* Apartment-based authority for admins or guards
* Implicit authority outside model contracts

Any of the above requires a **contract revision**, not an extension.

---

## 10. Final Freeze Statement

* User is the **sole policy carrier**
* Role defines **capability**, not UI
* Society defines **boundary**
* Apartment defines **resident ownership**
* All other models derive authority from User

**User Authorization Rules — MVP are now frozen.**
