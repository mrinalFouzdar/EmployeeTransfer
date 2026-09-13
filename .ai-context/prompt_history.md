# Prompt History

## 2026-08-29 — Project Setup
- Invoked `/int-project-setup` on an empty workspace at
  `d:\Office\Employee_Portal`.
- Discovery gate completed with the user:
  - Project name/type: Employee Portal, Full Stack
  - Frontend: React + Vite + Tailwind CSS
  - Backend: Node.js + Express
  - Database/ORM: PostgreSQL + Prisma
  - Auth: JWT
  - Deployment target: Unknown
  - Architecture style: Modular Monolith + Microservice Ready
- INT Control Plane copied to `.agent/`.
- `.ai-context/` knowledge base and templates created.
- Execution layer (`src/`, `tests/`, `docs/`) created for Full Stack project.
- No BRD provided at setup time.

## 2026-08-29 — BRD Ingestion: Internal Transfer Request
- User pasted a client BRD (One-Point Employee Portal — Internal Transfer
  Request) directly in chat, plus a "Developer Assignment" listing 9
  deliverables (Discovery Analysis, Spec/AC, Test Cases, Plan, Tasks, AI
  Prompts, Security Assessment, Gate 1 Review, Gate 2 Evidence).
- Saved the source document verbatim to
  `docs/internal-transfer-request-brd.md`.
- Ran `int-brd-ingestion`: populated `.ai-context/BRD.md` (BRD-001–BRD-017,
  actors, journey stages, business rules, known business vs. technical
  decisions, assumptions, dependencies, out of scope, 12 open questions).
- No Constitution section in the client document — `constitution.md` left
  unchanged.
- Proposed one candidate business module, `transfers`, in
  `.ai-context/architecture.md`, pending Gate 1 architecture approval. No
  module folders created yet (per skill rule: no module generation before
  Gate 1).
- Logged the change in `.ai-context/brd-change-log.md`.
- Remaining deliverables from the client's Developer Assignment (Spec, AC,
  Test Cases, Plan, Tasks, AI Prompts, Security Assessment, Gate 1/Gate 2)
  are deferred to the `int-sdd-lifecycle` skill once Gate 1 architecture
  review approves the `transfers` module.

## 2026-08-30 — BRD Revision: Formal Discovery Analysis Ingested
- User provided a much more detailed, formally structured client BRD
  ("BRD — Internal Transfer Request Journey", v0.1, INT SDD Deliverable 1)
  covering the same feature as the earlier informal brief, and asked to
  update the BRD.
- Saved verbatim to
  `docs/internal-transfer-request-discovery-analysis-v0.1.md`, noted as
  superseding (not conflicting with) the earlier informal source.
- Rebuilt `.ai-context/BRD.md` around the client's own reference scheme
  (R-01–R-10, BR-01–BR-37, KD-B/KD-T, Q1–Q26, A-B/A-T, D-S/D-O, OS/DF,
  Journey Stages S0–S7, status model, risks, exit criteria, glossary).
  Retired the old BRD-001–017 IDs with a full mapping table (no content
  dropped) rather than silently renumbering.
- Disambiguated an ID collision inside the client document itself (Section
  15 Requirement Traceability and Section 16 Risks both use "R-01..R-08");
  re-prefixed the risks as RISK-01–RISK-08 in BRD.md, flagged transparently
  in brd-change-log.md as a transcription-clarity fix, not a content change.
- Logged full delta/impact analysis in `.ai-context/brd-change-log.md`,
  including resolution status of each of the 12 open questions recorded on
  2026-08-29 (several now resolved by explicit business rules, e.g. BR-24
  for payroll/IT/facilities trigger conditions, BR-13/14 for
  withdraw/amend, BR-06 for one-request-at-a-time).
- Enriched (not replaced) the proposed `transfers` module in
  `architecture.md` with the new KD-T01–T07 technical decisions; still
  Proposed, still Pending Gate 1 Architecture Review.
- Updated `status.md` to flag the critical-path open questions the source
  document itself calls out (Q1–Q7, Q19–Q21) as blockers before Gate 1
  sign-off / Feature Spec drafting.

## 2026-08-30 — Critical-Path Questions Resolved, Then Feature Spec Drafted
- Walked the user through the 10 critical-path BRD open questions one at a
  time (plain language, why + what's needed for each). Resolved 9 (Q1–Q7,
  Q19, Q21); Q20 (Payroll/ITSM/Facilities integration capability) came back
  genuinely unknown — flagged for a technical discovery spike rather than
  guessed. Updated `.ai-context/BRD.md` Business Rules/Assumptions/
  Dependencies/Open Questions/Exit Criteria and logged the full resolution
  trail in `.ai-context/brd-change-log.md`.
- User then said "yes" to proceeding; invoked `int-sdd-lifecycle` and
  authored the first Feature Spec: `.ai-context/specs/internal-transfer-request.spec.md`
  (feature slug `internal-transfer-request`) — Intent, Context, API Contract
  API01–API07 (API07 deliberately designed to tolerate either outcome of the
  still-open Q20), 31 Acceptance Criteria (Given/When/Then, unique IDs)
  covering capture/validation, eligibility, manager/HR decisions,
  orchestration, withdrawal/amendment, audit/notifications, Explicitly Out
  of Scope, and Non-Functional Constraints (none invented — constitution.md
  still has no BRD-sourced values).
