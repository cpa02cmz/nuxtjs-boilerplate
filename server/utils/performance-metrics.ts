import { prisma } from './db'
import { safeJsonParse } from './safeJsonParse'
import type {
  PerformanceMetricData,
  AggregatedMetric,
} from '~/types/performance'
import logger from '~/utils/logger'
// Store a single performance metric
export async function storePerformanceMetric(
  data: PerformanceMetricData
): Promise<void> {
  try {
    await prisma.performanceMetric.create({
      data: {
        timestamp: data.timestamp,
        metricType: data.metricType,
        metricName: data.metricName,
        value: data.value,
        rating: data.rating,
        url: data.url,
        userAgent: data.userAgent,
        connection: data.connection,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
  } catch (error) {
    logger.error('Failed to store performance metric:', error)
    throw error
  }
}

// Query performance metrics
interface QueryFilters {
  startDate: Date
  endDate: Date
  metricType?: string
  metricName?: string
}

interface MetricResult {
  id: string
  timestamp: Date
  metricType: string
  metricName: string
  value: number
  rating: string | null
  url: string | null
  userAgent: string | null
  connection: string | null
  metadata: Record<string, unknown> | null
}

export async function getPerformanceMetrics(
  filters: QueryFilters
): Promise<MetricResult[]> {
  try {
    const where: Record<string, unknown> = {
      timestamp: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    }

    if (filters.metricType) {
      where.metricType = filters.metricType
    }

    if (filters.metricName) {
      where.metricName = filters.metricName
    }

    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    })

    return metrics.map(
      (m: { metadata: string | null; [key: string]: unknown }) => ({
        ...m,
        metadata: m.metadata ? safeJsonParse(m.metadata as string, null) : null,
      })
    ) as MetricResult[]
  } catch (error) {
    logger.error('Failed to fetch performance metrics:', error)
    return []
  }
}

// Get aggregated metrics for time series
interface AggregationFilters {
  startDate: Date
  endDate: Date
  bucketMinutes: number
}

export async function getAggregatedMetrics(
  filters: AggregationFilters
): Promise<AggregatedMetric[]> {
  try {
    // Use raw query for time bucketing (PostgreSQL specific)
    const result = await prisma.$queryRaw<AggregatedMetric[]>`
      SELECT 
        metric_name as "metricName",
        date_trunc('minute', timestamp - interval '1 minute' * (extract(minute from timestamp)::int % ${filters.bucketMinutes})) as "timeBucket",
        AVG(value) as avg,
        MIN(value) as min,
        MAX(value) as max,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY value) as p50,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY value) as p75,
        percentile_cont(0.9) WITHIN GROUP (ORDER BY value) as p90,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY value) as p95,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY value) as p99,
        COUNT(*) as count
      FROM performance_metrics
      WHERE timestamp >= ${filters.startDate}
        AND timestamp <= ${filters.endDate}
        AND metric_type = 'web-vital'
      GROUP BY metric_name, date_trunc('minute', timestamp - interval '1 minute' * (extract(minute from timestamp)::int % ${filters.bucketMinutes}))
      ORDER BY "timeBucket" ASC
    `

    return result
  } catch (error) {
    logger.error('Failed to fetch aggregated metrics:', error)
    return []
  }
}

// Clean up old metrics
export async function cleanupOldMetrics(
  retentionDays: number
): Promise<number> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const result = await prisma.performanceMetric.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    })

    return result.count
  } catch (error) {
    logger.error('Failed to cleanup old metrics:', error)
    return 0
  }
}
