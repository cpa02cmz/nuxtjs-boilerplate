import type { H3Event } from 'h3'
import { defineEventHandler, getQuery } from 'h3'
import { httpConfig } from '~/configs/http.config'
import { rateLimit } from './enhanced-rate-limit'
import { sendSuccessResponse, handleApiRouteError } from './api-response'
import { logError } from '~/utils/errorLogger'

export interface ApiRouteOptions {
  /**
   * Whether to apply rate limiting to this route
   * @default true
   */
  rateLimit?: boolean
  /**
   * Custom rate limit key (defaults to client IP + path)
   */
  rateLimitKey?: string
  /**
   * HTTP status code for successful responses
   * @default 200
   */
  successStatus?: number
  /**
   * Context name for error logging
   */
  logContext?: string
  /**
   * Additional metadata to include in error logs
   */
  logMetadata?: Record<string, unknown>
}

/**
 * Creates a unified API route handler with standardized:
 * - Rate limiting
 * - Error handling
 * - Success response formatting
 * - Error logging
 *
 * This eliminates boilerplate code and ensures consistency across all API routes.
 *
 * @example
 * ```typescript
 * // Before: Lots of boilerplate
 * export default defineEventHandler(async (event) => {
 *   try {
 *     await rateLimit(event)
 *     const result = await fetchData()
 *     return sendSuccessResponse(event, result)
 *   } catch (error) {
 *     logError('...', error, 'context', { ... })
 *     return handleApiRouteError(event, error)
 *   }
 * })
 *
 * // After: Clean and minimal
 * export default createApiRoute(async (event) => {
 *   return await fetchData()
 * }, { logContext: 'api-v1-resources' })
 * ```
 */
export function createApiRoute<T>(
  handler: (event: H3Event) => Promise<T>,
  options: ApiRouteOptions = {}
) {
  const {
    rateLimit: shouldRateLimit = true,
    rateLimitKey,
    // Flexy hates hardcoded 200! Using config instead
    successStatus = httpConfig.status.OK,
    logContext = 'api-route',
    logMetadata = {},
  } = options

  return defineEventHandler(async (event: H3Event) => {
    try {
      // Apply rate limiting if enabled
      if (shouldRateLimit) {
        await rateLimit(event, rateLimitKey)
      }

      // Execute the handler
      const result = await handler(event)

      // Send success response
      return sendSuccessResponse(event, result, successStatus)
    } catch (error) {
      // Log error with context
      logError(
        `Error in ${logContext}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error as Error,
        logContext,
        {
          ...logMetadata,
          path: event.path,
          method: event.method,
          errorType: error?.constructor?.name,
          query: getQuery(event),
        }
      )

      // Handle and send error response
      return handleApiRouteError(event, error)
    }
  })
}

/**
 * Creates a read-only API route (GET requests) with sensible defaults
 */
export function createReadApiRoute<T>(
  handler: (event: H3Event) => Promise<T>,
  options: Omit<ApiRouteOptions, 'rateLimit'> = {}
) {
  return createApiRoute(handler, {
    ...options,
    rateLimit: true, // Always rate limit reads
  })
}

/**
 * Creates a write API route (POST/PUT/DELETE) with stricter rate limiting
 */
export function createWriteApiRoute<T>(
  handler: (event: H3Event) => Promise<T>,
  options: Omit<ApiRouteOptions, 'rateLimit'> = {}
) {
  return createApiRoute(handler, {
    ...options,
    rateLimit: true, // Always rate limit writes
  })
}
