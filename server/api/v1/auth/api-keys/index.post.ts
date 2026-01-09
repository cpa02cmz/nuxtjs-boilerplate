import type { ApiKey } from '~/types/webhook'
import { randomUUID } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)
    const body = await readBody<{
      name: string
      permissions?: string[]
      expiresAt?: string
    }>(event)

    if (!body.name) {
      sendBadRequestError(event, 'Name is required')
      return
    }

    // Generate API key
    const apiKey = `ak_${randomUUID().replace(/-/g, '')}`

    const newKey: ApiKey = {
      id: `key_${randomUUID()}`,
      name: body.name,
      key: apiKey,
      permissions: body.permissions || ['read'],
      createdAt: new Date().toISOString(),
      expiresAt: body.expiresAt,
      active: true,
    }

    webhookStorage.createApiKey(newKey)

    // Return key with the actual API key value
    sendSuccessResponse(event, newKey)
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
