# Spec: Internal Transfer Request

## Spec ID
internal-transfer-request

## Status
Under Development

## Roles & Assignments
- **Developer:** supratim.jetty@intglobal.com
- **Gate 1 Reviewer(s):** supratim.jetty@intglobal.com
- **Gate 2 Reviewer(s):** supratim.jetty@intglobal.com

## Linked BRD
`.ai-context/BRD.md` — Functional Requirements R-01–R-10, Business Rules BR-01–BR-37,
Journey Stages S0–S7, Known Decisions KD-B01–08/KD-T01–07.

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 1 (Spec Review) | supratim.jetty@intglobal.com | 2026-08-30 | Approved | "Spec approved, now go on." |
| Gate 2 (Code Review) | *pending* | *pending* | *pending* | *not applicable yet* |

## Intent
Add a self-service Internal Transfer Request capability to the One-Point Employee Portal so
an authenticated employee can propose a new department/business unit, location and role with
an effective date, submit it, and track its progress through current/receiving-manager
confirmation, HR eligibility validation, organisational record update, and conditional
Payroll/IT/Facilities fulfilment — replacing today's manual, multi-team, chase-driven process
with one orchestrated digital journey and a single consolidated status view for the employee.

## Context
- Builds on: `.ai-context/architecture.md` § "Approved Business Modules" (`transfers`
  module — Gate 1 Architecture Review Approved 2026-08-30).
- Related: none (first Spec in this project).
- Depends on employee/organisational profile data (current department, location, role,
  manager) being available to the Portal — see BRD.md Assumptions A-B04–A-B06; no
  `employees`/`org` module exists yet in this repo (tracked as a dependency gap, not invented
  here).
- Carries forward one unresolved BRD item: **Q20** — whether Payroll/ITSM/Facilities systems
  can automatically receive a task and report status back is unconfirmed pending a technical
  discovery spike. This Spec's API contract (API07) is deliberately designed to work whether
  that integration turns out to be automated or manual, so the Spec does not block on Q20.

## API Contract

