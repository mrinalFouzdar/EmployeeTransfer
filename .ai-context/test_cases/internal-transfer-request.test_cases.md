# Test Cases: Internal Transfer Request

## Derived From Spec
`.ai-context/specs/internal-transfer-request.spec.md`

## Acceptance Test Scenarios

### internal-transfer-request.TC01 — Department must come from the controlled list
- **Maps to AC:** internal-transfer-request.AC1
- **Given:** the employee is on the transfer request form
- **When:** they submit a `departmentId` that does not exist in the controlled department list
- **Then:** the request is rejected with `400 VALIDATION_ERROR` (field: department)
- **Automated Test File:** tests/backend/transfers/createRequest.validation.test.ts

### internal-transfer-request.TC02 — Location must come from the controlled list
- **Maps to AC:** internal-transfer-request.AC2
- **Given:** the employee is on the transfer request form
- **When:** they submit a `locationId` that does not exist in the controlled location list
- **Then:** the request is rejected with `400 VALIDATION_ERROR` (field: location)
- **Automated Test File:** tests/backend/transfers/createRequest.validation.test.ts

### internal-transfer-request.TC03 — Role must come from the controlled list
- **Maps to AC:** internal-transfer-request.AC3
- **Given:** the employee is on the transfer request form
- **When:** they submit a `roleId` that does not exist in the controlled role list
- **Then:** the request is rejected with `400 VALIDATION_ERROR` (field: role)
- **Automated Test File:** tests/backend/transfers/createRequest.validation.test.ts

### internal-transfer-request.TC04 — Effective date below the 4-week minimum lead time is rejected
- **Maps to AC:** internal-transfer-request.AC4
- **Given:** today's date is known
- **When:** the employee submits an effective date 10 days from today
- **Then:** the request is rejected with `400 INVALID_EFFECTIVE_DATE`
- **Automated Test File:** tests/backend/transfers/createRequest.effectiveDate.test.ts

### internal-transfer-request.TC05 — Effective date before the next payroll cut-off defers only the pay-affecting change
- **Maps to AC:** internal-transfer-request.AC4
- **Given:** a request otherwise valid (≥4 weeks lead time) whose effective date falls before the next payroll cut-off
- **When:** the request is approved and reaches organisational update
- **Then:** the org/access/facilities changes still apply on the requested effective date, and only the payroll-relevant change is deferred to the following payroll period
- **Automated Test File:** tests/backend/transfers/orchestration.payrollCutoff.test.ts

### internal-transfer-request.TC06 — Reason is optional
- **Maps to AC:** internal-transfer-request.AC5
- **Given:** the employee is on the transfer request form
- **When:** they submit with `reason` omitted
- **Then:** the request is accepted (`201`)
- **Automated Test File:** tests/backend/transfers/createRequest.validation.test.ts

### internal-transfer-request.TC07 — Missing mandatory field blocks submission
- **Maps to AC:** internal-transfer-request.AC6
- **Given:** the employee is on the transfer request form
- **When:** they submit with `effectiveDate` omitted
- **Then:** the request is rejected with `400 VALIDATION_ERROR` (field: effectiveDate)
- **Automated Test File:** tests/backend/transfers/createRequest.validation.test.ts

### internal-transfer-request.TC08 — No-change request is rejected
- **Maps to AC:** internal-transfer-request.AC7
- **Given:** the employee's current department, location and role
- **When:** they submit a request with all three proposed values identical to current
- **Then:** the request is rejected with `400 NO_CHANGE_REQUESTED`
- **Automated Test File:** tests/backend/transfers/createRequest.businessRules.test.ts

### internal-transfer-request.TC09 — Only one open request at a time
- **Maps to AC:** internal-transfer-request.AC8
- **Given:** the employee already has a request in `Submitted` status
- **When:** they attempt to submit a second request
- **Then:** it is rejected with `409 OPEN_REQUEST_EXISTS`
- **Automated Test File:** tests/backend/transfers/createRequest.businessRules.test.ts

