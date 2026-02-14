/**
 * BroCula Browser Console Audit Script
 * Scans codebase for potential browser console errors and warnings
 */

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  file: string;
  line: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

const results: AuditResult[] = [];

// Patterns that could cause console errors
const errorPatterns = [
  {
    pattern: /console\.(log|warn|error|info|debug)\s*\(/g,
    type: 'warning' as const,
    message: 'Console statement found in production code',
    exclude: ['.test.', '.spec.', '__tests__', 'logger.ts', 'error-handler.ts']
  },
  {
    pattern: /window\.[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    type: 'error' as const,
    message: 'Unprotected window access - potential SSR error',
    requireGuard: true
  },
  {
    pattern: /document\.[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    type: 'error' as const,
    message: 'Unprotected document access - potential SSR error',
    requireGuard: true
  },
  {
    pattern: /localStorage\.[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    type: 'error' as const,
    message: 'Unprotected localStorage access - potential SSR error',
    requireGuard: true
  },
  {
    pattern: /sessionStorage\.[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    type: 'error' as const,
    message: 'Unprotected sessionStorage access - potential SSR error',
    requireGuard: true
  },
  {
    pattern: /navigator\.[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    type: 'warning' as const,
    message: 'Navigator access - verify SSR safety',
    requireGuard: true
  }
];

// Check if line has proper SSR guard
function hasSSRGuard(lines: string[], lineIndex: number): boolean {
  // Check current line and up to 5 lines before
  for (let i = Math.max(0, lineIndex - 5); i <= lineIndex; i++) {
    const line = lines[i];
    if (line.includes('typeof window') || 
        line.includes('typeof document') || 
        line.includes('typeof localStorage') ||
        line.includes('typeof sessionStorage') ||
        line.includes('process.client') ||
        line.includes('import.meta.client') ||
        line.includes('onMounted') ||
        line.includes('<ClientOnly>')) {
      return true;
    }
  }
  return false;
}

async function auditFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('__tests__');
  
  lines.forEach((line, index) => {
    errorPatterns.forEach(({ pattern, type, message, exclude, requireGuard }) => {
      // Skip excluded files
      if (exclude && exclude.some(ex => filePath.includes(ex))) {
        return;
      }
      
      // Reset pattern lastIndex
      pattern.lastIndex = 0;
      
      if (pattern.test(line)) {
        // Check for SSR guards if required
        if (requireGuard && !isTestFile) {
          if (hasSSRGuard(lines, index)) {
            return; // Has guard, skip
          }
        }
        
        results.push({
          file: filePath,
          line: index + 1,
          type,
          message,
          code: line.trim()
        });
      }
    });
  });
}

async function main() {
  console.log('🦇 BroCula Browser Console Audit Starting...\n');
  
  // Find all Vue, TS, and JS files
  const files = await glob('**/*.{vue,ts,js}', {
    ignore: ['node_modules/**', 'dist/**', '.nuxt/**', 'playwright-report/**', 'test-results/**']
  });
  
  console.log(`Scanning ${files.length} files...\n`);
  
  for (const file of files) {
    await auditFile(file);
  }
  
  // Group results by type
  const errors = results.filter(r => r.type === 'error');
  const warnings = results.filter(r => r.type === 'warning');
  
  console.log('\n' + '='.repeat(80));
  console.log('BROCULA CONSOLE AUDIT RESULTS');
  console.log('='.repeat(80));
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach(err => {
      console.log(`\n  File: ${err.file}:${err.line}`);
      console.log(`  Issue: ${err.message}`);
      console.log(`  Code:  ${err.code.substring(0, 80)}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(warn => {
      console.log(`\n  File: ${warn.file}:${warn.line}`);
      console.log(`  Issue: ${warn.message}`);
      console.log(`  Code:  ${warn.code.substring(0, 80)}`);
    });
  }
  
  if (results.length === 0) {
    console.log('\n✅ No console issues found! Browser console is clean.');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Total Issues: ${results.length} (${errors.length} errors, ${warnings.length} warnings)`);
  console.log('='.repeat(80));
  
  // Save report
  const reportPath = 'playwright-report/brocula-console-report.json';
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      errors: errors.length,
      warnings: warnings.length
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  
  // Exit with error code if errors found
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(console.error);
