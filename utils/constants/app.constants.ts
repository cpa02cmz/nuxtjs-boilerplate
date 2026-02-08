/**
 * Application-wide constants
 * Use these instead of hardcoded values throughout the app
 */

/** Default base URL for the application */
export const DEFAULT_BASE_URL =
  process.env.NUXT_PUBLIC_DEFAULT_BASE_URL || 'http://localhost:3000'

/** Default canonical URL */
export const DEFAULT_CANONICAL_URL =
  process.env.NUXT_PUBLIC_CANONICAL_URL || DEFAULT_BASE_URL

/**
 * Data file paths
 */
export const DATA_PATHS = {
  /** Path to resources data file */
  RESOURCES: '~/data/resources.json',
  /** Path to categories data file */
  CATEGORIES: '~/data/categories.json',
  /** Path to alternatives data file */
  ALTERNATIVES: '~/data/alternatives.json',
} as const

/**
 * Server timing constants
 */
export const SERVER_TIMING = {
  /** Default startup delay in milliseconds */
  STARTUP_DELAY_MS: 5000,
} as const

/**
 * Database constants
 */
export const DATABASE_CONSTANTS = {
  /** Default busy timeout in milliseconds */
  BUSY_TIMEOUT_MS: 5000,
} as const

/**
 * Cache TTL values (in seconds)
 */
export const CACHE_TTL = {
  /** Default cache TTL - 5 minutes */
  DEFAULT: 300,
  /** Resource detail cache TTL - 10 minutes */
  RESOURCE_DETAIL: 600,
  /** Categories cache TTL - 1 hour */
  CATEGORIES: 3600,
  /** Short cache TTL - 1 minute */
  SHORT: 60,
  /** Medium cache TTL - 5 minutes */
  MEDIUM: 300,
  /** Long cache TTL - 1 hour */
  LONG: 3600,
} as const

/**
 * Search highlight CSS classes
 */
export const HIGHLIGHT_CLASSES = {
  /** CSS classes for highlighted search terms */
  MARK: 'bg-yellow-200 text-gray-900',
} as const

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size */
  PAGE_SIZE: 20,
  /** Default offset */
  OFFSET: 0,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
} as const
