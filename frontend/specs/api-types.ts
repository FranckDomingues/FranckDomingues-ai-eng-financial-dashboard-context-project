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

/** One movement returned by GET /api/metrics. */
export interface FinancialMovement {
  /** Movement date, represented as an ISO date string. */
  create_date: string;
  /** Movement amount. */
  amount: number;
  /** Movement operation kind. */
  operation_type: OperationType;
  /** Movement category. */
  category: FinancialCategory;
  /** Business group for the movement. */
  business_type: BusinessType;
}

/** The direct array response body for GET /api/metrics. */
export type FinancialMovementsResponse = FinancialMovement[];

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

/** One grouped metrics item returned by GET /api/metrics/summary. */
export interface MetricsSummaryItem {
  /** Date or grouped-period label returned by the API. */
  period: string;
  /** Numeric income value returned for this period. */
  income: number;
  /** Numeric outcome value returned for this period. */
  outcome: number;
  /** Numeric net value returned for this period. */
  net: number;
}

/** The direct array response body for GET /api/metrics/summary. */
export type SummaryResponse = MetricsSummaryItem[];
