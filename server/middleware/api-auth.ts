import { getHeader, createError } from 'h3'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { sendUnauthorizedError } from '~/server/utils/api-response'
import { isProtectedApiRoute } from '~/configs/routes.config'
import { logger } from '~/utils/logger'

export default defineEventHandler(async event => {
  // Only apply to API routes that require authentication
  // Flexy hates hardcoded paths! Using isProtectedApiRoute helper
  if (!isProtectedApiRoute(event.path || '')) {
    return
  }

  // P1 Security Fix: Require authentication for protected routes
  // Issue #3131: Export endpoints lack authentication exposing sensitive data
  // Check for API key in headers only (security fix: removed query parameter support)
  // Issue #2215: API keys in query parameters expose credentials in server logs
  const apiKey = getHeader(event, 'X-API-Key')

  if (!apiKey) {
    // P1 Fix: Protected routes REQUIRE authentication - no early return
    logger.warn(
      `Unauthorized access attempt to protected route: ${event.path}`,
      {
        path: event.path,
        method: event.method,
        ip: event.node.req.socket.remoteAddress,
        timestamp: new Date().toISOString(),
      }
    )
    sendUnauthorizedError(
      event,
      'Authentication required. Please provide a valid X-API-Key header.'
    )
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: API key required',
    })
  }

  // Verify API key exists and is active
  const storedKey = await webhookStorage.getApiKeyByValue(apiKey)

  if (!storedKey || !storedKey.active) {
    logger.warn(`Invalid API key attempt on protected route: ${event.path}`, {
      path: event.path,
      method: event.method,
      ip: event.node.req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    })
    sendUnauthorizedError(event, 'Invalid or inactive API key')
    // Halt request processing to prevent API handler execution
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or inactive API key',
    })
  }

  // P1 Security Fix: Add audit logging for sensitive operations
  if (event.path?.includes('/export')) {
    logger.info(`Data export accessed`, {
      path: event.path,
      method: event.method,
      apiKeyId: storedKey.id,
      apiKeyName: storedKey.name,
      ip: event.node.req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    })
  }

  // Update last used timestamp with error handling
  try {
    await webhookStorage.updateApiKey(storedKey.id, {
      lastUsedAt: new Date().toISOString(),
    })
  } catch (error) {
    // Log error but don't fail the request - the API key is still valid
    logger.warn('Failed to update API key lastUsedAt:', error)
  }

  // Add key info to event context for use in handlers
  event.context.apiKey = storedKey
})
