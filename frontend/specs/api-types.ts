/** Operation kinds exposed by the verified API contract. */
export type OperationType = "income" | "outcome";

/** Business-type filters exposed by the verified API contract. */
export type BusinessType = "B2B" | "B2C";

/** Category values exposed by the verified API contract. */
export type FinancialCategory =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Grouping values exposed by the verified API contract. */
export type MetricsGroupBy = "day" | "week" | "month";

/** Response body for GET /api/metrics/facets. */
export interface FacetsResponse {
  /** Available operation types, as documented by MetricsFacets.operation_types. */
  operation_types: OperationType[];
  /** Available business types, as documented by MetricsFacets.business_types. */
  business_types: BusinessType[];
  /** Available categories, as documented by MetricsFacets.categories. */
  categories: FinancialCategory[];
  /** Earliest available movement date, formatted as an ISO date string. */
  min_date: string;
  /** Latest available movement date, formatted as an ISO date string. */
  max_date: string;
}

/** One alert item returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /** Period associated with the alert. */
  period: string;
  /** Total outcome amount for the alert period. */
  outcome_total: number;
  /** Baseline average outcome amount. */
  baseline_average: number;
  /** Increase ratio associated with the alert. */
  increase_ratio: number;
}

/** The direct array response body for GET /api/metrics/alerts. */
export type AlertsResponse = AlertEntry[];

/** One top-category item returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Category represented by this result. */
  category: FinancialCategory;
  /** Operation type used to calculate this category result. */
  operation_type: OperationType;
  /** Total amount for this category and operation type. */
  total_amount: number;
}

/** The direct array response body for GET /api/metrics/categories/top. */
export type TopCategoriesResponse = CategoryEntry[];
