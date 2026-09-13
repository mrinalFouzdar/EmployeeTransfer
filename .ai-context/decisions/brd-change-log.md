# BRD Change Log

> **Location (2026-09-13):** moved here from `.ai-context/brd-change-log.md` per explicit
> user instruction to follow `.agent/workflows/config-project-from-brd.md` literally, which
> specifies this log lives at `.ai-context/decisions/brd-change-log.md`. Earlier the same day
> the decision had been to keep it at the ai-context root (matching `int-brd-ingestion`'s own
> directory-structure listing, which still names `.ai-context/brd-change-log.md` — that
> skill document has not been changed and still disagrees with this path; flagged for
> whoever maintains the org templates). This move **supersedes** that earlier decision.
>
> **Entry format:** all three entries below have been retrofitted to the full field set
> `config-project-from-brd.md` mandates (BRD Version, Affected Business Domains,
> API/Database/Frontend/Backend/Test/Existing-Implementation Impact, Approval Date/By,
> etc.). No original content was removed or reworded to make room for this — the original
> narrative is preserved in full under each entry's "Detail" subsection; the mandated fields
> summarize/point into it.

## Entry Template (per `.agent/workflows/config-project-from-brd.md`)

```markdown
## <Change Date> — <Change Summary, one line>

- **BRD Version:** <e.g. v4 — sequential baseline version, incremented each logged change>
- **Change Date:** YYYY-MM-DD
- **Change Summary:** <one paragraph>
- **Added Requirements:** <list, or "None">
- **Modified Requirements:** <list, or "None">
- **Removed Requirements:** <list, or "None">
- **Unchanged Requirements:** <"All others unchanged" or explicit list>
- **Affected Business Domains:** <e.g. "Employee lifecycle / workforce movement", or "None">
- **Affected Modules:** <e.g. `transfers`, or "None yet — pre-architecture">
- **API Impact:** <e.g. specific API0n endpoints, or "None">
- **Database Impact:** <e.g. specific Prisma models/migrations, or "None">
- **Frontend Impact:** <or "None">
- **Backend Impact:** <or "None">
- **Test Impact:** <e.g. specific test files/cases to add or revise, or "None">
- **Existing Implementation Impact:** <what already-built code is affected, or "None">
- **Architecture Impact:** <or "None">
- **Gate 1 Status:** Pending | Approved | Changes Requested
- **Approval Date:** YYYY-MM-DD (once approved)
- **Approved By:** <name/email>
- **Approval Notes:** <reviewer comment>
### Detail
<full narrative — nothing summarized away>
```

---

## 2026-08-29 — Initial BRD Ingestion

- **BRD Version:** v1 (initial baseline)
- **Change Date:** 2026-08-29
- **Change Summary:** First BRD baseline for the Internal Transfer Request feature, ingested
  from a client brief pasted into chat. Established Objective, Scope, Actors, Journey Stages,
  Functional Requirements BRD-001–BRD-017, Business Rules, Known Decisions, Assumptions,
  Dependencies, Out of Scope, 12 Open Questions, and high-level Acceptance Criteria.
