# Technical Report

## Proposed User Identity & Authorization Architecture

### Clerk Authentication with Backend-Owned Authorization and Domain Data

**Author: Ritik** <br>
**Date:** January 25, 2026 <br>
**Project:** Society Management SaaS <br>

---

## 1. Executive Summary

This report outlines a recommended architecture for managing user identity, authentication, and authorization in the Society Management SaaS project. The core proposal is to use **Clerk** exclusively for **authentication**, while storing and managing **authorization roles** and **domain-specific user data** (e.g., society, apartment, role) in our own application database. This separation of concerns enhances security, scalability, data integrity, and maintainability.

---

## 2. Background

Clerk is a third-party authentication service that provides user sign-up, sign-in, session management, and basic profile storage. Clerk also provides metadata fields on the user object (public, private, and unsafe metadata). Metadata can store additional attributes for users, but it is not intended to replace a full application database or serve as the authoritative source for business logic.

In our MVP (Minimum Viable Product), user roles (e.g., resident, admin), society association, and apartment linkage are central to authorization and business processes. These require robust, secure, queryable, and relational storage — responsibilities better satisfied by our backend database.

---

## 3. Problem Statement

The default Clerk metadata approach binds extra user information directly to the Clerk user object. While Clerk allows storing arbitrary metadata fields, using Clerk metadata as the authoritative source for authorization and business identity has several limitations:

* **Limited control over relational constraints**
  Metadata is flat key/value storage, not relational data.

* **Security and trustworthiness concerns**
  Public metadata must be updated by the backend; unsafe metadata can be modified by the client.

* **Performance and scale limitations**
  Complex queries, joins, and domain logic (e.g., multi-tenant policies) are inefficient or unsupported.

* **Mismatch with application domain logic**
  Business logic such as society membership, apartment assignment, and role hierarchies require structured storage.

---

## 4. Proposed Solution

Use Clerk strictly for authentication and session management; manage user roles and domain data in the application database.

### 4.1 Architecture Overview

1. **Clerk Authentication**

   * Clerk handles user identification, sign-in, sign-up, and session validation.
   * The authenticated user receives a session token used for backend API calls.

2. **Backend Database Authorization**

   * Store a user profile table keyed by `clerkUserId`.
   * Store application metadata such as:

     * Role (resident, admin, guard, etc.)
     * Society ID
     * Apartment ID
     * Additional business attributes (onboard status, preferences, etc.)

3. **Frontend → Backend Interaction**

   * Frontend collects registration data (role, society, apartment, etc.).
   * Sends it to backend API with authenticated Clerk session.
   * Backend validates Clerk session and writes to internal database.

4. **Authorization Enforcement**

   * Backend services query the database using the authenticated `clerkUserId`.
   * Enforce role-based and multi-tenant (society/apartment) authorization.

### 4.2 Data Flow Diagram

```
[User] 
   | 1. Sign In / Sign Up
   v
[Clerk Auth Service]
   | Returns session token
   v
[Frontend Application]
   | 2. Send registration/role data + token
   v
[Backend API (auth middleware)]
   | 3. Validate token
   | 4. Persist in Application DB
   v
[Application Database]
   | 5. Store user profile with clerkUserId, role, society, etc.
```

---

## 5. Benefits of the Proposed Architecture

### 5.1 Separation of Concerns

Clerk focuses on authentication (security tokens, session management), while the backend owns business logic and authorization. This aligns with industry best practices.

### 5.2 Enhanced Security

Storing roles and sensitive data in our database prevents client tampering and enforces server-side control.

### 5.3 Data Integrity and Enforcement

Relational constraints (e.g., unique society membership, apartment assignments) can be enforced via database schemas and backend validations.

### 5.4 Scalability and Maintainability

Authorization logic, audit trails, and domain policies can be evolved independently without dependence on third-party metadata structures.

### 5.5 Auditability and Logging

Backend systems can log and monitor authorization decisions, user changes, and policy enforcement.

---

## 6. Detailed Implementation Plan

### 6.1 Database Schema (Example)

| Table        | Key Fields                                                                        |
| ------------ | --------------------------------------------------------------------------------- |
| `users`      | `id`, `clerkUserId`, `role`, `societyId`, `apartmentId`, `createdAt`, `updatedAt` |
| `societies`  | `id`, `name`, `address`                                                           |
| `apartments` | `id`, `societyId`, `number`                                                       |

> `clerkUserId` is a foreign key linking the application user to the authenticated identity managed by Clerk.

---

### 6.2 Backend API Example

**Endpoint:** `POST /api/user/register`

* **Input (JSON):**

  ```json
  {
    "clerkUserId": "string",
    "role": "string",
    "societyId": "string",
    "apartmentId": "string"
  }
  ```

* **Processing:**

  1. Validate Clerk session/token.
  2. Compare `clerkUserId` from token with request body.
  3. Persist user profile to database.

* **Output:**

  ```json
  {
    "success": true,
    "userId": "dbGeneratedId"
  }
  ```

---

## 7. Authorization Enforcement (Example)

Example policy in backend service:

```js
const currentUser = await db.user.findUnique({ where: { clerkUserId } });

if (!currentUser || currentUser.role !== 'admin') {
  throw new AuthorizationError("User not authorized for this action");
}
```

---

## 8. Risk Analysis

| Risk                               | Mitigation                              |
| ---------------------------------- | --------------------------------------- |
| Storing sensitive data in metadata | Store in backend database only          |
| Token mismatch                     | Strict backend token validation         |
| Data inconsistency                 | Referential integrity constraints in DB |

---

## 9. Conclusion

The separation of authentication (Clerk) from authorization and domain data (backend database) provides a secure, scalable, maintainable, and auditable architecture. It supports complex authorization logic essential for multi-tenant systems like the Society Management SaaS.

This architecture aligns with best practices and prepares the application for future growth.
