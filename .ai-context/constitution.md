# Project Constitution — Employee Portal

**Owner:** supratim.jetty@intglobal.com · **Adopted:** 2026-09-13 · **Version:** v1.0

Governs every feature this repository will ever build. Written once, amended rarely, and
amended only through the same review rigour as a spec. Each spec operates inside this
document and never restates it.

Standard in force: **INT Engineering Guidelines — Specification-Driven Delivery (SDD) v1.0**

> **Provisional & Open Values Note:** Lines marked `[Open]` are not yet decided for this
> project — no BRD has specified a value and none is invented here (per
> `int-brd-ingestion`'s governance rule 9: do not invent constraints not supported by the
> BRD). Decisions depending on an `[Open]` line should flag it rather than assume a value.
> This project's BRD (`.ai-context/BRD.md`, Internal Transfer Request) contains no
> Constitution/Engineering Constitution section of its own — everything below is either (a)
> already established via `project_context.md`/`architecture.md` during project setup and
> subsequent Gate 1 approvals, or (b) explicitly `[Open]`.

---

## Governance & Roles

| Role | Person | Email | Responsibility |
|---|---|---|---|
| Technical Lead / Architect | *(name not yet confirmed)* | supratim.jetty@intglobal.com | Owns this constitution; default Gate 2 code reviewer; technical concurrence at Gate 1 |
| Senior Software Engineer | *(name not yet confirmed)* | supratim.jetty@intglobal.com | Default Spec Author for feature and retro-specs |
| Project Manager | *(name not yet confirmed)* | supratim.jetty@intglobal.com | Owns BRD entries and product-side sign-off; default Gate 1 reviewer |

### Core Governance Rules:
- **Author ≠ Reviewer**: standard rule is that the Gate 1 reviewer is never the spec author.
  **Accepted exception, documented 2026-09-13**: this project currently has a single team
  member (supratim.jetty@intglobal.com) filling all three roles above, so Developer = Gate 1
  Reviewer = Gate 2 Reviewer by necessity. This is a deliberate, explicitly recorded
  deviation, not a silently ignored rule — see `.ai-context/pr_reviews/BRD-20260913-135939.md`
  for where this was first surfaced and accepted. **Revisit this exception if/when a second
  team member joins** — at that point self-review should stop and this line should be
  updated.
- **Technical Concurrence**: same single-person exception applies — TL technical concurrence
  is recorded by the same person acting in that capacity.
- **Reviewer Split**: Gate 1 = Intent / Scope / BRD-traceability review; Gate 2 = Technical
  evidence & code review. Both currently performed by the same person under the exception
  above.
- **Gate 1 SLA**: `[Open]` — no SLA has been agreed for this project yet.

### INT Amendments to SDD v1.0 (already in force for this project):
1. **Granular Chain**: BRD → Spec → Plan → Tasks — already the lifecycle followed for
   `internal-transfer-request`.
2. **First Quality Gate**: Spec Review (Gate 1) is mandatory before coding begins — already
   enforced (Spec was Gate-1-approved before Plan/Tasks were drafted).
3. **Slugs & Identifiers**: mandatory sub-identifiers for specs, plans, tasks, test cases,
   and branches — already in use (`internal-transfer-request.*`, `feature/<slug>`).
4. **Status Board**: maintained in `.ai-context/status.md` — already in the mandated format.
5. **Traceable Artifacts**: `.ai-context/releases/`, `.ai-context/hotfixes/`,
   `.ai-context/change_requests/` directories already exist (created during project setup).

---

## Testing Discipline

- Test-first (TDD RED → GREEN) is mandatory for every API endpoint and state-changing
  operation. **Already established and followed**: T01 and T02 were both built RED-then-GREEN.
- **Framework & Location**: Jest + `ts-jest` (already configured in `package.json`). Tests
  live in `tests/backend/` (and will live in `tests/frontend/` once frontend tasks begin),
  mirroring `src/backend/modules/` structure — already the pattern in use.
- **Coverage Floors**: `[Open]` — no coverage floor (by tier or otherwise) has been set for
  this project; the BRD does not specify one. Do not assume the 80/70/60% figures from the
  org's generic constitution example — those belong to a different (payments/auth-heavy)
  reference project, not this one, unless the Technical Lead explicitly adopts them here.
