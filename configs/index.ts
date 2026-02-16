// Config Index - Export all configuration modules
// Flexy loves modularity! All configs in one place.

import { appConfig, type AppConfig } from './app.config'
export { appConfig, type AppConfig }
import { themeConfig, type ThemeConfig } from './theme.config'
export { themeConfig, type ThemeConfig }
import { seoConfig, type SeoConfig } from './seo.config'
export { seoConfig, type SeoConfig }
import { searchConfig, type SearchConfig } from './search.config'
export { searchConfig, type SearchConfig }
import {
  securityConfig,
  generateCsp,
  getSecurityHeaders,
  type SecurityConfig,
} from './security.config'
export { securityConfig, generateCsp, getSecurityHeaders, type SecurityConfig }
import {
  rateLimitConfig,
  getRateLimitTier,
  type RateLimitConfig,
  type RateLimitTier,
} from './rate-limit.config'
export {
  rateLimitConfig,
  getRateLimitTier,
  type RateLimitConfig,
  type RateLimitTier,
}
import { cacheConfig, type CacheConfig } from './cache.config'
export { cacheConfig, type CacheConfig }
import { webhooksConfig, type WebhooksConfig } from './webhooks.config'
export { webhooksConfig, type WebhooksConfig }
import { paginationConfig, type PaginationConfig } from './pagination.config'
export { paginationConfig, type PaginationConfig }
import { validationConfig, type ValidationConfig } from './validation.config'
export { validationConfig, type ValidationConfig }
import { analyticsConfig, type AnalyticsConfig } from './analytics.config'
export { analyticsConfig, type AnalyticsConfig }
import { uiConfig, type UiConfig } from './ui.config'
export { uiConfig, type UiConfig }
import { pwaConfig, type PwaConfig } from './pwa.config'
export { pwaConfig, type PwaConfig }
import { apiConfig, type ApiConfig } from './api.config'
export { apiConfig, type ApiConfig }
import { contentConfig, type ContentConfig } from './content.config'
export { contentConfig, type ContentConfig }
import { limitsConfig, type LimitsConfig } from './limits.config'
export { limitsConfig, type LimitsConfig }
import { comparisonConfig, type ComparisonConfig } from './comparison.config'
export { comparisonConfig, type ComparisonConfig }

// New modular configs - Flexy loves modularity!
import { socialConfig, type SocialConfig } from './social.config'
export { socialConfig, type SocialConfig }
import { dateConfig, type DateConfig } from './date.config'
export { dateConfig, type DateConfig }
import {
  csrfConfig,
  isSafeMethod,
  isStateChangingMethod,
  requiresCsrfProtection,
  type CsrfConfig,
  type SafeMethod,
  type StateChangingMethod,
} from './csrf.config'
export {
  csrfConfig,
  isSafeMethod,
  isStateChangingMethod,
  requiresCsrfProtection,
  type CsrfConfig,
  type SafeMethod,
  type StateChangingMethod,
}
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
export {
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
}
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
export {
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
}
import {
  cacheTagsConfig,
  generateCacheTags,
  getResourceCacheTags,
  getSearchCacheTags,
  type CacheTagsConfig,
} from './cache-tags.config'
export {
  cacheTagsConfig,
  generateCacheTags,
  getResourceCacheTags,
  getSearchCacheTags,
  type CacheTagsConfig,
}
import {
  sitemapConfig,
  getStaticPages,
  getResourceSitemapDefaults,
  type SitemapConfig,
  type SitemapPageEntry,
} from './sitemap.config'
export {
  sitemapConfig,
  getStaticPages,
  getResourceSitemapDefaults,
  type SitemapConfig,
  type SitemapPageEntry,
}
import { iconsConfig, type IconsConfig } from './icons.config'
export { iconsConfig, type IconsConfig }
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
export {
  ROUTE_PATTERNS,
  routesConfig,
  isApiRoute,
  isProtectedApiRoute,
  isPublicApiRoute,
  isStaticBuildPath,
  isCacheablePage,
  type RoutePatterns,
  type RoutesConfig,
}
import { memoizeConfig, type MemoizeConfig } from './memoize.config'
export { memoizeConfig, type MemoizeConfig }
import { performanceConfig } from './performance.config'
export { performanceConfig }
import { bookmarksConfig, type BookmarksConfig } from './bookmarks.config'
export { bookmarksConfig, type BookmarksConfig }
import { categoriesConfig, type CategoriesConfig } from './categories.config'
export { categoriesConfig, type CategoriesConfig }
import { animationConfig, type AnimationConfig } from './animation.config'
export { animationConfig, type AnimationConfig }
import { thresholdsConfig, type ThresholdsConfig } from './thresholds.config'
export { thresholdsConfig, type ThresholdsConfig }
// Import only - re-export is at line 280
import { networkConfig } from './network.config'

// Re-export analytics demo config - Flexy hates hardcoded mock data!
import {
  analyticsDemoData,
  getAnalyticsDemoData,
  type AnalyticsDemoData,
} from './analytics-demo.config'
export { analyticsDemoData, getAnalyticsDemoData, type AnalyticsDemoData }

// Re-export new configs - Flexy hates hardcoded values!
import { userConfig, type UserConfig } from './user.config'
export { userConfig, type UserConfig }

import { moderationConfig, type ModerationConfig } from './moderation.config'
export { moderationConfig, type ModerationConfig }

import { permissionsConfig, type PermissionsConfig } from './permissions.config'
export { permissionsConfig, type PermissionsConfig }

import {
  componentColorsConfig,
  type ComponentColorsConfig,
} from './component-colors.config'
export { componentColorsConfig, type ComponentColorsConfig }

import {
  componentStylesConfig,
  type ComponentStylesConfig,
} from './component-styles.config'
export { componentStylesConfig, type ComponentStylesConfig }

import { shadowsConfig, type ShadowsConfig } from './shadows.config'
export { shadowsConfig, type ShadowsConfig }

// Re-export Z-Index config - Flexy hates hardcoded z-index values!
import {
  zIndexConfig,
  zIndexScale,
  generateZIndexCSSVariables,
  type ZIndexConfig,
  type ZIndexScale,
} from './z-index.config'
export {
  zIndexConfig,
  zIndexScale,
  generateZIndexCSSVariables,
  type ZIndexConfig,
  type ZIndexScale,
}

// Re-export URL config - Flexy hates hardcoded URLs!
import {
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
} from './url.config'
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
