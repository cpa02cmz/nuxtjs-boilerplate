import type { ModerationQueueFilter } from '~/types/moderation'

export default defineEventHandler(async event => {
  // Extract query parameters for filtering
  const query = getQuery(event)

  // Apply filters based on query parameters
  const filters: ModerationQueueFilter = {
    status: query.status as
      | 'pending'
      | 'approved'
      | 'rejected'
      | 'deprecated'
      | undefined,
    searchQuery: query.search as string | undefined,
    flaggedOnly: query.flaggedOnly === 'true',
  }

  // Extract date range if provided
  if (query.dateFrom || query.dateTo) {
    filters.dateRange = {
      start: (query.dateFrom as string) || '',
      end: (query.dateTo as string) || '',
    }
  }

  try {
    // In a real implementation, this would connect to a database
    // For now, we'll return mock data structure
    const mockSubmissions = [
      {
        id: '1',
        resourceData: {
          id: 'res-001',
          title: 'Test Resource',
          description: 'A test resource for moderation',
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
      },
      {
        id: '2',
        resourceData: {
          id: 'res-002',
          title: 'Another Resource',
          description: 'Another test resource',
          url: 'https://example2.com',
          category: 'Design',
          status: 'pending',
          dateAdded: new Date().toISOString(),
          popularity: 3,
        },
        status: 'pending',
        submittedBy: 'user-002',
        submittedAt: new Date().toISOString(),
      },
    ]

    // Apply filters to mock data
    let filteredSubmissions = mockSubmissions

    if (filters.status) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.status === filters.status
      )
    }

    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      filteredSubmissions = filteredSubmissions.filter(
        sub =>
          sub.resourceData.title.toLowerCase().includes(searchLower) ||
          sub.resourceData.description.toLowerCase().includes(searchLower) ||
          sub.resourceData.category.toLowerCase().includes(searchLower)
      )
    }

    if (filters.flaggedOnly) {
      filteredSubmissions = filteredSubmissions.filter(
        sub => sub.resourceData.flags && sub.resourceData.flags.length > 0
      )
    }

    return {
      submissions: filteredSubmissions,
      total: filteredSubmissions.length,
      page: 1,
      limit: 20,
      filters: filters,
    }
  } catch (error) {
    console.error('Error fetching moderation queue:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch moderation queue',
    })
  }
})
