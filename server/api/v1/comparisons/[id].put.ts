// API endpoint to update a specific comparison by ID
import type { ResourceComparison } from '~/types/comparison'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  const body = await readBody(event)

  // Validate the incoming comparison data
  if (
    body.resources &&
    (!Array.isArray(body.resources) ||
      body.resources.length < 2 ||
      body.resources.length > 4)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Comparison must include between 2 and 4 resources',
    })
  }

  // In a real implementation, this would update in a database
  // For now, return the updated comparison object
  const updatedComparison: ResourceComparison = {
    id: id || 'unknown',
    resources: body.resources || [],
    criteria: body.criteria || [],
    scores: body.scores || {},
    createdAt: body.createdAt || new Date().toISOString(),
    createdBy: body.createdBy || undefined,
    isPublic: body.isPublic !== undefined ? body.isPublic : true,
    slug: body.slug || `comparison-${id}`,
  }

  return updatedComparison
})
