# Frontend Specifications — Delivery 02

**Milestone:** Specification-Driven Development — Financial Dashboard
**Status:** In Progress
**Branch:** `feature/frontend-specs`

## Purpose and scope

This directory is the official output location for Delivery 02 frontend specifications. It will define verified requirements for date-range filtering (F01), anomaly alerts (F02), and B2B-versus-B2C comparison (F03).

This is a specification-only milestone. It does not implement React components, connect the frontend to API endpoints, or modify the backend.

## Specification artifacts

- [`api-types.ts`](./api-types.ts) — response contracts verified against the running backend's OpenAPI schemas, including facets, alerts, top categories, and grouped summary.
- [`param-types.ts`](./param-types.ts) — query parameter contracts verified against documented operations; frontend-specific controls are separately identified in the component specification.
- [`components.md`](./components.md) — specification-only component behavior, typed props, states, validation, edge cases, acceptance criteria, and remaining UI decisions for F01–F03.
- [Live API verification record](../../docs/delivery-02/api-verification.md) — OpenAPI evidence, observed behavior, source-inspection findings, and explicit evidence boundaries.
- [Delivery 02 scope and acceptance criteria](../../docs/delivery-02/SPECS.md).
- [Delivery 02 phased verification checklist](../../docs/delivery-02/TODO.md).

## Evidence and verification boundary

API operation names, parameters, response properties, types, defaults, and constraints recorded as API facts were checked against the running backend's `/docs` / OpenAPI documentation. Any additional behavior inferred from source inspection or live sample requests is explicitly labeled in the verification record and is not represented as an OpenAPI guarantee.

The baseline audit identifies a historical frontend `/api/metrics` proxy 502 with an unresolved TCP timeout cause. Direct backend `/docs` and `/openapi.json` access succeeded for this milestone; the historical proxy issue was not investigated or changed.

Delivery 02 remains specification-only: these contracts and UI descriptions do not imply that React components, API fetching, or backend changes have been implemented. Review the phased checklist in [`TODO.md`](../../docs/delivery-02/TODO.md) for completion status; final delivery review and human approval remain pending.
