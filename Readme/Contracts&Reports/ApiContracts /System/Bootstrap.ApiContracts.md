Bootstrap Authority Flow – Structural Report (MVP)

This document formalizes the Society Bootstrap design within your backend-first, single-society MVP architecture. The goal is to precisely define responsibility, invariants, route structure, atomicity, and failure handling. This is not CRUD. This is system initialization.

1. Purpose of Bootstrap

Bootstrap establishes the root tenant boundary and initial authority state.

It guarantees:

• Exactly one Society exists per deployment <br>
• Exactly one initial Admin user is created <br>
• No user exists outside a Society <br>
• The permission model has a defined root <br>

Bootstrap is a one-time system-level operation. It is not part of normal business workflows.

2. Architectural Classification

Bootstrap is:

• A system-level operation <br>
• Executed before regular domain flows <br>
• Outside the standard role-permission model <br>
• Authority-originating (not authority-validated) <br>

It does not belong under Society CRUD or Admin CRUD.

3. Route Design

Route: <br>
POST /api/system/bootstrap <br>

Reasoning:

• Not a resource mutation under an existing society <br>
• Not user management <br>
• Not administrative panel logic <br>
• Operates at system boundary <br>

Route Module: <br>
system.routes.ts <br>

Mounted as: <br>
app.use("/api/system", systemRoutes) <br>

4. Authentication Model

Bootstrap must require Clerk authentication. <br>

Even though no society exists yet, we require: <br>

• Valid Clerk JWT <br>
• Extracted clerkUserId <br>

Reason: <br>
The clerkUserId becomes the permanent identity anchor of the root admin. <br>

No public anonymous bootstrap. <br>

5. Invariants

The following invariant must be enforced in service: <br>

Invariant 1: <br>
System must not already be bootstrapped. <br>

Implementation: <br>

const count = await SocietyRepository.count() <br>
if (count > 0) throw SYSTEM_ALREADY_BOOTSTRAPPED <br>

This is the only guard required to prevent reinitialization. <br>

Do not rely on frontend visibility. <br>
Do not rely on route disabling. <br>
The service layer enforces it. <br>

6. Input Contract (Service Layer)

BootstrapSocietyService Input: <br>

{
clerkUserId: string
societyName: string
}

Not allowed: <br>

• role <br>
• isActive <br>
• societyId <br>
• apartmentId <br>
• any permission flags <br>

Role must not be accepted from input. <br>
It must not be validated. <br>
It must not be checked. <br>

Authority must originate inside service. <br>

7. Output Contract

Return minimal, deterministic data. <br>

Example: <br>

```
{
societyId: ObjectId
adminUserId: ObjectId
message: "System bootstrapped successfully"
}
```

Do not return entire documents. <br>
Do not expose unnecessary internal fields. <br>

8. Service Responsibilities

BootstrapSocietyService must:

1. Verify system not already initialized

2. Start transaction

3. Create Society document

4. Create Admin User document

5. Commit transaction

6. Return minimal success object

7. Hardcoded Authority Rule

Admin creation must be hardcoded: <br>

```
role = 'admin'
isActive = true
societyId = createdSociety._id
```

There must be no conditional logic on role. <br>
There must be no input-based branching. <br>

This prevents role injection.

10. Repository Responsibilities

SocietyRepository: <br>

• count() <br>
• create() <br>

UserRepository: <br>

• create() <br>

Repositories must: <br>

• Perform pure database operations <br>
• Not contain validation logic <br>
• Not contain business logic <br>
• Not contain permission checks <br>

11. Transaction Strategy

Because this operation creates two tightly coupled documents: <br>

• Society <br>
• Admin User <br>

Atomicity is required. <br>

If Society is created but User fails → system enters inconsistent state. <br>

Use MongoDB transaction via Mongoose session. <br>

Flow: <br>

startSession() <br>
session.startTransaction() <br>

create society (session) <br>
create user (session) <br>

commitTransaction() <br>

on error → abortTransaction() <br>

Atlas supports transactions (replica set). <br>

This ensures no orphan society.

12. Controller Responsibilities

Controller must:

• Extract clerkUserId from auth middleware <br>
• Extract societyName from request body <br>
• Call BootstrapSocietyService <br>
• Return standardized API response <br>

Controller must not: <br>

• Check society count <br>
• Set role <br>
• Handle transaction <br>
• Perform validation beyond basic shape <br>

Per your doctrine: <br>
Controller is orchestration only. <br>

13. Failure Modes and Error Codes

Service must explicitly handle: <br>

```
SYSTEM_ALREADY_BOOTSTRAPPED
→ Society count > 0

INVALID_INPUT
→ Missing societyName

DATABASE_TRANSACTION_FAILED
→ Any transactional failure
```

Avoid generic errors.

14. Security Model Summary

Bootstrap is outside normal role-permission checks. <br>

Reason: <br>

No admin exists yet. <br>

After bootstrap: <br>

• All user creation must go through admin-authorized service <br>
• No public user creation endpoints <br>
• No role selection from frontend <br>

Bootstrap is the only public identity creation point. <br>

15. Post-Bootstrap State

After successful bootstrap: <br>

System state becomes: <br>

Society: 1 <br>
Admin Users: 1 <br>
Non-admin Users: 0 <br>

From this point:

• All future users must be created by Admin <br>
• Role enforcement applies <br>
• System behaves as normal tenant-bound architecture <br>

16. Alignment With MVP Assumptions

This design respects:

• Single-society per deployment <br>
• Backend-first authority enforcement <br>
• Clerk as authentication-only <br>
• Backend as authorization authority <br>
• No multi-tenant super-admin <br>

17. What This Is Not

Bootstrap is not:

• Society CRUD <br>
• Multi-society management <br>
• Admin self-registration <br>
• Public signup flow <br>
• Role-based conditional creation <br>

It is system initialization.

18. Summary

You are not building “Create Society API.” <br>

You are implementing: <br>

A one-time, atomic, authority-originating system initialization operation. <br>

It must:

• Be isolated under /api/system <br>
• Require Clerk auth <br>
• Enforce zero-society invariant <br>
• Hardcode admin role <br>
• Use transaction <br>
• Be irreversible <br>

This is foundational backend architecture. <br>
If implemented correctly, your entire permission model stands on it. <br>
