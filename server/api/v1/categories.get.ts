import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager } from '../../utils/cache'
import { performanceMonitor } from '../../utils/performance-monitoring'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
export default defineEventHandler(async event => {
  const startTime = Date.now()

  try {
    // Try to get from cache first
    const cacheKey = 'categories:all'
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')

      // Record performance metrics
      const responseTime = Date.now() - startTime
      performanceMonitor.recordMetrics({
        endpoint: event.path || '/api/v1/categories',
        method: 'GET',
        responseTime,
        cacheHit: true,
        cacheType: event.node.res?.getHeader('X-Cache-Type') as
          | string
          | undefined,
        statusCode: 200,
        timestamp: Date.now(),
        userAgent: event.node.req.headers['user-agent'],
        clientIP:
          (event.node.req.headers['x-forwarded-for'] as string) ||
          (event.node.req.connection.remoteAddress as string),
      })

      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Get unique categories with counts
    const categoryMap = new Map<string, number>()

    resources.forEach(resource => {
      const count = categoryMap.get(resource.category) || 0
      categoryMap.set(resource.category, count + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      })
    )

    // Prepare response
    const response = {
      success: true,
      data: categories,
    }

    // Cache the result for 1 hour (3600 seconds) since categories don't change often
    await cacheManager.set(cacheKey, response, 3600)

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')

    // Record performance metrics
    const responseTime = Date.now() - startTime
    performanceMonitor.recordMetrics({
      endpoint: event.path || '/api/v1/categories',
      method: 'GET',
      responseTime,
      cacheHit: false, // This was a cache miss
      cacheType: event.node.res?.getHeader('X-Cache-Type') as
        | string
        | undefined,
      statusCode: 200,
      timestamp: Date.now(),
      userAgent: event.node.req.headers['user-agent'],
      clientIP:
        (event.node.req.headers['x-forwarded-for'] as string) ||
        (event.node.req.connection.remoteAddress as string),
    })

    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-categories'
    )

    // Record performance metrics for error
    const responseTime = Date.now() - startTime
    performanceMonitor.recordMetrics({
      endpoint: event.path || '/api/v1/categories',
      method: 'GET',
      responseTime,
      cacheHit: false,
      statusCode: 500,
      timestamp: Date.now(),
      userAgent: event.node.req.headers['user-agent'],
      clientIP:
        (event.node.req.headers['x-forwarded-for'] as string) ||
        (event.node.req.connection.remoteAddress as string),
    })

    return {
      success: false,
      message: 'An error occurred while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
