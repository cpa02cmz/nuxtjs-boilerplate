import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3000'
const PAGES = ['/', '/about', '/developer', '/search']

async function auditConsole() {
  console.log('🧛 BroCula Browser Console Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const results = []

  for (const pagePath of PAGES) {
    const page = await context.newPage()
    const consoleLogs = []

    // Capture console messages
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      })
    })

    // Capture page errors
    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'pageerror',
        text: error.message,
        stack: error.stack,
      })
    })

    try {
      await page.goto(`${BASE_URL}${pagePath}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait a bit for any async console messages
      await page.waitForTimeout(2000)

      const errors = consoleLogs.filter(
        log =>
          log.type === 'error' ||
          log.type === 'pageerror' ||
          (log.type === 'warning' && !log.text.includes('Manifest'))
      )

      results.push({
        page: pagePath,
        errors: errors,
        totalLogs: consoleLogs.length,
      })

      console.log(`✅ ${pagePath}: ${errors.length} errors/warnings`)

      if (errors.length > 0) {
        errors.forEach(err => {
          console.log(
            `   ⚠️  [${err.type}] ${err.text.substring(0, 100)}${err.text.length > 100 ? '...' : ''}`
          )
        })
      }
    } catch (error) {
      console.log(`❌ ${pagePath}: Failed to load - ${error.message}`)
      results.push({
        page: pagePath,
        errors: [{ type: 'navigation', text: error.message }],
        totalLogs: 0,
      })
    }

    await page.close()
  }

  await browser.close()

  // Summary
  console.log('\n📊 Audit Summary:')
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  console.log(`   Total pages audited: ${results.length}`)
  console.log(`   Total errors/warnings: ${totalErrors}`)

  if (totalErrors === 0) {
    console.log('   🎉 No console errors found! Browser console is pristine!')
  }

  return results
}

auditConsole().catch(console.error)
