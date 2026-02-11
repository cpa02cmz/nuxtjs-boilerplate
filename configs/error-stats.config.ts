// Error Stats Configuration - Error tracking and statistics settings
// Flexy hates hardcoded values! All error stats settings are now configurable.

import { TIME_MS } from './time.config'

export const errorStatsConfig = {
  // Time range settings
  timeRange: {
    // Default hours to query
    defaultHours: parseInt(process.env.ERROR_STATS_DEFAULT_HOURS || '24'),
    // Minimum hours allowed
    minHours: parseInt(process.env.ERROR_STATS_MIN_HOURS || '1'),
    // Maximum hours allowed (default: 1 week)
    maxHours: parseInt(process.env.ERROR_STATS_MAX_HOURS || '168'),
    // Preset time ranges
    presets: {
      oneHour: 1,
      sixHours: 6,
      twelveHours: 12,
      oneDay: 24,
      threeDays: 72,
      oneWeek: 168,
    },
  },

  // Milliseconds conversion - Flexy hates magic numbers!
  msPerHour: TIME_MS.HOUR,

  // Pagination for error results
  pagination: {
    defaultLimit: parseInt(process.env.ERROR_STATS_DEFAULT_LIMIT || '10'),
    maxLimit: parseInt(process.env.ERROR_STATS_MAX_LIMIT || '100'),
  },

  // Error grouping settings
  grouping: {
    // Group errors by message hash
    groupByMessage: process.env.ERROR_STATS_GROUP_BY_MESSAGE !== 'false',
    // Group errors by stack trace
    groupByStack: process.env.ERROR_STATS_GROUP_BY_STACK !== 'false',
    // Maximum group depth
    maxGroupDepth: parseInt(process.env.ERROR_STATS_MAX_GROUP_DEPTH || '10'),
  },

  // Error severity thresholds
  severity: {
    // Critical error threshold (errors per hour)
    critical: parseInt(process.env.ERROR_STATS_CRITICAL_THRESHOLD || '100'),
    // High error threshold
    high: parseInt(process.env.ERROR_STATS_HIGH_THRESHOLD || '50'),
    // Medium error threshold
    medium: parseInt(process.env.ERROR_STATS_MEDIUM_THRESHOLD || '20'),
    // Low error threshold
    low: parseInt(process.env.ERROR_STATS_LOW_THRESHOLD || '5'),
  },

  // Retention settings
  retention: {
    // How long to keep error stats (in days)
    days: parseInt(process.env.ERROR_STATS_RETENTION_DAYS || '30'),
  },

  // API response settings
  response: {
    // Include full stack traces in response
    includeStackTraces: process.env.ERROR_STATS_INCLUDE_STACK === 'true',
    // Include error metadata
    includeMetadata: process.env.ERROR_STATS_INCLUDE_METADATA !== 'false',
  },
} as const

// Helper function to validate hours parameter
export function validateHours(hours: number): {
  valid: boolean
  hours: number
  error?: string
} {
  if (hours < errorStatsConfig.timeRange.minHours) {
    return {
      valid: false,
      hours: errorStatsConfig.timeRange.defaultHours,
      error: `Hours must be at least ${errorStatsConfig.timeRange.minHours}`,
    }
  }
  if (hours > errorStatsConfig.timeRange.maxHours) {
    return {
      valid: false,
      hours: errorStatsConfig.timeRange.defaultHours,
      error: `Hours must not exceed ${errorStatsConfig.timeRange.maxHours}`,
    }
  }
  return { valid: true, hours }
}

// Helper function to calculate date range
export function calculateDateRange(hours: number): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date(end.getTime() - hours * errorStatsConfig.msPerHour)
  return { start, end }
}

export type ErrorStatsConfig = typeof errorStatsConfig
