import { setResponseStatus } from 'h3'
import type { Resource, HierarchicalTag } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/tags
 *
 * Retrieve all tags with hierarchical structure
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Collect all tags from resources
    const allTags = new Map<string, HierarchicalTag>()

    for (const resource of resources) {
      for (const tag of resource.tags) {
        let tagId: string
        let tagName: string
        let tagDescription: string | undefined

        if (typeof tag === 'string') {
          tagId = tag
          tagName = tag
        } else {
          tagId = tag.id || tag.name
          tagName = tag.name
          tagDescription = tag.description
        }

        if (!allTags.has(tagId)) {
          allTags.set(tagId, {
            id: tagId,
            name: tagName,
            description: tagDescription,
            children: [],
          })
        }
      }
    }

    // For now, return a flat list of tags since we don't have hierarchical tag data
    // In a real implementation, we would have a tag hierarchy structure
    const tags = Array.from(allTags.values())

    // Set success response status
    setResponseStatus(event, 200)
    return {
      success: true,
      data: tags,
      count: tags.length,
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching tags: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-tags',
      {
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
