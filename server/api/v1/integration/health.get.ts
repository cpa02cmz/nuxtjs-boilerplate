import { defineEventHandler, getHeader, type H3Event } from 'h3'
import {
  getAllCircuitBreakerStats,
  type CircuitBreakerStats,
} from '~/server/utils/circuit-breaker'
import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { deadLetterManager } from '~/server/utils/webhook-dead-letter'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
  sendForbiddenError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'

interface IntegrationHealthReport {
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    totalCircuitBreakers: number
    openCircuitBreakers: number
    totalWebhooksQueued: number
    totalDeadLetterWebhooks: number
  }
  circuitBreakers: Record<string, CircuitBreakerStats>
  webhooks: {
    queue: {
      pending: number
      nextScheduled: string | null
    }
    deadLetter: {
      count: number
      items: Array<{
        id: string
        webhookId: string
        event: string
        failureReason: string
        createdAt: string
      }>
      metrics: {
        totalCount: number
        recentCount: number
        oldestItemAgeHours: number | null
        alertThresholdExceeded: boolean
        webhookStats: Record<string, number>
      }
    }
  }
}

/**
 * Required permission for accessing integration health
 */
const REQUIRED_PERMISSION = 'integration:read'

/**
 * Check if API key has required permission
 */
function hasRequiredPermission(apiKey: { permissions?: string[] }): boolean {
  if (!apiKey.permissions || apiKey.permissions.length === 0) {
    return false
  }

  return (
    apiKey.permissions.includes('admin') ||
    apiKey.permissions.includes(REQUIRED_PERMISSION)
  )
}

/**
 * Log access attempt for audit purposes
 */
function logAccessAttempt(
  event: H3Event,
  success: boolean,
  reason?: string
): void {
  const apiKeyId = event.context.apiKey?.id ?? 'unknown'
  const clientIp =
    getHeader(event, 'X-Forwarded-For') ??
    getHeader(event, 'X-Real-IP') ??
    'unknown'

  if (success) {
    logger.info('Integration health endpoint accessed', {
      apiKeyId,
      clientIp,
      path: event.path,
      timestamp: new Date().toISOString(),
    })
  } else {
    logger.warn('Integration health endpoint access denied', {
      apiKeyId,
      clientIp,
      path: event.path,
      reason,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * GET /api/v1/integration/health
 *
 * Authenticated integration health monitoring endpoint
 * Requires API key with 'admin' or 'integration:read' permission
 *
 * Security: This endpoint exposes sensitive infrastructure information
 * and requires proper authentication and authorization.
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    // Check authentication - API key must be present
    if (!event.context.apiKey) {
      logAccessAttempt(event, false, 'Authentication required')
      return sendUnauthorizedError(
        event,
        'Authentication required. Provide valid API key in X-API-Key header.'
      )
    }

    // Check authorization - API key must have required permission
    if (!hasRequiredPermission(event.context.apiKey)) {
      logAccessAttempt(event, false, 'Insufficient permissions')
      return sendForbiddenError(
        event,
        `Access denied. Required permission: '${REQUIRED_PERMISSION}' or 'admin'`
      )
    }

    // Log successful access for audit
    logAccessAttempt(event, true)

    // Collect integration health data
    const circuitBreakerStats = getAllCircuitBreakerStats()
    const webhookQueueStats = await webhookQueueSystem.getQueueStats()
    const deadLetterQueue = await webhookStorage.getDeadLetterQueue()
    const deadLetterMetrics = await deadLetterManager.getMetrics()

    const openBreakers = Object.values(circuitBreakerStats).filter(
      stats => stats.state === 'open'
    )

    const halfOpenBreakers = Object.values(circuitBreakerStats).filter(
      stats => stats.state === 'half-open'
    )

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    if (openBreakers.length > 0) {
      overallStatus = 'unhealthy'
    } else if (halfOpenBreakers.length > 0 || deadLetterQueue.length > 0) {
      overallStatus = 'degraded'
    }

    const report: IntegrationHealthReport = {
      overall: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        totalCircuitBreakers: Object.keys(circuitBreakerStats).length,
        openCircuitBreakers: openBreakers.length,
        totalWebhooksQueued: webhookQueueStats.pending,
        totalDeadLetterWebhooks: deadLetterQueue.length,
      },
      circuitBreakers: circuitBreakerStats,
      webhooks: {
        queue: webhookQueueStats,
        deadLetter: {
          count: deadLetterQueue.length,
          items: deadLetterQueue.map(
            (dl: {
              id: string
              webhookId: string
              event: string
              failureReason: string
              lastAttemptAt: string
              createdAt: string
            }) => ({
              id: dl.id,
              webhookId: dl.webhookId,
              event: dl.event,
              failureReason: dl.failureReason,
              createdAt: dl.createdAt,
            })
          ),
          metrics: {
            totalCount: deadLetterMetrics.totalCount,
            recentCount: deadLetterMetrics.recentCount,
            oldestItemAgeHours: deadLetterMetrics.oldestItemAge,
            alertThresholdExceeded: deadLetterMetrics.alertThresholdExceeded,
            webhookStats: Object.fromEntries(deadLetterMetrics.webhookStats),
          },
        },
      },
    }

    return sendSuccessResponse(event, report)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
