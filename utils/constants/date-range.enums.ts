/**
 * Date range filter options
 * Use these enums instead of hardcoded string literals
 */
export enum DateRange {
  /** Any time - no date filter */
  ANYTIME = 'anytime',
  /** Today only */
  TODAY = 'today',
  /** Last 7 days */
  LAST_WEEK = 'lastWeek',
  /** Last 30 days */
  LAST_MONTH = 'lastMonth',
  /** Last 365 days */
  LAST_YEAR = 'lastYear',
}

/**
 * Type for date range values
 */
export type DateRangeValue = `${DateRange}`

/**
 * All valid date range options
 */
export const DATE_RANGE_OPTIONS: DateRangeValue[] = [
  DateRange.ANYTIME,
  DateRange.TODAY,
  DateRange.LAST_WEEK,
  DateRange.LAST_MONTH,
  DateRange.LAST_YEAR,
]
