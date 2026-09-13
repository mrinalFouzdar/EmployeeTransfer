# Project Context: Employee Portal

## Project Name
Employee Portal

## Project Type
Full Stack

## Language
TypeScript only, across both frontend and backend. No plain JavaScript source
files (`.js`/`.jsx`) — implementation, tests, and tooling config are all
TypeScript (`.ts`/`.tsx`), enforced via `tsconfig.json` + `ts-jest` on the
backend since T01 (2026-09-07).

## Frontend Technology
React + Vite (TypeScript), styled with Tailwind CSS

## Backend Technology
Node.js + Express (TypeScript)

## Database
PostgreSQL

## ORM / Data Access Layer
Prisma

## Authentication & Security Strategy
JWT

## Deployment Target
Unknown (not yet decided)

## Architecture Style
Modular Monolith + Microservice Ready (default INT baseline)

## Gate 1 Reviewers (Spec Peer Review)
- supratim.jetty@intglobal.com

## Gate 2 Reviewers (Code Review)
- supratim.jetty@intglobal.com

Per `.agent/rules/int-standards.md` § PR Gate Governance, the authenticated Git user email
(`git config user.email`) must match this roster before that person can offer or approve a
PR review — name matching is not evaluated.

## Notes
BRD ingested 2026-08-29/30 (`.ai-context/BRD.md`, Internal Transfer Request feature). This
file records the foundational technology and architecture parameters confirmed with the
user during project setup on 2026-08-29, plus the Gate 1/Gate 2 reviewer roster confirmed on
2026-09-13 when the project was synced to the updated `int-project-setup` skill (INT Control
Plane governance upgrade — see `.ai-context/architecture.md` Change Log and
`.ai-context/prompt_history.md`). Business modules, features, and specs are established via
the `int-brd-ingestion` and `int-sdd-lifecycle` skills.
