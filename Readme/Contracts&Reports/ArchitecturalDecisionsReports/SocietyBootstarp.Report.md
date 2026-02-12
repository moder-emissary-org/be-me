Agenda

1. Context and current system state
2. Architectural distinction: Bootstrap vs CRUD
3. Authority invariant definition
4. Layered responsibility design
5. Service-level bootstrap flow
6. Failure modes and atomicity strategy
7. Security constraints and hard rules
8. Output contract definition
9. Strategic significance for MVP

Report: Society Bootstrap Authority Flow (MVP Foundation)

1. Context and Current System State

The authentication-to-persistence chain is operational end-to-end: Clerk authentication works, backend identity resolution works, user documents are being created in MongoDB Atlas, and the authorization boundary is enforced in the backend. This establishes a functioning identity layer. The next structural step is not general society management but controlled system initialization through a Society Bootstrap Authority Flow.

2. Architectural Distinction: Bootstrap vs CRUD

This is not Society CRUD. CRUD implies ongoing lifecycle operations such as create, update, delete, and listing. Bootstrap is a one-time system initialization mechanism. Its responsibility is to establish the root tenant boundary and lock system invariants from the beginning. Bootstrap is authority creation, not entity management.

3. Authority Invariant Definition

For MVP, the system must enforce the following invariants:

* Exactly one society exists per deployment.
* At least one admin exists.
* No user exists outside a society.
* No public role selection is allowed.

Bootstrap is permitted only if zero societies exist in the system. This becomes a hard system invariant enforced at the service layer.

4. Layered Responsibility Design

Controller
Accepts Clerk-authenticated request. Performs no business logic. Delegates entirely to the service. Returns structured response.

Service
Enforces bootstrap rules. Checks system invariant. Creates society. Creates admin user. Ensures atomicity. Hardcodes role = admin. Handles failure strategy.

Repository
Pure data access only.

* countSocieties
* createSociety
* createUser

No invariant logic in repository. No authorization logic in repository.

5. Service-Level Bootstrap Flow

The service must implement the following ordered steps:

1. Check SocietyRepository.count().
   If > 0 → throw SYSTEM_ALREADY_BOOTSTRAPPED.

2. Start MongoDB session transaction.

3. Create society document with required minimal fields (name, address).

4. Create admin user with:

   * clerkUserId (from verified token)
   * role = 'admin' (hardcoded)
   * societyId = createdSociety._id
   * isActive = true

5. Commit transaction.

6. Return minimal success response containing identifiers only.

The role must never be accepted from the frontend. The service is the sole authority for role assignment during bootstrap.

6. Failure Modes and Atomicity Strategy

Primary failure risks:

* Society created but user creation fails.
* Duplicate bootstrap attempt under race conditions.

Atomicity Strategy:

Use Mongoose transactions (MongoDB replica set required, supported in Atlas). This guarantees that if user creation fails, the society document is rolled back automatically.

If transaction support were unavailable, strict manual rollback would be required, but transaction is the correct approach for this root-level operation.

Additionally, unique constraints on society collection (or enforcing count check within transaction) protects against concurrent double-bootstrap attempts.

7. Security Constraints and Hard Rules

* No public role selection.
* No creation of resident or guard during bootstrap.
* Bootstrap endpoint callable only when authenticated via Clerk.
* Role assignment happens only inside service.
* Controllers remain thin and orchestration-only.
* Repository contains no business logic.
* Authorization is backend-owned and never delegated to Clerk.

Bootstrap is the only public user creation pathway. All other users must be created via admin-protected flows later.

8. Output Contract Definition

Input:

* clerkUserId (derived from verified JWT)
* societyName
* societyAddress

Output:

* societyId
* adminUserId
* role = 'admin'

No sensitive internal details returned.

Failure Codes:

* SYSTEM_ALREADY_BOOTSTRAPPED
* INTERNAL_BOOTSTRAP_FAILURE

9. Strategic Significance for MVP

This flow establishes the root authority model. It creates the tenant boundary (Society), assigns the first authority (Admin), and locks system integrity from the beginning.

This is not feature development. It is infrastructure for governance.

Once this service is stable and unsurprising, the controller can be implemented following the controller-prerequisite doctrine. After bootstrap is operational, all future functionality (complaints, visitors, notices) operates inside a formally established authority boundary.

This completes the foundational layer of the MVP’s multi-entity governance system.