### internal-transfer-request.TC10 — Tenure below 12 months blocks submission
- **Maps to AC:** internal-transfer-request.AC9
- **Given:** the employee has 8 months tenure in their current role
- **When:** they submit a transfer request
- **Then:** it is rejected with `403 NOT_ELIGIBLE`
- **Automated Test File:** tests/backend/transfers/createRequest.eligibility.test.ts

### internal-transfer-request.TC11 — Probation without HR exception blocks submission
- **Maps to AC:** internal-transfer-request.AC10
- **Given:** the employee is on probation and HR has recorded no exception
- **When:** they submit a transfer request
- **Then:** it is rejected with `403 NOT_ELIGIBLE`
- **Automated Test File:** tests/backend/transfers/createRequest.eligibility.test.ts

### internal-transfer-request.TC12 — Probation with a recorded HR exception allows submission
- **Maps to AC:** internal-transfer-request.AC10
- **Given:** the employee is on probation and HR has recorded an exception for them
- **When:** they submit a transfer request
- **Then:** it is accepted (`201`)
- **Automated Test File:** tests/backend/transfers/createRequest.eligibility.test.ts

### internal-transfer-request.TC13 — Cooling-off period blocks submission
- **Maps to AC:** internal-transfer-request.AC11
- **Given:** the employee completed a transfer 4 months ago
- **When:** they submit a new transfer request
- **Then:** it is rejected with `403 NOT_ELIGIBLE`
- **Automated Test File:** tests/backend/transfers/createRequest.eligibility.test.ts

### internal-transfer-request.TC14 — Current org fields are read-only
- **Maps to AC:** internal-transfer-request.AC12
- **Given:** the employee opens the request form
- **When:** the form loads
- **Then:** current department/role/location/grade/manager are pre-populated and not present as editable inputs
- **Automated Test File:** tests/frontend/transfers/RequestForm.test.tsx

### internal-transfer-request.TC15 — Employee can view current status
- **Maps to AC:** internal-transfer-request.AC13
- **Given:** a submitted request in `Under HR Review` status
- **When:** the employee views the request
- **Then:** the response shows `status: "Under HR Review"`
- **Automated Test File:** tests/backend/transfers/getRequest.test.ts

### internal-transfer-request.TC16 — Employee can view the pending stakeholder
- **Maps to AC:** internal-transfer-request.AC14
- **Given:** a request with an outstanding Facilities task
- **When:** the employee views the request
- **Then:** `pendingAction.stakeholder = "Facilities"` and `pendingSince` is set
- **Automated Test File:** tests/backend/transfers/getRequest.test.ts

### internal-transfer-request.TC17 — Internal commentary is never exposed to the employee
- **Maps to AC:** internal-transfer-request.AC15
- **Given:** a request with internal HR notes stored against it
- **When:** the employee views the request
- **Then:** the response contains no commentary/notes field
- **Automated Test File:** tests/backend/transfers/getRequest.visibility.test.ts

### internal-transfer-request.TC18 — Salary/remuneration is never exposed to the employee
- **Maps to AC:** internal-transfer-request.AC16
- **Given:** a request that triggers a pay/grade change
- **When:** the employee views the request
- **Then:** the response contains no salary/remuneration figures
- **Automated Test File:** tests/backend/transfers/getRequest.visibility.test.ts

### internal-transfer-request.TC19 — Manager decline requires a reason
- **Maps to AC:** internal-transfer-request.AC17
- **Given:** a request awaiting the current manager's decision
- **When:** the manager submits `decision: "decline"` with no `reason`
- **Then:** it is rejected with `400 REASON_REQUIRED`
- **Automated Test File:** tests/backend/transfers/managerDecision.test.ts

