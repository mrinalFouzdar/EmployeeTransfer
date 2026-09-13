# Business Requirements Document (BRD)

## Internal Transfer Request — One-Point Employee Portal

**INT SDD Methodology — Deliverable 1: Requirement / Discovery Analysis**

---

## 1. Document Control

| Field | Detail |
|---|---|
| Document title | BRD — Internal Transfer Request Journey |
| Product / platform | One-Point Employee Portal |
| SDD stage | Stage 1 — Requirement / Discovery Analysis |
| Version | 0.1 (Draft for review) |
| Status | Pending business sign-off |
| Author | Solution / Business Analysis |
| Reviewers | HR Operations, Payroll, IT Service Management, Facilities, Portal Product Owner |
| Approver | Portal Product Owner + HR Process Owner |

**Revision history**

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1 | TBC | Initial discovery draft | BA |

---

## 2. Executive Summary

An internal transfer today is a manual, multi-team process. The employee is the integrator: they chase the manager, HR, Payroll, IT and Facilities across separate systems, with no consolidated view of where the request sits or who owes the next action.

This document defines the business requirement for a single digital journey on the One-Point Employee Portal. The employee raises one Internal Transfer Request. The portal captures it, routes it for approval, validates eligibility, orchestrates the downstream fulfilment activities across Payroll, IT and Facilities, and presents one consolidated progress view back to the employee.

The scope of this deliverable is **what** the business needs and **why**. Solution architecture, integration design and data models are deliberately deferred to later SDD stages, other than where a technical constraint materially shapes a business rule.

---

## 3. Background and Current State

### 3.1 Current process

| # | Step | Owner | Typical system |
|---|---|---|---|
| 1 | Employee discusses proposed transfer | Employee / Manager | Informal — email, conversation |
| 2 | Manager confirms the transfer | Current Manager | Email |
| 3 | HR validates eligibility | HR | HR / Core HCM system |
| 4 | Organisational information updated | HR | HR / Core HCM system |
| 5 | Payroll updated (if applicable) | Payroll | Payroll system |
| 6 | Access provisioned or removed | IT | ITSM / IAM tooling |
| 7 | New workplace location arranged | Facilities | Facilities / workplace system |
| 8 | Employee receives confirmation | HR | Email |

### 3.2 Pain points

| Ref | Pain point | Business impact |
|---|---|---|
| P1 | No single entry point for the request | Inconsistent initiation; requests raised informally and lost |
| P2 | No visibility of status | High volume of chase enquiries to HR, IT and Facilities |
| P3 | Sequential, manual hand-offs | Extended cycle time; employee productive in new role later than planned |
| P4 | No visibility of who owes the next action | Requests stall silently with no accountable owner |
| P5 | Data re-keyed across systems | Inconsistent records between HR, Payroll and IT |
| P6 | No auditable record of decisions | Difficulty evidencing approval and eligibility checks |
| P7 | Downstream teams engaged late or inconsistently | Employee arrives without access, desk or correct pay treatment |

---

## 4. Business Objective

### 4.1 Primary objective

Provide employees with a **single, self-service, end-to-end digital journey** for initiating and tracking an internal transfer through the One-Point Employee Portal, with the portal acting as the orchestrator of all downstream activities across HR, Payroll, IT and Facilities.

### 4.2 Supporting objectives

| Ref | Objective |
|---|---|
| O1 | Establish one authoritative entry point and one authoritative record for every internal transfer request |
| O2 | Give the employee real-time visibility of request status and of the stakeholder holding the pending action |
| O3 | Reduce end-to-end transfer cycle time by removing manual hand-offs and enabling parallel fulfilment |
| O4 | Reduce status-chase contact volume into HR, IT and Facilities service desks |
| O5 | Enforce eligibility and approval rules consistently rather than by local interpretation |
| O6 | Produce a complete, auditable trail of who requested, approved, validated and fulfilled each transfer |
| O7 | Ensure downstream systems (HR record, Payroll, Access, Facilities) reflect the transfer accurately by the effective date |

### 4.3 Candidate success measures

Targets to be set by the business during sign-off; the measures themselves are proposed here.

