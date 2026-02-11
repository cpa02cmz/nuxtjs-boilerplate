// CSRF (Cross-Site Request Forgery) Protection Utilities
// Implements Double Submit Cookie pattern for CSRF protection
// Flexy loves modularity! Using centralized CSRF config.

import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { getCookie, setCookie, readBody } from 'h3'
import {
  csrfConfig,
  isSafeMethod,
  isStateChangingMethod,
  requiresCsrfProtection,
} from '~/configs/csrf.config'

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return timingSafeEqual(bufA, bufB)
}

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(csrfConfig.token.bytes).toString(csrfConfig.token.encoding)
}

/**
 * Get or create CSRF token for the current session
 * Sets the token as a cookie if it doesn't exist
 */
export function getCsrfToken(event: H3Event): string {
  let token = getCookie(event, csrfConfig.cookie.name)

  if (!token) {
    token = generateCsrfToken()
    setCsrfTokenCookie(event, token)
  }

  return token
}

/**
 * Set CSRF token cookie with secure attributes
 */
function setCsrfTokenCookie(event: H3Event, token: string): void {
  setCookie(event, csrfConfig.cookie.name, token, {
    httpOnly: csrfConfig.cookie.httpOnly,
    secure: csrfConfig.cookie.secure,
    sameSite: csrfConfig.cookie.sameSite,
    maxAge: csrfConfig.cookie.maxAge,
    path: csrfConfig.cookie.path,
  })
}

/**
 * Validate CSRF token from request against the cookie token
 * Returns true if valid, false otherwise
 */
export function validateCsrfToken(event: H3Event): boolean {
  // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
  const method = event.node.req.method || ''
  if (isSafeMethod(method)) {
    return true
  }

  const cookieToken = getCookie(event, csrfConfig.cookie.name)

  // If no cookie token exists, the request is invalid
  if (!cookieToken) {
    return false
  }

  // Get token from header (preferred for API requests)
  const headerToken =
    event.node.req.headers[csrfConfig.header.name.toLowerCase()]

  if (headerToken && typeof headerToken === 'string') {
    return safeCompare(headerToken, cookieToken)
  }

  // For form submissions (JSON, form-urlencoded, multipart), the CSRF token
  // must be validated by the route handler using requireCsrfToken() which
  // has access to the parsed body. Returning false here ensures middleware
  // doesn't bypass CSRF protection for these content types.
  return false
}

/**
 * Middleware to require CSRF token validation for state-changing operations
 * Use this in API route handlers that modify data
 */
export async function requireCsrfToken(event: H3Event): Promise<boolean> {
  // Skip CSRF validation for safe methods
  const method = event.node.req.method || ''
  if (isSafeMethod(method)) {
    return true
  }

  const cookieToken = getCookie(event, csrfConfig.cookie.name)

  if (!cookieToken) {
    return false
  }

  // Check header first
  const headerToken =
    event.node.req.headers[csrfConfig.header.name.toLowerCase()]
  if (headerToken && typeof headerToken === 'string') {
    return safeCompare(headerToken, cookieToken)
  }

  // For state-changing methods, check body token
  if (isStateChangingMethod(method)) {
    try {
      const body = await readBody(event).catch(() => null)
      if (body && typeof body === 'object' && 'csrf_token' in body) {
        return safeCompare(body.csrf_token, cookieToken)
      }
    } catch {
      // Ignore body parsing errors
    }
  }

  return false
}

// Re-export from config for convenience
export { requiresCsrfProtection }

/**
 * Refresh CSRF token (e.g., after successful authentication)
 */
export function refreshCsrfToken(event: H3Event): string {
  const newToken = generateCsrfToken()
  setCsrfTokenCookie(event, newToken)
  return newToken
}

/**
 * Clear CSRF token (e.g., on logout)
 */
export function clearCsrfToken(event: H3Event): void {
  setCookie(event, csrfConfig.cookie.name, '', {
    httpOnly: csrfConfig.cookie.httpOnly,
    secure: csrfConfig.cookie.secure,
    sameSite: csrfConfig.cookie.sameSite,
    maxAge: 0,
    path: csrfConfig.cookie.path,
  })
}
