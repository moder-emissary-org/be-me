Good. We stay disciplined. Just MVP-level, nothing fancy, no future creep. <br>

Apartment services (structure layer only) <br>

1. createApartment
2. bulkCreateApartments (optional but realistic for setup phase)
3. getApartmentById
4. getApartmentByCode (within society scope)
5. listApartments (paginated, society-scoped)
6. updateApartmentCode (rare, but needed for correction)
7. deleteApartment (only if no linked residents, strict invariant check)

That’s it. No occupancy logic. No analytics. No structure-user mixing. <br>

Now User services (authority + membership layer) <br>

System / bootstrap level: <br>

1. bootstrapSocietyWithAdmin

Admin-level user management:
2) createResident
3) createGuard
4) getUserById (society-scoped)
5) listUsers (filtered by role, paginated)
6) updateUserRole (resident ↔ guard, but never self-escalation)
7) reassignResidentApartment
8) deactivateUser (soft delete / status-based)

Self-level:
9) getMyProfile
10) updateMyProfile (non-role fields only)

Notice something important. <br>

Apartment services never touch Clerk. <br>
User services never create apartments. <br>
Each layer stays pure. <br>

That separation is what keeps your MVP stable instead of slowly collapsing under convenience shortcuts. <br>

Now the real discipline question: <br>
Which of these are absolutely required for version 1 launch, and which are “nice to have”? <br>