- Authored the spec-derived Test Cases document (39 cases) at
  `.ai-context/test_cases/internal-transfer-request.test_cases.md`, each
  mapped to an AC and a planned automated test file path under
  `tests/backend/`/`tests/frontend/`.
- Restructured `.ai-context/status.md` to the exact Status Board format the
  `int-sdd-lifecycle` skill mandates (Active Specs table + Daily Execution
  Log), registered the Spec as `Draft`, and kept the supplementary
  Open-Questions/Next-Steps context below it.
- Did NOT draft the Plan or Tasks yet — per the mandatory lifecycle, a Plan
  must be derived from an *Approved* Spec, and this Spec is still awaiting
  Gate 1 Spec Peer Review (a human reviewer, distinct from the author).

## 2026-08-30 — Spec Approved, Plan Drafted, Architecture & Plan Approved, Tasks Generated
- User approved Gate 1 Spec Peer Review ("Spec approved, now go on."). Logged
  the approval in the Spec's Gate Approvals & History table (attributed to
  supratim.jetty@intglobal.com) and advanced status Draft → Plan Drafted.
- Authored `.ai-context/plans/internal-transfer-request.plan.md`: new
  `transfers` backend/frontend module structure, a 5-table Prisma/PostgreSQL
  data model, two explicit interfaces (`EmployeeProfileProvider`,
  `FulfilmentTaskGateway`) with local/manual adapters instead of inventing
  new business modules or assuming how the still-open BRD Q20 resolves, an
  honest Constitution Check (2 gaps flagged, not papered over), Explicitly
  Deferred items, and an 11-step build sequence. Flagged that the
  `transfers` module in `architecture.md` was only ever Proposed, never
  formally Gate-1-approved — surfaced this as a blocker rather than
  quietly assuming it.
- User approved both Plan Review and Architecture Review with "approved".
  Logged both: added a Review Status table to `plan.md`, added a Gate 1
  Architecture Review table to `architecture.md` (Proposed → Approved).
- Generated the approved module directory trees (only now permitted, per
  `int-brd-ingestion`'s "no module folders before Gate 1 approval" rule):
  `src/backend/modules/transfers/{controllers,services,repositories,models,
  validators,routes}/` and `src/frontend/modules/transfers/{components,
  pages,hooks,services,utils}/`.
- Generated `.ai-context/tasks/internal-transfer-request.tasks.md` — 24
  tasks (T01–T24), each independently verifiable, each mapped to specific
  Acceptance Criteria and to the Test-First discipline. Spec status
  advanced Plan Drafted → Tasks Generated.
- Did not start implementation or write any executable test files yet —
  next step is Test-First (RED): write the test(s) for T01, confirm they
  fail, then implement.

## 2026-09-07 — T01 Implemented (Prisma Schema & Migration)
- New session; user asked "check my current state?" — surveyed the repo and
  reported: `.ai-context/` fully current through `Tasks Generated`, but zero
  backend scaffolding existed on disk (no package.json/docker-compose/prisma
  folder). A prior attempt to write `package.json` had been explicitly
  stopped by the user before landing.
- Confirmed Docker daemon wasn't reachable at the time (earlier check); user
  then confirmed Docker Desktop was running.
- Entered Plan Mode (harness-forced) for the T01 execution plan — wrote it
  to the plan file, got explicit approval, then executed:
  - Scaffolded `package.json`, `tsconfig.json`, Jest+ts-jest config,
    `docker-compose.yml`, `.env`/`.env.example`, `.gitignore` (nothing
    existed before this).
  - Wrote `prisma/schema.prisma`: `TransferRequest`, `ManagerDecision`,
    `HrDecision`, `FulfilmentTask`, `AuditEvent`, plus dev-seed reference
    tables `Department`/`Location`/`Role`, with real Prisma enums for
    status/decision/task-type fields (not free-text).
  - Wrote `src/backend/shared/database/prismaClient.ts` (singleton).
  - Wrote `tests/backend/transfers/schema.integration.test.ts` — a new
    infra-verification test (T01 has no AC of its own, so it isn't in
    `test_cases.md`'s AC-mapped list).
  - `npm install`, then confirmed **RED** (test failed — DB/migration
    didn't exist).
  - Found port 5432 already occupied by an unrelated pre-existing container
    (`energy_db`) from another project on this machine — used host port
    **5433** for this project's Postgres container instead, named
    `employee_portal_postgres`, to avoid any collision.
  - `docker compose up -d`, waited for healthy, ran
    `prisma migrate dev --name init`, confirmed **GREEN**.
  - Test's own cleanup had a bug (deleted parent rows before child
    `FulfilmentTask`/`AuditEvent` rows, hit a real FK constraint) — fixed
    the delete order in the test, manually truncated the stray leftover
    rows from the earlier failed cleanup, then confirmed GREEN twice in a
    row to prove idempotency.
  - Checked off T01 in `tasks.md`, updated `status.md` Active Specs
    (`Tasks Generated` → `Under Development`) and Daily Execution Log, and
    fixed a stale "still Pending Gate 1 Architecture Review" line in the
    Spec's Context section (architecture was actually approved on
    2026-08-30).
- Next: T02 — `EmployeeProfileProvider` interface + local/seeded adapter.

## 2026-09-08 — T02 In Progress, Blocked on Docker Desktop
- Continued T02 (`EmployeeProfileProvider`): added a dev-seed-only
  `EmployeeProfileSeed` table to `prisma/schema.prisma` (hireDate,
  probationEndDate, probationExceptionApproved, lastTransferCompletedAt —
  feeds BR-02/03/05 eligibility and BR-12 pre-population), clearly commented
  as not the employees/org business module. Wrote
  `tests/backend/transfers/employeeProfileProvider.test.ts` first and
  confirmed **RED** (module didn't exist / Prisma client had no
  `employeeProfileSeed`).
- Hit real environment trouble running the migration: the project's
  Postgres container (`employee_portal_postgres`) stopped responding —
  `docker restart`, `docker logs`, and `docker rm -f` all hung and had to be
  killed by timeout — while a separate, unrelated container from another
  project (`energy_db`) turned out to also be mapped to host port 5433,
  a genuine collision. Diagnosed this live rather than guessing, reported
  both findings to the user, and asked how to proceed rather than continuing
  to retry blindly.
- User chose to restart Docker Desktop on their end. Meanwhile, fixed the
  port collision in the repo: `docker-compose.yml`, `.env`, `.env.example`
  all moved from host port 5433 → **5434** (confirmed free). Did not
  re-attempt the migration yet — left it for after Docker Desktop restarts.

## 2026-09-13 — Recorded TypeScript-Only as the Confirmed Language
- User: "update use typescript only / update it." The codebase was already
  100% TypeScript by construction (verified: no stray `.js` files under
  `src/` or `tests/`) — this was never a code change, just closing a
  documentation gap: the original discovery gate only recorded "Node.js +
  Express" and "React + Vite + Tailwind" without a language, and TypeScript
  had been assumed implicitly since T01.
- Updated `.ai-context/project_context.md`: added a `## Language` section
  stating TypeScript-only for both frontend and backend, and annotated the
  Frontend/Backend Technology lines accordingly.
- Updated `.ai-context/architecture.md`: corrected a stale `server.js` to
  `server.ts` in the Backend Structure diagram, added explicit
  "no plain JavaScript" notes under both the Backend and Frontend Structure
  sections, and logged the change.
- Did not touch any code — T02 (Prisma migration for `EmployeeProfileSeed`,
  blocked on Docker Desktop) is still where it was left on 2026-09-08.

## 2026-09-13 — INT Control Plane Governance Upgrade (`/int-project-setup` re-run)
- User re-invoked `/int-project-setup`, but this is an existing, actively-developed project
  (T01 merged, T02 in progress) — not an empty workspace. Applied the skill's own Existing
  Project Protection rules: did not re-ask discovery questions already answered (project
  name/type, frontend/backend tech, DB/ORM, auth, deployment, architecture style), and did
  not touch any existing BRD/spec/plan/tasks/test_cases/status content.
- Diffed the local `.agent/` against the skill's source Control Plane and found it had
  drifted: `int-standards.md` was missing an entire new "§ 6 PR Gate Governance & Skill
  Resolution Hierarchy" section (Gate 0 BRD PR Review, `.ai-context/pr_reviews/` review
  records, Git-email-only reviewer matching, strict Gate 1 rejection blocking), and a new
  `workflows/pr-gate-workflow.md` file didn't exist locally at all. Synced `.agent/` by
  copying fresh from source (verbatim, not hand-retyped) and verified byte-for-byte
  equivalence with `diff -rq`.
