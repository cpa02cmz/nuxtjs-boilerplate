// API endpoint for approving submissions
import type { Submission } from '~/types/submission'
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

// Validation schema for approve submission request
const approveSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  reviewedBy: z.string().min(1, 'Reviewer ID is required'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
})

const mockSubmissions: Submission[] = []
const mockResources: unknown[] = []

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

    const submissionIndex = mockSubmissions.findIndex(
      sub => sub.id === submissionId
    )

    if (submissionIndex === -1) {
      return sendNotFoundError(event, 'Submission', submissionId)
    }

    const submission = mockSubmissions[submissionIndex]
    if (!submission) {
      return sendNotFoundError(event, 'Submission', submissionId)
    }

    submission.status = 'approved'
    submission.reviewedBy = reviewedBy
    submission.reviewedAt = new Date().toISOString()
    submission.notes = notes || ''

    const qualityChecks = runQualityChecks(submission.resourceData as Resource)
    const qualityScore = calculateQualityScore(qualityChecks)

    const newResource = {
      ...submission.resourceData,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      status: 'approved',
      submittedBy: submission.submittedBy,
      reviewedBy: submission.reviewedBy,
      reviewedAt: submission.reviewedAt,
      qualityScore,
      flags: [],
      dateAdded: new Date().toISOString(),
      popularity: 0,
      viewCount: 0,
    } as Record<string, unknown>

    ;(mockResources as unknown[]).push(newResource)

    logInfo(
      `Notification: Submission ${submission.id} approved for user ${submission.submittedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: newResource,
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
