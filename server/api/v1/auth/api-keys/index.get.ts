import { getHeader, defineEventHandler } from 'h3'
import type { ApiKey } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 10 requests per minute for API key listing (requires auth)
    await rateLimit(event)

    // Security: Only accept API key via header, never via query parameter
    // Query parameters expose keys in server logs, browser history, and referrer headers
    const apiKey = getHeader(event, 'X-API-Key')

    if (!apiKey) {
      return sendUnauthorizedError(
        event,
        'API key required via X-API-Key header. Query parameter authentication is not supported for security reasons.'
      )
    }

    // Verify API key exists and is active
    const storedKey = await webhookStorage.getApiKeyByValue(apiKey)

    if (!storedKey || !storedKey.active) {
      return sendUnauthorizedError(event, 'Invalid or inactive API key')
    }

    // This would typically filter by user in a real implementation
    // For now, return all keys
    const apiKeys = await webhookStorage.getAllApiKeys()
    const keysWithoutSecrets = apiKeys.map((apiKeyItem: ApiKey) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { key, ...rest } = apiKeyItem
      return rest
    })

    return sendSuccessResponse(event, {
      data: keysWithoutSecrets,
      count: keysWithoutSecrets.length,
    })
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
