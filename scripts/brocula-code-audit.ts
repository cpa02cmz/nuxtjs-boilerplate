/**
 * BroCula Code-Based Lighthouse Optimization Audit
 * Analyzes codebase for performance optimization opportunities
 */
import { glob } from 'glob'
import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'

interface OptimizationIssue {
  type: 'performance' | 'accessibility' | 'best-practices' | 'seo'
  severity: 'high' | 'medium' | 'low'
  file: string
  line?: number
  message: string
  recommendation: string
}

interface AuditResult {
  timestamp: string
  summary: {
    totalIssues: number
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  issues: OptimizationIssue[]
}

// Heavy libraries to check
const HEAVY_LIBRARIES = [
  'lodash',
  'moment',
  'dayjs',
  'chart.js',
  'gsap',
  'three',
  'd3',
  'jspdf',
  'xlsx',
  'pdfmake',
]

// Performance patterns
const PERFORMANCE_PATTERNS = [
  {
    pattern: /import\s+.*\s+from\s+['"]lodash['"]/,
    message: 'Heavy lodash import - use lodash-es or specific functions',
    fix: 'Use lodash-es or import specific functions (e.g., import debounce from "lodash/debounce")',
  },
  {
    pattern: /import\s+.*\s+from\s+['"]moment['"]/,
    message: 'Moment.js is deprecated - use native Date or date-fns',
    fix: 'Replace moment with native Date API or date-fns',
  },
  {
    pattern: /setTimeout\(\s*function/,
    message: 'Anonymous setTimeout - could cause memory leaks',
    fix: 'Name the function for better debugging and cleanup',
  },
  {
    pattern: /setInterval\(/,
    message: 'setInterval without cleanup - potential memory leak',
    fix: 'Ensure clearInterval is called in onUnmounted',
  },
  {
    pattern: /addEventListener\(/,
    message: 'Event listener without removeEventListener - memory leak',
    fix: 'Add matching removeEventListener in cleanup',
  },
]

// Accessibility patterns
const A11Y_PATTERNS = [
  {
    pattern: /<img[^>]*>/i,
    check: (content: string) => !content.includes('alt='),
    message: 'Image without alt attribute',
    fix: 'Add descriptive alt attribute',
  },
  {
    pattern: /<button[^>]*>/i,
    check: (content: string) =>
      !content.includes('aria-') && !content.includes('type='),
    message: 'Button without accessible attributes',
    fix: 'Add aria-label or ensure visible text',
  },
  {
    pattern: /<a[^>]*>/i,
    check: (content: string) => content.includes('href="#"'),
    message: 'Link with empty href - accessibility issue',
    fix: 'Use button for actions or proper href for navigation',
  },
  {
    pattern: /<input[^>]*>/i,
    check: (content: string) =>
      !content.includes('aria-label') &&
      !content.includes('aria-labelledby') &&
      !content.includes('label'),
    message: 'Input without accessible label',
    fix: 'Add aria-label or associate with label element',
  },
]

// SEO patterns
const SEO_PATTERNS = [
  {
    pattern: /<title>/i,
    check: (content: string) =>
      content.includes('<title></title>') || content.includes('<title> '),
    message: 'Empty or whitespace title tag',
    fix: 'Add descriptive title',
  },
  {
    pattern: /<meta[^>]*name=["']description["']/i,
    check: () => false,
    message: 'Meta description check',
    fix: 'Ensure unique meta description',
  },
  {
    pattern: /<h1/i,
    check: (content: string) => (content.match(/<h1/g) || []).length > 1,
    message: 'Multiple H1 tags - SEO issue',
    fix: 'Use only one H1 per page',
  },
]

async function scanVueComponents(): Promise<OptimizationIssue[]> {
  const issues: OptimizationIssue[] = []
  const files = await glob('components/**/*.vue')

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Check for heavy libraries
    for (const lib of HEAVY_LIBRARIES) {
      if (content.includes(lib)) {
        const line = lines.findIndex(l => l.includes(lib)) + 1
        issues.push({
          type: 'performance',
          severity: 'medium',
          file,
          line,
          message: `Using heavy library: ${lib}`,
          recommendation: `Consider lazy loading ${lib} or finding a lighter alternative`,
        })
      }
    }

    // Check performance patterns
    for (const pattern of PERFORMANCE_PATTERNS) {
      const matches = content.match(new RegExp(pattern.pattern, 'g'))
      if (matches) {
        matches.forEach(() => {
          const line = lines.findIndex(l => pattern.pattern.test(l)) + 1
          issues.push({
            type: 'performance',
            severity: 'medium',
            file,
            line,
            message: pattern.message,
            recommendation: pattern.fix,
          })
        })
      }
    }

    // Check accessibility patterns
    for (const pattern of A11Y_PATTERNS) {
      const matches = content.match(new RegExp(pattern.pattern, 'g'))
      if (matches) {
        matches.forEach(match => {
          if (pattern.check(match)) {
            const line =
              lines.findIndex(l => l.includes(match.split(' ')[0].slice(1))) + 1
            issues.push({
              type: 'accessibility',
              severity: 'high',
              file,
              line,
              message: pattern.message,
              recommendation: pattern.fix,
            })
          }
        })
      }
    }

    // Check for dynamic imports (good pattern)
    if (
      content.includes('import(') ||
      content.includes('defineAsyncComponent')
    ) {
      // This is good - code splitting
    }

    // Check for ClientOnly usage (SSR safety)
    if (
      content.includes('window') &&
      !content.includes('ClientOnly') &&
      !content.includes('typeof window')
    ) {
      const line =
        lines.findIndex(l => l.includes('window') && !l.includes('typeof')) + 1
      if (line > 0) {
        issues.push({
          type: 'best-practices',
          severity: 'high',
          file,
          line,
          message: 'window usage without SSR guard',
          recommendation: 'Add typeof window check or wrap in ClientOnly',
        })
      }
    }
  }

  return issues
}

async function scanComposables(): Promise<OptimizationIssue[]> {
  const issues: OptimizationIssue[] = []
  const files = await glob('composables/**/*.ts')

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    // Check for SSR safety
    if (
      content.includes('window') ||
      content.includes('document') ||
      content.includes('localStorage')
    ) {
      const hasGuard =
        content.includes('typeof window') ||
        content.includes('process.client') ||
        content.includes('onMounted')

      if (!hasGuard) {
        const line =
          lines.findIndex(
            l =>
              l.includes('window') ||
              l.includes('document') ||
              l.includes('localStorage')
          ) + 1

        issues.push({
          type: 'best-practices',
          severity: 'high',
          file,
          line,
          message: 'Browser API usage without SSR guard',
          recommendation: 'Add typeof window check or use onMounted',
        })
      }
    }

    // Check for memory leaks
    if (content.includes('setInterval')) {
      const hasClear = content.includes('clearInterval')
      if (!hasClear) {
        issues.push({
          type: 'best-practices',
          severity: 'high',
          file,
          message: 'setInterval without cleanup',
          recommendation: 'Add clearInterval in onUnmounted',
        })
      }
    }
  }

  return issues
}

async function scanPages(): Promise<OptimizationIssue[]> {
  const issues: OptimizationIssue[] = []
  const files = await glob('pages/**/*.vue')

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')

    // Check for SEO meta tags
    if (!content.includes('useHead') && !content.includes('useSeoMeta')) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        file,
        message: 'Page missing SEO meta tags',
        recommendation: 'Add useHead or useSeoMeta for better SEO',
      })
    }

    // Check for multiple H1
    const h1Count = (content.match(/<h1/g) || []).length
    if (h1Count > 1) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        file,
        message: `Multiple H1 tags (${h1Count})`,
        recommendation: 'Use only one H1 per page',
      })
    }
  }

  return issues
}

