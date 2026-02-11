// Lighthouse Configuration - Lighthouse audit settings and thresholds
// Flexy hates hardcoded values! All Lighthouse settings are now configurable.

export const lighthouseConfig = {
  // Emulation settings
  emulation: {
    // Form factor
    formFactor: (process.env.LIGHTHOUSE_FORM_FACTOR || 'desktop') as
      | 'desktop'
      | 'mobile',

    // Network throttling
    throttling: {
      // Round-trip time in milliseconds
      rttMs: parseInt(process.env.LIGHTHOUSE_RTT_MS || '40'),
      // Throughput in Kbps
      throughputKbps: parseInt(
        process.env.LIGHTHOUSE_THROUGHPUT_KBPS || '10240'
      ),
      // CPU slowdown multiplier
      cpuSlowdownMultiplier: parseInt(
        process.env.LIGHTHOUSE_CPU_SLOWDOWN || '1'
      ),
      // Request latency
      requestLatencyMs: parseInt(
        process.env.LIGHTHOUSE_REQUEST_LATENCY_MS || '0'
      ),
      // Download throughput
      downloadThroughputKbps: parseInt(
        process.env.LIGHTHOUSE_DOWNLOAD_THROUGHPUT_KBPS || '0'
      ),
      // Upload throughput
      uploadThroughputKbps: parseInt(
        process.env.LIGHTHOUSE_UPLOAD_THROUGHPUT_KBPS || '0'
      ),
    },

    // Screen emulation
    screenEmulation: {
      mobile: process.env.LIGHTHOUSE_MOBILE_EMULATION === 'true',
      width: parseInt(process.env.LIGHTHOUSE_SCREEN_WIDTH || '1350'),
      height: parseInt(process.env.LIGHTHOUSE_SCREEN_HEIGHT || '940'),
      deviceScaleFactor: parseInt(
        process.env.LIGHTHOUSE_DEVICE_SCALE_FACTOR || '1'
      ),
      disabled: process.env.LIGHTHOUSE_SCREEN_DISABLED === 'true',
    },

    // User agent
    emulatedUserAgent:
      process.env.LIGHTHOUSE_USER_AGENT ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },

  // Categories to audit
  categories: {
    performance: true,
    accessibility: true,
    'best-practices': true,
    seo: true,
    pwa: process.env.LIGHTHOUSE_INCLUDE_PWA === 'true',
  },

  // Score thresholds
  thresholds: {
    // Development mode thresholds (lower due to dev overhead)
    development: {
      performance: parseInt(process.env.LIGHTHOUSE_THRESHOLD_PERF_DEV || '60'),
      accessibility: parseInt(
        process.env.LIGHTHOUSE_THRESHOLD_ACCESSIBILITY_DEV || '90'
      ),
      'best-practices': parseInt(
        process.env.LIGHTHOUSE_THRESHOLD_BEST_PRACTICES_DEV || '90'
      ),
      seo: parseInt(process.env.LIGHTHOUSE_THRESHOLD_SEO_DEV || '90'),
    },
    // Production mode thresholds (stricter)
    production: {
      performance: parseInt(process.env.LIGHTHOUSE_THRESHOLD_PERF_PROD || '90'),
      accessibility: parseInt(
        process.env.LIGHTHOUSE_THRESHOLD_ACCESSIBILITY_PROD || '90'
      ),
      'best-practices': parseInt(
        process.env.LIGHTHOUSE_THRESHOLD_BEST_PRACTICES_PROD || '90'
      ),
      seo: parseInt(process.env.LIGHTHOUSE_THRESHOLD_SEO_PROD || '90'),
    },
  },

  // Report settings
  reports: {
    // Directory for reports
    directory: process.env.LIGHTHOUSE_REPORTS_DIR || 'playwright-report',
    // File names
    files: {
      summary: 'brocula-lighthouse-report.json',
      full: 'lighthouse-full-report.json',
    },
    // Include detailed audit results
    includeDetails: process.env.LIGHTHOUSE_INCLUDE_DETAILS !== 'false',
  },

  // Audit settings
  audits: {
    // Log level - Flexy hates hardcoded values!
    logLevel: (process.env.LIGHTHOUSE_LOG_LEVEL || 'error') as
      | 'verbose'
      | 'info'
      | 'warn'
      | 'error'
      | 'silent',
    // Output format - Flexy loves flexibility!
    output: (process.env.LIGHTHOUSE_OUTPUT || 'json') as
      | 'json'
      | 'html'
      | 'csv',
  },

  // Chrome launcher settings
  chrome: {
    // Chrome flags - Flexy loves modularity!
    flags: ['--headless', '--no-sandbox', '--disable-gpu'] as string[],
  },

  // Helper function to get thresholds based on environment
  getThresholds: (isDev: boolean) => {
    return isDev
      ? lighthouseConfig.thresholds.development
      : lighthouseConfig.thresholds.production
  },
} as const

// Build full Lighthouse config object for use with lighthouse library
export function buildLighthouseConfig() {
  return {
    extends: 'lighthouse:default',
    settings: {
      formFactor: lighthouseConfig.emulation.formFactor,
      throttling: lighthouseConfig.emulation.throttling,
      screenEmulation: lighthouseConfig.emulation.screenEmulation,
      emulatedUserAgent: lighthouseConfig.emulation.emulatedUserAgent,
    },
  }
}

// Get minimum scores for current environment
export function getMinimumScores(isDev: boolean) {
  return lighthouseConfig.getThresholds(isDev)
}

export type LighthouseConfig = typeof lighthouseConfig
