# Business Requirements Document (BRD)

## Internal Transfer Request — One-Point Employee Portal

## Status
**Approved** — Gate 0 BRD PR Review, 2026-09-13 (retroactive backfill; the BRD was
implicitly approved via the downstream Spec/Plan/Architecture Gate 1 approvals of
2026-08-30, before the Gate 0 step existed as a formal skill requirement). See
`.ai-context/pr_reviews/BRD-20260913-135939.md` for the full review record.

## Source Documents
| Document | Location | Version | Status |
|---|---|---|---|
| Internal Transfer Request — Discovery Analysis (Deliverable 1) | `docs/internal-transfer-request-discovery-analysis-v0.1.md` | 0.1 (Draft for review) | **Authoritative** — supersedes the row below |
| Internal Transfer Request — informal brief | `docs/internal-transfer-request-brd.md` | n/a (chat-pasted brief) | Superseded — retained for history only |

The Discovery Analysis document is a business-analyst-authored elaboration of the same
feature described in the earlier informal brief (same 8-step current process, same
employee-facing capability list) — it is not a conflicting alternative source, it is the
formal, structured successor. It is treated as authoritative per the BRD Change Management
Process. See `.ai-context/brd-change-log.md` for the full delta/impact analysis against the
previous `.ai-context/BRD.md` baseline.

**Note on document status:** the source is marked "Version 0.1, Pending business sign-off"
with numerous fields marked TBC. This BRD.md reflects that draft state faithfully — it does
not resolve or invent TBC values. See "Open Questions" below.

---

## Document Control (from source)
| Field | Detail |
|---|---|
| Product / platform | One-Point Employee Portal |
| SDD stage | Stage 1 — Requirement / Discovery Analysis |
| Version | 0.1 (Draft for review) |
| Status | Pending business sign-off |
| Author | Solution / Business Analysis |
| Reviewers | HR Operations, Payroll, IT Service Management, Facilities, Portal Product Owner |
| Approver | Portal Product Owner + HR Process Owner |

---

## Objective

### Primary objective
Provide employees with a single, self-service, end-to-end digital journey for initiating and
tracking an internal transfer through the One-Point Employee Portal, with the portal acting
as the orchestrator of all downstream activities across HR, Payroll, IT and Facilities.

### Supporting objectives
| Ref | Objective |
|---|---|
| O1 | Establish one authoritative entry point and one authoritative record for every internal transfer request |
| O2 | Give the employee real-time visibility of request status and of the stakeholder holding the pending action |
| O3 | Reduce end-to-end transfer cycle time by removing manual hand-offs and enabling parallel fulfilment |
| O4 | Reduce status-chase contact volume into HR, IT and Facilities service desks |
| O5 | Enforce eligibility and approval rules consistently rather than by local interpretation |
| O6 | Produce a complete, auditable trail of who requested, approved, validated and fulfilled each transfer |
| O7 | Ensure downstream systems (HR record, Payroll, Access, Facilities) reflect the transfer accurately by the effective date |

### Candidate success measures (targets TBC by the business at sign-off)
| Ref | Measure | Baseline | Target |
|---|---|---|---|
| M1 | Average end-to-end cycle time, submission to confirmation | TBC | TBC |
| M2 | % of transfer requests initiated through the portal | ~0% | TBC |
| M3 | Status-related contacts per transfer request | TBC | TBC |
| M4 | % of transfers with all downstream tasks complete on/before effective date | TBC | TBC |
| M5 | Employee satisfaction with the transfer journey | N/A | TBC |
| M6 | % of requests rejected after approval due to eligibility failure | TBC | TBC (reduction) |

---

## Background & Current State (context for Objective/Scope — not a requirement itself)

### Current (as-is) process
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

### Pain points driving this BRD
| Ref | Pain point | Business impact |
|---|---|---|
| P1 | No single entry point for the request | Inconsistent initiation; requests raised informally and lost |
| P2 | No visibility of status | High volume of chase enquiries to HR, IT and Facilities |
| P3 | Sequential, manual hand-offs | Extended cycle time |
| P4 | No visibility of who owes the next action | Requests stall silently with no accountable owner |
| P5 | Data re-keyed across systems | Inconsistent records between HR, Payroll and IT |
| P6 | No auditable record of decisions | Difficulty evidencing approval and eligibility checks |
| P7 | Downstream teams engaged late or inconsistently | Employee arrives without access, desk or correct pay treatment |

