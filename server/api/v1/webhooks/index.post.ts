import type { CreateWebhookRequest, Webhook } from '~/types/webhook'
import { randomUUID, randomBytes } from 'node:crypto'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { createWebhookSchema } from '~/server/utils/validation-schemas'
import {
  sendSuccessResponse,
  sendBadRequestError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { securityConfig } from '~/configs/security.config'
import { rateLimit } from '~/server/utils/enhanced-rate-limit'

export default defineEventHandler(async event => {
  try {
    // Apply rate limiting: 10 requests per minute for webhook creation
    await rateLimit(event, 'webhook-create')

    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    const body = await readBody<CreateWebhookRequest>(event)

    const validationResult = createWebhookSchema.safeParse(body)

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map(e => e.message)
        .join(', ')
      return sendBadRequestError(event, errorMessages)
    }

    const validatedBody = validationResult.data

    // Generate secret for webhook using cryptographically secure random bytes
    const secret = `${securityConfig.crypto.webhookSecretPrefix}${randomBytes(securityConfig.crypto.webhookSecretLength).toString('hex')}`

    const newWebhook: Webhook = {
      id: `wh_${randomUUID()}`,
      url: validatedBody.url,
      events: validatedBody.events,
      active: validatedBody.active ?? true,
      secret,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await webhookStorage.createWebhook(newWebhook)

    // Return without secret for security
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { secret: _secretValue, ...webhookWithoutSecret } = newWebhook

    return sendSuccessResponse(event, webhookWithoutSecret)
  } catch (error) {
    return handleApiRouteError(event, error)
  }
})
