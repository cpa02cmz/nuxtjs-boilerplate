/**
 * Application Configuration
 * Centralized configuration for all app settings
 * Flexy says: "No more hardcoded values!"
 */

// Site Information
export const SITE_CONFIG = {
  name: 'Free Stuff on the Internet',
  shortName: 'FreeStuff',
  description:
    'Discover the best free tools and resources for developers, designers, and creators',
  url: process.env.NUXT_PUBLIC_CANONICAL_URL || 'http://localhost:3000',
  author: 'Free Stuff Team',
  language: 'en',
  locale: 'en_US',
} as const

// PWA Configuration
export const PWA_CONFIG = {
  themeColor: '#4f46e5',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  iconSizes: ['192x192', '512x512'],
  maskableIconSizes: ['192x192', '512x512'],
  appleStatusBarStyle: 'black-translucent',
  globPatterns: ['**/*.{js,css,html,png,svg,ico,jpg,webp,woff2}'],
  navigateFallback: '/',
} as const

// External Services URLs
export const EXTERNAL_SERVICES = {
  // Font services
  googleFonts: 'https://fonts.googleapis.com',
  googleFontsStatic: 'https://fonts.gstatic.com',

  // CDN services
  unpkg: 'https://unpkg.com',
  jsdelivr: 'https://cdn.jsdelivr.net',

  // Social media
  twitter: 'https://twitter.com',
  facebook: 'https://facebook.com',
  linkedin: 'https://linkedin.com',

  // Schema.org
  schemaOrg: 'https://schema.org',
} as const

// Currency Configuration
export const CURRENCY_CONFIG = {
  defaultCurrency: 'USD',
  defaultPrice: '0',
  supportedCurrencies: ['USD', 'EUR', 'GBP'],
} as const

// Rating Configuration
export const RATING_CONFIG = {
  minRating: 1,
  maxRating: 5,
  defaultRatingCount: 10,
  defaultBestRating: 5,
  defaultWorstRating: 1,
} as const

// Date Format Configuration
export const DATE_FORMATS = {
  iso: 'YYYY-MM-DD',
  display: 'MMM DD, YYYY',
  sitemap: 'YYYY-MM-DD',
  export: 'YYYY-MM-DD_HH-mm',
} as const

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  searchFocus: '/',
  escape: 'Escape',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  enter: 'Enter',
  tab: 'Tab',
} as const

// Default Values
export const DEFAULT_VALUES = {
  operatingSystem: 'Web',
  availability: 'InStock',
  category: 'Development',
  pricingModel: 'Free',
  difficulty: 'Beginner',
} as const

// Platform Configuration
export const PLATFORM_CONFIG = {
  operatingSystems: ['Web', 'Windows', 'macOS', 'Linux', 'iOS', 'Android'],
  separator: ', ',
} as const

// Image Configuration
export const IMAGE_CONFIG = {
  quality: 80,
  formats: ['webp', 'avif', 'jpeg'],
  densities: [1, 2],
  placeholder:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
  sizes: {
    thumbnail: { width: 48, height: 48 },
    small: { width: 100, height: 100 },
    medium: { width: 200, height: 200 },
    large: { width: 400, height: 400 },
  },
} as const

// Sitemap Configuration
export const SITEMAP_CONFIG = {
  priorities: {
    home: '1.0',
    category: '0.9',
    search: '0.8',
    resource: '0.7',
    comparison: '0.6',
    about: '0.5',
    submit: '0.5',
  },
  changeFrequencies: {
    home: 'daily',
    category: 'daily',
    search: 'weekly',
    resource: 'weekly',
    comparison: 'monthly',
    about: 'monthly',
    submit: 'monthly',
  },
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  enablePWA: true,
  enableAnalytics: true,
  enableSearchSuggestions: true,
  enableBookmarks: true,
  enableComparisons: true,
  enableWebhooks: true,
  enableRateLimiting: true,
  enableCache: true,
} as const

// Export all configs
export default {
  site: SITE_CONFIG,
  pwa: PWA_CONFIG,
  external: EXTERNAL_SERVICES,
  currency: CURRENCY_CONFIG,
  rating: RATING_CONFIG,
  dateFormats: DATE_FORMATS,
  keyboard: KEYBOARD_SHORTCUTS,
  defaults: DEFAULT_VALUES,
  platform: PLATFORM_CONFIG,
  image: IMAGE_CONFIG,
  sitemap: SITEMAP_CONFIG,
  features: FEATURE_FLAGS,
}