async function scanConfigs(): Promise<OptimizationIssue[]> {
  const issues: OptimizationIssue[] = []

  // Check nuxt.config.ts for PWA
  try {
    const nuxtConfig = readFileSync('nuxt.config.ts', 'utf-8')

    if (!nuxtConfig.includes('pwa') && !nuxtConfig.includes('workbox')) {
      issues.push({
        type: 'performance',
        severity: 'low',
        file: 'nuxt.config.ts',
        message: 'PWA not configured',
        recommendation: 'Consider adding @vite-pwa/nuxt for better performance',
      })
    }

    if (!nuxtConfig.includes('image') && !nuxtConfig.includes('@nuxt/image')) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        file: 'nuxt.config.ts',
        message: '@nuxt/image not configured',
        recommendation: 'Add @nuxt/image for optimized images',
      })
    }
  } catch {
    // nuxt.config.ts not found
  }

  return issues
}

async function runAudit(): Promise<AuditResult> {
  console.log('🦇 BroCula: Starting code-based optimization audit...\n')

  const allIssues: OptimizationIssue[] = []

  console.log('Scanning Vue components...')
  allIssues.push(...(await scanVueComponents()))

  console.log('Scanning composables...')
  allIssues.push(...(await scanComposables()))

  console.log('Scanning pages...')
  allIssues.push(...(await scanPages()))

  console.log('Scanning configs...')
  allIssues.push(...(await scanConfigs()))

  const summary = {
    totalIssues: allIssues.length,
    performance: allIssues.filter(i => i.type === 'performance').length,
    accessibility: allIssues.filter(i => i.type === 'accessibility').length,
    bestPractices: allIssues.filter(i => i.type === 'best-practices').length,
    seo: allIssues.filter(i => i.type === 'seo').length,
  }

  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    summary,
    issues: allIssues,
  }

  // Save report
  writeFileSync(
    'playwright-report/brocula-optimization-audit.json',
    JSON.stringify(result, null, 2)
  )

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('🦇 BroCula Code-Based Optimization Audit Report')
  console.log('='.repeat(60))
  console.log(`Total Issues Found: ${summary.totalIssues}`)
  console.log(`Performance: ${summary.performance}`)
  console.log(`Accessibility: ${summary.accessibility}`)
  console.log(`Best Practices: ${summary.bestPractices}`)
  console.log(`SEO: ${summary.seo}`)
  console.log('='.repeat(60))

  // Group by severity
  const highSeverity = allIssues.filter(i => i.severity === 'high')
  const mediumSeverity = allIssues.filter(i => i.severity === 'medium')

  if (highSeverity.length > 0) {
    console.log('\n🔴 High Severity Issues:')
    highSeverity.forEach(i => {
      console.log(
        `  [${i.type.toUpperCase()}] ${i.file}${i.line ? ':' + i.line : ''}`
      )
      console.log(`    ${i.message}`)
      console.log(`    → ${i.recommendation}`)
    })
  }

  if (mediumSeverity.length > 0) {
    console.log('\n🟡 Medium Severity Issues:')
    mediumSeverity.slice(0, 10).forEach(i => {
      console.log(
        `  [${i.type.toUpperCase()}] ${i.file}${i.line ? ':' + i.line : ''}`
      )
      console.log(`    ${i.message}`)
    })
    if (mediumSeverity.length > 10) {
      console.log(`  ... and ${mediumSeverity.length - 10} more`)
    }
  }

  if (allIssues.length === 0) {
    console.log('\n✅ No optimization issues found!')
  }

  console.log(
    `\n📊 Report saved to: playwright-report/brocula-optimization-audit.json`
  )

  return result
}

runAudit().catch(console.error)
