import prisma from './db'
import { analyticsEventSchema } from './validation-schemas'
import { logger } from '~/utils/logger'
import { TIME } from './constants'
import { limitsConfig } from '~/configs/limits.config'

export interface AnalyticsEvent {
  id?: string
  type: string
  resourceId?: string
  category?: string
  url?: string
  userAgent?: string
  ip?: string | null
  timestamp: Date
  deletedAt?: Date | null
  properties?: Record<string, unknown>
}

/**
 * Input type for creating analytics events - accepts multiple timestamp formats
 */
export interface AnalyticsEventInput {
  id?: string
  type: string
  resourceId?: string
  category?: string
  url?: string
  userAgent?: string
  ip?: string | null
  timestamp: Date | string | number
  deletedAt?: Date | string | null
  properties?: Record<string, unknown>
}

/**
 * Normalizes timestamp input to Date object
 */
function normalizeTimestamp(timestamp: Date | string | number): Date {
  if (timestamp instanceof Date) return timestamp
  if (typeof timestamp === 'number') return new Date(timestamp)
  return new Date(timestamp)
}

export async function insertAnalyticsEvent(
  event: AnalyticsEventInput
): Promise<{ success: boolean; error?: string; tableNotFound?: boolean }> {
  try {
    // Normalize timestamp before validation
    const normalizedEvent = {
      ...event,
      timestamp: normalizeTimestamp(event.timestamp),
      deletedAt: event.deletedAt
        ? event.deletedAt instanceof Date
          ? event.deletedAt
          : new Date(event.deletedAt)
        : null,
    }
    const validation = analyticsEventSchema.safeParse(normalizedEvent)

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      logger.error('Analytics event validation failed:', errorMessage)
      return { success: false, error: errorMessage }
    }

    const validatedEvent = validation.data

    await prisma.analyticsEvent.create({
      data: {
        type: validatedEvent.type,
        resourceId: validatedEvent.resourceId || null,
        category: validatedEvent.category || null,
        url: validatedEvent.url || null,
        userAgent: validatedEvent.userAgent || null,
        ip: validatedEvent.ip || null,
        timestamp: new Date(validatedEvent.timestamp),
        properties: validatedEvent.properties
          ? JSON.stringify(validatedEvent.properties)
          : null,
        deletedAt: null,
      },
    })
    return { success: true }
  } catch (error) {
    const errorMessage = String(error)

    // Check if this is a "table not found" error
    // BroCula: Enhanced detection for various Prisma error formats
    const isTableNotFound =
      errorMessage.includes('AnalyticsEvent') &&
      (errorMessage.includes('does not exist') ||
        errorMessage.includes('not found') ||
        errorMessage.includes("Table '") ||
        errorMessage.includes('P2021') || // Prisma code for table not found
        errorMessage.includes('P2003') || // Prisma code for foreign key constraint
        (errorMessage.includes('relation') &&
          errorMessage.includes('not found')))

    // BroCula: Also check for Prisma error code property
    const errObj = error as { code?: string; meta?: { table?: string } }
    const hasPrismaTableError =
      (error && typeof error === 'object' && errObj.code === 'P2021') ||
      (errObj.meta?.table &&
        String(errObj.meta.table).includes('AnalyticsEvent'))

    if (isTableNotFound || hasPrismaTableError) {
      logger.warn(
        'AnalyticsEvent table not found in database - graceful degradation'
      )
      return { success: false, error: errorMessage, tableNotFound: true }
    }

    logger.error('Error inserting analytics event:', error)
    return { success: false, error: errorMessage }
  }
}

function mapDbEventToAnalyticsEvent(event: {
  id: string
  type: string
  resourceId: string | null
  category: string | null
  url: string | null
  userAgent: string | null
  ip: string | null
  timestamp: Date
  deletedAt: Date | null
  properties: string | null
}): AnalyticsEvent {
  return {
    id: event.id,
    type: event.type,
    resourceId: event.resourceId || undefined,
    category: event.category || undefined,
    url: event.url || undefined,
    userAgent: event.userAgent || undefined,
    ip: event.ip || undefined,
    timestamp: event.timestamp,
    deletedAt: event.deletedAt || undefined,
    properties: event.properties ? JSON.parse(event.properties) : undefined,
  }
}

