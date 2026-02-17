import { chromium } from 'playwright'
import { monitoringConfig } from '../configs/monitoring.config.ts'

const BASE_URL = monitoringConfig.baseUrl
const PAGES = monitoringConfig.pages.essential

async function runPerformanceAudit(page, url, name) {
  console.log(`\n📄 Auditing ${name}...`)

  try {
    // Clear cache and cookies
    await page.context().clearCookies()

    // Enable performance metrics
    const client = await page.context().newCDPSession(page)
    await client.send('Performance.enable')

    // Navigate to page
    const startTime = Date.now()
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: monitoringConfig.timeouts.navigationMs,
    })
    const loadTime = Date.now() - startTime

    // Get performance metrics
    const metrics = await client.send('Performance.getMetrics')
    const perfMetrics = {}
    metrics.metrics.forEach(m => {
      perfMetrics[m.name] = m.value
    })

    // Get Web Vitals via Performance Observer script
    const vitals = await page.evaluate(() => {
      return new Promise(resolve => {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const vitals = {}
          entries.forEach(entry => {
            if (entry.entryType === 'web-vitals') {
              vitals[entry.name] = entry.value
            }
          })
          resolve(vitals)
        })

        try {
          observer.observe({
            entryTypes: ['web-vitals', 'measure', 'navigation'],
          })
        } catch (e) {
          // Fallback to basic timing
          const nav = performance.getEntriesByType('navigation')[0]
          resolve({
            domContentLoaded: nav?.domContentLoadedEventEnd - nav?.startTime,
            loadComplete: nav?.loadEventEnd - nav?.startTime,
          })
        }

        // Timeout after configured delay - Flexy hates hardcoded values!
        setTimeout(() => resolve({}), monitoringConfig.delays.consoleWaitMs)
      })
    })

    // Count resources
    const resourceCount = await page.evaluate(
      () => performance.getEntriesByType('resource').length
    )

    // Check for render-blocking resources
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: r.transferSize,
        initiatorType: r.initiatorType,
      }))
    })

    const renderBlocking = resources.filter(
      r =>
        ((r.name.endsWith('.css') || r.name.endsWith('.js')) &&
          r.duration > monitoringConfig.thresholds?.renderBlockingMs) ||
        100
    )

    console.log(`   ⏱️  Page Load Time: ${loadTime}ms`)
    console.log(`   📦 Total Resources: ${resourceCount}`)

    if (perfMetrics.DomContentLoaded) {
      console.log(
        `   🚀 DOM Content Loaded: ${Math.round(perfMetrics.DomContentLoaded)}ms`
      )
    }

    if (renderBlocking.length > 0) {
      console.log(
        `   ⚠️  Potential Render-Blocking Resources: ${renderBlocking.length}`
      )
      renderBlocking.slice(0, 3).forEach(r => {
        console.log(
          `      - ${r.name.split('/').pop()}: ${Math.round(r.duration)}ms`
        )
      })
    }

    // Check for large resources
    const largeResourceThreshold =
      monitoringConfig.thresholds?.largeResourceBytes || 100000
    const largeResources = resources.filter(
      r => r.transferSize > largeResourceThreshold
    )
    if (largeResources.length > 0) {
      console.log(
        `   📊 Large Resources (>${largeResourceThreshold / 1000}KB): ${largeResources.length}`
      )
    }

    return { loadTime, resourceCount, metrics: perfMetrics }
  } catch (error) {
    console.error(`   ❌ Failed to audit ${name}:`, error.message)
    return null
  }
}

async function runAudit() {
  console.log('🦇 BroCula Performance Audit Starting...\n')

  const browser = await chromium.launch({
    headless: monitoringConfig.browser.headless,
  })
  const context = await browser.newContext()

  for (const { path, name } of PAGES) {
    const page = await context.newPage()
    await runPerformanceAudit(page, path, name)
    await page.close()
  }

  await browser.close()

  console.log('\n' + '='.repeat(60))
  console.log('📊 PERFORMANCE AUDIT COMPLETE')
  console.log('='.repeat(60))
  console.log('\nRecommendations:')
  console.log('1. Ensure critical CSS is inlined')
  console.log('2. Defer non-critical JavaScript')
  console.log('3. Optimize images with modern formats (WebP/AVIF)')
  console.log('4. Enable text compression (gzip/brotli) in production')
  console.log('='.repeat(60))
}

runAudit().catch(err => {
  console.error('Audit failed:', err)
  process.exit(monitoringConfig.exitCodes.fatalError)
})
