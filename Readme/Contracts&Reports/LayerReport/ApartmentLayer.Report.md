# Apartment Layer – Complete MVP Design Contract

---

1. Domain Role of Apartment

---

Apartment is a structural entity inside a Society.

It represents a physical unit.
It is not a membership container.
It does not own users.
It does not know about Clerk.
It does not enforce authorization.
It is pure structure.

Apartments exist independently of Users.

---

2. Data Model Invariants (Database Level)

---

Required fields:
- apartmentCode: string
- societyId: ObjectId
- timestamps

Hard invariants:

1. apartmentCode is required
2. societyId is required
3. (societyId, apartmentCode) must be unique
4. apartmentCode must be normalized before persistence (trimmed, consistent casing)
5. Apartment must belong to exactly one society
6. Apartment never changes societyId after creation

MongoDB index (critical):

Compound unique index:
{ societyId: 1, apartmentCode: 1 }

No global uniqueness.
Uniqueness is tenant-scoped.

---

3. Business Invariants (Service Level)

---

These are not database constraints — these are domain rules.

1. Only Admin of the society can create apartments
2. Society must exist
3. Admin must belong to that society
4. Bulk creation must not silently ignore duplicates
5. Apartment inactive allowed only if: <br>
   • No residents are linked to that apartment
6. UserService must never create or mutate apartments
7. ApartmentService must never create users

Strict structural boundary.

---

4. Repository Layer Responsibilities

---

Repository is persistence-only. <br>
No business logic. <br>
No authorization. <br>
No normalization. <br>

Responsibilities: <br>

• create(apartmentDoc) <br>
• insertMany(apartmentDocs) <br>
• findByCode(societyId, apartmentCode) <br>
• findById(id) <br>
• listBySociety(societyId) <br>
• deleteById(id) <br>
• countBySociety(societyId) <br>

Repository rules: <br>

• Accept already-validated data <br>
• Throw raw database errors (duplicate key etc.) <br>
• No transformation of business meaning <br>
• No side effects <br>

Repository does not: <br>
• Check admin <br>
• Check society existence <br>
• Check user linkage <br>
• Normalize codes <br>

---

5. Service Layer Responsibilities

---

This is where correctness lives.

Core Service Methods:

1. createApartment(adminUserId, apartmentCode)

Flow: <br>
• Resolve admin user <br>
• Verify role = admin <br>
• Extract societyId <br>
• Normalize apartmentCode <br>
• Validate non-empty <br>
• Call repository.create <br>
• Catch duplicate key error <br>
• Return created apartment <br>

2. bulkCreateApartments(adminUserId, input)

Where input can be: <br>
• Range (A-1000 to A-1030) <br>
• Comma-separated list <br>
• Pre-expanded array <br>

Flow: <br>
• Resolve admin <br>
• Verify role = admin <br>
• Extract societyId <br>
• Parse input <br>
• Normalize all codes <br>
• Deduplicate input list <br>
• Validate max size limit (protect system) <br>
• Build apartment documents <br>
• repository.insertMany <br>
• Handle duplicate errors: <br>
Option A: fail entire batch <br>
Option B: report rejected + created <br>
• Return structured result <br>

3. listApartments(adminUserId)

Flow: <br>
• Validate admin <br>
• Fetch by societyId <br>
• Return list <br>

4. deleteApartment(adminUserId, apartmentId)

Flow: <br>
• Validate admin <br>
• Fetch apartment <br>
• Verify apartment.societyId matches admin.societyId <br>
• Check no users linked (via UserRepository count) <br>
• If linked → throw business error <br>
• repository.deleteById <br>

Service Layer Owns: <br>

• Authorization validation <br>
• Tenant isolation enforcement <br>
• Normalization logic <br>
• Range parsing logic <br>
• Deduplication logic <br>
• Max limit enforcement <br>
• Error translation <br>

Service Layer Does Not: <br>

• Know HTTP <br>
• Know request/response <br>
• Know Express <br>
• Call Clerk <br>
• Perform logging concerns <br>

---

6. Controller Layer Responsibilities

---

Controller must be thin (as per your doctrine). <br>

Responsibilities: <br>

• Extract authenticated userId (from middleware) <br>
• Read body/query/params <br>
• Call ApartmentService <br>
• Return response <br>
• Map known service errors to HTTP codes <br>

Controller does NOT: <br>

• Validate business rules <br>
• Normalize apartmentCode <br>
• Parse ranges <br>
• Check roles <br>
• Access database <br>
• Implement logic <br>

Controller should be ~15–30 lines max. <br>

---

7. Failure Modes and Handling

---

Database Errors: <br>

Duplicate key → mapped to: <br>
409 Conflict <br>
Message: Apartment already exists in this society <br>

Invalid ObjectId → 400 Bad Request <br>

Business Errors: <br>

Not admin → 403 Forbidden <br>
Society mismatch → 403 Forbidden <br>
Apartment linked to residents on delete → 400 Bad Request <br>
Empty bulk input → 400 Bad Request <br>
Bulk size exceeds limit (e.g., > 200) → 400 Bad Request <br>

System Errors: <br>

Database unavailable → 500 <br>
Unexpected error → 500 <br>

Never leak raw Mongo errors to client.

---

8. Operational Safeguards

---

To prevent abuse or accidental overload: <br>

• Limit bulk creation size (e.g., max 200 per request) <br>
• Normalize all codes consistently <br>
• Reject blank strings <br>
• Reject invalid range syntax <br>
• Enforce tenant scoping on every query <br>

Every repository query must include societyId constraint when relevant. <br>

---

9. Clean Flow Summary

Create Single: <br>

Controller <br>
→ Service (auth + normalize + validate) <br>
→ Repository (insert) <br>
→ Service (error mapping) <br>
→ Controller (HTTP response) <br>

Bulk Create: <br>

Controller <br>
→ Service (parse + normalize + dedupe + validate + authorize) <br>
→ Repository (insertMany) <br>
→ Service (error handling) <br>
→ Controller (structured response) <br>

Delete: <br>

Controller <br>
→ Service (authorize + check linkage) <br>
→ Repository (delete) <br>
→ Controller <br>

---

10. Non-Negotiable Boundaries

ApartmentService: <br>
• Owns structure logic <br>
• Never touches Clerk <br>
• Never creates users <br>

UserService: <br>
• Must only validate apartment existence <br>
• Never creates apartment <br>

Repository: <br>
• Pure persistence <br>
• No business rules <br>

Controller: <br>
• Orchestration only <br>

---

11. Final Architectural Outcome

This design guarantees: <br>

• Structure-first modeling <br>
• Clean tenant isolation <br>
• Clear separation of layers <br>
• Small transactions <br>
• No composite flows <br>
• No cross-domain mutation <br>
• Future extensibility without re-architecture <br>

You now have a stable, enforceable contract for the Apartment layer. <br>

If you code exactly against this report, you will not need to refactor this layer when your first 20 societies go live. <br>

Now the real discipline test: <br>
When you implement it, do not “just add one small shortcut.” <br>

That’s how systems rot. <br>
