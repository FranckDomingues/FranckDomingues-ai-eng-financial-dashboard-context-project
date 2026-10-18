# Frontend Component Specifications — Delivery 02

Status: **specification only**. This document defines proposed UI contracts for F01–F03; it does not claim that these React components or API-fetch behavior are implemented. API guarantees below are limited to the verified contracts in [`api-types.ts`](./api-types.ts), [`param-types.ts`](./param-types.ts), and [`../../docs/delivery-02/api-verification.md`](../../docs/delivery-02/api-verification.md). Requirements and UI choices are labeled separately from backend/API behavior.

## Shared conventions and data composition

- Components are controlled/presentational specifications: a parent owns request lifecycle and supplies the current data, loading/error state, and callbacks. No fetch implementation or unverified endpoint is prescribed here.
- Date bounds use `DateRangeFilter` (`start_date?`, `end_date?`) as ISO `YYYY-MM-DD` strings. The facets endpoint returns `FacetsResponse.min_date` and `.max_date`. Backend source filters dates inclusively (`>= start_date`, `<= end_date`); this is source-verified, not an OpenAPI constraint.
- API numeric amounts have no currency or locale metadata. Existing dashboard code provides the presentation convention: `formatCurrency` in `frontend/src/lib/financial-utils.ts` formats as en-US USD with no decimal places. Components that accept `formatAmount` should receive/use that existing formatter unless product requirements direct otherwise; the displayed currency is a frontend convention, not an API fact.

## F01 — Date Range Filter

### `DateRangeFilter`

**Responsibility:** Controlled start/end date inputs for choosing an optional date range. Emit a valid `DateRangeFilter` to the parent; do not fetch data itself.

**Typed props:**

```ts
interface DateRangeFilterProps {
  value: DateRangeFilter;
  facets: FacetsResponse;
  disabled?: boolean;
  onChange: (value: DateRangeFilter) => void;
  onValidationChange?: (message: string | null) => void;
}
```

Imports use `DateRangeFilter` from `param-types.ts` and `FacetsResponse` from `api-types.ts`. The value may omit either or both bounds. `facets.min_date` and `facets.max_date` provide the input bounds for the available dataset; this is a UI choice, because the API schema does not declare a `minimum`/`maximum` for the date query parameters.

**Data dependencies:** `FacetsResponse` and the parent's current `DateRangeFilter`. Facets are metadata for bounds, not an additional date-filter request contract.

**User interaction:** User edits either date input. The component reports both current optional bounds to the parent. A range with only a start or only an end is valid and can be submitted as a one-sided filter; both query parameters are independently optional. Clearing an input removes that bound.

**Conditional rendering and states:**

- While facets are loading, the parent owns the loading state and may omit the filter or render it disabled until it can supply `FacetsResponse`; this component's props require facets once mounted.
- If loading facets fails, the parent owns the error/retry presentation and must omit or keep the filter disabled rather than reuse stale facets as current. The filter itself has no facets-loading/error props or API-fetch responsibility; this is a UI composition decision, not a facets endpoint error-shape contract.
- A successfully loaded facets response is the normal ready state, including when `min_date === max_date` (only that date is selectable). No data results after applying a valid range are handled by the dashboard consumer, not by the filter.
- When `disabled`, inputs cannot be changed.
- Normal state shows both date controls and the selected/empty values.
- Validation state presents the message associated with the invalid selection without emitting it as a valid range.
- There is no successful empty-data state intrinsic to this input; the dashboard consuming the range owns its result-empty state.

**Validation and edge cases:**

- Each non-empty value must be a valid calendar date in `YYYY-MM-DD` form and fall within the facets' `min_date`–`max_date` range (inclusive, as a UI bound decision).
- Reject a reversed range (`start_date > end_date`): report a validation message and do not publish the invalid range. Do not silently swap endpoints.
- One-sided ranges are allowed; do not require both dates.
- If facets have equal minimum and maximum dates, that date is the only selectable date. API date-bound semantics are source-verified as inclusive.

