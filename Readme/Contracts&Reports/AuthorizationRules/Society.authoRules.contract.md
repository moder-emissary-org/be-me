## Society Model — Authorization Rules (MVP Contract)

### 1. What the Society Model Represents

* Society is a **pure tenant boundary and scope container**.
* It exists only to:

  * Group Apartments
  * Scope Users
  * Scope all operational data (Visitors, Complaints, Notices, etc.)

Society **does not represent governance, ownership, or authority**.

---

### 2. Who Can Act on Society (Role-Based)

#### Admin (RWA / Society Admin)

**Allowed**

* Create Society (system/bootstrap phase only)
* View Society details (name, address)
* Update Society **identity fields only** (name, address)

**Not Allowed**

* Assign roles via Society
* Act as authority because of Society
* Manage users implicitly through Society
* Perform operational actions merely by “being admin of society”

Admin power always flows from **User role**, never from Society.

---

#### Guard

**Allowed**

* Read Society (context only; name/address for display)

**Not Allowed**

* Create Society
* Update Society
* Delete Society
* Infer permissions from Society

---

#### Resident

**Allowed**

* Read Society (contextual visibility only)

**Not Allowed**

* Create / update Society
* Act on behalf of Society
* Infer authority from Society membership

---

### 3. CRUD Authorization Matrix (Explicit)

| Action | Admin | Guard | Resident |
| ------ | ----- | ----- | -------- |
| Create | Yes*  | No    | No       |
| Read   | Yes   | Yes   | Yes      |
| Update | Yes** | No    | No       |
| Delete | No    | No    | No       |

* Creation only during onboarding/bootstrap
** Update limited strictly to `name`, `address`

---

### 4. What Society Can NEVER Do (Hard Rules)

Society **must never**:

* Store admin IDs, manager IDs, or authority fields
* Own permissions or roles
* Decide access rights
* Trigger notifications
* Act as a workflow initiator
* Contain business logic

All authorization decisions live in:

* **User**
* **Service layer**
* **Request context**

---

### 5. Why This Design (Rationale)

* Prevents **authority leakage**
* Avoids **future refactors when scaling**
* Keeps tenant boundary clean and stable
* Supports:

  * Single-society MVP
  * Multi-society future
  * Enterprise-grade RBAC later

Society remains **structurally frozen** while authorization evolves safely.

---

### 6. Future Add-Ons (Non-Breaking, Explicitly Deferred)

These may be added later **without breaking MVP**:

* City / State / Country (pure metadata)
* Registration / legal identifiers
* Contact information
* Multi-society super-admin (outside Society model)
* Society settings (in separate config model)

None of these introduce authority into Society itself.

---

### 7. Final Lock Statement

* Society is **identity + scope only**
* Authorization is **User-owned**
* Business logic is **service-enforced**
* This contract is **MVP-locked**

From here, the **next correct step**—as you stated—is to define **User Authorization Rules**, since *all real power lives there*.

Say when to proceed.
