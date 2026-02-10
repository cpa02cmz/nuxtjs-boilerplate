// CDN Configuration - External resource URLs
// Flexy hates hardcoded values! All external CDN URLs are now configurable.

export const cdnConfig = {
  // Swagger UI CDN
  swagger: {
    // CSS URL
    cssUrl:
      process.env.SWAGGER_CSS_URL ||
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    // JavaScript bundle URL
    jsUrl:
      process.env.SWAGGER_JS_URL ||
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
    // Version (used for cache busting)
    version: process.env.SWAGGER_VERSION || '5',
  },

  // Google Fonts CDN
  fonts: {
    // Google Fonts API URL
    apiUrl: process.env.FONTS_API_URL || 'https://fonts.googleapis.com',
    // Static font serving URL
    staticUrl: process.env.FONTS_STATIC_URL || 'https://fonts.gstatic.com',
  },

  // Analytics/Tracking CDNs (for future use)
  analytics: {
    // Plausible Analytics
    plausible: process.env.PLAUSIBLE_URL || 'https://plausible.io',
    // Google Analytics
    googleAnalytics: process.env.GA_URL || 'https://www.google-analytics.com',
  },

  // Common CDN providers
  providers: {
    // unpkg - NPM package CDN
    unpkg: process.env.CDN_UNPKG || 'https://unpkg.com',
    // jsDelivr - NPM/GitHub CDN
    jsdelivr: process.env.CDN_JSDELIVR || 'https://cdn.jsdelivr.net',
    // cdnjs - Cloudflare CDN
    cdnjs: process.env.CDN_CDNJS || 'https://cdnjs.cloudflare.com',
  },

  // Resource hints for performance
  dnsPrefetch: [
    process.env.FONTS_API_URL || 'https://fonts.googleapis.com',
    process.env.FONTS_STATIC_URL || 'https://fonts.gstatic.com',
  ],

  preconnect: [process.env.FONTS_STATIC_URL || 'https://fonts.gstatic.com'],
} as const

export type CdnConfig = typeof cdnConfig
