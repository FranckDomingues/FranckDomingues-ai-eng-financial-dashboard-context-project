# 4Geeks Financial Dashboard Context Project — Assignment Specification

## Assignment purpose

This repository is a 4Geeks Academy learning project for using an AI coding agent to understand an inherited codebase and build project context. The assignment is **repository discovery and context documentation**, not a request to add dashboard features or redesign the application.

The repository README recommends forking the project, opening it in Codespaces or locally, using an AI agent to inspect both frontend and backend, documenting proposed agent rules and a memory bank, then refining and validating that context against the actual workflow. Source: [`README.md`](README.md) (“Recommended steps”); the Spanish counterpart is [`README.es.md`](README.es.md) (“Pasos recomendados”).

## Scope of the inherited application

The current application is a financial metrics dashboard with a React + TypeScript frontend and FastAPI backend, as described in both README files and implemented in the repository. The backend generates seeded mock financial movements and exposes metrics endpoints; the frontend fetches `/api/metrics` and displays calculated KPIs and charts. Evidence: [`backend/app/routes.py`](backend/app/routes.py) (`generate_mock_movements`, API route handlers); [`frontend/src/App.tsx`](frontend/src/App.tsx) (`fetchFinancialData`, `App`); [`frontend/src/lib/financial-utils.ts`](frontend/src/lib/financial-utils.ts) (`computeKPIs`, `computeMonthlyData`).

This describes the inherited baseline. It is not an assignment to extend dashboard functionality. Phase 1 documentation records the actual implementation and its verification results without changing application behavior.

## Assignment boundaries

- Follow the four mandatory assignment phases below in order; their deliverables are assignment requirements, not optional proposals.
- Keep findings grounded in the actual repository and provide repository evidence. Distinguish source-code evidence, runtime observations, inferences, and unverified claims where relevant; do not invent architecture, features, services, conventions, or requirements.
- `SPECS.md` and `verification.md` are additional project-management and evidence documents. They support the assignment but do not replace any mandatory phase deliverable.
- Human approval is required before creating each phase's dedicated commit. This approval gate controls when the commit may be made; it does not make the commit or any other assignment deliverable optional. Do not commit, push, or merge without approval.
- Work in the current turn is limited to correcting Phase 1 documentation. Phase 2 has not begun and must not begin without a separate request/authorization.

## Mandatory assignment phases

The following four phases and their deliverables are mandatory and must remain in this order.

### Phase 1 — Understand the handover

Inspect the repository with the coding agent, verify the agent's claims against the source code, retain a verification trail, and create a dedicated Phase 1 commit. The verification trail should record evidence and distinguish what was verified from what remains uncertain. [`verification.md`](verification.md) is the current evidence document; [`SPECS.md`](SPECS.md) is an additional project-management artifact. The dedicated commit remains required, but must wait for human approval.

### Phase 2 — Derive engineering findings

Identify actual repository conventions and risky patterns. Provide repository evidence for every finding, group findings by category, derive and propose evidence-based rules from those findings, and create a dedicated Phase 2 commit after human approval. Do not start this phase as part of the current documentation correction.

### Phase 3 — Implement and test repository rules

Create `.agents/rules`, write actionable project-specific rules, test those rules through a small real task in this repository, document the test and its results, and create a dedicated Phase 3 commit after human approval.

### Phase 4 — Build project memory

Create `memory-bank` documenting the verified product overview, technology stack, current state, gaps, and next priorities, then create a dedicated Phase 4 commit after human approval.

## Phase 1 acceptance criteria

Phase 1's required work is complete for review when:

1. The inherited repository has been inspected with the coding agent, and its relevant claims have been checked against source code rather than accepted without verification.
2. A verification trail records the inspection evidence, runtime/test checks as applicable, warnings, corrections, and uncertainties. [`verification.md`](verification.md) is the current trail; it explicitly records the failed frontend proxy request (502/TCP timeout) and that the underlying network cause remains unresolved.
3. [`SPECS.md`](SPECS.md) accurately records the assignment and the exact four-phase order; it and `verification.md` remain additional project-management/evidence documents, not substitutes for the assignment deliverables.
4. The Phase 1 changes and evidence have been reviewed, and `git diff --check` passes with the resulting Git status reported.
5. A dedicated Phase 1 commit is created **after human approval**. Approval is a gate on commit timing, not a waiver of this mandatory deliverable.

The Phase 1 work in this turn is restricted to documentation; it does not authorize changing application code, tests, dependencies, Docker configuration, or runtime behavior. No Phase 2 work is included here.
