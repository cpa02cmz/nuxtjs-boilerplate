import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3000'
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/developer', name: 'Developer' },
  { path: '/search', name: 'Search' },
]

async function runPerformanceAudit() {
  console.log('🧛 BroCula Performance Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const pageInfo of PAGES) {
    const page = await browser.newPage()

    try {
      // Enable performance metrics
      const client = await page.context().newCDPSession(page)
      await client.send('Performance.enable')

      // Navigate to page
      const startTime = Date.now()
      const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait for page to settle
      await page.waitForTimeout(2000)

      // Get performance metrics
      const performanceMetrics = await client.send('Performance.getMetrics')
      const metrics = {}
      performanceMetrics.metrics.forEach(m => {
        metrics[m.name] = m.value
      })

      // Get additional metrics
      const loadTime = Date.now() - startTime
      const domContentLoaded = metrics.DomContentLoaded || 0
      const firstPaint = metrics.FirstPaint || 0
      const firstContentfulPaint = metrics.FirstContentfulPaint || 0

      // Count resources
      const resources = await page.evaluate(
        () => performance.getEntriesByType('resource').length
      )

      // Check for large images
      const largeResources = await page.evaluate(() => {
        return performance
          .getEntriesByType('resource')
          .filter(r => r.transferSize > 100000)
          .map(r => ({
            name: r.name.split('/').pop(),
            size: Math.round(r.transferSize / 1024),
          }))
      })

      results.push({
        page: pageInfo.name,
        loadTime,
        domContentLoaded: Math.round(domContentLoaded),
        firstPaint: Math.round(firstPaint),
        firstContentfulPaint: Math.round(firstContentfulPaint),
        resources,
        largeResources: largeResources.slice(0, 5), // Top 5
      })

      console.log(`✅ ${pageInfo.name}:`)
      console.log(`   Load time: ${loadTime}ms`)
      console.log(`   DOM Content Loaded: ${Math.round(domContentLoaded)}ms`)
      console.log(`   First Paint: ${Math.round(firstPaint)}ms`)
      console.log(`   Resources: ${resources}`)
      if (largeResources.length > 0) {
        console.log(`   Large resources (>100KB): ${largeResources.length}`)
        largeResources.slice(0, 3).forEach(r => {
          console.log(`      - ${r.name}: ${r.size}KB`)
        })
      }
    } catch (error) {
      console.log(`❌ ${pageInfo.name}: Audit failed - ${error.message}`)
      results.push({
        page: pageInfo.name,
        error: error.message,
      })
    }

    await page.close()
  }

  await browser.close()

  // Summary
  console.log('\n📊 Performance Summary:')
  const validResults = results.filter(r => !r.error)
  if (validResults.length > 0) {
    const avgLoadTime =
      validResults.reduce((sum, r) => sum + r.loadTime, 0) / validResults.length
    console.log(`   Average load time: ${Math.round(avgLoadTime)}ms`)
    console.log(`   Pages audited: ${validResults.length}`)

    // Find optimization opportunities
    const slowPages = validResults.filter(r => r.loadTime > 3000)
    if (slowPages.length > 0) {
      console.log(`\n⚠️  Slow pages (>3s):`)
      slowPages.forEach(p => console.log(`   - ${p.page}: ${p.loadTime}ms`))
    }

    const pagesWithLargeResources = validResults.filter(
      r => r.largeResources && r.largeResources.length > 0
    )
    if (pagesWithLargeResources.length > 0) {
      console.log(`\n⚠️  Pages with large resources:`)
      pagesWithLargeResources.forEach(p => {
        console.log(
          `   - ${p.page}: ${p.largeResources.length} large resources`
        )
      })
    }
  }

  return results
}

runPerformanceAudit().catch(console.error)
