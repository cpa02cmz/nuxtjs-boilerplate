/**
 * External Services Constants
 * External URLs, social media, fonts, and third-party services
 * Flexy approves - centralized external service management!
 */

// External fonts
export const EXTERNAL_FONTS = {
  google: {
    url: 'https://fonts.googleapis.com',
    gstatic: 'https://fonts.gstatic.com',
    inter:
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
} as const

// Social media share URLs
export const SOCIAL_SHARE_URLS = {
  twitter: 'https://twitter.com/intent/tweet',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
  reddit: 'https://www.reddit.com/submit',
  email: 'mailto:',
} as const

// Default hashtags for social sharing
export const DEFAULT_HASHTAGS = ['FreeResources', 'WebDevelopment'] as const

// UTM parameter defaults
export const UTM_DEFAULTS = {
  source: 'social',
  medium: 'share',
  campaign: 'resource-sharing',
} as const

// CDN patterns
export const CDN_PATTERNS = {
  github: 'https://.*.githubusercontent.com/.*',
  images: '^https://.*.(png|jpe?g|gif|svg|webp)$',
} as const

// Cache durations (in seconds) for external resources
export const CACHE_DURATIONS = {
  api: 60 * 60 * 24, // 24 hours
  resources: 60 * 60 * 24 * 7, // 1 week
  fonts: 60 * 60 * 24 * 365, // 1 year
  assets: 60 * 60 * 24 * 30, // 30 days
  images: 60 * 60 * 24 * 7, // 1 week
  github: 60 * 60 * 24 * 7, // 1 week
} as const

// Security headers
export const SECURITY_HEADERS = {
  maxAge: 31536000, // 1 year in seconds
} as const

// RSS feed configuration
export const RSS_CONFIG = {
  maxItems: 50,
  defaultLimit: 20,
} as const

// Analytics retention
export const ANALYTICS_CONFIG = {
  defaultRetentionDays: 90,
} as const
