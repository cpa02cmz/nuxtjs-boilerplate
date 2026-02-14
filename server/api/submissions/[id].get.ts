import type { Submission } from '~/types/submission'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

// Mock data for demonstration - in a real application, this would come from a database
const mockSubmissions: Submission[] = []

import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const id = event.context.params?.id as string

    if (!id) {
      return sendBadRequestError(event, 'Submission ID is required')
    }

    // Find the submission
    const submission = mockSubmissions.find(sub => sub.id === id)

    if (!submission) {
      return sendNotFoundError(event, 'Submission', id)
    }

    return sendSuccessResponse(event, submission)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
