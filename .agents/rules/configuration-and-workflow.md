# Configuration and Agent Workflow Rules

These rules apply to relevant repository configuration and contributor/agent workflows. They preserve the observed baseline; they do not authorize deployment changes or dependency upgrades.

## R-CFG-01 — Treat CORS changes as an explicit environment/security decision

- **Scope:** Backend CORS middleware and environment-specific CORS configuration.
- **Supporting finding:** F-CFG-01.
- **Repository evidence:** `backend/app/main.py:7–13` currently sets wildcard origins, methods, and headers with `allow_credentials=True`.
- **Instructions:** Leave CORS unchanged during unrelated work. For an authorized CORS change, derive allowed origins and credential behavior from explicit environment/deployment requirements and review the resulting policy.
- **Boundaries and assumptions:** The inspected configuration alone does not establish production use or a demonstrated vulnerability. Do not call it secure for production or change it without task authorization.
- **Verification:** Inspect the resulting middleware settings against the stated requirements and report which environment they apply to.

## R-CFG-02 — Preserve dependency artifacts and report dependency policy accurately

- **Scope:** Frontend/backend package manifests, lockfiles, and image installation steps.
- **Supporting finding:** F-CFG-02.
- **Repository evidence:** `frontend/package-lock.json` is tracked; `frontend/Dockerfile:3–7` runs `npm install`; `backend/requirements.txt:1–5` lists unpinned packages. No Python lockfile was found in the reviewed tracked-file inventory.
- **Instructions:** Do not alter dependency versions, lockfiles, or install strategy for unrelated tasks. For an authorized dependency change, update applicable manifest/lock artifacts consistently and state the validation performed.
- **Boundaries and assumptions:** Do not claim that a Python lockfile exists or that dependency drift has been measured. This rule does not prescribe a new package manager or pinning policy.
- **Verification:** Review the relevant manifest/lockfile diff and run the project checks affected by an authorized dependency change.

## R-CFG-03 — Describe current container commands as development configuration

- **Scope:** Dockerfiles, Compose runtime settings, and documentation describing deployment use.
- **Supporting finding:** F-CFG-03.
- **Repository evidence:** `frontend/Dockerfile:12` runs Vite dev; `backend/Dockerfile:12` runs debugpy and Uvicorn `--reload`; `docker-compose.yml:6–22` publishes ports and bind-mounts source.
- **Instructions:** Preserve these commands during unrelated work. Describe them as the development configuration observed in the repository. Make production-oriented changes or claims only for an explicitly authorized deployment task with requirements.
- **Boundaries and assumptions:** Production suitability was not assessed. Do not label this setup production-hardened or introduce a production deployment pattern under this rule.
- **Verification:** For an authorized deployment task, compare changes to stated deployment requirements and verify the documented command matches the configuration.

## R-DOC-01 — Inspect required agent-context paths without inventing their contents

- **Scope:** Task-start discovery of repository guidance, rules, skills, and memory.
- **Supporting finding:** F-DOC-01.
- **Repository evidence:** `AGENTS.md:1–10` directs inspection of `.agents/rules`, `.agents/skills`, and `memory-bank`; `README.md:24–38` describes the `.agents` structure. Phase 1 `verification.md` recorded those paths absent at that time.
- **Instructions:** At task start, inspect the paths named in `AGENTS.md`; follow files that exist and report relevant expected paths that are absent. Do not fabricate instructions or memory content.
- **Boundaries and assumptions:** Historical absence may change; check the filesystem at task time. Create rules or memory only when the authorized assignment phase requests them.
- **Verification:** Confirm which paths/files were present and which instructions were reviewed before repository work.

## R-DOC-02 — Run commands from their project or configured container context

- **Scope:** Frontend/backend command execution and validation reporting.
- **Supporting finding:** F-DOC-02.
- **Repository evidence:** `frontend/package.json:5–14` defines frontend scripts; `backend/requirements.txt:1–5` lists backend dependencies; `docker-compose.yml:1–22` defines separate frontend/backend services; `verification.md`, “Host-side attempts and environment blockers,” records wrong-directory and missing-dependency blockers.
- **Instructions:** Run frontend scripts from the frontend project or its configured container and backend tests from the backend project or configured container. If a command is blocked by working directory or missing environment dependencies, report it as blocked and distinguish it from an executed failing test.
- **Boundaries and assumptions:** Prior container results do not prove a fresh environment is ready. Do not install dependencies or alter environment configuration merely to convert a blocker into a pass unless authorized.
- **Verification:** Record command and execution context; identify whether it passed, failed, or could not run and why.
