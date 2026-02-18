import type { Resource } from '~/types/resource'
import type { H3Event } from 'h3'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { createApiRoute } from '~/server/utils/create-api-route'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { timeConfig, toSeconds } from '~/configs/time.config'
import { contentConfig } from '~/configs/content.config'
import { getAllHierarchicalTags } from '~/utils/tags'

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
  // Parse query parameters
  const query = getQuery(event)
  const includeChildren = query.includeChildren !== 'false'
  const includeParents = query.includeParents !== 'false'
  const rootOnly = query.rootOnly === 'true'

  // Build cache key based on query parameters
  const cacheKey = `tags:${includeChildren}:${includeParents}:${rootOnly}`

  // Try to get from cache first
  const cachedResult = (await cacheManager.get(cacheKey)) as {
    tags: unknown[]
    includeChildren: boolean
    includeParents: boolean
    rootOnly: boolean
  } | null

  if (cachedResult) {
    event.node.res?.setHeader('X-Cache', 'HIT')
    return cachedResult
  }

  // Import resources from JSON to get actual tag data
  const resourcesModule = await import(contentConfig.paths.resourcesData)
  const resources: Resource[] = resourcesModule.default || resourcesModule

  // Get all hierarchical tags from resources
  const allTags = getAllHierarchicalTags(resources)

  // Filter based on rootOnly parameter
  let filteredTags = allTags
  if (rootOnly) {
    filteredTags = allTags.filter(tag => tag.parentId === null)
  }

  const responseData = {
    tags: filteredTags,
    includeChildren,
    includeParents,
    rootOnly,
  }

  // Cache result since tags don't change often
  await cacheSetWithTags(
    cacheKey,
    responseData,
    toSeconds(timeConfig.cache.long),
    generateCacheTags(cacheTagsConfig.tags.all)
  )

  // Set cache miss header
  event.node.res?.setHeader('X-Cache', 'MISS')

  return responseData
}

// Export using the unified API route handler
export default createApiRoute(getTagsHandler, {
  logContext: 'api-v1-tags',
})
