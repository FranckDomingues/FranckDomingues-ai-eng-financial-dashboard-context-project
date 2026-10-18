# Phase 2 — Engineering Findings and Proposed Rules

**Status:** Evidence review for human approval. The rules below are proposals only; they are not implemented agent instructions. This document records repository findings and does not authorize refactoring, dashboard changes, dependency/configuration changes, or a commit.

## Evidence and status key

- **Verified source fact:** Directly present in the cited tracked source or configuration.
- **Observed runtime fact:** Recorded runtime result from Phase 1 `verification.md`; it describes the checked environment/time, not all future runs.
- **Potential consequence — inference:** A risk or impact inferred from the facts, not a claim of an observed failure unless stated.
- **Verification status:** What was actually established and any limits.

Line references below refer to the repository state at Phase 1 HEAD `afc2f305c0a572f30044fe5c57f5dd4d885a5959`.

## Findings

### 1. Frontend/backend architecture

#### F-ARCH-01 — Keep dashboard aggregation in the financial utility module

- **Category:** Frontend/backend architecture
- **Verified repository evidence:** `frontend/src/App.tsx:15–17, 30–34` fetches movement records and invokes `computeKPIs` and `computeMonthlyData`; `frontend/src/lib/financial-utils.ts:21–67` owns those calculations. `frontend/src/components/dashboard/kpi-row.tsx:5–11` declares the typed metrics props and begins the `KPIRow` component that consumes them.
- **Potential consequence — inference:** Moving aggregation into page rendering or duplicating it across display components could make the existing calculations harder to reuse and independently test.
- **Proposed actionable agent rule R-ARCH-01:** Preserve the current split: keep financial aggregation in `frontend/src/lib/financial-utils.ts`, keep page-level loading/fetch orchestration in `App.tsx`, and pass calculated typed values into dashboard components. Do not add another service/state abstraction unless a task requirement demonstrates the need.
- **Rule scope:** Frontend application and dashboard data-flow changes.
- **Verification status:** Verified in source. This is a description of the current organization, not a claim that it is the only valid architecture.

#### F-ARCH-02 — Frontend proxy integration currently fails; root cause is unresolved

- **Category:** Frontend/backend architecture
- **Verified repository evidence:** `frontend/vite.config.ts:9–16` proxies `/api` to `http://backend:8000`; `docker-compose.yml:2–20` defines frontend/backend services and their ports. **Observed runtime fact (Phase 1 `verification.md`, “Runtime diagnostics” and “Cause assessment”):** `http://localhost:5173/api/metrics` returned HTTP 502; Vite logged `connect ETIMEDOUT 172.18.0.2:8000`; frontend-container TCP to `backend:8000` timed out. Backend loopback and host-published requests returned HTTP 200. DNS resolved `backend` to the backend container IP, and both containers were attached to the Compose bridge. These observations do not establish why the connection timed out.
- **Potential consequence — observed:** The dashboard's browser session displayed its data-load error and empty KPI/chart data; successful frontend-to-backend data rendering was not achieved during that verification. **Root cause — unresolved:** No cause has been confirmed; Codespaces forwarding was only a hypothesis.
- **Proposed actionable agent rule R-ARCH-02:** Preserve the 502/TCP-timeout finding as unresolved until new evidence identifies a cause. For future API-routing or Compose-network changes, check both direct backend access and the frontend `/api` proxy path; do not report end-to-end success based solely on backend health, unit tests, or frontend root HTTP 200.
- **Rule scope:** Frontend/backend integration, Vite proxy, Compose networking, and reporting verification results.
- **Verification status:** Runtime failure confirmed in the Phase 1 record; underlying network cause unresolved. This Phase 2 investigation did not retry, repair, or otherwise alter the integration.

### 2. Naming and data contracts

#### F-CON-01 — Frontend and backend maintain parallel movement contracts

- **Category:** Naming and data contracts
- **Verified repository evidence:** `backend/app/routes.py:10–29` defines `OperationType`, `Category`, `BusinessType`, and the Pydantic `FinancialMovement`; `frontend/src/lib/financial-types.ts:1–11` defines matching unions and movement fields (`create_date`, `amount`, `operation_type`, `category`, `business_type`). The API response model is declared at `backend/app/routes.py:248–250`.
- **Potential consequence — inference:** Renaming a wire field or changing an allowed enum in only one language can make the consumer and producer disagree; TypeScript's static types do not themselves validate an HTTP response at runtime.
- **Proposed actionable agent rule R-CON-01:** When changing a financial-movement wire field or allowed value, update the Python API model and TypeScript contract together, then update the relevant API and frontend tests. Preserve snake_case API field names unless an explicitly documented serialization change is part of the task.
- **Rule scope:** Backend response models, frontend API types, and tests that consume those contracts.
- **Verification status:** Matching source definitions verified. No runtime schema-drift test was found in the inspected files.

