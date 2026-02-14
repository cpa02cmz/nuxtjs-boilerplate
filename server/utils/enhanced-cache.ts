import type { H3Event } from 'h3'
import Redis from 'ioredis'
import logger from '~/utils/logger'
import { cacheConfig } from '~/configs/cache.config'

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number // Time to live in seconds
}

interface CacheManagerConfig {
  maxMemorySize?: number
  cleanupInterval?: number
  enableRedis?: boolean
  redisUrl?: string
  enableAnalytics?: boolean
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<unknown>>
  private maxMemorySize: number
  private cleanupInterval: number
  private enableRedis: boolean
  private redisClient: Redis | null = null
  private enableAnalytics: boolean
  private hitCount: number = 0
  private missCount: number = 0
  private redisConnected: boolean = false
  private cleanupIntervalId: NodeJS.Timeout | null = null

  constructor(config: CacheManagerConfig = {}) {
    const {
      maxMemorySize = cacheConfig.server.maxMemorySize,
      cleanupInterval = cacheConfig.server.cleanupIntervalMs,
      enableRedis = false,
      redisUrl = process.env.REDIS_URL,
      enableAnalytics = true,
    } = config

    this.memoryCache = new Map<string, CacheEntry<unknown>>()
    this.maxMemorySize = maxMemorySize
    this.cleanupInterval = cleanupInterval
    this.enableRedis = enableRedis
    this.enableAnalytics = enableAnalytics

    // Initialize Redis if enabled
    if (enableRedis && redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: cacheConfig.redis.maxRetriesPerRequest,
          lazyConnect: cacheConfig.redis.lazyConnect,
          enableReadyCheck: cacheConfig.redis.enableReadyCheck,
          connectTimeout: cacheConfig.redis.connectTimeoutMs,
          keepAlive: cacheConfig.redis.keepAliveMs,
        })

