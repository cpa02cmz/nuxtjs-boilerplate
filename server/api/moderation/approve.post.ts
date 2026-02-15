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
import { executeTransaction } from '~/server/utils/db'
import { safeJsonParse } from '~/server/utils/safeJsonParse'
import { validationConfig } from '~/configs/validation.config'
import { databaseConfig } from '~/configs/database.config'

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
    const reviewedAt = new Date()

    // Use interactive transaction with retry logic for atomic approval process
    // Prevents race conditions where submission is modified between fetch and update
    const approvalResult = await executeTransaction(
      async tx => {
        // Fetch submission with implicit lock (SQLite doesn't support explicit row locks,
        // but the transaction ensures atomicity)
        const submission = await tx.submission.findUnique({
          where: { id: submissionId },
        })

        if (!submission) {
          return { error: 'not_found', message: 'Submission not found' }
        }

        // Check if already approved (idempotency check)
        if (submission.status === 'approved') {
          return {
            error: 'already_approved',
            message: 'Submission has already been approved',
          }
        }

        // Check if submission is in a valid state for approval
        if (submission.status !== 'pending') {
          return {
            error: 'invalid_state',
            message: `Cannot approve submission with status: ${submission.status}`,
          }
        }

        // Parse resource data from JSON safely
        const resourceData = safeJsonParse<Partial<Resource>>(
          submission.resourceData,
          {}
        )

        // Run quality checks on the resource (inside transaction for consistency)
        const qualityChecks = runQualityChecks(resourceData as Resource)
        const qualityScore = calculateQualityScore(qualityChecks)

        // Create the resource
        const resource = await tx.resource.create({
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
        const updatedSubmission = await tx.submission.update({
          where: { id: submissionId },
          data: {
            status: 'approved',
            reviewedBy,
            reviewedAt,
            notes: notes || '',
          },
        })

        return {
          error: null,
          resource,
          submission: updatedSubmission,
          qualityChecks,
          qualityScore,
        }
      },
      // Flexy hates hardcoded values! Using config for transaction options
      {
        timeout: databaseConfig.transaction.moderation.timeoutMs,
        maxRetries: databaseConfig.transaction.moderation.maxRetries,
        isolationLevel: databaseConfig.transaction.moderation.isolationLevel,
      },
      'approveSubmission'
    )

    // Handle transaction errors
    if (approvalResult.error === 'not_found') {
      return sendNotFoundError(event, 'Submission', submissionId)
    }

    if (approvalResult.error === 'already_approved') {
      return sendBadRequestError(event, approvalResult.message)
    }

    if (approvalResult.error === 'invalid_state') {
      return sendBadRequestError(event, approvalResult.message)
    }

    if (approvalResult.error) {
      throw new Error(approvalResult.message)
    }

    logInfo(
      `Submission ${submissionId} approved for user ${approvalResult.submission?.submittedBy}`,
      undefined,
      'moderation/approve.post'
    )

    return sendSuccessResponse(event, {
      message: 'Submission approved successfully',
      resource: {
        ...approvalResult.resource,
        benefits: safeJsonParse<string[]>(
          approvalResult.resource?.benefits || '[]',
          []
        ),
        tags: safeJsonParse<string[]>(
          approvalResult.resource?.tags || '[]',
          []
        ),
        technology: safeJsonParse<string[]>(
          approvalResult.resource?.technology || '[]',
          []
        ),
      },
      qualityChecks: approvalResult.qualityChecks,
      qualityScore: approvalResult.qualityScore,
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
