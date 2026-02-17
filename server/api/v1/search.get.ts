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
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { paginationConfig } from '~/configs/pagination.config'
import { cacheConfig } from '~/configs/cache.config'
import { contentConfig } from '~/configs/content.config'

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

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = generateCacheKey(query)

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters with validation
    // Validate and parse limit parameter
    let limit = paginationConfig.search.defaultLimit // Use config instead of hardcoded
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, paginationConfig.search.maxLimit) // Use config instead of hardcoded
      } else {
        return sendBadRequestError(
          event,
          'Invalid limit parameter. Must be a positive integer.'
        )
      }
    }

    // Validate and parse offset parameter
    let offset = paginationConfig.defaults.offset // Use config instead of hardcoded
    if (query.offset !== undefined) {
      const parsedOffset = parseInt(query.offset as string)
      if (!isNaN(parsedOffset) && parsedOffset >= 0) {
        offset = parsedOffset
      } else {
        return sendBadRequestError(
          event,
          'Invalid offset parameter. Must be a non-negative integer.'
        )
      }
    }

    // Parse other parameters
    const searchQuery = query.q as string | undefined
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const tagsParam = query.tags as string | undefined
    const hierarchicalTagsParam = query.hierarchicalTags as string | undefined

    // Pre-process filter values for single-pass filtering
    const categoryLower = category?.toLowerCase()
    const pricingLower = pricing?.toLowerCase()
    const difficultyLower = difficulty?.toLowerCase()

    let tagsSet: Set<string> | undefined
    if (tagsParam) {
      if (typeof tagsParam !== 'string') {
        return sendBadRequestError(
          event,
          'Invalid tags parameter. Must be a comma-separated string.'
        )
      }
      tagsSet = new Set(
        tagsParam.split(',').map(tag => tag.trim().toLowerCase())
      )
    }

    let hierarchicalTagIds: string[] | undefined
    if (hierarchicalTagsParam) {
      if (typeof hierarchicalTagsParam !== 'string') {
        return sendBadRequestError(
          event,
          'Invalid hierarchicalTags parameter. Must be a comma-separated string.'
        )
      }
      hierarchicalTagIds = hierarchicalTagsParam
        .split(',')
        .map(tagId => tagId.trim())
    }

    let searchTerm: string | undefined
    if (searchQuery) {
      if (typeof searchQuery !== 'string') {
        return sendBadRequestError(
          event,
          'Invalid search query parameter. Must be a string.'
        )
      }
      searchTerm = searchQuery.toLowerCase()
    }

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

    // Prepare response
    const response = {
      success: true,
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
    await cacheSetWithTags(
      cacheKey,
      response,
      cacheConfig.server.defaultTtlMs / 1000,
      generateCacheTags(
        cacheTagsConfig.search.results,
        cacheTagsConfig.resources.list
      )
    )

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response
    return sendSuccessResponse(event, response)
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
