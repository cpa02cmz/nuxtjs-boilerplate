/**
 * Time-related constants in milliseconds
 * Use these constants instead of hardcoded magic numbers
 */

export const TIME_CONSTANTS = {
  /** One second in milliseconds */
  SECOND_MS: 1000,
  /** One minute in milliseconds */
  MINUTE_MS: 60 * 1000,
  /** One hour in milliseconds */
  HOUR_MS: 60 * 60 * 1000,
  /** One day in milliseconds */
  DAY_MS: 24 * 60 * 60 * 1000,
  /** One week in milliseconds */
  WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  /** One month (30 days) in milliseconds - approximate */
  MONTH_MS: 30 * 24 * 60 * 60 * 1000,
  /** One year (365 days) in milliseconds */
  YEAR_MS: 365 * 24 * 60 * 60 * 1000,
} as const

/** Time-related constants in seconds (for cookies, HTTP cache, etc.) */
export const TIME_CONSTANTS_SECONDS = {
  /** One second */
  SECOND: 1,
  /** One minute */
  MINUTE: 60,
  /** One hour */
  HOUR: 60 * 60,
  /** One day */
  DAY: 24 * 60 * 60,
  /** One week */
  WEEK: 7 * 24 * 60 * 60,
  /** One month (30 days) - approximate */
  MONTH: 30 * 24 * 60 * 60,
  /** One year (365 days) */
  YEAR: 365 * 24 * 60 * 60,
} as const
