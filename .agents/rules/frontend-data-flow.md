# Frontend Data Flow and Integration Rules

These are instructions for future coding-agent work. They document the verified baseline and do not authorize unrelated redesigns or fixes.

## R-ARCH-01 — Preserve the existing dashboard data-flow split

- **Scope:** Frontend financial movement loading, calculations, and dashboard component inputs.
- **Supporting finding:** F-ARCH-01.
- **Repository evidence:** `frontend/src/App.tsx:15–17,30–34` fetches movements and invokes calculations; `frontend/src/lib/financial-utils.ts:21–67` contains KPI and monthly aggregation; `frontend/src/components/dashboard/kpi-row.tsx:5–11` declares typed metric props and begins the consuming component.
- **Instructions:** When changing this flow, keep page-level fetch/loading orchestration in `App.tsx`, keep financial aggregation in `financial-utils.ts`, and pass the existing typed values to dashboard components. Make only the changes required by the task.
- **Boundaries and assumptions:** This describes current organization, not a mandate to refactor. Do not introduce service/state layers, duplicate calculations, or assume every dashboard calculation belongs in the page component.
- **Verification:** For relevant changes, inspect the resulting data flow and run the applicable frontend tests and build; verify existing component inputs and calculations remain consistent.

## R-ARCH-02 — Verify frontend-to-backend integration at the proxy boundary

- **Scope:** Changes to API routing, the Vite proxy, Compose service networking, or frontend/backend data loading.
- **Supporting finding:** F-ARCH-02.
- **Repository evidence:** `frontend/vite.config.ts:9–16` proxies `/api` to `http://backend:8000`; `docker-compose.yml:2–22` defines frontend/backend services. `verification.md`, “Runtime diagnostics” and “Cause assessment,” records a frontend proxy 502 and TCP timeout while direct backend requests returned 200.
- **Instructions:** For a relevant change, test direct backend access and a request through the frontend `/api` proxy. Report these results separately from unit tests and frontend root-page availability.
- **Boundaries and assumptions:** The recorded 502/TCP timeout is historical and its root cause is **unresolved**. Do not state that it is fixed, infer a cause (including Codespaces forwarding), or claim end-to-end success from partial checks alone.
- **Verification:** Record the exact paths checked and observed outcomes. A successful direct backend check does not replace proxy-path verification.
