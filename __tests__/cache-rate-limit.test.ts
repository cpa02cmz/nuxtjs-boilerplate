import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cacheManager } from '../server/utils/cache'
import { enhancedCacheManager } from '../server/utils/enhanced-cache'
import {
  rateLimitConfigs,
  getRateLimiterForPath,
  SlidingWindowRateLimiter,
} from '../server/utils/rate-limit'
import { performanceMonitor } from '../server/utils/performance-monitoring'

describe('Cache and Rate Limiting System', () => {
  beforeEach(() => {
    // Clear cache before each test
    cacheManager.clear()
  })

  describe('Cache Manager', () => {
    it('should store and retrieve values', async () => {
      const key = 'test-key'
      const value = { data: 'test-value' }

      const setResult = await cacheManager.set(key, value, 300) // 5 minutes TTL
      expect(setResult).toBe(true)

      const getResult = await cacheManager.get(key)
      expect(getResult).toEqual(value)
    })

    it('should return null for non-existent keys', async () => {
      const result = await cacheManager.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should respect TTL and expire entries', async () => {
      const key = 'expiring-key'
      const value = 'test-value'

      // Mock Date.now to simulate time passing
      const originalNow = Date.now
      Date.now = vi.fn(() => 1000000)

      await cacheManager.set(key, value, 1) // 1 second TTL

      // Move time forward past TTL
      Date.now = vi.fn(() => 2000000) // 1 second later

      const result = await cacheManager.get(key)
      expect(result).toBeNull()

      // Restore original Date.now
      Date.now = originalNow
    })

    it('should handle cache has method', async () => {
      const key = 'test-has-key'
      const value = 'test-value'

      await cacheManager.set(key, value, 300)
      const hasKey = await cacheManager.has(key)
      expect(hasKey).toBe(true)

      const hasNonExistent = await cacheManager.has('non-existent')
      expect(hasNonExistent).toBe(false)
    })

    it('should delete keys', async () => {
      const key = 'delete-test-key'
      await cacheManager.set(key, 'test-value', 300)

      const hasBefore = await cacheManager.has(key)
      expect(hasBefore).toBe(true)

      const deleteResult = await cacheManager.delete(key)
      expect(deleteResult).toBe(true)

      const hasAfter = await cacheManager.has(key)
      expect(hasAfter).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('should get correct rate limiter for different paths', () => {
      expect(getRateLimiterForPath('/api/v1/search')).toBe(
        rateLimitConfigs.search
      )
      expect(getRateLimiterForPath('/api/v1/export/csv')).toBe(
        rateLimitConfigs.export
      )
      expect(getRateLimiterForPath('/api/v1/resources')).toBe(
        rateLimitConfigs.heavy
      )
      expect(getRateLimiterForPath('/api/v1/categories')).toBe(
        rateLimitConfigs.heavy
      )
      expect(getRateLimiterForPath('/api/v1/some-other')).toBe(
        rateLimitConfigs.api
      )
      expect(getRateLimiterForPath('/other-path')).toBe(
        rateLimitConfigs.general
      )
    })

    it('should allow requests within limit', async () => {
      const key = 'test-allowed-key'
      const result = await rateLimitConfigs.general.isAllowed(key)
      expect(result.allowed).toBe(true)
    })

    it('should track remaining requests', async () => {
      const key = 'test-remaining-key'

      // Use up some tokens
      const result1 = await rateLimitConfigs.search.isAllowed(key)
      const result2 = await rateLimitConfigs.search.isAllowed(key)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)

      const status = await rateLimitConfigs.search.getStatus(key)
      expect(status.remaining).toBeLessThanOrEqual(5) // Should have less than initial amount
    })
  })

  describe('Enhanced Cache Manager', () => {
    beforeEach(() => {
      // Clear cache before each test
      cacheManager.clear()
    })

    it('should handle enhanced cache operations', async () => {
      const key = 'enhanced-test-key'
      const value = { data: 'enhanced-test-value' }

      const setResult = await enhancedCacheManager.set(key, value, 300) // 5 minutes TTL
      expect(setResult).toBe(true)

      const getResult = await enhancedCacheManager.get(key)
      expect(getResult).toEqual(value)
    })

    it('should check if key exists in enhanced cache', async () => {
      const key = 'enhanced-exists-test'
      await enhancedCacheManager.set(key, 'test-value', 300)

      const exists = await enhancedCacheManager.has(key)
      expect(exists).toBe(true)

      const notExists = await enhancedCacheManager.has('non-existent')
      expect(notExists).toBe(false)
    })
  })

  describe('Sliding Window Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = new SlidingWindowRateLimiter(
        60000,
        5,
        'Too many requests'
      )
      const result = await limiter.isAllowed('test-key-1')

      expect(result.allowed).toBe(true)
    })

    it('should reject requests that exceed limit', async () => {
      const limiter = new SlidingWindowRateLimiter(100, 2, 'Too many requests')

      // Allow 2 requests
      await limiter.isAllowed('test-key-2')
      await limiter.isAllowed('test-key-2')

      // Third request should be rejected
      const result = await limiter.isAllowed('test-key-2')
      expect(result.allowed).toBe(false)
    })
  })

  describe('Performance Monitoring', () => {
    it('should record and retrieve performance metrics', () => {
      const metrics = {
        endpoint: '/api/test',
        method: 'GET',
        responseTime: 100,
        cacheHit: true,
        statusCode: 200,
        timestamp: Date.now(),
      }

      performanceMonitor.recordMetrics(metrics)
      const summary = performanceMonitor.getAnalyticsSummary(1)

      expect(summary.totalRequests).toBeGreaterThanOrEqual(1)
    })

    it('should calculate cache performance metrics', () => {
      const cachePerf = performanceMonitor.getCachePerformance(1)
      expect(typeof cachePerf.overallHitRate).toBe('number')
      expect(typeof cachePerf.totalRequests).toBe('number')
    })

    it('should get response time percentiles', () => {
      const percentiles = performanceMonitor.getResponseTimePercentiles()
      expect(percentiles).toHaveProperty('p50')
      expect(percentiles).toHaveProperty('p90')
      expect(percentiles).toHaveProperty('p95')
      expect(percentiles).toHaveProperty('p99')
    })
  })
})
