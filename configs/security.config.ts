// Security Configuration - CSP, Headers, and Security Policies
// Flexy hates hardcoded values! All security settings are now configurable.

// Parse environment variable for allowed origins
const parseAllowedOrigins = (): string[] => {
  const origins =
    process.env.ALLOWED_ORIGINS ||
    process.env.NUXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  return origins.split(',').map(origin => origin.trim())
}

export const securityConfig = {
  // CSP Directives Configuration
  csp: {
    defaultSrc: parseCspDirective(process.env.CSP_DEFAULT_SRC || "'self'"),
    scriptSrc: parseCspDirective(
      process.env.CSP_SCRIPT_SRC || "'self', 'unsafe-eval', 'unsafe-inline'"
    ),
    styleSrc: parseCspDirective(
      process.env.CSP_STYLE_SRC ||
        "'self', 'unsafe-inline', https://fonts.googleapis.com"
    ),
    imgSrc: parseCspDirective(
      process.env.CSP_IMG_SRC || "'self', data:, blob:, https:"
    ),
    fontSrc: parseCspDirective(
      process.env.CSP_FONT_SRC ||
        "'self', https://fonts.gstatic.com, https://fonts.googleapis.com"
    ),
    connectSrc: parseCspDirective(
      process.env.CSP_CONNECT_SRC ||
        "'self', https://fonts.googleapis.com, https://fonts.gstatic.com, https://unpkg.com, https://twitter.com, https://www.facebook.com, https://www.linkedin.com, https://www.reddit.com"
    ),
    frameSrc: parseCspDirective(
      process.env.CSP_FRAME_SRC || "'self' blob: data:"
    ),
    frameAncestors: parseCspDirective(
      process.env.CSP_FRAME_ANCESTORS || "'none'"
    ),
    objectSrc: parseCspDirective(process.env.CSP_OBJECT_SRC || "'none'"),
    baseUri: parseCspDirective(process.env.CSP_BASE_URI || "'self'"),
    formAction: parseCspDirective(process.env.CSP_FORM_ACTION || "'self'"),
  },

  // Additional Security Headers
  headers: {
    'X-Content-Type-Options':
      process.env.HEADER_CONTENT_TYPE_OPTIONS || 'nosniff',
    'X-Frame-Options': process.env.HEADER_FRAME_OPTIONS || 'DENY',
    'X-XSS-Protection': process.env.HEADER_XSS_PROTECTION || '0',
    'Referrer-Policy':
      process.env.HEADER_REFERRER_POLICY || 'strict-origin-when-cross-origin',
    'Strict-Transport-Security':
      process.env.HEADER_HSTS || 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy':
      process.env.HEADER_PERMISSIONS_POLICY ||
      'geolocation=(), microphone=(), camera=()',
  },

  // Alias for backward compatibility with tests
  additionalHeaders: {
    'X-Content-Type-Options':
      process.env.HEADER_CONTENT_TYPE_OPTIONS || 'nosniff',
    'X-Frame-Options': process.env.HEADER_FRAME_OPTIONS || 'DENY',
    'X-XSS-Protection': process.env.HEADER_XSS_PROTECTION || '0',
    'Referrer-Policy':
      process.env.HEADER_REFERRER_POLICY || 'strict-origin-when-cross-origin',
    'Strict-Transport-Security':
      process.env.HEADER_HSTS || 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy':
      process.env.HEADER_PERMISSIONS_POLICY ||
      'geolocation=(), microphone=(), camera=()',
    'Access-Control-Allow-Methods':
      process.env.CORS_ALLOWED_METHODS || 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      process.env.CORS_ALLOWED_HEADERS || 'Content-Type, Authorization',
  },

  // CORS Configuration
  cors: {
    allowedOrigins: parseAllowedOrigins(),
    allowedMethods: parseCorsMethods(
      process.env.CORS_ALLOWED_METHODS || 'GET, HEAD, POST, OPTIONS'
    ),
    allowedHeaders: parseCorsHeaders(
      process.env.CORS_ALLOWED_HEADERS || 'Content-Type, Authorization'
    ),
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400'),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Image Optimization
  image: {
    quality: parseInt(process.env.IMAGE_QUALITY || '80'),
    formats: parseImageFormats(process.env.IMAGE_FORMATS || 'avif, jpeg, png'),
    densities: parseDensities(process.env.IMAGE_DENSITIES || '1, 2'),
  },
} as const

// Helper function to parse CSP directive string
function parseCspDirective(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

// Helper function to parse CORS methods
function parseCorsMethods(value: string): string[] {
  return value.split(',').map(s => s.trim().toUpperCase())
}

// Helper function to parse CORS headers
function parseCorsHeaders(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

// Helper function to parse image formats
function parseImageFormats(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

// Helper function to parse image densities
function parseDensities(value: string): number[] {
  return value.split(',').map(s => parseFloat(s.trim()))
}

// Function to generate CSP string with optional nonce
export function generateCsp(nonce?: string): string {
  let cspString = ''

  Object.entries(securityConfig.csp).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      let sourceString = sources.join(' ')

      // Add nonce to script-src and style-src if provided
      if (
        nonce &&
        (directive === 'scriptSrc' || directive === 'styleSrc') &&
        process.env.NODE_ENV !== 'development'
      ) {
        sourceString = `'nonce-${nonce}' ${sourceString}`
      }

      cspString += `${directive.replace(/([A-Z])/g, '-$1').toLowerCase()} ${sourceString}; `
    }
  })

  cspString += 'upgrade-insecure-requests; '

  return cspString.trim()
}

// Function to get all security headers
export function getSecurityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    ...securityConfig.headers,
    'Access-Control-Allow-Origin': securityConfig.cors.allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods':
      securityConfig.cors.allowedMethods.join(', '),
    'Access-Control-Allow-Headers':
      securityConfig.cors.allowedHeaders.join(', '),
    'Access-Control-Max-Age': securityConfig.cors.maxAge.toString(),
  }

  if (nonce) {
    headers['Content-Security-Policy'] = generateCsp(nonce)
  } else {
    headers['Content-Security-Policy'] = generateCsp()
  }

  return headers
}

export type SecurityConfig = typeof securityConfig
