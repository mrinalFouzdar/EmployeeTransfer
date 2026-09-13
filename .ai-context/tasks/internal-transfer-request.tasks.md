# Tasks: Internal Transfer Request

## Derived From
`.ai-context/plans/internal-transfer-request.plan.md` (Plan Review Approved 2026-08-30;
Architecture Review Approved 2026-08-30)

## Task Execution Rules
- Implement one task at a time. Task states: `Not Started` → `In Progress` → `In Review` →
  `Merged`.
- Never execute multiple tasks unattended in a single batch diff.
- Each task is Test-First: the test(s) named in `.ai-context/test_cases/internal-transfer-request.test_cases.md`
  for its Acceptance Criteria must be written and confirmed RED before implementation, then
  GREEN after.
- Commit messages: `Implements internal-transfer-request.T01` (no AI attribution).

## Sequence
- [x] internal-transfer-request.T01 — Prisma schema & migration: `TransferRequest`, `ManagerDecision`, `HrDecision`, `FulfilmentTask`, `AuditEvent` tables, plus dev-seed reference tables (`Department`, `Location`, `Role`) — Acceptance: infrastructure prerequisite for all ACs — **Merged 2026-09-07**
- [ ] internal-transfer-request.T02 — `EmployeeProfileProvider` interface + local/seeded adapter (current dept/location/role/manager/tenure/probation lookup) — Acceptance: AC12
- [ ] internal-transfer-request.T03 — `POST /api/transfers` (API01): controlled-list validation for department/location/role + mandatory-field validation — Acceptance: AC1, AC2, AC3, AC6
- [ ] internal-transfer-request.T04 — `POST /api/transfers`: no-change check (BR-09) + one-open-request check (BR-06) — Acceptance: AC7, AC8
- [ ] internal-transfer-request.T05 — `POST /api/transfers`: effective-date validation (4-week lead time + payroll cut-off alignment) + optional reason handling — Acceptance: AC4, AC5
- [ ] internal-transfer-request.T06 — `POST /api/transfers`: eligibility checks via `EmployeeProfileProvider` (tenure ≥12mo, probation exception, 12mo cooling-off) — Acceptance: AC9, AC10, AC11
- [ ] internal-transfer-request.T07 — `GET /api/transfers/:id` and `GET /api/transfers` (API02, API03) with visibility filtering (no internal commentary, no salary/remuneration) — Acceptance: AC13, AC14, AC15, AC16
- [ ] internal-transfer-request.T08 — `POST /api/transfers/:id/manager-decision` (API05): confirm/decline/return + reason required on decline/return — Acceptance: AC17
- [ ] internal-transfer-request.T09 — Receiving-manager confirmation routing (mandatory whenever named) — Acceptance: AC18
- [ ] internal-transfer-request.T10 — Self-approval conflict routing to next-level management — Acceptance: AC19
- [ ] internal-transfer-request.T11 — Escalation job: 3 business days of manager inaction → escalate to HR — Acceptance: AC20
- [ ] internal-transfer-request.T12 — `POST /api/transfers/:id/hr-decision` (API06): manager-confirmation-pending guard + eligible/not_eligible/eligible_with_conditions handling + reason required on rejection — Acceptance: AC21, AC22
- [ ] internal-transfer-request.T13 — `FulfilmentTaskGateway` interface + `POST /api/transfers/:id/fulfilment-tasks/:taskType/status` (API07) + `ManualFulfilmentAdapter` — Acceptance: enables AC24, AC26, AC27
- [ ] internal-transfer-request.T14 — Organisational record update trigger on HR approval, with sequencing guard (no downstream tasks raised before HR pass) — Acceptance: AC23
- [ ] internal-transfer-request.T15 — Orchestration: applicability rules (BR-24) + parallel task raising (BR-23) — Acceptance: AC24
- [ ] internal-transfer-request.T16 — Access timing rules: no revocation before effective date, new access on/before effective date — Acceptance: AC25
- [ ] internal-transfer-request.T17 — Completion gating (blocked while any applicable task outstanding) + failure handling (On Hold + HR notified) — Acceptance: AC26
- [ ] internal-transfer-request.T18 — Completion confirmation to employee (consolidated summary, status → Completed) — Acceptance: AC27
- [ ] internal-transfer-request.T19 — `POST /api/transfers/:id/withdraw` (API04) with state guard + amend state guard (Draft/Returned for Amendment only) — Acceptance: AC28, AC29
- [ ] internal-transfer-request.T20 — `AuditEvent` logging wired across every state transition (actor, timestamp, decision, reason) — Acceptance: AC30
- [ ] internal-transfer-request.T21 — `NotificationGateway` stub wired to lifecycle events (submission/decision/return/completion) + stakeholder reminder logic — Acceptance: AC31
- [ ] internal-transfer-request.T22 — Frontend `RequestFormPage` (capture form, client-side mirror of controlled-list/mandatory/effective-date validation) — Acceptance: AC1–AC6 (frontend)
- [ ] internal-transfer-request.T23 — Frontend `RequestTrackerPage` (status + pending-action view) — Acceptance: AC13, AC14
- [ ] internal-transfer-request.T24 — Frontend minimal manager/HR decision panels (`ManagerDecisionPanel`, `HrDecisionPanel`) — Acceptance: AC17, AC22
