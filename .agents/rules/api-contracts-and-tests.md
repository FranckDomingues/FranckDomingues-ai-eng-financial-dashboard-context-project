# API Contracts, Mock Data, and Test Rules

These are instructions for future coding-agent work, derived from the verified API and test baseline. They do not authorize feature work or broad test rewrites.

## R-CON-01 — Keep the movement API contract aligned across languages

- **Scope:** Financial-movement response fields and allowed operation/category/business values.
- **Supporting finding:** F-CON-01.
- **Repository evidence:** `backend/app/routes.py:10–29,248–250` defines Literal types, the Pydantic `FinancialMovement`, and the API response model; `frontend/src/lib/financial-types.ts:1–11` defines the corresponding TypeScript unions and fields.
- **Instructions:** When changing a wire field or allowed value, update the Python model and TypeScript contract together, then update relevant API/frontend tests. Preserve the current snake_case wire names unless the task explicitly calls for a documented serialization change.
- **Boundaries and assumptions:** Parallel declarations are not runtime response validation. Do not assume changing one language's type updates the other or add a new schema-generation dependency without authorization.
- **Verification:** Compare field names and allowed values across both definitions and run relevant backend and frontend tests.

## R-CON-02 — Keep period labels consistent with the requested/returned data

- **Scope:** Frontend period labels and API date-range selection.
- **Supporting finding:** F-CON-02.
- **Repository evidence:** `frontend/src/App.tsx:15–17,49` requests `/api/metrics` without date parameters and displays `2024 - Full Year`; `backend/app/routes.py:248–258` has optional date filters; `verification.md` records a returned date of `2025-10-02`.
- **Instructions:** When changing period behavior, verify that the label corresponds to a filter actually sent or to the returned data range. Clearly distinguish an observed sample from a complete range.
- **Boundaries and assumptions:** The sample confirms at least one mismatch but not the full response range. Do not claim every record is outside 2024 or change the label as unrelated cleanup.
- **Verification:** Check request parameters and representative returned dates/range against the visible period label.

## R-CON-03 — Respect mock generator seed and date behavior

- **Scope:** Backend mock movement generation and tests that depend on generated dates or randomness.
- **Supporting finding:** F-CON-03.
- **Repository evidence:** `backend/app/routes.py:65–101` uses `date.today()` and module-global `random.seed(seed)`; route handlers pass `seed=42` (including lines 255 and 264); `backend/tests/test_routes.py:12–16` checks count and ordering.
- **Instructions:** Preserve explicit seeded behavior when editing this generator. For tests requiring stable date boundaries, control the date context rather than assuming the current calendar is fixed. Avoid adding behavior dependent on global PRNG state.
- **Boundaries and assumptions:** A fixed seed does not freeze dates across years. The inspected routes generate mock data; do not describe it as production data or add a new data provider under this rule.
- **Verification:** Check count/order and any changed date boundary behavior with focused tests; do not assert a fixed calendar year unless the test controls it.

## R-TEST-01 — Test the affected integration boundary

- **Scope:** Changes to frontend data loading, API routing, or Compose networking.
- **Supporting finding:** F-TEST-01.
- **Repository evidence:** `backend/tests/test_routes.py` uses FastAPI `TestClient`; `frontend/src/lib/financial-utils.test.ts` tests utilities; `verification.md` records the proxy 502 despite passing unit checks.
- **Instructions:** In addition to relevant unit tests, verify the affected frontend-to-backend path. State whether checks were direct API, proxy, browser, or unit-level.
- **Boundaries and assumptions:** Existing unit tests do not prove browser/proxy integration. This rule does not require a new testing framework or presume a specific integration-test harness.
- **Verification:** Report the precise boundary exercised and do not call end-to-end integration successful unless that path was verified.

## R-TEST-02 — Assert changed behavior and relevant boundaries

- **Scope:** Changes to endpoint behavior, API contracts, or financial calculations.
- **Supporting finding:** F-TEST-02.
- **Repository evidence:** `backend/tests/test_routes.py:19–26,36–50` covers selected date boundaries and filtering; `frontend/src/lib/financial-utils.test.ts:35–60,63–103` covers KPI values, zero income, and cross-year aggregation.
- **Instructions:** Add or update assertions for the behavior changed and its relevant boundary cases, including invalid input where the endpoint validates it. Prefer assertions on returned data/values, not status code alone.
- **Boundaries and assumptions:** Existing tests cover selected behavior; no coverage report was examined. Do not characterize these tests as exhaustive or rewrite unrelated cases.
- **Verification:** Run the relevant test suite and confirm assertions fail for an incorrect result and pass for the intended behavior where practical.

## R-TEST-03 — Run and report checks in the configured project context

- **Scope:** Frontend and backend test, lint, and build commands and their result reporting.
- **Supporting finding:** F-TEST-03.
- **Repository evidence:** `frontend/package.json:5–14` defines frontend scripts; `backend/requirements.txt:1–5` includes backend test tooling; `verification.md`, “Automated validation” and “Host-side attempts and environment blockers,” records successful container checks and warnings/blockers.
- **Instructions:** Use frontend scripts from the frontend project/environment and run backend pytest in its configured environment. Report passes, failures, environment blockers, and warnings separately. Do not silence warnings by changing dependencies or thresholds unless an authorized task calls for that change.
- **Boundaries and assumptions:** Prior results are historical, not a guarantee for the current environment. A missing executable or wrong working directory is a blocker, not by itself a test failure.
- **Verification:** Record commands, execution context, outcomes, and relevant warnings; distinguish checks not run from checks that failed.
