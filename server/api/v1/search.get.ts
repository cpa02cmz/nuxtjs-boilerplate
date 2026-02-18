import { defineEventHandler, getQuery } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  filterResourcesByHierarchicalTags,
  convertResourcesToHierarchicalTags,
} from '~/utils/tags'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { cacheConfig } from '~/configs/cache.config'
import { contentConfig } from '~/configs/content.config'
import { searchQuerySchemaV1 } from '~/server/utils/validation-schemas'
import { validateQueryParams } from '~/server/utils/validation-utils'

/**
 * Generate cache key with sorted query parameters for consistent ordering
 * Issue #3307 fix - Cache key collision due to unsorted query parameters
 */
const generateCacheKey = (query: Record<string, unknown>): string => {
  const sortedQuery = Object.keys(query)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = query[key]
        return acc
      },
      {} as Record<string, unknown>
    )

  return `search:${JSON.stringify(sortedQuery)}`
}

/**
 * GET /api/v1/search
 *
 * Search resources with advanced filtering options
 *
 * Query parameters:
 * - q: Search query term
 * - limit: Number of resources to return (default: 20, max: 100)
 * - offset: Number of resources to skip (default: 0)
 * - category: Filter by category
 * - pricing: Filter by pricing model
 * - difficulty: Filter by difficulty level
 * - tags: Filter by tags (comma-separated)
 * - hierarchicalTags: Filter by hierarchical tags (comma-separated)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search endpoint (which is more restrictive)
    await rateLimit(event)

    // Validate query parameters using Zod schema
    const validatedQuery = validateQueryParams(searchQuerySchemaV1, event)

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = generateCacheKey(query)

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      // Cached result contains raw data { data: ..., pagination: ... }
      // sendSuccessResponse will wrap it with { success: true, data: ... }
      return sendSuccessResponse(event, cachedResult)
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Extract validated parameters
    const limit = validatedQuery.limit
    const offset = validatedQuery.offset
    const searchQuery = validatedQuery.q ?? validatedQuery.query
    const category = validatedQuery.category
    const pricing = validatedQuery.pricing
    const difficulty = validatedQuery.difficulty
    const tagsParam = validatedQuery.tags
    const hierarchicalTagsParam = validatedQuery.hierarchicalTags

    // Pre-process filter values for single-pass filtering
    const categoryLower = category?.toLowerCase()
    const pricingLower = pricing?.toLowerCase()
    const difficultyLower = difficulty?.toLowerCase()

    // Parse tags into Set for efficient lookup
    const tagsSet = tagsParam
      ? new Set(tagsParam.split(',').map(tag => tag.trim().toLowerCase()))
      : undefined

    // Parse hierarchical tags
    const hierarchicalTagIds = hierarchicalTagsParam
      ? hierarchicalTagsParam.split(',').map(tagId => tagId.trim())
      : undefined

    // Prepare search term
    const searchTerm = searchQuery?.toLowerCase()

    // Combine category, pricing, difficulty, and flat tags into single-pass filter
    // This reduces from 4 iterations to 1 iteration
    const basicFiltersActive =
      categoryLower || pricingLower || difficultyLower || tagsSet !== undefined

    if (basicFiltersActive) {
      resources = resources.filter(resource => {
        // Category filter
        if (
          categoryLower &&
          resource.category.toLowerCase() !== categoryLower
        ) {
          return false
        }

        // Pricing filter
        if (
          pricingLower &&
          resource.pricingModel.toLowerCase() !== pricingLower
        ) {
          return false
        }

        // Difficulty filter
        if (
          difficultyLower &&
          resource.difficulty.toLowerCase() !== difficultyLower
        ) {
          return false
        }

        // Tags filter - use Set for O(1) lookup
        if (tagsSet !== undefined) {
          const hasMatchingTag = resource.tags.some(tag =>
            tagsSet!.has(tag.toLowerCase())
          )
          if (!hasMatchingTag) {
            return false
          }
        }

        return true
      })
    }

    // Apply hierarchical tags filter if provided
    if (hierarchicalTagIds !== undefined) {
      resources = filterResourcesByHierarchicalTags(
        resources,
        hierarchicalTagIds
      )
    }

    // Apply search query filter if provided (last to minimize string matching)
    if (searchTerm !== undefined) {
      resources = resources.filter(
        resource =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply pagination BEFORE hierarchical tag conversion for performance
    // This reduces O(n) conversion to O(k) where k is page size (k << n)
    const total = resources.length
    const paginatedResources = resources.slice(offset, offset + limit)

    // Convert resources to include hierarchical tags
    // Only convert the paginated resources, not all filtered resources
    const resourcesWithHierarchicalTags =
      convertResourcesToHierarchicalTags(paginatedResources)

    // Prepare response data (without wrapper - sendSuccessResponse adds it)
    const responseData = {
      data: resourcesWithHierarchicalTags,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    }

    // Cache the result with tags for easier invalidation
    // Use shorter TTL for search results since they change more frequently
    // Cache only the raw response data (without wrapper) - sendSuccessResponse adds the wrapper
    await cacheSetWithTags(
      cacheKey,
      responseData,
      cacheConfig.server.defaultTtlMs / 1000,
      generateCacheTags(
        cacheTagsConfig.search.results,
        cacheTagsConfig.resources.list
      )
    )

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response (sendSuccessResponse adds the wrapper)
    return sendSuccessResponse(event, responseData)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error searching resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-search',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    return handleApiRouteError(event, error)
  }
})
