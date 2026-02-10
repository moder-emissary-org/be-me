Good — you’re not “distracted”, you’ve just hit a **product–architecture fork**, and it’s the right moment to resolve it deliberately. Let’s slow this down and re-anchor.

I’ll do three things, in order:

1. Untangle the **confusion**
2. Propose a **clean MVP registration model** that fits your domain
3. Translate that model back into **technical rules** so the code becomes obvious again

No hand-waving, no overengineering.

---

### 1. Why you feel distracted (this is normal)

You were thinking in **technical terms** (role escalation, controller safety), and suddenly you zoomed out into **product reality** (“MyGate does X, societies work like Y”). <br>
That’s not confusion — that’s the **correct direction of thought**. <br>
The mistake would be to design registration as a *generic user sign-up* like a consumer app. <br>
Your product is **B2B-ish, tenant-scoped, and authority-driven**. <br>
So yes: **registration is not “anyone can sign up”**. <br>

---

### 2. The core truth (lock this first)

In your system:

> **A society exists before residents exist. <br>
> Authority exists before users exist.** <br>

That immediately implies:

• There is **one bootstrap actor** <br>
• Everyone else is created *inside* the system <br>

This is exactly how MyGate, NoBrokerHood, etc. work — they just hide it behind marketing forms.

---

### 3. Correct MVP registration model (simple, not fancy)

#### Phase 1: Society bootstrap (one-time)

This is **not normal registration**.

Who does this?
• Society president / secretary / RWA member <br>

What happens?
• A **Society** is created <br>
• An **Admin user** is created <br>
• This user becomes the **root authority** for that society <br>

This is the **only place** where `role = admin` is allowed. <br>

This flow can ask for: <br>
• Society name <br>
• Address <br>
• Admin name <br>
• Admin phone/email <br>
• Designation (optional, informational) <br>

Technically: <br>
• Public endpoint <br>
• Clerk-authenticated <br>
• Hardcoded role = `admin` <br>
• No choice in UI or API <br>

---

#### Phase 2: In-app user creation (controlled)

Once logged in as admin: <br>

Admin can: <br>
• Create residents (apartment-mapped) <br>
• Create guards <br>

These are **not registrations**. <br>
They are **admin actions**. <br>

Rules: <br>
• Admin chooses role <br>
• Admin assigns apartment (for residents) <br>
• Guards have no apartment <br>
• Users receive invite / first login later <br>

This is where `role` can be passed — but **only from an admin-only service**. <br>

---

#### Phase 3: Normal usage

Residents and guards: <br>
• Never choose roles <br>
• Never create other users <br>
• Never touch society boundaries <br>

---

### 4. Why this resolves your “dangerous role” concern

Because now: <br>

• Self-registration endpoint: <br>
– role is **not accepted** <br>
– role is hardcoded to `admin` <br>
– society is created here <br>

• Admin-create-user endpoint: <br>
– protected by admin authorization <br>
– role is validated and constrained <br>

So this line disappears from public registration forever:

```ts
role: req.body.role // ❌ gone
```

And becomes:

```ts
role: 'admin' // society bootstrap
```

or, in admin flow:

```ts
assertAdmin(currentUser);
assertAllowedRole(targetRole);
```

No ambiguity. No escalation vector.

---

### 5. Why copying MyGate’s exact form is a trap (important)

MyGate collects: <br>
• Names <br>
• Phones <br>
• Designations <br>
• States <br>

But those are **sales + onboarding fields**, not core domain models. <br>

You do NOT need: <br>
• designation (MVP) <br>
• state normalization <br>
• marketing metadata <br>

You only need: <br>
• Society identity <br>
• One authority user <br>
• Internal consistency <br>

You can add fluff later without breaking anything.

---

### 6. Technical clarity restored

Now your controller confusion disappears:

• Registration controller = **society bootstrap** <br>
• No `role` from request <br>
• No authorization checks <br>
• One invariant: “this creates the root admin” <br>

Everything else becomes **admin-only services**, not registration. <br>

---

### Final anchor sentence (memorize this)

> **Registration creates authority. <br>
> Everything else is user management.** <br>

You weren’t wrong. <br>
You just reached the point where **product truth must override generic auth patterns**. <br>

If you want, next we can: <br>
• lock the **Society Bootstrap API contract** <br>
• redesign the registration controller cleanly <br>
• map exact MVP flows: bootstrap → admin dashboard → add users <br>
