import type { ApiKey } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { getHeader, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendSuccessResponse,
  sendValidationError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { createApiKeySchema } from '~/server/utils/validation-schemas'

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

    await rateLimit(event)
    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = createApiKeySchema.safeParse(body)

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      if (!firstError) {
        return sendValidationError(event, 'unknown', 'Validation failed')
      }
      return sendValidationError(
        event,
        firstError.path[0] as string,
        firstError.message
      )
    }

    const validatedData = validationResult.data

    // Generate API key
    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`

    const newKey: ApiKey = {
      id: `key_${randomUUID()}`,
      name: validatedData.name,
      key: apiKey,
      permissions: validatedData.scopes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: validatedData.expiresIn
        ? new Date(Date.now() + validatedData.expiresIn * 1000).toISOString()
        : undefined,
      active: true,
    }

    webhookStorage.createApiKey(newKey)

    // Return key with actual API key value
    sendSuccessResponse(event, newKey)
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
