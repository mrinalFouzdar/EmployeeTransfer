# Architecture: Employee Portal

## Architecture Style
Modular Monolith + Microservice Ready (default INT baseline).

- Local development runs as a single deployable modular monolith.
- Business modules have clear boundaries and minimize direct coupling.
- Shared functionality is isolated in `shared/` / infrastructure areas.
- Modules are structured so any one of them could be extracted into an
  independent service in the future.
- No microservice deployment complexity is introduced unless a future spec
  or ADR explicitly requires it.

## Backend Structure (Node.js + Express, TypeScript)
```text
src/backend/
├── app/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── server.ts
├── modules/
└── shared/
    ├── database/
    ├── logger/
    ├── errors/
    └── utils/
```
All source files are `.ts` — no plain JavaScript. See `project_context.md` § Language.

## Frontend Structure (React + Vite + Tailwind, TypeScript)
```text
src/frontend/
├── package.json          # separate toolchain from the backend - own node_modules
├── vite.config.ts        # dev server, /api proxy to :3001, Vitest config
├── tailwind.config.js / postcss.config.js
├── index.html            # entry: <script src="/app/main.tsx">
├── app/
│   ├── main.tsx          # ReactDOM root
│   ├── App.tsx           # react-router-dom routes (no separate routes/ dir - only 3 routes)
│   └── index.css         # @tailwind directives
├── modules/transfers/
│   ├── pages/            # RequestFormPage, RequestTrackerPage, MyRequestsListPage
│   ├── components/       # ManagerDecisionPanel, HrDecisionPanel
│   ├── hooks/            # useReferenceData, useMyProfile
│   ├── services/         # transfersApi.ts
│   └── utils/            # validation.ts (client-side mirror of server validation)
└── shared/
    ├── components/        # ActorSwitcher (placeholder identity picker)
    ├── hooks/              # useActor (placeholder identity, mirrors backend's requireActor)
    └── services/           # apiClient.ts
```
Components are `.tsx`, non-component modules are `.ts` — no plain JavaScript. Testing:
Vitest + `@testing-library/react`, tests live in `tests/frontend/` (repo root, same
convention as `tests/backend/`) — required an explicit `include` glob and `resolve.alias`
entries in `vite.config.ts` since those files live outside this Vite project's own root.
No `providers/`/`store/` — no state library introduced; the only cross-component state
(current actor identity) uses a `useSyncExternalStore` hook backed by `localStorage`.

## Database & Data Access
- Database: PostgreSQL
- ORM: Prisma
- **Schema source of truth:** `prisma/schema.prisma` (repo root), applied via
  `prisma migrate dev`; generated migrations live under `prisma/migrations/`.
- **Shared client:** `src/backend/shared/database/prismaClient.ts` — a singleton
  `PrismaClient` instance, reused across all modules.
- **Local dev database:** Postgres via `docker-compose.yml` (service `postgres`, container
  `employee_portal_postgres`), host port `5434` — deliberately not 5432/5433, both of which
  collide with unrelated pre-existing containers on the primary dev machine.
- **Current schema shape** (as of T02):
  - Dev-seed reference data — `Department`, `Location`, `Role`, `EmployeeProfileSeed`. These
    exist only to unblock local dev/test; they are explicitly **not** the real `employees`/
    `org` business module or HR-system-of-record integration (see the `transfers` module
    section below).
  - Core transfer domain — `TransferRequest`, `ManagerDecision`, `HrDecision`,
    `FulfilmentTask`, `AuditEvent`, all owned by the `transfers` module.

## Authentication & Security
- Strategy: JWT
- Token issuance/validation lives in `src/backend/shared/` or a dedicated
  `auth` module, established when the first authentication-related spec is
  approved.

## Deployment
- Target: Unknown — to be decided. No deployment-specific tooling or config
  has been created. Record the decision in an ADR
  (`.ai-context/decisions/ADR-NNN.md`) once known, and update this section.

## Approved Business Modules
Derived from `.ai-context/BRD.md` (Internal Transfer Request BRD).

### Gate 1 Architecture Review
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Architecture Review) | supratim.jetty@intglobal.com | 2026-08-30 | Approved | "approved" |

### Module: `transfers` (Approved)
- **Business domain:** Employee lifecycle / workforce movement.
- **Bounded responsibility:** Owns the Internal Transfer Request lifecycle — capturing the
  request (target department, location, role, effective date, reason), tracking current-
  manager and receiving-manager confirmation (BRD.md S2), HR eligibility validation (S3),
  org info update (S4), and the conditional payroll/IT/facilities stakeholder tasks (S5),
  through to employee confirmation (S6). Owns the employee-facing status/pending-actions
  view (BRD.md R-07, R-08) and the 11-state status model. Owns orchestration state and
  master request status per KD-T01.
- **Depends on (not owned by this module):**
  - Employee profile & organisational hierarchy data (current department, location, role,
    reporting manager, receiving manager) — accessed only through the `EmployeeProfileProvider`
    interface (`src/backend/modules/transfers/services/`), currently backed by
    `LocalEmployeeProfileProvider`, a local adapter reading the dev-seed `EmployeeProfileSeed`
    table (T02). Per KD-T02 the HR/Core HCM system remains system of record for
    organisational data — this module consumes it, does not duplicate it, and the local
    adapter is an explicitly temporary stand-in. Flagged as a dependency gap (see BRD.md
    Assumptions/Open Questions) — do not invent an `employees`/`org` module until a BRD
    establishes it.
  - Payroll, IT, and Facilities — accessed only through the `FulfilmentTaskGateway` interface,
    currently backed by `ManualFulfilmentAdapter` (HR/Ops enters status by hand via API07),
    per the approved Plan's "Explicitly Deferred" decision. Real integration readiness is
    still open per BRD.md Q20 — the interface boundary means swapping in a push-based
    adapter later requires no change to the `transfers` module's own code. Not owned/modeled
    as internal business modules by this BRD.
