Below is a **concrete, end-to-end example** showing **exactly how you use the layered error classes in practice**—with no abstractions missing and no controller leakage.

I will show:

1. **Service logic throwing errors**
2. **Repository throwing errors**
3. **Service translating repository errors**
4. **Controller doing nothing except calling**
5. **What the user actually sees**

This is **the canonical usage pattern**.

---

# 1. Service Layer Example (registerUser)

### Scenario

* Required field missing
* Duplicate user
* Happy path

```ts
import { ServiceError } from '../errors/ServiceError';
import { RepositoryError } from '../errors/RepositoryError';
import { saveUser } from '../repositories/saveUser.repository';

export async function registerUser(input: RegisterUserInput) {
  // 1️⃣ Structural validation
  const missingFields: string[] = [];

  if (!input.clerkUserId) missingFields.push('clerkUserId');
  if (!input.email) missingFields.push('email');
  if (!input.societyId) missingFields.push('societyId');
  if (!input.role) missingFields.push('role');

  if (missingFields.length > 0) {
    throw new ServiceError(
      'SERVICE_INPUT_INVALID',
      'Required fields missing',
      { missingFields },
    );
  }

  // 2️⃣ Business rule
  if (input.role === 'resident' && !input.apartmentId) {
    throw new ServiceError(
      'ROLE_CONSTRAINT_VIOLATION',
      'Resident must be linked to an apartment',
      { role: input.role },
    );
  }

  // 3️⃣ Construct domain object
  const userToPersist = {
    clerkUserId: input.clerkUserId,
    email: input.email,
    role: input.role,
    societyId: input.societyId,
    apartmentId: input.apartmentId ?? null,
    isActive: true,
  };

  // 4️⃣ Persistence with translation
  try {
    return await saveUser(userToPersist);
  } catch (err) {
    if (err instanceof RepositoryError) {
      if (err.code === 'DB_DUPLICATE_KEY') {
        throw new ServiceError(
          'USER_ALREADY_REGISTERED',
          'User already exists',
          { clerkUserId: input.clerkUserId },
        );
      }
    }

    // Unknown repository failure
    throw err;
  }
}
```

### What matters

* Service **throws ServiceError**
* No HTTP
* No Sentry
* No response shaping
* Truthful error messages

---

# 2. Repository Example (saveUser.repository.ts)

```ts
import { RepositoryError } from '../errors/RepositoryError';

export async function saveUser(user) {
  try {
    return await UserModel.create(user);
  } catch (err: any) {
    if (err.code === 11000) {
      throw new RepositoryError(
        'DB_DUPLICATE_KEY',
        'Duplicate key while saving user',
        { index: err.keyPattern },
      );
    }

    throw new RepositoryError(
      'DB_WRITE_FAILED',
      'Failed to persist user',
      { originalError: err },
    );
  }
}
```

### What matters

* Repository never throws domain language
* DB error codes are mapped immediately
* No controller logic here

---

# 3. Controller Example (Thin by Design)

```ts
export async function registerUserController(req, res, next) {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}
```

That’s it.

* No error mapping
* No status decisions
* No conditionals

---

# 4. Global Error Handler (Already Defined)

The handler:

* Detects `ServiceError`
* Maps it to HTTP
* Generates `errorId`
* Sends safe message to user
* Sends rich data to Sentry

You already designed this.

---

# 5. What the User Actually Sees

### Example response

```json
{
  "message": "Some required information is missing.",
  "errorId": "a7d1c5b4-3f89-4a9d-bd21-92fd10e33a12"
}
```

User never sees:

* Missing field names
* Role rules
* Stack traces
* DB errors

Support asks for `errorId`.

---

# 6. Mental Checklist (Use This While Coding)

When writing service logic, ask:

1. ❓ Is this a **missing field**?
   → `SERVICE_INPUT_INVALID`

2. ❓ Is this a **business rule violation**?
   → `ROLE_CONSTRAINT_VIOLATION`, `OPERATION_NOT_ALLOWED`

3. ❓ Is this a **duplicate / conflict**?
   → Translate from repository → `USER_ALREADY_REGISTERED`

4. ❓ Is this **unexpected**?
   → Let it bubble → `INTERNAL_ERROR`

---

# 7. One-Line Rule (Memorize This)

> **If the service knows *why* it failed, throw a ServiceError.**

---

## Where This Gets You

* Predictable behavior
* Debuggable incidents
* Clean controllers
* Zero refactors later
* Professional SaaS-grade error handling

If you want next, I can:

* Show **unit tests for service errors**
* Add **error translation helpers**
* Show **frontend error handling pattern**
* Extend this to **authorization errors**

Tell me what to do next.
