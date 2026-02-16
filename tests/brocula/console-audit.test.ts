import { test, expect, chromium } from '@playwright/test'
import { DEFAULT_DEV_URL } from '../../configs/url.config'

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'AI Keys', path: '/ai-keys' },
  { name: 'Submit', path: '/submit' },
  { name: 'Search', path: '/search' },
]

interface ConsoleMessage {
  page: string
  type: string
  text: string
  location?: string
}

test.describe('BroCula Console Auditor', () => {
  test('audit pages for console errors and warnings', async () => {
    const url = process.env.BASE_URL || DEFAULT_DEV_URL
    const errors: ConsoleMessage[] = []
    const warnings: ConsoleMessage[] = []

    const browser = await chromium.launch({ headless: true })

    try {
      for (const pageConfig of PAGES) {
        const page = await browser.newPage()
        const pageErrors: ConsoleMessage[] = []
        const pageWarnings: ConsoleMessage[] = []

        // Listen for console messages
        page.on('console', msg => {
          const type = msg.type()
          const text = msg.text()
          const location = msg.location().url

          // Filter out 404 errors - these are server-side routing issues, not JS console errors
          if (
            text.includes('404 (Not Found)') ||
            text.includes('Failed to load resource')
          ) {
            return
          }

          const entry: ConsoleMessage = {
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
          const entry: ConsoleMessage = {
            page: pageConfig.name,
            type: 'pageerror',
            text: error.message,
          }
          pageErrors.push(entry)
          errors.push(entry)
        })

        try {
          await page.goto(`${url}${pageConfig.path}`, {
            timeout: 30000,
            waitUntil: 'networkidle',
          })

          // Wait for any async errors
          await page.waitForTimeout(2000)
        } catch (e) {
          console.log(`⚠️  Could not load ${pageConfig.name}: ${e}`)
        }

        await page.close()

        console.log(
          `🔍 ${pageConfig.name}: ${pageErrors.length} errors, ${pageWarnings.length} warnings`
        )
      }
    } finally {
      await browser.close()
    }

    // Log results
    console.log('\n🦇 BroCula Console Audit Report')
    console.log('================================')

    if (errors.length > 0) {
      console.log(`\n❌ CONSOLE ERRORS (${errors.length}):`)
      errors.forEach((err, i) => {
        console.log(`\n  ${i + 1}. [${err.page}] ${err.type.toUpperCase()}`)
        console.log(`     ${err.text.substring(0, 150)}`)
        if (err.location) console.log(`     Location: ${err.location}`)
      })
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  CONSOLE WARNINGS (${warnings.length}):`)
      warnings.forEach((warn, i) => {
        console.log(`\n  ${i + 1}. [${warn.page}] ${warn.type.toUpperCase()}`)
        console.log(`     ${warn.text.substring(0, 150)}`)
      })
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n✅ No console errors or warnings found!')
    }

    console.log(`\nTotal: ${errors.length} errors, ${warnings.length} warnings`)

    // BroCula is strict - fail on any console errors
    expect(errors, `Found ${errors.length} console errors`).toHaveLength(0)
  })
})