- **Added Requirements:** BRD-001–BRD-017 (all — initial baseline; see BRD.md "Traceability
  to Previous Baseline" for the later R-01–R-10 remapping).
- **Modified Requirements:** None (initial baseline).
- **Removed Requirements:** None.
- **Unchanged Requirements:** N/A (initial baseline).
- **Affected Business Domains:** Employee lifecycle / workforce movement.
- **Affected Modules:** `transfers` (proposed only — not yet Gate 1 architecture-approved).
- **API Impact:** None — pre-architecture, no API contract existed yet.
- **Database Impact:** None — pre-implementation.
- **Frontend Impact:** None — pre-implementation.
- **Backend Impact:** None — pre-implementation.
- **Test Impact:** None — pre-implementation.
- **Existing Implementation Impact:** None — no implementation existed yet.
- **Architecture Impact:** Proposed a single candidate business module, `transfers`, in
  `.ai-context/architecture.md`; marked "Proposed — Pending Gate 1 Architecture Review"; no
  module folders created.
- **Gate 1 Status:** Pending.
- **Approval Date:** N/A — not yet reviewed at this point.
- **Approved By:** N/A.
- **Approval Notes:** N/A.

### Detail
- **Type:** Added (initial baseline; no prior BRD existed).
- **Source:** `docs/internal-transfer-request-brd.md` (client document pasted into chat;
  no version/date supplied by client).
- **Change:** Populated `.ai-context/BRD.md` with Objective, Scope, Actors, Journey Stages,
  Functional Requirements BRD-001–BRD-017, Business Rules, Known Decisions (Business vs.
  Technical), Assumptions, Dependencies, Out of Scope, Open Questions (12 items), and
  high-level Acceptance Criteria for the Internal Transfer Request feature.
- **Constitution impact:** None — the client document contains no Constitution /
  Engineering Constitution section. `.ai-context/constitution.md` left unchanged (still
  pending BRD-provided constraints).
- **Architecture impact:** Proposed a single candidate business module, `transfers`
  (Internal Transfer Request lifecycle & orchestration), in `.ai-context/architecture.md`.
  Marked "Proposed — Pending Gate 1 Architecture Review"; no module folders created.
- **Gate 1:** Not yet reviewed. Architecture proposal and BRD baseline await Gate 1
  Spec/Architecture Peer Review before module structure or specs are generated.

---

## 2026-08-30 — BRD Revision: Formal Discovery Analysis (Deliverable 1) Ingested

- **BRD Version:** v2 (supersedes v1)
- **Change Date:** 2026-08-30
- **Change Summary:** Client provided a much more detailed, formally structured BRD
  ("BRD — Internal Transfer Request Journey", v0.1, INT SDD Deliverable 1) elaborating the
  same feature as the v1 informal brief — not a conflicting alternative. Rebuilt `BRD.md`
  around the client's own reference scheme.
- **Added Requirements:** Document Control metadata; Executive Summary; Background/
  current-state pain points (P1–P7); supporting objectives O1–O7 and success measures
  M1–M6; secondary stakeholders; journey stage model (S0–S7) with an 11-state status model;
  Business Rules BR-01–BR-37; Known Decisions KD-B01–08/KD-T01–07 plus a Business-vs-
  Technical classification table; Open Questions Q1–Q26; Assumptions A-B01–10/A-T01–07;
  Dependencies D-S01–08/D-O01–09; expanded Out-of-Scope OS-01–16 plus deferred DF-01–06;
  a Risks register; Gate-1-style Exit Criteria.
- **Modified Requirements:** Functional Requirement numbering scheme — `BRD-001`–`BRD-017`
  retired in favour of the source's own `R-01`–`R-10` traceability references (client's
  authoritative numbering, mapping each requirement to journey stage + business rules).
- **Removed Requirements:** None — all 17 prior functional requirements remain covered (see
  the "Traceability to Previous Baseline" mapping table in `BRD.md`).
- **Unchanged Requirements:** Core feature intent, actors, and 8-step current-state process
  unchanged from v1 — this is an elaboration, not a scope change.
- **Affected Business Domains:** Employee lifecycle / workforce movement (unchanged).
- **Affected Modules:** `transfers` (still Proposed — Pending Gate 1 Architecture Review;
  enriched, not restructured).
- **API Impact:** None — pre-architecture, no API contract existed yet.
- **Database Impact:** None — pre-implementation.
- **Frontend Impact:** None — pre-implementation.
- **Backend Impact:** None — pre-implementation.
- **Test Impact:** None — pre-implementation.
- **Existing Implementation Impact:** None — no implementation existed yet.
- **Architecture Impact:** Proposed `transfers` module reinforced by KD-T01–T07 (portal owns
  orchestration state; HR/Core HCM remains system of record; integration-based fulfilment;
  parallel execution; immutable audit events). No new module introduced.
- **Gate 1 Status:** Pending. Per the source's own Exit Criteria, Q1–Q7 and Q19–Q21 are
  called out as critical-path items to close before Gate 1 sign-off.
- **Approval Date:** N/A — not yet reviewed at this point.
- **Approved By:** N/A.
- **Approval Notes:** N/A.

### Detail
- **Type:** Modified (supersedes the 2026-08-29 informal baseline; same feature, no scope
  contradiction — this is an elaboration, not a conflicting alternative).
- **Source:** `docs/internal-transfer-request-discovery-analysis-v0.1.md` — client-authored
  "BRD — Internal Transfer Request Journey", Version 0.1 (Draft for review, pending business
  sign-off), formally structured per INT SDD Deliverable 1.
- **Delta — Added** (not present in the 2026-08-29 baseline): Document Control metadata;
  Executive Summary; Background/current-state pain points (P1–P7); supporting objectives
  O1–O7 and candidate success measures M1–M6; secondary stakeholders; a full journey stage
  model (S0–S7) with an 11-state employee-facing status model; Business Rules BR-01–BR-37
  (eligibility, capture, approval/routing, orchestration, visibility/data, notifications);
  Known Decisions split into Business (KD-B01–08) and Technical (KD-T01–07), plus an explicit
  Business-vs-Technical decision classification table; Open Questions Q1–Q26 (18 business +
  8 technical); Assumptions A-B01–10 / A-T01–07; Dependencies D-S01–08 / D-O01–09; an
  expanded Out-of-Scope register (OS-01–16) plus deferred items (DF-01–06); a Risks register;
  and Gate-1-style Exit Criteria for this deliverable.
