#!/usr/bin/env node
/**
 * BroCula Browser Console Monitor
 * Scans codebase for potential browser console errors and warnings
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const CONSOLE_PATTERNS = {
  // Patterns that might cause console errors
  'missing-guard': /window\.|document\./g,
  'console-statement': /console\.(log|warn|error|debug)/g,
  'unhandled-promise': /\.then\([^)]+\)(?!\s*\.catch)/g,
  'fetch-without-catch': /fetch\([^)]+\)(?!\s*\.catch)/g,
}

const SAFE_PATTERNS = [
  // Patterns that indicate proper guards
  /typeof window\s*!==?\s*['"]undefined['"]/,
  /typeof document\s*!==?\s*['"]undefined['"]/,
  /typeof window\s*===?\s*['"]undefined['"]/,
  /typeof document\s*===?\s*['"]undefined['"]/,
  /typeof navigator\s*!==?\s*['"]undefined['"]/,
  /process\.server/,
  /process\.client/,
]

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const issues = []

  lines.forEach((line, index) => {
    // Check for window/document usage without guards
    if (CONSOLE_PATTERNS['missing-guard'].test(line)) {
      // Check if line has proper guards
      const hasGuard = SAFE_PATTERNS.some(pattern => pattern.test(line))
      if (!hasGuard) {
        issues.push({
          line: index + 1,
          type: 'warning',
          message: 'Potential SSR issue: window/document without guard',
          code: line.trim(),
        })
      }
    }

    // Check for console statements in production code
    if (CONSOLE_PATTERNS['console-statement'].test(line)) {
      // Allow console in certain contexts
      if (!line.includes('logger.') && !line.includes('// debug')) {
        issues.push({
          line: index + 1,
          type: 'info',
          message: 'Console statement found',
          code: line.trim(),
        })
      }
    }
  })

  return issues
}

function scanDirectory(dir, pattern) {
  const results = []
  const files = execSync(`find ${dir} -name "${pattern}" -type f 2>/dev/null`, {
    encoding: 'utf-8',
    cwd: process.cwd(),
  })
    .trim()
    .split('\n')
    .filter(Boolean)

  files.forEach(file => {
    const issues = scanFile(file)
    if (issues.length > 0) {
      results.push({ file, issues })
    }
  })

  return results
}

function generateReport() {
  console.log('🧛 BroCula Browser Console Monitor\n')
  console.log('='.repeat(60))

  // Scan composables
  console.log('\n📁 Scanning composables...')
  const composableIssues = scanDirectory('composables', '*.ts')

  // Scan components
  console.log('📁 Scanning components...')
  const componentIssues = scanDirectory('components', '*.vue')

  // Scan utils
  console.log('📁 Scanning utils...')
  const utilIssues = scanDirectory('utils', '*.ts')

  const allIssues = [...composableIssues, ...componentIssues, ...utilIssues]

  console.log('\n' + '='.repeat(60))
  console.log('📊 SCAN RESULTS')
  console.log('='.repeat(60))

  if (allIssues.length === 0) {
    console.log('\n✅ No potential console errors found!')
    console.log('   Repository is clean and properly guarded.')
  } else {
    console.log(
      `\n⚠️  Found ${allIssues.length} files with potential issues:\n`
    )

    allIssues.forEach(({ file, issues }) => {
      console.log(`\n📄 ${file}`)
      issues.forEach(issue => {
        const icon =
          issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️'
        console.log(`   ${icon} Line ${issue.line}: ${issue.message}`)
        console.log(
          `      ${issue.code.substring(0, 80)}${issue.code.length > 80 ? '...' : ''}`
        )
      })
    })
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 RECOMMENDATIONS')
  console.log('='.repeat(60))
  console.log('1. Always guard window/document access with typeof checks')
  console.log('2. Use logger utility instead of console statements')
  console.log('3. Add .catch() to all fetch() calls')
  console.log('4. Ensure analytics errors are handled gracefully')
  console.log('='.repeat(60))
}

generateReport()
