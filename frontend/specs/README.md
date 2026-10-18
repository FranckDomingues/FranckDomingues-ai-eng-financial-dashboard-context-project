# Frontend Specifications — Delivery 02

**Milestone:** Specification-Driven Development — Financial Dashboard
**Status:** In Progress
**Branch:** `feature/frontend-specs`

## Purpose and scope

This directory is the official output location for Delivery 02 frontend specifications. It will define verified requirements for date-range filtering (F01), anomaly alerts (F02), and B2B-versus-B2C comparison (F03).

This is a specification-only milestone. It does not implement React components, connect the frontend to API endpoints, or modify the backend.

## Specification artifacts

- [`api-types.ts`](./api-types.ts) — intended API response types, to be written only after verification against the running backend's `/docs` / OpenAPI schemas. **Not yet created; contract verification is pending.**
- [`param-types.ts`](./param-types.ts) — intended request parameter types, to be written only after verification against documented operations. **Not yet created; contract verification is pending.**
- [`components.md`](./components.md) — intended component-level behavior and requirements. **Not yet created; feature behavior and API evidence are pending.**
- [Delivery 02 scope and acceptance criteria](../../docs/delivery-02/SPECS.md).
- [Delivery 02 phased verification checklist](../../docs/delivery-02/TODO.md).

## Evidence and verification boundary

All API operation names, parameters, response properties, types, defaults, and constraints must be checked against the running backend's `/docs` / OpenAPI documentation before they are recorded as API facts. Source code or milestone wording alone is not sufficient evidence. The verification record should identify the inspection context and cite the observed documentation/schema.

The baseline audit identifies a historical frontend `/api/metrics` proxy 502 with an unresolved TCP timeout cause. The OpenAPI verification path has not yet been tested in this milestone. If the issue blocks access to the backend documentation, record the blocker and wait for direction; do not troubleshoot it without authorization.

Until verification and requirements review are complete, this index deliberately defines no TypeScript interfaces and does not assert any API schema.