- Added the new project-level governance/skills scaffolding this skill version requires:
  - `AGENTS.md` at repo root (INT AI-First Engineering Policy — Authority, Artifact
    Authority, Mandatory Lifecycle, Core Rules, Context Rules, Agent Behavior, plus the new
    Skill & Governance Resolution Hierarchy), copied from the same policy already governing
    this session (the user's global `CLAUDE.md`).
  - `.agents/skills/<name>/SKILL.md` for all 7 project skills, copied verbatim from
    `~/.claude/skills/<name>/SKILL.md`.
  - New `.ai-context/pr_reviews/` and `.ai-context/change_requests/` directories.
  - `.gitkeep` in all 10 mandated `.ai-context/` artifact subdirectories.
  - 3 new templates: `gate-1-review.template.md`, `gate-2-review.template.md`,
    `change-request.template.md`.
  - Extended `.gitignore` to the fuller mandated content (env variants, `*.pem`, `build/`,
    `coverage/`, OS files, `scratch/`, explicit `!.agent/ !.ai-context/ !.agents/ !AGENTS.md`
    negations) — purely additive, nothing previously excluded became un-excluded.
- Asked the user for the one genuinely new, mandatory piece of information this skill
  version requires that wasn't already known: named Gate 1 and Gate 2 reviewers. User
  confirmed supratim.jetty@intglobal.com for both. Recorded the roster in
  `.ai-context/project_context.md` (new "Gate 1/Gate 2 Reviewers" sections) and added a
  "Roles & Assignments" section (new in the updated `spec.template.md`) to the existing
  `internal-transfer-request.spec.md`, which predated that field.
- Also fixed a stale line in `project_context.md`'s Notes section that still said "No BRD
  has been provided yet" (BRD was ingested back on 2026-08-29/30).
- Logged the full governance-upgrade change in `.ai-context/architecture.md`'s Change Log,
  explicitly noting the existing Spec/BRD were approved under the *prior* process version
  (no Gate 0 BRD PR Review record exists for them) and are treated as grandfathered, not
  retroactively invalidated — new specs going forward follow the upgraded gate sequence.
- Did not touch any code, `src/`, `tests/`, `prisma/`, or the Docker/migration blocker on
  T02 — that is still exactly where it was left on 2026-09-08.

## 2026-09-13 — BRD Ingestion Governance Upgrade (`/int-brd-ingestion` re-run, Gate 0)
- User re-invoked `/int-brd-ingestion` with no new BRD document attached — the updated skill
  version introduces a mandatory **Gate 0 BRD PR Review** (BRD status must be
  Approved/Pending Review, with a standardized 22-field review record under
  `.ai-context/pr_reviews/`) and a much richer `constitution.md` template (Governance &
  Roles, Testing Discipline with coverage floors, Security Posture, Architectural
  Constraints, Non-Functional Baselines, Versioning Rules, Repository & Branching) with a
  worked example full of specific numbers (80/70/60% coverage, OTP, JWT refresh cookies,
  p95 latency targets) from what is clearly a different reference project (payments/auth
  heavy), not this one.
- Identified three genuine ambiguities rather than guessing and asked the user directly:
  1. The template's "Author ≠ Reviewer" rule can't be satisfied as-is — Developer, Gate 1
     Reviewer, and Gate 2 Reviewer are all the same person. User chose to document this as
     an accepted single-person-team exception rather than fabricate a second reviewer.
  2. Whether to populate the example's specific numbers (coverage floors, latency targets,
     security specifics) or mark them `[Open]`. User chose `[Open]` — correctly, since
     `int-brd-ingestion`'s own governance rule 9 forbids inventing constraints not supported
     by the BRD, and none of those numbers come from this project's BRD.
  3. Whether to retroactively backfill the Gate 0 BRD PR Review now, or just note it as
     grandfathered (as had been done for the analogous Gate 1 Architecture Review gap during
     the `int-project-setup` sync earlier in this session). User chose to formalize it now.
