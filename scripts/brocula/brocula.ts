#!/usr/bin/env node
/**
 * BroCula - Browser Console & Lighthouse Optimization Tool
 *
 * Strict Workflow:
 * 1. Find browser console errors/warnings, fix immediately
 * 2. Find Lighthouse optimization opportunities, optimize code based on it
 * 3. Fatal on build/lint errors
 *
 * Usage:
 *   npm run brocula:monitor    - Monitor console for errors
 *   npm run brocula:lighthouse - Run Lighthouse audit
 *   npm run brocula:full       - Run full BroCula workflow
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const REPORT_DIR = './playwright-report'
const FATAL_EXIT_CODE = 1
const SUCCESS_EXIT_CODE = 0

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logBroCula() {
  log(
    `
🦇 BROCULA - Browser Console & Lighthouse Guardian 🦇
====================================================
Strict Mode: Build/Lint errors are FATAL
`,
    'magenta'
  )
}

function runCommand(command: string, fatal: boolean = true): boolean {
  try {
    log(`\n🔧 Running: ${command}`, 'cyan')
    execSync(command, { stdio: 'inherit' })
    return true
  } catch (error) {
    log(`\n❌ Command failed: ${command}`, 'red')
    if (fatal) {
      log('\n💀 BroCula: This is a FATAL error. Fix immediately!', 'red')
      process.exit(FATAL_EXIT_CODE)
    }
    return false
  }
}

function checkLint() {
  log('\n📋 Step 1: Checking lint...', 'blue')
  return runCommand('npm run lint', true)
}

function checkBuild() {
  log('\n🏗️  Step 2: Checking build...', 'blue')
  return runCommand('npm run build', true)
}

function runConsoleMonitor() {
  log('\n🖥️  Step 3: Monitoring browser console...', 'blue')
  return runCommand(
    'npx playwright test tests/brocula/console-monitor.test.ts --reporter=list',
    true
  )
}

function runLighthouseAudit() {
  log('\n🎯 Step 4: Running Lighthouse audit...', 'blue')
  return runCommand(
    'npx playwright test tests/brocula/lighthouse-audit.test.ts --reporter=list',
    true
  )
}

function generateSummary() {
  log('\n📊 Generating BroCula Summary Report...', 'cyan')

  const summary: any = {
    timestamp: new Date().toISOString(),
    status: 'success',
    checks: {},
  }

  // Check console report
  const consoleReportPath = path.join(REPORT_DIR, 'brocula-console-report.json')
  if (fs.existsSync(consoleReportPath)) {
    const consoleReport = JSON.parse(
      fs.readFileSync(consoleReportPath, 'utf-8')
    )
    summary.checks.console = {
      errors: consoleReport.summary.totalErrors,
      warnings: consoleReport.summary.totalWarnings,
      pagesTested: consoleReport.summary.pagesTested,
      passed: consoleReport.summary.totalErrors === 0,
    }
  }

  // Check Lighthouse report
  const lighthouseReportPath = path.join(
    REPORT_DIR,
    'brocula-lighthouse-report.json'
  )
  if (fs.existsSync(lighthouseReportPath)) {
    const lighthouseReport = JSON.parse(
      fs.readFileSync(lighthouseReportPath, 'utf-8')
    )
    summary.checks.lighthouse = {
      scores: lighthouseReport.scores,
      optimizations: lighthouseReport.optimizations.length,
      failedAudits: lighthouseReport.failedAudits.length,
      passed: lighthouseReport.passed,
    }
  }

  // Save summary
  const summaryPath = path.join(REPORT_DIR, 'brocula-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))

  // Display summary
  log('\n✅ BroCula Summary:', 'green')
  log('====================', 'green')

  if (summary.checks.console) {
    const consoleCheck = summary.checks.console
    log(`\n🖥️  Console Check:`, 'bright')
    log(
      `   Errors: ${consoleCheck.errors} ${consoleCheck.errors === 0 ? '✅' : '❌'}`,
      consoleCheck.errors === 0 ? 'green' : 'red'
    )
    log(
      `   Warnings: ${consoleCheck.warnings} ${consoleCheck.warnings === 0 ? '✅' : '⚠️'}`,
      consoleCheck.warnings === 0 ? 'green' : 'yellow'
    )
    log(`   Pages Tested: ${consoleCheck.pagesTested}`)
  }

  if (summary.checks.lighthouse) {
    const lhCheck = summary.checks.lighthouse
    log(`\n🎯 Lighthouse Check:`, 'bright')
    log(
      `   Performance: ${lhCheck.scores.performance}/100 ${lhCheck.scores.performance >= 90 ? '✅' : '❌'}`,
      lhCheck.scores.performance >= 90 ? 'green' : 'red'
    )
    log(
      `   Accessibility: ${lhCheck.scores.accessibility}/100 ${lhCheck.scores.accessibility >= 90 ? '✅' : '❌'}`,
      lhCheck.scores.accessibility >= 90 ? 'green' : 'red'
    )
    log(
      `   Best Practices: ${lhCheck.scores['best-practices']}/100 ${lhCheck.scores['best-practices'] >= 90 ? '✅' : '❌'}`,
      lhCheck.scores['best-practices'] >= 90 ? 'green' : 'red'
    )
    log(
      `   SEO: ${lhCheck.scores.seo}/100 ${lhCheck.scores.seo >= 90 ? '✅' : '❌'}`,
      lhCheck.scores.seo >= 90 ? 'green' : 'red'
    )
    log(`   Optimizations Found: ${lhCheck.optimizations}`)
  }

  log(`\n📁 Full report: ${summaryPath}`, 'cyan')
  log('\n🦇 BroCula has spoken. Your code is clean... for now. 🦇\n', 'magenta')
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'full'

  logBroCula()

  switch (command) {
    case 'lint':
      checkLint()
      break
    case 'build':
      checkBuild()
      break
    case 'monitor':
      runConsoleMonitor()
      break
    case 'lighthouse':
      runLighthouseAudit()
      break
    case 'full':
    default:
      // Run full workflow
      checkLint()
      checkBuild()
      runConsoleMonitor()
      runLighthouseAudit()
      generateSummary()
      break
  }

  process.exit(SUCCESS_EXIT_CODE)
}

main()
