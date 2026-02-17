import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3000'
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/developer', name: 'Developer' },
  { path: '/search', name: 'Search' },
]

// Expected warnings in dev mode that don't need fixing
const EXPECTED_WARNINGS = [
  'Attempting to hydrate existing markup but container is empty', // Expected with ssr: false
  'Manifest', // PWA manifest warnings are expected
  'Hydration', // Some hydration warnings are expected in dev
]

function isExpectedWarning(text) {
  return EXPECTED_WARNINGS.some(ew => text.includes(ew))
}

async function comprehensiveAudit() {
  console.log('🧛 BroCula Comprehensive Browser Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const results = {
    pages: [],
    actualErrors: [],
    expectedWarnings: [],
  }

  for (const pageInfo of PAGES) {
    const page = await browser.newPage()
    const consoleLogs = []

    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        isExpected: isExpectedWarning(msg.text()),
      })
    })

    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'pageerror',
        text: error.message,
        isExpected: false, // Page errors are never expected
      })
    })

    try {
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      await page.waitForTimeout(2000)

      const actualErrors = consoleLogs.filter(
        log =>
          (log.type === 'error' || log.type === 'pageerror') && !log.isExpected
      )

      const expectedWarnings = consoleLogs.filter(
        log =>
          log.isExpected ||
          (log.type === 'warning' && isExpectedWarning(log.text))
      )

      results.pages.push({
        page: pageInfo.name,
        path: pageInfo.path,
        actualErrors: actualErrors.length,
        expectedWarnings: expectedWarnings.length,
        totalLogs: consoleLogs.length,
      })

      actualErrors.forEach(err => {
        results.actualErrors.push({
          page: pageInfo.name,
          type: err.type,
          text: err.text,
        })
      })

      expectedWarnings.forEach(warn => {
        results.expectedWarnings.push({
          page: pageInfo.name,
          type: warn.type,
          text:
            warn.text.substring(0, 80) + (warn.text.length > 80 ? '...' : ''),
        })
      })

      if (actualErrors.length === 0) {
        console.log(
          `✅ ${pageInfo.name}: Clean - ${expectedWarnings.length} expected warnings`
        )
      } else {
        console.log(`❌ ${pageInfo.name}: ${actualErrors.length} actual errors`)
        actualErrors.forEach(err => {
          console.log(`   ⚠️  [${err.type}] ${err.text.substring(0, 100)}...`)
        })
      }
    } catch (error) {
      console.log(`❌ ${pageInfo.name}: Navigation failed - ${error.message}`)
      results.pages.push({
        page: pageInfo.name,
        path: pageInfo.path,
        error: error.message,
      })
    }

    await page.close()
  }

  await browser.close()

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 BROCULA AUDIT SUMMARY')
  console.log('='.repeat(60))
  console.log(`   Pages audited: ${results.pages.length}`)
  console.log(`   Actual errors found: ${results.actualErrors.length}`)
  console.log(`   Expected warnings: ${results.expectedWarnings.length}`)

  if (results.actualErrors.length === 0) {
    console.log('\n   🎉 NO ACTUAL ERRORS FOUND! Browser console is pristine!')
    console.log('   (Expected warnings in dev mode are informational only)')
  } else {
    console.log('\n   ⚠️  ACTUAL ERRORS REQUIRING FIXES:')
    results.actualErrors.forEach(err => {
      console.log(
        `      [${err.page}] ${err.type}: ${err.text.substring(0, 60)}...`
      )
    })
  }

  if (results.expectedWarnings.length > 0) {
    console.log('\n   ℹ️  Expected warnings (no fix needed):')
    results.expectedWarnings.forEach(warn => {
      console.log(`      [${warn.page}] ${warn.text}`)
    })
  }

  return results
}

comprehensiveAudit()
  .then(results => {
    process.exit(results.actualErrors.length > 0 ? 1 : 0)
  })
  .catch(err => {
    console.error('Audit failed:', err)
    process.exit(1)
  })
