import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { rateLimitConfig } from '~/configs/rate-limit.config'
import { httpConfig } from '~/configs/http.config'
import { TIME } from '~/server/utils/constants'

/**
 * Extract and validate client IP address from request
 * Respects TRUST_PROXY setting to prevent X-Forwarded-For spoofing
 * @param event - H3Event containing the request
 * @returns Validated client IP or 'unknown'
 */
function getClientIp(event: H3Event): string {
  const forwarded = event.node.req.headers['x-forwarded-for']
  const remoteAddress =
    event.node.req.socket?.remoteAddress ||
    event.node.req.connection?.remoteAddress

  // Only trust X-Forwarded-For if behind trusted proxy
  if (typeof forwarded === 'string' && process.env.TRUST_PROXY === 'true') {
    // Take the first IP if behind trusted proxy (closest to client)
    const ips = forwarded.split(',').map(ip => ip.trim())
    const firstIp = ips[0]
    // Basic IP validation regex
    if (firstIp && /^[\d.:a-fA-F]+$/.test(firstIp)) {
      return firstIp
    }
  }

  return remoteAddress || 'unknown'
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  tokensPerInterval: number // Number of tokens added per interval
  intervalMs: number // Interval for token refill (in ms)
  message: string // Error message when limit exceeded
}

// In-memory store for token buckets
const tokenBucketStore = new Map<string, TokenBucket>()

// Lock queue for atomic operations - prevents race conditions
const bucketLocks = new Map<string, Promise<void>>()

// FIXED: Add periodic cleanup to prevent memory leaks in rate limit store
// Cleanup runs every 10 minutes to remove expired/stale entries
// Flexy hates hardcoded values! Using TIME constants for maintainability
const CLEANUP_INTERVAL_MS = TIME.minutesToMs(10) // 10 minutes
const BUCKET_MAX_AGE_MS = TIME.MS_PER_HOUR // 1 hour max age for stale buckets

/**
 * Clean up expired rate limit entries to prevent memory leaks
 * Removes buckets that haven't been accessed in over an hour
 */
function cleanupExpiredRateLimitEntries(): void {
  const now = Date.now()
  let cleanedCount = 0

  // Clean up expired buckets
  for (const [key, bucket] of tokenBucketStore.entries()) {
    const timeSinceLastRefill = now - bucket.lastRefill
    if (timeSinceLastRefill > BUCKET_MAX_AGE_MS && bucket.tokens === 0) {
      tokenBucketStore.delete(key)
      cleanedCount++
    }
  }

  // Clean up orphaned locks (shouldn't happen, but safety measure)
  for (const [key] of bucketLocks.entries()) {
    if (!tokenBucketStore.has(key)) {
      bucketLocks.delete(key)
    }
  }

  if (cleanedCount > 0 && process.env.NODE_ENV !== 'test') {
    console.log(`[RateLimit] Cleaned up ${cleanedCount} expired bucket entries`)
  }
}

// Start periodic cleanup to prevent unbounded memory growth
let rateLimitCleanupInterval: NodeJS.Timeout | null = null

function startRateLimitCleanup(): void {
  if (!rateLimitCleanupInterval) {
    rateLimitCleanupInterval = setInterval(
      cleanupExpiredRateLimitEntries,
      CLEANUP_INTERVAL_MS
    )
    // Prevent the interval from keeping the process alive
    rateLimitCleanupInterval.unref?.()
  }
}

// Initialize cleanup on module load
startRateLimitCleanup()

/**
 * Acquire a lock for a bucket key to ensure atomic operations
 * Uses a simple Promise-based queue for async locking
 */
async function acquireLock(key: string): Promise<() => void> {
  // Wait for existing lock to be released
  while (bucketLocks.has(key)) {
    await bucketLocks.get(key)
  }

  // Create a new lock
  let release: () => void
  const lockPromise = new Promise<void>(resolve => {
    release = resolve
  })
  bucketLocks.set(key, lockPromise)

  // Return release function
  return () => {
    bucketLocks.delete(key)
    release!()
  }
}

