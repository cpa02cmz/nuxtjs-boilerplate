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
} as const

export type DateConfig = typeof dateConfig
