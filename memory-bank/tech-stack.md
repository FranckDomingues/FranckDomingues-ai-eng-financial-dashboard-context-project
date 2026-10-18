# Technology Stack and Development Workflow

## Languages and frameworks

| Area | Repository evidence | Verified technology/configuration |
|---|---|---|
| Frontend | `frontend/package.json`, `frontend/vite.config.ts` | TypeScript, React 19, Vite 8, Vitest, Recharts, Tailwind CSS. Package versions are those declared in the frontend manifest; this does not assert the exact installed runtime version. |
| Backend | `backend/requirements.txt`, `backend/app/main.py`, `backend/app/routes.py` | Python, FastAPI, Pydantic models, Uvicorn; pytest is included in backend requirements. |
| Containers | `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile` | Separate `frontend` and `backend` services. Frontend image uses Node 24 Alpine and Vite dev server; backend image uses Python 3.13 slim and debugpy/Uvicorn reload. These are the checked-in development commands, not evidence of a production deployment. |

Frontend scripts declared in `frontend/package.json` include `npm test` (Vitest run), `npm run lint` (ESLint), and `npm run build` (`tsc -b && vite build`). Backend dependencies/test tooling are listed in `backend/requirements.txt`.

## Entry points and key modules

- Frontend bootstraps from `frontend/src/main.tsx`; the page and its fetch/loading orchestration are in `frontend/src/App.tsx` (`fetchFinancialData`, `App`).
- Financial movement and calculated-value types are in `frontend/src/lib/financial-types.ts`; KPI/monthly calculations and formatting are in `frontend/src/lib/financial-utils.ts`.
- Dashboard views are implemented in `frontend/src/components/dashboard/`.
- FastAPI app and CORS middleware are in `backend/app/main.py`; API models, mock-data generation, filtering, aggregation, and routes are in `backend/app/routes.py`.

This matches the documented architecture rule: keep fetch/loading in the page, calculations in the financial utility module, and pass typed results to dashboard components. [Evidence: `.agents/rules/frontend-data-flow.md`, R-ARCH-01.]

## Compose development topology

`docker-compose.yml` defines:

- `frontend`: host port `5173` to container `5173`; mounts `./frontend:/app` and an anonymous `/app/node_modules` volume; depends on `backend`.
- `backend`: host port `8000` and debug port `5678`; mounts `./backend:/app`.

The Vite `/api` proxy target is `http://backend:8000` (`frontend/vite.config.ts`). The Dockerfiles run Vite's development server and debugpy with Uvicorn `--reload`; the rules explicitly treat this as development configuration. No production deployment configuration was verified. [Evidence: `docker-compose.yml`; `frontend/Dockerfile`; `backend/Dockerfile`; `.agents/rules/configuration-and-workflow.md`, R-CFG-03.]

## Documented run and validation commands

The root `README.md` documents startup from the repository root:

```bash
docker compose up --build
```

With services running, it documents these checks:

```bash
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
docker compose exec -T backend pytest
```

These are repository-documented commands, not a guarantee that a fresh local environment has Docker or dependencies available. Frontend scripts belong to the frontend project/container; backend pytest is run in the backend container per the README and R-DOC-02. [Evidence: `README.md` (“How to run locally”, “Run validation checks”); `.agents/rules/configuration-and-workflow.md`, R-DOC-02.]

## Dependency and environment cautions

- Frontend dependencies and scripts are declared in `frontend/package.json`; a tracked `frontend/package-lock.json` exists. `frontend/Dockerfile` runs `npm install`.
- Backend Python packages in `backend/requirements.txt` are unpinned; the reviewed tracked-file inventory did not establish a Python lockfile. Do not claim one exists. [Evidence: `.agents/rules/configuration-and-workflow.md`, R-CFG-02; `docs/engineering-findings.md`, F-CFG-02.]
- Historical host-side validation was blocked by missing host dependencies and wrong-directory commands; the Compose checks later passed. See `verification.md` and `memory-bank/current-state.md` for exact recorded outcomes.
- Historical Compose proxy diagnostics recorded frontend-to-backend TCP timeouts despite backend direct access succeeding. This environment-specific observation does not establish the cause or prove future behavior. [Evidence: `verification.md`; `.agents/rules/frontend-data-flow.md`, R-ARCH-02.]
