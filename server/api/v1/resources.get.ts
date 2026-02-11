import { defineEventHandler, getQuery } from 'h3'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { paginationConfig } from '~/configs/pagination.config'
import { cacheConfig } from '~/configs/cache.config'
import { apiConfig } from '~/configs/api.config'

/**
 * GET /api/v1/resources
 *
 * Retrieve a list of resources with optional filtering and pagination
 *
 * Query parameters:
 * - page: Page number (default: 1, alternative to offset)
 * - limit: Number of resources to return (default: 20, max: 100)
 * - offset: Number of resources to skip (default: 0, alternative to page)
 * - category: Filter by category
 * - pricing: Filter by pricing model
 * - difficulty: Filter by difficulty level
 * - tag: Filter by specific tag
 * - search: Search term to filter by title/description
 * - sort: Sort field (default: 'popularity', options: title, dateAdded, popularity)
 * - order: Sort order (default: 'desc', options: asc, desc)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting
    await rateLimit(event)

    // Generate cache key based on query parameters
    const query = getQuery(event)
    const cacheKey = `resources:${JSON.stringify(query)}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters with validation
    // Validate and parse limit parameter
    let limit = paginationConfig.defaults.pageSize // Use config instead of hardcoded
    if (query.limit !== undefined) {
      const parsedLimit = parseInt(query.limit as string)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, paginationConfig.limits.maxPageSize) // Use config instead of hardcoded
      } else {
        return sendBadRequestError(
          event,
          'Invalid limit parameter. Must be a positive integer.'
        )
      }
    }

    // Validate and parse offset/page parameter (page takes precedence over offset)
    let offset = paginationConfig.defaults.offset // Use config instead of hardcoded
    if (query.page !== undefined) {
      const parsedPage = parseInt(query.page as string)
      if (!isNaN(parsedPage) && parsedPage >= 1) {
        offset = (parsedPage - 1) * limit
      } else {
        return sendBadRequestError(
          event,
          'Invalid page parameter. Must be a positive integer (1 or greater).'
        )
      }
    } else if (query.offset !== undefined) {
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

    // Validate and parse other parameters
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const search = query.search as string | undefined
    const tag = query.tag as string | undefined
    const sort = query.sort as string | undefined
    const order = (query.order as string | undefined)?.toLowerCase()

    // Validate sort parameter (supports both old and new formats)
    // Flexy hates hardcoded values! Using apiConfig for sort defaults
    const validSortFields: readonly string[] =
      apiConfig.resources.validSortFields
    let sortField = apiConfig.resources.defaultSortField
    let sortOrder: 'asc' | 'desc' = apiConfig.resources.defaultSortOrder

    if (sort) {
      // Handle legacy sort format (e.g., 'popularity-desc')
      if (sort.includes('-')) {
        const parts = sort.split('-')
        const field = parts[0]
        const dir = parts[1]
        if (
          field &&
          dir &&
          validSortFields.includes(field) &&
          ['asc', 'desc'].includes(dir)
        ) {
          sortField = field
          sortOrder = dir as 'asc' | 'desc'
        }
      } else if (validSortFields.includes(sort)) {
        sortField = sort
      } else {
        return sendBadRequestError(
          event,
          `Invalid sort parameter. Valid options: ${validSortFields.join(', ')}`
        )
      }
    }

    // Override sort order if order parameter is provided
    if (order) {
      if (['asc', 'desc'].includes(order)) {
        sortOrder = order as 'asc' | 'desc'
      } else {
        return sendBadRequestError(
          event,
          'Invalid order parameter. Must be "asc" or "desc".'
        )
      }
    }

    // Apply all filters in a single pass for better performance
    resources = resources.filter(resource => {
      if (
        category &&
        resource.category.toLowerCase() !== category.toLowerCase()
      ) {
        return false
      }
      if (
        pricing &&
        resource.pricingModel.toLowerCase() !== pricing.toLowerCase()
      ) {
        return false
      }
      if (
        difficulty &&
        resource.difficulty.toLowerCase() !== difficulty.toLowerCase()
      ) {
        return false
      }
      if (tag) {
        const tagLower = tag.toLowerCase()
        if (!resource.tags.some(t => t.toLowerCase() === tagLower)) {
          return false
        }
      }
      if (search) {
        const searchTerm = search.toLowerCase()
        if (
          !(
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm) ||
            resource.tags.some(t => t.toLowerCase().includes(searchTerm))
          )
        ) {
          return false
        }
      }
      return true
    })

    // Apply sorting based on sortField and sortOrder
    const sortMultiplier = sortOrder === 'asc' ? 1 : -1
    switch (sortField) {
      case 'title':
        resources.sort(
          (a, b) => sortMultiplier * a.title.localeCompare(b.title)
        )
        break
      case 'dateAdded':
        resources.sort(
          (a, b) =>
            sortMultiplier *
            (new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime())
        )
        break
      case 'popularity':
      default:
        resources.sort((a, b) => sortMultiplier * (a.popularity - b.popularity))
        break
    }

    // Apply pagination BEFORE hierarchical tag conversion for performance
    const total = resources.length
    const paginatedResources = resources.slice(offset, offset + limit)

    // Prepare response
    const response = {
      success: true,
      data: paginatedResources,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    }

    // Cache the result with tags for easier invalidation
    await cacheSetWithTags(
      cacheKey,
      response,
      cacheConfig.server.defaultTtlSeconds,
      ['resources', 'api-v1', 'list']
    )

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response
    return sendSuccessResponse(event, response)
  } catch (error) {
    // Log error using our error logging service
    logError(
      `Error fetching resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    return handleApiRouteError(event, error)
  }
})
