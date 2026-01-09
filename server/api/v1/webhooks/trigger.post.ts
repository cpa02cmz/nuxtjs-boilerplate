import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import {
  sendBadRequestError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const body = await readBody<{
      event: WebhookEvent
      data: any
      idempotencyKey?: string
    }>(event)

    if (!body.event) {
      sendBadRequestError(event, 'Event type is required')
      return
    }

    const idempotencyKey =
      body.idempotencyKey ||
      `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`

    const existingDelivery =
      webhookStorage.getDeliveryByIdempotencyKey(idempotencyKey)
    if (existingDelivery) {
      sendSuccessResponse(event, {
        message: 'Webhook already delivered (idempotent request)',
        triggered: 0,
        queued: 0,
        existingDelivery: {
          id: existingDelivery.id,
          status: existingDelivery.status,
          createdAt: existingDelivery.createdAt,
        },
      })
      return
    }

    const webhooks = webhookStorage.getWebhooksByEvent(body.event)

    if (webhooks.length === 0) {
      sendSuccessResponse(event, {
        message: 'No webhooks to trigger',
        triggered: 0,
        queued: 0,
      })
      return
    }

    const payload: WebhookPayload = {
      event: body.event,
      data: body.data,
      timestamp: new Date().toISOString(),
      idempotencyKey,
    }

    let queuedWebhooks = 0
    for (const webhook of webhooks) {
      await webhookQueueSystem.deliverWebhook(webhook, payload, {
        async: true,
        maxRetries: 3,
        priority: 0,
      })
      queuedWebhooks++
    }

    const queueStats = webhookQueueSystem.getQueueStats()

    sendSuccessResponse(event, {
      message: `Queued ${queuedWebhooks} webhooks for async delivery for event: ${body.event}`,
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
