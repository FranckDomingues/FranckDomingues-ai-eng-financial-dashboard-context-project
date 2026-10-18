# Delivery 02 — Live API Verification

## Verification context

- **Verification date:** 2026-10-18 (UTC)
- **Backend:** running via the repository's existing Docker Compose development service; no restart or configuration change was needed.
- **Runtime checks:** `GET http://localhost:8000/health` returned HTTP 200; `/docs` returned HTTP 200 and served Swagger UI titled “Financial Metrics API”; `/openapi.json` returned HTTP 200.
- **OpenAPI version:** 3.1.0, title `Financial Metrics API`.
- **Authoritative evidence:** live `http://localhost:8000/openapi.json`, inspected through the Swagger UI at `http://localhost:8000/docs`. Route references below use OpenAPI JSON Pointer paths.
- **Evidence labels:** **VERIFIED** means stated by the live OpenAPI document; **OBSERVED** means returned by a sample request during this inspection; **SPEC DECISION** means a requested frontend behavior/constraint, not a backend contract; **UNVERIFIED** means evidence or behavior is not established.

All inspected response schemas are JSON. For parameterized operations, OpenAPI declares 200 and 422 responses; the 422 response references `HTTPValidationError`. `/api/metrics/facets` declares 200 only. No additional error-response contract is declared for these operations in the inspected schema.

## Verified endpoint contracts

### `GET /api/metrics/facets`

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1facets/get`

- No query parameters.
- HTTP 200 response references `#/components/schemas/MetricsFacets`.
- `MetricsFacets` is an object with all properties required:
  - `operation_types`: array of strings, enum `income | outcome`.
  - `business_types`: array of strings, enum `B2B | B2C`.
  - `categories`: array of strings, enum `suppliers | sales | operational | administrative | others`.
  - `min_date`, `max_date`: strings, format `date`.
- No nullable fields are declared.
- OpenAPI declares no 422 response for this operation.

**OBSERVED — sample:** HTTP 200 returned `min_date: "2025-10-02"` and `max_date: "2026-09-28"` at inspection time, with arrays for the facets. These dates are sample values, not stable API guarantees.

### `GET /api/metrics/alerts`

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1alerts/get`

All query parameters are optional:

| Name | OpenAPI type/format | Constraint/default |
|---|---|---|
| `threshold` | number | minimum `0`, default `0.3`; no maximum documented |
| `group_by` | string enum | `day | week | month`; default `month` |
| `start_date` | nullable string, format `date` | no default declared; optional |
| `end_date` | nullable string, format `date` | no default declared; optional |
| `business_type` | nullable string enum | `B2B | B2C`; no default declared; optional |

- HTTP 200 response is an array whose items reference `#/components/schemas/MetricsAlert`.
- `MetricsAlert` is an object; all fields are required and non-nullable:
  - `period`: string.
  - `outcome_total`: number.
  - `baseline_average`: number.
  - `increase_ratio`: number.
- HTTP 422 response references `#/components/schemas/HTTPValidationError`.

**OBSERVED — sample:** a request using defaults returned HTTP 200 and an array (four entries in the observed response). A request with `threshold=-0.1` returned HTTP 422. These outcomes do not expand the documented schema or imply a threshold maximum.

### `GET /api/metrics/categories/top`

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1categories~1top/get`

All query parameters are optional:

| Name | OpenAPI type/format | Constraint/default |
|---|---|---|
| `operation_type` | string enum | `income | outcome`; default `outcome` |
| `limit` | integer | minimum `1`, maximum `20`, default `5` |
| `start_date` | nullable string, format `date` | no default declared; optional |
| `end_date` | nullable string, format `date` | no default declared; optional |
| `business_type` | nullable string enum | `B2B | B2C`; no default declared; optional |

- HTTP 200 response is an array whose items reference `#/components/schemas/TopCategoryItem`.
- `TopCategoryItem` is an object; all fields are required and non-nullable:
  - `category`: enum `suppliers | sales | operational | administrative | others`.
  - `operation_type`: enum `income | outcome`.
  - `total_amount`: number.