- Created `.ai-context/pr_reviews/BRD-20260913-135939.md` — a full 22-field Gate 0 review,
  Approved, explicitly labeled as a retroactive backfill (the BRD was already implicitly
  approved via the 2026-08-30 Spec/Plan/Architecture Gate 1 approvals, before Gate 0 existed
  as a formal step), with one criterion honestly marked "Needs Improvement" rather than
  "Passed" (Non-Functional Requirements — the BRD itself flags Q24 as unresolved) instead of
  papering over a real gap.
- Added a `## Status` field to `.ai-context/BRD.md` (Approved, linking the review record).
- Rewrote `.ai-context/constitution.md` in the new structure. First draft incorrectly
  inferred a full name ("Supratim Jetty") from the email address for the Governance & Roles
  table — caught and corrected before finishing, since that was never actually confirmed by
  the user; replaced with "(name not yet confirmed)" alongside the known, confirmed email.
  Populated only what's already established elsewhere in this project (JWT, PostgreSQL/
  Prisma, Modular Monolith, existing Test-First practice, branch/commit-message
  conventions); marked every other line `[Open]` with a one-line reason, rather than
  reusing the template's example values.
- Updated `.ai-context/status.md` (Active Specs notes, Pending Gate Reviews, a new
  2026-09-13 Daily Execution Log entry covering both this and the earlier `int-project-setup`
  sync from the same day).
- Did not touch any code, BRD functional content, the existing Spec/Plan/Tasks, or the
  Docker-blocked T02 — still exactly where it was left on 2026-09-08.

## 2026-09-13 — `/project-resume` and T02 Completion
- User ran `/project-resume`. Investigated read-only: found git had been initialized outside
  this session (branch `development`, remote `origin` →
  `github.com/mrinalFouzdar/EmployeeTransfer`, 2 commits, working tree clean, fully pushed).
  Read `status.md`, `tasks.md`, `.ai-context/decisions/` (empty), checked implementation
  files on disk, and checked Docker state.
- Found two things worth surfacing rather than assuming: (1) Docker Desktop had recovered
  and `employee_portal_postgres` was running again, but still bound to the *old* host port
  `5433` while `docker-compose.yml`/`.env` had been updated to `5434` during the outage —
  config and reality had drifted. (2) The previous session's plan file and
  `architecture.md` Change Log entry had claimed the `add_employee_profile_seed` migration
  was "applied" — checking `prisma/migrations/` on disk showed only `20260907130650_init`
  existed; that migration was never actually run (it failed when Docker went unresponsive).
  Presented both findings plus a 4-step remediation plan and waited for approval rather than
  proceeding unprompted.
- User said "complete it." Executed all four steps:
  1. Corrected the inaccurate "migration applied" claim in `architecture.md`'s Change Log
     with an explicit dated correction, rather than silently editing it away.
  2. `docker compose down && docker compose up -d` to recreate the container matching the
     current compose file — confirmed running on `5434` and accepting connections.
  3. `npx prisma migrate dev --name add_employee_profile_seed` — applied for real this time
     (`prisma/migrations/20260913085618_add_employee_profile_seed/`).
  4. Implemented `src/backend/modules/transfers/services/EmployeeProfileProvider.ts`
     (interface) and `LocalEmployeeProfileProvider.ts` (adapter — tenure-from-hireDate,
     probation-from-probationEndDate, cooling-off-from-lastTransferCompletedAt, all computed
     from the `EmployeeProfileSeed` seed table). Confirmed GREEN: 9/9 in the T02 test file,
     12/12 across the full suite (T01 unaffected).