export async function getAnalyticsEventsByDateRange(
  startDate: Date,
  endDate: Date,
  // Flexy hates hardcoded limits! Using config instead
  limit: number = limitsConfig.analytics.maxEventsByDateRange,
  includeDeleted: boolean = false
): Promise<AnalyticsEvent[]> {
  try {
    const where: Record<string, unknown> = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (!includeDeleted) {
      where.deletedAt = null
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting analytics events by date range:', error)
    return []
  }
}

export async function getAnalyticsEventsForResource(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  eventType?: string,
  includeDeleted: boolean = false,
  // Flexy hates hardcoded limits! Using config instead
  limit: number = limitsConfig.analytics.maxEventsForResource
): Promise<AnalyticsEvent[]> {
  try {
    const where: Record<string, unknown> = {
      resourceId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (eventType) {
      where.type = eventType
    }

    if (!includeDeleted) {
      where.deletedAt = null
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting analytics events for resource:', error)
    return []
  }
}

function validateDateRange(startDate: Date, endDate: Date): void {
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    throw new Error('Invalid startDate: must be a valid Date object')
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    throw new Error('Invalid endDate: must be a valid Date object')
  }
  if (startDate > endDate) {
    throw new Error('Invalid date range: startDate must be before endDate')
  }
}

export async function getAggregatedAnalytics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number
  eventsByType: Record<string, number>
  eventsByCategory: Record<string, number>
  resourceViews: Record<string, number>
  dailyTrends: Array<{ date: string; count: number }>
}> {
  try {
    // Validate date inputs to prevent SQL injection via type coercion
    validateDateRange(startDate, endDate)

    const [
      totalEvents,
      eventsByType,
      resourceViews,
      dailyTrends,
      categoryData,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['type'],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          deletedAt: null,
        },
        _count: true,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['resourceId'],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          type: 'resource_view',
          deletedAt: null,
        },
        _count: true,
      }),
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          date(timestamp) as date,
          COUNT(*) as count
        FROM AnalyticsEvent
        WHERE timestamp >= ${startDate} 
          AND timestamp <= ${endDate}
          AND deletedAt IS NULL
        GROUP BY date(timestamp)
        ORDER BY date
      `,
      prisma.analyticsEvent.groupBy({
        by: ['category'],
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          category: {
            not: null,
          },
          deletedAt: null,
        },
        _count: true,
      }),
    ])

    const eventsByTypeMap: Record<string, number> = {}
    eventsByType.forEach((item: { type: string; _count: number }) => {
      eventsByTypeMap[item.type] = item._count
    })

    const resourceViewsMap: Record<string, number> = {}
    resourceViews.forEach(
      (item: { resourceId: string | null; _count: number }) => {
        if (item.resourceId) {
          resourceViewsMap[item.resourceId] = item._count
        }
      }
    )

    const eventsByCategory: Record<string, number> = {}
    categoryData.forEach(
      (item: { category: string | null; _count: number }) => {
        if (item.category) {
          eventsByCategory[item.category] = item._count
        }
      }
    )

    return {
      totalEvents,
      eventsByType: eventsByTypeMap,
      eventsByCategory,
      resourceViews: resourceViewsMap,
      dailyTrends,
    }
  } catch (error) {
    logger.error('Error getting aggregated analytics:', error)
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsByCategory: {},
      resourceViews: {},
      dailyTrends: [],
    }
  }
}

export async function getResourceAnalytics(
  resourceId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  resourceId: string
  viewCount: number
  uniqueVisitors: number
  lastViewed: string
  dailyViews: Array<{ date: string; count: number }>
}> {
  try {
    // Validate date inputs to prevent SQL injection via type coercion
    validateDateRange(startDate, endDate)

    // Validate resourceId format to prevent injection
    if (
      !resourceId ||
      typeof resourceId !== 'string' ||
      resourceId.length > 255
    ) {
      throw new Error(
        'Invalid resourceId: must be a non-empty string with max length 255'
      )
    }

    const [viewCount, uniqueVisitorsGroups, lastViewed, dailyViews] =
      await Promise.all([
        prisma.analyticsEvent.count({
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
            deletedAt: null,
          },
        }),
        prisma.analyticsEvent.groupBy({
          by: ['ip'],
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
            deletedAt: null,
          },
        }),
        prisma.analyticsEvent.findFirst({
          where: {
            resourceId,
            type: 'resource_view',
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
            deletedAt: null,
          },
          orderBy: {
            timestamp: 'desc',
          },
        }),
        prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          date(timestamp) as date,
          COUNT(*) as count
        FROM AnalyticsEvent
        WHERE resourceId = ${resourceId}
          AND type = 'resource_view'
          AND timestamp >= ${startDate}
          AND timestamp <= ${endDate}
          AND deletedAt IS NULL
        GROUP BY date(timestamp)
        ORDER BY date
      `,
      ])

    return {
      resourceId,
      viewCount,
      uniqueVisitors: uniqueVisitorsGroups.length,
      lastViewed: lastViewed
        ? new Date(lastViewed.timestamp).toISOString()
        : new Date().toISOString(),
      dailyViews,
    }
  } catch (error) {
    logger.error('Error getting resource analytics:', error)
    return {
      resourceId,
      viewCount: 0,
      uniqueVisitors: 0,
      lastViewed: new Date().toISOString(),
      dailyViews: [],
    }
  }
}

