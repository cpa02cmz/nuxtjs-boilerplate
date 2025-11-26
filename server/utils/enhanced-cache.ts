import type { H3Event } from 'h3'
import { createClient } from 'redis'

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in seconds
}

interface CacheConfig {
  useRedis?: boolean
  redisUrl?: string
  fallbackToMemory?: boolean
  defaultTTL?: number
}

class EnhancedCacheManager {
  private memoryCache: Map<string, CacheEntry>
  private redisClient: any
  private config: CacheConfig
  private maxMemorySize: number
  private cleanupInterval: number

  constructor(config: CacheConfig = {}) {
    this.config = {
      useRedis: false,
      fallbackToMemory: true,
      defaultTTL: 3600,
      ...config,
    }
    this.memoryCache = new Map()
    this.maxMemorySize = 1000
    this.cleanupInterval = 300000 // 5 minutes default

    // Initialize Redis client if configured
    if (this.config.useRedis && this.config.redisUrl) {
      this.redisClient = createClient({
        url: this.config.redisUrl,
      })

      this.redisClient.on('error', (err: Error) => {
        console.error('Redis Client Error:', err)
        // If Redis fails and fallback is enabled, continue using memory cache
        if (!this.config.fallbackToMemory) {
          console.error('Redis unavailable and no fallback configured')
        }
      })

      this.redisClient.connect()
    }

    this.startCleanup()
  }

  /**
   * Start periodic cleanup of expired cache entries
   */
  private startCleanup() {
    setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired() {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Get value from cache (Redis first, then memory as fallback)
   */
  async get(key: string): Promise<any | null> {
    // Try Redis first if available
    if (this.redisClient && this.config.useRedis) {
      try {
        const result = await this.redisClient.get(key)
        if (result !== null) {
          const parsed = JSON.parse(result)
          // Check if entry is expired (for consistency with memory cache)
          const now = Date.now()
          if (now - parsed.timestamp > parsed.ttl * 1000) {
            await this.redisClient.del(key)
            return null
          }
          return parsed.data
        }
      } catch (error) {
        console.error('Redis GET error:', error)
        if (!this.config.fallbackToMemory) return null
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    // Check if entry is expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set value in cache (both Redis and memory)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const effectiveTTL = ttl || this.config.defaultTTL || 3600
    const cacheEntry: CacheEntry = {
      data: value,
      timestamp: Date.now(),
      ttl: effectiveTTL,
    }

    // Set in Redis if available
    let redisSuccess = true
    if (this.redisClient && this.config.useRedis) {
      try {
        await this.redisClient.setEx(
          key,
          effectiveTTL,
          JSON.stringify(cacheEntry)
        )
      } catch (error) {
        console.error('Redis SET error:', error)
        redisSuccess = false
      }
    }

    // Set in memory cache
    let memorySuccess = true
    try {
      // Clean up expired entries if cache is full
      if (this.memoryCache.size >= this.maxMemorySize) {
        this.cleanupExpired()
      }

      // If still full, remove oldest entries
      if (this.memoryCache.size >= this.maxMemorySize) {
        const iterator = this.memoryCache.keys()
        for (let i = 0; i < Math.floor(this.maxMemorySize * 0.1); i++) {
          const key = iterator.next().value
          if (key) this.memoryCache.delete(key)
        }
      }

      this.memoryCache.set(key, cacheEntry)
    } catch (error) {
      console.error('Memory cache SET error:', error)
      memorySuccess = false
    }

    return redisSuccess || memorySuccess // Success if either cache worked
  }

  /**
   * Delete value from cache (both Redis and memory)
   */
  async delete(key: string): Promise<boolean> {
    let success = true

    // Delete from Redis if available
    if (this.redisClient && this.config.useRedis) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        console.error('Redis DELETE error:', error)
        success = false
      }
    }

    // Delete from memory cache
    const memorySuccess = this.memoryCache.delete(key)

    return success || memorySuccess
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    if (this.redisClient && this.config.useRedis) {
      try {
        await this.redisClient.flushAll()
      } catch (error) {
        console.error('Redis FLUSH error:', error)
      }
    }

    this.memoryCache.clear()
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    // Check Redis first
    if (this.redisClient && this.config.useRedis) {
      try {
        const result = await this.redisClient.get(key)
        if (result !== null) {
          const parsed = JSON.parse(result)
          const now = Date.now()
          if (now - parsed.timestamp > parsed.ttl * 1000) {
            await this.redisClient.del(key)
            return false
          }
          return true
        }
      } catch (error) {
        console.error('Redis HAS error:', error)
        if (!this.config.fallbackToMemory) return false
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key)
      return false
    }

    return true
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memorySize: number
    redisConnected?: boolean
    redisMemoryUsage?: string
  }> {
    const stats: any = {
      memorySize: this.memoryCache.size,
    }

    if (this.redisClient && this.config.useRedis) {
      try {
        stats.redisConnected = this.redisClient.isOpen
        if (this.redisClient.isOpen) {
          const info = await this.redisClient.info('memory')
          stats.redisMemoryUsage = info
        }
      } catch (error) {
        console.error('Redis INFO error:', error)
      }
    }

    return stats
  }
}

// Initialize enhanced cache manager with config from environment
const enhancedCacheManager = new EnhancedCacheManager({
  useRedis: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  fallbackToMemory: true,
  defaultTTL: 3600,
})

// Export the enhanced cache manager instance
export { enhancedCacheManager, EnhancedCacheManager }

/**
 * Cache decorator function for API endpoints with enhanced features
 */
export function cached(
  ttl: number = 3600,
  keyGenerator?: (event: H3Event) => string,
  useRedis: boolean = false
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (event: H3Event) {
      // Generate cache key
      let cacheKey = keyGenerator
        ? keyGenerator(event)
        : `${propertyKey}:${event.path}:${JSON.stringify(event.context.params || {})}`

      // Use enhanced cache manager
      const cachedResult = await enhancedCacheManager.get(cacheKey)
      if (cachedResult !== null) {
        // Set cache hit header
        if (event.node.res?.setHeader) {
          event.node.res.setHeader('X-Cache', 'HIT')
          event.node.res.setHeader(
            'X-Cache-Type',
            useRedis ? 'redis' : 'memory'
          )
        }
        return cachedResult
      }

      // Execute original method
      const result = await originalMethod.apply(this, [event])

      // Cache the result
      await enhancedCacheManager.set(cacheKey, result, ttl)

      // Set cache miss header
      if (event.node.res?.setHeader) {
        event.node.res.setHeader('X-Cache', 'MISS')
        event.node.res.setHeader('X-Cache-Type', useRedis ? 'redis' : 'memory')
      }

      return result
    }

    return descriptor
  }
}
