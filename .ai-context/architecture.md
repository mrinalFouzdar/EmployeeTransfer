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
├── app/
│   ├── routes/
│   ├── providers/
│   └── store/
├── modules/
└── shared/
    ├── components/
    ├── hooks/
    ├── services/
    └── utils/
```
Components are `.tsx`, non-component modules are `.ts` — no plain JavaScript.

## Database & Data Access
- Database: PostgreSQL
- ORM: Prisma
- Schema/migrations live under `src/backend/shared/database/` once modules
  are defined via BRD ingestion.

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
    reporting manager, receiving manager) — assumed to exist elsewhere in the Portal; no
    module for this exists yet in this repo. Per KD-T02 the HR/Core HCM system remains
    system of record for organisational data — this module consumes it, does not duplicate
    it. Flagged as a dependency gap (see BRD.md Assumptions/Open Questions) — do not invent
    an `employees`/`org` module until a BRD establishes it.
  - Payroll, IT, and Facilities — modeled as external systems/teams the `transfers` module
    orchestrates tasks to in parallel (KD-T03, KD-T04: integration-based, not manual email;
    concrete integration readiness is open per BRD.md Q20). Not owned/modeled as internal
    business modules by this BRD.
- **Cross-cutting requirement:** every state transition is persisted as an immutable audit
  event (KD-T06, BR-33) — likely a shared/`audit` concern rather than `transfers`-specific,
  to be confirmed at Plan stage.
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
