import { chromium } from 'playwright'
import { monitoringConfig } from '../configs/monitoring.config.ts'

const BASE_URL = monitoringConfig.baseUrl
const PAGES = monitoringConfig.pages.full.map(page => page.path)

async function auditPage(page, url) {
  const consoleLogs = []
  const errors = []
  const warnings = []

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const log = { type, text, url }

    consoleLogs.push(log)

    if (type === 'error') {
      errors.push(log)
    } else if (type === 'warning') {
      warnings.push(log)
    }
  })

  // Capture page errors
  page.on('pageerror', error => {
    const log = {
      type: 'pageerror',
      text: error.message,
      url,
      stack: error.stack,
    }
    errors.push(log)
    consoleLogs.push(log)
  })

  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: monitoringConfig.timeouts.navigationMs,
    })
    await page.waitForTimeout(monitoringConfig.delays.consoleWaitMs)

    return { url, consoleLogs, errors, warnings }
  } catch (e) {
    return {
      url,
      consoleLogs,
      errors: [...errors, { type: 'navigation', text: e.message, url }],
      warnings,
    }
  }
}

async function runAudit() {
  console.log('🦇 BroCula Browser Console Audit Starting...\n')

  const browser = await chromium.launch({
    headless: monitoringConfig.browser.headless,
  })
  const context = await browser.newContext()

  const allResults = []
  let totalErrors = 0
  let totalWarnings = 0

  for (const pagePath of PAGES) {
    const page = await context.newPage()
    const result = await auditPage(page, pagePath)
    allResults.push(result)

    totalErrors += result.errors.length
    totalWarnings += result.warnings.length

    console.log(`\n📄 ${pagePath || 'Home'}`)
    console.log(
      `   Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`
    )

    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        console.log(`   ❌ ERROR: ${err.text}`)
      })
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => {
        console.log(`   ⚠️  WARNING: ${warn.text}`)
      })
    }

    await page.close()
  }

  await browser.close()

  console.log('\n' + '='.repeat(60))
  console.log('📊 AUDIT SUMMARY')
  console.log('='.repeat(60))
  console.log(`Total Pages Checked: ${PAGES.length}`)
  console.log(`Total Errors: ${totalErrors}`)
  console.log(`Total Warnings: ${totalWarnings}`)
  console.log('='.repeat(60))

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('✅ All clear! No console errors or warnings found.')
  } else if (totalErrors === 0) {
    console.log('⚠️  No errors, but warnings found.')
  } else {
    console.log('❌ FATAL: Console errors detected!')
    process.exit(monitoringConfig.exitCodes.issuesFound)
  }

  return allResults
}

runAudit().catch(err => {
  console.error('Audit failed:', err)
  process.exit(monitoringConfig.exitCodes.fatalError)
})
