import type { Submission } from '~/types/moderation'

export default defineEventHandler(async event => {
  try {
    // Extract query parameters
    const query = getQuery(event)
    const userId = query.userId as string | undefined

    // In a real implementation, this would query the database
    // For now, we'll return mock data
    const mockSubmissions: Submission[] = [
      {
        id: 'sub-001',
        resourceData: {
          title: 'Test Resource',
          description: 'A test resource',
          url: 'https://example.com',
          category: 'Development',
        },
        status: 'approved',
        submittedBy: userId || 'user-001',
        submittedAt: new Date().toISOString(),
        reviewedBy: 'mod-001',
        reviewedAt: new Date().toISOString(),
      },
      {
        id: 'sub-002',
        resourceData: {
          title: 'Another Resource',
          description: 'Another test resource',
          url: 'https://example2.com',
          category: 'Design',
        },
        status: 'pending',
        submittedBy: userId || 'user-001',
        submittedAt: new Date().toISOString(),
      },
    ]

    // Filter by user if specified
    if (userId) {
      const filteredSubmissions = mockSubmissions.filter(
        sub => sub.submittedBy === userId
      )
      return {
        success: true,
        submissions: filteredSubmissions,
        total: filteredSubmissions.length,
        userId: userId,
      }
    }

    return {
      success: true,
      submissions: mockSubmissions,
      total: mockSubmissions.length,
    }
  } catch (error: any) {
    console.error('Error fetching submissions:', error)
    return {
      success: false,
      message: 'An error occurred while fetching submissions',
      submissions: [],
    }
  }
})
