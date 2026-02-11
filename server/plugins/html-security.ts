import { defineNitroPlugin } from 'nitropack/runtime'
import { randomBytes } from 'node:crypto'
import { getSecurityHeaders } from '../utils/security-config'
import { logger } from '~/utils/logger'
import { securityConfig } from '~/configs/security.config'

// HTML Security Plugin - handles security headers for HTML responses
// This plugin coordinates with the API response security to prevent duplication
export default defineNitroPlugin(nitroApp => {
  // Hook into the HTML rendering process to add security headers for HTML responses
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    try {
      // Check if response object is available
      if (!event || !event.node || !event.node.res) {
        return
      }

      // Only use nonces in production to avoid CSP blocking inline scripts in dev
      // In development, we rely on 'unsafe-inline' instead
      const isDev = process.env.NODE_ENV === 'development'
      const nonce = isDev
        ? undefined
        : randomBytes(securityConfig.crypto.nonceLength).toString('base64')

      // Get security headers with nonce (nonce only in production)
      const securityHeaders = getSecurityHeaders(nonce)

      // Set security headers for this response
      if (event.node.res.setHeader) {
        Object.entries(securityHeaders).forEach(([headerName, headerValue]) => {
          event.node.res.setHeader(headerName, headerValue)
        })
      }

      // In production, we would inject nonces into script/style tags here
      // For now, we skip nonces in development to allow inline scripts/styles
      // This is handled by Nuxt's built-in nonce support when configured properly
    } catch (error) {
      // Log errors but don't expose detailed errors in production
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Failed to set security headers in render:html:', error)
      } else {
        logger.error('HTML security header setting failed')
      }
    }
  })
})
