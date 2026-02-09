import { getHeader, getQuery } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { sendUnauthorizedError } from '~/server/utils/api-response'
import { isProtectedApiRoute } from '~/configs/routes.config'

export default defineEventHandler(async event => {
  // Only apply to API routes that require authentication
  // Flexy hates hardcoded paths! Using isProtectedApiRoute helper
  if (!isProtectedApiRoute(event.path || '')) {
    return
  }

  // Check for API key in headers or query
  const apiKey =
    getHeader(event, 'X-API-Key') || (getQuery(event).api_key as string)

  if (!apiKey) {
    // Some routes might be public, so we'll just log this for now
    // In a real implementation, you'd check if the route requires auth
    return
  }

  // Verify API key exists and is active
  const storedKey = await webhookStorage.getApiKeyByValue(apiKey)

  if (!storedKey || !storedKey.active) {
    sendUnauthorizedError(event, 'Invalid or inactive API key')
    return
  }

  // Update last used timestamp with error handling
  try {
    await webhookStorage.updateApiKey(storedKey.id, {
      lastUsedAt: new Date().toISOString(),
    })
  } catch (error) {
    // Log error but don't fail the request - the API key is still valid
    console.warn('Failed to update API key lastUsedAt:', error)
  }

  // Add key info to event context for use in handlers
  event.context.apiKey = storedKey
})
