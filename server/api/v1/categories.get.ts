import type { Resource } from '~/types/resource'
import type { H3Event } from 'h3'
import { cacheManager, cacheSetWithTags } from '~/server/utils/enhanced-cache'
import { createApiRoute } from '~/server/utils/create-api-route'
import { generateCacheTags, cacheTagsConfig } from '~/configs/cache-tags.config'
import { timeConfig, toSeconds } from '~/configs/time.config'
import { contentConfig } from '~/configs/content.config'

/**
 * GET /api/v1/categories
 *
 * Retrieve a list of all available categories with counts
 */
interface CategoriesCacheEntry {
  data: Array<{ name: string; count: number }>
  success: boolean
}

async function getCategoriesHandler(event: H3Event) {
  // Try to get from cache first
  const cacheKey = 'categories:all'
  const cachedResult = (await cacheManager.get(
    cacheKey
  )) as CategoriesCacheEntry | null
  if (cachedResult) {
    event.node.res?.setHeader('X-Cache', 'HIT')
    return cachedResult.data
  }

  // Import resources from JSON
  const resourcesModule = await import(contentConfig.paths.resourcesData)
  const resources: Resource[] = resourcesModule.default || resourcesModule

  // Get unique categories with counts
  const categoryMap = new Map<string, number>()

  resources.forEach(resource => {
    const count = categoryMap.get(resource.category) || 0
    categoryMap.set(resource.category, count + 1)
  })

  const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
    name,
    count,
  }))

  // Cache result for 1 hour since categories don't change often
  const response = { success: true, data: categories }
  await cacheSetWithTags(
    cacheKey,
    response,
    toSeconds(timeConfig.cache.long),
    generateCacheTags(cacheTagsConfig.categories.all)
  )

  // Set cache miss header
  event.node.res?.setHeader('X-Cache', 'MISS')

  return categories
}

// Export using the unified API route handler
export default createApiRoute(getCategoriesHandler, {
  logContext: 'api-v1-categories',
})