- Checked off T02 in `tasks.md`; updated `status.md` (Active Specs row, a new dated log entry
  covering both the resume investigation and the T02 completion, Next Steps now pointing at
  T03).
- Noted, but did not act on: the user opened a new file,
  `docs/BRD-Internal-Transfer-Request-OPEP (1).pdf`, in the IDE — a BRD-shaped document that
  hasn't been ingested or even reviewed yet. Flagged it in `status.md` Next Steps rather than
  silently starting a BRD re-ingestion mid-task, since that's a distinct, explicitly-gated
  workflow (`int-brd-ingestion`) and multiple-BRD-documents situation the skill says not to
  resolve by assumption.
- User asked whether frontend and test cases are "ready." Checked disk directly rather than
  answering from memory: frontend is 0/24 tasks in — no React/Vite project scaffolded at all,
  `src/frontend/modules/transfers/` is still just the empty approved skeleton, `tests/frontend/`
  is empty. The spec-derived Test Cases *document* (39 cases) has been ready since
  2026-08-30; *executable* tests only exist for the 2 backend tasks done so far (T01, T02) —
  the rest get written Test-First as each remaining task is implemented, not upfront.

## 2026-09-13 — Checked `.agent/workflows/config-project-from-brd.md`, Found a Real Conflict
- User opened `.agent/workflows/config-project-from-brd.md` in the IDE and asked to "check
  and implement" it. Read it: an INT Control Plane workflow file specifying BRD Change Log
  requirements — location, a 19-field mandated entry format, a revision process, and a
  traceability chain (BRD Requirement → BRD Change → Business Domain → Module →
  Specification → Task → Test Case → Implementation).
- Found this file directly conflicts with `int-brd-ingestion`'s own directory-structure spec:
  this workflow says the log belongs at `.ai-context/decisions/brd-change-log.md`; the
  project has always kept it at `.ai-context/brd-change-log.md` (ai-context root), matching
  the skill's explicit listing. Two org-authoritative documents disagreeing — did not
  silently pick one; surfaced it to the user.
- Also found the 3 existing change-log entries don't carry the full mandated field set this
  workflow specifies (BRD Version, Affected Business Domains, API/Database/Frontend/Backend/
  Test/Existing-Implementation Impact, Approval Date, Approved By) — they're narrative-style
  with some but not all fields present.
- Asked the user both questions rather than guessing: (1) keep the current file location or
  move it — user chose to keep it, flag the conflict for whoever maintains the org
  templates. (2) retrofit past entries to the full field set, or adopt it going forward only
  — user chose going-forward-only.
- Implemented both decisions in `.ai-context/brd-change-log.md`: added a note block at the
  top documenting the location conflict and the decision to keep the current path, plus an
  "Entry Template (effective 2026-09-13)" showing the full 19-field structure every new BRD
  change-log entry will use from now on. The 3 existing entries are untouched. Did not modify
  `.agent/workflows/config-project-from-brd.md` itself (it's an authoritative Control Plane
  file — not to be hand-edited) or the `.agents/skills/int-brd-ingestion/SKILL.md` copy.
- Updated `status.md` with a matching log entry. No BRD content, Spec, Plan, Tasks, or code
  touched — this was purely a governance/format clarification.

## 2026-09-13 — Reversal: BRD Change Log Actually Moved to Follow config-project-from-brd.md
- User responded to the above with an explicit, unambiguous instruction: pasted the file
  path `.agent/workflows/config-project-from-brd.md` and said "follow this" — overriding
  the earlier "keep current location" / "adopt new format going forward only" decisions
  from the same conversation just minutes before.
- Moved the file for real this time: wrote the full retrofitted content to
  `.ai-context/decisions/brd-change-log.md`, then deleted `.ai-context/brd-change-log.md`.
  Retrofitted all 3 existing entries (not just future ones) to the full 19-field mandated
  structure (BRD Version v1/v2/v3, Affected Business Domains, API/Database/Frontend/
  Backend/Test/Existing-Implementation Impact — honestly "None — pre-implementation" for
  all three since no code existed at any of those dates, Gate 1 Status, Approval Date/By).
  Preserved every word of the original narrative under a "Detail" subsection in each entry
  rather than summarizing it away, per the "do not remove/simplify/summarize" principle
  that governs constitution/BRD content generally.
- Updated the file's own top note to describe this as a reversal of the earlier same-day
  decision, and to still flag that `int-brd-ingestion`'s SKILL.md/directory-structure
  listing disagrees with this path — that inconsistency in the org templates hasn't been
  resolved, just now decided *for this project* in favor of `config-project-from-brd.md`.
- Updated the 4 live pointer references that pointed at the old path:
  `.ai-context/BRD.md` (3 places) and `.ai-context/pr_reviews/BRD-20260913-135939.md` (1
  place, which also lacked the full path — added it while fixing). Did not rewrite the old
  path mentions inside `status.md`'s and this file's own *historical* daily-log entries,
  since those are accurate descriptions of what was true when they were written.
- Did not touch `.agent/workflows/config-project-from-brd.md` or
  `.agents/skills/int-brd-ingestion/SKILL.md` — both remain authoritative
  Control-Plane/synced-skill files, not to be hand-edited even though one of them is now
  the "losing" side of this path disagreement.

