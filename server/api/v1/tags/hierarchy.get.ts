import { setResponseStatus } from 'h3'
import type { Resource, HierarchicalTag } from '~/types/resource'
import { logError } from '~/utils/errorLogger'

/**
 * GET /api/v1/tags/hierarchy
 *
 * Retrieve all tags with hierarchical structure
 */
export default defineEventHandler(async event => {
  try {
    // Import resources from JSON
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Create a map for all tags
    const tagMap = new Map<
      string,
      {
        id: string
        name: string
        description?: string
        synonyms?: readonly string[]
        parentId?: string
        children: any[]
      }
    >()

    // Collect all tags from resources and create tag map
    for (const resource of resources) {
      for (const tag of resource.tags) {
        let tagId: string
        let tagName: string
        let tagDescription: string | undefined
        let tagSynonyms: readonly string[] | undefined
        let parentId: string | undefined

        if (typeof tag === 'string') {
          tagId = tag
          tagName = tag
        } else {
          tagId = tag.id || tag.name
          tagName = tag.name
          tagDescription = tag.description
          tagSynonyms = tag.synonyms
          parentId = tag.parentId
        }

        if (!tagMap.has(tagId)) {
          tagMap.set(tagId, {
            id: tagId,
            name: tagName,
            description: tagDescription,
            synonyms: tagSynonyms,
            parentId: parentId,
            children: [],
          })
        }
      }
    }

    // Build the hierarchy by connecting parent-child relationships
    const rootTags: {
      id: string
      name: string
      description?: string
      synonyms?: readonly string[]
      parentId?: string
      children: any[]
    }[] = []

    for (const tag of tagMap.values()) {
      if (tag.parentId && tagMap.has(tag.parentId)) {
        const parent = tagMap.get(tag.parentId)
        if (parent) {
          parent.children.push(tag)
        }
      } else {
        // This is a root-level tag
        rootTags.push(tag)
      }
    }

    // Since we can't directly return mutable objects due to readonly types,
    // we'll construct the final structure for response
    const result = JSON.parse(JSON.stringify(rootTags))

    // Set success response status
    setResponseStatus(event, 200)
    return {
      success: true,
      data: result,
      count: result.length,
    }
  } catch (error: any) {
    // Log error using our error logging service
    logError(
      `Error fetching hierarchical tags: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error as Error,
      'api-v1-tags-hierarchy',
      {
        errorType: error?.constructor?.name,
      }
    )

    // Set error response status
    setResponseStatus(event, 500)
    return {
      success: false,
      message: 'An error occurred while fetching hierarchical tags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }
  }
})