**Effect on existing dashboard data:** On a valid change, the parent applies the optional bounds consistently to the dashboard data it owns. Do not assert a particular refresh/debounce strategy; that is an implementation decision. Invalid input must not replace the last valid range or cause an invalid request.

**Acceptance criteria:**

1. Both date controls are populated from the controlled optional value and bounded by `facets.min_date`/`facets.max_date`.
2. Either bound can be selected, cleared, or submitted alone.
3. Valid complete or one-sided ranges are emitted with snake_case query keys.
4. Malformed, out-of-bounds, and reversed ranges are surfaced as validation errors and are not emitted.
5. The dashboard parent receives changes only through the declared callback; this spec does not add fetching behavior.

## F02 — Anomaly Alerts

### `AnomalyAlertsPanel`

**Responsibility:** Display anomaly alert results, threshold control, and loading/error/empty states. The parent owns the request and supplies the exact selected query parameters and result state.

**Typed props:**

```ts
interface AnomalyAlertsPanelProps {
  alerts: AlertsResponse | null;
  params: AlertsParams;
  dateRange: DateRangeFilter;
  loading: boolean;
  error: string | null;
  onParamsChange: (params: AlertsParams) => void;
  onRetry?: () => void;
}
```

`AlertsResponse` is the direct `AlertEntry[]` response. `AlertsParams` is the query contract. `dateRange` is passed separately so the component can keep date controls aligned with the dashboard's F01 selection; when parameters are changed, its `start_date`/`end_date` must reflect that range (omitting absent sides).

**Data dependencies:** `AlertEntry` fields (`period`, `outcome_total`, `baseline_average`, `increase_ratio`), `AlertsResponse`, `AlertsParams`, and shared `DateRangeFilter`. No other alert fields are assumed.

**User interaction:** User changes the numeric threshold. The UI range is **0.01–1.0**, step/precision appropriate for decimal ratios, and default is **0.3**. Every committed selection explicitly populates `threshold` in the emitted `AlertsParams`; it must not rely on the API default. The request params also carry the selected date range and `group_by`/`business_type` when selected. `group_by` may be day/week/month. Retry invokes `onRetry` when provided.

**API/UI distinction:** The live OpenAPI contract accepts `threshold >= 0`, defaults to `0.3`, and documents no maximum. The stricter 0.01–1.0 range and default are frontend UI decisions; the selected threshold is nevertheless explicitly sent. The backend computes `increase_ratio` as `(current outcome - historical baseline) / historical baseline`; it is a ratio, so percent display is `increase_ratio * 100` with a percent sign. This display conversion is based on source inspection, not a schema format annotation.

**Conditional rendering and states:**

- `loading`: show a loading indicator/skeleton and do not announce a stale empty state.
- `error !== null`: show the error and optional retry action; do not present stale results as current.
- Loaded `alerts === null`: treat as not-yet-supplied state, not as an empty successful result.
- Loaded `alerts.length === 0`: show an explicit message, e.g. **“No anomalies found for the selected date range and threshold.”**
- Loaded nonempty alerts: render `AlertTable` with one row per alert.

**Validation and edge cases:** The threshold value sent through `onParamsChange` must be numeric, finite, and within the UI range 0.01–1.0. Do not emit an invalid/empty numeric value. Keep alert results distinct from not-yet-loaded (`null`), loading, error, and successful empty-array states. Selected dates may be one-sided; absent bounds stay omitted.

**Acceptance criteria:** The panel keeps the selected F01 dates, explicitly emits the chosen threshold, and displays distinct loading/error/empty/normal states; successful empty results always have an explicit message.

### `AlertTable`

**Responsibility:** Render alert data in a semantic table with exactly the required data columns.

**Typed props:**

```ts
interface AlertTableProps {
  alerts: AlertEntry[];
  formatAmount: (amount: number) => string;
  formatPeriod?: (period: string) => string;
}
```

**Columns:** `period`, `outcome_total`, `baseline_average`, and `increase_ratio`. The ratio is shown as a percentage (`ratio × 100`); outcome and baseline use `formatAmount`, supplied from the established dashboard `formatCurrency` convention (en-US USD, zero displayed fraction digits). The API supplies no currency symbol/locale; this is a presentation convention, not a response guarantee.