---

## Scope

### In scope
- Employee-initiated internal transfer request capture on the One-Point Employee Portal.
- Manager confirmation / approval action (current manager, and receiving manager where named).
- HR eligibility validation and decision.
- Orchestration of downstream fulfilment tasks to HR Operations, Payroll, IT and Facilities.
- Consolidated status and pending-action view for the employee.
- Notifications to the employee and to each stakeholder at their point of action.
- Audit record of the request lifecycle.

### Out of scope
See "Out of Scope" section below for the full register (OS-01–OS-16, deferred DF-01–DF-06).

---

## Actors

### Primary users — transact in the journey
| Actor | Role in the journey | Key needs |
|---|---|---|
| Employee (Requester) | Initiates the request, provides transfer details, tracks progress | Simple form, clear status, knowing who to chase and when |
| Current Line Manager | Confirms or declines release of the employee | Clear request context, low-friction decision |
| Receiving Manager (proposed new manager) | Confirms acceptance into the receiving team/role | Confirmation that the role and headcount exist and are funded |
| HR / HR Operations | Validates eligibility; updates organisational record; issues confirmation | Eligibility data in one place, exception handling, audit trail |
| Payroll | Assesses/applies pay, cost-centre, allowance or location-driven changes | Advance notice, accurate effective date |
| IT | Provisions new access; removes access no longer required | Accurate role/department data, lead time before effective date |
| Facilities | Arranges desk, workspace, building access at the new location | Location, effective date, accessibility/equipment needs |

### Secondary stakeholders — interest, no transactional step
| Stakeholder | Interest |
|---|---|
| Portal Product Owner | Journey design, adoption, roadmap |
| HR Process Owner | Policy compliance, eligibility rules |
| Information Security / IAM | Least-privilege access, timely revocation, segregation of duties |
| Data Protection / Privacy Office | Lawful handling of employee data, visibility restrictions |
| Works Council / Employee Representation (if applicable) | Consultation on process change affecting employees |
| Internal Audit | Evidence of approvals and controls |
| Finance / Cost Centre Owners | Cost centre movement and headcount budget impact |

---

## Journey Stages

| Stage | Name | Trigger | Primary actor | Exit condition |
|---|---|---|---|---|
| S0 | Explore / Pre-request | Employee considers a transfer | Employee | Employee opens the transfer request form |
| S1 | Initiate & Capture | Employee opens the request form | Employee | Valid request submitted |
| S2 | Managerial Confirmation | Request submitted | Current Manager (and Receiving Manager) | Confirmed or declined |
| S3 | HR Eligibility Validation | Managerial confirmation received | HR | Eligible / Not eligible / Conditionally eligible |
| S4 | Organisational Record Update | HR validation passed | HR Operations | Org data updated with effective date |
| S5 | Downstream Fulfilment (parallel) | Organisational update confirmed | Payroll, IT, Facilities | All applicable fulfilment tasks closed |
| S6 | Confirmation & Closure | All fulfilment tasks complete | Portal / HR | Employee receives confirmation; request closed |
| S7 | Post-transfer (optional) | Effective date reached | Employee / Receiving Manager | Feedback captured; record archived |

**S0** — Employee reviews internal opportunities, eligibility guidance and transfer policy on
the portal. No record created; informational, reduces ineligible submissions.

**S1** — Employee completes the request: proposed department/business unit, location, and
role/job position (each selected from a controlled list — BR-08), an effective date, and an
optional free-text reason. Current department/role/location/manager/employee ID are
pre-populated by the portal, not re-entered. On submission the employee receives a request
reference and the request appears in their tracking view.

**S2** — Routed to the current line manager for confirmation; also routed to the receiving
manager where one is named. Manager may confirm, decline (with reason), or return to the
employee for amendment.

