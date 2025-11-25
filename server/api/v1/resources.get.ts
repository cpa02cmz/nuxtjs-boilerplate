import { getQuery, setResponseHeader } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/resources
 *
 * Retrieve a list of resources with optional filtering and pagination
 *
 * Query parameters:
 * - limit: Number of resources to return (default: 20, max: 100)
 * - offset: Number of resources to skip (default: 0)
 * - category: Filter by category
 * - pricing: Filter by pricing model
 * - difficulty: Filter by difficulty level
 * - search: Search term to filter by title/description
 * - sort: Sort option (default: 'popularity-desc')
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Parse query parameters
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const offset = Math.max(parseInt(query.offset as string) || 0, 0)
    const category = query.category as string | undefined
    const pricing = query.pricing as string | undefined
    const difficulty = query.difficulty as string | undefined
    const search = query.search as string | undefined
    const sort = query.sort as string | undefined

    // Apply filters
    if (category) {
      resources = resources.filter(
        resource => resource.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (pricing) {
      resources = resources.filter(
        resource =>
          resource.pricingModel.toLowerCase() === pricing.toLowerCase()
      )
    }

    if (difficulty) {
      resources = resources.filter(
        resource =>
          resource.difficulty.toLowerCase() === difficulty.toLowerCase()
      )
    }

    if (search) {
      const searchTerm = search.toLowerCase()
      resources = resources.filter(
        resource =>
          resource.title.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply sorting
    switch (sort) {
      case 'alphabetical-asc':
        resources.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'alphabetical-desc':
        resources.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'date-added-desc':
        resources.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        )
        break
      case 'popularity-desc':
      default:
        resources.sort((a, b) => b.popularity - a.popularity)
        break
    }

    // Apply pagination
    const total = resources.length
    const paginatedResources = resources.slice(offset, offset + limit)

    return {
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
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching resources: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources'
    )

    return {
      success: false,
      message: 'An error occurred while fetching resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
