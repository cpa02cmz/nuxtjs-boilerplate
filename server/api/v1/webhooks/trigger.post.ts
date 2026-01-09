import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookDeliveryService } from '~/server/utils/webhookDelivery'
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
    }>(event)

    if (!body.event) {
      sendBadRequestError(event, 'Event type is required')
      return
    }

    // Find active webhooks that listen to this event
    const webhooks = webhookStorage.getWebhooksByEvent(body.event)

    if (webhooks.length === 0) {
      sendSuccessResponse(event, {
        message: 'No webhooks to trigger',
        triggered: 0,
      })
      return
    }

    // Create payload
    const payload: WebhookPayload = {
      event: body.event,
      data: body.data,
      timestamp: new Date().toISOString(),
    }

    // Trigger webhooks in background
    let successfulDeliveries = 0
    for (const webhook of webhooks) {
      const success = await webhookDeliveryService.deliverWebhookWithRetry(
        webhook,
        payload
      )
      if (success) {
        successfulDeliveries++
      }
    }

    sendSuccessResponse(event, {
      message: `Triggered ${webhooks.length} webhooks for event: ${body.event}, ${successfulDeliveries} successful`,
      triggered: webhooks.length,
      successful: successfulDeliveries,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
