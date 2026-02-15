import { defineEventHandler } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'

/**
 * GET /api/integration-health
 *
 * DEPRECATED: This endpoint is deprecated and will be removed in a future version.
 * Please use GET /api/v1/integration/health with proper authentication.
 *
 * This endpoint now returns minimal public health information only.
 * For detailed integration health data, use the authenticated v1 endpoint.
 *
 * @deprecated Use /api/v1/integration/health with API key authentication
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Log deprecation warning
    logger.warn('Deprecated endpoint accessed: /api/integration-health', {
      path: event.path,
      timestamp: new Date().toISOString(),
      userAgent: event.node.req.headers['user-agent'],
    })

    // Return minimal public health data only
    // Detailed integration data is now available at /api/v1/integration/health
    const publicHealthStatus = {
      status: 'deprecated',
      message:
        'This endpoint is deprecated. Please use /api/v1/integration/health with API key authentication.',
      timestamp: new Date().toISOString(),
      migration_guide: {
        new_endpoint: '/api/v1/integration/health',
        authentication:
          'Required - X-API-Key header with integration:read permission',
        documentation: '/api/api-docs',
      },
    }

    return sendSuccessResponse(event, publicHealthStatus)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
