import { defineEventHandler } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
import {
  sendSuccessResponse,
  sendNotFoundError,
  handleApiRouteError,
  sendUnauthorizedError,
  sendForbiddenError,
} from '~/server/utils/api-response'
import { logger } from '~/utils/logger'
import { moderationRejectionSchema } from '~/server/utils/validation-schemas'
import { validateRequestBody } from '~/server/utils/validation-utils'

export default defineEventHandler(async event => {
  await rateLimit(event)

  // SECURITY FIX: Add authentication check for moderation access
  const apiKey = event.context.apiKey
  if (!apiKey) {
    return sendUnauthorizedError(
      event,
      'Authentication required for moderation'
    )
  }

  // Check for moderation permissions
  const hasModerationPermission =
    apiKey.permissions?.includes('moderation:reject') ||
    apiKey.permissions?.includes('moderation:approve') ||
    apiKey.permissions?.includes('admin') ||
    apiKey.role === 'moderator' ||
    apiKey.role === 'admin'

  if (!hasModerationPermission) {
    return sendForbiddenError(
      event,
      'Insufficient permissions for moderation rejection'
    )
  }

  try {
    // BugFixer: Fixed Issue #3903 - Use schema validation instead of manual validation
    const body = await validateRequestBody(moderationRejectionSchema, event)

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
