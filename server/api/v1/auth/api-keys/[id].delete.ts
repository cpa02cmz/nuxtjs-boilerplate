import { getHeader } from 'h3'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendNotFoundError,
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    // Security Engineer: Rate limit API key deletion to prevent abuse (CWE-770)
    // This protects against brute force and DoS attacks on this sensitive endpoint
    await rateLimit(event, 'api-key-delete')

    // Security: Only accept API key via header, never via query parameter
    // Query parameters expose keys in server logs, browser history, and referrer headers
    const authApiKey = getHeader(event, 'X-API-Key')

    if (!authApiKey) {
      return sendUnauthorizedError(
        event,
        'API key required via X-API-Key header. Query parameter authentication is not supported for security reasons.'
      )
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
