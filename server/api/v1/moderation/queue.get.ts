import type { Submission } from '~/types/submission'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { TIME_MS } from '~/configs/time.config'
import { contentConfig } from '~/configs/content.config'
import { moderationQueueQuerySchema } from '~/server/utils/validation-schemas'
import { validateQueryParams } from '~/server/utils/validation-utils'

// Mock data for demonstration - in a real application, this would come from a database
// Flexy hates hardcoded values! Using config for URLs and TIME_MS for time constants
const mockSubmissions = (): Submission[] => [
  {
    id: 'sub_1648729345_abc123',
    resourceData: {
      title: 'Test Resource 1',
      description: 'This is a test resource for moderation',
      url: `${contentConfig.placeholders.defaultUrl}/test1`,
      category: 'Development',
      tags: ['javascript', 'web'],
      pricingModel: 'Free',
      difficulty: 'Beginner',
      technology: ['JavaScript', 'React'],
    },
    status: 'pending',
    submittedBy: 'user123',
    submittedAt: new Date(Date.now() - TIME_MS.DAY).toISOString(), // 1 day ago
  },
  {
    id: 'sub_1648815745_def456',
    resourceData: {
      title: 'Another Test Resource',
      description: 'Another test resource for moderation',
      url: `${contentConfig.placeholders.defaultUrl}/test2`,
      category: 'Design',
      tags: ['ui', 'ux'],
      pricingModel: 'Paid',
      difficulty: 'Intermediate',
      technology: ['Figma', 'Design'],
    },
    status: 'pending',
    submittedBy: 'user456',
    submittedAt: new Date(Date.now() - TIME_MS.TWELVE_HOURS).toISOString(), // 12 hours ago
  },
]

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    // Validate query parameters using Zod schema
    const validatedQuery = validateQueryParams(
      moderationQueueQuerySchema,
      event
    )

    // In a real application, this would query the database for pending submissions
    // with additional filtering and pagination options

    // Extract validated parameters
    const statusFilter = validatedQuery.status
    const categoryFilter = validatedQuery.category
    const limit = validatedQuery.limit
    const offset = validatedQuery.offset

    // Filter submissions based on query parameters
    let filteredSubmissions = [...mockSubmissions()]

    if (statusFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.status === statusFilter
      )
    }

    if (categoryFilter) {
      filteredSubmissions = filteredSubmissions.filter(sub =>
        sub.resourceData?.category
          ?.toLowerCase()
          .includes(categoryFilter.toLowerCase())
      )
    }

    // Apply pagination
    const paginatedSubmissions = filteredSubmissions.slice(
      offset,
      offset + limit
    )

    return sendSuccessResponse(event, {
      queue: paginatedSubmissions,
      total: filteredSubmissions.length,
      limit,
      offset,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
