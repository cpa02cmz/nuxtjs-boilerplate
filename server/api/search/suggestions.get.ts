import type { Resource } from '~/types/resource'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { cacheConfig } from '~/configs/cache.config'
import { contentConfig } from '~/configs/content.config'
import { suggestionsQuerySchema } from '~/server/utils/validation-schemas'
import { validateQueryParams } from '~/server/utils/validation-utils'

/**
 * GET /api/search/suggestions
 *
 * Generate search suggestions based on query
 *
 * Query parameters:
 * - q: Search query term
 * - limit: Number of suggestions to return (default: 5, max: 10)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search suggestions endpoint
    await rateLimit(event)

    // Validate query parameters using Zod schema
    const validatedQuery = validateQueryParams(suggestionsQuerySchema, event)

    // Extract validated parameters
    const searchQuery = validatedQuery.q
    const limit = validatedQuery.limit

    // Generate cache key based on query parameters
    const cacheKey = `suggestions:${searchQuery}:${limit}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return sendSuccessResponse(event, cachedResult)
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Import the suggestions composable
    // SECURITY: Using relative path instead of ~ alias - Nitro doesn't resolve ~ in server context
    const { useSearchSuggestions } =
      await import('../../../composables/useSearchSuggestions')

    // Create suggestions engine
    const { getSearchSuggestions } = useSearchSuggestions(resources)

    // Generate suggestions
    const suggestions = getSearchSuggestions(searchQuery, limit)

    // Cache result with tags for easier invalidation
    // Use shorter TTL for suggestions since they change more frequently
    const responseData = {
      data: suggestions,
      query: searchQuery,
      limit: limit,
      timestamp: new Date().toISOString(),
    }
    // Flexy hates hardcoded values! Using configurable cache TTL.
    await cacheSetWithTags(
      cacheKey,
      responseData,
      cacheConfig.searchSuggestions.ttlSeconds,
      ['search', 'suggestions', 'api']
    )

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Return standardized success response
    return sendSuccessResponse(event, {
      data: suggestions,
      query: searchQuery,
      limit: limit,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
