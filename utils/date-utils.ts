/**
 * Date Utilities - Shared date formatting functions
 *
 * modularity-engineer: Consolidated duplicated formatDate implementations
 * from useAnalyticsPage.ts and useSearchAnalytics.ts into a single utility.
 *
 * These functions use the centralized dateConfig for consistent formatting.
 */

import { dateConfig } from '~/configs/date.config'

/**
 * Formats a date string to a short format (e.g., "Feb 18")
 * Used primarily in analytics and search analytics displays.
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string (e.g., "Feb 18")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(dateConfig.locale, {
    month: dateConfig.formats.short.month as
      | 'short'
      | 'long'
      | 'narrow'
      | 'numeric'
      | '2-digit',
    day: dateConfig.formats.short.day as 'numeric' | '2-digit',
  })
}

/**
 * Formats a date string to a full format including time
 * Used when detailed date/time display is needed.
 *
 * @param dateString - ISO date string to format
 * @returns Formatted date string with time (e.g., "Feb 18, 2026, 6:30 PM")
 */
export function formatDateFull(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(dateConfig.locale, {
    year: dateConfig.formats.full.year as 'numeric' | '2-digit',
    month: dateConfig.formats.full.month as
      | 'short'
      | 'long'
      | 'narrow'
      | 'numeric'
      | '2-digit',
    day: dateConfig.formats.full.day as 'numeric' | '2-digit',
    hour: dateConfig.formats.full.hour as 'numeric' | '2-digit',
    minute: dateConfig.formats.full.minute as 'numeric' | '2-digit',
  })
}

/**
 * Formats a date string to locale string format
 * Simple wrapper for toLocaleString() with configured locale.
 *
 * @param dateString - ISO date string to format
 * @returns Formatted locale string
 */
export function formatDateLocale(dateString: string): string {
  return new Date(dateString).toLocaleDateString(dateConfig.locale)
}

/**
 * Formats a date string to locale string with time
 *
 * @param dateString - ISO date string to format
 * @returns Formatted locale string with time
 */
export function formatDateTimeLocale(dateString: string): string {
  return new Date(dateString).toLocaleString(dateConfig.locale)
}
