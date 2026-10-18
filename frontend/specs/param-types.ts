import type {
  BusinessType,
  MetricsGroupBy,
  OperationType,
} from "./api-types";

/**
 * Optional date bounds shared by date-filtered API requests.
 * OpenAPI represents both values as optional nullable date strings; when set,
 * callers should use the YYYY-MM-DD representation of the API date format.
 */
export interface DateRangeFilter {
  /** Inclusive/exclusive range semantics are not specified by OpenAPI. */
  start_date?: string;
  /** Inclusive/exclusive range semantics are not specified by OpenAPI. */
  end_date?: string;
}

/** Query parameters for GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * API validation: number with minimum 0, default 0.3, and no documented
   * maximum. The frontend control specification separately restricts user
   * input to 0.01–1.0 and uses 0.3 as its UI default.
   */
  threshold?: number;
  /** Alert grouping; the API default is month. */
  group_by?: MetricsGroupBy;
  /** Optional business-type filter. */
  business_type?: BusinessType;
}

/** Query parameters for GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type to rank; the API default is outcome. */
  operation_type?: OperationType;
  /** Maximum number of categories; API constraint is 1–20 and default is 5. */
  limit?: number;
  /** Optional business-type filter. */
  business_type?: BusinessType;
}
