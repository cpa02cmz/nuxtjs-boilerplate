#!/usr/bin/env node
/**
 * BroCula Browser Console Analysis
 * Detects and reports console errors and warnings
 */

const { chromium } = require('playwright')

// Flexy hates hardcoded values! Using environment variable with fallback
const BASE_URL =
  process.env.BASE_URL || process.env.DEV_URL || 'http://localhost:3000'
const ROUTES = ['/', '/about', '/search', '/submit', '/ai-keys']

const consoleErrors = []
const consoleWarnings = []

async function analyzePage(page, route) {
  const url = `${BASE_URL}${route}`
  console.log(`\n🔍 Analyzing: ${url}`)

  // Clear previous logs
  consoleErrors.length = 0
  consoleWarnings.length = 0

  // Listen to console events
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location()

    if (type === 'error') {
      consoleErrors.push({ route, text, location })
    } else if (type === 'warning') {
      consoleWarnings.push({ route, text, location })
    }
  })

  // Listen to page errors
  page.on('pageerror', error => {
    consoleErrors.push({
      route,
      text: error.message,
      location: { url: route, lineNumber: 0, columnNumber: 0 },
    })
  })

  // Navigate and wait for load
  await page.goto(url, { waitUntil: 'networkidle' })

  // Wait a bit for any async operations
  await page.waitForTimeout(2000)

  return {
    errors: [...consoleErrors],
    warnings: [...consoleWarnings],
  }
}

async function main() {
  console.log('🧛 BroCula starting browser console analysis...\n')

  const browser = await chromium.launch({ headless: true })
  const results = {
    totalErrors: 0,
    totalWarnings: 0,
    routes: [],
  }

  try {
    for (const route of ROUTES) {
      const context = await browser.newContext()
      const page = await context.newPage()

      const { errors, warnings } = await analyzePage(page, route)

      results.routes.push({
        route,
        errors,
        warnings,
      })

      results.totalErrors += errors.length
      results.totalWarnings += warnings.length

      if (errors.length > 0) {
        console.log(`  ❌ ${errors.length} error(s) found`)
        errors.forEach(err =>
          console.log(`     - ${err.text.substring(0, 100)}`)
        )
      }

      if (warnings.length > 0) {
        console.log(`  ⚠️  ${warnings.length} warning(s) found`)
        warnings.forEach(warn =>
          console.log(`     - ${warn.text.substring(0, 100)}`)
        )
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  ✅ Clean`)
      }

      await context.close()
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 ANALYSIS SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Errors: ${results.totalErrors}`)
    console.log(`Total Warnings: ${results.totalWarnings}`)

    if (results.totalErrors > 0 || results.totalWarnings > 0) {
      console.log('\n❌ FATAL: Console errors/warnings detected!')
      process.exit(1)
    } else {
      console.log('\n✅ SUCCESS: No console errors or warnings!')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n💥 BroCula encountered an error:', error.message)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

main()
