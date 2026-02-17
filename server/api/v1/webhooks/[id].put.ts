import type { UpdateWebhookRequest } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { updateWebhookSchema } from '~/server/utils/validation-schemas'
import {
  sendBadRequestError,
  sendNotFoundError,
  sendSuccessResponse,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'
import { getRouterParam } from 'h3'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 30 requests per minute for webhook updates
    await rateLimit(event, 'webhook-update')

    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    // BUGFIXER FIX #3470: Add proper ID parameter validation
    // Use getRouterParam helper and validate the ID exists
    const id = getRouterParam(event, 'id')
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendBadRequestError(
        event,
        'Webhook ID is required and must be a valid string'
      )
    }

    const body = await readBody<UpdateWebhookRequest>(event)

    const validationResult = updateWebhookSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessages)
    }

    const validatedBody = validationResult.data

    // Find webhook by ID
    const existingWebhook = await webhookStorage.getWebhookById(id)
    if (!existingWebhook) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    // Update webhook
    const updatedWebhook = await webhookStorage.updateWebhook(id, validatedBody)
    if (!updatedWebhook) {
      return sendNotFoundError(event, 'Webhook', id)
    }

    // Return without secret for security
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { secret: _secretValue, ...webhookWithoutSecret } = updatedWebhook

    return sendSuccessResponse(event, webhookWithoutSecret)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
