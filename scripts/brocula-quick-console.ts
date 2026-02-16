import { chromium, type ConsoleMessage } from 'playwright'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3000'

interface ConsoleEntry {
  type: string
  text: string
  location: string
  page: string
}

const pages = [
  { path: '/', name: 'Home' },
  { path: '/search', name: 'Search' },
  { path: '/submit', name: 'Submit' },
  { path: '/about', name: 'About' },
  { path: '/ai-keys', name: 'AI Keys' },
]

async function main() {
  console.log('🧛 BroCula Quick Console Check\n')

  const browser = await chromium.launch({ headless: true })
  const allErrors: ConsoleEntry[] = []
  const allWarnings: ConsoleEntry[] = []

  for (const pageConfig of pages) {
    const page = await browser.newPage()
    const errors: ConsoleEntry[] = []
    const warnings: ConsoleEntry[] = []

    page.on('console', (msg: ConsoleMessage) => {
      const entry: ConsoleEntry = {
        type: msg.type(),
        text: msg.text(),
        location: `${msg.location().url}:${msg.location().lineNumber}`,
        page: pageConfig.name,
      }

      if (msg.type() === 'error') {
        errors.push(entry)
        allErrors.push(entry)
      } else if (msg.type() === 'warning') {
        warnings.push(entry)
        allWarnings.push(entry)
      }
    })

    page.on('pageerror', error => {
      const entry: ConsoleEntry = {
        type: 'error',
        text: error.message,
        location: 'page-error',
        page: pageConfig.name,
      }
      errors.push(entry)
      allErrors.push(entry)
    })

    try {
      await page.goto(`${BASE_URL}${pageConfig.path}`, {
        waitUntil: 'networkidle',
      })
      await page.waitForTimeout(2000)

      console.log(
        `${pageConfig.name}: ${errors.length} errors, ${warnings.length} warnings`
      )
    } catch (e) {
      console.error(`Failed to test ${pageConfig.name}:`, e)
    } finally {
      await page.close()
    }
  }

  await browser.close()

  console.log('\n📊 Summary:')
  console.log(`Total Errors: ${allErrors.length}`)
  console.log(`Total Warnings: ${allWarnings.length}`)

  if (allErrors.length > 0) {
    console.log('\n❌ ERRORS:')
    allErrors.forEach((e, i) => {
      console.log(`  ${i + 1}. [${e.page}] ${e.text.substring(0, 100)}`)
    })
    process.exit(1)
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  WARNINGS:')
    allWarnings.forEach((w, i) => {
      console.log(`  ${i + 1}. [${w.page}] ${w.text.substring(0, 100)}`)
    })
  }

  console.log('\n✅ Console is clean!')
  process.exit(0)
}

main().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
