import type { Submission } from '~/types/moderation'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  try {
    // In a real implementation, this would fetch from the database
    // For now, we'll return mock data
    const mockSubmission: Submission = {
      id: id || 'unknown',
      resourceData: {
        title: 'Test Resource',
        description: 'A test resource',
        url: 'https://example.com',
        category: 'Development',
        status: 'pending',
        dateAdded: new Date().toISOString(),
        popularity: 5,
      },
      status: 'pending',
      submittedBy: 'user-001',
      submittedAt: new Date().toISOString(),
      notes: 'Needs review for quality',
    }

    return {
      success: true,
      submission: mockSubmission,
    }
  } catch (error) {
    console.error('Error fetching submission:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch submission',
    })
  }
})