export async function exportAnalyticsToCsv(
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    const events = await getAnalyticsEventsByDateRange(
      startDate,
      endDate,
      100000
    )

    let csvContent =
      'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'

    for (const event of events) {
      const timestamp =
        typeof event.timestamp === 'string'
          ? event.timestamp
          : typeof event.timestamp === 'number'
            ? new Date(event.timestamp).toISOString()
            : event.timestamp.toISOString()
      const properties = JSON.stringify(event.properties || {}).replace(
        /"/g,
        '""'
      )

      csvContent +=
        [
          `"${event.type || ''}"`,
          `"${event.resourceId || ''}"`,
          `"${event.category || ''}"`,
          `"${event.url || ''}"`,
          `"${event.ip || ''}"`,
          `"${timestamp}"`,
          `"${properties}"`,
        ].join(',') + '\n'
    }

    return csvContent
  } catch (error) {
    logger.error('Error exporting analytics to CSV:', error)
    return 'Type,Resource ID,Category,URL,IP Address,Timestamp,Properties\n'
  }
}

export async function cleanupOldEvents(
  retentionDays: number = 30
): Promise<number> {
  try {
    // Flexy hates hardcoded time calculations! Using TIME constants
    const cutoffDate = new Date(Date.now() - retentionDays * TIME.MS_PER_DAY)
    const deletedAt = new Date()

    const result = await prisma.analyticsEvent.updateMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    })

    return result.count
  } catch (error) {
    logger.error('Error cleaning up old analytics events:', error)
    return 0
  }
}

export async function getSoftDeletedEventsCount(): Promise<number> {
  try {
    return await prisma.analyticsEvent.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    })
  } catch (error) {
    logger.error('Error getting soft-deleted events count:', error)
    return 0
  }
}

export async function getSoftDeletedEvents(
  // Flexy hates hardcoded limits! Using config instead
  limit: number = limitsConfig.analytics.maxSoftDeletedEvents
): Promise<AnalyticsEvent[]> {
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
      take: limit,
    })

    return events.map(mapDbEventToAnalyticsEvent)
  } catch (error) {
    logger.error('Error getting soft-deleted events:', error)
    return []
  }
}

export async function restoreSoftDeletedEvents(
  eventIds: string[]
): Promise<number> {
  try {
    const result = await prisma.analyticsEvent.updateMany({
      where: {
        id: {
          in: eventIds,
        },
        deletedAt: {
          not: null,
        },
      },
      data: {
        deletedAt: null,
      },
    })

    return result.count
  } catch (error) {
    logger.error('Error restoring soft-deleted events:', error)
    return 0
  }
}

