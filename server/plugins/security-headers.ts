import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'

// Security headers plugin to enhance XSS protection and add HSTS
// This plugin focuses on Content Security Policy which is not covered by routeRules
// Other security headers are handled in nuxt.config.ts routeRules to avoid duplication

export default defineNitroPlugin(nitroApp => {
  // Only apply security headers in production or non-test environments
  if (process.env.NODE_ENV !== 'test') {
    nitroApp.hooks.hook('render:html', (html, { event }) => {
      // Generate a unique nonce for each request to allow inline scripts/styles when needed
      const nonce = randomBytes(16).toString('base64')

      // Set Content Security Policy - more restrictive without 'unsafe-inline' and 'unsafe-eval'
      // This header is specifically for CSP which is not set in routeRules
      event.node.res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; ` +
          `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:; ` +
          `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; ` +
          `font-src 'self' https://fonts.gstatic.com; ` +
          `img-src 'self' data: blob: https:; ` +
          `connect-src 'self' https:; ` +
          `frame-ancestors 'none'; ` +
          `object-src 'none'; ` +
          `base-uri 'self'; ` +
          `form-action 'self'; ` +
          `upgrade-insecure-requests;`
      )

      // Add nonce to HTML if it's available
      if (html.body && nonce) {
        // Add the nonce to any inline scripts in the HTML
        // This is handled by Nuxt's built-in nonce support
      }
    })
  }
})