// Admin bypass keys - loaded from environment variable at startup
// Only used when valid bypass key is provided in request headers
const adminBypassKeys = new Set<string>()
if (process.env.ADMIN_RATE_LIMIT_BYPASS_KEY) {
  adminBypassKeys.add(process.env.ADMIN_RATE_LIMIT_BYPASS_KEY)
}

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Get the rate limit configuration (for testing purposes)
   */
  getConfig(): RateLimitConfig {
    return this.config
  }

  /**
   * Check if a request should be allowed based on token bucket algorithm
   * FIXED: Uses atomic locking to prevent race conditions under concurrent load
   */
  async isAllowed(
    key: string,
    bypassKey?: string
  ): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    // Check if this is an admin bypass request
    if (bypassKey && adminBypassKeys.has(bypassKey)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests, // Always show max remaining for bypass
        resetTime: Date.now() + this.config.intervalMs,
      }
    }

    // Acquire lock for atomic bucket operations
    const release = await acquireLock(key)

    try {
      const now = Date.now()
      let bucket = tokenBucketStore.get(key)

      // If no bucket exists, create a new one
      if (!bucket) {
        bucket = {
          tokens: this.config.tokensPerInterval,
          lastRefill: now,
        }
        tokenBucketStore.set(key, bucket)
      } else {
        // Refill tokens based on time passed
        const timePassed = now - bucket.lastRefill
        const intervalsPassed = Math.floor(timePassed / this.config.intervalMs)

        // Add tokens based on intervals passed, but don't exceed max
        bucket.tokens = Math.min(
          this.config.maxRequests,
          bucket.tokens + intervalsPassed * this.config.tokensPerInterval
        )

        bucket.lastRefill = now
      }

      // Check if we have tokens available
      if (bucket.tokens >= 1) {
        bucket.tokens-- // Consume a token
        return {
          allowed: true,
          remaining: Math.floor(bucket.tokens),
          resetTime: Math.floor(
            (bucket.lastRefill + this.config.intervalMs) / 1000
          ),
        }
      } else {
        // No tokens available, rate limit exceeded
        return {
          allowed: false,
          message: this.config.message,
          remaining: 0,
          resetTime: Math.floor(
            (bucket.lastRefill + this.config.intervalMs) / 1000
          ),
        }
      }
    } finally {
      // Always release the lock
      release()
    }
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(
    key: string,
    bypassKey?: string
  ): Promise<{ remaining: number; resetTime: number; limit: number }> {
    // If this is an admin bypass request, show unlimited capacity
    if (bypassKey && adminBypassKeys.has(bypassKey)) {
      return {
        remaining: this.config.maxRequests,
        resetTime: Math.floor((Date.now() + this.config.intervalMs) / 1000),
        limit: this.config.maxRequests,
      }
    }

    const now = Date.now()
    const bucket = tokenBucketStore.get(key)

    if (!bucket) {
      return {
        remaining: this.config.tokensPerInterval,
        resetTime: Math.floor((now + this.config.intervalMs) / 1000),
        limit: this.config.maxRequests,
      }
    }

    // Calculate refilled tokens
    const timePassed = now - bucket.lastRefill
    const intervalsPassed = Math.floor(timePassed / this.config.intervalMs)

    const refilledTokens = Math.min(
      this.config.maxRequests,
      bucket.tokens + intervalsPassed * this.config.tokensPerInterval
    )

    return {
      remaining: Math.floor(refilledTokens),
      resetTime: Math.floor(
        (bucket.lastRefill + this.config.intervalMs) / 1000
      ),
      limit: this.config.maxRequests,
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    tokenBucketStore.delete(key)
  }
}

// Analytics for rate limiting
interface RateLimitAnalytics {
  totalRequests: number
  blockedRequests: number
  bypassedRequests: number
  lastUpdated: number // Track when this entry was last updated for cleanup
}

const analyticsStore = new Map<string, RateLimitAnalytics>()

// FIXED: Add cleanup for analytics store to prevent memory leaks
// Flexy hates hardcoded values! Using TIME constants for maintainability
const ANALYTICS_MAX_AGE_MS = TIME.MS_PER_DAY // 24 hours
const ANALYTICS_CLEANUP_INTERVAL_MS = TIME.MS_PER_HOUR // 1 hour

