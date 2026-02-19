import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ErrorCode,
  ErrorCategory,
  createApiError,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createRateLimitError,
  createServiceUnavailableError,
  createCircuitBreakerError,
  createExternalServiceError,
  createMethodNotAllowedError,
  getStatusCodeFromErrorCode,
  isClientError,
  isServerError,
} from '~/server/utils/api-error'

vi.mock('~/configs/content.config', () => ({
  contentConfig: {
    errors: {
      authentication: {
        required: 'Authentication required',
        forbidden: 'Access forbidden',
        rateLimit: 'Rate limit exceeded',
      },
    },
  },
}))

describe('api-error utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createApiError', () => {
    it('creates error with required parameters only', () => {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Something went wrong',
        ErrorCategory.INTERNAL
      )

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR)
      expect(error.error.message).toBe('Something went wrong')
      expect(error.error.category).toBe(ErrorCategory.INTERNAL)
      expect(error.error.timestamp).toBeDefined()
      expect(new Date(error.error.timestamp).toISOString()).toBe(
        error.error.timestamp
      )
    })

    it('creates error with optional string details', () => {
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Invalid request',
        ErrorCategory.VALIDATION,
        'Field X is required'
      )

      expect(error.error.details).toBe('Field X is required')
    })

    it('creates error with optional object details', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = createApiError(
        ErrorCode.BAD_REQUEST,
        'Invalid request',
        ErrorCategory.VALIDATION,
        details
      )

      expect(error.error.details).toEqual(details)
    })

    it('creates error with optional requestId', () => {
      const error = createApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'Error',
        ErrorCategory.INTERNAL,
        undefined,
        'req-123'
      )

      expect(error.error.requestId).toBe('req-123')
    })

    it('creates error with optional path', () => {
      const error = createApiError(
        ErrorCode.NOT_FOUND,
        'Not found',
        ErrorCategory.NOT_FOUND,
        undefined,
        undefined,
        '/api/resources/123'
      )

      expect(error.error.path).toBe('/api/resources/123')
    })

    it('creates error with all parameters', () => {
      const details = { reason: 'test' }
      const error = createApiError(
        ErrorCode.CONFLICT,
        'Conflict occurred',
        ErrorCategory.VALIDATION,
        details,
        'req-456',
        '/api/test'
      )

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.CONFLICT)
      expect(error.error.message).toBe('Conflict occurred')
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.error.details).toEqual(details)
      expect(error.error.requestId).toBe('req-456')
      expect(error.error.path).toBe('/api/test')
      expect(error.error.timestamp).toBeDefined()
    })
  })

  describe('createValidationError', () => {
    it('creates validation error with field and message', () => {
      const error = createValidationError('email', 'Invalid email format')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(error.error.message).toBe('Validation failed for field: email')
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
      expect(error.error.details).toEqual({
        field: 'email',
        message: 'Invalid email format',
      })
    })

    it('creates validation error with optional value', () => {
      const error = createValidationError('age', 'Must be positive', -5)

      expect(error.error.details).toEqual({
        field: 'age',
        message: 'Must be positive',
        value: -5,
      })
    })
  })

  describe('createNotFoundError', () => {
    it('creates not found error with resource name only', () => {
      const error = createNotFoundError('User')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.NOT_FOUND)
      expect(error.error.message).toBe('User not found')
      expect(error.error.category).toBe(ErrorCategory.NOT_FOUND)
      expect(error.error.details).toEqual({
        resource: 'User',
        identifier: undefined,
      })
    })

    it('creates not found error with string identifier', () => {
      const error = createNotFoundError('User', 'user-123')

      expect(error.error.message).toBe('User not found: user-123')
      expect(error.error.details).toEqual({
        resource: 'User',
        identifier: 'user-123',
      })
    })

    it('creates not found error with numeric identifier', () => {
      const error = createNotFoundError('Resource', 42)

      expect(error.error.message).toBe('Resource not found: 42')
      expect(error.error.details).toEqual({
        resource: 'Resource',
        identifier: 42,
      })
    })
  })

  describe('createUnauthorizedError', () => {
    it('creates unauthorized error with default message', () => {
      const error = createUnauthorizedError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.UNAUTHORIZED)
      expect(error.error.message).toBe('Authentication required')
      expect(error.error.category).toBe(ErrorCategory.AUTHENTICATION)
    })

    it('creates unauthorized error with custom message', () => {
      const error = createUnauthorizedError('Token expired')

      expect(error.error.message).toBe('Token expired')
    })
  })

  describe('createForbiddenError', () => {
    it('creates forbidden error with default message', () => {
      const error = createForbiddenError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.FORBIDDEN)
      expect(error.error.message).toBe('Access forbidden')
      expect(error.error.category).toBe(ErrorCategory.AUTHORIZATION)
    })

    it('creates forbidden error with custom message', () => {
      const error = createForbiddenError('Admin access required')

      expect(error.error.message).toBe('Admin access required')
    })
  })

  describe('createRateLimitError', () => {
    it('creates rate limit error without retryAfter', () => {
      const error = createRateLimitError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED)
      expect(error.error.message).toBe('Rate limit exceeded')
      expect(error.error.category).toBe(ErrorCategory.RATE_LIMIT)
      expect(error.error.details).toEqual({ retryAfter: undefined })
    })

    it('creates rate limit error with retryAfter', () => {
      const error = createRateLimitError(60)

      expect(error.error.details).toEqual({ retryAfter: 60 })
    })
  })

  describe('createServiceUnavailableError', () => {
    it('creates service unavailable error with service name only', () => {
      const error = createServiceUnavailableError('Database')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.SERVICE_UNAVAILABLE)
      expect(error.error.message).toBe('Service unavailable: Database')
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.details).toEqual({
        service: 'Database',
        details: undefined,
      })
    })

    it('creates service unavailable error with details', () => {
      const error = createServiceUnavailableError('API', 'Connection timeout')

      expect(error.error.details).toEqual({
        service: 'API',
        details: 'Connection timeout',
      })
    })
  })

  describe('createCircuitBreakerError', () => {
    it('creates circuit breaker error with service name only', () => {
      const error = createCircuitBreakerError('PaymentService')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.CIRCUIT_BREAKER_OPEN)
      expect(error.error.message).toBe(
        'Circuit breaker is open for service: PaymentService'
      )
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.details).toEqual({
        service: 'PaymentService',
        lastFailureTime: undefined,
      })
    })

    it('creates circuit breaker error with lastFailureTime', () => {
      const timestamp = '2024-01-15T10:30:00.000Z'
      const error = createCircuitBreakerError('PaymentService', timestamp)

      expect(error.error.details).toEqual({
        service: 'PaymentService',
        lastFailureTime: timestamp,
      })
    })
  })

  describe('createExternalServiceError', () => {
    it('creates external service error', () => {
      const error = createExternalServiceError('Stripe', 'Connection refused')

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR)
      expect(error.error.message).toBe('External service error: Stripe')
      expect(error.error.category).toBe(ErrorCategory.EXTERNAL_SERVICE)
      expect(error.error.details).toEqual({
        service: 'Stripe',
        originalError: 'Connection refused',
      })
    })
  })

  describe('createMethodNotAllowedError', () => {
    it('creates method not allowed error with default message', () => {
      const error = createMethodNotAllowedError()

      expect(error.success).toBe(false)
      expect(error.error.code).toBe(ErrorCode.METHOD_NOT_ALLOWED)
      expect(error.error.message).toBe('Method not allowed')
      expect(error.error.category).toBe(ErrorCategory.VALIDATION)
    })

    it('creates method not allowed error with custom message', () => {
      const error = createMethodNotAllowedError('Only POST method is allowed')

      expect(error.error.message).toBe('Only POST method is allowed')
    })
  })

  describe('getStatusCodeFromErrorCode', () => {
    it('returns 500 for INTERNAL_SERVER_ERROR', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(
        500
      )
    })

    it('returns 400 for BAD_REQUEST', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.BAD_REQUEST)).toBe(400)
    })

    it('returns 401 for UNAUTHORIZED', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.UNAUTHORIZED)).toBe(401)
    })

    it('returns 403 for FORBIDDEN', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.FORBIDDEN)).toBe(403)
    })

    it('returns 404 for NOT_FOUND', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.NOT_FOUND)).toBe(404)
    })

    it('returns 409 for CONFLICT', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.CONFLICT)).toBe(409)
    })

    it('returns 400 for VALIDATION_ERROR', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.VALIDATION_ERROR)).toBe(400)
    })

    it('returns 429 for RATE_LIMIT_EXCEEDED', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(
        429
      )
    })

    it('returns 503 for SERVICE_UNAVAILABLE', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.SERVICE_UNAVAILABLE)).toBe(
        503
      )
    })

    it('returns 504 for GATEWAY_TIMEOUT', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.GATEWAY_TIMEOUT)).toBe(504)
    })

    it('returns 503 for CIRCUIT_BREAKER_OPEN', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(
        503
      )
    })

    it('returns 502 for EXTERNAL_SERVICE_ERROR', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(
        502
      )
    })

    it('returns 405 for METHOD_NOT_ALLOWED', () => {
      expect(getStatusCodeFromErrorCode(ErrorCode.METHOD_NOT_ALLOWED)).toBe(405)
    })
  })

  describe('isClientError', () => {
    it('returns true for 4xx status codes', () => {
      expect(isClientError(ErrorCode.BAD_REQUEST)).toBe(true)
      expect(isClientError(ErrorCode.UNAUTHORIZED)).toBe(true)
      expect(isClientError(ErrorCode.FORBIDDEN)).toBe(true)
      expect(isClientError(ErrorCode.NOT_FOUND)).toBe(true)
      expect(isClientError(ErrorCode.CONFLICT)).toBe(true)
      expect(isClientError(ErrorCode.VALIDATION_ERROR)).toBe(true)
      expect(isClientError(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(true)
      expect(isClientError(ErrorCode.METHOD_NOT_ALLOWED)).toBe(true)
    })

    it('returns false for 5xx status codes', () => {
      expect(isClientError(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(false)
      expect(isClientError(ErrorCode.SERVICE_UNAVAILABLE)).toBe(false)
      expect(isClientError(ErrorCode.GATEWAY_TIMEOUT)).toBe(false)
      expect(isClientError(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(false)
      expect(isClientError(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('returns true for 5xx status codes', () => {
      expect(isServerError(ErrorCode.INTERNAL_SERVER_ERROR)).toBe(true)
      expect(isServerError(ErrorCode.SERVICE_UNAVAILABLE)).toBe(true)
      expect(isServerError(ErrorCode.GATEWAY_TIMEOUT)).toBe(true)
      expect(isServerError(ErrorCode.CIRCUIT_BREAKER_OPEN)).toBe(true)
      expect(isServerError(ErrorCode.EXTERNAL_SERVICE_ERROR)).toBe(true)
    })

    it('returns false for 4xx status codes', () => {
      expect(isServerError(ErrorCode.BAD_REQUEST)).toBe(false)
      expect(isServerError(ErrorCode.UNAUTHORIZED)).toBe(false)
      expect(isServerError(ErrorCode.FORBIDDEN)).toBe(false)
      expect(isServerError(ErrorCode.NOT_FOUND)).toBe(false)
      expect(isServerError(ErrorCode.CONFLICT)).toBe(false)
      expect(isServerError(ErrorCode.VALIDATION_ERROR)).toBe(false)
      expect(isServerError(ErrorCode.RATE_LIMIT_EXCEEDED)).toBe(false)
      expect(isServerError(ErrorCode.METHOD_NOT_ALLOWED)).toBe(false)
    })
  })
})
