import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { getAllHierarchicalTags } from '~/utils/tags'
import type { Resource } from '~/types/resource'
import { createApiRoute } from '~/server/utils/create-api-route'
import { contentConfig } from '~/configs/content.config'

/**
 * GET /api/v1/tags
 *
 * Retrieve hierarchical tags with optional filtering
 *
 * Query parameters:
 * - includeChildren: Include child tags in the response (default: true)
 * - includeParents: Include parent tags in the response (default: true)
 * - rootOnly: Return only root level tags (default: false)
 */
async function getTagsHandler(event: H3Event) {
  // Import resources from JSON to get actual tag data
  const resourcesModule = await import(contentConfig.paths.resourcesData)
  const resources: Resource[] = resourcesModule.default || resourcesModule

  // Parse query parameters
  const query = getQuery(event)
  const includeChildren = query.includeChildren !== 'false' // Default to true
  const includeParents = query.includeParents !== 'false' // Default to true
  const rootOnly = query.rootOnly === 'true' // Default to false

  // Get all hierarchical tags from resources
  const allTags = getAllHierarchicalTags(resources)

  // Filter based on rootOnly parameter
  let filteredTags = allTags
  if (rootOnly) {
    filteredTags = allTags.filter(tag => tag.parentId === null)
  }

  return {
    tags: filteredTags,
    includeChildren,
    includeParents,
    rootOnly,
  }
}

export default createApiRoute(getTagsHandler, {
  logContext: 'api-v1-tags',
})
