import { readBody } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { flagResourceSchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = flagResourceSchema.safeParse(body)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessage)
    }

    const { resourceId, reason, reportedBy } = validationResult.data

    // Check if resource exists in database
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return sendNotFoundError(event, 'Resource', resourceId)
    }

    // Create a flag in database
    const newFlag = await prisma.flag.create({
      data: {
        resourceId,
        reason,
        reportedBy,
      },
    })

    return sendSuccessResponse(event, {
      message: 'Resource flagged successfully',
      flag: newFlag,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
