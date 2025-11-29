import type { SubmissionReview } from '~/types/moderation'

export default defineEventHandler(async event => {
  try {
    const body = (await readBody(event)) as SubmissionReview

    // Validate required fields
    if (!body.submissionId || !body.reviewerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'submissionId and reviewerId are required',
      })
    }

    if (body.action !== 'approve') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action, expected "approve"',
      })
    }

    // In a real implementation, this would update the database
    // For now, we'll return a mock response
    return {
      success: true,
      submissionId: body.submissionId,
      reviewedAt: new Date().toISOString(),
      reviewerId: body.reviewerId,
      notes: body.notes,
    }
  } catch (error: any) {
    console.error('Error approving submission:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to approve submission',
    })
  }
})
