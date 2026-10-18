# Current State, Verification, and Open Questions

## Repository/assignment status

**Observed Git baseline for Phase 4:** branch `main`, HEAD `b9652abc979ecd0d17e084820651793fc3dc1ee9` (`chore: implement and validate agent rules - phase 3`), with a clean worktree before Phase 4 edits. Phases 1–3 are recorded as completed/committed in the collaboration history and Git history. Phase 4 memory documentation is being prepared for human review; it is not approved or committed. [Evidence: Git inspection at Phase 4 start; `docs/agent-collaboration-log.md`; `SPECS.md`.]

## Implemented baseline

- The frontend page requests `/api/metrics`, computes KPI and monthly aggregates, and renders dashboard cards/charts. The heading remains fixed to `2024 - Full Year`. [SOURCE — VERIFIED IN CODE: `frontend/src/App.tsx`; `frontend/src/lib/financial-utils.ts`.]
- Backend handlers generate seeded mock financial movements and expose health, metrics, facets, summaries, top categories, comparisons, alerts, and B2B/B2C routes. The current frontend page path calls only `/api/metrics`. [SOURCE — VERIFIED IN CODE: `backend/app/routes.py`; `frontend/src/App.tsx`.]
- The API response is mock-data-backed in the inspected routes; no database or external provider was established there. Date generation depends on `date.today()`, so seeded choices do not imply a fixed calendar year. [SOURCE — VERIFIED IN CODE: `backend/app/routes.py`; `.agents/rules/api-contracts-and-tests.md`, R-CON-03.]
- The fixed 2024 UI heading and request without date parameters conflict with at least one previously observed response date (`2025-10-02`). The complete returned date range is unknown. [SOURCE plus RUNTIME — OBSERVED: `frontend/src/App.tsx`; `verification.md` (“Confirmed UI/API date inconsistency”).]

## Historical validation record

The following results are recorded in `verification.md` and are historical observations, not checks newly run for Phase 4:

| Check | Recorded result | Qualification |
|---|---|---|
| Backend pytest in running Compose service | PASS: 15 passed, 1 warning | Starlette deprecation warning from `fastapi/testclient.py` concerning `httpx` use with `starlette.testclient`; no warning fix is claimed. |
| Frontend tests in running Compose service | PASS: 1 file, 5 tests passed | Tests include `frontend/src/lib/financial-utils.test.ts`; this does not prove browser/proxy integration. |
| Frontend lint in running Compose service | PASS | No reported lint errors. |
| Frontend production build in running Compose service | PASS | `tsc -b` and Vite build completed; Vite warned the 584.26 kB minified JS chunk exceeds its 500 kB warning threshold. |

Before services were started, the four `docker compose exec` checks were blocked because Compose services were not running. Subsequent container checks passed after `docker compose up -d --build`. Historical host attempts were also blocked by absent dependencies or running frontend commands at the repository root. Preserve these as environment/context blockers, not test failures. [Evidence: `verification.md`, “Phase 3 Rule Validation”, “Host-side attempts and environment blockers”; `.agents/rules/configuration-and-workflow.md`, R-TEST-03/R-DOC-02.]

## Known issue and limitations

- **RUNTIME — OBSERVED, unresolved:** `http://localhost:5173/api/metrics` returned HTTP 502; Vite logged a TCP timeout to `172.18.0.2:8000`, and frontend-container TCP requests to `backend:8000` timed out. Backend loopback and host-published direct requests returned HTTP 200. The root cause is unresolved; Codespaces forwarding was not established as the cause. Do not claim that proxy integration works or has been fixed. [Evidence: `verification.md`, “Frontend-to-backend integration diagnosis”; `.agents/rules/frontend-data-flow.md`, R-ARCH-02.]
- **RUNTIME — OBSERVED:** The browser showed the dashboard layout with its data-load error and empty KPI/chart data during the historical verification. Successful browser data rendering was not achieved then. [Evidence: `verification.md`, “Browser observation” and “End-to-end status”.]
- **SOURCE plus RUNTIME — OBSERVED:** The fixed period label has at least one observed date mismatch; the full payload date range is unverified. [Evidence: `frontend/src/App.tsx`; `verification.md`.]
- **UNVERIFIED:** Fresh-environment startup, production suitability, full date range, behavior under non-default `VITE_API_BASE_URL`, and interactive behavior beyond the recorded state. [Evidence: `verification.md`, “Unresolved items”; `.agents/rules/configuration-and-workflow.md`, R-CFG-03.]
- Known warnings are not fixes or acceptance of changes: the Starlette deprecation warning, bundle-size warning, and period-label inconsistency remain as recorded. No dependency/threshold changes are implied. [Evidence: `verification.md`; `.agents/rules/configuration-and-workflow.md`, R-CFG-02; `.agents/rules/api-contracts-and-tests.md`, R-TEST-03.]

## Next priorities (assignment-grounded, not a product roadmap)

1. Review the Phase 4 memory documents for factual accuracy and scope.
2. Keep human review/approval as the gate before any dedicated Phase 4 commit; until approval, leave these changes uncommitted. [Evidence: `SPECS.md`, assignment boundaries and Phase 4; current Phase 4 request.]
3. For future work that changes API routing/data loading or Compose networking, follow R-ARCH-02/R-TEST-01 and separately verify direct backend and frontend proxy paths. Do not treat this as authorization to troubleshoot or repair the existing 502 in this documentation task. [Evidence: `.agents/rules/frontend-data-flow.md`; `.agents/rules/api-contracts-and-tests.md`; `verification.md`.]
4. Do not infer product enhancements, deployment requirements, or a roadmap from the assignment; none is established by the reviewed evidence. [Evidence: `SPECS.md`; `docs/engineering-findings.md`, scope and F-CFG-03.]
