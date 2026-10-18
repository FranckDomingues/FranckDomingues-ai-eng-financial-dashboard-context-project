# Delivery 02 — Verification Checklist

This checklist tracks the specification-first milestone. Complete phases in order and retain evidence in the relevant specification documents. Do not implement application behavior as part of these verification steps.

## Phase 1 — Confirm milestone scope

- [ ] Read the Delivery 02 assignment and confirm F01 date-range filtering, F02 anomaly alerts, and F03 B2B-versus-B2C comparison are the requested feature areas.
- [ ] Confirm scope excludes React implementation, frontend API-fetch integration, and backend changes.
- [ ] Record questions or ambiguous requirements; do not resolve them by inventing behavior or schemas.

## Phase 2 — Verify the running API contract

- [ ] Start or access the backend using the repository-documented workflow, without changing application or runtime configuration.
- [ ] Open the running backend's `/docs` and inspect the relevant documented operations and schemas.
- [ ] Record the verification date/context and the exact OpenAPI evidence for each applicable operation.
- [ ] Verify operation names, parameter names and types, required/optional status, defaults and constraints, response properties and types, and response shape.
- [ ] For F01, establish whether and how date-range filtering is documented.
- [ ] For F02, establish whether and how anomaly alerts are documented.
- [ ] For F03, establish whether a comparison operation or supported business-type inputs are documented; record any gap without assuming client-side composition.
- [ ] If `/docs` cannot be reached because of the known proxy/network issue, record the blocker and stop for direction. Do not troubleshoot unless separately authorized.

## Phase 3 — Write verified specifications

- [ ] Define or update `frontend/specs/api-types.ts` only with response types verified from OpenAPI.
- [ ] Define or update `frontend/specs/param-types.ts` only with parameters verified from OpenAPI.
- [ ] Write `frontend/specs/components.md` with approved frontend behavior, inputs, outputs, and unresolved decisions; do not describe unimplemented React work as complete.
- [ ] Update `frontend/specs/README.md` with artifact links, evidence references, verification context, and explicit scope boundaries.
- [ ] Mark unavailable or ambiguous API contracts as pending; do not create placeholder fields that could be mistaken for verified schemas.

## Phase 4 — Review and validate documentation

- [ ] Cross-check every API name, parameter, response property/type, default, and constraint against recorded running `/docs` / OpenAPI evidence.
- [ ] Cross-check F01/F02/F03 against the official assignment; separate assignment requirements from API capabilities.
- [ ] Confirm no React application, API-fetch, backend, test, dependency, or runtime configuration files were changed.
- [ ] Review README and specification diffs for scope, accuracy, and link correctness.
- [ ] Run `git diff --check` and report the final changed-file list and any unresolved blockers.
- [ ] Request human review/approval before committing. Do not commit or push before explicit authorization.