## 2026-09-13 — T03-T24: Full Backend Business Logic + Frontend Implemented
- User selected `.agent/workflows/project-from-brd.md` (note: renamed locally from the org
  source's `config-project-from-brd.md` at some point outside this session - content
  otherwise the same, not investigated further) and said "follow this work follow and create
  fe and be full buiness logic."
- Implemented the entire remaining backend (T03-T21): `TransferRepository`,
  `TransferService` (the full state machine - capture/validation, eligibility, manager
  confirm/decline/return with receiving-manager and self-approval-conflict routing,
  escalation-aware pending-action computation, HR eligibility decision, downstream
  orchestration with applicability rules and parallel task raising, completion/failure
  gating, withdraw/amend, audit logging, notification triggers), `TransfersController`,
  Express routes, and `src/backend/app/server.ts` tying it together. Also added
  `GET /api/reference-data/{departments,locations,roles}` and
  `GET /api/transfers/my-profile` - both needed for the frontend to function at all and
  documented as Spec additions rather than silently built.
- Found and fixed two real bugs while writing tests, not glossed over: (1) the
  not-applicable fulfilment-task bookkeeping path was calling the actual task-raising
  gateway, marking every task type `IN_PROGRESS` regardless of applicability - added a
  dedicated `markNotApplicable` repository method instead; (2) a probation-exception test
  was inadvertently tripping the tenure rule first because its test employee only had 2
  months' tenure - fixed the test data, not the assertion, and re-checked the sibling
  "rejects" test had the same latent flaw.
- Made one considered correction to the Spec's own text: AC4's exception table implied
  rejecting a request whose effective date precedes the next payroll cut-off, but the BRD's
  actually-resolved BR-11 text unambiguously describes *deferring* only the payroll-relevant
  change, not rejecting the whole request. Implemented the deferral (recorded as a note on
  the `PAYROLL` fulfilment task) and corrected the Spec text to match, rather than building
  something the Spec said but the business rule didn't mean.
- Implemented the frontend (T22-T24) as a separate Vite + React + TypeScript + Tailwind
  project under `src/frontend/` (own `package.json`, since the backend already owns the
  repo-root one): `RequestFormPage` (AC1-AC12), `RequestTrackerPage` (AC13-AC14),
  `ManagerDecisionPanel`/`HrDecisionPanel` (AC17/AC22), routed with `react-router-dom`, a
  placeholder `useActor` identity mechanism mirroring the backend's header-based auth
  placeholder.
- Hit and resolved several environment/tooling gaps rather than working around them
  silently: Vite blocking access to `tests/frontend/` (outside its project root) required
  both an `fs.allow` server setting and a `resolve.alias` map for packages
  (`@testing-library/react`, `@testing-library/jest-dom`, `react-router-dom`) that test
  files import directly from outside the project root; a missing transitive
  `@testing-library/dom` dependency; and - found only during a final full-suite run -
  Jest's `roots` config was scoped to all of `tests/`, so it was silently trying (and
  failing) to run a frontend `.test.ts` file too. Fixed by scoping Jest to `tests/backend`.
- Verified beyond the automated suites: compiled the backend with `tsc` and ran it as a real
  Node process, then drove a full request lifecycle (create → manager confirm → HR eligible
  → all three fulfilment tasks complete → Completed) via `curl` against that live server and
  the live Postgres database - not just in-process supertest - then cleaned up every row of
  smoke-test data and the temporary `dist/` build. Ran `vite build` to confirm the frontend
  production build is clean. Did **not** perform interactive manual browser testing - no
  browser tool is available in this environment - and said so explicitly rather than
  claiming full UI verification.
- Result: 24/24 tasks Merged, 62 backend + 19 frontend tests GREEN (81 total), idempotent
  across repeated runs. Updated `tasks.md` (all boxes checked), `status.md` (Spec status
  `Under Development` → `In QA`, a full session log entry, Next Steps now pointing at Gate 2
  and at the still-uncommitted git state), `architecture.md` (Frontend Structure corrected
  to match reality, new schema columns logged), and the Spec itself (3 API additions, the
  BR-11 correction, both documented in place rather than left as undocumented drift).
- Did not commit or push anything - left for the user to review and decide.

## 2026-09-13 — "How to run this" + a Real Browser Bug Found and Fixed
- User asked how to run the project locally. Found there was no convenient way to actually
  start the backend outside tests (no `dev`/`start` script existed) - added `tsx` and
  `dev`/`build`/`start` scripts to the root `package.json`, verified `npm run dev` boots and
  responds on `/health`. Gave full run instructions (Docker → backend → frontend) plus a
  demo-data SQL snippet for seeding a Department/Location/Role/EmployeeProfileSeed set.
- User pasted that SQL snippet back asking "how to run this" - ran it directly via
  `docker exec ... psql` rather than just re-explaining, verified it landed.
- User then opened the real app in an actual browser (localhost:5173) and it crashed on
  load: "Maximum update depth exceeded," full React error boundary trace pointing at
  `ActorSwitcher`/`useActor`. This is exactly the kind of bug automated tests + a from-memory
  "looks right" review can miss - every existing component test had mocked `useActor` away,
  so the real implementation was never actually exercised end-to-end until a real browser
  ran it.
