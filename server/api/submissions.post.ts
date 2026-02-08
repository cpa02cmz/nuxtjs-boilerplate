// For Nuxt 3, we'll use built-in storage system instead of file system directly
import { defineEventHandler, readBody } from 'h3'
import { logger } from '~/utils/logger'
import {
  sendSuccessResponse,
  sendValidationError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { createSubmissionSchema } from '~/server/utils/validation-schemas'
import { prisma } from '~/server/utils/db'

export default defineEventHandler(async event => {
  try {
    // Parse request body
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = createSubmissionSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      if (!firstError) {
        return sendValidationError(
          event,
          'general',
          'Validation failed',
          undefined
        )
      }
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (body as Record<string, unknown>)[firstError.path[0] as string]
      )
    }

    const validatedData = validationResult.data

    // Create resource data object
    const resourceData = {
      title: validatedData.title.trim(),
      description: validatedData.description.trim(),
      url: validatedData.url.trim(),
      category: validatedData.category.trim(),
      tags: validatedData.tags,
      pricingModel: validatedData.pricingModel,
      difficulty: validatedData.difficulty,
      technology: validatedData.technology,
      benefits: validatedData.benefits,
    }

    // Save submission to database
    const submission = await prisma.submission.create({
      data: {
        resourceData: JSON.stringify(resourceData),
        status: 'pending',
        submittedBy: 'anonymous',
      },
    })

    logger.info(`Resource submitted: ${submission.id}`, {
      submissionId: submission.id,
    })

    return sendSuccessResponse(event, {
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