| Ref | Measure | Baseline | Target |
|---|---|---|---|
| M1 | Average end-to-end cycle time, submission to confirmation | TBC | TBC — reduction against baseline |
| M2 | % of transfer requests initiated through the portal | ~0% | TBC — target adoption |
| M3 | Status-related contacts per transfer request | TBC | TBC — reduction |
| M4 | % of transfers with all downstream tasks complete on or before the effective date | TBC | TBC |
| M5 | Employee satisfaction with the transfer journey | N/A | TBC |
| M6 | % of requests rejected after approval due to eligibility failure | TBC | Reduction — eligibility checked earlier |

---

## 5. Scope

### 5.1 In scope

- Employee-initiated internal transfer request capture on the One-Point Employee Portal.
- Manager confirmation / approval action.
- HR eligibility validation and decision.
- Orchestration of downstream fulfilment tasks to HR Operations, Payroll, IT and Facilities.
- Consolidated status and pending-action view for the employee.
- Notifications to the employee and to each stakeholder at their point of action.
- Audit record of the request lifecycle.

### 5.2 Out of scope

See Section 13 for the full out-of-scope register.

---

## 6. Primary Users and Stakeholders

### 6.1 Primary users — those who transact in the journey

| User | Role in the journey | Key needs |
|---|---|---|
| **Employee (Requester)** | Initiates the request, provides transfer details, tracks progress | Simple form, clear status, knowing who to chase and when |
| **Current Line Manager** | Confirms or declines release of the employee | Clear request context, low-friction decision, visibility of impact on their team |
| **Receiving Manager (proposed new manager)** | Confirms acceptance into the receiving team/role | Confirmation that the role and headcount exist and are funded |
| **HR / HR Operations** | Validates eligibility; updates organisational record; issues confirmation | Eligibility data in one place, exception handling, audit trail |
| **Payroll** | Assesses and applies any pay, cost-centre, allowance or location-driven changes | Advance notice, accurate effective date, clear indication of what changed |
| **IT** | Provisions new access and removes access no longer required | Accurate role and department data, lead time before the effective date |
| **Facilities** | Arranges desk, workspace, building access at the new location | Location, effective date, any accessibility or equipment needs |

### 6.2 Secondary stakeholders — those with an interest but no transactional step

| Stakeholder | Interest |
|---|---|
| Portal Product Owner | Journey design, adoption, roadmap |
| HR Process Owner | Policy compliance, eligibility rules |
| Information Security / IAM | Least-privilege access, timely revocation, segregation of duties |
| Data Protection / Privacy Office | Lawful handling of employee data, visibility restrictions |
| Works Council / Employee Representation *(if applicable)* | Consultation on process change affecting employees |
| Internal Audit | Evidence of approvals and controls |
| Finance / Cost Centre Owners | Cost centre movement and headcount budget impact |

---

## 7. Journey Stages

### 7.1 Stage model

| Stage | Name | Trigger | Primary actor | Exit condition |
|---|---|---|---|---|
| **S0** | Explore / Pre-request | Employee considers a transfer | Employee | Employee opens the transfer request form |
| **S1** | Initiate & Capture | Employee opens the request form | Employee | Valid request submitted |
| **S2** | Managerial Confirmation | Request submitted | Current Manager (and Receiving Manager) | Confirmed or declined |
| **S3** | HR Eligibility Validation | Managerial confirmation received | HR | Eligible / Not eligible / Conditionally eligible |
| **S4** | Organisational Record Update | HR validation passed | HR Operations | Employee's organisational data updated with effective date |
| **S5** | Downstream Fulfilment (parallel) | Organisational update confirmed | Payroll, IT, Facilities | All applicable fulfilment tasks closed |
| **S6** | Confirmation & Closure | All fulfilment tasks complete | Portal / HR | Employee receives confirmation; request closed |
| **S7** | Post-transfer *(optional)* | Effective date reached | Employee / Receiving Manager | Feedback captured; record archived |

### 7.2 Stage detail

**S0 — Explore / Pre-request**
Employee reviews internal opportunities, eligibility guidance and the transfer policy on the portal. No record is created. This stage is informational and reduces ineligible submissions.

**S1 — Initiate & Capture**
The employee completes the Internal Transfer Request:
- Proposed new department / business unit *(selection from a controlled list)*
- Proposed new location *(selection from a controlled list)*
- Proposed role / job position *(selection from a controlled list)*
- Effective date
- Reason for transfer *(optional, free text)*

