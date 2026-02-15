import { defineEventHandler, readBody } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody(event)

    if (!body.submissionId) {
      return sendBadRequestError(event, 'Submission ID is required')
    }

    if (!body.reviewedBy) {
      return sendBadRequestError(event, 'Reviewer ID is required')
    }

    if (
      !body.rejectionReason ||
      typeof body.rejectionReason !== 'string' ||
      body.rejectionReason.trim().length === 0
    ) {
      return sendBadRequestError(event, 'Rejection reason is required')
    }

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: body.submissionId },
    })

    if (!existingSubmission) {
      return sendNotFoundError(event, 'Submission', body.submissionId)
    }

    // Update submission in database
    const submission = await prisma.submission.update({
      where: { id: body.submissionId },
      data: {
        status: 'rejected',
        reviewedBy: body.reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: body.rejectionReason,
        notes: body.notes || '',
      },
    })

    logger.info(
      `Notification: Submission ${submission.id} rejected for user ${submission.submittedBy}`
    )

    return sendSuccessResponse(event, {
      message: 'Submission rejected successfully',
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
