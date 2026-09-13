# Plan: Internal Transfer Request

## Derived From
`.ai-context/specs/internal-transfer-request.spec.md` (Gate 1 Approved 2026-08-30)

## Review Status
| Review | Approver | Date | Outcome | Comment |
|---|---|---|---|---|
| Plan Review | supratim.jetty@intglobal.com | 2026-08-30 | Approved | "approved" |
| Architecture Review (transfers module, architecture.md) | supratim.jetty@intglobal.com | 2026-08-30 | Approved | "approved" |

## Architecture Approach

Builds on the proposed `transfers` module in `.ai-context/architecture.md` (**Note:** that
module proposal is itself still Pending Gate 1 Architecture Review — see "Architecture Check"
below; this Plan proceeds on the assumption it will be approved, since it is a natural
1:1 mapping from this already-approved Spec).

### New backend module — `src/backend/modules/transfers/`
```text
src/backend/modules/transfers/
├── controllers/   # HTTP handlers for API01–API07
├── services/      # request lifecycle, eligibility rules, orchestration engine
├── repositories/  # TransferRequest, ManagerDecision, HrDecision, FulfilmentTask, AuditEvent
├── models/         # Prisma-generated types / domain entities
├── validators/     # request-payload validation (controlled lists, mandatory fields, BR-09)
└── routes/         # Express router wiring controllers to API01–API07 paths
```

### New frontend module — `src/frontend/modules/transfers/`
```text
src/frontend/modules/transfers/
├── pages/          # RequestFormPage (S1), RequestTrackerPage (status/pending action view)
├── components/     # StatusBadge, PendingActionCard, ManagerDecisionPanel, HrDecisionPanel
├── hooks/          # useTransferRequest, useTransferRequestList
├── services/       # transfersApi.ts (calls API01–API07)
└── utils/          # effective-date validation helper (client-side mirror of BR-10/BR-11)
```

### Two explicit interfaces, not two new business modules
This feature genuinely depends on two things this repo doesn't yet own. Per the Modular
Monolith rule ("prefer explicit service interfaces... avoid inventing business modules"),
both are modeled as **interfaces owned by `transfers`**, with a local/mock adapter for now —
not as new business modules, and not as direct database access into systems this module
doesn't own:

1. **`EmployeeProfileProvider`** (in `transfers/services/`) — read-only lookup of an
   employee's current department/location/role/manager/tenure/probation-status, needed for
   BR-12 (pre-population) and BR-02/03/05 (eligibility). Local dev adapter reads from a
   seeded reference table (see Data Model). Real integration into the HR/Core HCM system
   (confirmed authoritative per BRD.md Q19) is **explicitly deferred** — see below.
2. **`FulfilmentTaskGateway`** (per downstream system: Payroll/IT/Facilities) — raises a
   task and (ideally) receives status back. Per KD-T03 this should eventually be a real
   integration, not manual email, but BRD.md Q20 (can these systems push status
   automatically?) is unresolved. The gateway interface is implemented for now by a
   **`ManualFulfilmentAdapter`** that only exposes API07 for HR/Ops to flip status by hand;
   swapping in a real push-based adapter later requires no change to the interface or to
   API07's contract.

## Data Model

New tables (PostgreSQL via Prisma), all owned by the `transfers` module:

| Table | Key columns |
|---|---|
| `TransferRequest` | id, employeeId, currentDepartmentId/LocationId/RoleId, proposedDepartmentId/LocationId/RoleId, effectiveDate, reason, status, submittedAt, createdAt, updatedAt |
| `ManagerDecision` | id, requestId (FK), managerRole (current\|receiving), managerId, decision, reason, decidedAt |
| `HrDecision` | id, requestId (FK), decision, reason, conditions, decidedAt |
| `FulfilmentTask` | id, requestId (FK), taskType (payroll\|it\|facilities), status, note, updatedAt |
| `AuditEvent` | id, requestId (FK), actor, action, decision, reason, timestamp |

Reference data (department/location/role controlled lists) is **read-only and synced/cached
from the HR/Core HCM system** per KD-T02/KD-T05/BRD.md Q19 — not authored by this module. For
local development, seed a minimal reference table; the sync mechanism itself is out of scope
for this Plan (tracked as a dependency, see Explicitly Deferred).

Migration: one initial migration creating all five tables plus the local reference-data
seed tables (`Department`, `Location`, `Role` — dev/test seed only, not the system of
record).