The portal pre-populates known employee data (current department, current role, current location, manager, employee ID) rather than asking the employee to re-enter it. On submission the employee receives a request reference and the request becomes visible in their tracking view.

**S2 — Managerial Confirmation**
The request is routed to the current line manager for confirmation. Where the receiving manager is a distinct approver, the request is also routed to them. The manager may confirm, decline (with reason) or return the request to the employee for amendment.

**S3 — HR Eligibility Validation**
HR validates the request against transfer policy: tenure in current role, performance or disciplinary standing, notice and probation status, role/grade suitability, headcount and budget availability in the receiving unit, and any location-specific conditions (e.g. right to work, relocation policy). Outcome is Eligible, Not Eligible, or Eligible with conditions.

**S4 — Organisational Record Update**
HR Operations records the transfer against the employee's organisational information with the agreed effective date. This becomes the authoritative trigger for downstream fulfilment.

**S5 — Downstream Fulfilment (parallel)**
The portal raises fulfilment tasks in parallel, only where applicable:
- **Payroll** — cost centre reassignment, location-driven allowances, grade or pay changes, tax/jurisdiction implications.
- **IT** — provision access for the new role/department; revoke access no longer required; asset changes if the location changes.
- **Facilities** — desk or workspace allocation, building access, equipment, parking, locker.

Each task reports its own status back to the portal. The consolidated view shows the employee which tasks are outstanding and with whom, without exposing internal task detail that is not relevant to them.

**S6 — Confirmation & Closure**
Once all applicable fulfilment tasks are complete, the employee receives a consolidated confirmation summarising the new department, role, location, manager and effective date. The request moves to Completed.

**S7 — Post-transfer (optional)**
Optional check-in or feedback capture after the effective date, feeding measure M5.

### 7.3 Status model presented to the employee

| Status | Meaning |
|---|---|
| Draft | Started, not yet submitted |
| Submitted | Awaiting managerial confirmation |
| Manager Confirmed | Awaiting HR eligibility validation |
| Returned for Amendment | Action required by the employee |
| Under HR Review | HR validating eligibility |
| Approved — In Progress | Downstream fulfilment underway |
| Pending Action — *[Stakeholder]* | A specific stakeholder holds the next action |
| On Hold | Progress paused, reason shown |
| Completed | Transfer confirmed and effective |
| Rejected | Declined, with reason |
| Withdrawn | Cancelled by the employee |

---

## 8. Business Rules

Rules are stated as business intent. Where a rule requires a value the business has not yet fixed, it is flagged and cross-referenced to Section 11 (Open Questions).

### 8.1 Eligibility rules

| Ref | Rule | Status |
|---|---|---|
| BR-01 | Only active employees may raise an internal transfer request. Employees serving notice or with a pending exit are excluded. | Confirmed intent |
| BR-02 | The employee must have completed a minimum tenure in their current role before requesting a transfer. | Threshold TBC — Q1 |
| BR-03 | Employees on probation are not eligible unless an exception is approved. | Exception route TBC — Q2 |
| BR-04 | Employees with an active disciplinary or performance improvement process are not eligible without HR override. | Confirmed intent |
| BR-05 | A cooling-off period applies between a completed transfer and a new request. | Period TBC — Q3 |
| BR-06 | An employee may have only one open transfer request at a time. | Confirmed intent |

### 8.2 Request capture rules

| Ref | Rule |
|---|---|
| BR-07 | Department/business unit, location, role and effective date are mandatory. Reason is optional. |
| BR-08 | Department, location and role must be selected from controlled organisational lists — free text is not permitted for these fields. |
| BR-09 | The proposed values must differ from the employee's current values in at least one of department, role or location; a request with no change is invalid. |
| BR-10 | The effective date must be a future date and must respect a minimum lead time to allow fulfilment. Lead time TBC — Q4. |
| BR-11 | The effective date should fall on a valid working day and, where payroll treatment depends on it, align to payroll cut-off. Alignment approach TBC — Q5. |
| BR-12 | Current department, role, location, grade and manager are system-populated and not editable by the employee. |
| BR-13 | The employee may withdraw the request at any point before the organisational record is updated (end of S4). After that, withdrawal requires HR intervention. |
| BR-14 | The employee may amend a request only while it is in Draft or Returned for Amendment. |

