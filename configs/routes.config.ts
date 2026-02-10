// Routes Configuration - Centralized route paths for the application
// Flexy hates hardcoded paths! All routes are now configurable.

/**
 * API route prefixes and patterns
 * Used for middleware and route matching
 */
export const ROUTE_PATTERNS = {
  // API routes
  api: {
    base: '/api',
    v1: '/api/v1',
    auth: '/api/v1/auth',
    webhooks: '/api/v1/webhooks',
    resources: '/api/v1/resources',
    search: '/api/v1/search',
    analytics: '/api/analytics',
    moderation: '/api/moderation',
    validateUrl: '/api/validate-url',
    recommendations: '/api/recommendations',
  },

  // Static asset routes
  static: {
    nuxt: '/_nuxt',
    public: '/public',
  },

  // Main application routes
  pages: {
    home: '/',
    aiKeys: '/ai-keys',
    about: '/about',
    search: '/search',
    submit: '/submit',
    favorites: '/favorites',
    compare: '/compare',
    resources: '/resources',
  },

  // Sitemap and RSS
  sitemap: {
    index: '/sitemap.xml',
    resources: '/sitemap-resources.xml',
    rss: '/api/v1/rss',
  },
} as const

/**
 * Route configuration with environment variable support
 */
export const routesConfig = {
  patterns: ROUTE_PATTERNS,

  // API route configuration
  api: {
    basePath: process.env.API_BASE_PATH || '/api',
    v1Prefix: process.env.API_V1_PREFIX || '/api/v1',
    protectedPaths: [process.env.API_V1_PREFIX || '/api/v1'],
    publicPaths: [process.env.API_AUTH_PATH || '/api/v1/auth'],
  },

  // Cacheable page routes for security headers
  cacheablePages: ['/', '/ai-keys', '/about', '/search', '/submit'],

  // Static build paths
  staticBuildPath: '/_nuxt',
} as const

/**
 * Helper functions for route matching
 */

/**
 * Check if a path is an API route
 */
export function isApiRoute(path: string): boolean {
  return path.startsWith(routesConfig.api.basePath)
}

/**
 * Check if a path is a protected API route (requires auth)
 */
export function isProtectedApiRoute(path: string): boolean {
  // Protected if it starts with v1 but NOT with auth
  if (!path.startsWith(routesConfig.api.v1Prefix)) {
    return false
  }
  return !routesConfig.api.publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  )
}

/**
 * Check if a path is a public/auth API route
 */
export function isPublicApiRoute(path: string): boolean {
  return routesConfig.api.publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  )
}

/**
 * Check if a path is a static build asset
 */
export function isStaticBuildPath(path: string): boolean {
  return path.includes(routesConfig.staticBuildPath)
}

/**
 * Check if a path is a cacheable page route
 */
export function isCacheablePage(path: string): boolean {
  return routesConfig.cacheablePages.includes(path)
}

// Type exports
export type RoutePatterns = typeof ROUTE_PATTERNS
export type RoutesConfig = typeof routesConfig