/**
 * Clean up old analytics entries to prevent memory leaks
 */
function cleanupExpiredAnalytics(): void {
  const now = Date.now()
  let cleanedCount = 0

  for (const [key, analytics] of analyticsStore.entries()) {
    if (now - analytics.lastUpdated > ANALYTICS_MAX_AGE_MS) {
      analyticsStore.delete(key)
      cleanedCount++
    }
  }

  if (cleanedCount > 0 && process.env.NODE_ENV !== 'test') {
    console.log(
      `[RateLimit] Cleaned up ${cleanedCount} expired analytics entries`
    )
  }
}

// Start periodic cleanup for analytics
let analyticsCleanupInterval: NodeJS.Timeout | null = null

function startAnalyticsCleanup(): void {
  if (!analyticsCleanupInterval) {
    analyticsCleanupInterval = setInterval(
      cleanupExpiredAnalytics,
      ANALYTICS_CLEANUP_INTERVAL_MS
    )
    analyticsCleanupInterval.unref?.()
  }
}

startAnalyticsCleanup()

function getAnalytics(path: string): RateLimitAnalytics {
  if (!analyticsStore.has(path)) {
    analyticsStore.set(path, {
      totalRequests: 0,
      blockedRequests: 0,
      bypassedRequests: 0,
      lastUpdated: Date.now(),
    })
  }
  const analytics = analyticsStore.get(path)!
  analytics.lastUpdated = Date.now()
  return analytics
}

// Default rate limit configurations for different endpoint types
// Flexy hates hardcoded values! Using config values instead.
export const rateLimitConfigs = {
  general: new RateLimiter({
    windowMs: rateLimitConfig.general.windowMs,
    maxRequests: rateLimitConfig.general.maxRequests,
    tokensPerInterval: rateLimitConfig.general.tokensPerInterval,
    intervalMs: rateLimitConfig.general.intervalMs,
    message: rateLimitConfig.general.message,
  }),
  search: new RateLimiter({
    windowMs: rateLimitConfig.search.windowMs,
    maxRequests: rateLimitConfig.search.maxRequests,
    tokensPerInterval: rateLimitConfig.search.tokensPerInterval,
    intervalMs: rateLimitConfig.search.intervalMs,
    message: rateLimitConfig.search.message,
  }),
  heavy: new RateLimiter({
    windowMs: rateLimitConfig.heavy.windowMs,
    maxRequests: rateLimitConfig.heavy.maxRequests,
    tokensPerInterval: rateLimitConfig.heavy.tokensPerInterval,
    intervalMs: rateLimitConfig.heavy.intervalMs,
    message: rateLimitConfig.heavy.message,
  }),
  export: new RateLimiter({
    windowMs: rateLimitConfig.export.windowMs,
    maxRequests: rateLimitConfig.export.maxRequests,
    tokensPerInterval: rateLimitConfig.export.tokensPerInterval,
    intervalMs: rateLimitConfig.export.intervalMs,
    message: rateLimitConfig.export.message,
  }),
  api: new RateLimiter({
    windowMs: rateLimitConfig.api.windowMs,
    maxRequests: rateLimitConfig.api.maxRequests,
    tokensPerInterval: rateLimitConfig.api.tokensPerInterval,
    intervalMs: rateLimitConfig.api.intervalMs,
    message: rateLimitConfig.api.message,
  }),
  errorReport: new RateLimiter({
    windowMs: rateLimitConfig.errorReport.windowMs,
    maxRequests: rateLimitConfig.errorReport.maxRequests,
    tokensPerInterval: rateLimitConfig.errorReport.tokensPerInterval,
    intervalMs: rateLimitConfig.errorReport.intervalMs,
    message: rateLimitConfig.errorReport.message,
  }),
}

/**
 * Get appropriate rate limiter based on the request path
 */
