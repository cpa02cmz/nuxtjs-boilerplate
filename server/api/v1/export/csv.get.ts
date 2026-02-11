import { defineEventHandler, setResponseHeader } from 'h3'
import type { Resource } from '~/types/resource'
import { resourcesToCsv } from '~/utils/csv'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { handleApiRouteError } from '~/server/utils/api-response'
import { contentConfig } from '~/configs/content.config'

/**
 * GET /api/v1/export/csv
 *
 * Export all resources as CSV format
 */
export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    // Import resources from JSON
    const resourcesModule = await import(contentConfig.paths.resourcesData)
    const resources: Resource[] = resourcesModule.default || resourcesModule

    // Convert resources to CSV
    const csvContent = resourcesToCsv(resources)

    // Set appropriate content type for CSV
    setResponseHeader(event, 'Content-Type', 'text/csv')
    setResponseHeader(
      event,
      'Content-Disposition',
      'attachment; filename="resources.csv"'
    )

    return csvContent
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
