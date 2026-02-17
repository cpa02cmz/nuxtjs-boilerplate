import { getRequestIP, setResponseHeader } from 'h3'
import { getRateLimitTier } from '~/configs/rate-limit.config'
import { sendRateLimitError } from '~/server/utils/api-response'
import { timeConfig } from '~/configs/time.config'
import { TIME } from '../utils/constants'

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
const CLEANUP_INTERVAL_MS = timeConfig.cleanup.rateLimitIntervalMs

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

/**
 * Stop the cleanup interval - used for testing and graceful shutdown
 * BugFixer: Issue #3465 - Cleanup interval leak fix
 */
export function stopCleanupInterval(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
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
  // BugFixer: Issue #3465 - Disable X-Forwarded-For to prevent IP spoofing
  const clientIP = getRequestIP(event, { xForwardedFor: false }) || 'unknown'
  const key = `${clientIP}:${event.path}`

  const now = Date.now()
  const windowStart = now - rateLimitConfig.windowMs

  // Clean up old entries - collect keys first to avoid race conditions
  const keysToDelete: string[] = []
  Object.keys(rateLimitStore).forEach(k => {
    const entry = rateLimitStore[k]
    if (entry && entry.resetTime < windowStart) {
      keysToDelete.push(k)
    }
  })
  // Delete after iteration to prevent race conditions
  keysToDelete.forEach(k => {
    delete rateLimitStore[k]
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
  // Flexy hates hardcoded 1000! Using TIME.MS_PER_SECOND
  setResponseHeader(
    event,
    'X-RateLimit-Reset',
    Math.floor(resetTime / TIME.MS_PER_SECOND).toString()
  )
  setResponseHeader(
    event,
    'X-RateLimit-Window',
    Math.floor(rateLimitConfig.windowMs / TIME.MS_PER_SECOND).toString()
  )

  // Check if rate limit exceeded
  if (rateLimitStore[key].count > rateLimitConfig.maxRequests) {
    // Use standardized rate limit error response
    const retryAfter = Math.ceil((resetTime - now) / TIME.MS_PER_SECOND)
    sendRateLimitError(event, retryAfter)
    return
  }
})
