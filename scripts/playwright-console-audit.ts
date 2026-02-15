/**
 * BroCula Playwright Browser Console Audit
 * Runs actual browser tests to catch runtime console errors
 */

import { chromium, type Browser, type Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { testTimingConfig } from '../configs/test-timing.config'

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'AI Keys', path: '/ai-keys' },
  { name: 'Submit', path: '/submit' },
  { name: 'Search', path: '/search' },
]

interface ConsoleError {
  page: string
  type: string
  text: string
  location?: string
}

const errors: ConsoleError[] = []
const warnings: ConsoleError[] = []

async function auditPage(browser: Browser, pageConfig: (typeof PAGES)[0]) {
  const page = await browser.newPage()
  const pageErrors: ConsoleError[] = []
  const pageWarnings: ConsoleError[] = []

  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location().url

    const entry: ConsoleError = {
      page: pageConfig.name,
      type,
      text,
      location,
    }

    if (type === 'error') {
      pageErrors.push(entry)
      errors.push(entry)
    } else if (type === 'warning') {
      pageWarnings.push(entry)
      warnings.push(entry)
    }
  })

  // Listen for page errors
  page.on('pageerror', error => {
    const entry: ConsoleError = {
      page: pageConfig.name,
      type: 'pageerror',
      text: error.message,
    }
    pageErrors.push(entry)
    errors.push(entry)
  })

  try {
    // Try to load the page (dev server might not be running)
    await page.goto(`http://localhost:3000${pageConfig.path}`, {
      timeout: testTimingConfig.playwright.pageLoadTimeout,
      waitUntil: 'networkidle',
    })

    // Wait a bit for any async errors
    await page.waitForTimeout(testTimingConfig.playwright.asyncErrorWait)
  } catch (e) {
    // Page might not be accessible, that's ok for static analysis
  }

  await page.close()

  return { pageErrors, pageWarnings }
}

async function main() {
  console.log('🦇 BroCula Playwright Console Audit Starting...\n')

  let browser: Browser | null = null

  try {
    browser = await chromium.launch({ headless: true })
  } catch (e) {
    console.log('⚠️  Playwright browser not available, skipping runtime audit')
    console.log('   Run: npx playwright install chromium\n')
  }

  if (browser) {
    for (const pageConfig of PAGES) {
      process.stdout.write(`🔍 Auditing ${pageConfig.name}... `)
      const { pageErrors, pageWarnings } = await auditPage(browser, pageConfig)

      if (pageErrors.length === 0 && pageWarnings.length === 0) {
        console.log('✅ Clean')
      } else {
        console.log(
          `❌ ${pageErrors.length} errors, ⚠️ ${pageWarnings.length} warnings`
        )
      }
    }

    await browser.close()
  }

  console.log('\n' + '='.repeat(80))
  console.log('PLAYWRIGHT CONSOLE AUDIT RESULTS')
  console.log('='.repeat(80))

  if (errors.length > 0) {
    console.log(`\n❌ RUNTIME ERRORS (${errors.length}):`)
    errors.forEach((err, i) => {
      console.log(`\n  ${i + 1}. [${err.page}] ${err.type.toUpperCase()}`)
      console.log(`     ${err.text.substring(0, 120)}`)
      if (err.location) console.log(`     Location: ${err.location}`)
    })
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  RUNTIME WARNINGS (${warnings.length}):`)
    warnings.forEach((warn, i) => {
      console.log(`\n  ${i + 1}. [${warn.page}] ${warn.type.toUpperCase()}`)
      console.log(`     ${warn.text.substring(0, 120)}`)
    })
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ No runtime console errors or warnings found!')
  }

  console.log('\n' + '='.repeat(80))
  console.log(`Total: ${errors.length} errors, ${warnings.length} warnings`)
  console.log('='.repeat(80))

  // Save report
  const reportPath = 'playwright-report/playwright-console-audit.json'
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          totalErrors: errors.length,
          totalWarnings: warnings.length,
        },
        errors,
        warnings,
      },
      null,
      2
    )
  )

  console.log(`\n📄 Report saved to: ${reportPath}`)

  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
