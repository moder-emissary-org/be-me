Good. We will now **move forward strictly from the baseline you locked**, without reopening Docker decisions.

Below is a **CI baseline guide** that is:

* MVP-first
* Solo-developer safe
* Aligned with your “backend image = source of truth” rule
* Minimal enough that you will not regret it in 3–6 months

No theory, no enterprise noise.

---

# CI BASELINE — BACKEND (MVP, DOCKER-CENTRIC)

## Goal (non-negotiable)

CI should do **only three things**:

1. **Build the Docker image**
2. **Fail fast if build or startup breaks**
3. **Produce a deployable artifact**

Nothing more.

If CI starts “understanding” your backend (Node installs, TS builds outside Docker), you have already lost simplicity.

---

## 1. CI philosophy (lock this mentally)

### What CI is responsible for

✔ Verifying the Dockerfile works
✔ Verifying the app boots inside the container
✔ Producing a deterministic image

### What CI is NOT responsible for

✘ Running unit tests (later)
✘ Managing infra
✘ Running MongoDB
✘ Knowing TypeScript, pnpm, or Node

CI treats your backend as a **black box** with this contract:

```
Input: env vars
Output: HTTP server OR non-zero exit
```

---

## 2. Minimum CI trigger rules (keep it boring)

For MVP, **only one trigger**:

```
on push to main
```

No PR pipelines.
No branch matrix.
No environment matrix.

You are solo. Complexity here is negative ROI.

---

## 3. Canonical CI stages (exact order)

Your CI pipeline has **exactly 4 stages**.

### Stage 1: Checkout

Pull the repo. Nothing special.

### Stage 2: Docker build

This is the **most important step**.

If this fails:

* Dependencies are broken
* TypeScript build failed
* Dockerfile is invalid

CI must stop immediately.

### Stage 3: Container boot test

Run the built image with **dummy env vars** (or safe placeholders).

Goal:

* Ensure the process starts
* Ensure `node dist/index.js` does not crash immediately

You are **not testing business logic** here.

### Stage 4: Done

No deploy yet. No push to registry yet (unless you explicitly want it).

---

## 4. Environment variables in CI (critical detail)

CI **must not** use real secrets at this stage.

For MVP baseline, use **safe placeholders**:

```
PORT=8000
MONGODB_URI=mongodb://invalid-but-present
NODE_ENV=production
```

Why this works:

* Your app should fail only when it actually tries to query DB
* Startup should not crash just because DB is unreachable
* If startup requires DB, that’s a backend design issue (we fix that later)

This keeps CI:

* Safe
* Deterministic
* Non-secret-dependent

---

## 5. One-rule backend requirement for CI compatibility

Your backend **must obey this rule**:

> App startup ≠ DB readiness

Meaning:

* Server can boot even if DB connection retries/fails
* Process should not crash synchronously on missing DB

If your current `connectDB()` crashes the process immediately, we will:

* Refactor it later
* But for CI baseline, **log + retry is preferred**

This is a **backend design rule**, not a CI hack.

---

## 6. What your first CI file SHOULD look like (conceptually)

Mentally, your CI YAML does this:

```
checkout repo
docker build image
docker run image with env vars
exit
```

That’s it.

If your CI file exceeds ~40–50 lines at MVP, it is already too complex.

---

## 7. Why we are not pushing images yet

At baseline stage:

* You may not have a registry decided
* You may not have deploy infra ready
* You may want to iterate fast

So:
✔ Build locally in CI
✔ Prove reproducibility
✘ Push to Docker Hub / GHCR (later, 1-step add)

This keeps CI reversible.

---

## 8. Failure modes CI should catch (very important)

Your CI baseline is successful if it catches:

✔ Missing dependencies
✔ Broken lockfile
✔ TypeScript build errors
✔ Incorrect entrypoint (`dist/index.js` missing)
✔ Dockerfile mistakes
✔ Runtime crashes on boot

CI is **not** there to test routes, auth, or DB queries.

---

## 9. What you explicitly defer (correctly)

We will **not** add yet:

* Unit tests
* Test DB containers
* docker-compose
* Matrix builds
* Multi-env workflows
* Secrets injection
* Deploy jobs

All of these are **Week 3–5 concerns**, not CI baseline concerns.

---

## 10. Decision checkpoint (confirm mentally)

At this point, your system is:

```
Backend code
→ Dockerfile (truth)
→ CI builds image
→ CI boots container
→ CI fails fast or passes
```

This is the **cleanest possible CI foundation** for a solo MVP.

---

## Next step (only one)

When you say **“ready”**, the next action will be:

