import { defineNitroPlugin } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import { setCookie, getCookie } from 'h3'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { logger } from '~/utils/logger'
import { csrfConfig, isSafeMethod } from '~/configs/csrf.config'
import { httpConfig } from '~/configs/http.config'

/**
 * Timing-safe string comparison to prevent timing attacks
 * Compares two strings in constant time regardless of content
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/**
 * CSRF Protection Plugin
 * Implements Double Submit Cookie pattern for CSRF protection
 *
 * This plugin:
 * 1. Generates/retrieves CSRF tokens for all requests
 * 2. Validates CSRF tokens for state-changing operations (POST, PUT, DELETE, PATCH)
 * 3. Sets appropriate CSRF token cookies
 *
 * Flexy loves modularity! Using centralized CSRF config.
 */

// Generate a cryptographically secure CSRF token
function generateCsrfToken(): string {
  return randomBytes(csrfConfig.token.bytes).toString(csrfConfig.token.encoding)
}

export default defineNitroPlugin(nitroApp => {
  // Hook into request processing
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    try {
      const path = event.path || ''
      const method = event.node.req.method || httpConfig.methods.GET

      // Only process API routes
      if (!path.startsWith('/api/')) {
        return
      }

      // Check if this path requires CSRF protection
      const requiresProtection = csrfConfig.protectedPaths.prefixes.some(
        prefix => path.startsWith(prefix)
      )

      // Skip CSRF processing for non-protected paths
      if (!requiresProtection) {
        return
      }

      // Get or create CSRF token
      let csrfToken = getCookie(event, csrfConfig.cookie.name)

      if (!csrfToken) {
        csrfToken = generateCsrfToken()
        // Set CSRF token cookie with secure attributes
        setCookie(event, csrfConfig.cookie.name, csrfToken, {
          httpOnly: csrfConfig.cookie.httpOnly,
          secure: csrfConfig.cookie.secure,
          sameSite: csrfConfig.cookie.sameSite,
          maxAge: csrfConfig.cookie.maxAge,
          path: csrfConfig.cookie.path,
        })
      }

      // For state-changing methods, validate CSRF token
      if (!isSafeMethod(method)) {
        const headerToken =
          event.node.req.headers[csrfConfig.header.name.toLowerCase()]

        // Check if token matches using timing-safe comparison
        if (!headerToken || !safeCompare(String(headerToken), csrfToken)) {
          // Token mismatch - reject the request
          event.node.res.statusCode = httpConfig.status.FORBIDDEN
          event.node.res.setHeader(
            httpConfig.headers.CONTENT_TYPE,
            httpConfig.contentTypes.JSON
          )
          event.node.res.end(
            JSON.stringify({
              statusCode: httpConfig.status.FORBIDDEN,
              statusMessage: 'Forbidden',
              message: csrfConfig.errors.validationFailed,
            })
          )
          return
        }
      }

      // Expose CSRF token header for client-side use
      event.node.res.setHeader(csrfConfig.header.responseHeader, csrfToken)
    } catch (error) {
      // Log error but don't break the request
      logger.error('CSRF protection error:', error)
    }
  })
})