### internal-transfer-request.TC20 — Manager confirm/decline/return transitions status correctly
- **Maps to AC:** internal-transfer-request.AC17
- **Given:** a request awaiting the current manager's decision
- **When:** the manager submits `decision: "confirm"`
- **Then:** the request status advances toward HR review
- **Automated Test File:** tests/backend/transfers/managerDecision.test.ts

### internal-transfer-request.TC21 — Receiving-manager confirmation required when named
- **Maps to AC:** internal-transfer-request.AC18
- **Given:** the proposed role has a named receiving manager, and the current manager has confirmed
- **When:** the receiving manager has not yet responded
- **Then:** the request remains pending on the receiving manager and does not proceed to HR validation
- **Automated Test File:** tests/backend/transfers/managerDecision.receivingManager.test.ts

### internal-transfer-request.TC22 — Self-approval conflict routes to next-level management
- **Maps to AC:** internal-transfer-request.AC19
- **Given:** the requester's assigned current manager is the requester themselves (edge case / org data anomaly)
- **When:** the request is submitted
- **Then:** the manager-confirmation step is routed to the next level of management, and the original manager receives `409 SELF_APPROVAL_NOT_ALLOWED` if they attempt to act
- **Automated Test File:** tests/backend/transfers/managerDecision.selfApproval.test.ts

### internal-transfer-request.TC23 — Manager inaction escalates to HR after 3 business days
- **Maps to AC:** internal-transfer-request.AC20
- **Given:** a request has been awaiting manager confirmation for 4 business days
- **When:** the escalation check runs
- **Then:** the request's pending action reassigns to HR
- **Automated Test File:** tests/backend/transfers/escalation.test.ts

### internal-transfer-request.TC24 — HR cannot decide before manager confirmation
- **Maps to AC:** internal-transfer-request.AC21
- **Given:** a request with no manager decision recorded yet
- **When:** HR attempts to submit an eligibility decision
- **Then:** it is rejected with `409 MANAGER_CONFIRMATION_PENDING`
- **Automated Test File:** tests/backend/transfers/hrDecision.test.ts

### internal-transfer-request.TC25 — HR "not eligible" requires a reason and rejects the request
- **Maps to AC:** internal-transfer-request.AC22
- **Given:** a manager-confirmed request
- **When:** HR submits `decision: "not_eligible"` with a reason
- **Then:** the request status becomes `Rejected` and the reason is visible to the employee
- **Automated Test File:** tests/backend/transfers/hrDecision.test.ts

### internal-transfer-request.TC26 — HR "eligible" proceeds to organisational update
- **Maps to AC:** internal-transfer-request.AC22
- **Given:** a manager-confirmed request
- **When:** HR submits `decision: "eligible"`
- **Then:** the request proceeds to the organisational record update step
- **Automated Test File:** tests/backend/transfers/hrDecision.test.ts

### internal-transfer-request.TC27 — Downstream tasks are not raised before HR approval
- **Maps to AC:** internal-transfer-request.AC23
- **Given:** a request still awaiting HR eligibility validation
- **When:** the request state is inspected
- **Then:** no Payroll/IT/Facilities fulfilment tasks exist yet
- **Automated Test File:** tests/backend/transfers/orchestration.sequencing.test.ts

### internal-transfer-request.TC28 — Only applicable downstream tasks are raised, in parallel
- **Maps to AC:** internal-transfer-request.AC24
- **Given:** an HR-approved request where only the location changes (department/role unchanged)
- **When:** the organisational record is updated
- **Then:** a Facilities task is raised; Payroll and IT tasks are marked `not_applicable`; all raised tasks start concurrently, not sequentially
- **Automated Test File:** tests/backend/transfers/orchestration.applicability.test.ts

### internal-transfer-request.TC29 — Access is not revoked before the effective date
- **Maps to AC:** internal-transfer-request.AC25
- **Given:** an approved request with an IT access-revocation task
- **When:** the current date is before the effective date
- **Then:** the old access has not been revoked
- **Automated Test File:** tests/backend/transfers/orchestration.accessTiming.test.ts

