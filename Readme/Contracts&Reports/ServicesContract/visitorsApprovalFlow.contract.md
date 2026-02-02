Below is a **precise, compact, and authoritative report** that packages the decision cleanly without over-explaining or introducing new scope. This document is meant to be **read once and locked**.

---

# In-App Visitor Approval — MVP Execution Report

> **Scope:** Minimal, In-App Approval Assist
> **Status:** Finalized & Aligned with Visitor MVP Contract
> **Model Impact:** None (Visitor remains the sole model)

---

## 1. What This Is

A **minimal in-app visitor approval mechanism** where:

* Guards create visitor records
* Residents approve visitors via a **single in-app action**
* The same approval is **instantly reflected** in the guard’s interface

This is implemented as a **shared Visitor state mutation**, not a request–response workflow.

---

## 2. What This Is NOT

This is **not**:

* A visitor request model
* A resident workflow engine
* A messaging or notification system
* An approval lifecycle with retries, expiries, or responses
* A WhatsApp-based approval mechanism

There are **no new domain models** introduced.

---

## 3. Why This Design

### Operational Accuracy

* Guards operate entry
* Residents authorize access
* Admins remain supervisory

This mirrors real society behavior without forcing it into artificial system flows.

### MVP Discipline

* One source of truth (Visitor)
* No asynchronous state management
* No dependency on message delivery

Approval correctness never depends on notifications.

---

## 4. How It Works (Precisely)

### Guard Flow

1. Guard creates a Visitor record

   * `status = "pending"`
   * `approvedBy = undefined`

2. Guard waits for approval (offline or in-app)

### Resident Flow

3. Resident sees “Visitor waiting” (in-app)
4. Resident taps **Approve**

### System Mutation

5. Visitor record is updated:

   * `approvedBy = residentUserId`
   * `status = "upcoming"`

### Guard Interface

6. Guard dashboard reflects approval immediately
7. Guard controls entry and exit as usual

This is **one state transition**, not a conversation.

---

## 5. WhatsApp (Optional, Assistive Only)

WhatsApp may be used as a **best-effort nudge**:

* Purpose: bring the resident into the app
* Not used for approval itself
* No delivery guarantees
* No message state stored

If WhatsApp fails, the system remains correct.

---

## 6. Authorization Invariants

* Only residents linked to the apartment can approve
* Only `pending` visitors can be approved
* Approval is a single irreversible action (in MVP)
* Guards remain the executors of physical entry/exit

All enforced at the service layer.

---

## 7. Future Add-Ons (Non-Breaking)

This design safely allows later addition of:

* Reject / cancel actions
* Approval comments
* Expiry timers
* Resident-initiated visitor creation
* OTP / QR workflows
* Full notification subsystems

All as **extensions**, not refactors.

---

## 8. Final Position

* Visitor remains the **only source of truth**
* Approval is a **shared-state mutation**
* Notifications are **assistive, never authoritative**
* No workflow models are introduced in MVP

This approach is **minimal, realistic, scalable, and locked**.

---

If you want, the next clean lock would be a **Visitor State Transition Table** or a **role × action × scope authorization matrix**.
