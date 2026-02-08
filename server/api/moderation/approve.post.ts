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

// Validation schema for approve submission request
const approveSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  reviewedBy: z.string().min(1, 'Reviewer ID is required'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
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

    // Parse resource data from JSON
    const resourceData = JSON.parse(
      submission.resourceData
    ) as Partial<Resource>

    // Run quality checks on the resource
    const qualityChecks = runQualityChecks(resourceData as Resource)
    const qualityScore = calculateQualityScore(qualityChecks)

    // Create the resource in database
    const reviewedAt = new Date()
    const resource = await prisma.resource.create({
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
    })

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'approved',
        reviewedBy,
        reviewedAt,
        notes: notes || '',
      },
    })

    logInfo(
      `Submission ${submission.id} approved for user ${submission.submittedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: {
        ...resource,
        benefits: JSON.parse(resource.benefits),
        tags: JSON.parse(resource.tags),
        technology: JSON.parse(resource.technology),
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