## Constitution Check
- [x] No new datastore introduced without ADR — uses the already-established PostgreSQL +
  Prisma from `project_context.md`; no new datastore.
- [ ] Testing discipline matches `constitution.md` — **gap**: `constitution.md` has no
  BRD-sourced testing discipline (BRD contained no Constitution section). This Plan follows
  the `int-sdd-lifecycle` mandatory Test-First (RED→GREEN) rule regardless, since that is an
  org-level process rule, not a project-specific constraint being overridden.
- [ ] Security posture matches `constitution.md` — same gap. This Plan uses JWT auth
  (per `project_context.md`) and role-based authorization (employee/manager/HR, per the
  Spec's 403 exceptions) as the working security posture until `constitution.md` has
  project-specific constraints to check against.

## Explicitly Deferred
- **Real HR/Core HCM integration for `EmployeeProfileProvider`** — reason: no confirmed
  integration mechanism/credentials yet; local adapter unblocks development and testing
  against the Spec's Acceptance Criteria. Tracked as a dependency gap (BRD.md A-B04–06).
- **Automated Payroll/ITSM/Facilities push integration for `FulfilmentTaskGateway`** —
  reason: BRD.md Q20 unresolved; `ManualFulfilmentAdapter` + API07 satisfy the Spec's
  Acceptance Criteria (AC24–AC27) without assuming automation. Revisit once the discovery
  spike (status.md Next Steps) reports back.
- **Notification channel implementation (email vs. in-app)** — reason: BR-35/36 require that
  notifications fire, not a specific channel. A `NotificationGateway` interface is defined;
  the concrete adapter for this Plan logs to console/audit only. Real channel wiring is a
  follow-up task once notification infrastructure is confirmed (BRD.md A-T05).
- **Manager/HR/stakeholder dashboards** — reason: out of scope per the Spec; only the
  minimal `manager-decision`/`hr-decision` actions are built.
- **Escalation beyond the first hop to HR (BR-18)** — reason: not defined by the BRD; a
  single escalation hop is implemented, no further chain.

## Architecture Check
- The `transfers` module in `architecture.md` is a direct, unmodified match for this Plan's
  backend/frontend structure — no deviation.
- **Resolved 2026-08-30:** `architecture.md`'s `transfers` module proposal received Gate 1
  Architecture Review approval (see "Review Status" above). Approved directory trees have
  been generated: `src/backend/modules/transfers/{controllers,services,repositories,models,
  validators,routes}/` and `src/frontend/modules/transfers/{components,pages,hooks,services,
  utils}/`.
- No new datastore, no cross-module direct database access (Payroll/IT/Facilities/HR
  accessed only via the two interfaces above) — consistent with Microservice Readiness.

## Sequencing
1. Data model & Prisma migration (`TransferRequest`, `ManagerDecision`, `HrDecision`,
   `FulfilmentTask`, `AuditEvent`, dev-seed reference tables).
2. `EmployeeProfileProvider` interface + local/seeded adapter (unblocks AC9–AC12).
3. Capture & validation: `POST /api/transfers` (API01) — controlled-list checks, mandatory
   fields, no-change check (BR-09), one-open-request check (BR-06), eligibility checks
   (BR-02/03/05).
4. Status/view endpoints: `GET /api/transfers/:id`, `GET /api/transfers` (API02, API03) with
   visibility filtering (BR-30/32).
5. `POST /api/transfers/:id/manager-decision` (API05) — self-approval routing (BR-17),
   decline/return reason requirement (BR-20); escalation job (BR-18/AC20).
6. `POST /api/transfers/:id/hr-decision` (API06) — manager-confirmation-pending guard
   (BR-15), reason requirement on rejection (BR-20).
7. Organisational update trigger + `FulfilmentTaskGateway` abstraction; orchestration engine
   raising only applicable tasks, in parallel (BR-22/23/24).
8. `POST /api/transfers/:id/fulfilment-tasks/:taskType/status` (API07) +
   `ManualFulfilmentAdapter`; completion/failure handling (BR-27/28).
9. `POST /api/transfers/:id/withdraw` (API04) with state guards (BR-13/14 for amend).
10. `AuditEvent` logging wired across every transition (BR-33) + `NotificationGateway` stub
    wired to lifecycle events (BR-35/36).
11. Frontend: `RequestFormPage`, `RequestTrackerPage`, minimal manager/HR decision panels.
