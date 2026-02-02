## Stage 3 — User API Contracts (MVP)

Scope reminder (important):
User is **not** a CRUD-heavy entity in MVP. Users exist primarily to **carry authority**, not to be managed like resources.

So the User API surface is intentionally **small**.


## Step 1 — Valid User lifecycle actions (derived from the model)

From your locked model + auth rules, the **only valid User actions in MVP** are:

1. Bootstrap a user into backend after Clerk auth
2. Fetch the **current authenticated user**
3. Admin views users in their society
4. Admin creates a user (invite / register flow)
5. Admin deactivates a user

That’s it.

Explicitly **not** allowed:

* Self role changes
* Self apartment changes
* Self society changes
* Deleting users
* Cross-society access

If an action is not listed above, it does not exist in MVP.


## Step 2 — Canonical User routes (frozen list)

### 1️⃣ Get current user (who am I)

**GET /api/users/me**

Purpose:
Resolve Clerk identity → backend User → authority context.

Authentication: Required
Actor roles: any active user

Request:

* No body
* No params

Success:

* 200 OK
* Body: User (canonical shape)

Failure cases (layered):

**401 Unauthorized**

* No valid Clerk session

**403 Forbidden**

* User exists but `isActive === false`

**404 Not Found**

* Clerk user authenticated but backend User not found
  (bootstrap not completed yet)


### 2️⃣ Bootstrap user after Clerk signup (system action)

**POST /api/users/bootstrap**

Purpose:
Create backend User record after first successful Clerk auth.

Authentication: Required
Actor roles: system-validated Clerk user (not role-based yet)

Request body:

```ts
{
  fullName: string
  email: string
  role: "resident" | "admin" | "guard"
  societyId: string
  apartmentId?: string
}
```

Success:

* 201 Created
* Body: User

Failure cases:

**400 Bad Request**

* Missing required fields
* Invalid role
* Invalid ObjectId format

**401 Unauthorized**

* No Clerk session

**403 Forbidden**

* Clerk user already bootstrapped
* Role/apartment invariant violated

  * resident without apartment
  * guard with apartment (if enforced)

**409 Conflict**

* User with `clerkUserId` already exists
* Email already exists

Notes:

* This route is called **once per Clerk user**
* After success, `/me` becomes authoritative


### 3️⃣ Admin: list users in society

**GET /api/users**

Purpose:
Admin visibility into society members.

Authentication: Required
Actor role: `admin`
Scope: same society only

Query params (optional):

* role?: resident | admin | guard
* isActive?: boolean

Success:

* 200 OK
* Body: User[]

Failure cases:

**401 Unauthorized**

* No Clerk session

**403 Forbidden**

* Actor is not admin


### 4️⃣ Admin: create a user (invite-style creation)

**POST /api/users**

Purpose:
Admin creates a user for their society.

Authentication: Required
Actor role: `admin`
Scope: same society

Request body:

```ts
{
  clerkUserId: string
  fullName: string
  email: string
  role: "resident" | "admin" | "guard"
  apartmentId?: string
}
```

Success:

* 201 Created
* Body: User

Failure cases:

**400 Bad Request**

* Missing required fields
* Invalid role
* Invalid apartmentId format

**401 Unauthorized**

* No Clerk session

**403 Forbidden**

* Actor not admin
* Apartment does not belong to actor’s society

**409 Conflict**

* clerkUserId already exists
* email already exists


### 5️⃣ Admin: deactivate user

**PATCH /api/users/:userId/deactivate**

Purpose:
Soft-disable a user.

Authentication: Required
Actor role: `admin`
Scope: same society

Request params:

* userId: string

Request body:

* none

Success:

* 200 OK
* Body: User (with `isActive: false`)

Failure cases:

**400 Bad Request**

* Invalid userId format

**401 Unauthorized**

* No Clerk session

**403 Forbidden**

* Actor not admin
* Target user belongs to different society
* Attempt to deactivate self (optional rule, but must be explicit)

**404 Not Found**

* User not found in society


## Step 3 — Response shape (canonical)

All User responses use **the same shape**:

```ts
{
  id: string
  clerkUserId: string
  fullName: string
  email: string
  role: "resident" | "admin" | "guard"
  societyId: string
  apartmentId?: string
  isActive: boolean
  createdAt: ISODate
  updatedAt: ISODate
}
```

No variants. No “lite” user.


## Step 4 — Layer ownership clarity (critical)

To avoid future mistakes:

* Controllers:

  * Parse input
  * Call service
  * Return response

* Services:

  * Enforce **all invariants**
  * Enforce **all authorization**
  * Throw domain errors

* Repository:

  * Data access only
  * No decisions

If a rule exists in this document, it **must live in the service layer**.


## Step 5 — Explicit non-existence list (locks scope)

The following routes **do not exist in MVP**:

❌ PUT /users/:id
❌ DELETE /users/:id
❌ PATCH /users/:id/role
❌ PATCH /users/:id/apartment
❌ Cross-society user queries
❌ Bulk user operations

Any request for these is a **contract change**, not an implementation detail.


## Final Stage-3 Freeze Statement — User

* User API surface is intentionally minimal
* Authority flows from User → other models
* No controller can invent behavior beyond this contract
* This contract is stable for MVP and early traction

**Stage 3 for User is now complete and frozen.**

Next logical step (choose one):

1. Stage 3 for **Visitor**
2. Stage 3 for **Complaint**
3. Review your existing User controllers (if any) and delete what violates this contract

Say the number.