- **Delta — Modified:** Functional Requirement numbering scheme. The prior baseline's
  `BRD-001`–`BRD-017` (17 granular requirements) is retired in favour of the source
  document's own `R-01`–`R-10` traceability references, which are the client's authoritative
  numbering and map each requirement to journey stage + business rules. No requirement
  substance was dropped — see the "Traceability to Previous Baseline" mapping table now in
  `.ai-context/BRD.md`. This is a transparent, logged renumbering (not silent), per the BRD
  Change Management rule against silently renumbering IDs.
- **Delta — Removed:** None. All 17 prior functional requirements remain covered (see mapping
  table in BRD.md).
- **Transcription note (ID collision):** the source document independently reuses the prefix
  `R-` for two different things — Section 15 "Requirement Summary — Traceability" (R-01–R-10)
  and Section 16 "Risks Identified During Discovery" (R-01–R-08). Reproducing both verbatim in
  one file would create ambiguous cross-references. The Risks section was transcribed into
  `BRD.md` with IDs re-prefixed `RISK-01`–`RISK-08` — wording/intent unchanged, only the ID
  prefix disambiguated. Flagged here for Gate 1 awareness; not a content decision.
- **Impact on previously-logged Open Questions** (from the 2026-08-29 entry):

  | Prior open question | Resolution |
  |---|---|
  | Payroll/IT/Facilities trigger conditions | **Resolved** — BR-24 defines applicability per function |
  | HR eligibility rules | Partially resolved — rule categories set (BR-01–BR-06); numeric thresholds still TBC (Q1–Q3) |
  | Edit/withdraw before completion | **Resolved** — BR-13, BR-14 |
  | Rejection handling | Partially resolved — reason mandatory (BR-20), self-approval conflict routed (BR-17), HR final authority (BR-19); no formal appeal path defined |
  | Approval scope (current vs. receiving manager) | Partially resolved — BR-16 requires receiving-manager confirmation when named; mandatory-in-all-cases still open (Q6) |
  | SLA/turnaround per stakeholder | Partially resolved — escalation mechanism exists (BR-18); timeframe TBC (Q7); SLAs generally TBC (D-O02) |
  | Integration method (API vs. ticketing) | Business decision resolved (KD-T03: system integration, not manual email); technical readiness still open (Q20) |
  | Notification channels | Partially resolved — trigger rules set (BR-35–37); channel/template mechanism still a technical decision, unresolved |
  | Concurrent in-flight requests | **Resolved** — BR-06 (one open request at a time) |
  | Audit/retention requirements | Partially resolved — audit event model resolved (BR-33, KD-T06); retention period TBC (Q9) |
  | Who besides the employee can view a request | Partially resolved — BR-29–BR-32 constrain employee-facing visibility; full per-stakeholder visibility matrix not yet specified |
  | Explicit NFR targets | Still open — now tracked as Q24 |
- **Constitution impact:** None — the source still contains no Constitution/Engineering
  Constitution section. `.ai-context/constitution.md` remains unchanged.
- **Architecture impact:** The proposed `transfers` module in `.ai-context/architecture.md`
  is reinforced by KD-T01–T07 (portal owns orchestration state; HR/Core HCM remains system of
  record; integration-based fulfilment; parallel execution; immutable audit events). No new
  module was introduced — the richer actor model (current manager vs. receiving manager,
  escalation) still fits within the single `transfers` bounded context. Still **Proposed —
  Pending Gate 1 Architecture Review**.
- **Gate 1:** Still not reviewed. Per the source's own Exit Criteria, Open Questions
  Q1–Q7 and Q19–Q21 are called out as critical-path items that should be closed before Gate 1
  sign-off / Stage 2 (Solution Design).

---

## 2026-08-30 — Critical-Path Open Questions Resolved

- **BRD Version:** v3 (supersedes v2)
- **Change Date:** 2026-08-30
- **Change Summary:** Resolved 9 of the 10 critical-path Open Questions the source document
  itself flags (Q1–Q7, Q19, Q21), decided by the user acting for the Portal Product
  Owner/HR Process Owner roles named in Document Control. Q20 remains explicitly open.
