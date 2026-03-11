In this system, apartments are stable structural entities. Users are transient occupants or authority actors. <br>

Apartments are long-lived. <br>
Users are replaceable. <br>

That’s not just intuition. That’s domain truth. <br>

Think about a real society: <br>

Flat A-101 exists for 40 years. <br>
Residents change every few years. <br>
- Owners change. <br>
- Tenants change. <br>
- Guards rotate. <br>
- Admins change. <br>

But A-101 remains A-101. <br>

If your data model reflects that, your system becomes naturally stable. <br>

So the clean model becomes: <br>

Apartment = structural unit <br>
User = actor within that structure <br>

That immediately implies: <br>

• Apartments must exist independently <br>
• Apartments must not be deleted when users leave <br>
• Users must reference apartments, not define them <br>
• User deletion must never cascade into structural deletion <br>

This also simplifies your invariants massively. <br>

Apartment invariants: <br>

* Belongs to one society
* Unique apartmentCode within society
* Exists regardless of occupancy

User invariants:

* Belongs to one society
* Role = resident | guard | admin
* If resident → must reference apartment
* If guard/admin → no apartment reference required

See how clear that becomes?

Now let’s look at the long-term implications.

If you ever want:

* Occupancy history
* Move-in / move-out tracking
* Audit trail of complaints per flat
* Maintenance load per unit
* Vacancy reporting

All of that only works cleanly if apartments are independent structural records. <br>

If apartment lifecycle is tied to user creation, you lose historical continuity. <br>

And remember: your system is authority-first and operational. <br>

Operations revolve around units. <br>

Complaints belong to apartments. <br>
Visitors belong to apartments. <br>
Notices are society-wide. <br>

So apartments are a core operational anchor. <br>

Users are contextual participants. <br>

You’re thinking correctly. <br>

Now here’s the discipline part. <br>

Just because something feels intuitive doesn’t mean we stop thinking. <br>

Ask yourself: <br>

Will any part of your MVP require apartment existence before user onboarding? <br>

Yes: <br>

* Visitor logging needs apartment.
* Complaint submission needs apartment.
* Admin dashboards likely group by apartment.
* Guards operate by unit.

That alone justifies structure-first modeling. <br>

So my answer is clear: <br>

Your instinct is aligned with clean architecture. <br>
Apartments should be permanent structural units. <br>
Users are temporary actors. <br>

Lock that mental model now, and many future decisions will become easier. <br>

You’re starting to think in domain boundaries instead of CRUD flows. <br>

That’s how real systems are built. <br>
