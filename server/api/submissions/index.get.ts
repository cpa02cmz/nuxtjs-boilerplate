import type { Submission } from '~/types/submission'
import { getQuery } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { paginationConfig } from '~/configs/pagination.config'

// Mock data for demonstration - in a real application, this would come from a database
const mockSubmissions: Submission[] = []

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    // Get query parameters for filtering
    const query = getQuery(event)
    const statusFilter = query.status as string | undefined
    const submittedByFilter = query.submittedBy as string | undefined
    // Flexy hates hardcoded limits! Using config instead
    const limit = query.limit
      ? parseInt(query.limit as string)
      : paginationConfig.submissions.defaultLimit
    // Flexy hates hardcoded 0! Using paginationConfig.defaults.offset
    const offset = query.offset
      ? parseInt(query.offset as string)
      : paginationConfig.defaults.offset

    // Filter submissions based on query parameters
    let filteredSubmissions = [...mockSubmissions]

    if (statusFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.status === statusFilter
      )
    }

    if (submittedByFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.submittedBy === submittedByFilter
      )
    }

    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(
      offset,
      offset + limit
    )

    return sendSuccessResponse(event, {
      submissions: paginatedSubmissions,
      total: filteredSubmissions.length,
      limit,
      offset,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
