import { test, expect, type ConsoleMessage } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { DEFAULT_DEV_URL } from '../../configs/url.config'

// Types for console monitoring
interface ConsoleError {
  type: 'error' | 'warning'
  message: string
  location: string
  timestamp: number
  page: string
}

interface BroCulaReport {
  timestamp: string
  url: string
  errors: ConsoleError[]
  warnings: ConsoleError[]
  hasFatalErrors: boolean
  summary: {
    totalErrors: number
    totalWarnings: number
    pagesTested: number
  }
}

// Pages to test
const PAGES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/ai-keys', name: 'AI Keys' },
  { path: '/about', name: 'About' },
  { path: '/search', name: 'Search' },
  { path: '/submit', name: 'Submit' },
]

// Known acceptable warnings (can be configured)
const ACCEPTABLE_WARNINGS = [
  /Download the Vue Devtools extension/,
  /\[Vue warn\]: Component .+ is missing template/,
  /\[HMR\]/,
]

// Known acceptable errors (development only)
const ACCEPTABLE_ERRORS = [/\[vite\]/, /\[hmr\]/]

/**
 * BroCula Console Monitor
 * Strict workflow: Find browser console errors/warnings, fix immediately
 */
test.describe('BroCula Console Monitor', () => {
  const allErrors: ConsoleError[] = []
  const allWarnings: ConsoleError[] = []
  let currentPage = ''

  test.beforeEach(async ({ page }) => {
    // Capture console messages
    page.on('console', async (msg: ConsoleMessage) => {
      const type = msg.type()
      const text = msg.text()
      const location = msg.location()

      const consoleEntry: ConsoleError = {
        type: type === 'error' ? 'error' : 'warning',
        message: text,
        location: `${location.url}:${location.lineNumber}`,
        timestamp: Date.now(),
        page: currentPage,
      }

      if (type === 'error') {
        // Check if it's an acceptable error
        const isAcceptable = ACCEPTABLE_ERRORS.some(pattern =>
          pattern.test(text)
        )
        if (!isAcceptable) {
          allErrors.push(consoleEntry)
          console.error(`🚨 BroCula found ERROR on ${currentPage}: ${text}`)
        }
      } else if (type === 'warning') {
        // Check if it's an acceptable warning
        const isAcceptable = ACCEPTABLE_WARNINGS.some(pattern =>
          pattern.test(text)
        )
        if (!isAcceptable) {
          allWarnings.push(consoleEntry)
          console.warn(`⚠️  BroCula found WARNING on ${currentPage}: ${text}`)
        }
      }
    })

    // Capture page errors
    page.on('pageerror', error => {
      const consoleEntry: ConsoleError = {
        type: 'error',
        message: error.message,
        location: 'page-error',
        timestamp: Date.now(),
        page: currentPage,
      }
      allErrors.push(consoleEntry)
      console.error(
        `🚨 BroCula found PAGE ERROR on ${currentPage}: ${error.message}`
      )
    })
  })

  for (const pageConfig of PAGES_TO_TEST) {
    test(`monitor console for ${pageConfig.name}`, async ({ page }) => {
      currentPage = pageConfig.path

      // Navigate to page
      await page.goto(pageConfig.path)

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')

      // Wait a bit for any delayed console messages
      await page.waitForTimeout(2000)

      // Basic assertions to ensure page loaded
      await expect(page).toHaveTitle(/.+/)
    })
  }

  test.afterAll(async () => {
    // Generate BroCula report
    const report: BroCulaReport = {
      timestamp: new Date().toISOString(),
      url: process.env.BASE_URL || DEFAULT_DEV_URL,
      errors: allErrors,
      warnings: allWarnings,
      hasFatalErrors: allErrors.length > 0,
      summary: {
        totalErrors: allErrors.length,
        totalWarnings: allWarnings.length,
        pagesTested: PAGES_TO_TEST.length,
      },
    }

    // Save report
    const reportDir = path.join(process.cwd(), 'playwright-report')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportPath = path.join(reportDir, 'brocula-console-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Log summary
    console.log('\n📊 BroCula Console Monitoring Report')
    console.log('=====================================')
    console.log(`Total Errors: ${allErrors.length}`)
    console.log(`Total Warnings: ${allWarnings.length}`)
    console.log(`Pages Tested: ${PAGES_TO_TEST.length}`)
    console.log(`Report saved to: ${reportPath}`)

    // Fail test if there are errors (fatal)
    if (allErrors.length > 0) {
      console.error('\n❌ BroCula found FATAL console errors!')
      console.error('Errors must be fixed before proceeding.')
      console.error('\nErrors found:')
      allErrors.forEach((err, i) => {
        console.error(`  ${i + 1}. [${err.page}] ${err.message}`)
      })
      throw new Error(
        `BroCula detected ${allErrors.length} console error(s). Fix immediately!`
      )
    }

    if (allWarnings.length > 0) {
      console.warn(
        '\n⚠️  BroCula found warnings (non-fatal but should be addressed):'
      )
      allWarnings.forEach((warn, i) => {
        console.warn(`  ${i + 1}. [${warn.page}] ${warn.message}`)
      })
    }
  })
})
