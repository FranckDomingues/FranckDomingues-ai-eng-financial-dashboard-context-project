# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Academic deliveries

This repository is organized around two academic deliveries:

### Delivery 01 — Context Engineering

- **Status:** Completed
- **Objective:** Analyze, understand, and document the inherited financial dashboard.
- **Context artifacts:** [`memory-bank/`](memory-bank/), [`.agents/rules/`](.agents/rules/), and the original project documentation, including [`SPECS.md`](SPECS.md), [`verification.md`](verification.md), and [`docs/engineering-findings.md`](docs/engineering-findings.md).

Delivery 01 records the inherited baseline and its evidence. Its history and artifacts are retained as completed; this README organization does not rewrite that delivery.

### Delivery 02 — Specification-Driven Development

- **Status:** In Progress
- **Branch:** `feature/frontend-specs`
- **Objective:** Define verified frontend specifications for three new financial dashboard features.
- **Features:** Date-range filtering, anomaly alerts, and B2B vs B2C comparison.
- **Deliverables:** `frontend/specs/api-types.ts`, `frontend/specs/param-types.ts`, `frontend/specs/components.md`, and [`frontend/specs/README.md`](frontend/specs/README.md).
- **Scope boundary:** React implementation, frontend API-fetch integration, and backend modification are out of scope.

API operation names, parameters, and response properties for Delivery 02 must be verified against the running backend's `/docs` / OpenAPI documentation before being specified. See [`docs/delivery-02/SPECS.md`](docs/delivery-02/SPECS.md) and [`docs/delivery-02/TODO.md`](docs/delivery-02/TODO.md) for milestone scope and verification steps.

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

```bash
docker compose up --build
```

The frontend uses the Vite proxy for `/api` by default, so no extra environment variables are required in local development or Codespaces.
If you need to target a different backend origin, copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL`.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

## Run validation checks

Start the Compose services with `docker compose up --build`. In a second terminal, run the existing checks from the repository root:

```bash
docker compose exec -T frontend npm test
docker compose exec -T frontend npm run lint
docker compose exec -T frontend npm run build
docker compose exec -T backend pytest
```

The frontend commands use scripts declared in `frontend/package.json`; backend tests run in the backend container with dependencies from `backend/requirements.txt`. The services must be running before using `docker compose exec`.

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
