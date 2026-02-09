import { getRequestIP, setResponseHeader, createError } from 'h3'
import { getRateLimitTier } from '~/configs/rate-limit.config'

// Advanced in-memory rate limiter with different limits for different endpoints
// In production, you'd want to use a more robust solution like Redis

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

// FIXED: Add periodic cleanup to prevent memory leak
// Cleanup runs every 5 minutes to remove expired entries
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Clean up expired rate limit entries to prevent memory leaks
 * Removes entries where resetTime has passed
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(k => {
    const entry = rateLimitStore[k]
    if (entry && entry.resetTime < now) {
      delete rateLimitStore[k]
    }
  })
}

// Start periodic cleanup to prevent unbounded memory growth
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanupInterval(): void {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS)
    // Prevent the interval from keeping the process alive
    cleanupInterval.unref?.()
  }
}

// Initialize cleanup on module load
startCleanupInterval()

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
    const entry = rateLimitStore[k]
    if (entry && entry.resetTime < windowStart) {
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

  const remaining = rateLimitConfig.maxRequests - rateLimitStore[key].count
  const resetTime = rateLimitStore[key].resetTime

  // Set rate limit headers
  setResponseHeader(
    event,
    'X-RateLimit-Limit',
    rateLimitConfig.maxRequests.toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Remaining',
    Math.max(0, remaining).toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Reset',
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
