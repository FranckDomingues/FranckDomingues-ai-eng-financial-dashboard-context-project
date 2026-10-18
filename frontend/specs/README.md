# Delivery 02 — Frontend Specification Index and Data Contract

**Milestone:** Specification-Driven Development — Financial Dashboard
**Status:** Documentation review requested; specification only
**Branch:** `feature/frontend-specs`

## Purpose and scope

This file is the authoritative index and feature-level data-contract summary for F01 (date-range filtering), F02 (anomaly alerts), and F03 (B2B-versus-B2C comparison). Component behavior and detailed acceptance criteria live in [`components.md`](./components.md); verified TypeScript shapes live in [`api-types.ts`](./api-types.ts) and [`param-types.ts`](./param-types.ts). These are specifications, not implemented React components or API-fetch behavior. No combined comparison endpoint is defined.

## Evidence and traceability

The API facts below were checked against the running backend's OpenAPI 3.1.0 document (`http://localhost:8000/openapi.json`, served via `http://localhost:8000/docs`) on 2026-10-18 UTC. Exact operation JSON Pointers, complete schema details, runtime observations, and read-only source-inspection findings are in [`api-verification.md`](../../docs/delivery-02/api-verification.md). The source inspection of backend behavior is evidence about the current implementation, not an OpenAPI guarantee. Requirements and presentation rules labeled **UI SPEC** are frontend decisions, not backend validation or promises.

The endpoint and response schemas referenced below are:

- `GET /api/metrics/facets` — `FacetsResponse` (`MetricsFacets` object).
- `GET /api/metrics` — direct `FinancialMovementsResponse` array of `FinancialMovement`.
- `GET /api/metrics/alerts` — direct `AlertsResponse` array of `AlertEntry` (`MetricsAlert`).
- `GET /api/metrics/categories/top` — direct `TopCategoriesResponse` array of `CategoryEntry` (`TopCategoryItem`).
- `GET /api/metrics/summary` — direct `SummaryResponse` array of `MetricsSummaryItem`.

All response interfaces and aliases above are declared in [`api-types.ts`](./api-types.ts). F01 request types are `DateRangeFilter` and `MetricsParams`; F02 uses `AlertsParams`; F03 uses `TopCategoriesParams` and `SummaryParams`. Exact JSON Pointer evidence and declared 200/422 response behavior are in the verification record rather than duplicated as if independently guaranteed here.

## Shared contract and conventions

- `OperationType`: `"income" | "outcome"`; `BusinessType`: `"B2B" | "B2C"`; `FinancialCategory`: `"suppliers" | "sales" | "operational" | "administrative" | "others"`; `MetricsGroupBy`: `"day" | "week" | "month"`.
- Date query names are `start_date` and `end_date`; each is optional and represented as a `YYYY-MM-DD` date string. **Source-verified, not OpenAPI semantics:** backend filtering is inclusive at both supplied ends (`create_date >= start_date`, `create_date <= end_date`), and either bound can be supplied independently. Out-of-facet and reversed-range handling is not established by OpenAPI.
- API amounts are numbers with no currency or locale metadata. **Existing frontend convention:** `formatCurrency` in `frontend/src/lib/financial-utils.ts` formats en-US USD with zero displayed fraction digits. Specs that accept `formatAmount` should reuse that formatter; this presentation convention must not be attributed to the API.
- The parent owns request lifecycle and supplies data, loading/error state, and callbacks. Feature response arrays distinguish a successful empty array from unavailable (`null` where props allow it), loading, and error states as described below.

## F01 — Date-range filtering

**Business objective:** Let a user select an optional date range and view financial movements for that range; permit start-only and end-only selection. This expresses the assignment in [`SPECS.md`](../../docs/delivery-02/SPECS.md), not a claim that filtering is implemented in the UI.

**Verified endpoints and request types:**

1. `GET /api/metrics/facets` (no query parameters) supplies dataset facet values and date bounds as `FacetsResponse`.
2. `GET /api/metrics` accepts `MetricsParams`: optional `start_date?: string`, `end_date?: string`, `category?: FinancialCategory`, `operation_type?: OperationType`. The date fields extend `DateRangeFilter`; category/operation are optional filters. OpenAPI documents no default for these filters. Date string formats are `date`; operation values are `income | outcome`; category values are the five `FinancialCategory` values above.

**Response shape:** `/api/metrics/facets` returns a `FacetsResponse` object with required `operation_types`, `business_types`, `categories`, `min_date`, and `max_date`. `/api/metrics` returns a direct array (`FinancialMovementsResponse`) of `FinancialMovement` records with required `create_date: string`, `amount: number`, `operation_type: OperationType`, `category: FinancialCategory`, and `business_type: BusinessType`. Neither endpoint returns a nested `data` property. In the verified OpenAPI schema, facet enum arrays and date properties are required and non-nullable; movement fields are likewise required and non-nullable.

