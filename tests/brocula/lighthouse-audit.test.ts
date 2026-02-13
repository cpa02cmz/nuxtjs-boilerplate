import { test, expect } from '@playwright/test'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import * as fs from 'fs'
import * as path from 'path'
import { DEFAULT_DEV_URL } from '../../configs/url.config'
import {
  lighthouseConfig,
  buildLighthouseConfig,
  getMinimumScores,
} from '../../configs/lighthouse.config'

// Flexy loves modularity! Using configurable Lighthouse configuration
const LIGHTHOUSE_CONFIG = buildLighthouseConfig()

// Minimum scores required (BroCula is strict!)
// NOTE: Development mode scores will be lower due to:
// - No asset minification
// - No text compression (gzip/brotli)
// - Source maps included
// - Vite client overhead
// Run against production build for accurate scores: npm run build && npm run preview
// Flexy hates hardcoded thresholds! Using configurable scores
const isDev =
  !process.env.BASE_URL || process.env.BASE_URL.includes('localhost:3000')
const MINIMUM_SCORES = getMinimumScores(isDev)

interface LighthouseReport {
  timestamp: string
  url: string
  scores: {
    performance: number
    accessibility: number
    'best-practices': number
    seo: number
  }
  optimizations: string[]
  failedAudits: Array<{
    id: string
    title: string
    description: string
    score: number
  }>
  passed: boolean
}

/**
 * BroCula Lighthouse Auditor
 * Strict workflow: Find Lighthouse optimization opportunities, optimize code based on it
 *
 * NOTE: This test should be run against a production build, not development server.
 * Run: npm run build && npm run preview, then set BASE_URL to the preview URL.
 */
test.describe('BroCula Lighthouse Auditor', () => {
  test('audit homepage for performance optimizations', async () => {
    // Use environment variable for URL, fallback to dev URL with warning
    const url = process.env.BASE_URL || DEFAULT_DEV_URL

    // Check if running against production build
    if (!process.env.BASE_URL) {
      console.warn(
        '\n⚠️  WARNING: Running Lighthouse against development server.'
      )
      console.warn('For accurate results, run against production build:')
      console.warn('  npm run build && npm run preview')
      console.warn('  Then set BASE_URL environment variable\n')
    }

    // Launch Chrome - Flexy loves configurable flags!
    const chrome = await chromeLauncher.launch({
      chromeFlags: lighthouseConfig.chrome.flags,
    })

    try {
      // Run Lighthouse - Flexy loves modularity!
      const runnerResult = await lighthouse(
        url,
        {
          logLevel: lighthouseConfig.audits.logLevel,
          output: lighthouseConfig.audits.output,
          onlyCategories: Object.entries(lighthouseConfig.categories)
            .filter(([, enabled]) => enabled)
            .map(([category]) => category),
          port: chrome.port,
        },
        LIGHTHOUSE_CONFIG as any
      )

      if (!runnerResult) {
        throw new Error('Lighthouse failed to generate results')
      }

      const { lhr } = runnerResult

      // Extract scores
      const scores = {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round(
          (lhr.categories.accessibility?.score || 0) * 100
        ),
        'best-practices': Math.round(
          (lhr.categories['best-practices']?.score || 0) * 100
        ),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      }

      // Find failed audits
      const failedAudits: Array<{
        id: string
        title: string
        description: string
        score: number
      }> = []
      const optimizations: string[] = []

      Object.entries(lhr.audits).forEach(([id, audit]: [string, any]) => {
        if (audit.score !== null && audit.score < 1) {
          failedAudits.push({
            id,
            title: audit.title,
            description: audit.description,
            score: audit.score,
          })

          // Generate optimization suggestions
          if (audit.details?.type === 'opportunity' && audit.numericValue > 0) {
            optimizations.push(
              `${audit.title}: Potential savings of ${Math.round(audit.numericValue)}ms`
            )
          }
        }
      })

      // Create report
      const report: LighthouseReport = {
        timestamp: new Date().toISOString(),
        url,
        scores,
        optimizations,
        failedAudits,
        passed: Object.entries(scores).every(([category, score]) => {
          return score >= (MINIMUM_SCORES as any)[category]
        }),
      }

      // Save report - Flexy loves configurable paths!
      const reportDir = path.join(
        process.cwd(),
        lighthouseConfig.reports.directory
      )
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true })
      }

      const reportPath = path.join(
        reportDir,
        lighthouseConfig.reports.files.summary
      )
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

      // Also save full Lighthouse report
      const fullReportPath = path.join(
        reportDir,
        lighthouseConfig.reports.files.full
      )
      fs.writeFileSync(fullReportPath, JSON.stringify(lhr, null, 2))

      // Log results
      console.log('\n🎯 BroCula Lighthouse Audit Report')
      console.log('===================================')
      console.log(`URL: ${url}`)
      console.log(
        `Performance: ${scores.performance}/100 ${scores.performance >= MINIMUM_SCORES.performance ? '✅' : '❌'}`
      )
      console.log(
        `Accessibility: ${scores.accessibility}/100 ${scores.accessibility >= MINIMUM_SCORES.accessibility ? '✅' : '❌'}`
      )
      console.log(
        `Best Practices: ${scores['best-practices']}/100 ${scores['best-practices'] >= MINIMUM_SCORES['best-practices'] ? '✅' : '❌'}`
      )
      console.log(
        `SEO: ${scores.seo}/100 ${scores.seo >= MINIMUM_SCORES.seo ? '✅' : '❌'}`
      )

      if (optimizations.length > 0) {
        console.log('\n💡 Optimization Opportunities:')
        optimizations.forEach((opt, i) => {
          console.log(`  ${i + 1}. ${opt}`)
        })
      }

      if (failedAudits.length > 0) {
        console.log(`\n⚠️  Failed Audits: ${failedAudits.length}`)
        console.log('Top issues to fix:')
        failedAudits
          .sort((a, b) => a.score - b.score)
          .slice(0, 10)
          .forEach((audit, i) => {
            console.log(
              `  ${i + 1}. ${audit.title} (score: ${Math.round(audit.score * 100)})`
            )
          })
      }

      console.log(`\nReport saved to: ${reportPath}`)

      // Assertions - BroCula is strict!
      expect(scores.performance).toBeGreaterThanOrEqual(
        MINIMUM_SCORES.performance
      )
      expect(scores.accessibility).toBeGreaterThanOrEqual(
        MINIMUM_SCORES.accessibility
      )
      expect(scores['best-practices']).toBeGreaterThanOrEqual(
        MINIMUM_SCORES['best-practices']
      )
      expect(scores.seo).toBeGreaterThanOrEqual(MINIMUM_SCORES.seo)
    } finally {
      // Kill Chrome
      await chrome.kill()
    }
  })
})
