// ============================================
// PERFORMANCE CONFIGURATION
// Budgets, thresholds, and optimization settings
// ============================================

export const PERFORMANCE_CONFIG = {
  // Bundle size budgets (in bytes)
  budgets: {
    script: 250000, // 250KB
    style: 100000, // 100KB
    image: 300000, // 300KB
    font: 50000, // 50KB
    total: 500000, // 500KB
  },

  // Thresholds
  thresholds: {
    // Web Vitals (in milliseconds)
    lcp: 2500, // Largest Contentful Paint
    fid: 100, // First Input Delay
    cls: 0.1, // Cumulative Layout Shift
    ttfb: 600, // Time to First Byte
    fcp: 1800, // First Contentful Paint
    inp: 200, // Interaction to Next Paint

    // Resource loading
    imageLoadTime: 1000,
    scriptLoadTime: 2000,
    apiResponseTime: 500,
  },

  // Lazy loading
  lazyLoading: {
    imageOffset: '200px',
    componentOffset: '100px',
    debounceMs: 100,
  },

  // Caching strategies
  caching: {
    staticMaxAge: 31536000, // 1 year
    imageMaxAge: 2592000, // 30 days
    apiMaxAge: 60, // 1 minute
  },

  // Preload/prefetch
  preloading: {
    criticalResources: ['fonts', 'main.css'],
    prefetchRoutes: ['/about', '/search'],
  },
} as const

// Image optimization config
export const IMAGE_CONFIG = {
  // Default quality
  quality: 80,

  // Formats
  formats: ['webp', 'avif', 'jpg'],

  // Sizes
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200,
    xl: 1920,
  },

  // Placeholder
  placeholder: {
    color: '#e5e7eb',
    size: 20,
  },
} as const
