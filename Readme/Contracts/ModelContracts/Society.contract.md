Below is the **Society Model — MVP Contract Report**, written to match the **same rigor and discipline** we locked for the Apartment model.
This document explains **what the Society model is**, **why each field exists**, **what is explicitly out of scope for MVP**, and **how it safely composes with the Apartment schema**—without overengineering.

---

# Society Model — MVP Contract Report

## 1. Role of Society in the MVP

In the MVP, **Society is the root tenant and authorization boundary**.

It exists to answer exactly three questions:

1. *Which society does this data belong to?*
2. *Who is allowed to act within this boundary?*
3. *How do we isolate data cleanly and safely?*

It is **not**:

* A legal entity model
* A governance model
* A communication directory
* A compliance or registration system

- In MVP terms: **Society is a container, not a business object.**

---

## 2. MVP-Safe Final Society Schema (Authoritative)

This schema is **intentionally aligned** with the Apartment contract you already locked.

```ts
import mongoose, { Schema } from "mongoose";

const SocietySchema = new Schema(
  {
    name: {
      type: String,
      required: true, // Human-readable identity
    },

    address: {
      type: String,
      required: true, // Single display address (not normalized)
    },
  },
  { timestamps: true }
);

export const Society = mongoose.model("Society", SocietySchema);
```

This is the **final MVP version**.

---

## 3. Why These Fields Exist (Justification)

### `name`

**Why included:**

* Primary human identity of the society
* Used across admin dashboards, onboarding, and UI
* Required for trust and recognition

**Why nothing more:**

* No aliases, codes, or registry lookups are needed in MVP

---

### `address`

**Why included:**

* Required for real-world context
* Display-only usage
* Helps admins and residents verify correctness

**Why kept as a single string:**

* City/state/country normalization adds no MVP value
* Avoids premature geo, reporting, or filtering logic

---

### `timestamps`

**Why included:**

* Auditability
* Debugging
* Safe operational default
* No behavioral impact

---

## 4. Fields Explicitly Excluded from MVP (And Why)

Your original schema included:

```ts
city
state
zipCode
country
contactNumber
email
registrationNumber
managerId
```

These are **intentionally excluded** in MVP.

### Why they are excluded:

* **Geographic normalization** (`city`, `state`, `zipCode`, `country`)

  * No feature depends on them
  * Adds false completeness

* **Communication fields** (`contactNumber`, `email`)

  * You explicitly excluded notifications and messaging
  * No outbound or inbound communication in MVP

* **Legal / formal identity** (`registrationNumber`)

  * Not required for adoption validation
  * Pushes toward compliance workflows

* **Governance coupling** (`managerId`)

  * Admins are users with roles
  * Embedding authority into Society breaks auth boundaries

> **Authorization lives on User, never on Society.**

---

## 5. MVP Boundaries (Non-Negotiable)

The Society model in MVP **does NOT** handle:

❌ Admin hierarchy <br>
❌ Contact management <br>
❌ Legal registration <br>
❌ Multiple societies per deployment <br>
❌ Regional filtering <br>
❌ External communication <br>

These are **future concerns**, not MVP blockers.

---

## 6. How Society Safely Composes with Apartment (Important)

The relationship is clean and one-directional:

```text
Society
  └── Apartment
        └── User
```

* Society owns **scope**
* Apartment owns **physical identity**
* User owns **authority and behavior**

This keeps:

* Authorization clean
* Queries simple
* Future multi-society support possible without refactor

---

## 7. Future Goals (Deferred, Planned)

This schema is designed to **expand without breaking changes**.

### Phase 2 (If Needed)

* Add optional contact or display metadata
* Still no authority coupling

### Phase 3 (Much Later)

* Multi-society deployments
* Governance models
* Communication modules

The **core Society identity remains unchanged**.

---

## 8. Final Contract Statement

* Society is a **structural tenant boundary**
* It carries **identity only**, not authority
* It is intentionally minimal
* It composes safely with Apartment and User
* It will not need refactoring as the product grows

**This Society schema is now locked for MVP**, exactly like the Apartment schema.

If you want next, the natural continuation is:

* Lock the **User model contract**
* Validate **Complaint + Visitor schemas** against Society/Apartment
* Freeze **authorization rules**

Tell me the next step.
