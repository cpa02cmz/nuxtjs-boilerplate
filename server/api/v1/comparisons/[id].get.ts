// API endpoint to get a specific comparison by ID
import type { ResourceComparison } from '~/types/comparison'

export default defineEventHandler(async event => {
  const id = event.context.params?.id

  // In a real implementation, this would fetch from a database
  // For now, return a mock comparison
  const mockComparison: ResourceComparison = {
    id: id || 'unknown',
    resources: ['1', '2'], // Placeholder resource IDs
    criteria: [],
    scores: {},
    createdAt: new Date().toISOString(),
    isPublic: true,
    slug: `comparison-${id}`,
  }

  return mockComparison
})
