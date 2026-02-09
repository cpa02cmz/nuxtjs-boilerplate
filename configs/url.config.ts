// URL Configuration - Base URLs and URL-related constants
// Flexy hates hardcoded values! All URL settings are now configurable.

/**
 * Get base URL from environment or runtime config
 * Priority: NUXT_PUBLIC_SITE_URL > NUXT_PUBLIC_CANONICAL_URL > default
 */
export function getBaseUrl(): string {
  // Server-side: check process.env first
  if (typeof process !== 'undefined') {
    const envUrl =
      process.env.NUXT_PUBLIC_SITE_URL ||
      process.env.NUXT_PUBLIC_CANONICAL_URL ||
      process.env.BASE_URL
    if (envUrl) return envUrl
  }

  // Client-side or fallback: use runtime config if available
  try {
    const config = useRuntimeConfig()
    return (
      config.public.siteUrl ||
      config.public.canonicalUrl ||
      urlConfig.defaults.base
    )
  } catch {
    // Fallback for when useRuntimeConfig is not available
    return urlConfig.defaults.base
  }
}

/**
 * Get canonical URL for SEO purposes
 */
export function getCanonicalUrl(): string {
  // Server-side: check process.env first
  if (typeof process !== 'undefined') {
    const envUrl =
      process.env.NUXT_PUBLIC_CANONICAL_URL ||
      process.env.NUXT_PUBLIC_SITE_URL ||
      process.env.BASE_URL
    if (envUrl) return envUrl
  }

  // Client-side or fallback
  try {
    const config = useRuntimeConfig()
    return (
      config.public.canonicalUrl ||
      config.public.siteUrl ||
      urlConfig.defaults.canonical
    )
  } catch {
    return urlConfig.defaults.canonical
  }
}

export const urlConfig = {
  // Default URLs
  defaults: {
    base: process.env.NUXT_PUBLIC_DEFAULT_URL || 'http://localhost:3000',
    canonical:
      process.env.NUXT_PUBLIC_CANONICAL_URL ||
      process.env.NUXT_PUBLIC_DEFAULT_URL ||
      'http://localhost:3000',
  },

  // Development URLs
  development: {
    base: process.env.DEV_BASE_URL || 'http://localhost:3000',
  },

  // Production URLs
  production: {
    base: process.env.PROD_BASE_URL || '',
  },

  // External services
  external: {
    // Social media
    twitter: process.env.URL_TWITTER || 'https://twitter.com/intent/tweet',
    facebook:
      process.env.URL_FACEBOOK || 'https://www.facebook.com/sharer/sharer.php',
    linkedin:
      process.env.URL_LINKEDIN ||
      'https://www.linkedin.com/sharing/share-offsite/',
    reddit: process.env.URL_REDDIT || 'https://www.reddit.com/submit',

    // Developer resources
    github: process.env.URL_GITHUB || 'https://github.com',
    npm: process.env.URL_NPM || 'https://www.npmjs.com',

    // Fonts and CDNs
    googleFonts: 'https://fonts.googleapis.com',
    googleFontsStatic: 'https://fonts.gstatic.com',
    unpkg: 'https://unpkg.com',
    githubusercontent: 'https://*.githubusercontent.com',
  },

  // API endpoints (relative paths)
  api: {
    base: process.env.API_BASE_PATH || '/api',
    v1: process.env.API_V1_PATH || '/api/v1',
    resources: process.env.API_RESOURCES_PATH || '/api/v1/resources',
    search: process.env.API_SEARCH_PATH || '/api/v1/search',
    webhooks: process.env.API_WEBHOOKS_PATH || '/api/v1/webhooks',
    submissions: process.env.API_SUBMISSIONS_PATH || '/api/submissions',
  },

  // Page paths
  paths: {
    home: '/',
    search: '/search',
    submit: '/submit',
    about: '/about',
    favorites: '/favorites',
    aiKeys: '/ai-keys',
    compare: '/compare',
    resources: '/resources',
    moderation: '/moderation',
    apiKeys: '/api-keys',
    analytics: '/analytics',
    webhooks: '/webhooks',
  },

  // Schema.org URLs
  schema: {
    context: 'https://schema.org',
    availabilityInStock: 'https://schema.org/InStock',
  },

  // Sitemap namespace
  sitemap: {
    namespace: 'http://www.sitemaps.org/schemas/sitemap/0.9',
  },
} as const

// Type exports
export type UrlConfig = typeof urlConfig
export type ExternalUrl = keyof typeof urlConfig.external
export type ApiPath = keyof typeof urlConfig.api
export type PagePath = keyof typeof urlConfig.paths

// Helper functions
export function buildUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function buildResourceUrl(resourceId: string, baseUrl?: string): string {
  return buildUrl(`/resources/${resourceId}`, baseUrl)
}

export function buildApiUrl(
  endpoint: keyof typeof urlConfig.api,
  baseUrl?: string
): string {
  const path = urlConfig.api[endpoint]
  return buildUrl(path, baseUrl)
}

export function buildSocialShareUrl(
  platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit',
  params: { url: string; title?: string; text?: string }
): string {
  const { url, title = '', text = '' } = params
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(text)

  switch (platform) {
    case 'twitter':
      return `${urlConfig.external.twitter}?text=${encodedText}&url=${encodedUrl}`
    case 'facebook':
      return `${urlConfig.external.facebook}?u=${encodedUrl}`
    case 'linkedin':
      return `${urlConfig.external.linkedin}?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`
    case 'reddit':
      return `${urlConfig.external.reddit}?title=${encodedTitle}&url=${encodedUrl}`
    default:
      return ''
  }
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

export function isInternalUrl(url: string): boolean {
  return !isExternalUrl(url) || url.startsWith(getBaseUrl())
}

export function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '') // Remove trailing slash
}
