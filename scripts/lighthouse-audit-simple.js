import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import { playAudit } from 'playwright-lighthouse'

const BASE_URL = 'http://localhost:3000'
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/developer', name: 'Developer' },
  { path: '/search', name: 'Search' },
]

async function runLighthouseAudit() {
  console.log('🧛 BroCula Lighthouse Performance Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const results = []

  for (const pageInfo of PAGES) {
    const page = await browser.newPage()

    try {
      await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait for page to settle
      await page.waitForTimeout(2000)

      // Run lighthouse audit
      const auditResult = await playAudit({
        page: page,
        thresholds: {
          performance: 60,
          accessibility: 90,
          'best-practices': 90,
          seo: 90,
        },
        port: 9222,
        reporter: 'html',
        reports: {
          formats: { json: false, html: true, csv: false },
          name: `lighthouse-${pageInfo.name.toLowerCase()}`,
          directory: './lighthouse-reports',
        },
      })

      results.push({
        page: pageInfo.name,
        path: pageInfo.path,
        scores: auditResult.scores,
        passed: true,
      })

      console.log(`✅ ${pageInfo.name}:`)
      console.log(`   Performance: ${auditResult.scores.performance}`)
      console.log(`   Accessibility: ${auditResult.scores.accessibility}`)
      console.log(`   Best Practices: ${auditResult.scores['best-practices']}`)
      console.log(`   SEO: ${auditResult.scores.seo}`)
    } catch (error) {
      console.log(`❌ ${pageInfo.name}: Audit failed - ${error.message}`)
      results.push({
        page: pageInfo.name,
        path: pageInfo.path,
        error: error.message,
        passed: false,
      })
    }

    await page.close()
  }

  await browser.close()

  // Summary
  console.log('\n📊 Lighthouse Summary:')
  const passed = results.filter(r => r.passed)
  console.log(`   Pages audited: ${results.length}`)
  console.log(`   Passed: ${passed.length}/${results.length}`)

  return results
}

runLighthouseAudit().catch(console.error)