#### F-CON-02 — Displayed period is not tied to the requested data range

- **Category:** Naming and data contracts
- **Verified repository evidence:** `frontend/src/App.tsx:15–17` fetches `/api/metrics` without date query parameters; `frontend/src/App.tsx:49` supplies the fixed heading `2024 - Full Year`. `backend/app/routes.py:248–258` accepts optional date filters but defaults them to `None`. Phase 1 `verification.md` records a human-observed API record with `create_date: "2025-10-02"`.
- **Potential consequence — observed discrepancy:** At least one previously observed returned date does not match the fixed 2024 heading. The full data range was not established by that sample.
- **Proposed actionable agent rule R-CON-02:** Do not present a fixed period label as if it filters or describes the response unless the request actually applies that period or the returned data is verified to match it. When changing period behavior, verify the displayed period against the request and resulting data.
- **Rule scope:** Frontend period/filter UI and backend/API range selection.
- **Verification status:** The mismatch is verified from source plus recorded runtime evidence; the complete date range remains unverified.

#### F-CON-03 — Mock-data determinism is paired with a moving calendar and global PRNG state

- **Category:** Naming and data contracts
- **Verified repository evidence:** `backend/app/routes.py:65–101` uses `date.today()` to choose generated years; `generate_mock_movements(seed)` calls module-global `random.seed(seed)` at lines 94–97; route handlers pass `seed=42` (for example lines 255 and 277). `backend/tests/test_routes.py:12–16` checks the 360-record count and chronological sorting.
- **Potential consequence — inference:** A fixed seed makes random choices repeatable for a given calendar context but does not freeze generated dates across years; resetting the process-global PRNG can also affect other code using the same random module.
- **Proposed actionable agent rule R-CON-03:** Preserve the explicit seed behavior when editing the mock generator, but do not assume its dates are fixed across calendar years. Tests that need stable date boundaries should supply/control the date context rather than relying on today's date; avoid introducing reliance on the global PRNG state.
- **Rule scope:** Backend mock-data generation and its tests.
- **Verification status:** Source behavior verified. No observed production data or production use of the generator was established; the inspected routes use seeded mock data.

### 3. Tests and validation

#### F-TEST-01 — Existing tests do not exercise browser-to-proxy integration

- **Category:** Tests and validation
- **Verified repository evidence:** `backend/tests/test_routes.py:1–180` tests FastAPI routes using `TestClient`; `frontend/src/lib/financial-utils.test.ts:1–113` tests utility calculations and formatters. The inspected test inventory contains no `App` rendering test or browser/proxy integration test. Phase 1 `verification.md` records a proxy 502 despite the previous unit test, lint, and build checks passing.
- **Potential consequence — observed and inference:** The 502 occurred while unit tests passed in the earlier verification. Therefore those unit tests did not establish working browser integration; future integration regressions could similarly pass the existing unit suites.
- **Proposed actionable agent rule R-TEST-01:** When a task changes data loading, API routing, or Compose networking, validate the affected frontend-to-backend path in addition to relevant unit tests. Keep the boundary explicit in reports; do not infer browser integration success from unit tests or a successful root-page response.
- **Rule scope:** Test selection and reporting for cross-layer data-flow changes.
- **Verification status:** Test inventory and historical 502 observation verified. No browser/proxy integration test was found in the inspected files; this finding does not prescribe a particular testing framework.

#### F-TEST-02 — Assertions emphasize representative behavior and do not cover every boundary/error case

- **Category:** Tests and validation
- **Verified repository evidence:** `backend/tests/test_routes.py:19–26` checks inclusive date edges; lines 36–50 tests date filters; other tests check response contents and selected fields. `frontend/src/lib/financial-utils.test.ts:35–60` tests KPI totals and zero income; lines 63–103 tests cross-year monthly aggregation.
- **Potential consequence — inference:** A change to an untested validation, malformed-input, or boundary behavior may not be detected by the existing representative cases. This is not a claim that current tests are defective; the tests cover selected intended behavior.
- **Proposed actionable agent rule R-TEST-02:** For a changed endpoint, contract, or financial calculation, add assertions for the changed behavior and its relevant boundaries (including invalid input when the endpoint validates it). Do not replace behavioral assertions with status-code-only checks.
- **Rule scope:** Backend endpoint and frontend utility test changes.
- **Verification status:** The cited tests and their coverage are verified by inspection; no coverage report was examined in this investigation.

