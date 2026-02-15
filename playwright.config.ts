import { defineConfig, devices } from '@playwright/test'
import { DEFAULT_DEV_URL } from './configs/url.config'
import { testTimingConfig } from './configs/test-timing.config'

/**
 * BroCula Playwright Configuration
 * Strict workflow for console error monitoring and Lighthouse optimization
 * Flexy says: No more hardcoded URLs!
 */
export default defineConfig({
  testDir: './tests/brocula',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || DEFAULT_DEV_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Capture console messages
    launchOptions: {
      args: ['--enable-logging', '--v=1'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run build && npm run preview',
        url: DEFAULT_DEV_URL,
        reuseExistingServer: true,
        timeout: testTimingConfig.playwright.webServerTimeout,
      },
})