### 8.3 Approval and routing rules

| Ref | Rule |
|---|---|
| BR-15 | Current line manager confirmation is mandatory before HR validation. |
| BR-16 | Receiving manager confirmation is required where the receiving role has a named hiring/receiving manager. Whether this is mandatory in all cases is TBC — Q6. |
| BR-17 | A manager cannot approve their own transfer request; such requests route to the next level of management. |
| BR-18 | Where the current manager does not act within a defined period, the request escalates. Escalation path and timeframe TBC — Q7. |
| BR-19 | HR holds the final decision on eligibility; managerial confirmation alone does not approve a transfer. |
| BR-20 | A rejection at any stage must carry a reason, which is shown to the employee. |
| BR-21 | Transfers that cross legal entity, country or employment contract boundaries follow a different, out-of-scope process and must be redirected at the point of capture. |

### 8.4 Orchestration rules

| Ref | Rule |
|---|---|
| BR-22 | Downstream fulfilment tasks are only raised after HR eligibility validation is passed and the organisational record is updated. |
| BR-23 | Payroll, IT and Facilities tasks run in parallel, not sequentially. |
| BR-24 | A downstream task is only raised where it is applicable. Applicability rules: Payroll where cost centre, grade, allowances or pay-affecting location changes; IT where role or department changes access requirements; Facilities where physical location changes. |
| BR-25 | Access revocation must not be actioned before the effective date, so the employee retains access needed in their current role. |
| BR-26 | New access should be available on or before the effective date. |
| BR-27 | The request cannot reach Completed while any applicable downstream task is outstanding. |
| BR-28 | If any downstream task fails or is rejected, the request moves to On Hold and HR is notified; it does not silently complete. |

### 8.5 Visibility and data rules

| Ref | Rule |
|---|---|
| BR-29 | The employee sees status, the stakeholder holding the pending action, and the date the action became pending. |
| BR-30 | The employee does not see internal commentary between HR, managers or downstream teams. |
| BR-31 | The optional reason for transfer is visible to the manager and HR; visibility to downstream teams is restricted. Confirmation TBC — Q8. |
| BR-32 | Salary and remuneration detail is not exposed in the employee-facing transfer journey. |
| BR-33 | All state changes are recorded with actor, timestamp, decision and reason for audit. |
| BR-34 | Retention of transfer request records follows the organisation's HR record retention policy. Period TBC — Q9. |

### 8.6 Notification rules

| Ref | Rule |
|---|---|
| BR-35 | The employee is notified on submission, on each decision, on return for amendment, and on completion. |
| BR-36 | Each stakeholder is notified when an action becomes pending with them, and reminded if it remains outstanding. |
| BR-37 | Notification of routine progress within downstream fulfilment should not overwhelm the employee; the tracking view is the primary channel for granular progress. |

---

## 9. Known Decisions

Decisions already taken and treated as settled input to design.

### 9.1 Business decisions

| Ref | Decision | Rationale | Owner |
|---|---|---|---|
| KD-B01 | The One-Point Employee Portal is the single entry point for internal transfer requests | Removes fragmented initiation; supports single view | Business |
| KD-B02 | The portal orchestrates downstream activity rather than acting as a form that hands off to email | Core to the stated business requirement | Business |
| KD-B03 | The employee is given a single consolidated view of progress and pending actions | Directly stated requirement | Business |
| KD-B04 | Manager confirmation precedes HR eligibility validation | Reflects the current agreed process order | Business |
| KD-B05 | HR retains authority over eligibility; the portal does not auto-approve transfers | Policy and control requirement | Business |
| KD-B06 | Department, location and role are selected from controlled lists, not free text | Data quality and downstream automation | Business |
| KD-B07 | Reason for transfer is optional | Stated requirement; avoids discouraging legitimate requests | Business |
| KD-B08 | Payroll, IT and Facilities involvement is conditional, not automatic | Not every transfer affects every function | Business |

### 9.2 Technical decisions

