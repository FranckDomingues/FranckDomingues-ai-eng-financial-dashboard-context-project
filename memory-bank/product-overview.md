# Product Overview

## Purpose and verified scope

This repository is a 4Geeks Academy learning project centered on an inherited financial metrics dashboard. Its assignment is repository discovery and context documentation; the current application baseline is not a request to add dashboard features or redesign the system. The README describes a React + TypeScript frontend and FastAPI backend. [Evidence: `SPECS.md` (“Assignment purpose” and “Scope of the inherited application”); `README.md`.]

## Current user-facing behavior

- The React page fetches `GET /api/metrics` on mount. It shows a fixed `2024 - Full Year` heading, KPI cards, and income/outcome and profit-percent charts; it displays an error message if fetching fails. [Evidence: `frontend/src/App.tsx` (`fetchFinancialData`, `App`).]
- On a successful response, the page calculates total income, outcome, profit, and profit percent, plus a monthly series, before passing typed data to dashboard components. [Evidence: `frontend/src/lib/financial-utils.ts` (`computeKPIs`, `computeMonthlyData`); `frontend/src/lib/financial-types.ts`; `frontend/src/components/dashboard/kpi-row.tsx`.]
- The period heading is currently fixed and the UI request does not include date query parameters. The verification record documents one returned movement date, `2025-10-02`, which conflicts with that label; the complete returned date range is not established. This is a documented inconsistency, not an implemented date filter. [Evidence: `frontend/src/App.tsx`; `verification.md` (“Confirmed UI/API date inconsistency”).]

## Data origin and API capabilities

The inspected API route handlers call `generate_mock_movements(seed=42)`. The generator creates 360 movements (12 months × 30) using the current date to select years; it is mock data, not evidence of a database or external provider. A fixed seed does not fix the calendar-year context. [Evidence: `backend/app/routes.py` (`generate_mock_movements`, `get_metrics`); `backend/tests/test_routes.py`; `docs/engineering-findings.md` F-CON-03.]

Available backend routes include:

- `/health` and `/api/metrics` (optional date, category, and operation filters).
- `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, and `/api/metrics/alerts`.
- `/api/metrics/b2b` and `/api/metrics/b2c`.

The route signatures and response models are in `backend/app/routes.py`. The current page path in `frontend/src/App.tsx` calls only `/api/metrics`; the other metrics endpoints are backend capabilities, not evidence of current UI consumption. No database or external data integration was found in the inspected routes. [Evidence: `backend/app/routes.py`; `frontend/src/App.tsx`; `docs/engineering-findings.md`.]

## Main application flow

1. Vite serves the React application. Its `/api` proxy is configured for `http://backend:8000`. [Evidence: `frontend/vite.config.ts`; `docker-compose.yml`.]
2. `frontend/src/App.tsx` requests `/api/metrics` and maintains loading/error state.
3. `frontend/src/lib/financial-utils.ts` aggregates the returned typed movements.
4. Dashboard components render KPI and chart values. [Evidence: `frontend/src/components/dashboard/`.]
5. FastAPI routes in `backend/app/routes.py` produce seeded mock data and apply route-specific filtering/aggregation.

The architecture rules describe this existing separation as page-level fetch/loading in `App.tsx`, calculation in `financial-utils.ts`, and typed values passed into dashboard components. [Evidence: `.agents/rules/frontend-data-flow.md`, R-ARCH-01.]

## Product boundaries and cautions

- The data is generated mock data; do not represent it as customer, production, or externally sourced financial data.
- The historical frontend proxy request returned HTTP 502 with a TCP timeout, while direct backend checks succeeded. The reason remains unresolved; successful unit checks or direct backend access do not establish that browser data loading works. [Evidence: `verification.md` (“Frontend-to-backend integration diagnosis”); `.agents/rules/frontend-data-flow.md`, R-ARCH-02.]
- API endpoint availability does not mean the current frontend consumes every route.
- Production suitability, intended deployment environment, and a product roadmap are not established by the inspected repository. [Evidence: `docs/engineering-findings.md` F-CFG-03; `verification.md` (“Unresolved items”).]
