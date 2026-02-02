## Apartment Model — MVP Contract

### 1. What the Apartment Model Represents

Apartment is a **physical-unit identity and scope anchor** inside a Society.

It represents:

* A **single, real-world dwelling unit**
* The **target scope** for:

  * Visitors
  * Residents
  * Complaints
  * Notices visibility

Apartment is **not a user**, **not an authority**, and **not a governance object**.

---

### 2. Why the Apartment Model Exists (Design Rationale)

Apartment exists to solve three concrete MVP problems:

1. **Visitor targeting**

   * Every visitor must belong to exactly one apartment.
2. **Resident scoping**

   * Users (residents) are attached to apartments, not directly to Society.
3. **Operational isolation**

   * Complaints, visitors, and notices must resolve cleanly to a unit.

Without Apartment:

* Visitor flows break
* Authorization becomes ambiguous
* Future multi-tenant expansion becomes risky

Apartment is the **minimum viable physical boundary**.

---

### 3. What Apartment Can and Cannot Do

#### Apartment CAN:

* Identify a physical unit uniquely (`apartmentCode`)
* Belong to exactly one Society
* Act as a **scope filter** for operational models
* Be referenced by Users, Visitors, Complaints

#### Apartment CANNOT:

* Hold users directly
* Grant permissions
* Trigger workflows
* Store ownership or authority
* Encode business rules

Apartment is **referenced**, never **executed**.

---

### 4. Authorization Rules (Role-Based)

#### Admin (RWA / Society Admin)

**Allowed**

* Create apartments
* Read apartments within own society
* Update apartment identity fields (`apartmentCode`, `towerLabel`)

**Not Allowed**

* Use apartment as authority
* Assign user permissions implicitly
* Cross-society access

---

#### Guard

**Allowed**

* Read apartment (for visitor targeting and display)

**Not Allowed**

* Create apartments
* Update apartments
* Delete apartments

---

#### Resident

**Allowed**

* Read own apartment only

**Not Allowed**

* Create or modify apartments
* View other apartments
* Infer authority from apartment association

---

### 5. CRUD Authorization Matrix

| Action | Admin | Guard | Resident |
| ------ | ----- | ----- | -------- |
| Create | Yes   | No    | No       |
| Read   | Yes   | Yes   | Own only |
| Update | Yes   | No    | No       |
| Delete | No    | No    | No       |

Deletion is explicitly disallowed in MVP to avoid data integrity issues.

---

### 6. How Apartment Is Used in System Flow

* **User onboarding**

  * Resident is linked to one Apartment
* **Visitor flow**

  * Visitor always targets exactly one Apartment
* **Complaint flow**

  * Complaint always resolves to an Apartment
* **Authorization**

  * Apartment is used only as a **filter**, never as a decision-maker

All enforcement happens in **service logic**, not in the model.

---

### 7. Invariants (Hard Rules)

* Apartment always belongs to **one Society**
* ApartmentCode is **unique within deployment**
* Apartment never exists without Society
* No cross-society references allowed
* Apartment is immutable in identity semantics

---

### 8. Future Add-Ons (Explicitly Deferred, Non-Breaking)

These can be added later without breaking MVP:

* Floor number
* Unit type (1BHK / 2BHK / 3BHK)
* Area (sqft)
* Occupancy status
* Multiple residents per apartment
* Parking slots linkage

All such fields remain **descriptive**, not authoritative.

---

### 9. Final Lock Statement

* Apartment is a **physical identity + scope anchor**
* It holds **no authority**
* It enables clean visitor and resident flows
* This contract is **MVP-frozen**

Next in correct sequence (as per your project flow):
**User Model — Authorization Rules**, since User is the only true authority holder.

Say when to proceed.
