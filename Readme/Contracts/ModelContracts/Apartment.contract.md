Below is the **concise, explicit contract summary** for the Apartment model that we are locking for **MVP-first deployment**. This is the version we will treat as **authoritative** going forward.

---

## Apartment Model — MVP Contract Summary

### ✅ Locked MVP Schema (Authoritative)

```ts
import mongoose, { Schema } from "mongoose";

const ApartmentSchema = new Schema(
  {
    apartmentCode: {
      type: String,
      required: true,
      unique: true, // Human-readable identifier (e.g., A-203)
    },

    societyId: {
      type: mongoose.Types.ObjectId,
      ref: "Society",
      required: true, // Tenant boundary
    },

    towerLabel: { // --------- explanation is on second next report --------- 
      type: String,
      required: false,
      // Examples: "Tower A", "Block 3"
      // Display-only in MVP
    },
  },
  { timestamps: true }
);

export const Apartment = mongoose.model("Apartment", ApartmentSchema);
```

This schema is **final for MVP** unless a core value flow breaks.

---

## What This Model Represents (MVP Meaning)

* An **Apartment is a passive physical unit**
* It exists only to:

  * Anchor complaints
  * Anchor visitors
  * Anchor users (residents)
* It does **not** model real-world legality or occupancy rules

In MVP terms:

> An apartment is an identifier + a society boundary.

---

## Why These Fields Exist

### `apartmentCode`

* Human-readable flat identifier
* Used everywhere in UI and admin workflows
* Prevents leaking database IDs
* Stable across complaints, visitors, notices

### `societyId`

* Enforces strict single-society data isolation
* Core authorization and scoping primitive
* Required for every downstream model

### `timestamps`

* Minimal auditability
* Debugging and operational safety
* No behavioral implication

---

## Explicit MVP Boundaries (Non-Negotiable)

The Apartment model **does NOT** handle:

* Ownership
* Tenancy
* Vacancy
* Occupancy lifecycle
* Multiple residents
* Legal or rental reality

These are **intentionally abstracted away**.

---

## Where Occupancy Lives in MVP

MVP truth is encoded **only here**:

```ts
User {
  role: "resident"
  apartmentId
}
```

Meaning:

* One active resident per user
* System cares only about *who is using it today*
* No competing sources of truth

---

## Future Expansion (Planned, Deferred)

This schema is designed to **never change**, even as features grow.

### Phase 2

* Add `occupancyType` to **User** if required

### Phase 3

* Introduce a separate `Occupancy` model
* Track history, roles, start/end dates

Apartment remains **structural and untouched**.

---

## Final Contract Statement (Lock This In)

* Apartment is **structural, not behavioral**
* Users associate with apartments, not vice versa
* MVP abstracts reality to ship value
* Ownership and tenancy are **future concerns**

**We are going with this schema.**
All backend logic, authorization, complaints, and visitors will align to this contract.

Contract closed.


=================================================

### `towerLabel` (Optional, String)

This is the **key design decision**.

Why it exists **now**, but as a string:

* Captures real-world structure
* No joins
* No permissions
* No hierarchy
* No behavior

Why it is **optional**:

* Small societies don’t have towers
* Villas don’t need blocks
* Avoids forced data entry

Why it is **string, not ObjectId**:

* Prevents premature entity promotion
* Avoids cascading schema + UI + auth changes

---

## What Is Explicitly Out of Scope (Still)

Apartment does **not** include:

❌ Floor number <br>
❌ Ownership status <br>
❌ Area / size <br>
❌ Parking slots <br>
❌ Utility mapping <br>
❌ Admin or manager references <br>

These are **ERP features**, not MVP features.

---

## How Tower Is Promoted Later (No Breaking Changes)

### Today (MVP)

```
Apartment {
  societyId
  unitLabel
  towerLabel: "Tower A"
}
```

### Tomorrow (Tower becomes real)

Add:

```ts
Tower {
  _id
  societyId
  name: "Tower A"
}
```

Then **optionally** migrate:

```ts
Apartment {
  societyId
  unitLabel
  towerId
  towerLabel // kept for display / backward compatibility
}
```

No API breaks.
No data loss.
No forced migration at MVP time.

---

## Query Simplicity (Why This Matters)

MVP queries stay trivial:

* All apartments in society
* All complaints for apartment
* Display unit + tower in UI

No joins. No aggregation pipelines.

---

## Final Contract modification Statement

* Apartment is the **physical locator**
* Tower is **descriptive metadata** in MVP
* Tower becomes an entity **only when it owns behavior**
* This schema absorbs future hierarchy safely
* No refactors, no rewrites, no regret

This **Apartment Model — MVP Contract** is now tower-ready and production-safe.