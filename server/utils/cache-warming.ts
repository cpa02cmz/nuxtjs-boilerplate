import { enhancedCacheManager } from './enhanced-cache'
import type { Resource } from '~/types/resource'

/**
 * Cache warming and preloading strategies
 * Pre-populates cache with commonly requested data to improve performance
 */

interface CacheWarmupConfig {
  enabled: boolean
  warmupDelay: number // milliseconds to wait before starting warmup
  maxConcurrent: number // max number of concurrent warmup operations
}

class CacheWarmer {
  private config: CacheWarmupConfig
  private isWarming: boolean = false
  private warmupQueue: Array<() => Promise<void>> = []

  constructor(config: Partial<CacheWarmupConfig> = {}) {
    this.config = {
      enabled: true,
      warmupDelay: 5000, // 5 seconds after initialization
      maxConcurrent: 5,
      ...config,
    }
  }

  /**
   * Start cache warming process
   */
  async startWarmup(): Promise<void> {
    if (!this.config.enabled || this.isWarming) {
      return
    }

    this.isWarming = true
    console.log('Starting cache warmup process...')

    // Schedule warmup after delay to avoid blocking initialization
    setTimeout(async () => {
      try {
        await this.warmupCommonEndpoints()
        console.log('Cache warmup completed successfully')
      } catch (error) {
        console.error('Cache warmup failed:', error)
      } finally {
        this.isWarming = false
      }
    }, this.config.warmupDelay)
  }

  /**
   * Warm up commonly accessed endpoints
   */
  private async warmupCommonEndpoints(): Promise<void> {
    // Define common cache keys and their corresponding data fetchers
    const warmupTasks = [
      // Warm up all categories
      { key: 'categories:all', fetcher: () => this.fetchCategories() },

      // Warm up popular resources (first page)
      {
        key: 'resources:{"limit":20,"sort":"popularity-desc"}',
        fetcher: () => this.fetchPopularResources(),
      },

      // Warm up recent resources
      {
        key: 'resources:{"limit":20,"sort":"date-added-desc"}',
        fetcher: () => this.fetchRecentResources(),
      },

      // Warm up most common category pages
      {
        key: 'resources:{"limit":20,"category":"ai-tools"}',
        fetcher: () => this.fetchByCategory('ai-tools'),
      },
      {
        key: 'resources:{"limit":20,"category":"development"}',
        fetcher: () => this.fetchByCategory('development'),
      },
      {
        key: 'resources:{"limit":20,"category":"design"}',
        fetcher: () => this.fetchByCategory('design'),
      },
    ]

    // Execute warmup tasks with limited concurrency
    const promises = []
    for (
      let i = 0;
      i < Math.min(this.config.maxConcurrent, warmupTasks.length);
      i++
    ) {
      promises.push(
        this.executeWarmupBatch(warmupTasks.slice(i * 2, (i + 1) * 2))
      )
    }

    await Promise.all(promises)
  }

  /**
   * Execute a batch of warmup tasks
   */
  private async executeWarmupBatch(
    tasks: Array<{ key: string; fetcher: () => Promise<any> }>
  ) {
    for (const task of tasks) {
      try {
        const data = await task.fetcher()
        await enhancedCacheManager.set(task.key, data, 3600) // Cache for 1 hour
        console.log(`Warmed up cache key: ${task.key}`)
      } catch (error) {
        console.error(`Failed to warm up cache key: ${task.key}`, error)
      }
    }
  }

  /**
   * Fetch all categories (simulating the categories API)
   */
  private async fetchCategories(): Promise<any> {
    const resourcesModule = await import('~/data/resources.json')
    const resources: Resource[] = resourcesModule.default || resourcesModule

    const categoryMap = new Map<string, number>()
    resources.forEach(resource => {
      const count = categoryMap.get(resource.category) || 0
      categoryMap.set(resource.category, count + 1)
    })

    const categories = Array.from(categoryMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      })
    )

    return {
      success: true,
      data: categories,
    }
  }

  /**
   * Fetch popular resources (simulating the resources API)
   */
  private async fetchPopularResources(): Promise<any> {
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Sort by popularity
    resources.sort((a, b) => b.popularity - a.popularity)

    // Take first 20
    const paginatedResources = resources.slice(0, 20)

    return {
      success: true,
      data: paginatedResources,
      pagination: {
        total: resources.length,
        limit: 20,
        offset: 0,
        hasNext: resources.length > 20,
        hasPrev: false,
      },
    }
  }

  /**
   * Fetch recent resources (simulating the resources API)
   */
  private async fetchRecentResources(): Promise<any> {
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Sort by date added (most recent first)
    resources.sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )

    // Take first 20
    const paginatedResources = resources.slice(0, 20)

    return {
      success: true,
      data: paginatedResources,
      pagination: {
        total: resources.length,
        limit: 20,
        offset: 0,
        hasNext: resources.length > 20,
        hasPrev: false,
      },
    }
  }

  /**
   * Fetch resources by category (simulating the resources API)
   */
  private async fetchByCategory(category: string): Promise<any> {
    const resourcesModule = await import('~/data/resources.json')
    let resources: Resource[] = resourcesModule.default || resourcesModule

    // Filter by category
    resources = resources.filter(
      resource => resource.category.toLowerCase() === category.toLowerCase()
    )

    // Sort by popularity
    resources.sort((a, b) => b.popularity - a.popularity)

    // Take first 20
    const paginatedResources = resources.slice(0, 20)

    return {
      success: true,
      data: paginatedResources,
      pagination: {
        total: resources.length,
        limit: 20,
        offset: 0,
        hasNext: resources.length > 20,
        hasPrev: false,
      },
    }
  }

  /**
   * Warm up specific cache keys
   */
  async warmupKeys(
    keys: Array<{ key: string; dataFetcher: () => Promise<any>; ttl?: number }>
  ): Promise<void> {
    for (const { key, dataFetcher, ttl = 3600 } of keys) {
      try {
        const data = await dataFetcher()
        await enhancedCacheManager.set(key, data, ttl)
        console.log(`Manually warmed up cache key: ${key}`)
      } catch (error) {
        console.error(`Failed to warm up cache key: ${key}`, error)
      }
    }
  }

  /**
   * Preload cache with specific data
   */
  async preloadCache(
    data: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    for (const { key, value, ttl = 3600 } of data) {
      try {
        await enhancedCacheManager.set(key, value, ttl)
        console.log(`Preloaded cache key: ${key}`)
      } catch (error) {
        console.error(`Failed to preload cache key: ${key}`, error)
      }
    }
  }

  /**
   * Get cache warming status
   */
  getStatus(): { isWarming: boolean; queueSize: number } {
    return {
      isWarming: this.isWarming,
      queueSize: this.warmupQueue.length,
    }
  }
}

// Initialize cache warmer with default configuration
const cacheWarmer = new CacheWarmer({
  enabled: process.env.CACHE_WARMING_ENABLED !== 'false',
  warmupDelay: parseInt(process.env.CACHE_WARMING_DELAY || '5000'),
  maxConcurrent: parseInt(process.env.CACHE_WARMING_CONCURRENT || '5'),
})

export { cacheWarmer, CacheWarmer }