**Component dependencies and user-facing behavior:** [`DateRangeFilter`](./components.md#f01--date-range-filter) takes controlled `DateRangeFilter` values and `FacetsResponse`, reports valid optional bounds via `onChange`, and does not fetch. The consumer applies those bounds to its movement request and keeps other selected filters. Parent controls facets loading/error and omits or disables the filter until facets are available; the filter has no invented facets-error response contract.

**States:** Parent-owned facets loading/failed states show loading/error or retry UI and do not present stale bounds as current. Ready facets show both date controls; an empty selection is a normal unbounded state. Invalid selection shows validation feedback and is not emitted. The consuming movement view distinguishes request loading, request error, successful empty `FinancialMovementsResponse` (`[]`), and successful nonempty movements; those consumer states do not add props to the specified filter.

**Edge cases and expected UI behavior:**

- A single date bound is valid: send only that optional query parameter; do not force the other bound.
- Reversed dates are rejected with a validation message; do not silently reorder them or emit a request.
- A date outside `FacetsResponse.min_date`–`max_date` is rejected as a UI decision; equal min/max permits only that date.
- A successful movement response of `[]` is empty data, not a loading or failed request.

**Acceptance criteria:** Both bounds are controlled and optionally clearable; valid complete/one-sided ranges use exact snake_case query names; malformed, out-of-range, and reversed dates produce validation feedback and are not emitted; parent owns request lifecycle and distinct result states. See `DateRangeFilter` acceptance criteria for the component-level list.

## F02 — Anomaly alerts

**Business objective:** Show alert periods, outcome totals, historical baselines, and the increase ratio, with a user-selectable threshold and the selected dashboard date range.

**Verified endpoint and request type:** `GET /api/metrics/alerts` uses `AlertsParams`: optional `threshold?: number`, `group_by?: MetricsGroupBy`, `start_date?: string`, `end_date?: string`, and `business_type?: BusinessType`. OpenAPI constraints/defaults: `threshold` minimum 0, default 0.3, no documented maximum; `group_by` enum day/week/month, default month; date and business filters optional, no defaults. `BusinessType` is `B2B | B2C`.

**Response shape:** Direct `AlertsResponse` array of `AlertEntry`, each with required numeric `outcome_total`, `baseline_average`, `increase_ratio` and required string `period`. All four properties are required and non-nullable; no other alert property is assumed. OpenAPI declares 200 and 422 for this parameterized operation; consult the verification record for schema references.

**Component dependencies and user-facing behavior:** [`AnomalyAlertsPanel`](./components.md#f02--anomaly-alerts) receives typed parameters, selected `DateRangeFilter`, response/loading/error state, and change/retry callbacks; it renders [`AlertTable`](./components.md#alerttable) for nonempty success. It displays ratio as `increase_ratio * 100` percent. The current backend ratio formula and its positive-baseline condition are source inspection, not a schema guarantee. Monetary presentation uses the existing frontend formatter described above.

**Threshold distinction:** **OpenAPI fact:** minimum 0, default 0.3, no maximum documented. **UI SPEC:** restrict user-entered values to 0.01–1.0, use UI default 0.3, validate finite numeric input, and explicitly send the chosen threshold rather than relying on the server default. These UI restrictions are not API restrictions.

**States:** Loading shows a loading/skeleton state; error shows an error and optional retry without presenting stale results as current; `null` is not a successful empty response; `[]` shows an explicit no-alert message; a nonempty array renders the table. Thus a valid empty result is distinct from failure.

**Edge cases and expected UI behavior:**

- Threshold 0 is allowed by the OpenAPI contract but outside the specified UI control range; do not state that the backend rejects values above 1.
- Non-finite, empty, or out-of-UI-range input is not emitted; every committed valid change explicitly includes `threshold`.
- One-sided dates remain valid and omit the absent query key.
- Zero or negative `increase_ratio` is not clamped absent a separate UI requirement; convert ratio to percent only for display.

**Acceptance criteria:** Use exactly the verified alert fields; explicitly emit selected threshold and synchronized optional dates; render distinct loading/error/null/empty/nonempty states; successful empty state is explicit; table shows four verified columns and applies the shared amount formatter.

## F03 — B2B-versus-B2C comparison

**Business objective:** Compare income categories and period income for B2B and B2C over one shared optional date range, without implying an API-provided combined result.

**Verified endpoints and request parameters:** There is no verified combined B2B/B2C endpoint. Compose four existing calls, with matching optional date bounds:

- Two `GET /api/metrics/categories/top` calls. Each uses `TopCategoriesParams` with `operation_type: "income"`, `limit: 5`, and one `business_type` (`"B2B"` for one call, `"B2C"` for the other); `start_date` and `end_date` are passed consistently when selected. OpenAPI allows category operation `income | outcome`, limit 1–20 (default 5), optional date filters, and optional single `BusinessType`; there is no combined business-type value.
- Two `GET /api/metrics/summary` calls, one with `business_type: "B2B"`, the other with `business_type: "B2C"`; both use identical date bounds and a common `SummaryParams.group_by` (day/week/month, default month). The operation also has optional `category?: FinancialCategory` and `operation_type?: OperationType`; for the specified unfiltered income summary, omit those optional filters. `SummaryParams` models these query fields; `MetricsParams` describes `/api/metrics` only and must not be misused as a summary query type.

**Response shapes:** Each category request returns a direct `TopCategoriesResponse` array of `CategoryEntry` (`category: FinancialCategory`, `operation_type: OperationType`, `total_amount: number`); all fields are required and non-nullable. Each summary request returns a direct `SummaryResponse` array of `MetricsSummaryItem` (`period: string`, `income: number`, `outcome: number`, `net: number`); all fields are required and non-nullable. No nested list, combined response, or business field on each item is assumed.

**Aggregation and presentation:** For each business group, compute `groupIncome` as the sum of that group's returned summary `income` buckets. **Source-verified, not an OpenAPI guarantee:** each movement is assigned once to a grouping bucket; returned bucket values are rounded to cents, so summed response totals can differ slightly from raw movement sums. For each returned income category, share is `total_amount / groupIncome * 100`. **UI SPEC:** a returned, successfully loaded summary with an established numeric `groupIncome === 0` is confirmed zero income: display numeric zero for the total and display category share as **N/A** (never divide by zero). Do not use the top-five subtotal or other group's total as denominator. A category absent from a limited top-five array is not a known zero and must not be synthesized as a row.

**Components and user-facing behavior:** [`B2BvsB2CComparisonPage`](./components.md#f03--b2b-vs-b2c) synchronizes the date range, accepts parent-provided request data, and composes separate [`BusinessCategoryPanel`](./components.md#businesscategorypanel) panels plus exactly one [`IncomeComparisonChart`](./components.md#incomecomparisonchart). Each panel is independently empty-capable. The chart aligns period strings, uses income only, and represents a period missing from one array as an absent/gap value with an accessible note—not a factual zero. Its series/legend and no-data messaging identify B2B and B2C separately.

**States — UI SPEC, not OpenAPI guarantees:** Parent-level loading does not present partial data as a completed comparison; an error is never described as an empty group or zero. Successful category arrays of `[]` display an independent per-business no-category state. A successful summary array of `[]` is valid no-period data, but by itself does **not** establish that group income is zero: show an explicit no-income-data/no-periods state, not a fabricated numeric zero. A returned summary with one or more numeric `income: 0` values and a computed total of zero is confirmed zero income: display numeric `0`; category shares are N/A. A failed request remains an error even if the other group's successful summary contains zero. Do not present a completed comparison while required data is still loading or failed. Keep B2B and B2C separately identified in the chart legend/series and in any empty/no-data state. If one group's successful summary has no income periods while the other does, retain the available series and show an explicitly identified no-data/gap state for the group with no periods; do not fabricate zero values. This partial-series UI behavior is a specification decision and may require product/design confirmation, as noted in `components.md`.

**Edge cases and expected UI behavior:**

- Confirmed zero group income from successfully returned numeric summary value(s): display numeric zero; show category amounts and N/A shares; never divide by zero.
- Successful empty summary (`[]`) without numeric evidence of a zero total: display explicit no-period/no-income-data state, not zero.
- Failed summary request: display an error state, never a zero or empty-success state.
- Empty top-five list for one business: show that group's empty message without suppressing the other group's data.
- Category missing from top five: do not synthesize zero or an empty category row.
- One summary has no periods: retain both B2B/B2C identities in the chart; display the available series and an explicitly labeled no-data/gap state for the other, not zero; do not call a failed request empty.
- A request error is distinct from a valid empty response or successful zero; do not turn errors into zero income.
- Bucket-rounding may introduce small differences between summed API buckets and raw source movement totals; do not claim exact raw-total equality.

**Acceptance criteria:** Make exactly two business-specific category calls and two separate business-specific summary calls using the same date bounds; derive each denominator only from its own returned summary income; calculate category shares as documented; treat confirmed numeric zero, successful empty/no-period data, missing category/period, and failed requests distinctly; retain visible B2B and B2C chart identities in populated and no-data states; show two panels and exactly one aligned chart; add no endpoint or response fields. Detailed component criteria remain in `components.md`.

## Detailed artifacts and review status

- [`components.md`](./components.md) — props, responsibilities, interaction, validation, conditionals, edge cases, and component-level acceptance criteria.
- [`api-types.ts`](./api-types.ts) and [`param-types.ts`](./param-types.ts) — contract-backed TypeScript types; see `api-verification.md` for OpenAPI provenance.
- [`api-verification.md`](../../docs/delivery-02/api-verification.md) — authoritative live-schema evidence, source-inspection boundaries, observations, and remaining evidence limitations.
- [`SPECS.md`](../../docs/delivery-02/SPECS.md) — milestone assignment and scope; [`TODO.md`](../../docs/delivery-02/TODO.md) — completion/review checklist.

The historical frontend proxy 502 remains unresolved and was not investigated for this milestone; direct backend `/docs` and `/openapi.json` access succeeded. This delivery remains specification-only. Human review is requested; no application implementation, commit, push, or merge is authorized by this document.