// Sitemap Configuration - Sitemap priorities and changefreq values
// Flexy hates hardcoded values! All sitemap settings are now configurable.

export const sitemapConfig = {
  // XML Namespaces
  namespaces: {
    sitemap: 'http://www.sitemaps.org/schemas/sitemap/0.9',
    w3cSvg: 'http://www.w3.org/2000/svg',
  },

  // Priority values (0.0 to 1.0)
  priorities: {
    homepage: '1.0',
    high: '0.9',
    mediumHigh: '0.8',
    medium: '0.7',
    mediumLow: '0.6',
    low: '0.5',
    resourceDefault: '0.7',
  },

  // Change frequency values
  changefreq: {
    always: 'always',
    hourly: 'hourly',
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
    yearly: 'yearly',
    never: 'never',
  },

  // Static pages configuration
  staticPages: {
    homepage: {
      path: '/',
      priority: '1.0',
      changefreq: 'daily',
    },
    aiKeys: {
      path: '/ai-keys',
      priority: '0.9',
      changefreq: 'weekly',
    },
    about: {
      path: '/about',
      priority: '0.8',
      changefreq: 'monthly',
    },
    search: {
      path: '/search',
      priority: '0.9',
      changefreq: 'daily',
    },
    submit: {
      path: '/submit',
      priority: '0.7',
      changefreq: 'monthly',
    },
    favorites: {
      path: '/favorites',
      priority: '0.8',
      changefreq: 'weekly',
    },
  },

  // Default values for dynamic content
  defaults: {
    resourcePriority: '0.7',
    resourceChangefreq: 'weekly',
    maxResourcesInSitemap: parseInt(
      process.env.SITEMAP_MAX_RESOURCES || '1000'
    ),
  },

  // Error response
  error: {
    message: 'Failed to generate sitemap',
  },
} as const

// Type for sitemap page entry
export interface SitemapPageEntry {
  path: string
  priority: string
  changefreq: string
}

// Type exports
export type SitemapConfig = typeof sitemapConfig

// Helper to get all static pages as sitemap entries
export function getStaticPages(includeFavorites = false): SitemapPageEntry[] {
  const pages: SitemapPageEntry[] = [
    { ...sitemapConfig.staticPages.homepage },
    { ...sitemapConfig.staticPages.aiKeys },
    { ...sitemapConfig.staticPages.about },
    { ...sitemapConfig.staticPages.search },
    { ...sitemapConfig.staticPages.submit },
  ]

  if (includeFavorites) {
    pages.push({ ...sitemapConfig.staticPages.favorites })
  }

  return pages
}

// Helper to get default resource sitemap entry
export function getResourceSitemapDefaults() {
  return {
    priority: sitemapConfig.defaults.resourcePriority,
    changefreq: sitemapConfig.defaults.resourceChangefreq,
  }
}
