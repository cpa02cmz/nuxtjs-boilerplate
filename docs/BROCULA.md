# 🦇 BroCula - Browser Console & Lighthouse Guardian

BroCula is a strict workflow tool for monitoring browser console errors and optimizing based on Lighthouse audits. Built for the Nuxt.js Boilerplate project.

## Philosophy

**BroCula operates on strict principles:**

1. **Find browser console errors/warnings → Fix immediately**
2. **Find Lighthouse optimization opportunities → Optimize code based on them**
3. **Build/Lint errors are FATAL** - No exceptions!

## Installation

Dependencies are already included in the project:

- `playwright` - Browser automation
- `lighthouse` - Performance auditing
- `chrome-launcher` - Chrome control
- `tsx` - TypeScript execution

## Available Commands

### Individual Commands

```bash
# Run full BroCula workflow (lint + build + monitor + lighthouse)
npm run brocula
npm run brocula:full

# Check lint (fatal if fails)
npm run brocula:lint

# Check build (fatal if fails)
npm run brocula:build

# Monitor browser console for errors
npm run brocula:monitor

# Run Lighthouse performance audit
npm run brocula:lighthouse

# Run Playwright e2e tests
npm run test:e2e
npm run test:e2e:ui
```

## How It Works

### 1. Console Monitoring

BroCula visits all critical pages and captures console messages:

- **Pages tested:** `/`, `/ai-keys`, `/about`, `/search`, `/submit`
- **Errors:** Fatal - Must be fixed immediately
- **Warnings:** Logged but non-fatal (should still be addressed)

**Acceptable warnings** (development only):

- Vue Devtools extension messages
- HMR (Hot Module Replacement) messages
- Vite dev server messages

### 2. Lighthouse Audit

BroCula runs Lighthouse audits with strict minimum scores:

- **Performance:** 90/100 minimum
- **Accessibility:** 90/100 minimum
- **Best Practices:** 90/100 minimum
- **SEO:** 90/100 minimum

**Failed audits** are reported with optimization suggestions.

### 3. Report Generation

After each run, BroCula generates:

- `playwright-report/brocula-console-report.json` - Console monitoring results
- `playwright-report/brocula-lighthouse-report.json` - Lighthouse audit results
- `playwright-report/brocula-summary.json` - Combined summary
- `playwright-report/lighthouse-full-report.json` - Full Lighthouse JSON

## CI/CD Integration

BroCula runs automatically on:

- Every push to `main` or `develop`
- Every pull request
- Daily at 2 AM UTC (scheduled)

See `.github/workflows/brocula.yml`

## Configuration

### Playwright Config

Edit `playwright.config.ts` to adjust:

- Test browsers
- Viewport sizes
- Base URL
- Parallelism

### Lighthouse Config

Edit `tests/brocula/lighthouse-audit.spec.ts` to adjust:

- Minimum scores
- Device emulation
- Throttling settings

### Console Monitoring

Edit `tests/brocula/console-monitor.spec.ts` to adjust:

- Pages to test
- Acceptable warnings/errors
- Test timeout

## Example Output

```
🦇 BROCULA - Browser Console & Lighthouse Guardian 🦇
====================================================
Strict Mode: Build/Lint errors are FATAL

📋 Step 1: Checking lint...
✅ Lint passed

🏗️  Step 2: Checking build...
✅ Build passed

🖥️  Step 3: Monitoring browser console...
✅ Console monitoring passed (0 errors, 2 warnings)

🎯 Step 4: Running Lighthouse audit...
✅ Lighthouse audit passed
Performance: 95/100 ✅
Accessibility: 92/100 ✅
Best Practices: 94/100 ✅
SEO: 96/100 ✅

🦇 BroCula has spoken. Your code is clean... for now. 🦇
```

## Troubleshooting

### Console errors in development

Some console errors are acceptable in development (HMR, Vite). BroCula filters these automatically.

### Lighthouse scores low in CI

CI environments may have different performance characteristics. Ensure:

1. Production build is used
2. Server is fully started before testing
3. Network conditions are stable

### Playwright browser installation

If browsers are not installed:

```bash
npx playwright install
```

## Development

### Adding New Tests

Create new `.spec.ts` files in `tests/brocula/`:

```typescript
import { test, expect } from '@playwright/test'

test('my custom test', async ({ page }) => {
  await page.goto('/my-page')
  // Your test logic
})
```

### Extending BroCula CLI

Edit `scripts/brocula/brocula.ts` to add new commands:

```typescript
case 'my-command':
  runMyCommand();
  break;
```

## Contributing

When submitting PRs:

1. Ensure `npm run brocula` passes
2. Fix all console errors
3. Maintain Lighthouse scores ≥ 90
4. No lint/build errors (fatal!)

## License

Same as the main project.

---

🦇 _"In the darkness of the console, BroCula sees all errors."_ 🦇
