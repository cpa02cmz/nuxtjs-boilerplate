import { readBody } from 'h3'
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
    const body = await readBody(event)

    // Validate required fields
    if (!body.resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    if (
      !body.reason ||
      typeof body.reason !== 'string' ||
      body.reason.trim().length === 0
    ) {
      return sendBadRequestError(event, 'Flag reason is required')
    }

    if (!body.reportedBy) {
      return sendBadRequestError(event, 'Reporter ID is required')
    }

    // Check if resource exists in database
    const resource = await prisma.resource.findUnique({
      where: { id: body.resourceId },
    })

    if (!resource) {
      return sendNotFoundError(event, 'Resource', body.resourceId)
    }

    // Create a flag in database
    const newFlag = await prisma.flag.create({
      data: {
        resourceId: body.resourceId,
        reason: body.reason,
        reportedBy: body.reportedBy,
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