export async function exportSoftDeletedEventsToCsv(): Promise<string> {
  try {
    const events = await getSoftDeletedEvents(100000)

    let csvContent =
      'ID,Type,Resource ID,Category,URL,IP Address,Timestamp,Deleted At,Properties\n'

    for (const event of events) {
      const timestamp =
        typeof event.timestamp === 'string'
          ? event.timestamp
          : typeof event.timestamp === 'number'
            ? new Date(event.timestamp).toISOString()
            : event.timestamp.toISOString()
      const deletedAt = event.deletedAt
        ? typeof event.deletedAt === 'string'
          ? event.deletedAt
          : typeof event.deletedAt === 'number'
            ? new Date(event.deletedAt).toISOString()
            : event.deletedAt.toISOString()
        : ''
      const properties = JSON.stringify(event.properties || {}).replace(
        /"/g,
        '""'
      )

      csvContent +=
        [
          `"${event.id || ''}"`,
          `"${event.type || ''}"`,
          `"${event.resourceId || ''}"`,
          `"${event.category || ''}"`,
          `"${event.url || ''}"`,
          `"${event.ip || ''}"`,
          `"${timestamp}"`,
          `"${deletedAt}"`,
          `"${properties}"`,
        ].join(',') + '\n'
    }

    return csvContent
  } catch (error) {
    logger.error('Error exporting soft-deleted events to CSV:', error)
    return 'ID,Type,Resource ID,Category,URL,IP Address,Timestamp,Deleted At,Properties\n'
  }
}

export async function cleanupSoftDeletedEvents(
  backup: boolean = true
): Promise<{ deletedCount: number; backupPath?: string }> {
  try {
    let backupPath: string | undefined

    if (backup) {
      const csvContent = await exportSoftDeletedEventsToCsv()
      const fs = await import('fs/promises')
      const path = await import('path')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupDir = path.join(process.cwd(), 'backups')

      await fs.mkdir(backupDir, { recursive: true })
      backupPath = path.join(backupDir, `soft-deleted-events-${timestamp}.csv`)
      await fs.writeFile(backupPath, csvContent, 'utf-8')
    }

    const result = await prisma.analyticsEvent.deleteMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
    })

    return { deletedCount: result.count, backupPath }
  } catch (error) {
    logger.error('Error cleaning up soft-deleted events:', error)
    return { deletedCount: 0 }
  }
}

/**
 * Store Web Vitals metric in analytics database
 * Stores Core Web Vitals (LCP, INP, CLS, FCP, TTFB) for performance monitoring
 */
export async function storeWebVitalsMetric(report: {
  metric: {
    name: string
    value: number
    rating: string
    delta?: number
    navigationType?: string
  }
  timestamp: string
  url: string
  userAgent: string
  connection?: string
  server?: {
    receivedAt: string
    ip: string
    country: string
  }
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Store web vitals as analytics event with type 'web_vitals'
    const result = await insertAnalyticsEvent({
      type: 'web_vitals',
      url: report.url,
      userAgent: report.userAgent,
      ip: report.server?.ip || null,
      timestamp: report.timestamp,
      properties: {
        metricName: report.metric.name,
        metricValue: report.metric.value,
        metricRating: report.metric.rating,
        metricDelta: report.metric.delta,
        navigationType: report.metric.navigationType,
        connection: report.connection,
        serverReceivedAt: report.server?.receivedAt,
        serverCountry: report.server?.country,
      },
    })

    if (!result.success) {
      // If table doesn't exist, log warning but don't fail
      if (result.tableNotFound) {
        logger.warn(
          'Web Vitals metric dropped: AnalyticsEvent table not found. Run database migrations to enable storage.'
        )
        return { success: true }
      }
      return { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error storing web vitals metric:', error)
    return { success: false, error: String(error) }
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect()
}
