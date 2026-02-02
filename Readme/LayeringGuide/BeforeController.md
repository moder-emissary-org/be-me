At MVP level, **controllers are not where you start**. They are a *late-stage orchestration layer*. If you write controllers too early, you lock in bad assumptions and end up refactoring repeatedly.

Below is the **canonical, backend-first MVP sequence** that fits your solo execution model and the stack you are using.

---

## Executive answer (one paragraph)

You start writing controllers **only after**: <br>
(1) your **domain models are locked**, <br>
(2) your **authorization contract is explicit**, <br>
(3) your **request–response contracts are defined**, and <br>
(4) your **service/business logic can be written without Express present**. <br>

Controllers should contain **almost no business logic**; they should adapt HTTP → domain → HTTP. If you feel “logic pressure” while writing a controller, you started too early.

---

## The correct MVP backend order (non-negotiable)

### Stage 0 — Global foundations (before anything)

Must exist before a single controller is written:

* Node + TS project boots cleanly
* Express app runs
* Mongo connection stable
* Clerk middleware works
* Global error handler exists
* Auth guard (`requireAuth`) exists

If these are missing, controller work is premature.

---

### Stage 1 — Domain model contracts (LOCK FIRST)

Before controllers, you must have **final schemas** for:

* User (with `clerkUserId`, role, societyId, apartmentId)
* Society (identity-only, already locked)
* Apartment (scope + composition)
* Visitor (already locked)
* Request/Complaint
* Notice

At this stage you should be able to answer:

> “What fields exist, who owns them, and who is allowed to mutate them?”

If the answer is fuzzy → stop.

---

### Stage 2 — Authorization rules (written, not implicit)

Before controllers, authorization must be **written down**, for example:

| Action            | Role allowed | Scope         |
| ----------------- | ------------ | ------------- |
| Create visitor    | guard        | same society  |
| Approve visitor   | admin        | same society  |
| View visitors     | admin, guard | same society  |
| Submit complaint  | resident     | own apartment |
| Resolve complaint | admin        | same society  |

These rules must exist **outside your head**.

Controllers **consume** these rules; they do not invent them.

---

### Stage 3 — API contracts (HTTP shape fixed)

Before writing controllers, define:

* Route
* Method
* Request body / params
* Response shape
* Failure cases

Example (Visitor create):

```
POST /api/visitors
Request:
{
  name: string
  contactNumber: string
  purpose: string
  apartmentId: string
  expectedAt?: ISODate
}

Responses:
201 → Visitor
400 → Validation error
401 → Unauthenticated
403 → Forbidden
```

If you cannot write this without code, you are not ready.

---

### Stage 4 — Business logic as services (NO Express)

This is the most important gate.

Write **pure service functions** like:

```ts
createVisitor(input, actorUser)
approveVisitor(visitorId, actorUser)
markVisitorEntry(visitorId, actorUser)
```

Rules:

* No `req`, `res`
* No HTTP status codes
* No Express imports
* Throw domain errors only

If this logic feels unclear → controllers will be worse.

---

### Stage 5 — Controllers (finally)

Now controllers become trivial:

```ts
export const createVisitorController = async (req, res) => {
  const visitor = await createVisitor(req.body, req.user);
  res.status(201).json(visitor);
};
```

If a controller exceeds ~20–30 lines, something is wrong.

---

## What must be “ready” before writing controllers (checklist)

You are ready to write controllers **only if all are true**:

* Models are locked (no “maybe we add later”)
* Roles and permissions are explicit
* Society / apartment scoping rules are clear
* API inputs & outputs are written
* Business logic can be unit-tested without Express
* Auth middleware already injects `req.user`

If **any** of these are missing → stop.

---

## Why this matters especially for MVP

Controllers are **high-churn code**.
Domain logic is **low-churn code**.

If you write controllers first:

* Every schema change breaks routes
* Auth logic leaks into HTTP
* Express becomes your “business layer”
* MVP velocity drops sharply after week 2

Your current project avoids this **only if controllers come last**.

---

## One-line rule to remember

> **Controllers are written when nothing inside them can surprise you.**

If you want, next we can:

* Take **one MVP feature** (e.g., Visitor flow) and walk through all 5 stages
* Review an existing controller you wrote and refactor it to MVP-correct shape
* Create a **controller lint rule checklist** for your project

Tell me which one you want.
