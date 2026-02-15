import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
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

    // Find the submission from database
    const submission = await prisma.submission.findUnique({
      where: { id },
    })

    if (!submission) {
      return sendNotFoundError(event, 'Submission', id)
    }

    return sendSuccessResponse(event, submission)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
