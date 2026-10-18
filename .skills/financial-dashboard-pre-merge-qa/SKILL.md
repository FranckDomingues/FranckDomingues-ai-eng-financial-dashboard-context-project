---
name: financial-dashboard-pre-merge-qa
description: Run a read-only, evidence-based pre-merge QA review for this inherited React/TypeScript and FastAPI financial dashboard. Use before reviewing or merging branch changes, when asked for repository readiness, or when validating agent-skill changes. Do not use this skill to repair issues or change application code.
---

# Financial Dashboard Pre-Merge QA

## Objective

Determine and report two separate outcomes using repository-specific source, Git, and validation evidence:

1. **Application readiness** — whether the changed application branch meets its in-scope engineering, integration, and runtime acceptance criteria.
2. **Academic deliverable readiness** — whether the assignment's required artifacts, skill applications, evidence, commits (when required/authorized), and handover documentation are complete.

Do not collapse these outcomes into one label. A technically passing build does not prove assignment completion; a complete set of assignment artifacts does not prove the application works end to end. QA is read-only: identify and report findings; do not fix them. The dashboard is an inherited learning/context project, not authorization to add features or redesign it.

## Required inputs

- Repository root and current branch/worktree.
- Intended target base branch or PR base. Resolve it from an explicit task/PR, configured upstream, or Git refs; never assume `main` or `origin/main`.
- Scope of the request and whether full QA is explicitly requested.
- Relevant changed files and available service/environment status.

If target base is unknown or ambiguous, ask for clarification or report that comparison as `BLOCKED`; continue only with checks that remain meaningful.

## Expected outputs

1. A concise evidence-based report listing branch, HEAD, base used (or why unavailable), worktree state, changed-file scope, exact commands/context, and results.
2. Every check labeled `PASS`, `FAIL`, `WARNING`, or `BLOCKED`; distinguish not-run checks from failures.
3. Two separate final recommendations: **application readiness** and **academic deliverable readiness**, each exactly one of `READY`, `NOT READY`, or `BLOCKED`, with rationale and limitations. Include an optional combined overall conclusion only if clearly labeled as the stricter of the two; never use one to imply the other. For academic criteria, report requirement text and status separately from evidence; if official wording is missing, mark mapping `BLOCKED` rather than inventing a requirement.
4. A clear inventory of files changed by this QA task. Do not commit, push, merge, deploy, or leave a repaired worktree.

## Workflow

1. **Establish Git context.** From repository root, inspect `git branch --show-current`, `git rev-parse HEAD`, `git status --short --branch`, staged and unstaged diffs, and upstream/tracking refs. Resolve and record the target base from evidence; compare the merge-base or PR diff against that base. Separate pre-existing changes from task changes. Never discard or stage unrelated work.
2. **Read project context before conclusions.** Read `AGENTS.md`, existing `.agents/rules/`, `memory-bank/` if present, and relevant README/specification/verification history. Follow existing instructions and cite them in findings. Check existing installed skills as relevant; do not alter them. Report absent expected context paths instead of inventing their content.
3. **Inspect scope and architecture.** Review the complete diff against the chosen base and worktree changes; identify out-of-scope edits, generated files, dependency/configuration changes, and untracked files. For dashboard changes, verify the documented split: `frontend/src/App.tsx` owns page-level fetching/loading, `frontend/src/lib/financial-utils.ts` owns financial aggregation, and typed results flow to dashboard components. Specifically flag unexpected changes to financial calculations in `financial-utils.ts` or contracts/interfaces in `frontend/src/lib/financial-types.ts`; verify linked Python/TypeScript API contract changes together when applicable. Do not infer behavior from file names alone.
4. **Select checks by change scope.** With running Compose services, run these exact frontend checks from the repository root:
   - `docker compose exec -T frontend npm test`
   - `docker compose exec -T frontend npm run lint`
   - `docker compose exec -T frontend npm run build`
   Run each separately and record exit status and relevant warnings. Do not install dependencies or start/rebuild services just to clear a blocker unless separately authorized. If a container/service or executable is unavailable, report `BLOCKED`, not test failure. Do not suppress or fix baseline warnings.