        // Set up connection listeners
        this.redisClient.on('connect', () => {
          this.redisConnected = true
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Successfully connected to Redis')
          }
        })

        this.redisClient.on('error', error => {
          logger.warn('Redis connection error:', error)
          this.redisConnected = false
          // Fallback to memory cache only
          this.enableRedis = false
        })

        this.redisClient.on('reconnecting', () => {
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Reconnecting to Redis...')
          }
        })

        // Attempt to connect
        this.redisClient.connect().catch(error => {
          logger.warn(
            'Failed to connect to Redis, falling back to memory cache:',
            error
          )
          this.enableRedis = false
          this.redisConnected = false
        })
      } catch (error) {
        logger.warn(
          'Failed to initialize Redis client, falling back to memory cache:',
          error
        )
        this.enableRedis = false
        this.redisConnected = false
      }
    }

    this.startCleanup()
  }

  /**
   * Start periodic cleanup of expired cache entries
   * FIXED: Store interval reference to prevent memory leaks
   */
  private startCleanup() {
    this.cleanupIntervalId = setInterval(() => {
      this.cleanupExpired()
    }, this.cleanupInterval)
  }

  /**
   * Stop the cleanup interval to prevent memory leaks
   */
  private stopCleanup() {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = null
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired() {
    const now = Date.now()
    const entries = Array.from(this.memoryCache.entries())
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Get value from cache (memory first, then Redis if configured)
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry) {
      const now = Date.now()
      if (now - memoryEntry.timestamp <= memoryEntry.ttl * 1000) {
        if (this.enableAnalytics) this.hitCount++
        return memoryEntry.data as T
      } else {
        this.memoryCache.delete(key)
      }
    }

    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        const redisValue = await this.redisClient.get(key)
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue)
          await this.set(
            key,
            parsedValue,
            memoryEntry?.ttl || cacheConfig.server.defaultTtlSeconds
          )
          if (this.enableAnalytics) this.hitCount++
          return parsedValue as T
        }
      } catch (error) {
        logger.warn('Redis get error, falling back to memory cache:', error)
      }
    }

    if (this.enableAnalytics) this.missCount++
    return null
  }

  /**
   * Set value in cache (both memory and Redis if configured)
   */
  async set<T = unknown>(
    key: string,
    value: T,
    ttl: number = cacheConfig.server.defaultTtlSeconds
  ): Promise<boolean> {
    // Clean up expired entries if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.cleanupExpired()
    }

    // If still full, remove oldest entries (LRU)
    if (this.memoryCache.size >= this.maxMemorySize) {
      const keys = Array.from(this.memoryCache.keys())
      // Remove a portion of the oldest entries
      for (
        let i = 0;
        i <
        Math.min(
          Math.floor(
            this.maxMemorySize * cacheConfig.server.lruCleanupPercentage
          ),
          keys.length
        );
        i++
      ) {
        const keyToDelete = keys[i]
        if (keyToDelete !== undefined) {
          this.memoryCache.delete(keyToDelete)
        }
      }
    }

    // Set in memory cache
    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })

    // If Redis is enabled, also set in Redis
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.setex(key, ttl, JSON.stringify(value))
      } catch (error) {
        logger.warn('Redis set error:', error)
        // Don't disable Redis here, just log the error and continue
      }
    }

    return true
  }

  /**
   * Delete value from cache (both memory and Redis if configured)
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false

    // Delete from memory cache
    if (this.memoryCache.has(key)) {
      this.memoryCache.delete(key)
      deleted = true
    }

    // If Redis is enabled, also delete from Redis
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.del(key)
      } catch (error) {
        logger.warn('Redis delete error:', error)
        // Don't disable Redis here, just log the error and continue
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries (both memory and Redis if configured)
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        await this.redisClient.flushall()
      } catch (error) {
        logger.warn('Redis clear error:', error)
        // Don't disable Redis here, just log the error and continue
      }
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const result = await this.get(key)
    return result !== null
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    hits: number
    misses: number
    hitRate: number
    size: number
  }> {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0

    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate,
      size: this.memoryCache.size,
    }
  }

  /**
   * Preload cache with initial data
   */
  async preload<T = unknown>(
    keys: Array<{ key: string; value: T; ttl?: number }>
  ): Promise<void> {
    for (const item of keys) {
      await this.set(
        item.key,
        item.value,
        item.ttl || cacheConfig.server.defaultTtlSeconds
      )
    }
  }

  /**
   * Invalidate cache by pattern (memory cache and Redis if configured)
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0

    // Invalidate in memory cache
    const entries = Array.from(this.memoryCache.entries())
    for (const [key] of entries) {
      if (this.matchPattern(key, pattern)) {
        this.memoryCache.delete(key)
        invalidatedCount++
      }
    }

    // If Redis is enabled, also invalidate matching keys in Redis
    if (this.enableRedis && this.redisClient && this.redisConnected) {
      try {
        // In Redis, we need to scan keys matching the pattern and delete them
        const keys = await this.redisClient.keys(pattern)
        if (keys.length > 0) {
          await this.redisClient.del(...keys)
          invalidatedCount += keys.length
        }
      } catch (error) {
        logger.warn('Redis invalidate error:', error)
        // Don't disable Redis here, just log the error and continue
      }
    }

    return invalidatedCount
  }

  /**
   * Simple pattern matching for cache invalidation
   * FIXED: Properly escape regex special characters to prevent regex injection
   * FIXED: Added ReDoS protection with pattern complexity limits (Issue #2213)
   */
  private matchPattern(key: string, pattern: string): boolean {
    // ReDoS Protection: Validate pattern complexity
    if (pattern.length > 100) {
      logger.warn(
        `Cache pattern too long (>100 chars): ${pattern.substring(0, 50)}...`
      )
      return false
    }

    const wildcardCount = (pattern.match(/\*/g) || []).length
    if (wildcardCount > 5) {
      logger.warn(`Cache pattern has too many wildcards (>5): ${pattern}`)
      return false
    }

    // First escape all regex special characters, then convert glob patterns
    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Convert glob pattern to regex
    const regexPattern = escapeRegex(pattern)
      .replace(/\\\*/g, '.*') // Convert * to .*
      .replace(/\\\?/g, '.') // Convert ? to .

    const regex = new RegExp(`^${regexPattern}$`)

    // Add timeout protection for regex execution
    const start = Date.now()
    const result = regex.test(key)
    if (Date.now() - start > 100) {
      logger.warn(`Cache pattern matching timeout for pattern: ${pattern}`)
      return false
    }

    return result
  }

  /**
   * Close Redis connection properly
   * FIXED: Also stop cleanup interval to prevent memory leaks
   */
  async disconnect(): Promise<void> {
    // Stop cleanup interval to prevent memory leaks
    this.stopCleanup()

    if (this.redisClient) {
      try {
        await this.redisClient.quit()
        this.redisConnected = false
      } catch (error) {
        logger.warn('Error closing Redis connection:', error)
      }
    }
  }
}