**Data dependencies:** A successfully loaded, non-empty `AlertEntry[]`, with no fields beyond the four verified alert properties.

**User interaction:** Read-only table; no row action is specified. Sorting, filtering, and row selection are not implied.

**Conditional rendering:** Render only when the parent has a successfully loaded, nonempty `alerts` array. The panel owns loading/error/empty-state selection; the table must not render a fake row when given no alerts.

**Validation and edge cases:** Accept only `AlertEntry` records. Threshold validation belongs to `AnomalyAlertsPanel`, which must ensure the value is numeric, finite, and within the UI range before emitting parameters; the table itself receives no threshold prop. Preserve API snake_case field names at the boundary. Ratio values can be negative or zero according to the numeric response type; do not clamp without a separate product rule. An API response's empty array is distinct from loading or error.

**Table acceptance criteria:** A successful nonempty input produces one table row per alert, with the four specified columns, percentage conversion, and injected amount formatting; no invented fields or row actions appear.

**Acceptance criteria:**

1. Threshold control displays default 0.3 and restricts user selections to 0.01–1.0.
2. The selected threshold is explicitly present in each changed request-parameter value.
3. Selected one-sided or two-sided dates are propagated as `start_date`/`end_date`; absent values remain omitted.
4. Loading, error, empty, and nonempty states are distinct; empty state has explicit explanatory text.
5. A nonempty result table contains the four columns and displays `increase_ratio` as a percentage and monetary numbers via the supplied formatter.
6. No extra API response fields or endpoint are assumed.

## F03 — B2B vs B2C

### `B2BvsB2CComparisonPage`

**Responsibility:** Page-level composition for the comparison feature. Present separate B2B and B2C category panels, followed by one shared income comparison chart. The page accepts already-loaded data and state; it does not imply a combined comparison endpoint.

**Typed props:**

```ts
interface B2BvsB2CComparisonPageProps {
  dateRange: DateRangeFilter;
  facets: FacetsResponse;
  b2bCategories: TopCategoriesResponse | null;
  b2cCategories: TopCategoriesResponse | null;
  b2bSummary: SummaryResponse | null;
  b2cSummary: SummaryResponse | null;
  loading: boolean;
  error: string | null;
  onDateRangeChange: (range: DateRangeFilter) => void;
  onRetry?: () => void;
  formatAmount: (amount: number) => string;
}
```

These response aliases and fields are the verified contracts in `api-types.ts`: `TopCategoriesResponse` is an array of `CategoryEntry` (`category`, `operation_type`, `total_amount`); `SummaryResponse` is an array of `MetricsSummaryItem` (`period`, `income`, `outcome`, `net`).

**Data dependencies:** Both category responses, both summary responses, selected shared date range, `FacetsResponse` for the shared date controls, and loading/error state supplied by the parent. This page does not request a dedicated comparison payload.

**Data dependencies and allowed composition:** There is no verified combined B2B/B2C comparison endpoint. The approved frontend composition is two `/api/metrics/categories/top` requests, each with `operation_type: "income"`, `limit: 5`, the same optional dates, and the corresponding `business_type` (`"B2B"` or `"B2C"`); plus two `/api/metrics/summary` requests with the same date bounds and respective business type, using one common `group_by` (normally `month` for chart presentation). `group_by` is a summary query parameter, and `MetricsSummaryItem` is now included as a verified response type. This is frontend composition of existing API contracts, not a new endpoint or combined response schema.

The summary request type is `SummaryParams` from `param-types.ts` (not `MetricsParams`, which belongs to `GET /api/metrics`). It carries optional `start_date`, `end_date`, `group_by`, `category`, `operation_type`, and one `business_type`; for this comparison use identical date bounds and grouping and omit category/operation filters to obtain the group's overall income series.

