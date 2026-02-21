import { useAlternativeSuggestions } from '~/composables/useAlternativeSuggestions'
import { loadServerResources, getResourceMap } from '~/server/utils/server-resources'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const resources = loadServerResources()
    const alternativesEngine = useAlternativeSuggestions(resources || [])

    // Get the resource ID from route parameters
    const resourceId = event.context.params?.id

    if (!resourceId) {
      return sendBadRequestError(event, 'Resource ID is required')
    }

    // Performance-engineer: Use O(1) Map lookup instead of O(n) array.find
    const targetResource = getResourceMap().get(resourceId)
    if (!targetResource) {
      return sendNotFoundError(event, 'Resource', resourceId)
    }

    // Get alternatives for the resource
    const alternatives =
      alternativesEngine.getAlternativesForResource(targetResource)

    const responseData = {
      resourceId,
      alternatives: alternatives.map(alt => ({
        ...alt.resource,
        score: alt.score,
        reason: alt.reason,
      })),
    }

    return sendSuccessResponse(event, responseData)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
