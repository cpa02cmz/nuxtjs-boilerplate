#!/usr/bin/env node
/**
 * BroCula's Browser Console Analyzer
 * Captures all console errors and warnings from key pages
 */

import { chromium } from 'playwright'
import fs from 'fs'

// Flexy hates hardcoded values! Using environment variable with fallback
const BASE_URL =
  process.env.BASE_URL || process.env.DEV_URL || 'http://localhost:3000'
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/search', name: 'Search' },
  { path: '/about', name: 'About' },
  { path: '/submit', name: 'Submit' },
  { path: '/ai-keys', name: 'AI Keys' },
]

const results = {
  timestamp: new Date().toISOString(),
  pages: [],
  summary: {
    totalErrors: 0,
    totalWarnings: 0,
    totalLogs: 0,
  },
}

async function analyzePage(browser, pageConfig) {
  const page = await browser.newPage()
  const pageResult = {
    name: pageConfig.name,
    path: pageConfig.path,
    url: `${BASE_URL}${pageConfig.path}`,
    consoleOutput: [],
    errorCount: 0,
    warningCount: 0,
    logCount: 0,
  }

  // Capture all console messages
  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString(),
    }
    pageResult.consoleOutput.push(entry)
    pageResult.logCount++

    if (msg.type() === 'error') {
      pageResult.errorCount++
      console.error(`❌ [${pageConfig.name}] ERROR: ${msg.text()}`)
    } else if (msg.type() === 'warning') {
      pageResult.warningCount++
      console.warn(`⚠️  [${pageConfig.name}] WARNING: ${msg.text()}`)
    } else {
      console.log(
        `ℹ️  [${pageConfig.name}] ${msg.type().toUpperCase()}: ${msg.text()}`
      )
    }
  })

  // Capture page errors
  page.on('pageerror', error => {
    const entry = {
      type: 'pageerror',
      text: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }
    pageResult.consoleOutput.push(entry)
    pageResult.errorCount++
    console.error(`❌❌ [${pageConfig.name}] PAGE ERROR: ${error.message}`)
  })

  // Capture request failures
  page.on('requestfailed', request => {
    const entry = {
      type: 'requestfailed',
      text: `Request failed: ${request.url()} - ${request.failure()?.errorText}`,
      timestamp: new Date().toISOString(),
    }
    pageResult.consoleOutput.push(entry)
    pageResult.errorCount++
    console.error(`🌐 [${pageConfig.name}] REQUEST FAILED: ${request.url()}`)
  })

  try {
    console.log(`\n🔍 Analyzing ${pageConfig.name} (${pageConfig.path})...`)
    await page.goto(`${BASE_URL}${pageConfig.path}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait for Vue to mount and any initial async operations
    await page.waitForTimeout(2000)

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    console.log(`✅ ${pageConfig.name} analysis complete`)
    console.log(`   - Errors: ${pageResult.errorCount}`)
    console.log(`   - Warnings: ${pageResult.warningCount}`)
    console.log(`   - Total logs: ${pageResult.logCount}`)
  } catch (error) {
    console.error(`❌ Failed to analyze ${pageConfig.name}:`, error.message)
    pageResult.errorCount++
    pageResult.consoleOutput.push({
      type: 'navigation-error',
      text: error.message,
      timestamp: new Date().toISOString(),
    })
  } finally {
    await page.close()
  }

  return pageResult
}

async function main() {
  console.log("🧛‍♂️ BroCula's Browser Console Analyzer")
  console.log('='.repeat(50))

  const browser = await chromium.launch({
    headless: true,
  })

  try {
    for (const pageConfig of PAGES) {
      const pageResult = await analyzePage(browser, pageConfig)
      results.pages.push(pageResult)
      results.summary.totalErrors += pageResult.errorCount
      results.summary.totalWarnings += pageResult.warningCount
      results.summary.totalLogs += pageResult.logCount
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 FINAL SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total Pages Analyzed: ${results.pages.length}`)
    console.log(`Total Errors: ${results.summary.totalErrors}`)
    console.log(`Total Warnings: ${results.summary.totalWarnings}`)
    console.log(`Total Logs: ${results.summary.totalLogs}`)

    if (results.summary.totalErrors > 0) {
      console.log('\n❌ CONSOLE ERRORS FOUND - FIX REQUIRED')
      process.exit(1)
    } else if (results.summary.totalWarnings > 0) {
      console.log('\n⚠️  CONSOLE WARNINGS FOUND - SHOULD BE FIXED')
    } else {
      console.log('\n✅ CONSOLE IS CLEAN!')
    }

    // Save detailed results
    fs.writeFileSync('console-analysis.json', JSON.stringify(results, null, 2))
    console.log('\n📄 Detailed results saved to console-analysis.json')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
