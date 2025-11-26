import type { H3Event } from 'h3'
import { enhancedCacheManager } from './enhanced-cache'

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

// Enhanced rate limiter with Redis support
class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if a request should be allowed based on token bucket algorithm
   */
  async isAllowed(key: string): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    const now = Date.now()

    // Use enhanced cache for storing token buckets to support distributed systems
    const cacheKey = `rate_limit:${key}`
    let bucket = (await enhancedCacheManager.get(
      cacheKey
    )) as TokenBucket | null

    // If no bucket exists, create a new one
    if (!bucket) {
      bucket = {
        tokens: this.config.tokensPerInterval,
        lastRefill: now,
      }
      await enhancedCacheManager.set(
        cacheKey,
        bucket,
        Math.ceil(this.config.windowMs / 1000)
      )
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

      // Update the cache with the new bucket state
      await enhancedCacheManager.set(
        cacheKey,
        bucket,
        Math.ceil(this.config.windowMs / 1000)
      )
    }

    // Check if we have tokens available
    if (bucket.tokens > 0) {
      bucket.tokens-- // Consume a token
      // Update the cache with the new token count
      await enhancedCacheManager.set(
        cacheKey,
        bucket,
        Math.ceil(this.config.windowMs / 1000)
      )
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetTime:
          Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
      }
    } else {
      // No tokens available, rate limit exceeded
      return {
        allowed: false,
        message: this.config.message,
        remaining: 0,
        resetTime:
          Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
      }
    }
  }

  /**
   * Get current rate limit status for a key
   */
  async getStatus(
    key: string
  ): Promise<{ remaining: number; resetTime: number }> {
    const now = Date.now()
    const cacheKey = `rate_limit:${key}`
    let bucket = (await enhancedCacheManager.get(
      cacheKey
    )) as TokenBucket | null

    if (!bucket) {
      return {
        remaining: this.config.tokensPerInterval,
        resetTime: Math.floor(now + this.config.intervalMs) / 1000,
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
      resetTime: Math.floor(bucket.lastRefill + this.config.intervalMs) / 1000,
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<void> {
    const cacheKey = `rate_limit:${key}`
    await enhancedCacheManager.delete(cacheKey)
  }
}

// Enhanced rate limit configurations with user-based options
export const rateLimitConfigs = {
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    tokensPerInterval: 10, // 10 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many requests, please try again later.',
  }),
  search: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    tokensPerInterval: 5, // 5 tokens every interval
    intervalMs: 30 * 1000, // refill every 30 seconds
    message: 'Too many search requests, please slow down.',
  }),
  heavy: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 10,
    tokensPerInterval: 2, // 2 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many heavy computation requests, please slow down.',
  }),
  export: new RateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 5,
    tokensPerInterval: 1, // 1 token every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'Too many export requests, please slow down.',
  }),
  api: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 50,
    tokensPerInterval: 5, // 5 tokens every interval
    intervalMs: 60 * 1000, // refill every minute
    message: 'API rate limit exceeded. Please try again later.',
  }),
  user: new RateLimiter({
    // User-based rate limiting
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000, // Higher limit for authenticated users
    tokensPerInterval: 100,
    intervalMs: 60 * 1000,
    message: 'User rate limit exceeded. Please try again later.',
  }),
  admin: new RateLimiter({
    // Admin user rate limiting
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5000, // Much higher limit for admin users
    tokensPerInterval: 500,
    intervalMs: 60 * 1000,
    message: 'Admin rate limit exceeded. This should not happen.',
  }),
}

/**
 * Get appropriate rate limiter based on the request path and user context
 */
export function getRateLimiterForPath(
  path: string,
  userRole?: string
): RateLimiter {
  // If user is admin, use admin rate limiter
  if (userRole === 'admin') {
    return rateLimitConfigs.admin
  }
  // If user is authenticated, use user rate limiter
  else if (userRole && userRole !== 'guest') {
    return rateLimitConfigs.user
  }

  if (path.includes('/api/v1/search') || path.includes('/search')) {
    return rateLimitConfigs.search
  } else if (path.includes('/api/v1/export') || path.includes('/export')) {
    return rateLimitConfigs.export
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories') ||
    path.includes('/api/submissions')
  ) {
    return rateLimitConfigs.heavy
  } else if (path.includes('/api/')) {
    return rateLimitConfigs.api
  } else {
    return rateLimitConfigs.general
  }
}

