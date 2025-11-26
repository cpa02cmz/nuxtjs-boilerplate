/**
 * Performance monitoring and analytics for API endpoints
 * Tracks response times, cache hit rates, and other performance metrics
 */

interface PerformanceMetrics {
  endpoint: string
  method: string
  responseTime: number
  cacheHit: boolean
  cacheType?: string // 'redis' | 'memory'
  statusCode: number
  timestamp: number
  userAgent?: string
  clientIP?: string
}

interface AnalyticsSummary {
  totalRequests: number
  avgResponseTime: number
  cacheHitRate: number
  topEndpoints: Array<{ endpoint: string; count: number }>
  statusCodes: Record<number, number>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetricsStored: number
  private collectionEnabled: boolean

  constructor(maxMetricsStored = 10000, collectionEnabled = true) {
    this.maxMetricsStored = maxMetricsStored
    this.collectionEnabled = collectionEnabled
  }

  /**
   * Record performance metrics for an API request
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    if (!this.collectionEnabled) return

    this.metrics.push(metrics)

    // Keep only the most recent metrics to prevent memory issues
    if (this.metrics.length > this.maxMetricsStored) {
      this.metrics = this.metrics.slice(-this.maxMetricsStored)
    }
  }

  /**
   * Calculate analytics summary from collected metrics
   */
  getAnalyticsSummary(hoursBack: number = 24): AnalyticsSummary {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime)

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        topEndpoints: [],
        statusCodes: {},
      }
    }

    // Calculate total requests
    const totalRequests = recentMetrics.length

    // Calculate average response time
    const totalResponseTime = recentMetrics.reduce(
      (sum, m) => sum + m.responseTime,
      0
    )
    const avgResponseTime = totalResponseTime / totalRequests

    // Calculate cache hit rate
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length
    const cacheHitRate = (cacheHits / totalRequests) * 100

    // Calculate top endpoints
    const endpointCounts: Record<string, number> = {}
    recentMetrics.forEach(m => {
      endpointCounts[m.endpoint] = (endpointCounts[m.endpoint] || 0) + 1
    })

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Calculate status code distribution
    const statusCodes: Record<number, number> = {}
    recentMetrics.forEach(m => {
      statusCodes[m.statusCode] = (statusCodes[m.statusCode] || 0) + 1
    })

    return {
      totalRequests,
      avgResponseTime,
      cacheHitRate,
      topEndpoints,
      statusCodes,
    }
  }

  /**
   * Get detailed metrics for a specific endpoint
   */
  getEndpointMetrics(
    endpoint: string,
    hoursBack: number = 24
  ): AnalyticsSummary {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000
    const filteredMetrics = this.metrics.filter(
      m => m.endpoint === endpoint && m.timestamp >= cutoffTime
    )

    if (filteredMetrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        topEndpoints: [],
        statusCodes: {},
      }
    }

    const totalRequests = filteredMetrics.length
    const totalResponseTime = filteredMetrics.reduce(
      (sum, m) => sum + m.responseTime,
      0
    )
    const avgResponseTime = totalResponseTime / totalRequests
    const cacheHits = filteredMetrics.filter(m => m.cacheHit).length
    const cacheHitRate = (cacheHits / totalRequests) * 100

    const statusCodes: Record<number, number> = {}
    filteredMetrics.forEach(m => {
      statusCodes[m.statusCode] = (statusCodes[m.statusCode] || 0) + 1
    })

    return {
      totalRequests,
      avgResponseTime,
      cacheHitRate,
      topEndpoints: [{ endpoint, count: totalRequests }],
      statusCodes,
    }
  }

  /**
   * Get cache performance metrics
   */
  getCachePerformance(hoursBack: number = 24): {
    overallHitRate: number
    redisHitRate?: number
    memoryHitRate?: number
    totalRequests: number
    totalCacheHits: number
  } {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime)

    if (recentMetrics.length === 0) {
      return {
        overallHitRate: 0,
        totalRequests: 0,
        totalCacheHits: 0,
      }
    }

    const totalRequests = recentMetrics.length
    const totalCacheHits = recentMetrics.filter(m => m.cacheHit).length
    const overallHitRate = (totalCacheHits / totalRequests) * 100

    // Separate metrics by cache type if available
    const redisMetrics = recentMetrics.filter(m => m.cacheType === 'redis')
    const memoryMetrics = recentMetrics.filter(m => m.cacheType === 'memory')

    const redisHitRate =
      redisMetrics.length > 0
        ? (redisMetrics.filter(m => m.cacheHit).length / redisMetrics.length) *
          100
        : undefined

    const memoryHitRate =
      memoryMetrics.length > 0
        ? (memoryMetrics.filter(m => m.cacheHit).length /
            memoryMetrics.length) *
          100
        : undefined

    return {
      overallHitRate,
      redisHitRate,
      memoryHitRate,
      totalRequests,
      totalCacheHits,
    }
  }

  /**
   * Get performance metrics for API response time percentiles
   */
  getResponseTimePercentiles(
    endpoint?: string,
    hoursBack: number = 24
  ): {
    p50: number
    p90: number
    p95: number
    p99: number
  } {
    const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000
    let metricsToUse = this.metrics.filter(m => m.timestamp >= cutoffTime)

    if (endpoint) {
      metricsToUse = metricsToUse.filter(m => m.endpoint === endpoint)
    }

    if (metricsToUse.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0 }
    }

    // Sort response times in ascending order
    const sortedResponseTimes = metricsToUse
      .map(m => m.responseTime)
      .sort((a, b) => a - b)

    const calculatePercentile = (percentile: number): number => {
      const index =
        Math.ceil((percentile / 100) * sortedResponseTimes.length) - 1
      return sortedResponseTimes[
        Math.max(0, Math.min(index, sortedResponseTimes.length - 1))
      ]
    }

    return {
      p50: calculatePercentile(50),
      p90: calculatePercentile(90),
      p95: calculatePercentile(95),
      p99: calculatePercentile(99),
    }
  }

  /**
   * Export raw metrics for external analysis
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Clear all collected metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Get current metrics storage usage
   */
  getStorageInfo(): {
    currentCount: number
    maxAllowed: number
    percentageUsed: number
  } {
    return {
      currentCount: this.metrics.length,
      maxAllowed: this.maxMetricsStored,
      percentageUsed: (this.metrics.length / this.maxMetricsStored) * 100,
    }
  }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor(
  parseInt(process.env.PERFORMANCE_METRICS_MAX || '10000'),
  process.env.PERFORMANCE_MONITORING_ENABLED !== 'false'
)

export { performanceMonitor, PerformanceMonitor }
