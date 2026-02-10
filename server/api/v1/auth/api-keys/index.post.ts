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
import { generateApiKey } from '~/server/utils/api-key-crypto'

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

    // Generate secure API key using cryptographically secure random bytes
    const plaintextKey = generateApiKey()

    const newKey: ApiKey = {
      id: `key_${randomUUID()}`,
      name: validatedData.name,
      key: '', // Will be replaced with plaintext for one-time display
      permissions: validatedData.scopes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: validatedData.expiresIn
        ? new Date(Date.now() + validatedData.expiresIn * 1000).toISOString()
        : undefined,
      active: true,
    }

    // Store the API key with hashing - only the hash is stored in database
    await webhookStorage.createApiKey(newKey, plaintextKey)

    // Return key with actual API key value and security warning
    // This is the ONLY time the full key is shown - never logged or stored in plaintext
    // The key is hashed with bcrypt before storage and only the hash is kept in the database
    sendSuccessResponse(event, {
      ...newKey,
      key: plaintextKey,
      _warning:
        'This is the ONLY time this API key will be shown. Please copy it immediately and store it securely. The key cannot be retrieved again.',
      _securityNote:
        'This key is stored as a secure bcrypt hash in the database. Never share this key or commit it to version control.',
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
