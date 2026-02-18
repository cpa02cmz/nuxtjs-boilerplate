/**
 * POST /api/validate-url
 *
 * Validate a single URL by checking its HTTP status
 */

import { setResponseHeaders } from 'h3'
import { validateUrl } from '~/utils/urlValidation'
import { logger } from '~/utils/logger'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { validateUrlSchema } from '~/server/utils/validation-schemas'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export {}

export default defineEventHandler(async event => {
  try {
    await rateLimit(event)

    // Deprecation headers for backward compatibility
    setResponseHeaders(event, {
      Sunset: 'Mon, 01 Jun 2026 00:00:00 GMT',
      Deprecation: 'true',
      Link: '</api/v1/validate-url>; rel="successor-version"',
    })

    const body = await readBody(event)

    const validationResult = validateUrlSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessages)
    }

    const validatedBody = validationResult.data

    const urlValidationResult = await validateUrl(validatedBody.url, {
      timeout: validatedBody.timeout,
      retries: validatedBody.retries,
      retryDelay: validatedBody.retryDelay,
      useCircuitBreaker: validatedBody.useCircuitBreaker,
    })

    return sendSuccessResponse(event, { validationResult: urlValidationResult })
  } catch (error) {
    logger.error('Error validating URL:', error)
    return handleApiRouteError(event, error)
  }
})
