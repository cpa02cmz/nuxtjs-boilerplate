// API endpoint to save a comparison
import type { ResourceComparison } from '~/types/comparison'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  // Validate the incoming comparison data
  if (
    !body.resources ||
    !Array.isArray(body.resources) ||
    body.resources.length < 2 ||
    body.resources.length > 4
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comparison must include between 2 and 4 resources',
    })
  }

  // Create a new comparison object
  const newComparison: ResourceComparison = {
    id: `cmp_${Date.now()}`, // In a real implementation, use proper ID generation
    resources: body.resources,
    criteria: body.criteria || [],
    scores: body.scores || {},
    createdAt: new Date().toISOString(),
    createdBy: body.createdBy || undefined,
    isPublic: body.isPublic || false,
    slug: body.slug || undefined,
  }

  // In a real implementation, this would save to a database
  // For now, we'll just return the created comparison

  return newComparison
})
