### Apartment and Societies Management System — Backend (`be-me`)

Base URL prefix for all HTTP APIs: **`/api/v1`**

Authentication: most routes use **Clerk** (`clerkMiddleware`). The caller must send a valid Clerk session unless noted otherwise.

---

## API inventory (current)

**37 routes** are registered across 8 modules (including 8 `/test` smoke endpoints).  
**Implementation status:** **13** wired to real service logic · **1** partial (bulk apartments reuses single-create) · **15** stub controllers · **8** smoke `/test` handlers.

| # | Module | Method | Full path | Auth | Intended role | Status | Purpose |
|---|--------|--------|-----------|------|---------------|--------|---------|
| 1 | Health | `GET` | `/api/v1/healthcheck/health` | None | — | ✅ Implemented | Liveness check; reports DB connection and uptime |
| 2 | Webhooks | `GET` | `/api/v1/webhooks/clerk/test` | None | — | Smoke | Verify Clerk webhook router is mounted |
| 3 | Webhooks | `POST` | `/api/v1/webhooks/clerk/persist-user-through-webhook` | Svix signature | Clerk → backend | ✅ Implemented | On `user.created`, persist minimal user record in MongoDB |
| 4 | Users | `GET` | `/api/v1/users/test` | None | — | Smoke | Verify user router is mounted |
| 5 | Users | `GET` | `/api/v1/users/me` | Clerk | Any authenticated | ✅ Implemented | Resolve caller → internal user, role, permissions, society/apartment scope |
| 6 | Users | `POST` | `/api/v1/users/bootstrap` | Clerk | Invited user | ✅ Implemented | Register/bootstrap a user into a society (role, `societyId`, optional `apartmentId`) |
| 7 | Users | `POST` | `/api/v1/users/invite` | Clerk | Admin | ✅ Implemented | Send Clerk invitation for `resident` or `guard` in admin’s society |
| 8 | Users | `PATCH` | `/api/v1/users/:userId/assign-apartment` | Clerk | Admin | ✅ Implemented | Assign a society member to an apartment |
| 9 | Users | `POST` | `/api/v1/users/create` | Clerk | Admin (planned) | 🚧 Stub | Create user directly (controller logs only; service not wired) |
| 10 | Societies | `GET` | `/api/v1/societies/test` | None | — | Smoke | Verify society router is mounted |
| 11 | Societies | `POST` | `/api/v1/societies/bootstrap` | Clerk | First-time admin | ✅ Implemented | Create society + admin user in one transaction |
| 12 | Apartments | `GET` | `/api/v1/apartments/test` | None | — | Smoke | Verify apartment router is mounted |
| 13 | Apartments | `POST` | `/api/v1/apartments/create` | Clerk | Admin | ✅ Implemented | Create a single apartment (`apartmentCode`, `towerLabel`) in caller’s society |
| 14 | Apartments | `POST` | `/api/v1/apartments/bulk-create` | Clerk | Admin | 🚧 Partial | Same handler as `/create`; dedicated bulk logic not implemented |
| 15 | Apartments | `PATCH` | `/api/v1/apartments/update` | Clerk | Admin | 🚧 Stub | Update apartment details |
| 16 | Apartments | `GET` | `/api/v1/apartments/get` | Clerk | Admin | 🚧 Stub | Get one apartment |
| 17 | Apartments | `GET` | `/api/v1/apartments/get-apartment-list` | Clerk | Admin | 🚧 Stub | List apartments for society |
| 18 | Apartments | `GET` | `/api/v1/apartments/delete` | Clerk | Admin | 🚧 Stub | Delete apartment (note: uses `GET`, not `DELETE`) |
| 19 | Visitors | `GET` | `/api/v1/visitors/test` | None | — | Smoke | Verify visitor router is mounted |
| 20 | Visitors | `GET` | `/api/v1/visitors/visitors` | Clerk | Admin | 🚧 Stub | List all visitors for society |
| 21 | Visitors | `POST` | `/api/v1/visitors/create` | Clerk | Guard | ✅ Implemented | Register a visitor for a resident apartment |
| 22 | Visitors | `POST` | `/api/v1/visitors/check-in` | Clerk | Guard | 🚧 Stub | Mark visitor checked in at gate |
| 23 | Visitors | `POST` | `/api/v1/visitors/check-out` | Clerk | Guard | 🚧 Stub | Mark visitor checked out |
| 24 | Visitors | `GET` | `/api/v1/visitors/pending` | Clerk | Resident | ✅ Implemented | Paginated pending visitors for resident’s apartment |
| 25 | Visitors | `PATCH` | `/api/v1/visitors/:visitorId/approval` | Clerk | Resident | ✅ Implemented | Approve or reject a pending visitor |
| 26 | Complaints | `GET` | `/api/v1/complaints/test` | None | — | Smoke | Verify complaint router is mounted |
| 27 | Complaints | `POST` | `/api/v1/complaints/create` | Clerk | Resident + admin (with apartment) | ✅ Implemented | Create complaint for caller’s society and apartment |
| 28 | Complaints | `GET` | `/api/v1/complaints/get` | Clerk | — | 🚧 Stub | Get single complaint |
| 29 | Complaints | `GET` | `/api/v1/complaints/` | Clerk | Admin | 🚧 Stub | List all complaints in society |
| 30 | Complaints | `PATCH` | `/api/v1/complaints/:complaintId/status` | Clerk | Admin | ✅ Implemented | Update lifecycle status and optional admin remark |
| 31 | Complaints | `DELETE` | `/api/v1/complaints/:id/delete` | Clerk | Admin (planned) | 🚧 Stub | Delete a complaint |
| 32 | Notices | `GET` | `/api/v1/notices/test` | None | — | Smoke | Verify notice router is mounted |
| 33 | Notices | `POST` | `/api/v1/notices/create` | Clerk | Admin (planned) | 🚧 Stub | Publish a society notice |
| 34 | Notices | `PATCH` | `/api/v1/notices/update` | Clerk | Admin (planned) | 🚧 Stub | Update a notice |
| 35 | Notices | `GET` | `/api/v1/notices/get` | Clerk | Any (planned) | 🚧 Stub | Get one notice |
| 36 | Notices | `GET` | `/api/v1/notices/get-all-notices` | Clerk | Any (planned) | 🚧 Stub | List notices for society |
| 37 | Notices | `DELETE` | `/api/v1/notices/delete` | Clerk | Admin (planned) | 🚧 Stub | Delete a notice |