- **Cross-cutting requirement:** every state transition is persisted as an immutable audit
  event (KD-T06, BR-33). **Decided in the Plan:** `AuditEvent` is a `transfers`-owned Prisma
  model (`prisma/schema.prisma`), not a separate shared/audit module.
- **Microservice readiness:** No direct database access into Payroll/IT/Facilities systems;
  all cross-system interaction goes through an explicit integration/adapter boundary so the
  module can be extracted independently later.

## Change Log
- 2026-08-29 — Initial architecture baseline established during project
  setup. No business modules exist yet; this reflects the empty-repo
  execution-layer baseline only.
- 2026-08-29 — Added proposed `transfers` business module following ingestion of the
  Internal Transfer Request BRD. Proposal only — pending Gate 1 architecture review.
- 2026-08-30 — Enriched the `transfers` module proposal following ingestion of the formal
  Discovery Analysis (Deliverable 1): referenced KD-T01–T07 technical decisions, added
  receiving-manager and audit-event considerations. No new module introduced; still
  Proposed — Pending Gate 1 Architecture Review.
- 2026-08-30 — **Gate 1 Architecture Review Approved** (supratim.jetty@intglobal.com).
  `transfers` module status changed from Proposed to Approved. Approved directory trees
  generated under `src/backend/modules/transfers/` and `src/frontend/modules/transfers/`
  per `.ai-context/plans/internal-transfer-request.plan.md`.
- 2026-09-13 — Recorded **TypeScript-only** as the confirmed language for both
  frontend and backend (was implicit since T01's `.ts`/`ts-jest` scaffolding on
  2026-09-07, but never stated in `project_context.md`/`architecture.md` — closing that
  gap per user request). Backend Structure's `server.js` corrected to `server.ts`; no
  other change to the approved module structure or boundaries.
- 2026-09-13 — **INT Control Plane governance upgrade.** Re-ran `int-project-setup` against
  this existing, actively-developed project (Spec `internal-transfer-request` already
  `Under Development`). Per the skill's Existing Project Protection rules, did not re-run
  discovery on anything already decided (tech stack, architecture style) and did not touch
  any existing BRD/spec/plan/tasks/test_cases content. Synced `.agent/` from the updated
  source (new § 6 "PR Gate Governance & Skill Resolution Hierarchy" in `int-standards.md` —
  Gate 0 BRD PR Review, `.ai-context/pr_reviews/` records, Git-email reviewer matching; new
  `pr-gate-workflow.md`). Added `AGENTS.md`, `.agents/skills/*/SKILL.md` (7 skills), new
  `.ai-context/pr_reviews/` and `change_requests/` dirs, `.gitkeep` in all 10 mandated
  artifact dirs, 3 new templates (`gate-1-review`, `gate-2-review`,
  `change-request`), and extended `.gitignore`. Confirmed Gate 1/Gate 2 reviewer roster with
  the user (supratim.jetty@intglobal.com for both) and recorded it in `project_context.md`
  and the existing Spec's new "Roles & Assignments" section. Note: the existing Spec/BRD
  were approved under the *prior* process version (no Gate 0 BRD PR Review record exists for
  them) — treated as grandfathered, not retroactively invalidated; new specs going forward
  follow the upgraded gate sequence.
- 2026-09-13 — **Documentation refresh** (no code or module-boundary change). "Database &
  Data Access" corrected — it previously claimed schema/migrations would live under
  `src/backend/shared/database/`, which was never accurate; documented the real location
  (`prisma/schema.prisma`, repo root) and current schema shape, including the local dev
  Postgres container (`docker-compose.yml`, host port `5434`). Logged the previously-unlogged
  `EmployeeProfileSeed` dev-seed table added to the schema during T02 — **correction
  (2026-09-13, later same day):** the `add_employee_profile_seed` migration was only
  attempted, not applied — it failed when Docker Desktop became unresponsive, and this entry
  originally implied it had succeeded, which was inaccurate. The model existed in
  `prisma/schema.prisma` (and was committed to git) but not yet in any applied migration or
  the actual database until resolved in a later session. Updated the `transfers` module's
  "Depends on" bullets to name
  the actual `EmployeeProfileProvider`/`LocalEmployeeProfileProvider` and
  `FulfilmentTaskGateway`/`ManualFulfilmentAdapter` interfaces the approved Plan specifies,
  replacing vaguer "assumed to exist elsewhere" language. Replaced the stale "likely a
  shared/`audit` concern... to be confirmed at Plan stage" note with the Plan's actual
  decision (`AuditEvent` is a `transfers`-owned Prisma model).
- 2026-09-13 — **T03-T24 implemented (full backend business logic + frontend).** No new
  business module or module-boundary change - all within the approved `transfers` module.
  Added `assignedManagerId`/`receivingManagerId` columns to `TransferRequest`
  (migration `add_transfer_manager_fields`). Documented Frontend Structure to match what was
  actually built (see above) rather than the earlier generic template. 3 API endpoints
  needed to make the Spec buildable, and 1 correction to AC4/BR-11's payroll-cutoff
  behaviour, are logged in `internal-transfer-request.spec.md` directly rather than here.
  Full request lifecycle verified against a live compiled server + live Postgres via `curl`,
  not just in-process tests. 62 backend + 19 frontend tests GREEN.
