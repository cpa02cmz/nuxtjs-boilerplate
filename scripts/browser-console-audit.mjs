#!/usr/bin/env node
/**
 * BroCula Browser Console Audit Script
 * Checks for console errors/warnings across all pages
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3456'
const PAGES = ['/', '/about', '/ai-keys', '/developer', '/search']

async function auditPage(page, path) {
  const errors = []
  const warnings = []

  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error') {
      errors.push(text)
    } else if (type === 'warning') {
      warnings.push(text)
    }
  })

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`)
  })

  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000) // Wait for any delayed console output

  return { path, errors, warnings }
}

async function main() {
  console.log('🧛 BroCula Browser Console Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  let totalErrors = 0
  let totalWarnings = 0

  for (const path of PAGES) {
    const page = await context.newPage()
    const result = await auditPage(page, path)

    console.log(`\n📄 Page: ${path || '/'}`)
    console.log(`   Errors: ${result.errors.length}`)
    console.log(`   Warnings: ${result.warnings.length}`)

    if (result.errors.length > 0) {
      console.log('   ❌ Errors:')
      result.errors.forEach(e => console.log(`      - ${e}`))
      totalErrors += result.errors.length
    }

    if (result.warnings.length > 0) {
      console.log('   ⚠️  Warnings:')
      result.warnings.forEach(w => console.log(`      - ${w}`))
      totalWarnings += result.warnings.length
    }

    await page.close()
  }

  await browser.close()

  console.log(`\n\n🧛 BroCula Audit Complete:`)
  console.log(`   Total Errors: ${totalErrors}`)
  console.log(`   Total Warnings: ${totalWarnings}`)

  if (totalErrors > 0) {
    console.log('   ❌ FAIL - Console errors found!')
    process.exit(1)
  } else if (totalWarnings > 0) {
    console.log('   ⚠️  WARN - Console warnings found')
    process.exit(0)
  } else {
    console.log('   ✅ PASS - Console is clean!')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