**Not registered (commented in routes):** `PATCH /api/v1/users/:userId/deactivate` — admin deactivate user.

---

## Module guide (by domain)

### Health

- **`GET /api/v1/healthcheck/health`** — Public health probe. Returns `503` if MongoDB is disconnected.

### Webhooks (Clerk)

- **`POST /api/v1/webhooks/clerk/persist-user-through-webhook`** — Clerk server-to-server webhook (raw JSON body + Svix headers). Creates a backend user stub when Clerk fires `user.created`.

### Users

- **`GET /api/v1/users/me`** — Foundation endpoint: who am I, what role, which society/apartment. All UIs and downstream APIs should depend on this contract.
- **`POST /api/v1/users/bootstrap`** — After Clerk sign-up/invite, link the Clerk user to a society role (`resident` | `guard`) and optional apartment.
- **`POST /api/v1/users/invite`** — Admin invites a resident or guard by email (Clerk invitation + pending membership).
- **`PATCH /api/v1/users/:userId/assign-apartment`** — Admin links a member to an apartment in the same society.
- **`POST /api/v1/users/create`** — Planned admin-driven user creation; not implemented yet.

### Societies

- **`POST /api/v1/societies/bootstrap`** — One-shot onboarding: create society record and promote the authenticated Clerk user as **admin** for that society.

### Apartments

- **`POST /api/v1/apartments/create`** — Admin adds an apartment unit to their society.
- **`POST /api/v1/apartments/bulk-create`** — Intended for batch import; currently aliases single-create handler.
- **Read/update/delete/list** routes exist but controllers are placeholders.

### Visitors

**Admin**

- **`GET /api/v1/visitors/visitors`** — List visitors (stub).

**Guard**

- **`POST /api/v1/visitors/create`** — Log a visitor against a resident apartment.
- **`POST /api/v1/visitors/check-in`** / **`check-out`** — Gate operations (stubs).

**Resident**

- **`GET /api/v1/visitors/pending`** — Visitors awaiting approval for the resident’s apartment.
- **`PATCH /api/v1/visitors/:visitorId/approval`** — Approve or reject a visit request.

### Complaints

**Resident + admin (must have apartment on profile)**

- **`POST /api/v1/complaints/create`** — File a complaint (`title`, `description`, `category`) scoped to caller’s society and apartment.

**Admin**

- **`GET /api/v1/complaints/`** — List society complaints (stub).
- **`PATCH /api/v1/complaints/:complaintId/status`** — Move complaint through workflow; optional `adminRemark`.
- **`DELETE /api/v1/complaints/:id/delete`** — Remove complaint (stub).

**Shared (stub)**

- **`GET /api/v1/complaints/get`** — Single complaint detail.

### Notices

All five notice routes are registered and authenticated, but controllers only return success messages until notice services are built.

---

## Quick counts

| Category | Count |
|----------|------:|
| Total registered routes | 37 |
| Smoke `/test` routes | 8 |
| Production-facing routes | 29 |
| Fully implemented (service layer) | 13 |
| Partial (route exists, incomplete logic) | 1 |
| Stub (placeholder controller) | 15 |

---

## Related docs

Read all project readmes from [`moder-emissary-org/be-me-docs`](https://github.com/moder-emissary-org/be-me-docs/) — especially `/me` contract notes under `Readme/Contracts&Reports/RoutesReports/`.

Route source files: `be-me/src/routes/**` · Mount points: `be-me/src/app.ts`

&copy; Backend project managed by ME.
