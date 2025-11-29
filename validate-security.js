// Simple validation script to check that security implementation is syntactically correct
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (
  process.env.NODE_ENV !== 'production' ||
  process.env.VALIDATION_LOGS === 'true'
) {
  // eslint-disable-next-line no-console
  console.log('Validating security implementation...')
}

// Check both approaches: centralized sanitization in utils/sanitize.ts and usage in ResourceCard.vue
const sanitizeUtilPath = path.join(__dirname, 'utils/sanitize.ts')
const resourceCardPath = path.join(__dirname, 'components/ResourceCard.vue')

if (fs.existsSync(sanitizeUtilPath)) {
  const sanitizeUtilContent = fs.readFileSync(sanitizeUtilPath, 'utf8')
  
  if (sanitizeUtilContent.includes("import DOMPurify from 'dompurify'")) {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log('✓ DOMPurify import found in centralized utils/sanitize.ts')
    }
  } else {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log('✗ DOMPurify import NOT found in centralized utils/sanitize.ts')
    }
  }
}

const resourceCardContent = fs.readFileSync(resourceCardPath, 'utf8')

// For centralized sanitization approach, check that the utility is being used
if (
  resourceCardContent.includes(
    "import { sanitizeAndHighlight } from '~/utils/sanitize'"
  ) ||
  resourceCardContent.includes('sanitizeAndHighlight')
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Centralized sanitization usage found in ResourceCard.vue')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✗ Centralized sanitization usage NOT found in ResourceCard.vue'
    )
  }
}

// Check if ResourceCard.vue uses the centralized sanitization utility
if (
  resourceCardContent.includes(
    "import { sanitizeAndHighlight } from '~/utils/sanitize'"
  )
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Centralized sanitization import found in ResourceCard.vue')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✗ Centralized sanitization import NOT found in ResourceCard.vue'
    )
  }
}

// Validate that ResourceCard.vue uses the centralized sanitization function
if (resourceCardContent.includes('sanitizeAndHighlight')) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✓ Centralized sanitization function usage found in ResourceCard.vue'
    )
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✗ Centralized sanitization function usage NOT found in ResourceCard.vue'
    )
  }
}

// Check if security headers plugin exists
const securityPluginPath = path.join(
  __dirname,
  'server/plugins/security-headers.ts'
)
if (fs.existsSync(securityPluginPath)) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ Security headers plugin exists')
  }
  const securityPluginContent = fs.readFileSync(securityPluginPath, 'utf8')
  if (securityPluginContent.includes('Content-Security-Policy')) {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log('✓ CSP header configuration found in security headers plugin')
    }
  } else {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.VALIDATION_LOGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.log(
        '✗ CSP header configuration NOT found in security headers plugin'
      )
    }
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✗ Security headers plugin does NOT exist')
  }
}

// Check if security headers are in nuxt.config.ts - specifically looking for security configuration
const nuxtConfigPath = path.join(__dirname, 'nuxt.config.ts')
const nuxtConfigContent = fs.readFileSync(nuxtConfigPath, 'utf8')

if (
  nuxtConfigContent.includes('Security Configuration') &&
  nuxtConfigContent.includes('security-headers.ts')
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✓ CSP configuration reference found in nuxt.config.ts')
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log('✗ CSP configuration reference NOT found in nuxt.config.ts')
  }
}

if (
  nuxtConfigContent.includes('Content-Security-Policy') ||
  nuxtConfigContent.includes('csp') ||
  nuxtConfigContent.includes('Security Configuration') &&
  nuxtConfigContent.includes('server plugin')
) {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✓ Security headers configuration reference found in nuxt.config.ts'
    )
  }
} else {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.VALIDATION_LOGS === 'true'
  ) {
    // eslint-disable-next-line no-console
    console.log(
      '✗ Security headers configuration reference NOT found in nuxt.config.ts'
    )
  }
}