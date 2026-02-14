import { getHeader, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendNotFoundError,
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    // Authentication check - require valid API key
    const authApiKey =
      getHeader(event, 'X-API-Key') || (getQuery(event).api_key as string)

    if (!authApiKey) {
      return sendUnauthorizedError(event, 'API key required')
    }

    // Verify API key exists and is active
    const storedKey = await webhookStorage.getApiKeyByValue(authApiKey)

    if (!storedKey || !storedKey.active) {
      return sendUnauthorizedError(event, 'Invalid or inactive API key')
    }

    const id = event.context.params?.id as string

    if (!id) {
      return sendNotFoundError(event, 'API Key', 'id')
    }

    // Find API key by ID
    const apiKey = webhookStorage.getApiKeyById(id)
    if (!apiKey) {
      return sendNotFoundError(event, 'API Key', id)
    }

    // Remove API key
    const deleted = webhookStorage.deleteApiKey(id)
    if (!deleted) {
      return sendNotFoundError(event, 'API Key', id)
    }

    return sendSuccessResponse(event, {
      message: 'API key deleted successfully',
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
