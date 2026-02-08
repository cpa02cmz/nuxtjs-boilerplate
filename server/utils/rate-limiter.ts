import prisma from './db'
import { logger } from '~/utils/logger'

export interface RateLimitResult {
  allowed: boolean
  remainingRequests: number
  resetTime: number
  currentCount: number
}

/**
 * Check rate limit for a given key (IP address or user ID)
 * Uses a dedicated RateLimit table for efficient lookups
 *
 * Performance improvements over AnalyticsEvent approach:
 * - Dedicated table with minimal columns
 * - Composite index on (key, window) for O(1) lookups
 * - No joins or complex queries
 * - Automatic cleanup of old records
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  try {
    const now = new Date()
    const windowStart = new Date(
      now.getTime() - (now.getTime() % (windowSeconds * 1000))
    )
    const resetTime = windowStart.getTime() + windowSeconds * 1000

    // Use upsert to atomically increment or create the rate limit record
    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        key_window: {
          key,
          window: windowStart,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        key,
        window: windowStart,
        count: 1,
      },
    })

    const currentCount = rateLimit.count
    const allowed = currentCount <= maxRequests
    const remainingRequests = Math.max(0, maxRequests - currentCount)

    return {
      allowed,
      remainingRequests,
      resetTime,
      currentCount,
    }
  } catch (error) {
    logger.error('Rate limit check error:', error)
    // Fail open - allow the request if there's an error
    return {
      allowed: true,
      remainingRequests: maxRequests,
      resetTime: Date.now() + windowSeconds * 1000,
      currentCount: 0,
    }
  }
}

/**
 * Get current rate limit statistics without incrementing
 */
export async function getRateLimitStats(
  key: string,
  windowSeconds: number = 60
): Promise<{
  currentCount: number
  windowStart: number
  windowEnd: number
}> {
  try {
    const now = new Date()
    const windowStart = new Date(
      now.getTime() - (now.getTime() % (windowSeconds * 1000))
    )

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        key_window: {
          key,
          window: windowStart,
        },
      },
    })

    return {
      currentCount: rateLimit?.count ?? 0,
      windowStart: windowStart.getTime(),
      windowEnd: windowStart.getTime() + windowSeconds * 1000,
    }
  } catch (error) {
    logger.error('Rate limit stats error:', error)
    return {
      currentCount: 0,
      windowStart: Date.now() - windowSeconds * 1000,
      windowEnd: Date.now(),
    }
  }
}

/**
 * Record a rate limited event for monitoring
 */
export async function recordRateLimitedEvent(
  key: string,
  endpoint: string
): Promise<void> {
  try {
    logger.warn(`Rate limit triggered: Key=${key}, Endpoint=${endpoint}`)
  } catch (error) {
    logger.error('Error recording rate limited event:', error)
  }
}

/**
 * Clean up old rate limit records
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupOldRateLimits(
  maxAgeHours: number = 24
): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000)

    const result = await prisma.rateLimit.deleteMany({
      where: {
        window: {
          lt: cutoff,
        },
      },
    })

    logger.info(`Cleaned up ${result.count} old rate limit records`)
    return result.count
  } catch (error) {
    logger.error('Error cleaning up old rate limits:', error)
    return 0
  }
}
