import { createError } from 'h3'
import { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/resources/:id
 *
 * Retrieve a specific resource by its ID
 */
export default defineEventHandler(async event => {
  try {
    // Get the resource ID from the URL parameter
    const id = event.context.params?.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Resource ID is required',
      })
    }

    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Find the resource by ID
    const resource = resources.find(r => r.id === id)

    if (!resource) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Resource not found',
      })
    }

    return {
      success: true,
      data: resource,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    // Log error using our error logging service
    logError(
      `Error fetching resource by ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-resources-by-id'
    )

    return {
      success: false,
      message: 'An error occurred while fetching the resource',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
