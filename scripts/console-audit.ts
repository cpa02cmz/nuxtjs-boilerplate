import { chromium, type Page } from 'playwright'

const BASE_URL = 'http://localhost:3000'
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/ai-keys', name: 'AI Keys' },
  { path: '/about', name: 'About' },
  { path: '/developer', name: 'Developer' },
  { path: '/search', name: 'Search' },
]

interface ConsoleIssue {
  location: string
  message: string
}

const consoleErrors: ConsoleIssue[] = []
const consoleWarnings: ConsoleIssue[] = []
const hydrationErrors: ConsoleIssue[] = []

async function analyzePageConsole(page: Page, url: string, name: string) {
  console.log(`\n🔍 Analyzing ${name}...`)

  // Set up console listeners
  page.on('console', msg => {
    const type = msg.type()
    const text = msg.text()
    const location = `${name} (${url})`

    if (type === 'error') {
      consoleErrors.push({ location, message: text })
      console.log(`   ❌ Console Error: ${text.substring(0, 100)}`)
    } else if (type === 'warning') {
      consoleWarnings.push({ location, message: text })
      console.log(`   ⚠️  Console Warning: ${text.substring(0, 100)}`)
    }
  })

  page.on('pageerror', (error: Error) => {
    const location = `${name} (${url})`
    consoleErrors.push({ location, message: error.message })
    console.log(`   ❌ Page Error: ${error.message}`)
  })

  try {
    // Navigate to page
    await page.goto(`${BASE_URL}${url}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait a bit for any async errors
    await page.waitForTimeout(2000)

    // Check for Vue hydration errors
    const hydrationError = await page.evaluate(() => {
      const errors = []
      // Check for Vue hydration mismatch markers
      if (
        document
          .querySelector('[data-v-app]')
          ?.getAttribute('data-server-rendered') === 'true'
      ) {
        // Check for any hydration mismatch indicators
        const vueApp = document.querySelector('[data-v-app]')
        if (vueApp) {
          // Access Vue app internals if available
          return 'Vue app detected'
        }
      }
      return null
    })

    if (hydrationError) {
      hydrationErrors.push({ location: name, message: hydrationError })
    }

    console.log(`   ✅ Analysis complete`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`   ❌ Failed to analyze ${name}:`, errorMessage)
  }
}

async function runConsoleAudit() {
  console.log('🧛 BroCula Browser Console Audit Starting...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  for (const { path, name } of PAGES) {
    const page = await context.newPage()
    await analyzePageConsole(page, path, name)
    await page.close()
  }

  await browser.close()

  console.log('\n' + '='.repeat(60))
  console.log('📊 BROWSER CONSOLE AUDIT COMPLETE')
  console.log('='.repeat(60))
  console.log(`\n🚨 Console Errors Found: ${consoleErrors.length}`)
  console.log(`⚠️  Console Warnings Found: ${consoleWarnings.length}`)
  console.log(`💧 Hydration Errors Found: ${hydrationErrors.length}`)

  if (consoleErrors.length > 0) {
    console.log('\n❌ Console Errors:')
    consoleErrors.forEach((err, i) => {
      console.log(
        `   ${i + 1}. [${err.location}] ${err.message.substring(0, 80)}`
      )
    })
  }

  if (consoleWarnings.length > 0) {
    console.log('\n⚠️  Console Warnings:')
    consoleWarnings.forEach((warn, i) => {
      console.log(
        `   ${i + 1}. [${warn.location}] ${warn.message.substring(0, 80)}`
      )
    })
  }

  console.log('='.repeat(60))

  // Return results for further processing
  return {
    errors: consoleErrors,
    warnings: consoleWarnings,
    hydrationErrors: hydrationErrors,
    hasIssues:
      consoleErrors.length > 0 ||
      consoleWarnings.length > 0 ||
      hydrationErrors.length > 0,
  }
}

runConsoleAudit().catch((err: Error) => {
  console.error('Audit failed:', err.message)
  process.exit(1)
})
