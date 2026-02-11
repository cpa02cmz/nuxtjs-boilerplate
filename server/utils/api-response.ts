import type { H3Event } from 'h3'
import { setResponseStatus } from 'h3'
import { randomUUID } from 'node:crypto'
import type { ApiError } from '~/server/utils/api-error'
import {
  ErrorCode,
  ErrorCategory,
  createApiError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createRateLimitError,
  createMethodNotAllowedError,
  getStatusCodeFromErrorCode,
} from '~/server/utils/api-error'
import { sanitizeErrorMessage } from './api-key-security'

export function sendApiError(event: H3Event, error: ApiError): void {
  const statusCode = getStatusCodeFromErrorCode(error.error.code)
  setResponseStatus(event, statusCode)
  event.node.res?.setHeader('Content-Type', 'application/json')

  // Add request ID if not present
  if (!error.error.requestId) {
    error.error.requestId = generateRequestId()
  }

  // Add path if not present
  if (!error.error.path && event.path) {
    error.error.path = event.path
  }

  event.node.res?.end(JSON.stringify(error))
}

export function sendSuccessResponse<T>(
  event: H3Event,
  data: T,
  status: number = 200
): void {
  setResponseStatus(event, status)
  event.node.res?.setHeader('Content-Type', 'application/json')

  // For logging purposes, create a masked version of the data
  // The actual response still contains the full data
  event.node.res?.end(JSON.stringify({ success: true, data }))
}

export function sendBadRequestError(
  event: H3Event,
  message: string,
  details?: string | Record<string, unknown>
): void {
  const error = createApiError(
    ErrorCode.BAD_REQUEST,
    message,
    ErrorCategory.VALIDATION,
    details
  )
  sendApiError(event, error)
}

export function sendValidationError(
  event: H3Event,
  field: string,
  message: string,
  value?: unknown
): void {
  const error = createValidationError(field, message, value)
  sendApiError(event, error)
}

export function sendNotFoundError(
  event: H3Event,
  resource: string,
  identifier?: string
): void {
  const error = createNotFoundError(resource, identifier)
  sendApiError(event, error)
}

export function sendUnauthorizedError(
  event: H3Event,
  message: string = 'Authentication required'
): void {
  const error = createUnauthorizedError(message)
  sendApiError(event, error)
}

export function sendForbiddenError(
  event: H3Event,
  message: string = 'Access forbidden'
): void {
  const error = createForbiddenError(message)
  sendApiError(event, error)
}

export function sendRateLimitError(event: H3Event, retryAfter?: number): void {
  const error = createRateLimitError(retryAfter)

  if (retryAfter) {
    event.node.res?.setHeader('Retry-After', retryAfter.toString())
  }

  sendApiError(event, error)
}

export function sendMethodNotAllowedError(
  event: H3Event,
  message: string = 'Method not allowed'
): void {
  const error = createMethodNotAllowedError(message)
  sendApiError(event, error)
}

export function handleApiRouteError(event: H3Event, error: unknown): void {
  const requestId = generateRequestId()

  if (error instanceof Error) {
    // Sanitize error message to ensure API keys are never exposed
    const sanitizedMessage =
      process.env.NODE_ENV === 'development'
        ? sanitizeErrorMessage(error.message)
        : undefined

    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An internal server error occurred',
      ErrorCategory.INTERNAL,
      sanitizedMessage,
      requestId,
      event.path
    )
    sendApiError(event, apiError)
  } else {
    const apiError = createApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      ErrorCategory.INTERNAL,
      undefined,
      requestId,
      event.path
    )
    sendApiError(event, apiError)
  }
}

function generateRequestId(): string {
  return `req_${randomUUID()}`
}

export function wrapApiHandler<T>(handler: (_event: H3Event) => Promise<T>) {
  return async (event: H3Event): Promise<T> => {
    try {
      return await handler(event)
    } catch (error) {
      handleApiRouteError(event, error)
      throw error
    }
  }
}
