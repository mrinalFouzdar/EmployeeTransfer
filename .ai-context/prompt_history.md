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