- **Added Requirements:** None (clarifies existing Business Rules, adds no new requirement).
- **Modified Requirements:** BR-02, BR-03, BR-05, BR-10, BR-11, BR-16, BR-18 — status changed
  from `TBC — Qn` to `Confirmed` with resolved values inlined.
- **Removed Requirements:** None.
- **Unchanged Requirements:** All requirements not listed above; Q20 and non-critical-path
  Q8–Q18/Q22–Q26 remain open, unchanged.
- **Affected Business Domains:** Employee lifecycle / workforce movement (unchanged).
- **Affected Modules:** `transfers` (still Proposed — Pending Gate 1 Architecture Review at
  this point; no module boundary change from this update).
- **API Impact:** None — pre-architecture, no API contract existed yet.
- **Database Impact:** None — pre-implementation.
- **Frontend Impact:** None — pre-implementation.
- **Backend Impact:** None — pre-implementation.
- **Test Impact:** None — pre-implementation.
- **Existing Implementation Impact:** None — no implementation existed yet.
- **Architecture Impact:** None yet — Q20's eventual resolution will affect the Technical
  Plan's integration design, not the proposed module boundary.
- **Gate 1 Status:** Pending (BRD not yet formally Gate 1/Gate 0 approved at this point in
  time — that approval came later, see the Gate 0 BRD PR Review record,
  `.ai-context/pr_reviews/BRD-20260913-135939.md`).
- **Approval Date:** N/A at the time of this entry.
- **Approved By:** User (acting for Portal Product Owner / HR Process Owner), working
  decision pending their formal sign-off per the source's own "Pending business sign-off"
  status.
- **Approval Notes:** Not yet formally ratified by the named Portal Product Owner/HR Process
  Owner individuals.

### Detail
- **Type:** Modified (Business Rules clarified; Open Questions closed/reduced).
- **Decided by:** User, acting for the Portal Product Owner / HR Process Owner roles named as
  approvers in the source Document Control. Not yet formally ratified by those named
  individuals — treat as a working decision pending their sign-off, consistent with the
  source document's own "Version 0.1, Pending business sign-off" status.
- **Resolutions:**

  | Ref | Resolution | BRD.md location updated |
  |---|---|---|
  | Q1 | Minimum tenure in current role: 12 months | BR-02 |
  | Q2 | Probation employees not eligible unless HR grants a case-by-case exception | BR-03 |
  | Q3 | Cooling-off period between transfers: 12 months | BR-05 |
  | Q4 | Minimum lead time, submission → effective date: 4 weeks | BR-10 |
  | Q5 | Effective date must fall on/after the next payroll cut-off; only the payroll-relevant change is deferred to the next period if it doesn't, org/access/facilities changes still happen on the requested date | BR-11 |
  | Q6 | Receiving-manager confirmation is mandatory in all cases where one is named | BR-16 |
  | Q7 | Escalation: 3 business days of manager inaction → escalate to HR | BR-18 |
  | Q19 | HR / Core HCM system is authoritative for department/location/role reference data | A-T02 (annotated), D-S08 |
  | Q21 | HR system supports future-dated (effective-dated) changes automatically | A-T02 (annotated) |
- **Not resolved — explicitly deferred, not dropped:**

  | Ref | Status | Next step |
  |---|---|---|
  | Q20 | Still open | User could not confirm whether Payroll/ITSM/Facilities systems can both receive a task and report status automatically. Requires a technical discovery spike with those system owners before the Technical Plan finalises the integration approach (KD-T03). Remains in `.ai-context/BRD.md` Technical Open Questions, now flagged as the single remaining critical-path blocker. |
- **BRD.md changes:** Business Rules `BR-02`, `BR-03`, `BR-05`, `BR-10`, `BR-11`, `BR-16`,
  `BR-18` status changed from `TBC — Qn` to `Confirmed` with the resolved value inlined.
  `Q1`–`Q7`, `Q19`, `Q21` removed from the Open Questions tables (resolutions are tracked
  here and inline in the affected rules/assumptions/dependencies, not duplicated). `Q20`'s
  "Impact if unresolved" reworded to reflect it is now the sole remaining critical-path gap.
  Exit Criteria status paragraph updated to "partially met."
- **Architecture impact:** None yet — Q20's resolution (once available) will materially
  affect the Technical Plan's integration design for the `transfers` module, not the proposed
  module boundary itself.
- **Gate 1:** Still not reviewed/approved. This update moves the BRD materially closer to
  Spec-ready; Q20 should be tracked as a carried-forward risk into the Plan stage rather than
  a hard blocker to starting the Feature Spec.
