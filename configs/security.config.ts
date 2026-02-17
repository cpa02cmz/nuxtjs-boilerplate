// Security Configuration - CSP, Headers, and Security Policies
// Flexy hates hardcoded values! All security settings are now configurable.

import { DEFAULT_DEV_URL } from './url.config'

// Parse environment variable for allowed origins
const parseAllowedOrigins = (): string[] => {
  const origins =
    process.env.ALLOWED_ORIGINS ||
    process.env.NUXT_PUBLIC_SITE_URL ||
    DEFAULT_DEV_URL
  return origins.split(',').map(origin => origin.trim())
}

export const securityConfig = {
  // CSP Directives Configuration
  csp: {
    defaultSrc: parseCspDirective(process.env.CSP_DEFAULT_SRC || "'self'"),
    // P3 Security Fix: Issue #3337 - Removed unsafe-eval and unsafe-inline from defaults
    // These directives significantly weaken XSS protection and should not be default
    // For development: Set CSP_SCRIPT_SRC="'self', 'unsafe-eval', 'unsafe-inline'"
    // For production: Use nonce-based CSP (nonces added automatically in generateCsp)
    scriptSrc: parseCspDirective(process.env.CSP_SCRIPT_SRC || "'self'"),
    styleSrc: parseCspDirective(
      process.env.CSP_STYLE_SRC || "'self', https://fonts.googleapis.com"
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
    // BroCula fix: Add worker-src to allow blob workers (fixes CSP violation on About page)
    workerSrc: parseCspDirective(process.env.CSP_WORKER_SRC || "'self' blob:"),
    frameAncestors: parseCspDirective(
      process.env.CSP_FRAME_ANCESTORS || "'none'"
    ),
    objectSrc: parseCspDirective(process.env.CSP_OBJECT_SRC || "'none'"),
    baseUri: parseCspDirective(process.env.CSP_BASE_URI || "'self'"),
    formAction: parseCspDirective(process.env.CSP_FORM_ACTION || "'self'"),
    // CSP Violation Reporting
    reportUri: parseCspDirective(
      process.env.CSP_REPORT_URI || '/api/security/csp-report'
    ),
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

  // API Key Cryptography - Flexy hates hardcoded security values!
  apiKeyCrypto: {
    // Cost factor for bcrypt (higher = more secure but slower)
    // 12 is a good balance between security and performance
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),

    // Length of key prefix to store for identification
    keyPrefixLength: parseInt(process.env.API_KEY_PREFIX_LENGTH || '8'),

    // Length of random bytes for API key generation
    keyLength: parseInt(process.env.API_KEY_LENGTH || '32'),

    // Minimum length for valid API key (for masking validation) - Flexy hates hardcoded 12!
    minKeyLength: parseInt(process.env.API_KEY_MIN_LENGTH || '12'),
  },

  // Cryptographic Constants - Flexy hates hardcoded values!
  crypto: {
    // Nonce length for CSP in bytes (default: 16 = 128 bits)
    nonceLength: parseInt(process.env.CRYPTO_NONCE_LENGTH || '16'),

    // IV length for AES encryption in bytes (default: 16 = 128 bits for GCM)
    ivLength: parseInt(process.env.CRYPTO_IV_LENGTH || '16'),

    // Encryption key length for scrypt in bytes (default: 32 = 256 bits)
    keyLength: parseInt(process.env.CRYPTO_KEY_LENGTH || '32'),

    // Salt for scrypt key derivation - must be set explicitly, no default for security
    // BroCula fix: Use getter to defer check until actually accessed
    // This prevents errors during module initialization in browser/client-side
    get salt() {
      const salt = process.env.CRYPTO_SALT
      // Skip check during build process, client-side, or when explicitly disabled
      const isClient = typeof window !== 'undefined'
      const skipCheck =
        isClient ||
        process.env.SKIP_CRYPTO_CHECK === 'true' ||
        process.env.NUXT_BUILD === 'true' ||
        process.env.npm_lifecycle_event === 'build'
      if (!salt && process.env.NODE_ENV === 'production' && !skipCheck) {
        throw new Error(
          'CRYPTO_SALT environment variable must be set in production for secure encryption. Generate a secure salt using crypto.randomBytes(32).toString("hex")'
        )
      }
      // In non-production environments or client-side, use a development-only salt
      return salt || 'dev-salt-not-for-production-use-only'
    },

    // Encryption algorithm
    algorithm: process.env.CRYPTO_ALGORITHM || 'aes-256-gcm',

    // Encoding for encrypted data
    encoding: process.env.CRYPTO_ENCODING || 'base64',

    // Webhook secret length in bytes
    webhookSecretLength: parseInt(process.env.WEBHOOK_SECRET_LENGTH || '32'),

    // Webhook secret prefix
    webhookSecretPrefix: process.env.WEBHOOK_SECRET_PREFIX || 'whsec_',
  },

  // Sanitization Configuration - Flexy hates hardcoded forbidden tags!
  sanitization: {
    // HTML tags that are forbidden in user content
    forbiddenTags: parseForbiddenTags(
      process.env.SANITIZE_FORBIDDEN_TAGS ||
        'script,iframe,object,embed,form,input,button,img,link,meta,base,basefont,frame,frameset,ilayer,layer,bgsound,title,style,svg,audio,video,canvas,applet,area,map,param,source,track,keygen,output,progress,meter,details,summary,menu,menuitem,dialog,a,strong,b,i,em,u,span,div,p,h1,h2,h3,h4,h5,h6,ul,ol,li,br,hr'
    ),

    // HTML attributes that are forbidden in user content
    forbiddenAttributes: parseForbiddenAttributes(
      process.env.SANITIZE_FORBIDDEN_ATTR ||
        'src,href,style,onload,onerror,onclick,onmouseover,onmouseout,onfocus,onblur,onkeydown,onkeypress,onkeyup,ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,onmousedown,onmouseenter,onmouseleave,onmousemove,onmouseup,onwheel,onpause,onplay,onplaying,onprogress,onratechange,onseeked,onseeking,onstalled,onsuspend,ontimeupdate,onvolumechange,onwaiting,onafterprint,onbeforeprint,onbeforeunload,onerror,onhashchange,onload,onmessage,onoffline,ononline,onpagehide,onpageshow,onpopstate,onresize,onscroll,onstorage,onunload,data,formaction,xmlns,xlink:href,usemap,ismap,action,code,codebase,classid,pluginspage,pluginurl,declare,standby,id,name'
    ),

    // Content tags that are forbidden
    forbiddenContentTags: parseForbiddenTags(
      process.env.SANITIZE_FORBIDDEN_CONTENT ||
        'script,iframe,object,embed,form,input,button,img,link,meta,base,basefont,frame,frameset,ilayer,layer,bgsound,title,style,svg'
    ),

    // Allowed tags after sanitization
    allowedTags: parseAllowedTags(process.env.SANITIZE_ALLOWED_TAGS || 'mark'),

    // Allowed attributes after sanitization
    allowedAttributes: parseAllowedAttributes(
      process.env.SANITIZE_ALLOWED_ATTR || 'class'
    ),

    // Enable DOM sanitization
    sanitizeDom: process.env.SANITIZE_DOM !== 'false',
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

// Helper function to parse forbidden tags
function parseForbiddenTags(value: string): string[] {
  return value.split(',').map(s => s.trim().toLowerCase())
}

// Helper function to parse forbidden attributes
function parseForbiddenAttributes(value: string): string[] {
  return value.split(',').map(s => s.trim().toLowerCase())
}

// Helper function to parse allowed tags
function parseAllowedTags(value: string): string[] {
  return value.split(',').map(s => s.trim().toLowerCase())
}

// Helper function to parse allowed attributes
function parseAllowedAttributes(value: string): string[] {
  return value.split(',').map(s => s.trim().toLowerCase())
}

// Function to generate CSP string with optional nonce
export function generateCsp(nonce?: string): string {
  let cspString = ''
  const isDev = process.env.NODE_ENV === 'development'

  Object.entries(securityConfig.csp).forEach(([directive, sources]) => {
    if (sources.length > 0) {
      let sourceString = sources.join(' ')

      // Add nonce to script-src and style-src if provided (only in production)
      // In development, we skip nonces to avoid blocking inline scripts/styles
      if (
        nonce &&
        (directive === 'scriptSrc' || directive === 'styleSrc') &&
        !isDev
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
