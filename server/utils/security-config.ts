// Centralized security configuration
// This file contains the unified security settings for the application

interface SecurityConfig {
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    frameAncestors: string[]
    objectSrc: string[]
    baseUri: string[]
    formAction: string[]
  }
  additionalHeaders: {
    [key: string]: string
  }
}

// Define the security configuration
export const securityConfig: SecurityConfig = {
  csp: {
    defaultSrc: ["'self'"],
    // Security fix: Removed generic 'https:' which allowed any HTTPS script
    // Now using strict CSP with nonce support and self/strict-dynamic only
    // In development, we need to allow eval and inline scripts for HMR
    // Note: strict-dynamic is removed in development as it conflicts with unsafe-inline
    scriptSrc:
      process.env.NODE_ENV === 'development'
        ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"]
        : ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: [
      "'self'",
      'data:', // Data URLs for images
      'blob:', // Blob URLs
      'https:', // External images
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com', // External fonts
      'https://fonts.googleapis.com', // Font CSS
    ],
    connectSrc: [
      "'self'",
      // Restricted from generic 'https:' to specific domains for security
      // Resource validation and webhooks require external connectivity
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://unpkg.com',
      'https://twitter.com',
      'https://www.facebook.com',
      'https://www.linkedin.com',
      'https://www.reddit.com',
      ...(process.env.NODE_ENV === 'development' ? ['ws:', 'wss:'] : []), // Allow WebSocket for HMR
    ],
    frameAncestors: ["'none'"], // Prevent embedding in iframes
    objectSrc: ["'none'"], // Prevent plugins like Flash
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },
  additionalHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0', // Modern CSP makes this redundant
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
}

// Function to generate CSP string with nonce
export function generateCsp(nonce?: string): string {
  let cspString = ''

  // Build CSP directives
  Object.entries(securityConfig.csp).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      let sourceString = sources.join(' ')

      // Add nonce to script-src and style-src if provided
      // In development, don't add nonce to avoid conflicts with unsafe-inline
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

  // Add upgrade-insecure-requests directive
  cspString += 'upgrade-insecure-requests; '

  return cspString.trim()
}

// Function to get all security headers with optional nonce
export function getSecurityHeaders(nonce?: string): { [key: string]: string } {
  const headers: { [key: string]: string } = {
    ...securityConfig.additionalHeaders,
  }

  // Add CSP with nonce if provided
  if (nonce) {
    headers['Content-Security-Policy'] = generateCsp(nonce)
  } else {
    // Generate CSP without nonce
    headers['Content-Security-Policy'] = generateCsp()
  }

  return headers
}
