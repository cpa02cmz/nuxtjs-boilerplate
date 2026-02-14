/**
 * BroCula Lighthouse Quick Audit
 * Checks for common optimization opportunities without full Lighthouse run
 */

import { glob } from 'glob';
import * as fs from 'fs';

interface Opportunity {
  file: string;
  line: number;
  type: 'image' | 'bundle' | 'performance' | 'seo';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

const opportunities: Opportunity[] = [];

// Check for unoptimized patterns
async function auditFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for large libraries
    if (line.includes('import') && /lodash|moment|dayjs|chart\.js|gsap/i.test(line)) {
      opportunities.push({
        file: filePath,
        line: index + 1,
        type: 'bundle',
        message: 'Large library import detected - consider lighter alternative',
        severity: 'medium'
      });
    }
    
    // Check for non-lazy images
    if (/<img/i.test(line) && !/loading\s*=\s*["\']lazy/i.test(line) && !/nuxt-img/i.test(line)) {
      // Skip if it's already using NuxtImg or has loading="lazy"
      if (!line.includes('loading="lazy"') && !line.includes("loading='lazy'")) {
        opportunities.push({
          file: filePath,
          line: index + 1,
          type: 'image',
          message: 'Image without lazy loading - consider adding loading="lazy" or using NuxtImg',
          severity: 'low'
        });
      }
    }
    
    // Check for missing alt attributes on images
    if (/<img/i.test(line) && !/alt\s*=/i.test(line)) {
      opportunities.push({
        file: filePath,
        line: index + 1,
        type: 'seo',
        message: 'Image missing alt attribute - important for accessibility and SEO',
        severity: 'medium'
      });
    }
    
    // Check for inline styles (performance issue)
    if (/style\s*=/i.test(line) && !/:\s*\{\{/i.test(line)) {
      // Only flag non-dynamic inline styles
      opportunities.push({
        file: filePath,
        line: index + 1,
        type: 'performance',
        message: 'Inline style detected - consider using CSS classes for better caching',
        severity: 'low'
      });
    }
  });
}

async function main() {
  console.log('🦇 BroCula Lighthouse Quick Audit Starting...\n');
  
  const files = await glob('**/*.vue', {
    ignore: ['node_modules/**', 'dist/**', '.nuxt/**']
  });
  
  console.log(`Scanning ${files.length} Vue files...\n`);
  
  for (const file of files) {
    await auditFile(file);
  }
  
  console.log('='.repeat(80));
  console.log('LIGHTHOUSE OPTIMIZATION OPPORTUNITIES');
  console.log('='.repeat(80));
  
  const high = opportunities.filter(o => o.severity === 'high');
  const medium = opportunities.filter(o => o.severity === 'medium');
  const low = opportunities.filter(o => o.severity === 'low');
  
  if (high.length > 0) {
    console.log(`\n🔴 HIGH PRIORITY (${high.length}):`);
    high.forEach(opp => {
      console.log(`\n  ${opp.file}:${opp.line}`);
      console.log(`  ${opp.message}`);
    });
  }
  
  if (medium.length > 0) {
    console.log(`\n🟡 MEDIUM PRIORITY (${medium.length}):`);
    medium.slice(0, 10).forEach(opp => { // Show first 10
      console.log(`\n  ${opp.file}:${opp.line}`);
      console.log(`  ${opp.message}`);
    });
    if (medium.length > 10) {
      console.log(`\n  ... and ${medium.length - 10} more`);
    }
  }
  
  if (low.length > 0) {
    console.log(`\n🟢 LOW PRIORITY (${low.length}):`);
    console.log(`  ${low.length} low-priority optimizations found`);
  }
  
  if (opportunities.length === 0) {
    console.log('\n✅ No optimization opportunities found! Code is well-optimized.');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`Summary: ${high.length} high, ${medium.length} medium, ${low.length} low`);
  console.log('='.repeat(80));
}

main().catch(console.error);