| Ref | Decision | Rationale | Owner |
|---|---|---|---|
| KD-T01 | The portal holds the orchestration state and the master status of the request | Required to present a single consolidated view | Technical |
| KD-T02 | The HR/Core HCM system remains the system of record for the employee's organisational data; the portal does not duplicate it | Avoids a competing source of truth | Technical |
| KD-T03 | Downstream fulfilment is triggered by integration to Payroll, ITSM/IAM and Facilities systems rather than by manual email | Enables status tracking and reduces hand-off loss | Technical |
| KD-T04 | Downstream fulfilment tasks execute in parallel | Cycle time objective O3 | Technical |
| KD-T05 | Employee, department, location, role and manager reference data is consumed from existing authoritative sources, not maintained in the portal | Data consistency | Technical |
| KD-T06 | Every state transition is persisted as an immutable audit event | Objective O6 and BR-33 | Technical |
| KD-T07 | Authentication and authorisation reuse the portal's existing enterprise identity model | No bespoke access model for this journey | Technical |

---

## 10. Business Decision vs Technical Decision — Classification

The distinction applied throughout this document:

> A **business decision** determines *what the organisation wants to happen and under what conditions* — policy, eligibility, authority, sequence of accountability, what the employee sees. It is owned by HR, the process owner or the product owner, and changing it changes the process.
>
> A **technical decision** determines *how the outcome is delivered* — system of record, integration pattern, orchestration mechanism, data flow, error handling. It is owned by architecture and engineering, and changing it does not change what the business has agreed.

| Topic | Business decision | Technical decision |
|---|---|---|
| Eligibility criteria | Which employees may transfer, and the thresholds applied | How rules are evaluated and where the rule logic is configured |
| Approval chain | Who must approve, and in what order | How approval tasks are routed, escalated and timed out |
| Effective date | Lead time and payroll-cut-off policy | Date validation, scheduling of effective-dated changes |
| Downstream involvement | Which functions must be engaged and under what conditions | Integration method to Payroll, IT and Facilities systems |
| Parallel fulfilment | That the employee should not wait for sequential hand-offs | Orchestration pattern used to run tasks concurrently and reconcile completion |
| Status visibility | Which statuses and which pending-action detail the employee sees | Status aggregation model and refresh mechanism |
| Access timing | That access is not revoked before the effective date | Scheduling and triggering of provisioning/de-provisioning |
| Reason for transfer | That it is optional, and who may read it | Field storage, masking and access control |
| Audit | That decisions must be auditable and evidence retained | Event model, storage, retention implementation |
| Reference data | That controlled lists are used | Which source system supplies each list and how it is synchronised |
| Notifications | That stakeholders are told when they hold an action | Channel, template and delivery mechanism |
| Failure of a downstream task | That the request must not silently complete | Retry, compensation and exception-handling design |

---

## 11. Open Questions

To be closed before Stage 2 (Solution Design). Each carries a proposed owner.

### 11.1 Business open questions

| Ref | Question | Impact if unresolved | Owner |
|---|---|---|---|
| Q1 | What minimum tenure in the current role is required (BR-02)? | Eligibility cannot be enforced | HR Process Owner |
| Q2 | Are probationary employees ever eligible, and who approves the exception (BR-03)? | Ambiguous rejections | HR Process Owner |
| Q3 | What cooling-off period applies between transfers (BR-05)? | Repeat requests unmanaged | HR Process Owner |
| Q4 | What minimum lead time is required between submission and effective date (BR-10)? | Fulfilment cannot be guaranteed by the effective date | HR + IT + Facilities |
| Q5 | How should the effective date align to payroll cut-off (BR-11)? | Mid-period pay errors | Payroll |
| Q6 | Is receiving-manager confirmation mandatory in all cases (BR-16)? | Routing design cannot be finalised | HR Process Owner |
| Q7 | What are the escalation timeframes and escalation path for inaction (BR-18)? | Requests stall — pain point P4 persists | HR Process Owner |
| Q8 | Who may read the optional reason for transfer (BR-31)? | Privacy risk | Data Protection Office |
| Q9 | What is the retention period for transfer request records (BR-34)? | Compliance gap | Data Protection Office |
| Q10 | Can the employee choose the receiving role from open vacancies only, or propose any role? | Materially changes the capture experience | HR + Talent Acquisition |
| Q11 | Does an internal transfer require a competitive selection process, or is it a direct move? | Determines whether recruitment is in scope | HR + Talent Acquisition |
| Q12 | How are headcount and budget availability in the receiving unit confirmed, and by whom? | Approved transfers may be unfundable | Finance + HR |
| Q13 | Is the transfer reversible after approval but before the effective date, and by whom? | Undefined cancellation path | HR Process Owner |
| Q14 | Do location changes trigger relocation, mobility or right-to-work considerations? | Compliance exposure | HR Mobility |
| Q15 | Is works council or employee representative consultation required for this process change? | Deployment risk | HR / Legal |
| Q16 | Are contractors, temporary staff or part-time employees in or out of scope? | Population undefined | HR Process Owner |
| Q17 | What languages and accessibility standards must the journey support? | Rework late in delivery | Portal Product Owner |
| Q18 | What are the target values for measures M1–M6? | Success cannot be evidenced | Portal Product Owner |