- This is a direct array response, not a response object with a nested list.
- HTTP 422 response references `#/components/schemas/HTTPValidationError`.

**OBSERVED — sample:** the default request returned HTTP 200 and an array with four entries. An `operation_type=income` request and per-business-type requests are valid according to the enum/filter parameters; observed values are not fixed guarantees.

### `GET /api/metrics`

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics/get`

All query parameters are optional:

| Name | OpenAPI type/format | Constraint/default |
|---|---|---|
| `start_date`, `end_date` | nullable string, format `date` | no default declared; optional |
| `category` | nullable string enum | `suppliers | sales | operational | administrative | others`; no default declared |
| `operation_type` | nullable string enum | `income | outcome`; no default declared |

- HTTP 200 response is an array of `#/components/schemas/FinancialMovement`.
- `FinancialMovement` has required, non-nullable properties `create_date` (date string), `amount` (number), `operation_type` (`income | outcome`), `category` (the five values above), and `business_type` (`B2B | B2C`).
- HTTP 422 response references `#/components/schemas/HTTPValidationError`.

This endpoint's date parameter names are exactly `start_date` and `end_date`.

### `GET /api/metrics/summary` — grouping support relevant to F03

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1summary/get`

All query parameters are optional:

| Name | OpenAPI type/format | Constraint/default |
|---|---|---|
| `group_by` | string enum | `day | week | month`; default `month` |
| `start_date`, `end_date` | nullable string, format `date` | no default declared |
| `category` | nullable string enum | `suppliers | sales | operational | administrative | others` |
| `operation_type` | nullable string enum | `income | outcome` |
| `business_type` | nullable string enum | `B2B | B2C` |

- HTTP 200 response is a direct array of `#/components/schemas/MetricsSummaryItem`.
- Each item has required, non-nullable properties: `period` (string), `income` (number), `outcome` (number), and `net` (number).
- HTTP 422 response references `#/components/schemas/HTTPValidationError`.

OpenAPI confirms the parameters and response shape, but the schema alone does not specify the aggregation rule. **VERIFIED by read-only source inspection:** `get_metrics_summary` first filters movements by `business_type`, then applies the shared date/operation filters, then calls `summarize_movements`. That helper assigns each movement to exactly one date/week/month key, accumulates `amount` once into that operation's bucket, and returns one item per bucket. Therefore the unrounded grouped `income` buckets are disjoint and summable without double counting for the requested range. Each bucket is rounded to two decimal places before serialization; summing serialized buckets can consequently differ by small rounding error from summing raw movement amounts. **OBSERVED:** For 2025-11-15 through 2026-03-17, sums of returned `income` matched direct filtered B2B/B2C income movement totals to floating-point/rounding precision for `group_by=day`, `week`, and `month`. This is an implementation observation, not an OpenAPI guarantee; re-verify if backend aggregation changes.

### `GET /api/metrics/comparison`

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1comparison/get`

| Name | OpenAPI type/format | Required/default/constraint |
|---|---|---|
| `start_date` | string, format `date` | required; no default declared |
| `end_date` | string, format `date` | required; no default declared |
| `business_type` | nullable string enum `B2B | B2C` | optional; no default declared |

- HTTP 200 response references `#/components/schemas/MetricsComparison`, an object with all properties required:
  - `current_period`: number.
  - `previous_period`: number.
  - `delta_abs`: number.
  - `delta_pct`: number or `null`.
- HTTP 422 response references `#/components/schemas/HTTPValidationError`.
- This operation accepts at most one business type per request and compares periods; it does not return a combined B2B-versus-B2C result.

### Other observed B2B/B2C endpoints

**VERIFIED — OpenAPI:** `#/paths/~1api~1metrics~1b2b/get` and `#/paths/~1api~1metrics~1b2c/get` each accept optional nullable `start_date`/`end_date`, nullable `category`, and nullable `operation_type`. Each returns a direct array of `FinancialMovement` and declares 200/422 responses. They return movement records, not income totals or a combined comparison response.