### internal-transfer-request.TC30 — New access is available on/before the effective date
- **Maps to AC:** internal-transfer-request.AC25
- **Given:** an approved request with an IT access-provisioning task
- **When:** the effective date arrives
- **Then:** the new access has been provisioned on or before that date
- **Automated Test File:** tests/backend/transfers/orchestration.accessTiming.test.ts

### internal-transfer-request.TC31 — Request does not complete while a task is outstanding
- **Maps to AC:** internal-transfer-request.AC26
- **Given:** Payroll and IT tasks are `complete` but Facilities is still `in_progress`
- **When:** the request status is evaluated
- **Then:** the request status is not `Completed`
- **Automated Test File:** tests/backend/transfers/orchestration.completion.test.ts

### internal-transfer-request.TC32 — Failed downstream task moves the request On Hold
- **Maps to AC:** internal-transfer-request.AC26
- **Given:** an IT task reports `failed`
- **When:** that status is received
- **Then:** the request status becomes `On Hold` and HR is notified
- **Automated Test File:** tests/backend/transfers/orchestration.failure.test.ts

### internal-transfer-request.TC33 — Completion sends a consolidated confirmation
- **Maps to AC:** internal-transfer-request.AC27
- **Given:** all applicable downstream tasks report `complete`
- **When:** the last one completes
- **Then:** the request status becomes `Completed` and the employee is notified with new department/role/location/manager/effective date
- **Automated Test File:** tests/backend/transfers/orchestration.completion.test.ts

### internal-transfer-request.TC34 — Employee can withdraw before organisational update
- **Maps to AC:** internal-transfer-request.AC28
- **Given:** a request in `Under HR Review` status (org record not yet updated)
- **When:** the employee withdraws it
- **Then:** the request status becomes `Withdrawn`
- **Automated Test File:** tests/backend/transfers/withdraw.test.ts

### internal-transfer-request.TC35 — Withdrawal after organisational update requires HR
- **Maps to AC:** internal-transfer-request.AC28
- **Given:** a request whose organisational record has already been updated
- **When:** the employee attempts to withdraw it
- **Then:** it is rejected with `409 WITHDRAWAL_REQUIRES_HR`
- **Automated Test File:** tests/backend/transfers/withdraw.test.ts

### internal-transfer-request.TC36 — Amendment allowed only in Draft/Returned for Amendment
- **Maps to AC:** internal-transfer-request.AC29
- **Given:** a request in `Under HR Review` status
- **When:** the employee attempts to amend it
- **Then:** the amendment is rejected
- **Automated Test File:** tests/backend/transfers/amend.test.ts

### internal-transfer-request.TC37 — Every decision is recorded as an audit event
- **Maps to AC:** internal-transfer-request.AC30
- **Given:** a manager records a decision on a request
- **When:** the decision is saved
- **Then:** an audit event is created with actor, timestamp, decision and reason
- **Automated Test File:** tests/backend/transfers/audit.test.ts

### internal-transfer-request.TC38 — Notifications fire on lifecycle events
- **Maps to AC:** internal-transfer-request.AC31
- **Given:** a request transitions from `Submitted` to `Manager Confirmed`
- **When:** the transition occurs
- **Then:** the employee receives a notification of the decision
- **Automated Test File:** tests/backend/transfers/notifications.test.ts

### internal-transfer-request.TC39 — Stakeholder reminded while action remains outstanding
- **Maps to AC:** internal-transfer-request.AC31
- **Given:** a task has been pending with Facilities for longer than the reminder interval
- **When:** the reminder check runs
- **Then:** Facilities receives a reminder notification
- **Automated Test File:** tests/backend/transfers/notifications.test.ts

## Cross-Feature Integration Scenarios
None yet — this is the first feature Spec in this project. Cross-feature scenarios (e.g.
with a future `employees`/`org` module, or a future Payroll/IT/Facilities integration module)
belong in `.ai-context/test_cases/_integration.md` once those modules exist.
