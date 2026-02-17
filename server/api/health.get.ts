import { defineEventHandler } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 60 requests per minute for health checks
    // Higher limit to accommodate load balancers and monitoring tools
    await rateLimit(event)

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    }

    return sendSuccessResponse(event, healthStatus)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
