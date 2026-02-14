/**
 * BroCula Lighthouse Audit Script
 * Runs Lighthouse performance audits on critical pages
 */
import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { writeFileSync } from 'fs'

interface LighthouseResult {
  url: string
  scores: {
    performance: number
    accessibility: number
    'best-practices': number
    seo: number
  }
  metrics: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    totalBlockingTime: number
    cumulativeLayoutShift: number
    speedIndex: number
  }
  opportunities: Array<{
    title: string
    score: number
    details?: string
  }>
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const PAGES = ['/', '/about', '/search', '/submit', '/ai-keys']

async function runLighthouseAudit(
  url: string
): Promise<LighthouseResult | null> {
  let chrome
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox'],
    })

    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
    } as any)

    if (!result?.lhr) return null

    const { lhr } = result

    return {
      url,
      scores: {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round(
          (lhr.categories.accessibility?.score || 0) * 100
        ),
        'best-practices': Math.round(
          (lhr.categories['best-practices']?.score || 0) * 100
        ),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      },
      metrics: {
        firstContentfulPaint:
          lhr.audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint:
          lhr.audits['largest-contentful-paint']?.numericValue || 0,
        totalBlockingTime: lhr.audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift:
          lhr.audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: lhr.audits['speed-index']?.numericValue || 0,
      },
      opportunities: Object.values(lhr.audits)
        .filter(
          (a: any) =>
            a.details?.type === 'opportunity' && a.score !== null && a.score < 1
        )
        .map((a: any) => ({
          title: a.title,
          score: a.score,
          details: a.description,
        })),
    }
  } catch (error) {
    console.error(`Error auditing ${url}:`, error)
    return null
  } finally {
    if (chrome) await chrome.kill()
  }
}

async function runAllAudits() {
  console.log('🦇 BroCula: Starting Lighthouse audit...\n')

  const results: LighthouseResult[] = []

  for (const page of PAGES) {
    const url = `${BASE_URL}${page}`
    console.log(`Auditing ${url}...`)
    const result = await runLighthouseAudit(url)
    if (result) {
      results.push(result)
      console.log(`  Performance: ${result.scores.performance}/100`)
      console.log(`  Accessibility: ${result.scores.accessibility}/100`)
      console.log(`  Best Practices: ${result.scores['best-practices']}/100`)
      console.log(`  SEO: ${result.scores.seo}/100`)
      if (result.opportunities.length > 0) {
        console.log(
          `  ⚠️  ${result.opportunities.length} optimization opportunities found`
        )
      }
    }
    console.log()
  }

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    results,
    summary: {
      avgPerformance: Math.round(
        results.reduce((s, r) => s + r.scores.performance, 0) / results.length
      ),
      avgAccessibility: Math.round(
        results.reduce((s, r) => s + r.scores.accessibility, 0) / results.length
      ),
      avgBestPractices: Math.round(
        results.reduce((s, r) => s + r.scores['best-practices'], 0) /
          results.length
      ),
      avgSeo: Math.round(
        results.reduce((s, r) => s + r.scores.seo, 0) / results.length
      ),
      totalOpportunities: results.reduce(
        (s, r) => s + r.opportunities.length,
        0
      ),
    },
  }

  writeFileSync(
    'playwright-report/brocula-lighthouse-report.json',
    JSON.stringify(report, null, 2)
  )

  console.log('='.repeat(60))
  console.log('🦇 BroCula Lighthouse Audit Summary')
  console.log('='.repeat(60))
  console.log(`Average Performance: ${report.summary.avgPerformance}/100`)
  console.log(`Average Accessibility: ${report.summary.avgAccessibility}/100`)
  console.log(`Average Best Practices: ${report.summary.avgBestPractices}/100`)
  console.log(`Average SEO: ${report.summary.avgSeo}/100`)
  console.log(`Total Opportunities: ${report.summary.totalOpportunities}`)
  console.log('='.repeat(60))

  return report
}

runAllAudits().catch(console.error)
