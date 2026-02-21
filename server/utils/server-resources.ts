import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { Resource } from '~/types/resource'
import { logError } from '~/utils/errorLogger'
import logger from '~/utils/logger'
import { cacheConfig } from '~/configs/cache.config'

let cachedResources: Resource[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = cacheConfig.server.defaultTtlMs

// Performance-engineer: Cached Map for O(1) resource lookups
let resourceMap: Map<string, Resource> | undefined

/**
 * Load resources from the JSON file - Server-side only
 * This is a server-side utility that should NOT be used in Vue composables
 * For client-side usage, use the useResourceData composable instead
 */
export function loadServerResources(): Resource[] {
  try {
    // Return cached resources if still valid
    const now = Date.now()
    if (cachedResources && now - cacheTimestamp < CACHE_TTL_MS) {
      return cachedResources
    }

    // Resolve path relative to project root
    const resourcesPath = resolve(process.cwd(), 'data/resources.json')
    const fileContent = readFileSync(resourcesPath, 'utf-8')
    const rawData = JSON.parse(fileContent)

    // Type validation to ensure data integrity
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid resource data format: expected array')
    }

    // Validate each resource has required properties
    const validatedResources: Resource[] = []
    for (const item of rawData) {
      if (
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.category === 'string' &&
        Array.isArray(item.tags) &&
        Array.isArray(item.technology)
      ) {
        validatedResources.push(item as Resource)
      }
    }

    if (validatedResources.length === 0 && rawData.length > 0) {
      throw new Error('Invalid resource data: no valid resources found')
    }

    // Update cache
    cachedResources = validatedResources
    cacheTimestamp = now

    return validatedResources
  } catch (err) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    logError(
      'Failed to load server resources',
      errorObj,
      'loadServerResources',
      { errorType: err?.constructor?.name }
    )
    logger.error('Error loading server resources:', err)
    throw errorObj
  }
}

/**
 * Clear the resources cache - useful for testing or when data changes
 */
export function clearServerResourcesCache(): void {
  cachedResources = null
  cacheTimestamp = 0
  // Performance-engineer: Also clear the resource map cache
  resourceMap = undefined
}

/**
 * Get all unique categories from resources
 */
export function getServerCategories(): string[] {
  const resources = loadServerResources()
  return [...new Set(resources.map(r => r.category))]
}

/**
 * Get all unique technologies from resources
 */
export function getServerTechnologies(): string[] {
  const resources = loadServerResources()
  const techSet = new Set<string>()
  resources.forEach(r => r.technology.forEach(t => techSet.add(t)))
  return [...techSet]
}

/**
 * Get all unique pricing models from resources
 */
export function getServerPricingModels(): string[] {
  const resources = loadServerResources()
  return [...new Set(resources.map(r => r.pricingModel))]
}

/**
 * Get all unique difficulty levels from resources
 */
export function getServerDifficultyLevels(): string[] {
  const resources = loadServerResources()
  return [...new Set(resources.map(r => r.difficulty))]
}

/**
 * Find a resource by ID
 */
export function findServerResourceById(id: string): Resource | undefined {
  // Performance-engineer: Use O(1) Map lookup instead of O(n) array.find
  return getResourceMap().get(id)
}

/**
 * Get a cached Map<string, Resource> for O(1) lookups by ID.
 * Performance-engineer: Rebuilds map only when resource list changes.
 * @returns Map of resource IDs to Resource objects
 */
export function getResourceMap(): Map<string, Resource> {
  const resources = loadServerResources()
  if (!resourceMap || resourceMap.size !== resources.length) {
    const map = new Map<string, Resource>()
    for (const r of resources) {
      map.set(r.id, r)
    }
    resourceMap = map
  }
  return resourceMap
}

/**
 * Find resources by category
 */
export function findServerResourcesByCategory(category: string): Resource[] {
  const resources = loadServerResources()
  return resources.filter(r => r.category === category)
}

/**
 * Find resources by tag
 */
export function findServerResourcesByTag(tag: string): Resource[] {
  const resources = loadServerResources()
  return resources.filter(r => r.tags.includes(tag))
}

/**
 * Search resources by query string
 */
export function searchServerResources(query: string): Resource[] {
  const resources = loadServerResources()
  const lowerQuery = query.toLowerCase()
  return resources.filter(
    r =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.description.toLowerCase().includes(lowerQuery) ||
      r.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      r.technology.some(t => t.toLowerCase().includes(lowerQuery))
  )
}