### 11.2 Technical open questions

| Ref | Question | Impact if unresolved | Owner |
|---|---|---|---|
| Q19 | Which system is authoritative for department, location and role reference data? | Inconsistent controlled lists | Architecture |
| Q20 | Do Payroll, ITSM and Facilities systems expose integration interfaces capable of both receiving a task and returning status? | May force manual status updates, undermining O2 | Architecture + system owners |
| Q21 | Are effective-dated changes supported by the HR system, or must changes be applied on the date itself? | Affects scheduling design and BR-25/BR-26 | HR System Owner |
| Q22 | How is a partial failure handled — for example HR updated but IT provisioning failed? | Inconsistent state across systems | Architecture |
| Q23 | Is a shared correlation identifier available across HR, Payroll, IT and Facilities records? | Status cannot be reliably aggregated | Architecture |
| Q24 | What are the availability and performance expectations for the journey? | NFRs undefined | Architecture + Product Owner |
| Q25 | Can the manager and HR actions be completed from within the portal, or must the actor switch to another system? | Directly affects the single-journey objective | Architecture |
| Q26 | How will the journey be tested end to end given the number of downstream systems? | Late defect discovery | Delivery / QA |

---

## 12. Assumptions

Assumptions are working positions taken to allow discovery to proceed. Each must be validated; if invalidated, the associated requirement is revisited.

### 12.1 Business assumptions

| Ref | Assumption | Validate with |
|---|---|---|
| A-B01 | An internal transfer policy already exists and is documented | HR Process Owner |
| A-B02 | The eight-step current process described in the brief is accurate and complete | HR Operations |
| A-B03 | The scope is transfers within the same legal entity and country | HR Process Owner |
| A-B04 | Every employee has an identifiable line manager in the HR system | HR System Owner |
| A-B05 | Department, location and role structures are maintained and current | HR Operations |
| A-B06 | Employees have portal access and can authenticate | Portal Product Owner |
| A-B07 | Managers, HR, Payroll, IT and Facilities users are willing and able to act within the portal or a connected system | All function owners |
| A-B08 | A transfer does not automatically imply a promotion or grade change; where it does, the promotion process applies alongside | HR Process Owner |
| A-B09 | Facilities involvement is only required where the physical location changes | Facilities |
| A-B10 | Payroll involvement is only required where pay, cost centre or allowances are affected | Payroll |

### 12.2 Technical assumptions

| Ref | Assumption | Validate with |
|---|---|---|
| A-T01 | The portal already provides authentication, authorisation and employee context | Portal Architecture |
| A-T02 | The HR system can be integrated with for read and write | HR System Owner |
| A-T03 | Payroll, ITSM/IAM and Facilities systems can receive an automated task request | Respective system owners |
| A-T04 | The portal has, or can have, an orchestration and workflow capability | Architecture |
| A-T05 | Notification infrastructure exists and can be reused | Platform team |
| A-T06 | Non-production environments exist for all integrated systems | Delivery |
| A-T07 | Reference data can be consumed rather than replicated and manually maintained | Architecture |

---

## 13. Dependencies

### 13.1 System dependencies