### internal-transfer-request.API01 — POST /api/transfers
Employee submits a new transfer request (S1).
**Request payload:**
```json
{
  "departmentId": "string",
  "locationId": "string",
  "roleId": "string",
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string | null"
}
```
**Success response (201):**
```json
{ "requestId": "string", "status": "Submitted", "submittedAt": "ISO-8601 datetime" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Missing mandatory field (department/location/role/effectiveDate) | `{ "error": "VALIDATION_ERROR", "field": "string" }` |
| 400 | Proposed values identical to current values in all three fields (BR-09) | `{ "error": "NO_CHANGE_REQUESTED" }` |
| 400 | Effective date < 4 weeks out, or falls before the next payroll cut-off in a way not covered by BR-11's deferral rule | `{ "error": "INVALID_EFFECTIVE_DATE", "reason": "string" }` |
| 403 | Employee not eligible (tenure < 12 months / active probation without HR exception / active disciplinary process / cooling-off period active) | `{ "error": "NOT_ELIGIBLE", "reason": "string" }` |
| 409 | Employee already has an open transfer request (BR-06) | `{ "error": "OPEN_REQUEST_EXISTS", "requestId": "string" }` |

### internal-transfer-request.API02 — GET /api/transfers/:id
Consolidated status/progress view (R-07, R-08).
**Success response (200):**
```json
{
  "requestId": "string",
  "status": "Draft | Submitted | Manager Confirmed | Returned for Amendment | Under HR Review | Approved - In Progress | Pending Action | On Hold | Completed | Rejected | Withdrawn",
  "current": { "departmentId": "string", "locationId": "string", "roleId": "string" },
  "proposed": { "departmentId": "string", "locationId": "string", "roleId": "string" },
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string | null",
  "pendingAction": { "stakeholder": "string | null", "pendingSince": "ISO-8601 datetime | null" },
  "history": [ { "actor": "string", "action": "string", "timestamp": "ISO-8601 datetime" } ]
}
```
Internal commentary between HR/managers/downstream teams and salary/remuneration detail are
never included in this response (BR-30, BR-32).
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 404 | Request does not exist | `{ "error": "NOT_FOUND" }` |
| 403 | Caller is not the requester or an authorised stakeholder for this request | `{ "error": "FORBIDDEN" }` |

### internal-transfer-request.API03 — GET /api/transfers
List the authenticated employee's own transfer requests (open and historical).
**Success response (200):**
```json
{ "requests": [ { "requestId": "string", "status": "string", "effectiveDate": "YYYY-MM-DD", "submittedAt": "ISO-8601 datetime" } ] }
```

### internal-transfer-request.API04 — POST /api/transfers/:id/withdraw
Employee withdraws their own request (BR-13).
**Success response (200):**
```json
{ "requestId": "string", "status": "Withdrawn" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 409 | Organisational record has already been updated (S4 complete) — self-service withdrawal no longer available | `{ "error": "WITHDRAWAL_REQUIRES_HR", "message": "string" }` |
| 403 | Caller is not the requester | `{ "error": "FORBIDDEN" }` |

### internal-transfer-request.API05 — POST /api/transfers/:id/manager-decision
Current or receiving manager confirms, declines, or returns the request (S2).
**Request payload:**
```json
{ "managerRole": "current | receiving", "decision": "confirm | decline | return", "reason": "string | null" }
```
**Success response (200):**
```json
{ "requestId": "string", "status": "string" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 403 | Caller is not the assigned manager for this request/role | `{ "error": "FORBIDDEN" }` |
| 409 | Manager is also the requester (self-approval conflict) — request has been auto-routed to the next level of management instead (BR-17) | `{ "error": "SELF_APPROVAL_NOT_ALLOWED", "routedTo": "string" }` |
| 400 | `decision` is `decline` or `return` without a `reason` (BR-20) | `{ "error": "REASON_REQUIRED" }` |

### internal-transfer-request.API06 — POST /api/transfers/:id/hr-decision
HR records the eligibility decision (S3).
**Request payload:**
```json
{ "decision": "eligible | not_eligible | eligible_with_conditions", "reason": "string | null", "conditions": "string | null" }
```
**Success response (200):**
```json
{ "requestId": "string", "status": "string" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 403 | Caller is not authorised as HR for this request | `{ "error": "FORBIDDEN" }` |
| 400 | `decision` is `not_eligible` without a `reason` (BR-20) | `{ "error": "REASON_REQUIRED" }` |
| 409 | Manager confirmation not yet received (BR-15: manager confirmation is mandatory before HR validation) | `{ "error": "MANAGER_CONFIRMATION_PENDING" }` |

### internal-transfer-request.API07 — POST /api/transfers/:id/fulfilment-tasks/:taskType/status
Reports the status of one downstream fulfilment task (`taskType` = `payroll` \| `it` \|
`facilities`). Deliberately usable by either an automated system-to-system integration or
manual HR/Ops entry, since **Q20** (BRD.md) has not yet confirmed which is available per
system — this endpoint's contract does not need to change once Q20 is resolved.
**Request payload:**
```json
{ "status": "not_applicable | in_progress | complete | failed", "note": "string | null" }
```
**Success response (200):**
```json
{ "requestId": "string", "taskType": "string", "status": "string" }
```
**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Task not yet raised (HR eligibility not yet passed — BR-22) | `{ "error": "TASK_NOT_YET_RAISED" }` |
| 404 | Request or task type does not exist for this request | `{ "error": "NOT_FOUND" }` |

## Acceptance Criteria

**Capture & Submit (S1)**
1. internal-transfer-request.AC1 — Given the request form, when the employee selects a proposed department/business unit, then only values from the controlled organisational list are accepted (R-01, BR-08).
2. internal-transfer-request.AC2 — Given the request form, when the employee selects a proposed location, then only values from the controlled organisational list are accepted (R-02, BR-08).
3. internal-transfer-request.AC3 — Given the request form, when the employee selects a proposed role/job position, then only values from the controlled organisational list are accepted (R-03, BR-08).
4. internal-transfer-request.AC4 — Given a proposed effective date, when the employee submits, then the date must be at least 4 weeks from submission and fall on/after the next payroll cut-off, else the request is rejected with `INVALID_EFFECTIVE_DATE` (R-04, BR-10, BR-11).
5. internal-transfer-request.AC5 — Given the request form, when the employee leaves the reason field blank, then the request is still accepted (reason is optional) (R-05, BR-31).
6. internal-transfer-request.AC6 — Given a request missing department, location, role, or effective date, when the employee submits, then the request is rejected with `VALIDATION_ERROR` naming the missing field (R-06, BR-07).
7. internal-transfer-request.AC7 — Given proposed values identical to the employee's current department, location and role, when the employee submits, then the request is rejected with `NO_CHANGE_REQUESTED` (BR-09).
8. internal-transfer-request.AC8 — Given the employee already has an open transfer request, when they attempt to submit a new one, then it is rejected with `OPEN_REQUEST_EXISTS` (BR-06).
9. internal-transfer-request.AC9 — Given an employee with less than 12 months tenure in their current role, when they submit a request, then it is rejected with `NOT_ELIGIBLE` (BR-02).
10. internal-transfer-request.AC10 — Given an employee currently on probation with no HR exception recorded, when they submit a request, then it is rejected with `NOT_ELIGIBLE`; if HR has recorded an exception, submission succeeds (BR-03).
11. internal-transfer-request.AC11 — Given an employee within the 12-month cooling-off period after a completed transfer, when they submit a new request, then it is rejected with `NOT_ELIGIBLE` (BR-05).
12. internal-transfer-request.AC12 — Given the request form, then current department, role, location, grade and manager are pre-populated by the system and are not editable by the employee (BR-12).

**Tracking & Visibility (S1–S6)**
13. internal-transfer-request.AC13 — Given a submitted request, when the employee views it, then the current status is shown (R-07, BR-29).
14. internal-transfer-request.AC14 — Given a submitted request awaiting action, when the employee views it, then the stakeholder currently holding the pending action and the date it became pending are shown (R-08, BR-29).
15. internal-transfer-request.AC15 — Given a request with internal HR/manager/downstream commentary, when the employee views it, then that commentary is not present in the response (BR-30).
16. internal-transfer-request.AC16 — Given a request that affects pay, when the employee views it, then salary/remuneration detail is never present in the employee-facing response (BR-32).

**Manager Confirmation (S2)**
17. internal-transfer-request.AC17 — Given a submitted request, when the current manager confirms, declines, or returns it, then the request status transitions accordingly and, on decline/return, a reason is required and shown to the employee (BR-15, BR-20).
18. internal-transfer-request.AC18 — Given a request where the receiving role has a named receiving manager, when the current manager confirms, then the request also requires the receiving manager's confirmation before proceeding to HR validation (BR-16).
19. internal-transfer-request.AC19 — Given a request where the current manager is also the requester, when the request is submitted, then it is automatically routed to the next level of management instead of the requester's own manager action (BR-17).
20. internal-transfer-request.AC20 — Given a request awaiting manager confirmation for more than 3 business days, when the escalation check runs, then the request escalates to HR (BR-18).

**HR Eligibility Validation (S3)**
21. internal-transfer-request.AC21 — Given a request with manager confirmation not yet received, when HR attempts to record an eligibility decision, then it is rejected with `MANAGER_CONFIRMATION_PENDING` (BR-15).
22. internal-transfer-request.AC22 — Given a manager-confirmed request, when HR records an "eligible" decision, then the request proceeds to organisational record update; when HR records "not eligible", a reason is required and shown to the employee, and the request is rejected (BR-19, BR-20).

**Organisational Update & Downstream Orchestration (S4–S6)**
23. internal-transfer-request.AC23 — Given an HR-approved request, when the organisational record is updated with the effective date, then downstream fulfilment tasks are raised only at that point, not before (BR-22).
24. internal-transfer-request.AC24 — Given an organisational record update, when downstream tasks are raised, then Payroll, IT and Facilities tasks are each raised only where applicable (per BR-24's applicability rules) and run in parallel, not sequentially (BR-23, BR-24).
25. internal-transfer-request.AC25 — Given an approved transfer, when access changes are scheduled, then existing access is not revoked before the effective date and new access is available on or before the effective date (BR-25, BR-26).
26. internal-transfer-request.AC26 — Given one or more applicable downstream tasks still outstanding, when all other tasks complete, then the request does not reach Completed; and given any downstream task reports `failed`, when that status is received, then the request moves to On Hold and HR is notified (BR-27, BR-28).
27. internal-transfer-request.AC27 — Given all applicable downstream tasks report `complete`, when the last one completes, then the employee receives a consolidated confirmation (new department, role, location, manager, effective date) and the request moves to Completed (S6).

**Withdrawal & Amendment**
28. internal-transfer-request.AC28 — Given a request before the organisational record has been updated, when the employee withdraws it, then the request moves to Withdrawn; given the organisational record has already been updated, when the employee attempts to withdraw, then it is rejected with `WITHDRAWAL_REQUIRES_HR` (BR-13).
29. internal-transfer-request.AC29 — Given a request in Draft or Returned for Amendment, when the employee amends it, then the change is accepted; given any other status, when the employee attempts to amend it, then the change is rejected (BR-14).

**Audit & Notifications**
30. internal-transfer-request.AC30 — Given any state transition on a request, when it occurs, then it is recorded with actor, timestamp, decision and reason (BR-33).
31. internal-transfer-request.AC31 — Given a request lifecycle event (submission, a decision, return for amendment, or completion), when it occurs, then the employee is notified; given an action becomes pending with a stakeholder, when it remains outstanding, then that stakeholder is notified and reminded (BR-35, BR-36).

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| internal-transfer-request.UT01 | AC1–AC3 | Submit with a department/location/role value not present in the controlled list | 400 VALIDATION_ERROR |
| internal-transfer-request.UT02 | AC4 | Submit with effective date 10 days out | 400 INVALID_EFFECTIVE_DATE |
| internal-transfer-request.UT03 | AC6 | Submit with location omitted | 400 VALIDATION_ERROR, field=location |
| internal-transfer-request.UT04 | AC7 | Submit with proposed = current for all three fields | 400 NO_CHANGE_REQUESTED |
| internal-transfer-request.UT05 | AC8 | Submit while an open request already exists | 409 OPEN_REQUEST_EXISTS |
| internal-transfer-request.UT06 | AC9 | Submit with 8 months tenure in current role | 403 NOT_ELIGIBLE |
| internal-transfer-request.UT07 | AC10 | Submit while on probation, no HR exception recorded | 403 NOT_ELIGIBLE |
| internal-transfer-request.UT08 | AC11 | Submit 4 months after a completed transfer | 403 NOT_ELIGIBLE |
| internal-transfer-request.UT09 | AC14 | View request while Pending Action = Facilities | pendingAction.stakeholder = "Facilities" |
| internal-transfer-request.UT10 | AC15 | View request with internal HR notes present in the data layer | Response contains no commentary field |
| internal-transfer-request.UT11 | AC17 | Manager declines without a reason | 400 REASON_REQUIRED |
| internal-transfer-request.UT12 | AC19 | Requester's own manager attempts to confirm their own team member's transfer where they are also the requester | 409 SELF_APPROVAL_NOT_ALLOWED, routed to next level |
| internal-transfer-request.UT13 | AC20 | Manager takes no action for 4 business days | Request status/pendingAction shows escalated to HR |
| internal-transfer-request.UT14 | AC21 | HR attempts eligibility decision before manager confirmation | 409 MANAGER_CONFIRMATION_PENDING |
| internal-transfer-request.UT15 | AC24 | Approved request where only Facilities applies (department/role unchanged) | Only a Facilities task is raised; Payroll/IT tasks are `not_applicable` |
| internal-transfer-request.UT16 | AC25 | IT attempts to revoke old access before effective date | Revocation rejected/blocked |
| internal-transfer-request.UT17 | AC26 | One task reports `failed` while others are `complete` | Request status = On Hold; HR notified |
| internal-transfer-request.UT18 | AC27 | All applicable tasks report `complete` | Request status = Completed; employee notified with consolidated summary |
| internal-transfer-request.UT19 | AC28 | Employee withdraws after organisational record already updated | 409 WITHDRAWAL_REQUIRES_HR |
| internal-transfer-request.UT20 | AC30 | Any decision recorded on a request | Audit event includes actor, timestamp, decision, reason |

## Explicitly Out of Scope
- Cross-legal-entity, cross-country or cross-contract transfers (BRD.md OS-01) — redirected at capture, not processed by this feature.
- International relocation/immigration/mobility management (OS-02); external recruitment/vacancy management (OS-03); promotions/grade changes as a standalone journey (OS-04); compensation negotiation (OS-05); secondments/rotations (OS-06); manager/HR-initiated transfers (OS-07); bulk/mass transfers (OS-08); contract-type changes (OS-09); exit/offboarding (OS-10); replacement of HR/Payroll/ITSM/Facilities systems (OS-13); analytics/dashboards (OS-15); offline/paper fallback (OS-16).
- Automated, confirmed bidirectional integration with Payroll/ITSM/Facilities systems — **pending the Q20 discovery spike**. API07 provides an interim contract usable manually by HR/Ops until that spike confirms automated feasibility per system.
- Manager-side and HR-side dashboards / UI beyond the minimum actions needed to drive the state machine (`manager-decision`, `hr-decision` endpoints) — richer stakeholder UI is a candidate for a later release (BRD.md DF-02).
- Internal opportunity marketplace, predictive eligibility check, workforce mobility analytics, native mobile experience, automated onboarding pack generation (BRD.md DF-01, DF-03–DF-06).
- Post-transfer feedback/check-in (BRD.md S7) — optional and not built in this Spec.
- Escalation beyond the first hop to HR (BR-18) — further escalation chains are not defined by the BRD and are not built here.

## Non-Functional Constraints (from constitution.md)
`.ai-context/constitution.md` currently has no project-specific constraints — the BRD source
contained no Constitution section (see constitution.md header note). No NFR values are
invented here. Known NFR gaps carried from BRD.md, to be resolved before Gate 2:
- Availability/performance targets for this journey (BRD.md Q24) — undefined.
- Accessibility/language standards (Q17) — undefined.
- Retention period for transfer request records (Q9) — undefined; audit events (AC30) must
  still be produced regardless of the eventual retention period.
