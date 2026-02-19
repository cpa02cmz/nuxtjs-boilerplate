import { defineEventHandler } from 'h3'
import type { Resource } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { handleApiRouteError } from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { timeConfig, toSeconds } from '~/configs/time.config'

/**
 * GET /api/resources.json
 *
 * Returns all resources in JSON format
 * This endpoint is used for prefetching data on the client side
 * Performance: Cached for 5 minutes to reduce repeated file I/O and JSON parsing
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event, 'resources-export')

    // Check cache first
    const cacheKey = 'resources:json:export'
    const cachedResult = await cacheManager.get<{
      success: boolean
      data: Resource[]
      total: number
    }>(cacheKey)

    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const response = {
      success: true,
      data: resources,
      total: resources.length,
    }

    // Cache for 5 minutes - resources data doesn't change frequently
    await cacheSetWithTags(
      cacheKey,
      response,
      toSeconds(timeConfig.cache.short),
      generateCacheTags(cacheTagsConfig.resources.all)
    )

    event.node.res?.setHeader('X-Cache', 'MISS')
    return response
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
