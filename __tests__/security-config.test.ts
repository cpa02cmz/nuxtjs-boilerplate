import { describe, it, expect } from 'vitest'
import {
  getSecurityHeaders,
  generateCsp,
  securityConfig,
} from '../server/utils/security-config'

describe('Security Configuration', () => {
  describe('CSP Generation', () => {
    it('should generate CSP without nonce when no nonce is provided', () => {
      const csp = generateCsp()
      expect(csp).toContain("default-src 'self'")
      // P3 Security Fix: Issue #3337 - unsafe-eval and unsafe-inline removed from defaults
      expect(csp).toContain("script-src 'self'")
      expect(csp).toContain("style-src 'self' https://fonts.googleapis.com")
      expect(csp).not.toContain('nonce-')
    })

    it('should generate CSP with nonce when nonce is provided', () => {
      const nonce = 'test-nonce-123'
      const csp = generateCsp(nonce)

      expect(csp).toContain("default-src 'self'")
      // P3 Security Fix: Issue #3337 - Secure defaults without unsafe directives
      expect(csp).toContain(`script-src 'nonce-${nonce}' 'self'`)
      expect(csp).toContain(
        `style-src 'nonce-${nonce}' 'self' https://fonts.googleapis.com`
      )
      expect(csp).toContain(`nonce-${nonce}`)
    })

    it('should include all required CSP directives', () => {
      const csp = generateCsp()

      expect(csp).toContain('default-src')
      expect(csp).toContain('script-src')
      expect(csp).toContain('style-src')
      expect(csp).toContain('img-src')
      expect(csp).toContain('font-src')
      expect(csp).toContain('connect-src')
      expect(csp).toContain('frame-ancestors')
      expect(csp).toContain('object-src')
      expect(csp).toContain('base-uri')
      expect(csp).toContain('form-action')
      expect(csp).toContain('upgrade-insecure-requests')
    })
  })

  describe('Security Headers', () => {
    it('should return all additional security headers without nonce', () => {
      const headers = getSecurityHeaders()

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('0')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload'
      )
      expect(headers['Permissions-Policy']).toBe(
        'geolocation=(), microphone=(), camera=()'
      )
      expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin')
      // Security Engineer: Verify X-DNS-Prefetch-Control header is set
      expect(headers['X-DNS-Prefetch-Control']).toBe('off')
      expect(headers['Access-Control-Allow-Methods']).toBe(
        'GET, HEAD, POST, OPTIONS'
      )
      expect(headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type, Authorization'
      )
      expect(headers['Content-Security-Policy']).toBeDefined()
    })

    it('should return all security headers with nonce when provided', () => {
      const nonce = 'test-nonce-456'
      const headers = getSecurityHeaders(nonce)

      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('0')
      expect(headers['Content-Security-Policy']).toContain(`nonce-${nonce}`)
    })
  })

  describe('Security Config Structure', () => {
    it('should have the correct CSP structure', () => {
      expect(securityConfig.csp).toHaveProperty('defaultSrc')
      expect(securityConfig.csp).toHaveProperty('scriptSrc')
      expect(securityConfig.csp).toHaveProperty('styleSrc')
      expect(securityConfig.csp).toHaveProperty('imgSrc')
      expect(securityConfig.csp).toHaveProperty('fontSrc')
      expect(securityConfig.csp).toHaveProperty('connectSrc')
      expect(securityConfig.csp).toHaveProperty('frameAncestors')
      expect(securityConfig.csp).toHaveProperty('objectSrc')
      expect(securityConfig.csp).toHaveProperty('baseUri')
      expect(securityConfig.csp).toHaveProperty('formAction')
    })

    it('should have additional security headers', () => {
      expect(securityConfig.headers).toHaveProperty('X-Content-Type-Options')
      expect(securityConfig.headers).toHaveProperty('X-Frame-Options')
      expect(securityConfig.headers).toHaveProperty('X-XSS-Protection')
      expect(securityConfig.headers).toHaveProperty('Referrer-Policy')
      expect(securityConfig.headers).toHaveProperty('Strict-Transport-Security')
      expect(securityConfig.headers).toHaveProperty('Permissions-Policy')
      expect(securityConfig.headers).toHaveProperty(
        'Cross-Origin-Resource-Policy'
      )
      // Security Engineer: Verify X-DNS-Prefetch-Control header is configured
      expect(securityConfig.headers).toHaveProperty('X-DNS-Prefetch-Control')
    })
  })

  describe('Dynamic CORS Origin Validation', () => {
    it('should reflect allowed request origin when provided', () => {
      const firstAllowedOrigin = securityConfig.cors.allowedOrigins[0]
      const headers = getSecurityHeaders(undefined, firstAllowedOrigin)
      expect(headers['Access-Control-Allow-Origin']).toBe(firstAllowedOrigin)
    })

    it('should reject unauthorized origins (CORS bypass prevention - CWE-942)', () => {
      const headers = getSecurityHeaders(
        undefined,
        'https://malicious-site.com'
      )
      expect(headers['Access-Control-Allow-Origin']).toBe('')
    })

    it('should perform case-insensitive origin matching', () => {
      const firstAllowedOrigin = securityConfig.cors.allowedOrigins[0]
      const upperCaseOrigin = firstAllowedOrigin?.toUpperCase()
      const headers = getSecurityHeaders(undefined, upperCaseOrigin)
      expect(headers['Access-Control-Allow-Origin']).toBe(firstAllowedOrigin)
    })

    it('should maintain backward compatibility when no request origin provided', () => {
      const headers = getSecurityHeaders()
      expect(headers['Access-Control-Allow-Origin']).toBe(
        securityConfig.cors.allowedOrigins[0]
      )
    })

    it('should handle undefined request origin', () => {
      const headers = getSecurityHeaders(undefined, undefined)
      expect(headers['Access-Control-Allow-Origin']).toBe(
        securityConfig.cors.allowedOrigins[0]
      )
    })

    it('should trim whitespace from request origin', () => {
      const firstAllowedOrigin = securityConfig.cors.allowedOrigins[0]
      const paddedOrigin = `  ${firstAllowedOrigin}  `
      const headers = getSecurityHeaders(undefined, paddedOrigin)
      expect(headers['Access-Control-Allow-Origin']).toBe(firstAllowedOrigin)
    })
  })
})
