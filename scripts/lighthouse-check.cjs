#!/usr/bin/env node
/**
 * BroCula Lighthouse Analysis
 * Runs Lighthouse audits and reports optimization opportunities
 */

const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const ROUTES = ['/', '/about', '/search', '/submit', '/ai-keys']

const CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
    emulatedUserAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
}

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })

  try {
    const runnerResult = await lighthouse(
      url,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
      },
      CONFIG
    )

    return runnerResult
  } finally {
    await chrome.kill()
  }
}

function formatScore(score) {
  const percentage = Math.round(score * 100)
  if (percentage >= 90) return `✅ ${percentage}`
  if (percentage >= 70) return `⚠️  ${percentage}`
  return `❌ ${percentage}`
}

function getOpportunities(lhr) {
  const opportunities = []
  const audits = lhr.audits

  // Performance opportunities
  const performanceAudits = [
    'unused-javascript',
    'unused-css-rules',
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unminified-javascript',
    'unminified-css',
    'uses-text-compression',
    'uses-responsive-images',
    'efficiently-encode-images',
    'total-byte-weight',
    'dom-size',
  ]

  for (const auditId of performanceAudits) {
    const audit = audits[auditId]
    if (audit && audit.score !== null && audit.score < 1 && audit.details) {
      const savings = audit.numericValue
        ? ` (${Math.round(audit.numericValue)}ms)`
        : ''
      opportunities.push({
        category: 'Performance',
        title: audit.title,
        score: audit.score,
        savings: savings,
        description: audit.description?.substring(0, 100),
      })
    }
  }

  // Accessibility issues
  const accessibilityAudits = Object.values(audits).filter(
    audit =>
      audit.score !== null &&
      audit.score < 1 &&
      lhr.categories.accessibility.auditRefs.some(ref => ref.id === audit.id)
  )

  for (const audit of accessibilityAudits.slice(0, 5)) {
    opportunities.push({
      category: 'Accessibility',
      title: audit.title,
      score: audit.score,
      savings: '',
      description: audit.description?.substring(0, 100),
    })
  }

  // SEO issues
  const seoAudits = Object.values(audits).filter(
    audit =>
      audit.score !== null &&
      audit.score < 1 &&
      lhr.categories.seo.auditRefs.some(ref => ref.id === audit.id)
  )

  for (const audit of seoAudits.slice(0, 3)) {
    opportunities.push({
      category: 'SEO',
      title: audit.title,
      score: audit.score,
      savings: '',
      description: audit.description?.substring(0, 100),
    })
  }

  return opportunities
}

async function main() {
  console.log('🧛 BroCula starting Lighthouse analysis...\n')

  const results = {
    routes: [],
    totalOpportunities: 0,
  }

  for (const route of ROUTES) {
    const url = `${BASE_URL}${route}`
    console.log(`\n🔍 Auditing: ${url}`)

    try {
      const runnerResult = await runLighthouse(url)
      const lhr = runnerResult.lhr

      const scores = {
        performance: lhr.categories.performance.score,
        accessibility: lhr.categories.accessibility.score,
        bestPractices: lhr.categories['best-practices'].score,
        seo: lhr.categories.seo.score,
      }

      const opportunities = getOpportunities(lhr)

      results.routes.push({
        route,
        url,
        scores,
        opportunities,
      })

      results.totalOpportunities += opportunities.length

      console.log(`  Performance:    ${formatScore(scores.performance)}`)
      console.log(`  Accessibility:  ${formatScore(scores.accessibility)}`)
      console.log(`  Best Practices: ${formatScore(scores.bestPractices)}`)
      console.log(`  SEO:            ${formatScore(scores.seo)}`)

      if (opportunities.length > 0) {
        console.log(`\n  📋 Opportunities (${opportunities.length}):`)
        opportunities.forEach((opp, i) => {
          console.log(
            `    ${i + 1}. [${opp.category}] ${opp.title}${opp.savings}`
          )
        })
      } else {
        console.log(`  ✅ No optimization opportunities found`)
      }
    } catch (error) {
      console.error(`  ❌ Error auditing ${route}:`, error.message)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 LIGHTHOUSE SUMMARY')
  console.log('='.repeat(60))

  let hasIssues = false

  results.routes.forEach(({ route, scores, opportunities }) => {
    const avgScore = Math.round(
      ((scores.performance +
        scores.accessibility +
        scores.bestPractices +
        scores.seo) /
        4) *
        100
    )

    if (avgScore < 90 || opportunities.length > 0) {
      hasIssues = true
      console.log(`\n${route}:`)
      console.log(`  Average Score: ${avgScore}%`)
      if (opportunities.length > 0) {
        console.log(`  Opportunities: ${opportunities.length}`)
      }
    }
  })

  if (hasIssues) {
    console.log(
      '\n⚠️  Optimization opportunities found. Review and fix recommended.'
    )
  } else {
    console.log(
      '\n✅ All pages have excellent scores (>90) and no optimization issues!'
    )
  }

  console.log(`\nTotal Opportunities: ${results.totalOpportunities}`)

  // Return exit code based on issues
  process.exit(hasIssues ? 0 : 0) // Don't fail the workflow, just report
}

main().catch(error => {
  console.error('💥 BroCula encountered an error:', error)
  process.exit(1)
})
