import { getQuery, setResponseStatus } from 'h3'
import Fuse from 'fuse.js'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import { cacheManager, cacheSetWithTags } from '~/utils/cache'
import { rateLimit } from '~/utils/enhanced-rate-limit'

/**
 * GET /api/search/suggestions
 *
 * Get search suggestions based on input query
 *
 * Query parameters:
 * - q: Search query term (required)
 * - limit: Number of suggestions to return (default: 5, max: 10)
 */
export default defineEventHandler(async event => {
  try {
    // Apply rate limiting for search suggestions endpoint
    await rateLimit(event)

    // Get query parameters
    const query = getQuery(event)
    const searchQuery = query.q as string | undefined
    const limitParam = query.limit as string | undefined

    // Validate required parameters
    if (!searchQuery) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: 'Search query (q) parameter is required',
        error: 'Bad Request',
      }
    }

    // Validate and parse limit parameter
    let limit = 5 // default
    if (limitParam !== undefined) {
      const parsedLimit = parseInt(limitParam)
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 10) // max 10 suggestions
      } else {
        // Invalid limit provided, return error
        setResponseStatus(event, 400)
        return {
          success: false,
          message: 'Invalid limit parameter. Must be a positive integer.',
          error: 'Bad Request',
        }
      }
    }

    // Generate cache key based on query and limit
    const cacheKey = `suggestions:${searchQuery}:${limit}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      event.node.res?.setHeader('X-Cache', 'HIT')
      event.node.res?.setHeader('X-Cache-Key', cacheKey)
      return cachedResult
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Create Fuse.js instance for search suggestions
    const fuse = new Fuse(resources, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'benefits', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    })

    // Perform search with limit
    const searchResults = fuse.search(searchQuery, { limit })

    // Format suggestions
    const suggestions = searchResults.map(item => ({
      id: item.item.id,
      text: item.item.title,
      type: 'resource' as const,
      score: item.score || 0,
      metadata: {
        description: item.item.description,
        category: item.item.category,
        tags: item.item.tags,
      },
    }))

    // Prepare response
    const response = {
      success: true,
      data: suggestions,
      query: searchQuery,
      limit: limit,
      total: suggestions.length,
    }

    // Cache the result (shorter TTL for suggestions)
    await cacheSetWithTags(cacheKey, response, 60, [
      'search-suggestions',
      'api',
      'suggestions',
    ])

    // Set cache miss header
    event.node.res?.setHeader('X-Cache', 'MISS')
    event.node.res?.setHeader('X-Cache-Key', cacheKey)

    // Set success response status
    setResponseStatus(event, 200)
    return response
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error getting search suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-search-suggestions',
      {
        query: getQuery(event),
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while getting search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
