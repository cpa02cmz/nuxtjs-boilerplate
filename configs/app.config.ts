// App Configuration - Branding and Application Settings
// Flexy hates hardcoded values! All app settings are now configurable.

export const appConfig = {
  // Application Branding
  name: process.env.APP_NAME || 'Free Stuff on the Internet',
  shortName: process.env.APP_SHORT_NAME || 'Free Resources',
  description:
    process.env.APP_DESCRIPTION ||
    'Discover amazing free resources available on the internet - from AI tools to hosting services.',
  author: process.env.APP_AUTHOR || 'Free Stuff on the Internet',

  // Language and Locale
  lang: process.env.APP_LANG || 'en',

  // Contact and Social
  twitterHandle: process.env.TWITTER_HANDLE || '@yourTwitterHandle',

  // Base URLs
  baseUrl: {
    // Production URL from env or default
    production: process.env.NUXT_PUBLIC_CANONICAL_URL || '',
    // Development fallback URL
    development: process.env.DEV_BASE_URL || 'http://localhost:3000',
    // Default fallback when no other URL is available
    default: process.env.DEFAULT_BASE_URL || 'http://localhost:3000',
  },

  // Feature Flags
  features: {
    enablePWA: process.env.ENABLE_PWA !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableSearch: process.env.ENABLE_SEARCH !== 'false',
    enableBookmarks: process.env.ENABLE_BOOKMARKS !== 'false',
  },
} as const

export type AppConfig = typeof appConfig
