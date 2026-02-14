import { chromium, type Browser, type Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ConsoleEntry {
  type: 'error' | 'warning' | 'log' | 'info'
  message: string
  location?: string
  timestamp: string
}

interface PageResult {
  url: string
  consoleEntries: ConsoleEntry[]
  errors: ConsoleEntry[]
  warnings: ConsoleEntry[]
  loadTime: number
}

async function runConsoleAudit(): Promise<void> {
  const results: PageResult[] = []
  const consoleEntries: ConsoleEntry[] = []

  // Critical pages to test
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/about', name: 'About' },
    { url: '/search', name: 'Search' },
    { url: '/submit', name: 'Submit' },
    { url: '/ai-keys', name: 'AI Keys' },
  ]

  let browser: Browser | null = null

  try {
    console.log('🦇 BroCula: Starting browser console audit...\n')

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })

    // Test each page
    for (const pageConfig of pages) {
      const page = await context.newPage()
      const pageConsoleEntries: ConsoleEntry[] = []

      // Listen to console events
      page.on('console', async msg => {
        const type = msg.type() as 'error' | 'warning' | 'log' | 'info'
        const text = msg.text()
        const location = msg.location()?.url

        const entry: ConsoleEntry = {
          type,
          message: text,
          location,
          timestamp: new Date().toISOString(),
        }

        pageConsoleEntries.push(entry)
        consoleEntries.push(entry)

        if (type === 'error') {
          console.error(`❌ [${pageConfig.name}] Console Error: ${text}`)
        } else if (type === 'warning') {
          console.warn(`⚠️  [${pageConfig.name}] Console Warning: ${text}`)
        }
      })

      // Listen to page errors
      page.on('pageerror', error => {
        const entry: ConsoleEntry = {
          type: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
        }
        pageConsoleEntries.push(entry)
        consoleEntries.push(entry)
        console.error(`❌ [${pageConfig.name}] Page Error: ${error.message}`)
      })

      try {
        const startTime = Date.now()
        await page.goto(`http://localhost:3000${pageConfig.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })
        const loadTime = Date.now() - startTime

        // Wait a bit for any async console messages
        await page.waitForTimeout(2000)

        const errors = pageConsoleEntries.filter(e => e.type === 'error')
        const warnings = pageConsoleEntries.filter(e => e.type === 'warning')

        results.push({
          url: pageConfig.url,
          consoleEntries: pageConsoleEntries,
          errors,
          warnings,
          loadTime,
        })

        console.log(
          `✅ [${pageConfig.name}] Loaded in ${loadTime}ms - ${errors.length} errors, ${warnings.length} warnings`
        )
      } catch (error) {
        console.error(`❌ [${pageConfig.name}] Failed to load: ${error}`)
        results.push({
          url: pageConfig.url,
          consoleEntries: pageConsoleEntries,
          errors: [
            ...pageConsoleEntries.filter(e => e.type === 'error'),
            {
              type: 'error',
              message: String(error),
              timestamp: new Date().toISOString(),
            },
          ],
          warnings: pageConsoleEntries.filter(e => e.type === 'warning'),
          loadTime: -1,
        })
      } finally {
        await page.close()
      }
    }

    // Generate report
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)

    console.log('\n' + '='.repeat(60))
    console.log('🦇 BroCula Browser Console Audit Report')
    console.log('='.repeat(60))
    console.log(`Total Pages Tested: ${results.length}`)
    console.log(`Total Console Errors: ${totalErrors}`)
    console.log(`Total Console Warnings: ${totalWarnings}`)
    console.log('='.repeat(60) + '\n')

    // Save report
    const reportDir = 'playwright-report'
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        pagesTested: results.length,
        totalErrors,
        totalWarnings,
        status: totalErrors === 0 && totalWarnings === 0 ? 'PASS' : 'FAIL',
      },
      results,
    }

    fs.writeFileSync(
      path.join(reportDir, 'brocula-console-report.json'),
      JSON.stringify(report, null, 2)
    )

    console.log(
      `📊 Report saved to: ${path.join(reportDir, 'brocula-console-report.json')}`
    )

    if (totalErrors > 0 || totalWarnings > 0) {
      console.log('\n⚠️  Issues found! Please review and fix.')
      process.exit(1)
    } else {
      console.log('\n✅ No console errors or warnings found!')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ Audit failed:', error)
    process.exit(1)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

runConsoleAudit()