For each business group with a nonempty successful summary response, the denominator is the sum of its returned summary `income` values. For an income category with a returned category total, percentage is `total_amount / groupIncome * 100`. A computed numeric total of exactly zero is confirmed zero income; an empty summary array has no numeric evidence and must not be reduced to a fabricated zero. Summary aggregation is source-verified to place each movement in one bucket; period amounts are rounded to two decimals. Thus displayed group totals are safe from bucket double counting but may differ slightly from raw movement totals due to rounding/floating-point arithmetic. The existing backend tests do not assert this exact aggregation-total invariant.

**User interaction:** The page includes the shared `DateRangeFilter` and invokes `onDateRangeChange`. Both groups' category and summary data must represent the same selected date bounds. No per-business date selectors are specified.

**Conditional rendering:**

- `loading`: show page-level loading UI; do not show partial results as a completed comparison.
- `error !== null`: show a page-level error and optional retry action; do not describe failed group data as empty.
- When loaded, render the B2B and B2C panels independently so a genuine empty category response for one group can have its own empty state.
- Render exactly one income comparison chart below both panels, using the two summary series and shared date range. The date filter uses the supplied facets and `onDateRangeChange` callback.

**Validation and edge cases:** Do not show a successful comparison if any of the four required datasets is still `null`; route such state through loading/error handling. Both category and summary inputs must correspond to the same optional date bounds and business filter. Keep one group's successful empty data separate from the other group's data. A computed numeric zero from a nonempty summary is valid data; an empty summary indicates no period data and must not be treated as numeric zero.

**Acceptance criteria:** The page synchronizes one date range across both groups, distinguishes loading/error from successful group-level emptiness, renders both panels and exactly one chart in the required order when loaded, and only composes existing endpoints/contracts.

### `BusinessCategoryPanel`

**Responsibility:** Show the top income categories for one business type, with category name, amount, and share of that group's income.

**Typed props:**

```ts
interface BusinessCategoryPanelProps {
  businessType: BusinessType;
  categories: TopCategoriesResponse;
  groupIncome: number | null;
  formatAmount: (amount: number) => string;
}
```

The parent supplies entries scoped to the indicated `businessType`; `CategoryEntry` itself has no business-type field. Only entries with `operation_type === "income"` are in scope. Render no more than five returned categories. Percentage is computed using the corresponding business group's summary income, not the other group's total or the top-five subtotal.

**Conditional rendering and edge cases:**

- If the successful categories array is empty, show a per-business empty message (for example, “No income categories for B2B in this date range.”) without suppressing the other panel.
- If `groupIncome === 0` based on a nonempty successful summary, display the numeric group total as `0` and category amounts, but show the percentage as **N/A**; never divide by zero or imply a meaningful percentage.
- If `groupIncome === null` because its summary request is not yet successful or the successful summary array is empty, show the corresponding loading/error/no-income-data state; do not display `0` or calculate category shares. The page owns the request state and this is a UI distinction, not an API response field.
- If a category is absent from a top-five response, do not infer its total is zero. It means only that the API did not return it in that limited result. Do not insert a zero-valued category row.
- If `groupIncome` is positive, compute the percentage from the returned `total_amount` as described above. Round only for display; preserve the numeric value for calculations.
- Format category amounts with `formatAmount`; the parent should supply the existing dashboard `formatCurrency` convention (en-US USD, zero displayed fraction digits), not infer currency metadata from the API.

**User interaction:** Read-only panel; no per-category action is specified. Date changes are handled by the page-level shared filter, not by an individual panel.

**Validation:** Display only `income` entries for the selected panel and limit the rendered list to at most five items. The parent supplies `groupIncome` as a numeric sum from a nonempty successful matching summary, or `null` when no summary total is established (including a successful empty array). Do not substitute zero for `null`. A numeric zero total is retained as zero and uses N/A shares.

**Acceptance criteria:** The panel identifies its B2B/B2C group, shows category/amount/share for no more than five valid income entries, independently renders its empty state, and shows N/A rather than dividing by zero when the group's real total is zero.

### `IncomeComparisonChart`

**Responsibility:** Render one chart below the two category panels comparing B2B and B2C income over matching periods.

