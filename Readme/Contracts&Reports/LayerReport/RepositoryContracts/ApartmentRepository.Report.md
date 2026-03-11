# Apartment Repository `create()` Strategy — Engineering Decision Report

## Context

The repository method is responsible for **persisting Apartment documents** while remaining consistent with the system’s architectural principles:

* repositories perform **persistence only**
* business logic stays in **services**
* transactions must be **supported**
* middleware and validation must **execute reliably**
* the API must remain **stable if small batch writes are needed**

The selected implementation:

```ts
create: async (
  data: {
    apartmentCode: string;
    towerLabel?: string;
    societyId: Types.ObjectId;
  },
  options?: CreateOptions
) => {

  const createOptions = options?.session
    ? { session: options.session }
    : undefined;

  const docs = await Apartment.create([data], createOptions);

  return docs[0];
}
```

---

# Core Design Goals

This approach was chosen to satisfy five critical backend requirements:

1. **Single document creation must be simple**
2. **Small batch creation must remain possible**
3. **Mongoose middleware must execute**
4. **Transaction sessions must be supported**
5. **Repository API must remain stable**

---

# Key Design Decisions

## 1. Using `create([data])` Instead of `create(data)`

Although Mongoose allows both:

```
create(data)
create([data])
```

the repository deliberately uses the **array form**.

### Reason

The array form provides **forward compatibility for batch writes**.

The repository API can later support:

```
create([doc1, doc2, doc3])
```

without changing the internal persistence logic.

Even when only one document is passed, using `[data]` ensures the same execution path.

This keeps the repository **consistent and predictable**.

---

## 2. Returning `docs[0]`

`Model.create()` returns an array when the input is an array.

Since the current repository method represents **single document creation**, it returns:

```
docs[0]
```

This preserves a **clean service contract**:

```
ApartmentRepository.create() → ApartmentDocument
```

rather than returning an array.

---

# Why Other Paths Were Not Selected

## Option 1 — `new Model(data).save()`

Example:

```
const doc = new Apartment(data);
await doc.save({ session });
```

### Advantages

* maximum document lifecycle control
* explicit instance creation
* middleware execution

### Problems

1. **No batch support**

To create multiple documents:

```
for (...) {
  new Apartment().save()
}
```

This results in multiple sequential database operations.

2. **Unnecessary complexity**

The repository becomes responsible for looping and orchestration.

That responsibility belongs in the **service layer**, not persistence.

### Decision

Rejected because it **limits scalability and flexibility**.

---

## Option 2 — `insertMany()`

Example:

```
Apartment.insertMany([data], { session })
```

### Advantages

* fastest bulk insertion
* optimized database operation

### Critical Problem

`insertMany()` **does not run `save` middleware by default**.

This breaks guarantees for:

* schema validation
* hooks
* audit logic
* derived fields

Since the system depends on **model middleware for correctness**, this path is unsafe.

### Decision

Rejected due to **middleware bypass risk**.

---

## Option 3 — `create(data)` (non-array)

Example:

```
Apartment.create(data)
```

### Advantages

* simple syntax
* clean return type

### Problem

This prevents **natural scaling to batch writes**.

Supporting batch writes would require a **second repository method**, such as:

```
createMany()
```

This leads to unnecessary API fragmentation.

### Decision

Rejected to keep a **single consistent creation pathway**.

---

# Why Conditional Session Construction Is Used

```
const createOptions = options?.session
  ? { session: options.session }
  : undefined;
```

### Reason

Mongoose TypeScript definitions contain **multiple overloads for `create()`**.

If the options object always includes `session`, but the value is possibly `undefined`, TypeScript fails to resolve the correct overload.

By constructing the options object conditionally, two clear call signatures exist:

```
Apartment.create([data])
Apartment.create([data], { session })
```

This prevents **TypeScript overload ambiguity**.

---

# Middleware Behavior

This implementation guarantees execution of:

* `pre('validate')`
* `pre('save')`
* `post('save')`
* schema validation
* default values

Because internally:

```
Model.create() → internally calls document.save()
```

This ensures **behavior parity with manual document saves**.

---

# Transaction Compatibility

The method supports MongoDB transactions through:

```
{ session }
```

which allows the repository to participate in service-level transaction flows.

Example service flow:

```
session.startTransaction()

ApartmentRepository.create(..., { session })
UserRepository.create(..., { session })

session.commitTransaction()
```

This keeps transaction orchestration **outside the repository**, preserving architectural boundaries.

---

# Final Architectural Outcome

The selected implementation provides the best balance of:

* middleware safety
* transaction support
* future batch capability
* clean repository abstraction
* minimal API surface
* TypeScript compatibility

while maintaining the **single responsibility of the repository: persistence only**.

---

# Summary

The chosen approach:

```
Model.create([data], options)
```

was selected because it:

* preserves middleware guarantees
* supports transactions
* allows future batch writes
* keeps repository APIs stable
* avoids Mongoose TypeScript overload conflicts

while rejecting alternatives that sacrifice **middleware correctness, scalability, or architectural clarity**.

---

If you want, I can also show you a **production-grade repository write pattern used in large Node.js systems** that avoids **95% of the TypeScript + Mongoose overload headaches** you are currently hitting.
