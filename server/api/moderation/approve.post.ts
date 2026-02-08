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

    // Find submission in database
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    })

    if (!submission) {
      return sendNotFoundError(event, 'Submission', submissionId)
    }

    if (submission.status !== 'pending') {
      return sendBadRequestError(
        event,
        `Submission is already ${submission.status}`
      )
    }

    // Parse resource data from submission
    const resourceData = JSON.parse(
      submission.resourceData
    ) as Partial<Resource>

    // Run quality checks
    const qualityChecks = runQualityChecks(resourceData as Resource)
    const qualityScore = calculateQualityScore(qualityChecks)

    // Create the resource in database
    const newResource = await prisma.resource.create({
      data: {
        title: resourceData.title || 'Untitled',
        description: resourceData.description || '',
        url: resourceData.url || '',
        category: resourceData.category || 'Uncategorized',
        pricingModel: resourceData.pricingModel || 'free',
        difficulty: resourceData.difficulty || 'beginner',
        tags: JSON.stringify(resourceData.tags || []),
        technology: JSON.stringify(resourceData.technology || []),
        benefits: JSON.stringify(resourceData.benefits || []),
        submittedBy: submission.submittedBy,
        reviewedBy,
        reviewedAt: new Date(),
        qualityScore,
        status: 'approved',
      },
    })

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'approved',
        reviewedBy,
        reviewedAt: new Date(),
        notes: notes || null,
        qualityScore,
      },
    })

    logInfo(
      `Submission ${submissionId} approved by ${reviewedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: {
        ...newResource,
        tags: JSON.parse(newResource.tags || '[]'),
        technology: JSON.parse(newResource.technology || '[]'),
        benefits: JSON.parse(newResource.benefits || '[]'),
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
