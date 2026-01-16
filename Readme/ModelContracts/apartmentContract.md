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