5. **Backend checks are conditional.** Run `docker compose exec -T backend pytest` when backend/API code or tests are in scope, or when the user explicitly requests full QA. Otherwise record `BLOCKED`/not run as `NOT RUN — not required for this scope` (not a test failure); if reporting must use the four check labels, label this `WARNING` and explain the scope-based omission. Follow `README.md` for Compose context.
6. **Check integration boundaries only when relevant or explicitly requested.** For API routing, frontend data loading, Vite proxy, or Compose networking changes, check direct backend API access and the frontend `/api` proxy separately; also distinguish these from frontend root-page HTTP and browser checks. A passing direct backend request does not establish proxy or browser success. Record exact URL/path and status. Do not diagnose beyond evidence or repair the route/network. Historical `verification.md` records direct backend HTTP 200 versus a failing proxy (502/TCP timeout); it is unresolved historical evidence, not proof of current behavior. Browser automation may be reported `BLOCKED` if browser/system dependencies are missing; do not install OS packages or claim browser assertions without a run.
7. **Check skill provenance where skill-related files changed.** Identify which source skill or local instruction motivated the change and whether the change is an approved, focused application of that guidance. Preserve existing community skill files and report provenance; do not silently attribute generic changes to a skill.
8. **Preserve and classify evidence.** Separate command outcomes into `PASS`, `FAIL`, `WARNING`, or `BLOCKED`. Historical results are context only and must not be relabeled as current passes. A missing tool, unavailable service, or unrun boundary is not a test failure. Keep known issues/warnings visible; do not fix, hide, suppress, or conflate them. Do not claim end-to-end integration without exercising that boundary.
9. **Recommend two outcomes independently.** For **application readiness**, use `READY` only when required in-scope checks pass and no unresolved in-scope failure or scope violation remains. Use `NOT READY` for a demonstrated in-scope application failure or unauthorized application-scope change. Use `BLOCKED` when essential application evidence/checks cannot be obtained, the target base cannot be resolved, or the result cannot be determined. A passing direct backend HTTP request never establishes frontend API integration; if the Vite proxy times out, report that boundary separately and do not label integration ready.
10. For **academic deliverable readiness**, compare the explicit official assignment requirements with evidence item by item. Use `READY` only when every required deliverable has evidence and every required evaluation criterion is met. Use `NOT READY` when required work is incomplete or a criterion is demonstrated unmet. Use `BLOCKED` when the official requirements or essential evidence are unavailable. Discovery, installation, and application of a skill are separate claims and require separate evidence. A skill being readable/listed by a CLI does not by itself prove the Copilot editor runtime activated it. Do not infer requirements from a task count or replace official wording with invented subchecks. A warning may coexist with either `READY` only if it is explicitly non-blocking and outside that outcome's acceptance criteria; explain why.
11. If a task requests an overall readiness conclusion, provide both outcomes and say that overall delivery is ready only when both are `READY`. Otherwise state why it is not ready or blocked. Never let one dimension mask the other.

## Acceptance criteria

- Branch, HEAD, worktree and target base are evidenced, or an explicit blocker is reported.
- Changed files and scope are reviewed against a real, identified base; current, staged, untracked, and historical changes are not conflated.
- Applicable repository rules and architecture were read before recommendations.
- Required frontend checks were attempted in the documented Compose context; backend pytest was included only under its conditions.
- Financial calculations, typed interfaces/API contracts, and relevant integration boundaries are checked when within scope.
- Known warnings, historical baseline issues, and environment blockers remain distinct and are never silently repaired or reported as current test outcomes.
- Report includes exact check labels and separate application and academic deliverable readiness labels, each with evidence and limitations.
- Do not claim WCAG conformance, accessibility certification, or successful browser QA unless the applicable criterion was actually assessed with sufficient evidence. Passing unit tests, lint, build, static markup inspection, or a direct backend request is not browser/accessibility conformance evidence.
- QA leaves application files, dependencies, community skills, runtime configuration, and Git history unchanged; no commit/push/merge/deploy occurs.

## Safety and scope restrictions

- Read-only review only. Do not edit dashboard/backend code, tests, financial calculations, types/contracts, dependency manifests/lockfiles, Docker/Compose/Vite settings, community skills, rules, memory, or unrelated files.
- Do not install packages, change machine/system configuration, restart services, or run helper scripts with implicit process/shell behavior without explicit authorization.
- Do not change branches, reset/clean, stage, commit, push, merge, or deploy. Preserve pre-existing user changes.
- The only exception is a separately authorized task explicitly requesting creation or modification of this skill itself; such a task still does not authorize application or environment changes.
- Respect this repository's guidance: `AGENTS.md` identifies `.agents/rules`, `.agents/skills`, and `memory-bank`; `README.md` documents Compose validation. Do not assume `.skills/` is automatically discovered by Copilot. If this skill is not auto-discovered, report the observed convention and propose the smallest registration/index change separately; do not duplicate or relocate it without approval.

## Failure and blocker reporting

For each attempted check, include the exact command or boundary, execution context, exit/status, and concise output. Use:

- `PASS` — command/boundary ran and met its applicable expectation.
- `FAIL` — command/boundary ran and demonstrated an in-scope failure.
- `WARNING` — non-blocking observed issue, known baseline concern, or scope-based check omission that is explicitly explained.
- `BLOCKED` — check could not run or evidence is insufficient (for example, missing service, tool, system library, or unresolved base).

Never call a blocked or unrun check a pass or failure. Distinguish current observations from historical records; state unresolved causes as unresolved. Summarize blockers and warnings separately, then give separate `READY`, `NOT READY`, or `BLOCKED` recommendations for application readiness and academic deliverable readiness. If the official academic checklist is unavailable, mark that assessment `BLOCKED` and request the source; do not substitute inferred items. Give a combined conclusion only if requested, and only as the stricter outcome of those two assessments.