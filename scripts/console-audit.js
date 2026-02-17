import { chromium } from 'playwright'
import { monitoringConfig } from '../configs/monitoring.config.js'

const BASE_URL = monitoringConfig.baseUrl
const PAGES = monitoringConfig.pages.essential

async function auditPage(browser, url, name) {
  console.log(`\n🔍 Auditing ${name} (${url})...`)
  
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // Capture console messages
  const consoleMessages = []
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    consoleMessages.push({ type, text })
  })
  
  // Capture page errors
  const pageErrors = []
  page.on('pageerror', error => {
    pageErrors.push(error.message)
  })
  
  try {
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: monitoringConfig.timeouts.navigationMs,
    })
    
    // Wait a bit for any async errors
    await page.waitForTimeout(monitoringConfig.delays.consoleWaitMs)
    
    // Report results
    const errors = consoleMessages.filter(m => m.type === 'error')
    const warnings = consoleMessages.filter(m => m.type === 'warning')
    
    if (errors.length > 0) {
      console.log(`   ❌ Console Errors: ${errors.length}`)
      errors.forEach(e => console.log(`      - ${e.text.substring(0, 100)}`))
    } else {
      console.log('   ✅ No console errors')
    }
    
    if (warnings.length > 0) {
      console.log(`   ⚠️  Console Warnings: ${warnings.length}`)
      warnings.forEach(w => console.log(`      - ${w.text.substring(0, 100)}`))
    }
    
    if (pageErrors.length > 0) {
      console.log(`   💥 Page Errors: ${pageErrors.length}`)
      pageErrors.forEach(e => console.log(`      - ${e.substring(0, 100)}`))
    }
    
    return { errors, warnings, pageErrors }
  } catch (error) {
    console.error(`   ❌ Failed to audit ${name}:`, error.message)
    return null
  } finally {
    await context.close()
  }
}

async function runAudit() {
  console.log('🦇 BroCula Console Error Audit Starting...\n')
  
  const browser = await chromium.launch({
    headless: monitoringConfig.browser.headless,
  })
  
  let totalErrors = 0
  let totalWarnings = 0
  
  for (const { path, name } of PAGES) {
    const result = await auditPage(browser, path, name)
    if (result) {
      totalErrors += result.errors.length
      totalWarnings += result.warnings.length
    }
  }
  
  await browser.close()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 CONSOLE AUDIT COMPLETE')
  console.log('='.repeat(60))
  console.log(`Total Errors: ${totalErrors}`)
  console.log(`Total Warnings: ${totalWarnings}`)
  
  if (totalErrors > 0) {
    console.log('\n❌ FAIL: Console errors detected!')
    process.exit(1)
  } else {
    console.log('\n✅ PASS: No console errors detected!')
  }
  console.log('='.repeat(60))
}

runAudit().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
