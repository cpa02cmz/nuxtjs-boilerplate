import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import { exportAnalyticsToCsv } from '~/server/utils/analytics-db'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { handleApiRouteError } from '~/server/utils/api-response'
import { TIME_CONSTANTS } from '~/utils/constants'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const query = getQuery(event)

    const startDate = query.startDate
      ? new Date(query.startDate as string)
      : new Date(Date.now() - TIME_CONSTANTS.DAY_MS * 30)
    const endDate = query.endDate
      ? new Date(query.endDate as string)
      : new Date()

    const csvContent = await exportAnalyticsToCsv(startDate, endDate)

    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="analytics-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv"`
    )

    setResponseHeader(event, 'Content-Length', Buffer.byteLength(csvContent))

    return csvContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
