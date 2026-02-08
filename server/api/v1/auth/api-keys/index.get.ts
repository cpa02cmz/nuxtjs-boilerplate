import { getHeader, getQuery } from 'h3'
import type { ApiKey } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import {
  sendSuccessResponse,
  sendUnauthorizedError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  // Authentication check - require valid API key
  const apiKey =
    getHeader(event, 'X-API-Key') || (getQuery(event).api_key as string)

  if (!apiKey) {
    return sendUnauthorizedError(event, 'API key required')
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
})