- Diagnosed correctly from the stack trace alone (a classic `useSyncExternalStore` footgun:
  `getSnapshot` returned a freshly-`JSON.parse`d object every call instead of a
  referentially-stable one) and fixed `useActor.ts` by caching the parsed value keyed on the
  raw localStorage string. Added `tests/frontend/shared/useActor.test.tsx` - 5 tests,
  including one that asserts object-reference stability across re-renders, specifically so
  this class of bug can't silently reappear.
- User then sent a screenshot showing a different, separate issue: a raw `"NOT_FOUND"` error
  code displayed on `/new` after typing actor id `emp1` (no hyphen) instead of the seeded
  `emp-1`. Not a bug - correct behavior for a nonexistent profile - but a poor error message.
  Improved `useMyProfile.ts` to detect a 404 specifically and explain what's actually wrong
  (id doesn't match a seeded profile) instead of surfacing the bare error code.
  User's mid-turn message "what u build?" (arriving alongside the screenshot) answered
  directly in the same reply rather than only fixing the bug silently.
- Verified: `tsc -b --noEmit` clean, full frontend suite 24/24 (up from 19 - the 5 new
  useActor tests), production build clean. Logged both fixes in `status.md`'s daily log;
  this is a bug-fix continuation of the already-`In QA` Spec, not a new task, so `tasks.md`
  wasn't touched.

## 2026-09-13 — Professional UI Redesign + Demo Seed Data
- User: "this project ui look like college project make it professional , also insert data
  over the db so can check" - two explicit asks: a genuine visual redesign, and enough real
  seed data to manually verify the whole app.
- **Seed data**: wrote `prisma/seed.ts`, wired via `package.json`'s `prisma.seed` config -
  5 departments, 4 locations, 7 roles, 9 employees deliberately covering every eligibility
  scenario the Spec's business rules distinguish (`mgr-james`/`hr-priya` as manager/HR,
  `emp-alice`/`emp-ben`/`emp-clara` clean happy-path, `emp-dev-new` <12mo tenure,
  `emp-elena-probation` on probation with no exception, `emp-farid-exception` on probation
  with an HR exception, `emp-grace-cooldown` in the post-transfer cooling-off period), plus 5
  sample `TransferRequest`s spanning Submitted/Under HR Review/Approved-In-Progress/Completed/
  Rejected. The cleanup step for old ad-hoc demo data (`dept-a`/`emp-1`/etc.) failed on a real
  foreign-key error the first run - traced to a genuine leftover `TransferRequest` from the
  user's own earlier manual browser testing (the `WITHDRAWN` request visible in their earlier
  screenshot) still referencing those old ids, silently masked by a `.catch(() => undefined)`
  in the cleanup code. Fixed by deleting that request and its dependent rows explicitly and
  removing the silent catch so a real failure would surface loudly next time. Verified
  idempotent (ran twice) with the full backend suite still GREEN against the seeded data.
