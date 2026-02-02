## Agenda and direction of this report

The purpose of this report is to formally document the **Base Error Class (`AppError`)** used in the MVP backend architecture. This report explains why the base class exists, what guarantees it provides, how it constrains system behavior, and how it enables safe growth without refactoring or error chaos.

This document treats the base error class as a **foundational contract**, not an implementation detail.

### Why a base error class is required

In the absence of a unified base error, backend systems typically degrade into one or more of the following failure modes:

• Mixed error shapes across layers <br>
• Loss of context during error propagation <br>
• Inconsistent observability signals <br>
• Accidental leakage of internal details <br>
• Unreliable `instanceof` or type checks <br>
• Ad-hoc flags such as `statusCode` or `isCustom` <br>

The base error class exists to eliminate these classes of failure **by design**, not by convention.

### What the base error class represents

The base error class represents a **structured, intentional failure** within the system. Its existence signals that:

• The error was deliberately thrown <br>
• The failure is understood and categorized <br>
• The error belongs to a known architectural layer <br>
• Context exists and can be safely inspected <br>
• The error is operational, not a crash artifact <br>

It explicitly separates **designed failures** from accidental runtime exceptions.

### Why the base error class is abstract

The base error class is intentionally abstract to prevent misuse.

This design ensures that:

• No layer throws a “generic” application error <br>
• Every thrown error must declare its intent <br>
• Error codes remain layer-owned <br>
• Architectural boundaries are enforced at compile time <br>

The abstract nature of the class is a guardrail, not a limitation.

### Why `code` is mandatory

The `code` field exists to provide a **stable, machine-readable identifier** for the failure. Messages may change, but codes must not.

This enables:

• Deterministic controller mapping <br>
• Searchable and aggregatable Sentry data <br>
• Safe refactors of error messages <br>
• Cross-service analytics in future systems <br>

Without mandatory codes, error handling becomes message-driven, which is fragile and unsafe.


### Why `layer` is mandatory

The `layer` field explicitly encodes **where the error originated**, not where it was caught.

This allows the system to:

• Apply different handling strategies per layer <br>
• Prevent repository errors from leaking to users <br>
• Enforce translation boundaries <br>
• Support layered observability and alerting <br>

The layer field is the backbone of controlled error propagation.

### Why `isOperational` exists

The `isOperational` flag exists to distinguish **expected failures** from **programming defects**.

Operational errors:

• Represent known failure <br>
• Should be logged and monitored<br>
• Should not crash the process<br>
• Can be safely shown as generic UI errors<br>

Non-operational errors (e.g., null dereferences) should bypass this system and surface as crashes or alerts.

By defaulting this flag to `true`, the base class enforces a conservative, production-safe posture.

### Why contextual data is supported

The optional `context` field exists to capture **diagnostic truth without UI leakage**.

It enables:

• Rich Sentry breadcrumbs<br>
• Faster root-cause analysis<br>
• Zero reliance on parsing error messages<br>
• Layer-specific debugging without coupling<br>

Context is explicitly non-user-facing and must never be relied on by UI logic.

### Why stack trace capture is centralized

The base error class captures the stack trace at construction time to ensure:

• Accurate origin tracking<br>
• Consistent stack formatting<br>
• Reduced noise from rethrows<br>
• Predictable debugging behavior<br>

Centralizing this behavior prevents accidental loss of debugging information.

### What the base error class intentionally does not contain

The base error class deliberately excludes:

• HTTP status codes <br>
• User-facing messages <br>
• Retry logic <br>
• Localization concerns <br>
• Logging side effects <br>

These exclusions preserve separation of concerns and prevent architectural bleed between layers.

### How the base error class improves system reliability

By enforcing structure at the lowest level, the base error class:

• Makes global error handling deterministic <br>
• Enables safe refactoring of upper layers <br>
• Reduces defensive code <br>
• Prevents error vocabulary drift <br>
• Improves incident response quality <br>

It turns error handling from a reactive activity into a **designed system**.

### Future expansion options (non-breaking)

The base error class is designed to evolve without breaking existing code. Safe extensions include:

• Severity or alert-level classification <br>
• Error correlation identifiers <br>
• Retryability hints <br>
• Ownership or domain tags <br>
• Feature or module identifiers <br>

These can be added without modifying existing subclasses or controller logic.

### What must never change

To preserve system integrity, the following properties of the base error class must remain stable:

• Mandatory `code` <br>
• Mandatory `layer` <br>
• Centralized context support <br>
• Abstract construction <br>
• Separation from HTTP concerns <br>

Any change to these would represent a **breaking architectural decision**, not a refactor.

### Closing principle

The base error class is not a convenience abstraction. It is the **keystone of the error architecture**. Every higher-level guarantee—safe controllers, clean services, reliable observability—depends on this class remaining explicit, minimal, and disciplined.