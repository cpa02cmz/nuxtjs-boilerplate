import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'

// Security headers plugin to enhance XSS protection and add HSTS
// This plugin consolidates all security header configuration in one place
// Applies appropriate security headers based on environment

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Only apply security headers to HTML responses, not API routes
    const contentType = event.node.res.getHeader('content-type')
    if (
      contentType &&
      typeof contentType === 'string' &&
      !contentType.includes('text/html')
    ) {
      return
    }

    // Generate a unique nonce for each request to allow inline scripts/styles when needed
    const nonce = randomBytes(16).toString('base64')

    // Determine if we're in development mode
    const isDev = process.env.NODE_ENV === 'development'

    // Set Content Security Policy - adjust based on environment
    let csp =
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:; ` +
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://fonts.gstatic.com; ` +
      `font-src 'self' https://fonts.gstatic.com; ` +
      `img-src 'self' data: blob: https:; ` +
      `connect-src 'self' https:; ` +
      `frame-ancestors 'none'; ` +
      `object-src 'none'; ` +
      `base-uri 'self'; ` +
      `form-action 'self'; `

    // In development, allow more flexibility for debugging tools
    if (isDev) {
      csp +=
        `script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; ` +
        `style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; `
    } else {
      // In production, use stricter policy and upgrade insecure requests
      csp += `upgrade-insecure-requests;`
    }

    event.node.res.setHeader('Content-Security-Policy', csp)

    // Additional security headers
    event.node.res.setHeader('X-Content-Type-Options', 'nosniff')
    event.node.res.setHeader('X-Frame-Options', 'DENY')
    // Modern CSP makes X-XSS-Protection redundant, and legacy X-XSS-Protection can cause issues
    event.node.res.setHeader('X-XSS-Protection', '0')
    event.node.res.setHeader(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    )

    // Only set HSTS in production (it's permanent and can't be undone if set in dev)
    if (!isDev) {
      event.node.res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    event.node.res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    )
    // CORS headers - only allow necessary methods and headers
    event.node.res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, HEAD, POST, OPTIONS'
    )
    event.node.res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    )

    // Store nonce in event context for use in components if needed
    event.context.nonce = nonce
  })
})