**S3** — HR validates against transfer policy: tenure in current role, performance/
disciplinary standing, notice/probation status, role/grade suitability, headcount/budget
availability in the receiving unit, location-specific conditions (e.g. right to work).
Outcome: Eligible / Not Eligible / Eligible with conditions.

**S4** — HR Operations records the transfer against the employee's organisational
information with the agreed effective date — the authoritative trigger for downstream
fulfilment.

**S5** — Portal raises fulfilment tasks in parallel, only where applicable: Payroll (cost
centre reassignment, location-driven allowances, grade/pay changes, tax/jurisdiction),
IT (provision new access, revoke no-longer-required access, asset changes if location
changes), Facilities (desk/workspace, building access, equipment, parking, locker). Each
task reports its own status back to the portal; the employee sees which tasks are
outstanding and with whom, without internal task detail not relevant to them.

**S6** — Once all applicable fulfilment tasks are complete, the employee receives a
consolidated confirmation (new department, role, location, manager, effective date). Request
moves to Completed.

**S7** (optional) — Post-effective-date check-in/feedback capture, feeding measure M5.

### Status model presented to the employee
| Status | Meaning |
|---|---|
| Draft | Started, not yet submitted |
| Submitted | Awaiting managerial confirmation |
| Manager Confirmed | Awaiting HR eligibility validation |
| Returned for Amendment | Action required by the employee |
| Under HR Review | HR validating eligibility |
| Approved — In Progress | Downstream fulfilment underway |
| Pending Action — [Stakeholder] | A specific stakeholder holds the next action |
| On Hold | Progress paused, reason shown |
| Completed | Transfer confirmed and effective |
| Rejected | Declined, with reason |
| Withdrawn | Cancelled by the employee |

---

## Functional Requirements

Requirement IDs below are the client's own traceability references (R-01–R-10). A mapping
to the requirement IDs from the previous, superseded BRD.md baseline is kept in
"Traceability to Previous Baseline" at the end of this document — old IDs are not reused or
silently redefined.

| ID | Requirement | Journey stage | Key business rules |
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

## Non-Functional Requirements

