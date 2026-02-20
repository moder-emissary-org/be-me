Bootstrap Authority Flow – Structural Report (MVP Updated for Multi-Tenant SaaS) <br>

This document updates the Bootstrap design to align with the new system direction: public SaaS onboarding with multiple societies in a single shared backend and single MongoDB cluster. Bootstrap is no longer a global system initialization. It is tenant initialization. <br>

1. Purpose of Bootstrap

Bootstrap establishes a new tenant boundary and its initial authority state. <br>

It guarantees: <br>

• One Society is created per bootstrap request <br>
• Exactly one initial Admin user is created for that Society <br>
• No user exists without a Society <br>
• Authority for that Society has a defined root <br>

Bootstrap is not system-wide initialization anymore. It is tenant creation. <br>

2. Architectural Classification

Bootstrap is: <br>

• A tenant-level operation <br>
• Authority-originating for that tenant <br>
• Outside the normal role-permission model <br>
• Executed only when a new Society is created <br>

It is not CRUD. <br>
It is not Admin management. <br>
It is not a global system initializer. <br>

3. Route Design

Route: <br>
POST /api/societies/bootstrap

Reasoning: <br>

• It creates a new tenant boundary <br>
• It is no longer system-global <br>
• It belongs to tenant onboarding <br>

Route module: societies.routes.ts <br>
Mounted as: app.use("/api/societies", societiesRoutes) <br>

The old /api/system/bootstrap is removed because the system is no longer single-society. <br>

4. Authentication Model

Bootstrap requires Clerk authentication. <br>

Requirements: <br>

• Valid Clerk JWT <br>
• Extracted clerkUserId <br>

No anonymous bootstrap. <br>
The clerkUserId becomes the permanent identity anchor for the tenant’s root admin. <br>

Optional business rule (recommended): <br>
A Clerk user may bootstrap only one Society. <br>

Enforced via: <br>

UserRepository.findByClerkUserId(clerkUserId) <br>
If exists → throw ALREADY_ASSOCIATED_WITH_SOCIETY <br>

5. Invariants (Updated)

Removed invariant: <br>

System must not already be bootstrapped. <br>

New invariant: <br>

A Clerk identity may not bootstrap multiple societies (if enforcing 1:1 ownership model). <br>

There is no global society count restriction. <br>

Multiple societies are valid. <br>

6. Input Contract (Service Layer)

BootstrapSocietyService Input: <br>

```
{
clerkUserId: string
societyName: string
address: string
}

Not allowed:

• role
• isActive
• societyId
• apartmentId
• permission flags
```

Role must never be accepted from input. <br>
Authority originates strictly inside the service. <br>

7. Output Contract

Return minimal deterministic data: <br>

{
societyId: ObjectId
adminUserId: ObjectId
message: "Society created successfully"
}

Do not return full documents. <br>
Do not expose internal flags. <br>

8. Service Responsibilities

BootstrapSocietyService must:

1. Validate input shape

2. Verify Clerk user is not already associated (if rule enforced)

3. Start transaction

4. Create Society document

5. Create Admin User document

6. Commit transaction

7. Return minimal response

8. Hardcoded Authority Rule

Admin creation must be hardcoded:
```
role = "admin"
isActive = true
societyId = createdSociety._id
```
No branching. <br>
No input-based role logic. <br>
No conditional authority assignment. <br>

This prevents role injection.

10. Repository Responsibilities

SocietyRepository: <br>

• create(session) <br>
• findById <br>
• findByName (optional, if uniqueness enforced per society) <br>

UserRepository: <br>

• create(session) <br>
• findByClerkUserId <br>

Repositories must: <br>

• Be pure database access <br>
• Contain no business logic <br>
• Contain no authorization logic <br>
• Accept session when required <br>

11. Transaction Strategy

Atomicity is required because: <br>

Society and Admin are tightly coupled. <br>

Flow: <br>
```
startSession()
session.startTransaction()

create society (with session)
create admin user (with session)

commitTransaction()

on error → abortTransaction()
```

Atlas replica set supports transactions. <br>

This prevents: <br>

• Orphan societies <br>
• Admin without society <br>
• Partial tenant creation <br>

12. Controller Responsibilities

Controller must: <br>

• Extract clerkUserId from auth middleware <br>
• Extract societyName and address <br>
• Call BootstrapSocietyService <br>
• Return standardized API response <br>

Controller must not: <br>

• Check society count <br>
• Assign roles <br>
• Manage transactions <br>
• Implement authorization logic <br>

Controller remains orchestration-only.

13. Failure Modes and Error Codes

```
Service must handle explicitly:

ALREADY_ASSOCIATED_WITH_SOCIETY
→ Clerk identity already owns a society (if enforced)

INVALID_INPUT
→ Missing required fields

DATABASE_TRANSACTION_FAILED
→ Any transaction failure
```

No generic unstructured errors.

14. Security Model Summary

Bootstrap exists outside role-permission enforcement because: <br>

No admin exists yet for that tenant. <br>

After bootstrap: <br>

• All user creation must go through admin-authorized services <br>
• No public user creation endpoints <br>
• No role selection from frontend <br>
• No cross-society access allowed <br>

Multi-tenant isolation rule becomes primary invariant: <br>

resource.societyId must always equal authenticatedUser.societyId <br>

15. Post-Bootstrap State (Per Society)

After successful bootstrap of one society: <br>
```
Society: +1
Admin Users for that Society: 1
Other Users: 0
```
Multiple societies may exist in database. <br>
Each operates independently under strict societyId scoping. <br>

16. Alignment With Updated Architecture

This design now aligns with:

• Public SaaS onboarding <br>
• Multiple societies in one backend <br>
• Single MongoDB cluster <br>
• Logical tenant isolation <br>
• Backend-owned authorization <br>
• Clerk as authentication-only <br>
• No global singleton enforcement <br>

17. What This Is Not (Updated)

Bootstrap is not: <br>

• Global system initialization <br>
• Single-society lock <br>
• Multi-society super-admin creation <br>
• Public role-selection signup <br>
• Cross-tenant management tool <br>

It is tenant creation + root authority establishment. <br>

18. Final Structural Definition

Bootstrap is: <br>

An atomic, tenant-initializing, authority-originating operation that creates a new Society and its root Admin inside a shared multi-tenant SaaS architecture. <br>

It must: <br>

• Require Clerk authentication <br>
• Never trust role input <br>
• Use transaction <br>
• Hardcode admin authority <br>
• Enforce tenant isolation going forward <br>
• Avoid global singleton assumptions <br>

This version matches your updated SaaS direction and budget constraints while preserving authority-first backend discipline. <br>
