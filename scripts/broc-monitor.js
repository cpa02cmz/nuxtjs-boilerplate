#!/usr/bin/env node
/**
 * BroCula - Browser Console & Lighthouse Monitor
 *
 * This script monitors browser console for errors/warnings and
 * runs Lighthouse audits to find optimization opportunities.
 */

import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const BASE_URL = 'http://localhost:3001'
const REPORTS_DIR = './reports'

// Pages to test
const PAGES = [
  '/',
  '/about',
  '/search',
  '/submit',
  '/favorites',
  '/resources/1',
  '/compare',
  '/analytics',
  '/developer',
  '/moderation',
]

// Store all issues found
const issues = {
  consoleErrors: [],
  consoleWarnings: [],
  lighthouseIssues: [],
}

async function captureConsoleErrors() {
  console.log('🔍 BroCula scanning for console errors...\n')

  const browser = await chromium.launch({ headless: true })

  for (const pagePath of PAGES) {
    const context = await browser.newContext()
    const page = await context.newPage()

    const pageErrors = []
    const pageWarnings = []

    // Capture console messages
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      if (type === 'error') {
        pageErrors.push({ type, text })
        issues.consoleErrors.push({ page: pagePath, type, text })
      } else if (type === 'warning') {
        pageWarnings.push({ type, text })
        issues.consoleWarnings.push({ page: pagePath, type, text })
      }
    })

    // Capture page errors
    page.on('pageerror', error => {
      pageErrors.push({ type: 'pageerror', text: error.message })
      issues.consoleErrors.push({
        page: pagePath,
        type: 'pageerror',
        text: error.message,
      })
    })

    try {
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000) // Wait for any delayed console messages

      console.log(`  ✅ ${pagePath}`)
      if (pageErrors.length > 0) {
        console.log(`     ⚠️  ${pageErrors.length} error(s) found`)
      }
      if (pageWarnings.length > 0) {
        console.log(`     ⚡ ${pageWarnings.length} warning(s) found`)
      }
    } catch (error) {
      console.log(`  ❌ ${pagePath} - Failed to load: ${error.message}`)
      issues.consoleErrors.push({
        page: pagePath,
        type: 'navigation',
        text: error.message,
      })
    }

    await context.close()
  }

  await browser.close()
  console.log('\n')
}

async function runLighthouseAudit() {
  console.log('🚦 BroCula running Lighthouse audit...\n')

  let chrome
  try {
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })

    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    }

    // Run on main page
    const runnerResult = await lighthouse(`${BASE_URL}/`, options)
    const report = runnerResult.report

    // Parse and extract issues
    const categories = report.categories
    const audits = report.audits

    console.log('  📊 Lighthouse Scores:')
    console.log(
      `     Performance: ${Math.round(categories.performance.score * 100)}%`
    )
    console.log(
      `     Accessibility: ${Math.round(categories.accessibility.score * 100)}%`
    )
    console.log(
      `     Best Practices: ${Math.round(categories['best-practices'].score * 100)}%`
    )
    console.log(`     SEO: ${Math.round(categories.seo.score * 100)}%`)
    console.log('\n')

    // Find failed audits
    for (const [auditId, audit] of Object.entries(audits)) {
      if (
        audit.score !== null &&
        audit.score < 1 &&
        audit.scoreDisplayMode !== 'manual'
      ) {
        issues.lighthouseIssues.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue,
        })
      }
    }

    // Save report
    if (!existsSync(REPORTS_DIR)) {
      mkdirSync(REPORTS_DIR, { recursive: true })
    }
    writeFileSync(
      join(REPORTS_DIR, 'lighthouse-report.json'),
      JSON.stringify(report, null, 2)
    )
    console.log(`  📄 Report saved to ${REPORTS_DIR}/lighthouse-report.json\n`)
  } catch (error) {
    console.error('  ❌ Lighthouse audit failed:', error.message)
    console.log(
      '     (This is OK if Chrome is not available in this environment)\n'
    )
  } finally {
    if (chrome) {
      await chrome.kill()
    }
  }
}

function generateFixesReport() {
  console.log('📝 BroCula generating fixes report...\n')

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalErrors: issues.consoleErrors.length,
      totalWarnings: issues.consoleWarnings.length,
      totalLighthouseIssues: issues.lighthouseIssues.length,
    },
    issues,
  }

  writeFileSync(
    join(REPORTS_DIR, 'issues-report.json'),
    JSON.stringify(report, null, 2)
  )

  console.log('  📊 Summary:')
  console.log(`     ❌ Console Errors: ${report.summary.totalErrors}`)
  console.log(`     ⚡ Console Warnings: ${report.summary.totalWarnings}`)
  console.log(
    `     🔧 Lighthouse Issues: ${report.summary.totalLighthouseIssues}`
  )
  console.log(`\n  📄 Full report saved to ${REPORTS_DIR}/issues-report.json\n`)

  return report
}

async function main() {
  console.log('🧛 BroCula starting browser monitoring...\n')
  console.log('='.repeat(60))
  console.log('\n')

  try {
    await captureConsoleErrors()
    await runLighthouseAudit()
    const report = generateFixesReport()

    if (report.summary.totalErrors > 0 || report.summary.totalWarnings > 0) {
      console.log('⚠️  Issues found! BroCula will fix them...\n')
      process.exit(1) // Exit with error to trigger fixes
    } else {
      console.log('✅ No issues found! BroCula is happy.\n')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ BroCula encountered an error:', error)
    process.exit(1)
  }
}

main()
