const { chromium } = require('playwright')

// Flexy hates hardcoded values! Use environment variable or fallback to default
const BASE_URL =
  process.env.BASE_URL || process.env.DEV_URL || 'http://localhost:3000'
const PAGES = ['/', '/search', '/submit', '/favorites', '/compare', '/about']

async function checkConsoleErrors() {
  const browser = await chromium.launch()
  const allErrors = []
  const allWarnings = []

  for (const pagePath of PAGES) {
    const page = await browser.newPage()
    const errors = []
    const warnings = []

    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      const location = msg.location
        ? ` at ${msg.location.url}:${msg.location.lineNumber}`
        : ''

      if (type === 'error') {
        errors.push({ text, location, page: pagePath })
      } else if (type === 'warning') {
        warnings.push({ text, location, page: pagePath })
      }
    })

    page.on('pageerror', error => {
      errors.push({
        text: error.message,
        location: 'page error',
        page: pagePath,
      })
    })

    try {
      await page.goto(`${BASE_URL}${pagePath}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })
      await page.waitForTimeout(2000) // Wait for any async operations
    } catch (e) {
      console.error(`Failed to load ${pagePath}:`, e.message)
    }

    await page.close()

    allErrors.push(...errors)
    allWarnings.push(...warnings)
  }

  await browser.close()

  console.log('\n=== Browser Console Analysis ===\n')

  if (allErrors.length === 0) {
    console.log('✅ No console errors found')
  } else {
    console.log(`❌ Found ${allErrors.length} console error(s):`)
    allErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.page}] ${err.text}${err.location}`)
    })
  }

  console.log('')

  if (allWarnings.length === 0) {
    console.log('✅ No console warnings found')
  } else {
    console.log(`⚠️  Found ${allWarnings.length} console warning(s):`)
    allWarnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. [${warn.page}] ${warn.text}${warn.location}`)
    })
  }

  return { errors: allErrors, warnings: allWarnings }
}

checkConsoleErrors()
  .then(result => {
    process.exit(result.errors.length > 0 ? 1 : 0)
  })
  .catch(err => {
    console.error('Error running console check:', err)
    process.exit(1)
  })
