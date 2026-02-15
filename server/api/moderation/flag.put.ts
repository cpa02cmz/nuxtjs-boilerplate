import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { prisma } from '~/server/utils/db'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { validateBody, z } from '~/server/utils/validation'

// Zod schema for flag creation - Flexy hates manual validation!
const flagSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  reason: z
    .string()
    .min(1, 'Flag reason is required')
    .max(500, 'Reason must be less than 500 characters'),
  reportedBy: z.string().min(1, 'Reporter ID is required'),
})

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Validate request body using Zod schema
    const body = await validateBody(event, flagSchema)
    if (!body) {
      return // Error response already sent by validateBody
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
