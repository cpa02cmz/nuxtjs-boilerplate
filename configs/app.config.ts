// ============================================
// APP CONFIGURATION
// Site metadata, SEO, and branding constants
// ============================================

export const APP_CONFIG = {
  // Site identity
  name: 'Free Stuff on the Internet',
  shortName: 'FreeStuff',
  description:
    'Discover the best free developer tools, resources, and services. Curated collection of free APIs, hosting, databases, and more.',
  tagline: 'Discover the best free tools and resources for developers',

  // URLs
  url: process.env.NUXT_PUBLIC_CANONICAL_URL || 'http://localhost:3000',
  canonicalUrl:
    process.env.NUXT_PUBLIC_CANONICAL_URL || 'http://localhost:3000',

  // Contact & Social
  author: 'Free Stuff Team',
  contactEmail: 'hello@freestuff.dev',
  githubUrl: 'https://github.com/freestuff',
  twitterHandle: '@freestuff',

  // Branding
  themeColor: '#4f46e5',
  backgroundColor: '#ffffff',
  msTileColor: '#4f46e5',

  // Language
  defaultLocale: 'en',
  supportedLocales: ['en'],

  // Feature flags
  features: {
    pwa: true,
    analytics: true,
    searchSuggestions: true,
    bookmarks: true,
    comparisons: true,
    submissions: true,
    moderation: true,
  },
} as const

// SEO Defaults
export const SEO_CONFIG = {
  // Meta tags
  titleTemplate: '%s | Free Stuff on the Internet',
  defaultTitle: 'Free Stuff on the Internet',
  separator: ' | ',

  // Keywords
  defaultKeywords: [
    'free developer tools',
    'free APIs',
    'free hosting',
    'free databases',
    'developer resources',
    'free software',
    'open source tools',
  ],

  // Open Graph
  ogType: 'website',
  ogImage: '/og-image.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterCreator: '@freestuff',

  // Robots
  robots: 'index, follow',
  googleBot:
    'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1',

  // Sitemap
  sitemap: {
    defaultPriority: 0.5,
    homepagePriority: '1.0',
    aboutPriority: '0.9',
    searchPriority: '0.8',
    resourcePriority: '0.7',
    changefreq: 'daily',
  },
} as const

// External Service URLs
export const EXTERNAL_URLS = {
  // Social sharing
  social: {
    twitter: 'https://twitter.com/intent/tweet',
    facebook: 'https://www.facebook.com/sharer/sharer.php',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
    reddit: 'https://www.reddit.com/submit',
  },

  // CDNs and external resources
  cdn: {
    googleFonts: 'https://fonts.googleapis.com',
    googleFontsStatic: 'https://fonts.gstatic.com',
    githubAssets: 'https://raw.githubusercontent.com',
    githubUserContent: 'https://*.githubusercontent.com',
  },

  // API documentation
  docs: {
    apiSpec: '/api-docs/spec.json',
    apiDocs: '/api-docs',
  },

  // Health check endpoint
  healthCheck: '/favicon.ico',
} as const

// Internal API Endpoints
export const API_ENDPOINTS = {
  // Analytics
  analytics: {
    events: '/api/analytics/events',
    track: '/api/analytics/track',
  },

  // Resources
  resources: {
    list: '/api/v1/resources',
    detail: (id: string) => `/api/v1/resources/${id}`,
    search: '/api/v1/search',
    suggestions: '/api/search/suggestions',
  },

  // Webhooks
  webhooks: {
    list: '/api/v1/webhooks',
    trigger: '/api/v1/webhooks/trigger',
    test: '/api/v1/webhooks/test',
  },

  // Moderation
  moderation: {
    queue: '/api/moderation/queue',
    approve: '/api/moderation/approve',
    reject: '/api/moderation/reject',
    flag: '/api/moderation/flag',
  },

  // Submissions
  submissions: '/api/submissions',

  // RSS
  rss: '/api/v1/rss',

  // Sitemap
  sitemap: '/sitemap.xml',
} as const