#### F-TEST-03 — Validation entry points are defined in project manifests and warnings are recorded

- **Category:** Tests and validation
- **Verified repository evidence:** `frontend/package.json:5–14` defines `test`, `lint`, and `build` scripts. `backend/requirements.txt:1–5` includes pytest tooling. Phase 1 `verification.md`, “Automated validation”, records 15 backend tests and 5 frontend tests passing, lint/build passing, and both a Starlette/httpx deprecation warning and Vite chunk-size warning.
- **Potential consequence — observed:** The checks passed with warnings; omitting the warnings would hide known validation context. Running frontend scripts from the repository root also previously failed because there is no root `package.json` (recorded in Phase 1).
- **Proposed actionable agent rule R-TEST-03:** Use the scripts declared in `frontend/package.json` from the frontend project context and run backend pytest in its configured environment. Report pass/fail, environment blockers, and emitted warnings separately; do not silently change dependencies or thresholds to suppress warnings.
- **Rule scope:** Developer validation workflow and test/build reporting.
- **Verification status:** Scripts, dependency manifest, and prior command results verified from source/Phase 1 record. Commands were not rerun for this document.

### 4. Configuration and security

#### F-CFG-01 — CORS allows every origin with credentials enabled

- **Category:** Configuration and security
- **Verified repository evidence:** `backend/app/main.py:7–13` configures `CORSMiddleware` with `allow_origins=["*"]`, `allow_credentials=True`, and wildcard methods/headers.
- **Potential consequence — inference:** If this configuration is used outside the intended development context, the cross-origin policy may be broader than the deployment requires. This investigation did not assess actual deployment or browser/security exposure.
- **Proposed actionable agent rule R-CFG-01:** Preserve the current setting unless an authorized task addresses CORS. For an approved environment/security change, derive allowed origins from the stated deployment requirements and review credential support deliberately; do not broaden wildcard access further.
- **Rule scope:** Backend CORS middleware and environment-specific deployment configuration.
- **Verification status:** Configuration verified in source. Production use and exploitability are unverified; no claim of a demonstrated vulnerability is made.

#### F-CFG-02 — Frontend lockfile exists; backend requirements are unpinned

- **Category:** Configuration and security
- **Verified repository evidence:** `frontend/package-lock.json` is tracked; `frontend/Dockerfile:3–7` copies package manifests and runs `npm install`. `backend/requirements.txt:1–5` lists packages without version specifiers. No Python lock file was found in the tracked-file inventory.
- **Potential consequence — inference:** Backend dependency resolution can change between installs; the frontend has a lockfile, although the Dockerfile's exact install behavior is `npm install`. This is a reproducibility risk, not an observed dependency failure.
- **Proposed actionable agent rule R-CFG-02:** Do not modify dependency versions, lockfiles, or install strategy unless authorized by the task. When an authorized dependency change is made, update the relevant manifest/lock artifacts consistently and report the resulting validation; do not infer that the repository has a Python lock file.
- **Rule scope:** Frontend and backend dependency manifests, lockfiles, and image build instructions.
- **Verification status:** Tracked frontend lockfile and unpinned backend requirements verified; no Python lock file in tracked-file inventory. Dependency drift was not measured.

#### F-CFG-03 — Container entrypoints run development servers and debug/reload options

- **Category:** Configuration and security
- **Verified repository evidence:** `frontend/Dockerfile:12` starts `npm run dev`; `backend/Dockerfile:12` starts debugpy and Uvicorn with `--reload`; `docker-compose.yml:7–14, 16–22` publishes frontend/backend ports and bind-mounts source trees.
- **Potential consequence — inference:** These settings are consistent with a development workflow, but are not evidence of a production-hardened deployment. No production target was evaluated.
- **Proposed actionable agent rule R-CFG-03:** Treat the current Dockerfiles/Compose commands as development configuration as written. Do not replace, expose, or describe them as production settings without explicit deployment requirements and review; do not change these configurations as part of unrelated application work.
- **Rule scope:** Dockerfiles, Compose runtime settings, and deployment descriptions.
- **Verification status:** Configuration verified in source; production suitability remains unverified.

### 5. Documentation and developer experience

#### F-DOC-01 — Agent guidance points to context directories that are currently absent

