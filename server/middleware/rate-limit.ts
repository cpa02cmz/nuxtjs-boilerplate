import { getRequestIP, setResponseHeader, createError } from 'h3'
import { RATE_LIMIT_CONFIG } from '../../configs/rate-limit.config'

// Advanced in-memory rate limiter with different limits for different endpoints
// In production, you'd want to use a more robust solution like Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Define rate limit tiers for different API endpoints
interface RateLimitConfig {
  windowMs: number // Window size in milliseconds
  maxRequests: number // Max requests per window
  message: string // Error message when limit exceeded
}

// Map endpoint patterns to rate limit tiers
function getRateLimitTier(path: string): RateLimitConfig {
  if (path.includes('/api/v1/search') || path.includes('/api/v1/search')) {
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.search,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.search,
      message: RATE_LIMIT_CONFIG.messages.search,
    }
  } else if (path.includes('/api/v1/export')) {
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.export,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.export,
      message: RATE_LIMIT_CONFIG.messages.export,
    }
  } else if (path.includes('/api/v1/webhooks')) {
    // Webhook endpoints have specific rate limits
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.webhook,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.webhook,
      message: RATE_LIMIT_CONFIG.messages.webhook,
    }
  } else if (path.includes('/api/v1/auth/api-keys')) {
    // API key management endpoints have specific rate limits
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.apiKey,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.apiKey,
      message: RATE_LIMIT_CONFIG.messages.apiKey,
    }
  } else if (
    path.includes('/api/v1/resources') ||
    path.includes('/api/categories')
  ) {
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.heavy,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.heavy,
      message: RATE_LIMIT_CONFIG.messages.heavy,
    }
  } else {
    return {
      windowMs: RATE_LIMIT_CONFIG.windows.general,
      maxRequests: RATE_LIMIT_CONFIG.maxRequests.general,
      message: RATE_LIMIT_CONFIG.messages.general,
    }
  }
}

const rateLimitStore: RateLimitStore = {}

export default defineEventHandler(event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Get rate limit configuration for this endpoint
  const rateLimitConfig = getRateLimitTier(event.path)

  // Get client IP for rate limiting
  const clientIP = getRequestIP(event) || 'unknown'
  const key = `${clientIP}:${event.path}`

  const now = Date.now()
  const windowStart = now - rateLimitConfig.windowMs

  // Clean up old entries
  Object.keys(rateLimitStore).forEach(k => {
    if (rateLimitStore[k].resetTime < windowStart) {
      delete rateLimitStore[k]
    }
  })

  // Check if this is a new request or existing
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < windowStart) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
    }
  } else {
    rateLimitStore[key].count++
  }

  const storeEntry = rateLimitStore[key]!
  const remaining = rateLimitConfig.maxRequests - storeEntry.count
  const resetTime = storeEntry.resetTime

  // Set rate limit headers using config
  setResponseHeader(
    event,
    RATE_LIMIT_CONFIG.headers.limit,
    rateLimitConfig.maxRequests.toString()
  )
  setResponseHeader(
    event,
    RATE_LIMIT_CONFIG.headers.remaining,
    Math.max(0, remaining).toString()
  )
  setResponseHeader(
    event,
    RATE_LIMIT_CONFIG.headers.reset,
    Math.floor(resetTime / 1000).toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Window',
    Math.floor(rateLimitConfig.windowMs / 1000).toString()
  )

  // Check if rate limit exceeded
  if (rateLimitStore[key].count > rateLimitConfig.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: rateLimitConfig.message,
    })
  }
})