- **New API surface this required** - not in the original Gate-1-approved Spec. Built it
  first, then the user asked directly, "all those thing not was in side spec?" / "if not
  update" - confirmed they were not, and added a Spec section immediately rather than leaving
  it as silent drift (same pattern as the Round 1 additions from the T03-T24 session):
  `EmployeeProfileSeed.name` (nullable, display-only, threaded through
  `EmployeeProfileProvider`/`LocalEmployeeProfileProvider`/`my-profile`), and two read-only
  queue endpoints - `GET /api/transfers/queues/manager-approvals` (API11, backed by a new
  `TransferRepository.findPendingManagerDecisions`/`TransferService.listPendingManagerDecisions`
  path) and `GET /api/transfers/queues/hr-review` (API12, `requireHrRole`-gated). Added
  `tests/backend/transfers/queues.test.ts` (4 new tests) and fixed two existing tests that
  broke from the `name` field and the real seed data's plain department/location/role names
  colliding with test fixtures (`schema.integration.test.ts` fixture names suffixed
  `-T01-test`; `getRequest.test.ts`'s `my-profile` assertion updated to include `name: null`).
  Documented all three additions in `internal-transfer-request.spec.md` under a new "API
  Contract Additions, Round 2" section.
- **Frontend redesign**: built a small shared design system - `Button` (primary/secondary/
  danger/ghost), `Card`/`CardHeader`/`CardBody`, `StatusBadge` (color-coded per status), and a
  shared `QueueList` - plus a new `Layout` with a top nav bar (My Requests / New Request /
  Approvals / HR Review) and a redesigned `ActorSwitcher` (compact avatar-initial dropdown
  instead of an always-visible plain input bar). User's mid-redesign, garbled instruction
  "create tab inside tab make gurney there role" was interpreted as (a) top-level nav tabs
  reflecting the user's role/journey and (b) a nested tab level, and stated back to the user
  as an explicit interpretation rather than assumed silently: built role-relevant top nav
  tabs, and nested Active/History sub-tabs inside "My Requests." Added `ApprovalsQueuePage`
  and `HrReviewQueuePage` (consuming API11/API12 through new `transfersApi` client methods),
  and re-skinned `RequestFormPage`, `RequestTrackerPage` (now also renders the decision-history
  timeline the API already returned but the old page never displayed), `MyRequestsListPage`,
  `ManagerDecisionPanel`, and `HrDecisionPanel` with the new components. `App.tsx` now nests
  all routes under `Layout`. No business logic, validation rules, or API contracts changed;
  markup text was kept stable enough that every pre-existing component test still passes
  unmodified.
- Verified: `tsc -b --noEmit` (frontend) and `tsc --noEmit` (backend) both clean; 66/66
  backend and 24/24 frontend tests GREEN (90/90 total); `vite build` production build clean;
  confirmed against the live dev server (already running against the seeded database) that
  `mgr-james` sees `emp-alice`'s submitted request on `/api/transfers/queues/manager-approvals`.
  Updated `status.md` (Active Specs notes, a new dated log entry); did not touch `tasks.md` -
  this is UI polish/demo-data work on an already-`In QA` Spec, not a new numbered task, same
  precedent as the earlier `useActor` bug-fix session. Did not commit or push - left for the
  user to review.

## 2026-09-13 — BR-01/BR-04 Gap Found and Closed (T25)
- User sent a screenshot of the (pre-redesign-looking) tracker page and asked directly: "is
  this all thins was mentioned inisde specs and all those things under brd completed" - a
  governance completeness check, not a code request. Answered by reading the actual documents
  rather than from memory: `BRD.md`, the full Spec (including both API Contract Additions
  rounds), and `tasks.md`.
- Traceability check: confirmed every implemented task/AC and every implementation-driven API
  addition (Round 1: API08-10; Round 2: API11-12 + `name`) is documented in the Spec - nothing
  built is untracked.
- BRD completeness check: went through Business Rules BR-01-BR-37 one at a time against the
  Spec's AC1-AC31, rather than assuming coverage. Found two that were "Confirmed intent" in
  the BRD since 2026-08-30 but never became Acceptance Criteria and were never implemented:
  **BR-01** (only active employees; excludes anyone serving notice or with a pending exit) and
  **BR-04** (employees with an active disciplinary/performance-improvement process are not
  eligible without HR override). Verified this directly by reading
  `EmployeeProfileProvider.ts` and `TransferService.ts`'s eligibility block - only tenure
  (BR-02), probation (BR-03) and cooling-off (BR-05) were checked; no field or check existed
  for either BR-01 or BR-04. This predates today's redesign - a gap since the Spec's original
  Gate 1 approval, only surfaced now because the user asked for a direct cross-check.
  Everything else was either implemented, or is honestly still open per the BRD's own tracking
  (Q8/Q9/Q20/Q10-18/22-26) or deliberately out of scope (OS-01-16/DF-01-06) - not silent gaps.
- Rather than silently patching this in, asked the user how to handle it (add ACs and
  implement now / log as a formally deferred item / just document the gap) - this is new
  business behavior, not documentation of something already implied, so treated more like the
  original Spec-writing step than the Round 1/2 API-documentation pattern. User chose "Add ACs
  and implement now."
- Added `internal-transfer-request.AC32` (BR-01) and `AC33` (BR-04) to the Spec, with a Gate 1
  Re-Review row in the Gate Approvals & History table (attributed to
  supratim.jetty@intglobal.com, dated, comment reflecting the choice actually made - treated as
  sufficient sign-off for this narrow addition, consistent with the project's established
  single-person-team Gate exception and with how the original Spec's Gate 1 approval was
  logged from an approval phrase rather than a separate ceremony). Added
  `internal-transfer-request.T25` to `tasks.md` and UT21-23/TC40-42 to
  `test_cases.md` - this is new business logic, not UI polish, so unlike the redesign session
  it does get a numbered task.
- Implemented Test-First: added `isActive`, `hasActiveDisciplinaryProcess`,
  `disciplinaryOverrideApproved` to `EmployeeProfileSeed` (migration
  `add_active_and_disciplinary_flags`) and threaded them through
  `EmployeeProfileProvider`/`LocalEmployeeProfileProvider`; extended the
  `seedEstablishedEmployee` test helper; wrote 3 new tests in `createRequest.test.ts` (rejects
  when not active, rejects with an active disciplinary process and no override, accepts with
  an override) and confirmed **RED** - both reject-path tests got `201` instead of `403`
  because the checks didn't exist yet. Hit and fixed a RED-phase side effect: since the two
  reject tests weren't yet actually rejected, they created real `TransferRequest` rows
  referencing the test's shared department/location/role fixtures, which then blocked the
  suite's own `afterAll` cleanup with a foreign-key error on the next run - cleared the leaked
  rows with a one-off script (run from inside the project so `@prisma/client` would resolve,
  then deleted) rather than leaving it to surface confusingly later. Added the two checks to
  `TransferService.createRequest`'s eligibility block (grouped with the existing tenure/
  probation/cooling-off checks) and confirmed **GREEN**: 69/69 backend tests (up from 66),
  `tsc --noEmit` clean.
- Added two new seed employees so the closed gap is demoable, not just tested:
  `emp-henry-notice` (BR-01 rejection) and `emp-isla-disciplinary` (BR-04 rejection, no
  override). Re-ran `prisma db seed` clean. Had to stop the running backend dev server again
  before the migration, for the same Windows Prisma-engine file-lock reason as the earlier T02
  fix - restarted it afterward and confirmed live via `curl` that the seeded `emp-henry-notice`
  is correctly rejected with `NOT_ELIGIBLE` against the real running server and database, not
  just in the test suite.
- Updated `status.md` (Active Specs row now 25/25 tasks, 93/93 tests; a new dated log entry)
  and this file. Did not commit or push - left for the user to review.
