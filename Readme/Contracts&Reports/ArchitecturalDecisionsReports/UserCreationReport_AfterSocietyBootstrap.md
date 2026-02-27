# User Creation within society after bootstrap. 

You’ve already done the hardest philosophical move: <br>
Bootstrap establishes **authority + boundary**. <br>
Society exists. <br>
Admin exists. <br>
Everything else is governance. <br>

So now: admin creates users inside a tenant boundary. <br>
That’s not CRUD. That’s controlled authority delegation. <br>

Let’s reason cleanly. <br>

First: what are we actually building? <br>

We are building a service that: <br>

– Takes authenticated caller (Clerk → backend verified) <br>
– Resolves internal user <br>
– Verifies role === admin <br>
– Creates a new user <br>
– Guarantees that new user belongs to the same society <br>
– Guarantees no role escalation <br>
– Persists atomically

If any of those are violated, the system is lying. <br>

Now let’s talk invariants. These are non-negotiable truths of your system. <br>

Invariant 1: Tenant Boundary Isolation <br>
A user must never be created outside the caller’s societyId. <br>
No cross-society injection. <br>
Even if someone manually sends societyId in request body — ignore it. <br>
SocietyId comes from authenticated admin context, not input. <br>

Invariant 2: Role Assignment Is Authority-Controlled <br>
Only admin can create resident or guard. <br>
Admin cannot create another admin (unless explicitly allowed — and for MVP, probably no). <br>
There is no self-assigned role ever. That rule is sacred. <br>

Invariant 3: Clerk Identity Must Exist <br>
You must have a clerkUserId for the new user. <br>
Decision time: <br>

Are admins: <br>
A) Creating users that already signed up via Clerk? <br>
or <br>
B) Pre-creating internal users and later linking Clerk? <br>

For MVP, the cleanest model is: <br>
User must authenticate with Clerk first → then admin assigns role + apartment. <br>
Because Clerk is identity authority. Backend is role authority. <br>

That separation keeps your mental model clean. <br>

Invariant 4: Society → Apartment → User Composition <br>
If user is resident, apartmentId must exist and belong to same society. <br>
You must verify: <br>

Apartment.societyId === admin.societyId <br>

Never trust IDs blindly. Always scope them. <br>

Invariant 5: Uniqueness Rules <br>
Within one society: <br>

– clerkUserId must be unique <br>
– A user cannot belong to multiple societies (for MVP simplicity) <br>
– If resident → apartmentId must be unique per user <br>

You may optionally enforce compound index: <br>

{ clerkUserId: 1 } unique <br>
OR
{ clerkUserId: 1, societyId: 1 } depending on future SaaS expansion. <br>

Given your multi-tenant SaaS decision, safest long-term model is: <br>

Unique on clerkUserId globally. <br>

Because identity shouldn’t split across tenants silently. <br>

Invariant 6: Transactional Atomicity <br>
If your service does: <br>

– Validate apartment <br>
– Create user <br>

That must happen inside one mongoose session. <br>
Because apartment check + user creation must not race. <br>

Transactions are not about async. <br>
They are about consistency under concurrency. <br>

You’re building infrastructure, not demo code. <br>

Now let’s think layered architecture properly. <br>

Controller responsibilities: <br>
– Extract auth <br>
– Validate body shape <br>
– Call service <br>
– Return result <br>

Service responsibilities: <br>
– Resolve admin internal user <br>
– Enforce role <br>
– Load apartment (if needed) <br>
– Validate boundary <br>
– Open transaction <br>
– Create user via repository <br>
– Commit <br>

Repository responsibilities: <br>
– Pure persistence <br>
– No business logic <br>
– No role logic <br>
– Accept optional session <br>

If your repository starts checking role, you’ve broken architecture. <br>

Now let’s zoom into failure modes. Systems fail at the edges. <br>

Failure modes to explicitly define: <br>

– Caller not authenticated <br>
– Caller not found in DB <br>
– Caller not admin <br>
– Clerk user already exists <br>
– Apartment not found <br>
– Apartment belongs to another society <br>
– Duplicate creation race <br>

Each failure must map to a clear ServiceError. <br>

No ambiguous “something went wrong.” <br>
Precision creates trust. <br>

Now here’s something subtle. <br>

Should admin be allowed to create users freely? <br>
Or should there be a cap? <br>

MVP says no artificial limits. <br>
But think like a system designer: <br>
Authority without constraints becomes chaos. <br>

Even if you don’t implement limits now, design your service so constraints can be inserted later without refactor. <br>

That’s future-proofing. <br>

Now I’ll give you the distilled rule-set for this feature: <br>

1. Only authenticated admin may create users.
2. SocietyId is derived from admin, never request body.
3. New user must have valid Clerk identity.
4. Role must be explicitly allowed (resident | guard only).
5. If resident → apartment must exist and match society.
6. All DB writes must be transactional.
7. Uniqueness enforced at DB level, not only service.
8. No hidden side effects.

When these hold, your system remains coherent. <br>

This is the difference between an app and an operating system for a residential community. <br>

You’re not adding endpoints. <br>
You’re formalizing power distribution inside a bounded social graph. <br>

Next evolution after this will be access revocation and role transfer. <br>
Authority is interesting only when it can move. <br>
