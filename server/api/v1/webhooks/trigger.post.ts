import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import {
  sendSuccessResponse,
  sendValidationError,
  sendUnauthorizedError,
  handleApiRouteError,
} from '~/server/utils/api-response'
import { triggerWebhookSchema } from '~/server/utils/validation-schemas'
import { webhooksConfig } from '~/configs/webhooks.config'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async event => {
  try {
    // Check authentication
    if (!event.context.apiKey) {
      return sendUnauthorizedError(event, 'Authentication required')
    }

    const body = await readBody(event)

    // Validate using Zod schema
    const validationResult = triggerWebhookSchema.safeParse(body)

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

    const idempotencyKey = validatedData.idempotencyKey || `evt_${randomUUID()}`

    const existingDelivery =
      await webhookStorage.getDeliveryByIdempotencyKey(idempotencyKey)
    if (existingDelivery) {
      return sendSuccessResponse(event, {
        message: 'Webhook already delivered (idempotent request)',
        triggered: 0,
        queued: 0,
        existingDelivery: {
          id: existingDelivery.id,
          status: existingDelivery.status,
          createdAt: existingDelivery.createdAt,
        },
      })
    }

    const webhooks = await webhookStorage.getWebhooksByEvent(
      validatedData.event as WebhookEvent
    )

    if (webhooks.length === 0) {
      return sendSuccessResponse(event, {
        message: 'No webhooks to trigger',
        triggered: 0,
        queued: 0,
      })
    }

    const payload: WebhookPayload = {
      event: validatedData.event as WebhookEvent,
      data: validatedData.data,
      timestamp: new Date().toISOString(),
      idempotencyKey,
    }

    let queuedWebhooks = 0
    for (const webhook of webhooks) {
      await webhookQueueSystem.deliverWebhook(webhook, payload, {
        async: true,
        maxRetries: webhooksConfig.delivery.maxRetries,
        priority: webhooksConfig.delivery.priority,
      })
      queuedWebhooks++
    }

    const queueStats = await webhookQueueSystem.getQueueStats()

    return sendSuccessResponse(event, {
      message: `Queued ${queuedWebhooks} webhooks for async delivery for event: ${validatedData.event}`,
      triggered: webhooks.length,
      queued: queuedWebhooks,
      idempotencyKey,
      queueStats: {
        pending: queueStats.pending,
        nextScheduled: queueStats.nextScheduled,
      },
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