## Requirement coverage and specification decisions

### F01 — Date-range filtering

- **VERIFIED:** `/api/metrics` uses optional `start_date` and `end_date` date strings; `/api/metrics/facets` exposes required `min_date` and `max_date` date strings.
- **OBSERVED:** The sample facets response contained a current data range, but those date values are not permanent guarantees.
- **VERIFIED by source inspection (not OpenAPI):** the backend applies inclusive bounds (`create_date >= start_date`, `create_date <= end_date`); either bound can be provided independently. **UNVERIFIED:** reversed-range and out-of-facets behavior is not specified by OpenAPI; UI rejection of reversed/out-of-facets ranges is a frontend decision.
- **SPEC DECISION:** Parameter type documentation uses the verified snake_case names and documents date strings in `YYYY-MM-DD` format. This is a representation of the OpenAPI date format, not an additional API constraint.

### F02 — Anomaly alerts

- **VERIFIED:** `/api/metrics/alerts` exposes `threshold >= 0`, default `0.3`, with no documented upper bound, and returns the four required fields listed above.
- **SPEC DECISION:** The requested frontend threshold control range is `0.01` to `1.0`, with UI default `0.3`. These are frontend UI restrictions/default, not backend OpenAPI validation. The API accepts values at least zero and has no documented maximum; callers must not claim that OpenAPI enforces the UI range.
- **SPEC DECISION:** the selected threshold is explicitly sent by the frontend when alert parameters change. **VERIFIED by source inspection (not OpenAPI):** `increase_ratio` is computed as `(period outcome - prior-period baseline average) / baseline average` when the baseline is positive; percentage display multiplies this ratio by 100. Empty-state wording is a UI/product presentation choice. The API provides no currency metadata; existing dashboard formatting uses `formatCurrency` in `frontend/src/lib/financial-utils.ts` (en-US USD with zero displayed fraction digits), which component specs reuse as a frontend convention.

### F03 — B2B versus B2C income and category comparison

- **VERIFIED:** `business_type` values are `B2B | B2C` on summary/top-category parameters. `/api/metrics/categories/top` supports `operation_type=income`, a `limit` up to 20 (default 5), date filters, and one `business_type` per request. Its array items expose `category`, `operation_type`, and `total_amount`.
- **VERIFIED:** `/api/metrics/summary` accepts one business-type filter and returns per-period `income`, `outcome`, and `net` values. `/api/metrics/comparison` is a current-versus-previous-period net comparison with one optional business type; it is not a B2B-versus-B2C comparison.
- **MISMATCH:** No inspected OpenAPI operation returns B2B and B2C income totals together, nor a direct B2B-vs-B2C comparison result.
- **SPEC DECISION (proposed frontend composition, not a new backend contract):** Make two filtered calls to `/api/metrics/categories/top`, one with each `business_type`, using `operation_type=income` and `limit=5`; separately obtain grouped income from `/api/metrics/summary` for each business type using the same date filter. For each group, sum the returned `income` values across requested periods to form a total, then calculate each category percentage against that group's total income. Do not implement fetching or aggregation in this milestone.
- **VERIFIED by source inspection + OBSERVED live cross-check:** summary filtering is applied before grouping; each movement belongs to exactly one group bucket, so group `income` values can be summed without double counting. Each bucket is rounded to two decimals, and the existing tests do not assert an exact aggregate-total invariant; see the summary section above. **SPEC DECISION:** for zero group income, show category amounts and `N/A` for percentages. A category absent from a limited top-five result is not presumed to have zero total. The specified top-five limit is within the verified API maximum; top-five selection is a specification decision.

## Evidence limitations

- OpenAPI describes contract shapes, parameter schemas, and declared responses, not permanent mock values or complete business semantics.
- Runtime sample responses observed during this inspection are illustrative only. The backend uses mock data; sample dates and values may vary with the current date.
- This verification did not troubleshoot the historical frontend proxy 502. Direct backend `/docs` and `/openapi.json` access succeeded in this session.
- No frontend fetching, aggregation, React implementation, or backend modification was performed.
