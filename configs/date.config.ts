// Date and Time Configuration - All date formatting settings
// Flexy hates hardcoded values! All date/time settings are now configurable.

export const dateConfig = {
  // Default Locale
  locale: process.env.DATE_LOCALE || 'en-US',

  // Date Format Options
  formats: {
    short: {
      month: process.env.DATE_FORMAT_SHORT_MONTH || 'short',
      day: process.env.DATE_FORMAT_SHORT_DAY || 'numeric',
    },
    long: {
      year: process.env.DATE_FORMAT_LONG_YEAR || 'numeric',
      month: process.env.DATE_FORMAT_LONG_MONTH || 'long',
      day: process.env.DATE_FORMAT_LONG_DAY || 'numeric',
    },
    time: {
      hour: process.env.DATE_FORMAT_TIME_HOUR || 'numeric',
      minute: process.env.DATE_FORMAT_TIME_MINUTE || '2-digit',
    },
    full: {
      year: process.env.DATE_FORMAT_FULL_YEAR || 'numeric',
      month: process.env.DATE_FORMAT_FULL_MONTH || 'short',
      day: process.env.DATE_FORMAT_FULL_DAY || 'numeric',
      hour: process.env.DATE_FORMAT_FULL_HOUR || 'numeric',
      minute: process.env.DATE_FORMAT_FULL_MINUTE || '2-digit',
    },
  },

  // Relative Time Thresholds (in seconds)
  relativeTime: {
    justNow: parseInt(process.env.DATE_RELATIVE_JUST_NOW || '60'),
    minute: parseInt(process.env.DATE_RELATIVE_MINUTE || '60'),
    hour: parseInt(process.env.DATE_RELATIVE_HOUR || '3600'),
    day: parseInt(process.env.DATE_RELATIVE_DAY || '86400'),
    week: parseInt(process.env.DATE_RELATIVE_WEEK || '604800'),
    month: parseInt(process.env.DATE_RELATIVE_MONTH || '2592000'),
    year: parseInt(process.env.DATE_RELATIVE_YEAR || '31536000'),
  },

  // Timezone
  timezone: process.env.DATE_TIMEZONE || 'UTC',

  // Time Intervals in Milliseconds - Flexy hates hardcoded timestamps!
  intervals: {
    msPerSecond: 1000,
    msPerMinute: 60000,
    msPerHour: 3600000,
    msPerDay: 86400000,
    msPerWeek: 604800000,
  },

  // Activity timestamps for mock data (hours ago)
  activityTiming: {
    recent: parseInt(process.env.ACTIVITY_TIMING_RECENT || '1'),
    moderate: parseInt(process.env.ACTIVITY_TIMING_MODERATE || '2'),
    older: parseInt(process.env.ACTIVITY_TIMING_OLDER || '3'),
    oldest: parseInt(process.env.ACTIVITY_TIMING_OLDEST || '4'),
  },

  // Default date for mock data and initialization
  // Flexy hates hardcoded dates scattered throughout the codebase!
  defaultDate: process.env.DEFAULT_DATE || '2025-01-01',

  // Default date/time for createdAt and updatedAt fields
  defaultTimestamp: process.env.DEFAULT_TIMESTAMP || '2025-01-01T00:00:00.000Z',
} as const

export type DateConfig = typeof dateConfig