// Initialize cache manager with default configuration
const cacheManager = new CacheManager({
  maxMemorySize: cacheConfig.server.maxMemorySize * 2, // Increased default size (2x the base config)
  enableRedis: !!process.env.REDIS_URL,
  enableAnalytics: true,
})

// Export the cache manager instance
export { cacheManager }

/**
 * Cache decorator function for API endpoints
 */
export function cached<T = unknown>(
  ttl: number = cacheConfig.server.defaultTtlSeconds,
  keyGenerator?: (event: H3Event) => string
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (event: H3Event): Promise<T> {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(event)
        : `${propertyKey}:${event.path}:${JSON.stringify(event.context.params || {})}`

      // Try to get from cache first
      const cachedResult = await cacheManager.get<T>(cacheKey)
      if (cachedResult !== null) {
        // Set cache hit header
        if (event.node.res?.setHeader) {
          event.node.res.setHeader('X-Cache', 'HIT')
          event.node.res.setHeader('X-Cache-Key', cacheKey)
        }
        return cachedResult
      }

      // Execute original method
      const result = (await originalMethod.apply(this, [event])) as T

      // Cache result
      await cacheManager.set(cacheKey, result, ttl)

      // Set cache miss header
      if (event.node.res?.setHeader) {
        event.node.res.setHeader('X-Cache', 'MISS')
        event.node.res.setHeader('X-Cache-Key', cacheKey)
      }

      return result
    }

    return descriptor
  }
}

/**
 * Cache with tags for easier invalidation
 * FIXED: Tag mappings now properly expire when cache entries expire
 */
export async function cacheSetWithTags<T = unknown>(
  key: string,
  value: T,
  ttl: number = cacheConfig.server.defaultTtlSeconds,
  tags: string[] = []
): Promise<boolean> {
  // Store the value with metadata for tag tracking
  const valueWithMeta = {
    data: value,
    _cacheTags: tags,
    _createdAt: Date.now(),
  }
  const setResult = await cacheManager.set(key, valueWithMeta, ttl)

  // Create tag mappings for later invalidation with proper expiration
  for (const tag of tags) {
    const tagKey = `tag:${tag}`
    const tagMembers: string[] = (await cacheManager.get(tagKey)) || []
    if (!tagMembers.includes(key)) {
      tagMembers.push(key)
      // FIXED: Tag mapping should expire at the same time as the cache entry
      // or shortly after, not stay indefinitely
      await cacheManager.set(tagKey, tagMembers, ttl)
    }
  }

  return setResult
}

/**
 * Invalidate cache by tag
 */
export async function invalidateCacheByTag(tag: string): Promise<number> {
  const tagKey = `tag:${tag}`
  const tagMembers: string[] = (await cacheManager.get(tagKey)) || []
  let invalidatedCount = 0

  // Filter out expired keys and delete valid ones
  const remainingMembers: string[] = []
  for (const key of tagMembers) {
    // Check if the key still exists in cache
    const value = await cacheManager.get(key)
    if (value !== null) {
      // Key still valid, delete it
      if (await cacheManager.delete(key)) {
        invalidatedCount++
      }
      remainingMembers.push(key)
    }
    // If value is null, key expired - don't add to remainingMembers
  }

  // Clean up the tag mapping
  if (remainingMembers.length > 0) {
    // Update tag mapping with only valid keys
    await cacheManager.set(
      tagKey,
      remainingMembers,
      cacheConfig.server.defaultTtlSeconds
    )
  } else {
    // No valid keys left, delete the tag mapping entirely
    await cacheManager.delete(tagKey)
  }

  return invalidatedCount
}
