// Server-only constants
// Note: Shared constants have been moved to ~/utils/constants.ts
// This file now re-exports from the shared location for backward compatibility

// Re-export all shared constants
export {
  STORAGE_KEYS,
  WEBHOOKS_CONFIG,
  type WebhooksConfig,
  PAGINATION_CONFIG,
  type PaginationConfig,
  ANALYTICS_CONFIG,
  type AnalyticsConfig,
  UI_CONFIG,
  type UiConfig,
  SEARCH_CONFIG,
  type SearchConfig,
  LIMITS_CONFIG,
  type LimitsConfig,
  COMPARISON_CONFIG,
  type ComparisonConfig,
  TIMING,
  TOAST_DURATION,
  UI_FEEDBACK_DURATION,
  UI_TIMING,
  RSS_CONFIG,
  PAGINATION,
  CACHE_CONFIG,
  HTTP_STATUS,
  UI_LAYOUT,
  ANIMATION_DURATION,
  Z_INDEX,
} from '~/utils/constants'

// Server-only constants (not shared with client)
export const VALID_CATEGORIES = [
  'Development',
  'Design',
  'Productivity',
  'Marketing',
  'Analytics',
  'Security',
  'AI/ML',
  'DevOps',
  'Testing',
  'Education',
] as const

export type ValidCategory = (typeof VALID_CATEGORIES)[number]

export function isValidCategory(category: string): category is ValidCategory {
  return VALID_CATEGORIES.includes(category as ValidCategory)
}

export const VALID_EVENT_TYPES = [
  'resource_view',
  'search',
  'filter_change',
  'bookmark',
  'comparison',
  'submission',
  'page_view',
  'resource_click',
  'advanced_search',
  'zero_result_search',
  'search_result_click',
  'filter_applied',
  'recommendation_click',
  'resource_rating',
  'time_spent',
  'bookmark_action',
  'resource_shared',
] as const

export type ValidEventType = (typeof VALID_EVENT_TYPES)[number]

export function isValidEventType(type: string): type is ValidEventType {
  return VALID_EVENT_TYPES.includes(type as ValidEventType)
}
