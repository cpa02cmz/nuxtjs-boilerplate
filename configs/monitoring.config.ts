// Monitoring Configuration - Browser monitoring and script settings
// Flexy hates hardcoded values! All monitoring settings are now configurable.

export const monitoringConfig = {
  // Base URL for monitoring scripts
  baseUrl:
    process.env.MONITOR_BASE_URL ||
    process.env.BASE_URL ||
    'http://localhost:3000',

  // Pages to monitor (used by BroCula scripts)
  pages: {
    // Full list for comprehensive monitoring
    full: [
      { path: '/', name: 'Home' },
      { path: '/about', name: 'About' },
      { path: '/search', name: 'Search' },
      { path: '/submit', name: 'Submit' },
      { path: '/favorites', name: 'Favorites' },
      { path: '/resources/1', name: 'Resource Detail' },
      { path: '/compare', name: 'Compare' },
      { path: '/analytics', name: 'Analytics' },
      { path: '/developer', name: 'Developer' },
      { path: '/moderation', name: 'Moderation' },
    ],
    // Essential pages for quick monitoring
    essential: [
      { path: '/', name: 'Home' },
      { path: '/search', name: 'Search' },
      { path: '/about', name: 'About' },
      { path: '/submit', name: 'Submit' },
      { path: '/ai-keys', name: 'AI Keys' },
    ],
  },

  // Timeouts (in milliseconds)
  timeouts: {
    // Navigation timeout
    navigationMs: parseInt(
      process.env.MONITOR_TIMEOUT_NAVIGATION_MS || '30000'
    ),
    // Page load timeout
    pageLoadMs: parseInt(process.env.MONITOR_TIMEOUT_PAGE_LOAD_MS || '30000'),
    // Script execution timeout
    scriptTimeoutMs: parseInt(process.env.MONITOR_TIMEOUT_SCRIPT_MS || '60000'),
  },

  // Delays (in milliseconds)
  delays: {
    // Wait after page load for console messages
    consoleWaitMs: parseInt(process.env.MONITOR_DELAY_CONSOLE_MS || '2000'),
    // Wait for Vue to mount
    vueMountMs: parseInt(process.env.MONITOR_DELAY_VUE_MS || '2000'),
    // Wait after scrolling
    scrollMs: parseInt(process.env.MONITOR_DELAY_SCROLL_MS || '1000'),
    // Wait between page navigations
    betweenPagesMs: parseInt(
      process.env.MONITOR_DELAY_BETWEEN_PAGES_MS || '500'
    ),
  },

  // Console monitoring settings
  console: {
    // Capture page errors
    capturePageErrors: process.env.MONITOR_CAPTURE_PAGE_ERRORS !== 'false',
    // Capture request failures
    captureRequestFailures:
      process.env.MONITOR_CAPTURE_REQUEST_FAILURES !== 'false',
    // Log all console messages (not just errors/warnings)
    verbose: process.env.MONITOR_VERBOSE === 'true',
  },

  // Reporting settings
  reports: {
    // Directory for reports
    directory: process.env.MONITOR_REPORTS_DIR || './reports',
    // File names
    files: {
      lighthouse: 'lighthouse-report.json',
      issues: 'issues-report.json',
      console: 'console-analysis.json',
    },
  },

  // Browser settings
  browser: {
    // Run headless
    headless: process.env.MONITOR_HEADLESS !== 'false',
    // Chrome flags
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
  },

  // Performance measurement
  performance: {
    // Delay before measuring performance metrics
    measurementDelayMs: parseInt(
      process.env.MONITOR_PERFORMANCE_DELAY_MS || '1000'
    ),
  },

  // Exit codes
  exitCodes: {
    success: 0,
    issuesFound: 1,
    fatalError: 1,
  },
} as const

export type MonitoringConfig = typeof monitoringConfig
