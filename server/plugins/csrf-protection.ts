import { defineNitroPlugin } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import { setCookie, getCookie } from 'h3'
import { randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * CSRF Protection Plugin
 * Implements Double Submit Cookie pattern for CSRF protection
 *
 * This plugin:
 * 1. Generates/retrieves CSRF tokens for all requests
 * 2. Validates CSRF tokens for state-changing operations (POST, PUT, DELETE, PATCH)
 * 3. Sets appropriate CSRF token cookies
 */

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

// Generate a cryptographically secure CSRF token
function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Timing-safe comparison of two strings
 * Prevents timing attacks by comparing all bytes regardless of mismatch
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return timingSafeEqual(bufA, bufB)
}

export default defineNitroPlugin(nitroApp => {
  // Hook into request processing
  nitroApp.hooks.hook('request', async (event: H3Event) => {
    try {
      const path = event.path || ''
      const method = event.node.req.method || 'GET'

      // Only process API routes
      if (!path.startsWith('/api/')) {
        return
      }

      // Get or create CSRF token
      let csrfToken = getCookie(event, CSRF_COOKIE_NAME)

      if (!csrfToken) {
        csrfToken = generateCsrfToken()
        // Set CSRF token cookie with secure attributes
        setCookie(event, CSRF_COOKIE_NAME, csrfToken, {
          httpOnly: false, // Must be accessible by JavaScript for Double Submit pattern
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: CSRF_COOKIE_MAX_AGE,
          path: '/',
        })
      }

      // For state-changing methods, validate CSRF token
      if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
        const headerToken =
          event.node.req.headers[CSRF_HEADER_NAME.toLowerCase()]

        // Check if token matches using timing-safe comparison
        if (
          !headerToken ||
          !timingSafeCompare(String(headerToken), csrfToken)
        ) {
          // Token mismatch - reject the request
          event.node.res.statusCode = 403
          event.node.res.setHeader('Content-Type', 'application/json')
          event.node.res.end(
            JSON.stringify({
              statusCode: 403,
              statusMessage: 'Forbidden',
              message:
                'CSRF token validation failed. Please include the CSRF token in the X-CSRF-Token header.',
            })
          )
          return
        }
      }

      // Expose CSRF token header for client-side use
      event.node.res.setHeader('X-CSRF-Token', csrfToken)
    } catch (error) {
      // Log error but don't break the request
      console.error('CSRF protection error:', error)
    }
  })
})