/**
 * Extract user ID from request for user-based rate limiting
 */
function getUserIdFromRequest(event: H3Event): {
  userId?: string
  userRole?: string
} {
  // Extract user ID from authorization header, session, or other auth mechanism
  const authHeader = event.node.req.headers.authorization
  const userId = event.context.params?.userId || event.context.auth?.userId

  // This is a simplified example - in a real app, you'd have proper auth
  // For now, we'll check for a custom header that might indicate user role
  const userRole = (event.node.req.headers['x-user-role'] as string) || 'guest'

  // If there's a valid auth header, we could extract user info from it
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In a real implementation, you'd decode the JWT or session token here
    // For this example, we'll just return a placeholder
    return { userId: 'authenticated_user', userRole: userRole || 'user' }
  }

  return { userId: undefined, userRole: 'guest' }
}

/**
 * Rate limit middleware function for API endpoints with enhanced features
 */
export async function rateLimit(event: H3Event, key?: string): Promise<void> {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Extract user context for user-based rate limiting
  const { userId, userRole } = getUserIdFromRequest(event)

  // Generate rate limit key based on user context
  const baseKey =
    key ||
    `${event.node.req.headers['x-forwarded-for'] || event.node.req.connection.remoteAddress || 'unknown'}:${event.path}`

  // Use user-specific key if user is authenticated
  const rateLimitKey = userId ? `${userId}:${event.path}` : baseKey

  // Get appropriate rate limiter based on path and user role
  const rateLimiter = getRateLimiterForPath(event.path, userRole)

  // Check if request is allowed
  const result = await rateLimiter.isAllowed(rateLimitKey)

  // Set rate limit headers
  const status = await rateLimiter.getStatus(rateLimitKey)

  event.node.res?.setHeader(
    'X-RateLimit-Limit',
    rateLimiter['config'].maxRequests.toString()
  )
  event.node.res?.setHeader(
    'X-RateLimit-Remaining',
    status.remaining.toString()
  )
  event.node.res?.setHeader('X-RateLimit-Reset', status.resetTime.toString())
  event.node.res?.setHeader(
    'X-RateLimit-Window',
    Math.floor(rateLimiter['config'].windowMs / 1000).toString()
  )
  // Add user role info to headers if available
  if (userRole) {
    event.node.res?.setHeader('X-RateLimit-User-Role', userRole)
  }

  // If not allowed, throw an error
  if (!result.allowed) {
    const { createError } = await import('h3')
    throw createError({
      statusCode: 429,
      statusMessage: result.message || 'Rate limit exceeded',
    })
  }
}

/**
 * Sliding window rate limiter for more precise rate limiting
 */
export class SlidingWindowRateLimiter {
  private windowMs: number
  private maxRequests: number
  private message: string

  constructor(windowMs: number, maxRequests: number, message: string) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.message = message
  }

  async isAllowed(
    key: string
  ): Promise<{
    allowed: boolean
    resetTime?: number
    remaining?: number
    message?: string
  }> {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const cacheKey = `sliding_window:${key}`

    // Get request timestamps from cache
    let timestamps =
      ((await enhancedCacheManager.get(cacheKey)) as number[]) || []

    // Filter out timestamps outside the current window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart)

    // Check if we're under the limit
    if (timestamps.length < this.maxRequests) {
      // Add current timestamp and save back to cache
      timestamps.push(now)
      await enhancedCacheManager.set(
        cacheKey,
        timestamps,
        Math.ceil(this.windowMs / 1000)
      )

      return {
        allowed: true,
        remaining: this.maxRequests - timestamps.length,
        resetTime: Math.floor(windowStart + this.windowMs) / 1000,
      }
    } else {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.floor(windowStart + this.windowMs) / 1000,
        message: this.message,
      }
    }
  }
}
