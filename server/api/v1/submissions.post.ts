// For Nuxt 3, we'll use built-in storage system instead of file system directly
import { defineEventHandler, readBody } from 'h3'
import { randomUUID } from 'crypto'
// Security Engineer: Add rate limiting to prevent spam/abuse attacks (CWE-770)
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { logger } from '~/utils/logger'
import { prisma } from '~/server/utils/db'
import type { Submission } from '~/types/submission'
import {
  sendSuccessResponse,
  sendValidationError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { createSubmissionSchema } from '~/server/utils/validation-schemas'

export default defineEventHandler(async event => {
  // Security Engineer: Rate limit submission creation to prevent spam/abuse (CWE-770)
  await rateLimit(event, 'submission-create')

  try {
    // Parse request body
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = createSubmissionSchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      if (!firstError) {
        return sendValidationError(event, 'unknown', 'Validation failed')
      }
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message,
        (body as Record<string, unknown>)[firstError.path[0] as string]
      )
    }

    const validatedData = validationResult.data

    // Create a submission object with metadata
    // Use cryptographically secure UUID for ID generation (fixes CVE)
    const submission: Submission = {
      id: `sub_${randomUUID()}`,
      resourceData: {
        title: validatedData.title.trim(),
        description: validatedData.description.trim(),
        url: validatedData.url.trim(),
        category: validatedData.category.trim(),
        tags: validatedData.tags,
        pricingModel: validatedData.pricingModel,
        difficulty: validatedData.difficulty,
        technology: validatedData.technology,
        benefits: validatedData.benefits,
      },
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: 'anonymous',
    }

    // Persist submission to database
    await prisma.submission.create({
      data: {
        id: submission.id,
        resourceData: JSON.stringify(submission.resourceData),
        status: submission.status,
        submittedBy: submission.submittedBy,
      },
    })
    logger.info(`Resource submitted and saved: ${submission.id}`, {
      submission,
    })

    return sendSuccessResponse(event, {
      message: 'Resource submitted successfully',
      submissionId: submission.id,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
