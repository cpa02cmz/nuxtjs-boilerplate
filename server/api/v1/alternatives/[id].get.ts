import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { limitsConfig } from '~/configs/limits.config'
import { cacheConfig } from '~/configs/cache.config'
import { defineEventHandler, getRouterParam } from 'h3'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { contentConfig } from '~/configs/content.config'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    const resourceId = getRouterParam(event, 'id')

    if (!resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    // Generate cache key
    const cacheKey = `alternatives:${resourceId}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON (following the same pattern as other API endpoints)
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const resourceMap = new Map<string, Resource>()
    for (const r of resources) {
      resourceMap.set(r.id, r)
    }

    const resource = resourceMap.get(resourceId)

    if (!resource) {
      return sendNotFoundError(event, 'Resource', resourceId)
    }

    // Get alternative resources based on alternatives field and similarity
    let alternatives: Resource[] = []

    if (resource.alternatives && Array.isArray(resource.alternatives)) {
      alternatives = resource.alternatives
        .map(altId => resourceMap.get(altId))
        .filter((r): r is Resource => !!r)
    } else {
      // If no explicit alternatives, find similar resources based on category, tags, and technology
      const resourceCategory = resource.category
      const resourceTags = resource.tags || []
      const resourceTech = resource.technology || []

      // Performance optimization: Use Set for O(1) lookups instead of Array.includes O(n)
      const resourceTagsSet = new Set(resourceTags)
      const resourceTechSet = new Set(resourceTech)

      alternatives = resources
        .filter(
          r =>
            r.id !== resourceId &&
            (r.category === resourceCategory ||
              r.tags?.some((tag: string) => resourceTagsSet.has(tag)) ||
              r.technology?.some((tech: string) => resourceTechSet.has(tech)))
        )
        .slice(0, limitsConfig.suggestions.maxAlternatives) // Use config instead of hardcoded
    }

    const response = {
      success: true,
      data: {
        resourceId,
        alternatives,
        count: alternatives.length,
      },
    }

    // Cache result
    await cacheSetWithTags(
      cacheKey,
      response,
      cacheConfig.server.defaultTtlMs / 1000,
      generateCacheTags(
        cacheTagsConfig.resources.alternatives(resourceId),
        resourceId
      )
    )

    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    return response
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching alternatives for resource ${getRouterParam(event, 'id')}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-alternatives',
      {
        resourceId: getRouterParam(event, 'id'),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      }
    )

    return handleApiRouteError(event, error)
  }
})