**Typed props:**

```ts
interface IncomeComparisonChartProps {
  b2bSummary: SummaryResponse;
  b2cSummary: SummaryResponse;
  formatAmount: (amount: number) => string;
}
```

**Data dependency:** The `income` and `period` properties only. The two summary arrays use the same `group_by` and date bounds. Align points by period string; do not treat a period absent from one series as a verified zero. Represent a missing point as a gap/absent value, with a legend or accessible note that it was not returned for that group. Monetary axis/tooltip values use `formatAmount`.

**Zero/empty behavior:** A present period with `income: 0` is confirmed numeric zero and must be shown as zero. A nonempty summary whose income values sum to zero also establishes numeric group total zero. An empty summary array is not itself a data error, but supplies no numeric total; render that group's explicit no-period/no-income-data state rather than zero. It is distinct from a missing category in a top-five response.

**User interaction:** Read-only comparison chart; no chart selection/drill-down interaction is specified.

**Conditional rendering:** Render one chart only after both summary inputs are successfully available. If both arrays contain no periods, render an explicit no-periods message in place of plotted series. If only one group has periods, retain the available series and represent the other as absent/gaps with an accessible note, not as zero. The current requirement does not specify partial chart rendering for this case; confirm the intended UI behavior before treating this partial-series policy as final. Page-level loading/error handling remains the page's responsibility.

**Zero, no-data, and error distinction — UI SPEC, not OpenAPI guarantees:** A successfully returned summary containing numeric `income: 0` is confirmed zero for that period and must be plotted/displayed as numeric zero. A successful empty summary (`[]`) has no numeric income evidence; show an explicit no-period/no-income-data state for that identified business group, not zero. A failed summary request is an error and must never be converted to an empty success or zero. Preserve B2B and B2C identities in the chart legend/series and in any no-data message, including when one group has no periods.

**Validation:** Both inputs must be summary arrays representing the same selected date range and same grouping granularity. Use only `period` and numeric `income`; preserve missing-series periods as gaps rather than zero and do not mutate the supplied arrays.

**Acceptance criteria:** The chart aligns matching periods, presents separately identified B2B and B2C income series below the panels, displays a real numeric zero distinctly from a missing point or empty series, keeps a failed request in the page error state, uses the shared amount formatter, and gives an explicit per-group no-periods state without inventing values.

**Acceptance criteria for F03:**

1. A shared date-range filter controls both business groups and can represent one-sided ranges.
2. B2B and B2C have distinct category panels; each shows at most five income categories with category, total amount, and percentage of that group's summary income.
3. Panel empty messages are independent per business type; page-level loading/error is distinguishable from a successful empty group.
4. Zero group income yields N/A percentages without division by zero.
5. Missing top-five categories or summary periods are not fabricated as verified zero values.
6. Exactly one income comparison chart appears below both panels and uses aligned periods from same-range summary data.
7. The specification uses existing category/summary contracts only and does not add or assume a combined endpoint.

## Cross-feature acceptance and unresolved items

- All component inputs and outputs are typed against existing verified API contracts and frontend parameter types; no implementation is claimed.
- API date bounds are optional independently and source-filtered inclusively. Facet-bound enforcement and rejection of reversed dates are frontend decisions.
- The threshold UI restriction (0.01–1.0), explicit request value, and 0.3 UI default are frontend decisions; API allows values from zero without a documented maximum.
- Alert ratio-to-percent conversion follows the implementation's ratio calculation. The API has no currency metadata; the existing dashboard convention is `formatCurrency` (en-US USD, zero displayed fraction digits), as noted above.
- The F03 requirement specifies one chart with both groups but does not explicitly define chart behavior when only one summary series has periods. The current chart spec keeps absent periods as gaps and retains the available series; confirm this partial-data presentation with product/design before implementation.
- Summary income sums are source-verified to avoid period-bucket double counting, but no existing test asserts the invariant and cents rounding may yield small aggregate differences.
- Existing API contracts provide top-five category rows and summary series but no cross-business combined response. Missing category/period values are not treated as factual zeroes.