| Ref | Dependency | Needed for | Risk if unavailable |
|---|---|---|---|
| D-S01 | One-Point Employee Portal platform | Entire journey | Blocking |
| D-S02 | HR / Core HCM system | Employee data, eligibility inputs, organisational update (S3, S4) | Blocking |
| D-S03 | Payroll system | Pay, cost centre and allowance changes (S5) | Partial fulfilment only |
| D-S04 | ITSM / IAM tooling | Access provisioning and revocation (S5) | Employee unproductive on day one |
| D-S05 | Facilities / workplace management system | Desk, building access, equipment (S5) | Employee has no workspace |
| D-S06 | Identity and access management for the portal | Authentication, role-based visibility | Blocking |
| D-S07 | Notification service | Stakeholder and employee communications | Manual chasing returns |
| D-S08 | Organisational reference data source | Controlled lists for department, location, role | Free text fallback breaks BR-08 |

### 13.2 Organisational and process dependencies

| Ref | Dependency | Owner |
|---|---|---|
| D-O01 | Ratified internal transfer policy, including eligibility thresholds | HR Process Owner |
| D-O02 | Agreed SLAs for manager, HR, Payroll, IT and Facilities actions | Each function |
| D-O03 | Named process owner accountable for the end-to-end journey | HR |
| D-O04 | Data protection assessment and sign-off on employee data handling | DPO |
| D-O05 | Security review of access provisioning and revocation timing | Information Security |
| D-O06 | Availability of function SMEs for design workshops | All functions |
| D-O07 | Change management, training and communications for managers and HR | HR + Communications |
| D-O08 | Works council / employee representative consultation, if required | HR / Legal |
| D-O09 | Definition of exception handling for transfers that fall outside standard rules | HR Process Owner |

### 13.3 Dependency sequencing note

Requirements analysis can complete without D-O01 being fully ratified, but solution design cannot: eligibility thresholds (Q1–Q3) and lead times (Q4) are inputs to the rules the design must implement. These are the critical-path discovery closures.

---

## 14. Out of Scope

### 14.1 Explicitly out of scope for this release

| Ref | Item | Rationale |
|---|---|---|
| OS-01 | Cross-legal-entity, cross-country or cross-contract transfers | Different legal, tax and employment process |
| OS-02 | International relocation, immigration, visa and mobility management | Specialist process with separate governance |
| OS-03 | External recruitment and vacancy management | Separate talent acquisition process |
| OS-04 | Promotions, demotions and grade changes as a standalone journey | Distinct process; may run alongside a transfer |
| OS-05 | Salary review, compensation negotiation and bonus adjustment | Confidential compensation process |
| OS-06 | Secondments, temporary assignments and job rotations | Different rules and reversal expectations |
| OS-07 | Manager-initiated or HR-initiated transfers (organisational restructures) | This journey is employee-initiated |
| OS-08 | Bulk or mass transfers arising from reorganisation | Requires batch handling, not a single-request journey |
| OS-09 | Contract type changes (e.g. full-time to part-time, permanent to fixed-term) | Contractual variation process |
| OS-10 | Exit, resignation and offboarding journeys | Separate journey |
| OS-11 | Performance management and disciplinary processes | Referenced as eligibility inputs only |
| OS-12 | Learning, onboarding or role-readiness content for the new role | Existing learning journey; may be linked, not built |
| OS-13 | Replacement of the HR, Payroll, ITSM or Facilities systems | The portal orchestrates existing systems |
| OS-14 | Redesign of internal Payroll, IT or Facilities operating procedures | Only the interface into them is in scope |
| OS-15 | Analytics, dashboards and workforce mobility reporting | Candidate for a later release |
| OS-16 | Offline or paper-based fallback process | Portal is the single entry point |

### 14.2 Deferred — candidate for later releases

| Ref | Item |
|---|---|
| DF-01 | Internal opportunity marketplace linked to the transfer request |
| DF-02 | Manager-side dashboard for team mobility |
| DF-03 | Predictive eligibility check before the employee submits |
| DF-04 | Workforce mobility analytics and trend reporting |
| DF-05 | Mobile-native experience beyond responsive web |
| DF-06 | Automated onboarding pack generation for the receiving team |

---

## 15. Requirement Summary — Traceability