Not quantified by the source document. Explicitly flagged there as open (Q24: "What are the
availability and performance expectations for the journey?"). Related but unresolved NFR
inputs: data retention period (Q9), accessibility/language standards (Q17), end-to-end
testability across downstream systems (Q26). Do not invent NFR values — track via Open
Questions until the business/architecture set them.

---

## Business Rules

### Eligibility
| Ref | Rule | Status |
|---|---|---|
| BR-01 | Only active employees may raise a request; employees serving notice or with a pending exit are excluded. | Confirmed intent |
| BR-02 | Minimum tenure in current role required before requesting a transfer: **12 months**. | Confirmed |
| BR-03 | Employees on probation are not eligible unless an exception is approved by the HR Process Owner (case-by-case). | Confirmed |
| BR-04 | Employees with an active disciplinary/performance-improvement process are not eligible without HR override. | Confirmed intent |
| BR-05 | A cooling-off period of **12 months** applies between a completed transfer and a new request. | Confirmed |
| BR-06 | An employee may have only one open transfer request at a time. | Confirmed intent |

### Request capture
| Ref | Rule |
|---|---|
| BR-07 | Department/business unit, location, role and effective date are mandatory. Reason is optional. |
| BR-08 | Department, location and role must be selected from controlled organisational lists — no free text. |
| BR-09 | Proposed values must differ from current values in at least one of department, role or location. |
| BR-10 | Effective date must be future-dated and respect a minimum lead time of **4 weeks** between submission and the effective date. |
| BR-11 | Effective date should fall on a valid working day and must fall on/after the next payroll cut-off; if the requested date falls before the next cut-off, only the payroll-relevant change is deferred to the following payroll period — the organisational/access/facilities changes still happen on the requested date. |
| BR-12 | Current department, role, location, grade and manager are system-populated, not employee-editable. |
| BR-13 | Employee may withdraw the request any time before the organisational record is updated (end of S4); after that, withdrawal requires HR intervention. |
| BR-14 | Employee may amend a request only while it is Draft or Returned for Amendment. |

### Approval and routing
| Ref | Rule |
|---|---|
| BR-15 | Current line manager confirmation is mandatory before HR validation. |
| BR-16 | Receiving manager confirmation is **mandatory in all cases** where the receiving role has a named receiving manager. |
| BR-17 | A manager cannot approve their own transfer request; such requests route to the next level of management. |
| BR-18 | If the current manager does not act within **3 business days**, the request escalates to **HR**. |
| BR-19 | HR holds the final eligibility decision; managerial confirmation alone does not approve a transfer. |
| BR-20 | A rejection at any stage must carry a reason, shown to the employee. |
| BR-21 | Transfers crossing legal entity, country or employment contract boundaries follow a different, out-of-scope process and must be redirected at capture. |

### Orchestration
| Ref | Rule |
|---|---|
| BR-22 | Downstream fulfilment tasks are only raised after HR eligibility validation passes and the organisational record is updated. |
| BR-23 | Payroll, IT and Facilities tasks run in parallel, not sequentially. |
| BR-24 | A downstream task is raised only where applicable: Payroll (cost centre/grade/allowance/pay-affecting location change), IT (role/department change affecting access), Facilities (physical location change). |
| BR-25 | Access revocation must not occur before the effective date. |
| BR-26 | New access should be available on or before the effective date. |
| BR-27 | The request cannot reach Completed while any applicable downstream task is outstanding. |
| BR-28 | If a downstream task fails or is rejected, the request moves to On Hold and HR is notified — it must not silently complete. |

### Visibility and data
| Ref | Rule |
|---|---|
| BR-29 | Employee sees status, the stakeholder holding the pending action, and the date it became pending. |
| BR-30 | Employee does not see internal commentary between HR, managers or downstream teams. |
| BR-31 | Optional reason is visible to manager and HR; visibility to downstream teams restricted. Confirmation TBC — Q8. |
| BR-32 | Salary/remuneration detail is not exposed in the employee-facing journey. |
| BR-33 | All state changes are recorded with actor, timestamp, decision and reason for audit. |
| BR-34 | Retention follows the organisation's HR record retention policy. Period TBC — Q9. |

### Notifications
| Ref | Rule |
|---|---|
| BR-35 | Employee notified on submission, on each decision, on return for amendment, and on completion. |
| BR-36 | Each stakeholder notified when an action becomes pending with them, and reminded if outstanding. |
| BR-37 | Routine downstream progress notifications should not overwhelm the employee; the tracking view is the primary channel for granular progress. |

---

## Known Decisions

### Business decisions (settled)
| Ref | Decision | Rationale |
|---|---|---|
| KD-B01 | The Portal is the single entry point for internal transfer requests | Removes fragmented initiation |
| KD-B02 | The portal orchestrates downstream activity, not just a form that hands off to email | Core business requirement |
| KD-B03 | Employee is given a single consolidated view of progress and pending actions | Directly stated requirement |
| KD-B04 | Manager confirmation precedes HR eligibility validation | Reflects agreed process order |
| KD-B05 | HR retains authority over eligibility; the portal does not auto-approve | Policy and control requirement |
| KD-B06 | Department, location and role are controlled-list selections, not free text | Data quality, downstream automation |
| KD-B07 | Reason for transfer is optional | Avoids discouraging legitimate requests |
| KD-B08 | Payroll, IT and Facilities involvement is conditional, not automatic | Not every transfer affects every function |

### Technical decisions (settled — engineering may design against these; do not treat as open)
| Ref | Decision | Rationale |
|---|---|---|
| KD-T01 | The portal holds orchestration state and master status of the request | Required for a single consolidated view |
| KD-T02 | HR/Core HCM remains system of record for organisational data; portal does not duplicate it | Avoids a competing source of truth |
| KD-T03 | Downstream fulfilment triggered via integration to Payroll/ITSM/IAM/Facilities, not manual email | Enables status tracking |
| KD-T04 | Downstream fulfilment tasks execute in parallel | Cycle time objective O3 |
| KD-T05 | Employee/department/location/role/manager reference data is consumed, not duplicated in the portal | Data consistency |
| KD-T06 | Every state transition is an immutable audit event | Objective O6, BR-33 |
| KD-T07 | Auth reuses the portal's existing enterprise identity model | No bespoke access model |

### Business vs Technical decision — classification key
A **business decision** determines *what* the organisation wants and under what conditions —
policy, eligibility, authority, sequencing of accountability, what the employee sees. Owned
by HR/process/product owner; changing it changes the process.
A **technical decision** determines *how* the outcome is delivered — system of record,
integration pattern, orchestration mechanism, data flow, error handling. Owned by
architecture/engineering; changing it does not change what the business agreed.

| Topic | Business decision | Technical decision |
|---|---|---|
| Eligibility criteria | Which employees may transfer, and thresholds | How rules are evaluated/configured |
| Approval chain | Who must approve, in what order | How approval tasks are routed, escalated, timed out |
| Effective date | Lead time and payroll-cut-off policy | Date validation, scheduling of effective-dated changes |
| Downstream involvement | Which functions engaged, under what conditions | Integration method to Payroll/IT/Facilities |
| Parallel fulfilment | Employee should not wait for sequential hand-offs | Orchestration pattern for concurrency/reconciliation |
| Status visibility | Which statuses/pending-action detail the employee sees | Status aggregation model, refresh mechanism |
| Access timing | Access not revoked before effective date | Scheduling/triggering of provisioning/de-provisioning |
| Reason for transfer | Optional, and who may read it | Field storage, masking, access control |
| Audit | Decisions must be auditable, evidence retained | Event model, storage, retention implementation |
| Reference data | Controlled lists are used | Which source system supplies each list, sync method |
| Notifications | Stakeholders told when they hold an action | Channel, template, delivery mechanism |
| Downstream task failure | Request must not silently complete | Retry, compensation, exception-handling design |

---

## Assumptions

### Business
| Ref | Assumption | Validate with |
|---|---|---|
| A-B01 | An internal transfer policy already exists and is documented | HR Process Owner |
| A-B02 | The eight-step current process described in the brief is accurate and complete | HR Operations |
| A-B03 | Scope is transfers within the same legal entity and country | HR Process Owner |
| A-B04 | Every employee has an identifiable line manager in the HR system | HR System Owner |
| A-B05 | Department, location and role structures are maintained and current | HR Operations |
| A-B06 | Employees have portal access and can authenticate | Portal Product Owner |
| A-B07 | Managers, HR, Payroll, IT, Facilities users can act within the portal or a connected system | All function owners |
| A-B08 | A transfer does not automatically imply a promotion/grade change; where it does, the promotion process applies alongside | HR Process Owner |
| A-B09 | Facilities involvement is only required where the physical location changes | Facilities |
| A-B10 | Payroll involvement is only required where pay/cost centre/allowances are affected | Payroll |

### Technical
| Ref | Assumption | Validate with |
|---|---|---|
| A-T01 | The portal already provides authentication, authorisation and employee context | Portal Architecture |
| A-T02 | The HR system can be integrated with for read and write, **and confirmed to support future-dated (effective-dated) changes automatically** (resolves Q21 — no portal-side scheduler needed for the org-record update itself) | HR System Owner |
| A-T03 | Payroll, ITSM/IAM and Facilities systems can receive an automated task request | Respective system owners |
| A-T04 | The portal has, or can have, an orchestration/workflow capability | Architecture |
| A-T05 | Notification infrastructure exists and can be reused | Platform team |
| A-T06 | Non-production environments exist for all integrated systems | Delivery |
| A-T07 | Reference data can be consumed rather than replicated/manually maintained | Architecture |

---

## Dependencies

### System
| Ref | Dependency | Needed for | Risk if unavailable |
|---|---|---|---|
| D-S01 | One-Point Employee Portal platform | Entire journey | Blocking |
| D-S02 | HR / Core HCM system | Employee data, eligibility inputs, org update (S3, S4) | Blocking |
| D-S03 | Payroll system | Pay/cost centre/allowance changes (S5) | Partial fulfilment only |
| D-S04 | ITSM / IAM tooling | Access provisioning/revocation (S5) | Employee unproductive day one |
| D-S05 | Facilities / workplace management system | Desk, building access, equipment (S5) | Employee has no workspace |
| D-S06 | Identity and access management for the portal | Authentication, role-based visibility | Blocking |
| D-S07 | Notification service | Stakeholder/employee communications | Manual chasing returns |
| D-S08 | Organisational reference data source — **confirmed as the HR / Core HCM system** (resolves Q19) | Controlled lists for department/location/role | Free-text fallback breaks BR-08 |

### Organisational / process
| Ref | Dependency | Owner |
|---|---|---|
| D-O01 | Ratified internal transfer policy, including eligibility thresholds | HR Process Owner |
| D-O02 | Agreed SLAs for manager/HR/Payroll/IT/Facilities actions | Each function |
| D-O03 | Named process owner accountable for the end-to-end journey | HR |
| D-O04 | Data protection assessment and sign-off on employee data handling | DPO |
| D-O05 | Security review of access provisioning/revocation timing | Information Security |
| D-O06 | Availability of function SMEs for design workshops | All functions |
| D-O07 | Change management, training and communications for managers/HR | HR + Communications |
| D-O08 | Works council / employee representative consultation, if required | HR / Legal |
| D-O09 | Definition of exception handling for transfers outside standard rules | HR Process Owner |

**Sequencing note:** requirements analysis can complete without D-O01 fully ratified, but
solution design cannot — eligibility thresholds (Q1–Q3) and lead times (Q4) are inputs the
design must implement. These are the critical-path discovery closures.

---

## Out of Scope

### Explicit
| Ref | Item | Rationale |
|---|---|---|
| OS-01 | Cross-legal-entity, cross-country or cross-contract transfers | Different legal/tax/employment process |
| OS-02 | International relocation, immigration, visa and mobility management | Specialist process, separate governance |
| OS-03 | External recruitment and vacancy management | Separate talent acquisition process |
| OS-04 | Promotions, demotions and grade changes as a standalone journey | Distinct process; may run alongside a transfer |
| OS-05 | Salary review, compensation negotiation and bonus adjustment | Confidential compensation process |
| OS-06 | Secondments, temporary assignments and job rotations | Different rules and reversal expectations |
| OS-07 | Manager-initiated or HR-initiated transfers (org restructures) | This journey is employee-initiated |
| OS-08 | Bulk or mass transfers arising from reorganisation | Requires batch handling |
| OS-09 | Contract type changes (e.g. FT↔PT, permanent↔fixed-term) | Contractual variation process |
| OS-10 | Exit, resignation and offboarding journeys | Separate journey |
| OS-11 | Performance management and disciplinary processes | Referenced as eligibility inputs only |
| OS-12 | Learning/onboarding/role-readiness content for the new role | Existing learning journey; may be linked, not built |
| OS-13 | Replacement of HR, Payroll, ITSM or Facilities systems | The portal orchestrates existing systems |
| OS-14 | Redesign of internal Payroll/IT/Facilities operating procedures | Only the interface into them is in scope |
| OS-15 | Analytics, dashboards and workforce mobility reporting | Candidate for a later release |
| OS-16 | Offline or paper-based fallback process | Portal is the single entry point |

### Deferred — candidate for later releases
| Ref | Item |
|---|---|
| DF-01 | Internal opportunity marketplace linked to the transfer request |
| DF-02 | Manager-side dashboard for team mobility |
| DF-03 | Predictive eligibility check before the employee submits |
| DF-04 | Workforce mobility analytics and trend reporting |
| DF-05 | Mobile-native experience beyond responsive web |
| DF-06 | Automated onboarding pack generation for the receiving team |

---

## Open Questions

To be closed before Solution Design (Spec/Plan). Each carries a proposed owner.

**Resolved 2026-08-30:** `Q1`–`Q7` and `Q19`, `Q21` (all previously flagged critical-path)
have been resolved with the user acting for the Portal Product Owner / HR Process Owner —
see the resolved Business Rules above and `.ai-context/brd-change-log.md` for the decision
log. They are removed from the tables below (not duplicated) to keep this file the single
source of truth.

### Business
| Ref | Question | Impact if unresolved | Owner |
|---|---|---|---|
| Q8 | Who may read the optional reason for transfer (BR-31)? | Privacy risk | Data Protection Office |
| Q9 | Retention period for transfer request records (BR-34)? | Compliance gap | Data Protection Office |
| Q10 | Can employee choose from open vacancies only, or propose any role? | Materially changes capture experience | HR + Talent Acquisition |
| Q11 | Does an internal transfer require competitive selection, or is it a direct move? | Determines if recruitment is in scope | HR + Talent Acquisition |
| Q12 | How are headcount/budget availability in the receiving unit confirmed, by whom? | Approved transfers may be unfundable | Finance + HR |
| Q13 | Is the transfer reversible after approval but before effective date, by whom? | Undefined cancellation path | HR Process Owner |
| Q14 | Do location changes trigger relocation/mobility/right-to-work considerations? | Compliance exposure | HR Mobility |
| Q15 | Is works council / employee representative consultation required? | Deployment risk | HR / Legal |
| Q16 | Are contractors, temporary staff or part-time employees in or out of scope? | Population undefined | HR Process Owner |
| Q17 | What languages/accessibility standards must the journey support? | Rework late in delivery | Portal Product Owner |
| Q18 | Target values for measures M1–M6? | Success cannot be evidenced | Portal Product Owner |

### Technical
| Ref | Question | Impact if unresolved | Owner |
|---|---|---|---|
| Q20 | Do Payroll, ITSM and Facilities systems expose integration interfaces for both receiving a task and returning status? **Now the single remaining critical-path open question** — user could not confirm; requires a technical discovery spike with the Payroll, IT and Facilities system owners before the Technical Plan finalises the integration approach (KD-T03). Do not assume either way. | May force manual status updates, undermining O2; blocks the Plan's integration design until spiked | Architecture + system owners |
| Q22 | How is a partial failure handled (e.g. HR updated but IT provisioning failed)? | Inconsistent state across systems | Architecture |
| Q23 | Is a shared correlation identifier available across HR/Payroll/IT/Facilities records? | Status cannot be reliably aggregated | Architecture |
| Q24 | Availability and performance expectations for the journey? | NFRs undefined | Architecture + Product Owner |
| Q25 | Can manager and HR actions be completed within the portal, or must they switch systems? | Directly affects the single-journey objective | Architecture |
| Q26 | How will the journey be tested end to end given the number of downstream systems? | Late defect discovery | Delivery / QA |

---

## Risks Identified During Discovery

*(Renumbered `RISK-01`–`RISK-08` in this baseline; the source document reused prefix "R-" for
both these risks and the Functional Requirements in its own Section 15, which would collide
inside this file. No content, wording or intent has been changed — only the ID prefix, for
unambiguous cross-referencing. Flagged for Gate 1 awareness.)*

| Ref | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-01 | Downstream systems cannot return status automatically | Single view of progress incomplete — undermines core objective | Medium | Confirm early via Q20; define manual status update fallback |
| RISK-02 | Eligibility rules not documented consistently across the organisation | Rules cannot be codified; inconsistent outcomes | High | Prioritise D-O01; rules workshop with HR |
| RISK-03 | Access revoked too early or provisioned too late | Employee unproductive; security exposure | Medium | Enforce BR-25/BR-26; security review D-O05 |
| RISK-04 | Managers do not act, requests stall inside the new journey | P4 reappears in digital form | High | Close Q7; escalation and reminders |
| RISK-05 | Effective date misaligned to payroll cycle | Pay errors, dissatisfaction | Medium | Close Q5; enforce BR-11 at capture |
| RISK-06 | Low adoption — managers/HR continue by email | Business case not realised | Medium | Change management D-O07; portal as only accepted route |
| RISK-07 | Optional reason field exposed too widely | Privacy/employee relations issue | Low | Close Q8; enforce BR-31 |
| RISK-08 | Scope creep into promotions, recruitment or mobility | Delivery delay | High | Hold Out-of-Scope boundary; formal change control |

---

## Exit Criteria (Gate 1 readiness checklist, per source Discovery Analysis)

1. Business objective and success measures approved by Portal Product Owner and HR Process Owner.
2. Journey stages and employee-facing status model agreed by HR, Payroll, IT and Facilities.
3. Business rules BR-01–BR-37 reviewed, all TBC values resolved or formally accepted as deferred with a named owner and date.
4. Open Questions Q1–Q7 and Q19–Q21 closed — critical path.
5. Assumptions validated or converted into confirmed decisions or risks.
6. Dependencies have named owners and confirmed availability.
7. Out-of-scope register signed off, change control agreed.
8. Business and technical decisions agreed as correctly classified (see Known Decisions).

**Current status: partially met (updated 2026-08-30).** Of the ten critical-path items
(`Q1`–`Q7`, `Q19`–`Q21`), nine are now resolved (see Business Rules `BR-02`, `BR-03`, `BR-05`,
`BR-10`, `BR-11`, `BR-16`, `BR-18`, and Assumptions `A-T02`/Dependencies `D-S08`). Only `Q20`
remains open — whether Payroll/ITSM/Facilities can both receive tasks and report status
automatically — and requires a technical discovery spike before the Technical Plan finalises
the integration approach. Non-critical-path questions `Q8`–`Q18`, `Q22`–`Q26` remain open but
do not block Spec drafting. Gate 1 (Architecture Review) for the proposed `transfers` module
in `.ai-context/architecture.md` should account for the remaining `Q20` gap — see `status.md`
for tracking.

---

## Acceptance Criteria (BRD-level; spec-level individually-identifiable AC is Deliverable 2)

At BRD level, the feature is accepted when Functional Requirements R-01–R-10 are satisfied
against their mapped Business Rules (see "Functional Requirements" table above) and the
journey reaches the status model's Completed / Rejected / Withdrawn end-states correctly.
Individually identifiable, testable acceptance criteria (Given/When/Then, with stable AC IDs)
are produced in the Feature Spec (`int-sdd-lifecycle`, Deliverable 2), not duplicated here.

---

## Glossary
| Term | Definition |
|---|---|
| One-Point Employee Portal | The single employee-facing portal providing access to HR, payroll, IT, learning, facilities and other employee services |
| Internal Transfer | A move of an employee between departments, roles or locations within the same legal entity |
| Orchestration | Coordination of downstream activities across multiple systems and teams from a single controlling process |
| Effective Date | The date from which the transfer takes effect for organisational, payroll, access and facilities purposes |
| Pending Action | An outstanding step a named stakeholder must complete before the request can progress |
| System of Record | The authoritative source for a given data domain |
| Downstream Fulfilment | The Payroll, IT and Facilities activities required to give effect to an approved transfer |
| INT SDD | The staged solution design methodology under which this deliverable is produced |

---

## Traceability to Previous Baseline

The BRD.md baseline in place before 2026-08-30 used informal IDs `BRD-001`–`BRD-017`. Those
IDs are retired (not reused) in favour of the source document's own `R-01`–`R-10` /
`BR-01`–`BR-37` scheme, which is more precise and is the client's authoritative numbering.
No requirement content was dropped — see mapping below and the full delta in
`.ai-context/brd-change-log.md`.

| Old ID | Old requirement (summary) | Now covered by |
|---|---|---|
| BRD-001 | Employee can initiate a request | R-06, KD-B01 |
| BRD-002 | Select new department/business unit | R-01 |
| BRD-003 | Select new location | R-02 |
| BRD-004 | Select new role/job position | R-03 |
| BRD-005 | Provide effective date | R-04 |
| BRD-006 | Optional reason | R-05 |
| BRD-007 | Submit the request | R-06 |
| BRD-008 | View current status | R-07 |
| BRD-009 | View pending actions/stakeholder | R-08 |
| BRD-010 | Portal orchestrates downstream activities | R-09, BR-22–BR-28 |
| BRD-011 | Manager can confirm | S2, BR-15–BR-18 |
| BRD-012 | HR validates eligibility | S3, BR-01–BR-06, BR-19 |
| BRD-013 | Org info updated | S4 |
| BRD-014 | Payroll updated when required | S5, BR-24 |
| BRD-015 | IT provisions/removes access when required | S5, BR-24–BR-26 |
| BRD-016 | Facilities arranges new location when required | S5, BR-24 |
| BRD-017 | Employee receives confirmation | S6, R-10 |
