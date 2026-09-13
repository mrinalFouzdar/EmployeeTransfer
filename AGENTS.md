# INT AI-First Engineering Policy

## Authority

Follow the INT SDD Blueprint V1.0.

The project repository is the primary source of project context.

Do not rely on chat history as the project's permanent source of truth.

---

## Artifact Authority

Use the following hierarchy:

1. constitution.md
2. BRD.md
3. Approved Spec
4. Approved Plan
5. Approved Tasks
6. Test Cases
7. Existing Implementation

Code is generated output.

Do not use implementation code to silently redefine requirements.

---

## Mandatory Lifecycle

BRD
↓
Spec
↓
Gate 1
↓
Plan
↓
Architecture Check
↓
Tasks
↓
Test-first RED
↓
Implementation GREEN
↓
Gate 2
↓
Merge
↓
Release
↓
Production Support

---

## Core Rules

- No implementation without an approved Spec.
- No direct code edits when client feedback/screenshots are provided; auto-detect affected Spec ID(s) (or generate a Multi-Spec Impact Matrix), update Specs, and wait for Gate 1 approval first.
- No implementation before tests exist and are confirmed RED.
- One task per agent execution.
- Prompt by stable artifact ID.
- Preserve existing implementation.
- Do not invent requirements.
- Do not bypass Gate 1.
- Do not bypass Gate 2.
- Keep architecture.md current.
- Keep status.md current.
- Do not expose secrets or PII in project artifacts.
- Human owns all merged code.

---

## Context Rules

Prefer repository context over chat history.

Read only the files required for the current task.

Do not scan the entire repository for localized work.

Use .agentignore aggressively.

---

## Agent Behavior

When requirements are ambiguous:

STOP.

Do not guess.

Identify the ambiguity and request clarification or update the relevant artifact.

When implementation is significantly wrong:

STOP.

Fix the Spec or Plan instead of repeatedly prompting against ambiguity.

---

## Skill & Governance Resolution Hierarchy

Whenever any skill or governance rule is executed in this workspace:

1. **Priority 1 (Local Repository First)**: Check first whether this `AGENTS.md` or a local
   project skill (`.agents/skills/<skill_name>/SKILL.md`) exists inside this repository root.
   If present, load and execute the local project skill first.
2. **Priority 2 (Global Fallback Second)**: Only if a requested skill or rule file is not
   present locally in this repository, fall back to the global skill configuration.

This keeps the project self-contained and vendor-agnostic — independent of any specific AI
tool or provider.
