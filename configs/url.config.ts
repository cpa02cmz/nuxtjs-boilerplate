// URL Configuration - Centralized URL constants and utilities
// Flexy hates hardcoded values! All URLs are now configurable.

/**
 * Default development URL - extracted to avoid hardcoding
 */
export const DEFAULT_DEV_URL = 'http://localhost:3000'

/**
 * Default production URL placeholder
 */
export const DEFAULT_PROD_URL = 'https://example.com'

/**
 * Common localhost ports for development
 */
export const DEV_PORTS = {
  DEFAULT: 3000,
  ALTERNATE: 3001,
  HTTPS: 3443,
} as const

/**
 * URL configuration for different environments
 */
export const urlConfig = {
  // Development URLs
  development: {
    base: process.env.DEV_URL || DEFAULT_DEV_URL,
    default: DEFAULT_DEV_URL,
  },

  // Production URL
  production: {
    base: process.env.SITE_URL || process.env.CANONICAL_URL || DEFAULT_PROD_URL,
    default: DEFAULT_PROD_URL,
  },

  // Fallback URL for SEO/meta when canonical URL is not set
  fallback: DEFAULT_DEV_URL,

  // API endpoints
  api: {
    base: process.env.API_URL || '/api',
    version: 'v1',
  },

  // Webhook URLs
  webhooks: {
    base: process.env.WEBHOOK_BASE_URL || DEFAULT_DEV_URL,
  },

  // Social URLs
  social: {
    twitter: process.env.TWITTER_URL || '',
    github: process.env.GITHUB_URL || '',
  },

  // CDN/Asset URLs
  assets: {
    base: process.env.ASSETS_URL || '',
    images: process.env.IMAGES_URL || '',
  },
} as const

/**
 * Get the current base URL based on environment
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return urlConfig.production.base
  }
  return urlConfig.development.base
}

/**
 * Get fallback URL for use in runtime when config is not available
 * This is the key function Flexy uses to avoid hardcoded URLs!
 */
export function getFallbackUrl(): string {
  return DEFAULT_DEV_URL
}

/**
 * Build full URL from path
 */
export function buildUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Build API URL
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${urlConfig.api.base}/${urlConfig.api.version}/${cleanEndpoint}`
}

/**
 * Check if URL is localhost
 */
export function isLocalhost(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

/**
 * Get URL for SEO/meta purposes with fallback
 */
export function getSeoUrl(runtimeUrl?: string): string {
  return (
    runtimeUrl ||
    urlConfig.production.base ||
    urlConfig.development.base ||
    urlConfig.fallback
  )
}

// Type exports
export type UrlConfig = typeof urlConfig
export type DevPorts = typeof DEV_PORTS