- **Verification Commands**: `npm test` must pass before any task is complete (already
  enforced per `tasks.md` Task Execution Rules). `npm run lint` / `npm run typecheck`:
  `[Open]` — no ESLint config exists in this repo yet; `tsc` typechecking is implicit via
  `ts-jest` but there is no standalone `npm run typecheck` script yet.

---

## Security Posture

- **Authentication**: JWT (confirmed in `project_context.md` at project setup). Token
  lifetime/refresh-cookie/signing-secret specifics: `[Open]` — not yet designed; no Spec has
  implemented authentication yet.
- **No PII/Secrets in Logs**: governed by the org-wide rule in `AGENTS.md` ("Do not expose
  secrets or PII in project artifacts") — applies to this project already, no project-specific
  addition needed yet.
- **Secrets Management**: `.env` holds local config (`DATABASE_URL`); `.env` is gitignored,
  never committed. Boot-time validation (e.g. via Zod): `[Open]` — not yet implemented.
- **OTP, idempotency-key, rate-limiting specifics**: `[Open]` / **not applicable** to the
  Internal Transfer Request feature as currently scoped — the BRD describes no OTP or
  payment-style idempotent-mutation flow. Revisit only if a future feature introduces one;
  do not build this speculatively.
- **Hardening (HTTPS, `helmet`, CORS allowlist, dependency scanning)**: `[Open]` — no Express
  server has been stood up yet (that's T22+ / later backend tasks); nothing to harden yet.

---

## Architectural Constraints

- **Approved Datastore**: PostgreSQL (confirmed, `project_context.md`), accessed via Prisma.
  No cache/session store is approved — adding one requires an ADR
  (`.ai-context/decisions/ADR-NNN.md`).
- **Modular Monolith Default**: confirmed (`architecture.md`) — single process locally; no
  microservice split without an approved ADR.
- **Layering**: `controllers/ → services/ → repositories/ → models/`, with request validation
  in `validators/` — already the structure of the approved `transfers` module
  (`src/backend/modules/transfers/`).
- **Functional vs. class style**: `[Open]` — no convention has been explicitly adopted yet;
  the one class written so far (`LocalEmployeeProfileProvider`, T02) is a small adapter
  class implementing an interface, not a stylistic precedent either way.
- **Database Migrations**: schema changes via Prisma migrations only — already the practice
  since T01 (`prisma migrate dev`), no raw `db push` used.

---

## Non-Functional Baselines

- **API latency targets (p95)**: `[Open]` — the BRD itself flags this as unresolved
  (`.ai-context/BRD.md` Q24: "Availability and performance expectations for the journey?").
  Do not invent numbers; escalate Q24 for a business/architecture decision before Gate 2 on
  any Spec whose acceptance depends on a latency target.
- **Availability target**: `[Open]` — not specified by the BRD.
- **Recovery objectives (RPO/RTO)**: `[Open]` — not specified by the BRD.

---

## Versioning Rules

- **API path versioning**: `[Open]` — the current Spec's API contract
  (`internal-transfer-request.spec.md`, API01–API07) does not use a version prefix
  (e.g. `/api/v1`). Decide before those endpoints are implemented (T03+) whether to adopt
  one; retrofitting after implementation is more expensive than deciding now.
- **OpenAPI contract**: `[Open]` — no OpenAPI/Swagger document exists yet.
- **Semver tagging**: releases are documented in `.ai-context/releases/RELEASE-vX.Y.Z.md`
  (directory and convention already established during project setup); no release has been
  cut yet.

---

## Repository & Branching

- **Branch Naming**: `feature/<slug>`, `fix/<slug>`, `hotfix/<slug>` — already the convention
  referenced in `.ai-context/tasks/internal-transfer-request.tasks.md`. Note: this repository
  is not yet a Git repository (`git init` has not been run), so no branches exist yet in
  practice.
- **Merge Strategy**: `[Open]` — squash vs. merge-commit not yet decided (moot until Git is
  initialized).
- **Commit Messages**: `Implements <slug>.T01` format, traceability ID mandatory, no AI
  attribution in the message body — already established and followed
  (`tasks.md` Task Execution Rules).