| Ref | Requirement (from the brief) | Journey stage | Key business rules |
|---|---|---|---|
| R-01 | Select the proposed new department / business unit | S1 | BR-07, BR-08, BR-09 |
| R-02 | Select the proposed new location | S1 | BR-07, BR-08, BR-09 |
| R-03 | Select the proposed role / job position | S1 | BR-07, BR-08, BR-09 |
| R-04 | Provide an effective date | S1 | BR-07, BR-10, BR-11 |
| R-05 | Provide an optional reason for the transfer | S1 | BR-07, BR-31 |
| R-06 | Submit the request | S1 | BR-06, BR-12 |
| R-07 | View the current status of the request | S1–S6 | BR-29, BR-30 |
| R-08 | View actions pending with other stakeholders | S2–S5 | BR-29, BR-36 |
| R-09 | Portal orchestrates downstream activities | S4–S5 | BR-22 to BR-28 |
| R-10 | Employee receives a single view of progress | S1–S6 | BR-29, BR-37 |

---

## 16. Risks Identified During Discovery

| Ref | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-01 | Downstream systems cannot return status automatically | Single view of progress is incomplete — undermines the core objective | Medium | Confirm early via Q20; define manual status update fallback |
| R-02 | Eligibility rules are not documented consistently across the organisation | Rules cannot be codified; inconsistent outcomes persist | High | Prioritise D-O01; run a rules workshop with HR |
| R-03 | Access revoked too early or provisioned too late | Employee unproductive; security exposure | Medium | Enforce BR-25 and BR-26; security review D-O05 |
| R-04 | Managers do not act, so requests stall inside the new journey | Pain point P4 reappears in digital form | High | Close Q7; implement escalation and reminders |
| R-05 | Effective date misaligned to payroll cycle | Pay errors and employee dissatisfaction | Medium | Close Q5; enforce BR-11 at capture |
| R-06 | Low adoption because managers or HR continue to work by email | Business case not realised | Medium | Change management D-O07; make the portal the only accepted route |
| R-07 | Optional reason field exposed too widely | Privacy and employee relations issue | Low | Close Q8; enforce BR-31 |
| R-08 | Scope creep into promotions, recruitment or mobility | Delivery delay | High | Hold the Section 14 boundary; formal change control |

---

## 17. Exit Criteria for Deliverable 1

This deliverable is complete and Stage 2 (Solution Design) may commence when:

1. The business objective and success measures are approved by the Portal Product Owner and HR Process Owner.
2. Journey stages and the employee-facing status model are agreed by HR, Payroll, IT and Facilities.
3. Business rules BR-01 to BR-37 are reviewed, with all TBC values resolved or formally accepted as deferred with a named owner and date.
4. Open questions Q1 to Q7 and Q19 to Q21 are closed — these are on the critical path.
5. Assumptions are validated or converted into confirmed decisions or risks.
6. Dependencies have named owners and confirmed availability.
7. The out-of-scope register is signed off and change control agreed.
8. Business decisions and technical decisions are agreed as correctly classified per Section 10.

---

## 18. Appendix A — Glossary

| Term | Definition |
|---|---|
| One-Point Employee Portal | The single employee-facing portal providing access to HR, payroll, IT, learning, facilities and other employee services |
| Internal Transfer | A move of an employee between departments, roles or locations within the same legal entity |
| Orchestration | Coordination of downstream activities across multiple systems and teams from a single controlling process |
| Effective Date | The date from which the transfer takes effect for organisational, payroll, access and facilities purposes |
| Pending Action | An outstanding step that a named stakeholder must complete before the request can progress |
| System of Record | The authoritative source for a given data domain |
| Downstream Fulfilment | The Payroll, IT and Facilities activities required to give effect to an approved transfer |
| INT SDD | The staged solution design methodology under which this deliverable is produced |

---

*End of Deliverable 1 — Requirement / Discovery Analysis.*

---
*Source note: saved verbatim from the client-provided file `BRD-Internal-Transfer-Request.md`
on 2026-08-30. This is Version 0.1 (Draft for review), superseding the earlier informal
capture at `docs/internal-transfer-request-brd.md` as the authoritative source for this
feature — see `.ai-context/brd-change-log.md` for the delta/impact analysis against the
previously baselined `.ai-context/BRD.md`.*
