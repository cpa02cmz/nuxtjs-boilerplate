/**
 * Configuration Index
 * Flexy says: Export all configs from one place!
 */

// Application Configuration
export {
  default as appConfig,
  SITE_CONFIG,
  THEME_CONFIG,
  SEO_CONFIG,
  FEATURE_FLAGS,
  ROUTE_CONFIG,
  IMAGE_CONFIG,
  API_CONFIG,
} from './app.config'

// PWA Configuration
export {
  default as pwaConfig,
  PWA_CONFIG,
  PWA_MANIFEST,
  PWA_CACHE_CONFIG,
} from './pwa.config'

// Rate Limiting Configuration
export {
  default as rateLimitConfig,
  RATE_LIMITS,
  DEFAULT_RATE_LIMITER_CONFIG,
  ENHANCED_RATE_LIMIT_CONFIG,
} from './rate-limit.config'

// Search Configuration
export {
  default as searchConfig,
  FUSE_CONFIG,
  SEARCH_BEHAVIOR,
  SEARCH_UI_CONFIG,
  ADVANCED_SEARCH_CONFIG,
} from './search.config'

// Cache Configuration
export {
  default as cacheConfig,
  CACHE_TTL,
  CACHE_LIMITS,
  CACHE_STRATEGIES,
  ENHANCED_CACHE_CONFIG,
} from './cache.config'

// Validation Configuration
export {
  default as validationConfig,
  URL_VALIDATION,
  RESOURCE_VALIDATION,
  SKILL_LEVELS,
  PRICING_MODELS,
  SUBMISSION_VALIDATION,
  SANITIZATION_CONFIG,
} from './validation.config'

// Retry Configuration
export {
  default as retryConfig,
  RETRY_CONFIG,
  RETRY_PRESETS,
  CIRCUIT_BREAKER_CONFIG,
  WEBHOOK_RETRY_CONFIG,
} from './retry.config'

// UI Configuration
export {
  default as uiConfig,
  TOAST_CONFIG,
  UI_FEEDBACK,
  UI_TIMING,
  UI_LAYOUT,
  Z_INDEX,
  ANIMATION_DURATION,
  SKELETON_CONFIG,
} from './ui.config'

// Recommendation Configuration
export {
  default as recommendationConfig,
  ALGORITHM_WEIGHTS,
  ALGORITHM_LIMITS,
  SIMILARITY_WEIGHTS,
  INTEREST_WEIGHTS,
  RECOMMENDATION_FEATURES,
} from './recommendation.config'

// Pagination Configuration
export {
  default as paginationConfig,
  PAGINATION,
  RSS_PAGINATION,
} from './pagination.config'
