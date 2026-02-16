#!/usr/bin/env node
/**
 * BroCula 🧛 Browser Console Audit Script
 * Uses Playwright to monitor console errors across all pages
 */

const { chromium } = require('playwright')
const { performance } = require('perf_hooks')

const routes = [
  { path: 'http://localhost:3000/', name: 'Home' },
  { path: 'http://localhost:3000/about', name: 'About' },
  { path: 'http://localhost:3000/search', name: 'Search' },
  { path: 'http://localhost:3000/ai-keys', name: 'AI Keys' },
  { path: 'http://localhost:3000/submit', name: 'Submit' },
]

async function auditConsole() {
  console.log('🧛 BroCula - Starting Browser Console Audit...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  const allErrors = []
  const allWarnings = []

  for (const route of routes) {
    const page = await context.newPage()
    const pageErrors = []
    const pageWarnings = []

    // Monitor console
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      if (type === 'error') {
        pageErrors.push({ text, location: msg.location()?.url })
      } else if (type === 'warning') {
        pageWarnings.push({ text, location: msg.location()?.url })
      }
    })

    page.on('pageerror', error => {
      pageErrors.push({ text: error.message, location: 'pageerror' })
    })

    try {
      const startTime = performance.now()
      await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 })
      const loadTime = performance.now() - startTime

      // Wait for async operations
      await page.waitForTimeout(2000)

      console.log(`✅ ${route.name}: ${loadTime.toFixed(0)}ms`)

      if (pageErrors.length > 0) {
        console.log(`   ❌ ${pageErrors.length} errors`)
        allErrors.push(...pageErrors.map(e => ({ ...e, page: route.name })))
      }

      if (pageWarnings.length > 0) {
        console.log(`   ⚠️  ${pageWarnings.length} warnings`)
        allWarnings.push(...pageWarnings.map(w => ({ ...w, page: route.name })))
      }
    } catch (error) {
      console.log(`❌ ${route.name}: Failed to load - ${error.message}`)
      allErrors.push({
        text: error.message,
        location: 'navigation',
        page: route.name,
      })
    } finally {
      await page.close()
    }
  }

  await browser.close()

  console.log('\n' + '='.repeat(60))
  console.log('🧛 BroCula Audit Results')
  console.log('='.repeat(60))

  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log('✅ Console is pristine! No errors or warnings found.')
    process.exit(0)
  }

  if (allErrors.length > 0) {
    console.log(`\n❌ ERRORS (${allErrors.length}):`)
    allErrors.forEach((err, i) => {
      console.log(`\n${i + 1}. [${err.page}]`)
      console.log(`   ${err.text.substring(0, 200)}`)
      if (err.location) console.log(`   Location: ${err.location}`)
    })
  }

  if (allWarnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${allWarnings.length}):`)
    allWarnings.forEach((warn, i) => {
      console.log(`\n${i + 1}. [${warn.page}]`)
      console.log(`   ${warn.text.substring(0, 200)}`)
    })
  }

  process.exit(allErrors.length > 0 ? 1 : 0)
}

auditConsole().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
