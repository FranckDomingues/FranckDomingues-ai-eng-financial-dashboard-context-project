# Delivery 02 — Specification-Driven Development

## Milestone scope

**Status:** In Progress
**Working branch:** `feature/frontend-specs`

Define verified frontend-facing specifications for three financial-dashboard capabilities: date-range filtering, anomaly alerts, and B2B-versus-B2C comparison. This milestone prepares specification artifacts; it does not implement these capabilities.

The API contract is not yet established in this document. Before recording endpoint names, parameters, response properties, or TypeScript representations, verify them against the running backend's FastAPI OpenAPI documentation at `/docs` (and its OpenAPI schema as needed). Do not infer a contract from source filenames, existing UI labels, or milestone wording. Record the verification evidence and distinguish verified facts from requirements that remain unresolved.

## Functional requirements

### F01 — Date-range filtering

Specify how the frontend-facing date-range capability is expected to let a user select or provide a date range and obtain financial data for that range. First verify in the running backend documentation whether an applicable operation exists, its exact date parameter names and types, constraints/defaults, and response schema. Document any gap or ambiguity instead of assuming an API contract. No UI or request implementation is included in this milestone.

### F02 — Anomaly alerts

Specify the frontend-facing anomaly-alert capability and the information needed to represent an alert. Verify whether the running backend documents an applicable operation, its exact parameters, defaults/constraints, and response properties. Do not define alert thresholds, meanings, or fields that are not supported by verified requirements and API evidence. No alert display or API integration is included in this milestone.

### F03 — B2B versus B2C comparison

Specify the frontend-facing comparison between B2B and B2C financial data. Verify whether the running backend documents an applicable operation, how the business-type distinction is represented, its parameters, and its response schema. If the API does not provide a direct comparison operation, record the evidence and unresolved design decision; do not assume that separate endpoints or client-side aggregation are authorized. No comparison UI, API integration, or backend change is included in this milestone.

## Constraints and evidence rules

- Scope is specification work only. React implementation, frontend API-fetch integration, and backend modification are out of scope.
- Preserve the existing application architecture; no redesign or unrelated cleanup is authorized by this milestone.
- Verify all API operation names, parameter names/types, response properties/types, defaults, and constraints against the running backend's `/docs` / OpenAPI documentation before specifying them.
- Do not invent TypeScript interfaces or API schemas. Create `api-types.ts` and `param-types.ts` only when their contents can be grounded in the verified contract; unresolved items must remain explicitly marked unresolved.
- Cite the verification source and record when the contract was inspected. A code-only observation is not a substitute for the required running-backend OpenAPI verification.
- The historical frontend proxy 502 is documented in `verification.md`. Do not troubleshoot it unless it blocks the upcoming OpenAPI verification; report the blocker and wait for direction rather than changing network or application configuration.

## Deliverables

The planned frontend specification outputs are:

- `frontend/specs/api-types.ts` — API data types grounded in verified OpenAPI response schemas.
- `frontend/specs/param-types.ts` — request parameter types grounded in verified OpenAPI operations.
- `frontend/specs/components.md` — frontend component-level behavior and specification boundaries.
- `frontend/specs/README.md` — specification index, evidence/verification notes, and links to the other specification artifacts.

This initialization creates the official directory and its README index only. The TypeScript contract files and component specification are not populated until their requirements and API evidence have been verified.

## Acceptance criteria

1. Each of F01, F02, and F03 has a clear frontend-facing requirement, with assumptions and unresolved decisions called out.
2. Every API name, parameter, response property, type, default, and constraint included in a specification is traceable to the running backend's `/docs` / OpenAPI documentation.
3. The API and parameter type artifacts contain no invented fields or unsupported operations; if verification is blocked, the affected contract is marked pending and not fabricated.
4. `components.md` specifies only approved frontend behavior and does not imply that React components or API-fetch integration have been implemented.
5. The spec README identifies the milestone scope, links its artifacts, and records the evidence boundary.
6. No frontend application code, backend code, tests, dependencies, or runtime configuration is changed as part of this specification-only milestone.
7. The documentation is reviewed and `git diff --check` passes before requesting approval for any commit. No commit or push is authorized by this initialization request.
