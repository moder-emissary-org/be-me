### Agenda and direction of this report

The purpose of this report is to document the **authoritative MVP error vocabulary** used across the backend of the Apartment and Society Management SaaS. This report explains why each error code category was introduced, what problem it solves, and what guarantees it provides to engineering, observability, and product stability.

The intent is not to describe implementation, but to **lock the semantic meaning** of each error code so the system can scale without error chaos, UI leakage, or ad-hoc handling.

### Why an explicit error code list exists

Modern SaaS systems fail not because errors occur, but because **errors are undefined, inconsistent, and uncontrolled**. This error code list exists to:

• Enforce a shared language between layers <br>
• Prevent accidental leakage of internal failures to users <br>
• Enable deterministic controller behavior <br>
• Make Sentry data searchable, stable, and actionable <br>
• Keep the MVP surface area intentionally small <br>

Every code in this list is a **design decision**, not a convenience

### Repository layer error codes (persistence failures only)

These error codes exist to represent **technical failures related to data access**. They intentionally avoid business meaning and HTTP semantics.

- DB_CONNECTION_FAILED
Introduced to represent inability to establish a database connection. Its presence isolates infrastructure or environment issues from domain logic and allows immediate escalation without misclassification as a business failure.

- DB_WRITE_FAILED
Introduced to represent failed persistence operations after validation has already passed. This separates domain correctness from system reliability.

- DB_READ_FAILED
Introduced to represent failed read operations where data access itself failed, not where data was missing by design. This distinction prevents “not found” logic from being polluted by infrastructure errors.

- DB_DUPLICATE_KEY
Introduced as a **controlled and expected** failure mode. This code exists so services can intentionally translate database constraints into meaningful domain conflicts instead of guessing intent from raw database messages.

- DB_TIMEOUT
Introduced to represent degraded system conditions without assuming corruption or invalid state. This enables different alerting and retry strategies compared to hard failures.

Primary purpose of repository error codes:
To ensure **all database failures are explicit, classified, and never leak upward unstructured**.

### Service (domain) layer error codes (business truth)

These error codes exist to express **business-level facts** about why an operation cannot proceed. They are intentionally phrased as truths, not instructions or HTTP responses.

- SERVICE_INPUT_INVALID
Introduced to represent violations of service-level input contracts after controller parsing. This prevents controllers from duplicating validation logic and keeps business rules centralized.

- USER_ALREADY_REGISTERED
Introduced to explicitly represent identity uniqueness conflicts. This avoids implicit coupling to database uniqueness rules and makes intent clear to both backend and frontend.

- ROLE_CONSTRAINT_VIOLATION
Introduced to represent invalid role or permission combinations that break domain invariants. This protects authorization rules from being bypassed by malformed data.

- SOCIETY_NOT_FOUND
Introduced to represent missing root tenancy context. This prevents silent cross-tenant behavior and makes tenant boundaries explicit.

- APARTMENT_SCOPE_INVALID
Introduced to enforce hierarchy integrity between society and apartment. Its presence guarantees that cross-scope data access failures are caught at the domain level, not the UI level.

- OPERATION_NOT_ALLOWED
Introduced to represent authorization decisions made by the backend. This ensures the backend remains the single authority for “can or cannot” decisions, independent of frontend state.

Primary purpose of service error codes:
To express **truthful, stable business outcomes** that controllers can safely map without guessing intent.

### Controller / boundary error codes (user-visible semantics)

These error codes exist to define the **only vocabulary users ever see**. They intentionally hide system internals while preserving correctness.

- BAD_REQUEST
Introduced to represent malformed or incomplete client input at the boundary. This keeps client feedback consistent and predictable.

- UNAUTHORIZED
Introduced to represent missing or invalid authentication context. This prevents authorization logic from being conflated with identity.

- FORBIDDEN
Introduced to represent authenticated users lacking permission. This distinction is critical for security clarity and auditability.

- NOT_FOUND
Introduced to represent user-visible absence of a resource, regardless of internal lookup complexity.

- CONFLICT
Introduced to represent user-correctable state conflicts, such as duplicate registrations, without exposing internal constraints.

- INTERNAL_ERROR
Introduced as the single fallback for all unexpected or non-recoverable failures. Its presence prevents error vocabulary explosion and protects system internals.

Primary purpose of controller error codes:
To provide a **minimal, stable, and human-safe contract** between backend and frontend.

### Why this list is intentionally small

A small error vocabulary:

• Forces engineers to think before adding new states <br>
• Makes monitoring and alerting tractable <br>
• Prevents frontend branching explosion <br>
• Preserves backward compatibility as the system grows <br>

If a new error code is required, it signals a **domain expansion**, not a missing if-statement.

### Closing principle

This error code list exists to ensure that **failures are as well-designed as successful APIs**. Every code is explicit, layered, and purpose-bound. Nothing here is accidental, and nothing should be extended casually.