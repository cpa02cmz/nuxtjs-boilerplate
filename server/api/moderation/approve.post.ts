// API endpoint for approving submissions
import type { Resource } from '~/types/resource'
import { readBody } from 'h3'
import { z } from 'zod'
import {
  runQualityChecks,
  calculateQualityScore,
} from '~/server/utils/quality-checks'
import { logError, logInfo } from '~/utils/errorLogger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendNotFoundError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { prisma } from '~/server/utils/db'
import { safeJsonParse } from '~/server/utils/safeJsonParse'
import { validationConfig } from '~/configs/validation.config'

// Validation schema for approve submission request
// Flexy hates hardcoded 1000! Using configurable validation limits
const approveSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  reviewedBy: z.string().min(1, 'Reviewer ID is required'),
  notes: z
    .string()
    .max(
      validationConfig.resource.description.maxLength,
      `Notes must be less than ${validationConfig.resource.description.maxLength} characters`
    )
    .optional(),
})

export default defineEventHandler(async event => {
  await rateLimit(event)

  try {
    const body = await readBody(event)

    // Validate input using Zod schema
    const result = approveSubmissionSchema.safeParse(body)
    if (!result.success) {
      const errorMessage =
        result.error.issues[0]?.message || 'Invalid input data'
      return sendBadRequestError(event, errorMessage)
    }

    const { submissionId, reviewedBy, notes } = result.data

    // Fetch submission from database
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return sendNotFoundError(event, 'Submission', submissionId)
    }

    // Parse resource data from JSON safely
    const resourceData = safeJsonParse<Partial<Resource>>(
      submission.resourceData,
      {}
    )

    // Run quality checks on the resource
    const qualityChecks = runQualityChecks(resourceData as Resource)
    const qualityScore = calculateQualityScore(qualityChecks)

    // Create the resource and update submission in a transaction
    const reviewedAt = new Date()
    const [resource] = await prisma.$transaction([
      prisma.resource.create({
        data: {
          title: resourceData.title || '',
          description: resourceData.description || '',
          benefits: JSON.stringify(resourceData.benefits || []),
          url: resourceData.url || '',
          category: resourceData.category || '',
          pricingModel: resourceData.pricingModel || '',
          difficulty: resourceData.difficulty || '',
          tags: JSON.stringify(resourceData.tags || []),
          technology: JSON.stringify(resourceData.technology || []),
          status: 'approved',
          submittedBy: submission.submittedBy,
          reviewedBy,
          reviewedAt,
          qualityScore,
          submission: {
            connect: { id: submissionId },
          },
        },
      }),
      prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'approved',
          reviewedBy,
          reviewedAt,
          notes: notes || '',
        },
      }),
    ])

    logInfo(
      `Submission ${submission.id} approved for user ${submission.submittedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: {
        ...resource,
        benefits: safeJsonParse<string[]>(resource.benefits, []),
        tags: safeJsonParse<string[]>(resource.tags, []),
        technology: safeJsonParse<string[]>(resource.technology, []),
      },
      qualityChecks,
      qualityScore,
    })
  } catch (error) {
    logError(
      'Error approving submission:',
      error instanceof Error ? error : undefined,
      'moderation/approve.post'
    )
    return handleApiRouteError(event, error)
  }
})