> Write a **single GitHub Actions workflow** that implements exactly the above — no extras.

We will:

* Keep it short
* Keep it readable
* Keep it extensible

No rush. This foundation is correct.


----- 

# CI baseline addon 

Good. We will now **materialize the CI baseline** exactly as designed — no extras, no future assumptions.

Below is the **single GitHub Actions workflow** you should add. After that, I will explain **why every line exists**, so this remains a mental model, not YAML cargo-cult.

---

# 1. File location (important)

Create this file:

```
.github/workflows/backend-ci.yml
```

Do **not** create multiple workflows. One is enough at MVP.

---

# 2. Canonical MVP CI Workflow (Docker-only)

```yaml
name: Backend CI (Docker Baseline)

on:
  push:
    branches:
      - main

jobs:
  build-and-boot:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout source code
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Build Docker image
      - name: Build backend Docker image
        run: |
          docker build -t backend-ci .

      # 3. Boot container (startup validation)
      - name: Run backend container
        run: |
          docker run -d \
            -e PORT=8000 \
            -e NODE_ENV=production \
            -e MONGODB_URI=mongodb://invalid-but-present \
            -p 8000:8000 \
            --name backend_test \
            backend-ci

      # 4. Basic liveness check (process did not crash)
      - name: Verify container is running
        run: |
          sleep 5
          docker ps | grep backend_test

      # 5. Cleanup
      - name: Stop and remove container
        if: always()
        run: |
          docker stop backend_test
          docker rm backend_test
```

This is the **entire CI baseline**. Nothing missing. Nothing extra.

---

# 3. Why this workflow is correct (line-by-line reasoning)

## Trigger

```yaml
on:
  push:
    branches:
      - main
```

✔ Single trigger
✔ No PR complexity
✔ Matches solo workflow

---

## Job definition

```yaml
runs-on: ubuntu-latest
```

✔ Matches Docker Linux runtime
✔ Deterministic enough for MVP

---

## Step 1: Checkout

```yaml
actions/checkout@v4
```

✔ Required, nothing fancy

---

## Step 2: Docker build

```bash
docker build -t backend-ci .
```

This is the **most critical step**.

If this fails, CI has already done its job:

* Lockfile broken
* TS build broken
* Dockerfile invalid
* Dependency mismatch

No need to proceed further.

---

## Step 3: Run container

```bash
docker run -d ...
```

Key points:

✔ `-d` → run detached
✔ Env vars injected at runtime (correct model)
✔ Fake Mongo URI (presence > correctness)
✔ Port mapping purely for completeness

CI does **not** care about DB connectivity — only startup correctness.

---

## Step 4: Liveness check

```bash
sleep 5
docker ps | grep backend_test
```

This ensures:

✔ Node process did not crash immediately
✔ Entry point exists
✔ Runtime errors are surfaced

If your app crashes on startup, CI fails here — as it should.

---

## Step 5: Cleanup

```yaml
if: always()
```

✔ Cleanup runs even if CI fails
✔ Prevents zombie containers
✔ CI hygiene

---

# 4. Expected behavior (important)

### CI should FAIL if:

* TypeScript build fails
* `dist/index.js` missing
* Dependency install fails
* App crashes on startup
* Dockerfile broken

### CI should PASS if:

* Image builds
* App boots and stays alive for a few seconds

That’s the correct MVP bar.

---

# 5. One backend-side requirement (restate clearly)

Your backend **must not crash synchronously** if:

* MongoDB is unreachable
* External services are down

Startup should:

* Log error
* Retry or defer DB usage
* Keep process alive

If it crashes, CI is correctly telling you:

> “Your backend is not CI-safe yet.”

---

# 6. What this CI gives you immediately

✔ Deterministic builds
✔ Dockerfile validated on every push
✔ Confidence that backend boots in isolation
✔ Zero Node/TypeScript knowledge in CI
✔ Clean foundation for deploy & registry later

This is **exactly** what a CI baseline should be.

---

# 7. What we will add later (in order)

Only when needed:

1. Push image to GHCR / Docker Hub
2. Secrets from GitHub Environments
3. Unit tests (inside Docker)
4. Deploy job (VPS / cloud)

Each is a **small additive change**, not a rewrite.

---

## Stop here

Commit this workflow.
Push to `main`.
Let CI run once.

If it passes → your backend + Docker baseline is **production-grade MVP**.

If it fails → CI has done its job, and we fix exactly what it exposes.

When ready, say:

> **“CI failed at step X”**
> or
> **“CI passed, next step”**

We proceed surgically.