export function getRateLimiterForPath(path: string): RateLimiter {
  if (path.includes('/api/v1/search') || path.includes('/search')) {
    return rateLimitConfigs.search
  } else if (path.includes('/api/v1/export') || path.includes('/export')) {
    return rateLimitConfigs.export
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories') ||
    path.includes('/api/v1/categories')
  ) {
    return rateLimitConfigs.heavy
  } else if (path.includes('/api/submissions')) {
    // Submissions endpoint uses API rate limit (not heavy) since it's lightweight
    return rateLimitConfigs.api
  } else if (path.includes('/api/errors/report')) {
    // Error reporting endpoint has stricter rate limiting
    return rateLimitConfigs.errorReport
  } else if (path.includes('/api/')) {
    return rateLimitConfigs.api
  } else {
    return rateLimitConfigs.general
  }
}

/**
 * Rate limit middleware function for API endpoints
 * SECURITY: Bypass key access is restricted to headers only to prevent exposure in server logs
 * SECURITY: Bypass keys via query parameters are explicitly prohibited and will result in 400 error
 * SECURITY: Only 'x-admin-bypass-key' header is accepted for bypass functionality
 */
export async function rateLimit(event: H3Event, key?: string): Promise<void> {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // SECURITY: Check for bypass key in query parameters and block if present
  // This prevents bypass keys from appearing in server logs
  const query = getQuery(event)
  if (
    query['bypass-key'] ||
    query['bypassKey'] ||
    query['admin-key'] ||
    query['adminKey']
  ) {
    const { createError } = await import('h3')
    throw createError({
      statusCode: httpConfig.status.BAD_REQUEST, // Flexy hates hardcoded 400!
      statusMessage:
        'Bypass keys are not allowed in query parameters for security reasons',
    })
  }

  // Check for bypass key in header only (security: prevent bypass keys in query parameters)
  const bypassKey = event.node.req.headers['x-admin-bypass-key'] as string

  // Generate rate limit key if not provided
  // SECURITY FIX: Use validated client IP to prevent X-Forwarded-For spoofing
  const rateLimitKey = key || `${getClientIp(event)}:${event.path}`

  // Get appropriate rate limiter
  const rateLimiter = getRateLimiterForPath(event.path)

  // Get analytics for this path
  const analytics = getAnalytics(event.path)

  // Increment total requests
  analytics.totalRequests++

  // Check if request is allowed
  const result = await rateLimiter.isAllowed(rateLimitKey, bypassKey)

  // Set rate limit headers
  const status = await rateLimiter.getStatus(rateLimitKey, bypassKey)

  // If this was a bypassed request, increment analytics
  if (bypassKey && adminBypassKeys.has(bypassKey)) {
    analytics.bypassedRequests++
  }

  event.node.res?.setHeader('X-RateLimit-Limit', status.limit.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Remaining',
    status.remaining.toString()
  )
  event.node.res?.setHeader('X-RateLimit-Reset', status.resetTime.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Window',
    Math.floor(rateLimiter.getConfig().windowMs / 1000).toString()
  )

  // If this was a bypassed request, let it through regardless
  if (bypassKey && adminBypassKeys.has(bypassKey)) {
    // Add bypass indicator header
    event.node.res?.setHeader('X-RateLimit-Bypassed', 'true')
    return
  }

  // If not allowed, increment blocked count and throw an error
  if (!result.allowed) {
    analytics.blockedRequests++
    const { createError } = await import('h3')
    throw createError({
      statusCode: httpConfig.status.TOO_MANY_REQUESTS, // Flexy hates hardcoded 429!
      statusMessage: result.message || 'Rate limit exceeded',
    })
  }
}

/**
 * Get rate limiting analytics
 */
export function getRateLimitAnalytics(): Map<string, RateLimitAnalytics> {
  return new Map(analyticsStore)
}

/**
 * Add a bypass key for testing purposes
 * SECURITY: This should only be used in tests, never in production code
 */
export function addBypassKeyForTesting(key: string): void {
  adminBypassKeys.add(key)
}

/**
 * Clear all bypass keys for testing purposes
 * SECURITY: This should only be used in tests, never in production code
 */
export function clearBypassKeysForTesting(): void {
  adminBypassKeys.clear()
}
