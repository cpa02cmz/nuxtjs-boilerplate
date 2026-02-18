import { defineNitroPlugin } from 'nitropack/runtime'
import type { H3Event } from 'h3'
import { randomBytes } from 'node:crypto'
import { getSecurityHeaders } from '../utils/security-config'
import { logger } from '~/utils/logger'
import { timeConfig } from '~/configs/time.config'
import { securityConfig } from '~/configs/security.config'
import {
  isApiRoute,
  isStaticBuildPath,
  isCacheablePage,
} from '~/configs/routes.config'

// Comprehensive security headers plugin
export default defineNitroPlugin(nitroApp => {
  // Apply security headers for all requests in all environments
  // Security should be enabled in all environments, including test
  // Skip if this is an HTML response that will be handled by the HTML security plugin
  nitroApp.hooks.hook('afterResponse', (response, context) => {
    try {
      // Check if response object is available
      const event = (context as { event?: H3Event }).event
      if (!event || !event.node || !event.node.res) {
        return
      }

      // Security headers are now enabled in test environment for proper security testing
      // This ensures security vulnerabilities are caught during automated testing

      // Check if this is an HTML response - if so, the HTML security plugin will handle it
      // to avoid duplication of security headers
      const contentType = event.node.res.getHeader('content-type') || ''
      if (
        typeof contentType === 'string' &&
        contentType.includes('text/html')
      ) {
        // HTML responses are handled by the html-security.ts plugin
        return
      }

      // Enable CSP nonce in all environments for consistent security headers
      // This provides better security in development and production
      const nonce = randomBytes(securityConfig.crypto.nonceLength).toString(
        'base64'
      )

      // Get security headers with nonce (nonce only in production)
      const securityHeaders = getSecurityHeaders(nonce)

      // Set all security headers
      if (event.node.res.setHeader) {
        Object.entries(securityHeaders).forEach(([headerName, headerValue]) => {
          event.node.res.setHeader(headerName, headerValue)
        })
      }

      // Apply cache control headers based on route patterns
      const path = event.path || ''

      // For API routes, set appropriate cache control
      // Flexy hates hardcoded paths! Using isApiRoute helper
      if (isApiRoute(path)) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            `max-age=${timeConfig.cache.maxAge.api}, public, s-maxage=${timeConfig.cache.maxAge.api}`
          )
        }
      }
      // For static assets in _nuxt, set long cache control
      // Flexy hates hardcoded paths! Using isStaticBuildPath helper
      else if (isStaticBuildPath(path)) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            `max-age=${timeConfig.cache.maxAge.static}, immutable`
          )
        }
      }
      // For main routes, set moderate cache control
      // Flexy hates hardcoded paths! Using isCacheablePage helper
      else if (isCacheablePage(path)) {
        if (
          event.node.res.setHeader &&
          (!event.node.res.hasHeader ||
            !event.node.res.getHeader('cache-control'))
        ) {
          event.node.res.setHeader(
            'cache-control',
            `max-age=${timeConfig.cache.maxAge.page}, s-maxage=${timeConfig.cache.maxAge.page}, public`
          )
        }
      }
    } catch (error) {
      // Log errors in any environment but don't expose detailed errors in production
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Failed to set security headers in afterResponse:', error)
      } else {
        logger.error('Security header setting failed')
      }
    }
  })
})
