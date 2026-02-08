// Config Index - Export all configuration modules
// Flexy loves modularity! All configs in one place.

import { appConfig, type AppConfig } from './app.config'
import { themeConfig, type ThemeConfig } from './theme.config'
import { seoConfig, type SeoConfig } from './seo.config'
import { searchConfig, type SearchConfig } from './search.config'
import {
  securityConfig,
  generateCsp,
  getSecurityHeaders,
  type SecurityConfig,
} from './security.config'
import {
  rateLimitConfig,
  getRateLimitTier,
  type RateLimitConfig,
  type RateLimitTier,
} from './rate-limit.config'
import { cacheConfig, type CacheConfig } from './cache.config'
import { webhooksConfig, type WebhooksConfig } from './webhooks.config'
import { paginationConfig, type PaginationConfig } from './pagination.config'
import { validationConfig, type ValidationConfig } from './validation.config'
import { analyticsConfig, type AnalyticsConfig } from './analytics.config'
import { uiConfig, type UiConfig } from './ui.config'
import { pwaConfig, type PwaConfig } from './pwa.config'
import { apiConfig, type ApiConfig } from './api.config'
import { contentConfig, type ContentConfig } from './content.config'
import { limitsConfig, type LimitsConfig } from './limits.config'
import { comparisonConfig, type ComparisonConfig } from './comparison.config'
import { marketingConfig, type MarketingConfig } from './marketing.config'

// Re-export individual configs
export { appConfig, type AppConfig }
export { themeConfig, type ThemeConfig }
export { seoConfig, type SeoConfig }
export { searchConfig, type SearchConfig }
export { securityConfig, generateCsp, getSecurityHeaders, type SecurityConfig }
export {
  rateLimitConfig,
  getRateLimitTier,
  type RateLimitConfig,
  type RateLimitTier,
}
export { cacheConfig, type CacheConfig }
export { webhooksConfig, type WebhooksConfig }
export { paginationConfig, type PaginationConfig }
export { validationConfig, type ValidationConfig }
export { analyticsConfig, type AnalyticsConfig }
export { uiConfig, type UiConfig }
export { pwaConfig, type PwaConfig }
export { apiConfig, type ApiConfig }
export { contentConfig, type ContentConfig }
export { limitsConfig, type LimitsConfig }
export { comparisonConfig, type ComparisonConfig }
export { marketingConfig, type MarketingConfig }

// Default export with all configs
export const config = {
  app: appConfig,
  theme: themeConfig,
  seo: seoConfig,
  search: searchConfig,
  security: securityConfig,
  rateLimit: rateLimitConfig,
  cache: cacheConfig,
  webhooks: webhooksConfig,
  pagination: paginationConfig,
  validation: validationConfig,
  analytics: analyticsConfig,
  ui: uiConfig,
  pwa: pwaConfig,
  api: apiConfig,
  content: contentConfig,
  limits: limitsConfig,
  comparison: comparisonConfig,
  marketing: marketingConfig,
} as const

export type Config = typeof config