- **Category:** Documentation and developer experience
- **Verified repository evidence:** `AGENTS.md:1–10` directs agents to inspect `.agents/rules`, `.agents/skills`, and `memory-bank`; `README.md:24–38` documents an expected `.agents/rules` and `.agents/skills` structure. Phase 1 filesystem inspection recorded those directories absent at that time; this document-creation step did not create them.
- **Potential consequence — inference:** An agent may expect local rules or memory that are not present, or may make up their contents if it does not check. Absence is a filesystem observation, not a claim that the assignment does not require those artifacts in later phases.
- **Proposed actionable agent rule R-DOC-01:** At task start, inspect the paths named in `AGENTS.md`; distinguish present files from absent directories and continue using the applicable repository/task instructions. Do not invent missing rules or memory. Create those artifacts only in their authorized assignment phases.
- **Rule scope:** Agent workflow and repository-context discovery.
- **Verification status:** Guidance source verified; absence was observed at Phase 1 and should be rechecked when a later task begins.

#### F-DOC-02 — Frontend and backend workflows are rooted in separate project manifests/environments

- **Category:** Documentation and developer experience
- **Verified repository evidence:** `frontend/package.json:5–14` defines frontend scripts; backend Python/test dependencies are in `backend/requirements.txt:1–5`; Compose has separate `frontend` and `backend` services in `docker-compose.yml:1–22`. Phase 1 `verification.md` records host-side commands from the wrong directory or without installed packages as blocked, while the corresponding checks succeeded inside already-running containers.
- **Potential consequence — observed:** Wrong working directory or unavailable local dependencies can be mistaken for project test failures. The prior failures were environmental/workdir blockers, not proof that the configured container checks failed.
- **Proposed actionable agent rule R-DOC-02:** Run frontend package scripts in the frontend project/container and backend tests in the backend project/container. When a command cannot run because of working directory or missing environment dependencies, report it as blocked and distinguish it from a test failure.
- **Rule scope:** Contributor and agent command execution/reporting.
- **Verification status:** Manifest/service layout and recorded blockers verified. A fresh-environment setup was not validated.

## Traceability matrix

Each proposed rule below is tied directly to its corresponding repository finding. The evidence column identifies the fact(s) that support the rule; the consequence need not be treated as a proven defect.

| Proposed rule | Finding | Concrete repository fact grounding the rule |
|---|---|---|
| R-ARCH-01 | F-ARCH-01 | `App.tsx` calls utility functions; `financial-utils.ts` owns aggregation; dashboard components accept typed props. |
| R-ARCH-02 | F-ARCH-02 | Vite `/api` proxy and Compose backend target exist; Phase 1 records proxy 502/TCP timeout, backend direct HTTP 200, and unresolved cause. |
| R-CON-01 | F-CON-01 | Backend Pydantic model and frontend TypeScript movement interface share fields/enums. |
| R-CON-02 | F-CON-02 | App fetch has no date query; heading is fixed to 2024; Phase 1 records a 2025-10-02 response date. |
| R-CON-03 | F-CON-03 | Generator uses `date.today()`, module-global `random.seed(seed)`, and route calls use `seed=42`. |
| R-TEST-01 | F-TEST-01 | Backend tests use TestClient; frontend tests exercise utilities; Phase 1 records proxy integration failure despite unit validation. |
| R-TEST-02 | F-TEST-02 | Existing tests assert selected edge, calculation, and response behaviors, as cited; no complete coverage claim is made. |
| R-TEST-03 | F-TEST-03 | Frontend scripts are declared in `package.json`, backend dependencies in `requirements.txt`, and prior validation recorded warnings. |
| R-CFG-01 | F-CFG-01 | `main.py` explicitly configures wildcard origins/methods/headers with credentials. |
| R-CFG-02 | F-CFG-02 | Tracked frontend lockfile and `npm install`; backend requirements have no versions and no tracked Python lockfile was found. |
| R-CFG-03 | F-CFG-03 | Dockerfiles use Vite dev server and debugpy/Uvicorn reload; Compose bind-mounts source. |
| R-DOC-01 | F-DOC-01 | `AGENTS.md` and README refer to agent-context directories; Phase 1 recorded them absent at that time. |
| R-DOC-02 | F-DOC-02 | Separate frontend package/backend requirements and Compose services; Phase 1 recorded environment/workdir command blockers. |

## Scope and disposition

- There are **13 findings** across the five requested categories and **13 proposed rules**, with one-to-one traceability in the matrix.
- These proposals are documentation for human review. They are not active `.agents/rules` instructions and no rule files are created in this phase.
- The known frontend proxy HTTP 502/TCP timeout remains a confirmed historical runtime failure with an **unresolved root cause**. No fix or new network diagnosis is included here.
- No feature, refactor, dependency change, test change, configuration change, commit, push, or merge is part of this document.
