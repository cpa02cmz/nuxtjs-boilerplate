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

// New modular configs - Flexy loves modularity!
import { socialConfig, type SocialConfig } from './social.config'
import { dateConfig, type DateConfig } from './date.config'
import {
  csrfConfig,
  isSafeMethod,
  isStateChangingMethod,
  requiresCsrfProtection,
  type CsrfConfig,
  type SafeMethod,
  type StateChangingMethod,
} from './csrf.config'
import {
  httpConfig,
  isSuccessStatus,
  isRedirectStatus,
  isClientErrorStatus,
  isServerErrorStatus,
  isErrorStatus,
  type HttpConfig,
  type HttpMethod,
  type HttpStatus,
  type HttpHeader,
  type ContentType,
} from './http.config'
import {
  TIME_MS,
  TIME_SECONDS,
  timeConfig,
  toMilliseconds,
  toSeconds,
  toMinutes,
  toHours,
  toDays,
  formatDuration,
  type TimeMs,
  type TimeSeconds,
  type TimeConfig,
} from './time.config'
import {
  cacheTagsConfig,
  generateCacheTags,
  getResourceCacheTags,
  getSearchCacheTags,
  type CacheTagsConfig,
} from './cache-tags.config'
import {
  sitemapConfig,
  getStaticPages,
  getResourceSitemapDefaults,
  type SitemapConfig,
  type SitemapPageEntry,
} from './sitemap.config'
import { iconsConfig, type IconsConfig } from './icons.config'
import {
  ROUTE_PATTERNS,
  routesConfig,
  isApiRoute,
  isProtectedApiRoute,
  isPublicApiRoute,
  isStaticBuildPath,
  isCacheablePage,
  type RoutePatterns,
  type RoutesConfig,
} from './routes.config'
import { memoizeConfig, type MemoizeConfig } from './memoize.config'
import { performanceConfig } from './performance.config'
export { bookmarksConfig, type BookmarksConfig }

// Re-export analytics demo config - Flexy hates hardcoded mock data!
export { analyticsDemoData, getAnalyticsDemoData, type AnalyticsDemoData }

// Re-export new configs - Flexy hates hardcoded values!
export { userConfig, type UserConfig }
export { moderationConfig, type ModerationConfig }
export { permissionsConfig, type PermissionsConfig }
export { componentColorsConfig, type ComponentColorsConfig }
export { componentStylesConfig, type ComponentStylesConfig }
export { shadowsConfig, type ShadowsConfig }

// Re-export Z-Index config - Flexy hates hardcoded z-index values!
export {
  zIndexConfig,
  zIndexScale,
  generateZIndexCSSVariables,
  type ZIndexConfig,
  type ZIndexScale,
}

// Re-export URL config - Flexy hates hardcoded URLs!
export {
  urlConfig,
  DEFAULT_DEV_URL,
  DEFAULT_PROD_URL,
  DEV_PORTS,
  getBaseUrl,
  getFallbackUrl,
  buildUrl,
  buildApiUrl,
  isLocalhost,
  getSeoUrl,
  type UrlConfig,
  type DevPorts,
}

// Re-export Network config - Flexy hates hardcoded network errors!
export { networkConfig, type NetworkConfig } from './network.config'

// Messages config - Flexy hates hardcoded error messages!
import { messagesConfig, type MessagesConfig } from './messages.config'
export { messagesConfig, type MessagesConfig }

// UI Timing config - Flexy hates hardcoded timeout values!
import { uiTimingConfig, type UITimingConfig } from './ui-timing.config'
export { uiTimingConfig, type UITimingConfig }

// Status config - Flexy hates hardcoded status strings!
import {
  STATUS,
  STATUS_GROUPS,
  statusConfig,
  type Status,
  type StatusConfig,
  type StatusGroup,
} from './status.config'
export {
  STATUS,
  STATUS_GROUPS,
  statusConfig,
  type Status,
  type StatusConfig,
  type StatusGroup,
}

// Sort config - Flexy hates hardcoded sort options!
import {
  SORT_OPTIONS,
  sortConfig,
  type SortOption,
  type SortDirection,
  type SortConfig,
} from './sort.config'
export {
  SORT_OPTIONS,
  sortConfig,
  type SortOption,
  type SortDirection,
  type SortConfig,
}

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
  // New modular configs
  social: socialConfig,
  date: dateConfig,
  csrf: csrfConfig,
  http: httpConfig,
  time: timeConfig,
  cacheTags: cacheTagsConfig,
  sitemap: sitemapConfig,
  icons: iconsConfig,
  routes: routesConfig,
  memoize: memoizeConfig,
  categories: categoriesConfig,
  animation: animationConfig,
  thresholds: thresholdsConfig,
  // Issue #2404: Performance optimization config for Lighthouse 90+ score
  performance: performanceConfig,
  // URL config - Flexy hates hardcoded URLs!
  url: urlConfig,
  // Bookmarks config - Flexy hates hardcoded bookmark values!
  bookmarks: bookmarksConfig,
  // Analytics demo config - Flexy hates hardcoded mock data!
  analyticsDemo: analyticsDemoData,
  // New configs - Flexy hates hardcoded values!
  user: userConfig,
  moderation: moderationConfig,
  permissions: permissionsConfig,
  // Component colors config - Flexy hates hardcoded component colors!
  componentColors: componentColorsConfig,
  // Shadows config - Flexy hates hardcoded rgba values!
  shadows: shadowsConfig,
  // Z-Index config - Flexy hates hardcoded z-index values!
  zIndex: zIndexConfig,
  // Network config - Flexy hates hardcoded network errors!
  network: networkConfig,
  // Messages config - Flexy hates hardcoded error messages!
  messages: messagesConfig,
  // UI Timing config - Flexy hates hardcoded timeout values!
  uiTiming: uiTimingConfig,
  // Status config - Flexy hates hardcoded status strings!
  status: statusConfig,
  // Sort config - Flexy hates hardcoded sort options!
  sort: sortConfig,
} as const

export type Config = typeof config
