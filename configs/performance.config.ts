// Performance Configuration - Issue #2404 Fix
// Core Web Vitals optimization settings for Lighthouse 90+ score
// Flexy hates hardcoded values! All performance settings are configurable.

export const performanceConfig = {
  // Lazy Loading Configuration
  lazyLoading: {
    // Default root margin for intersection observer
    rootMargin: process.env.PERF_LAZY_ROOT_MARGIN || '50px',
    // Threshold for triggering load (0-1)
    threshold: parseFloat(process.env.PERF_LAZY_THRESHOLD || '0.1'),
    // Delay before loading component (ms)
    delay: parseInt(process.env.PERF_LAZY_DELAY || '0'),
    // Timeout for lazy loading (ms)
    timeout: parseInt(process.env.PERF_LAZY_TIMEOUT || '10000'),
    // Components to lazy load (below fold)
    components: {
      // Enable lazy loading for heavy components
      enabled: process.env.PERF_LAZY_COMPONENTS_ENABLED !== 'false',
      // List of component patterns to lazy load
      patterns: (
        process.env.PERF_LAZY_COMPONENTS || 'footer,sponsors,stats'
      ).split(','),
    },
  },

  // Image Loading Optimization
  images: {
    // Use native lazy loading
    nativeLazyLoading: process.env.PERF_IMAGE_NATIVE_LAZY !== 'false',
    // Priority for above-fold images
    highPriorityCount: parseInt(process.env.PERF_IMAGE_HIGH_PRIORITY || '3'),
    // Image formats priority
    formats: (process.env.PERF_IMAGE_FORMATS || 'webp,avif,jpeg').split(','),
    // Quality setting
    quality: parseInt(process.env.PERF_IMAGE_QUALITY || '80'),
    // Placeholder strategy
    placeholder: process.env.PERF_IMAGE_PLACEHOLDER || 'blur',
    // Sizes attribute for responsive images
    sizes: process.env.PERF_IMAGE_SIZES || '100vw',
  },

  // LCP (Largest Contentful Paint) Optimization
  lcp: {
    // Preload critical fonts
    preloadFonts: process.env.PERF_LCP_PRELOAD_FONTS !== 'false',
    // Preload critical images
    preloadImages: process.env.PERF_LCP_PRELOAD_IMAGES !== 'false',
    // Preload LCP element
    preloadLcpElement: process.env.PERF_LCP_PRELOAD_ELEMENT !== 'false',
    // Critical CSS above fold
    criticalCss: {
      enabled: process.env.PERF_CRITICAL_CSS_ENABLED !== 'false',
      // Max size for critical CSS (KB)
      maxSize: parseInt(process.env.PERF_CRITICAL_CSS_MAX_SIZE || '14'),
    },
    // Target LCP time (ms)
    targetTimeMs: parseInt(process.env.PERF_LCP_TARGET_MS || '2500'),
  },

  // CLS (Cumulative Layout Shift) Optimization
  cls: {
    // Reserve space for images
    imageAspectRatio: process.env.PERF_CLS_IMAGE_ASPECT !== 'false',
    // Reserve space for ads/embeds
    adSlots: process.env.PERF_CLS_AD_SLOTS !== 'false',
    // Font display strategy
    fontDisplay: process.env.PERF_FONT_DISPLAY || 'swap',
    // Target CLS score
    targetScore: parseFloat(process.env.PERF_CLS_TARGET || '0.1'),
  },

  // INP (Interaction to Next Paint) Optimization
  inp: {
    // Event handler batching
    eventBatching: process.env.PERF_INP_EVENT_BATCHING !== 'false',
    // Debounce scroll/resize events
    debounceEvents: process.env.PERF_INP_DEBOUNCE !== 'false',
    // Debounce delay (ms)
    debounceDelay: parseInt(process.env.PERF_INP_DEBOUNCE_DELAY || '16'),
    // Target INP time (ms)
    targetTimeMs: parseInt(process.env.PERF_INP_TARGET_MS || '200'),
  },

  // Bundle Optimization
  bundle: {
    // Enable tree shaking
    treeShaking: process.env.PERF_BUNDLE_TREE_SHAKE !== 'false',
    // Split chunks by route
    routeSplitting: process.env.PERF_BUNDLE_ROUTE_SPLIT !== 'false',
    // Dynamic imports for heavy modules
    dynamicImports: process.env.PERF_BUNDLE_DYNAMIC_IMPORTS !== 'false',
    // Preload critical chunks
    preloadCritical: process.env.PERF_BUNDLE_PRELOAD !== 'false',
    // Target bundle size (MB)
    targetSizeMB: parseFloat(process.env.PERF_BUNDLE_TARGET_SIZE || '3'),
  },

  // Resource Hints
  resourceHints: {
    // Preconnect to required origins
    preconnect: (process.env.PERF_PRECONNECT_ORIGINS || '')
      .split(',')
      .filter(Boolean),
    // DNS prefetch for third-party domains
    dnsPrefetch: (process.env.PERF_DNS_PREFETCH || '')
      .split(',')
      .filter(Boolean),
    // Prefetch likely next pages
    prefetch: process.env.PERF_PREFETCH_PAGES === 'true',
  },

  // Caching Strategy
  caching: {
    // Static asset cache duration (seconds)
    staticMaxAge: parseInt(process.env.PERF_CACHE_STATIC_MAX_AGE || '31536000'),
    // API cache duration (seconds)
    apiMaxAge: parseInt(process.env.PERF_CACHE_API_MAX_AGE || '60'),
    // HTML cache duration (seconds)
    htmlMaxAge: parseInt(process.env.PERF_CACHE_HTML_MAX_AGE || '0'),
  },

  // Third-party Script Optimization
  thirdParty: {
    // Defer non-critical scripts
    deferScripts: process.env.PERF_DEFER_SCRIPTS !== 'false',
    // Async load analytics
    asyncAnalytics: process.env.PERF_ASYNC_ANALYTICS !== 'false',
    // Load ads on user interaction
    lazyAds: process.env.PERF_LAZY_ADS === 'true',
  },

  // Monitoring
  monitoring: {
    // Enable performance marks
    performanceMarks: process.env.PERF_MONITORING_MARKS !== 'false',
    // Report slow interactions
    reportSlowInteractions: process.env.PERF_MONITORING_SLOW_INT === 'true',
    // Slow interaction threshold (ms)
    slowInteractionThreshold: parseInt(
      process.env.PERF_SLOW_INT_THRESHOLD || '100'
    ),
  },
} as const

// Helper to check if feature is enabled
export function isPerformanceFeatureEnabled(
  feature: keyof typeof performanceConfig
): boolean {
  const config = performanceConfig[feature]
  if (typeof config === 'object' && config !== null && 'enabled' in config) {
    return (config as { enabled: boolean }).enabled
  }
  return true
}

// Get LCP optimization settings
export function getLcpConfig() {
  return performanceConfig.lcp
}

// Get CLS optimization settings
export function getClsConfig() {
  return performanceConfig.cls
}

// Get INP optimization settings
export function getInpConfig() {
  return performanceConfig.inp
}

export type PerformanceConfig = typeof performanceConfig
