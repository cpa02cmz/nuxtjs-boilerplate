import { defineEventHandler } from 'h3'
import type { Resource } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'

/**
 * GET /api/resources.json
 *
 * Returns all resources in JSON format
 * This endpoint is used for prefetching data on the client side
 */
export default defineEventHandler(async () => {
  try {
    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    return {
      success: true,
      data: resources,
      total: resources.length,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to load resources',
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
})
