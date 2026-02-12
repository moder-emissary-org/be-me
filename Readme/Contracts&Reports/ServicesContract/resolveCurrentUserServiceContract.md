Below is a **concise, internal MVP service report** focused strictly on this service. No design changes, no refactors, no speculation beyond what the code actually supports.

---

**Service Name**
`resolveCurrentUser_Service`

**What this service does**
This service resolves the **current authenticated user** from a Clerk identity and translates that external identity into the backend’s internal authority and scope model. Given a `clerkUserId`, it fetches the active user record, validates that the user belongs to an existing society, optionally resolves the apartment context, and returns a normalized, backend-owned representation of user identity, authority, and scope.

In short, it answers one critical question: <br>
“Who is this user in our system, and what is their operational scope?” <br>

---

**How it works (execution flow)**
The service starts with a single trusted input: `clerkUserId`.

1. It fetches the internal User using the Clerk ID and validates existence and active status.
2. It resolves the Society associated with the user and fails fast if the society is missing.
3. It conditionally resolves the Apartment if the user is linked to one.
4. It assembles a structured response that separates identity, authority, scope, and metadata.

All failures are surfaced as `ServiceError`, keeping the service deterministic and controller-agnostic.

---

**Why this service exists (MVP rationale)**
This service is foundational because **Clerk is authentication-only**, while the backend owns authorization and tenancy. External tokens do not carry business meaning. This service is the bridge that converts an authenticated identity into a **business-valid principal**.

It centralizes: <br>
• user activation checks <br>
• society existence validation <br>
• scope derivation (society + apartment) <br>
• role exposure for downstream authorization <br>

Without this service, every controller or feature would reimplement partial user-resolution logic, creating drift and security risk.

---

**What it enables today (MVP usage)**
In the MVP, this service acts as the **entry point for all protected operations**. Controllers can call it once per request and rely on its output to: <br>
• confirm the user is valid and active <br>
• know which society the request belongs to <br>
• know whether apartment-level scope exists <br>
• expose role data for permission checks <br>

It is especially critical for complaint management, visitor management, and notice board operations, where society scope is mandatory.

---

**Future usage and evolution (without breaking contract)**
This service is designed to scale without changing its purpose.

Future extensions can include: <br>
• permission derivation (fine-grained capabilities) <br>
• onboarding state detection instead of hardcoded `onboardingComplete` <br>
• multi-society context (by returning an array of scopes) <br>
• caching at request or middleware level <br>
• audit metadata (last login, role source, authority version) <br>

Importantly, this service can evolve **without leaking database models or Clerk internals** to higher layers.

---

**Architectural significance**
This is not a “user fetch” service. It is a **principal resolution service**. It establishes a clean boundary between authentication, authorization, and business scope, making it one of the most critical services in the entire MVP backend.

This is the correct first service to complete.
