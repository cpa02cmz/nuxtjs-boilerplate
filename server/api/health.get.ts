import { createApiRoute } from '~/server/utils/create-api-route'

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers
 * Uses standardized API route wrapper for consistent error handling and logging
 */
export default createApiRoute(
  async event => {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      path: event.path,
    }

    return healthStatus
  },
  {
    logContext: 'api-health',
    logMetadata: {
      endpoint: '/api/health',
      description: 'Health check endpoint for monitoring and load balancers',
    },
  }
)
