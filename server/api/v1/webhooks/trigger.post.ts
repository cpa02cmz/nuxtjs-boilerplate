import type { WebhookEvent, WebhookPayload } from '~/types/webhook'
import { webhookStorage } from '~/server/utils/webhookStorage'
import { webhookDeliveryService } from '~/server/utils/webhookDelivery'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    event: WebhookEvent
    data: any
  }>(event)
  
  if (!body.event) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event type is required'
    })
  }

  // Find active webhooks that listen to this event
  const webhooks = webhookStorage.getWebhooksByEvent(body.event)
  
  if (webhooks.length === 0) {
    return {
      success: true,
      message: 'No webhooks to trigger',
      triggered: 0
    }
  }

  // Create payload
  const payload: WebhookPayload = {
    event: body.event,
    data: body.data,
    timestamp: new Date().toISOString()
  }

  // Trigger webhooks in the background
  let successfulDeliveries = 0
  for (const webhook of webhooks) {
    const success = await webhookDeliveryService.deliverWebhookWithRetry(webhook, payload)
    if (success) {
      successfulDeliveries++
    }
  }

  return {
    success: true,
    message: `Triggered ${webhooks.length} webhooks for event: ${body.event}, ${successfulDeliveries} successful`,
    triggered: webhooks.length,
    successful: successfulDeliveries
  }
})

  // Find active webhooks that listen to this event
  const webhooks = webhookStorage.getWebhooksByEvent(body.event)

  if (webhooks.length === 0) {
    return {
      success: true,
      message: 'No webhooks to trigger',
      triggered: 0,
    }
  }

  // Create payload
  const payload: WebhookPayload = {
    event: body.event,
    data: body.data,
    timestamp: new Date().toISOString(),
  }

  // Trigger webhooks in the background
  for (const webhook of webhooks) {
    // In a real implementation, this would be queued for background processing
    // For now, we'll trigger them directly
    await triggerWebhook(webhook, payload)
  }

  return {
    success: true,
    message: `Triggered ${webhooks.length} webhooks for event: ${body.event}`,
    triggered: webhooks.length,
  }
})

async function triggerWebhook(webhook: any, payload: WebhookPayload) {
  // Generate signature for security
  const signature = generateSignature(payload, webhook.secret)
  payload.signature = signature

  try {
    // Send webhook request
    const response = await $fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
      timeout: 10000, // 10 second timeout
    })

    // Update webhook stats
    webhookStorage.updateWebhook(webhook.id, {
      lastDeliveryAt: new Date().toISOString(),
      lastDeliveryStatus: 'success',
      deliveryCount: webhook.deliveryCount + 1,
    })

    // Create delivery record
    webhookStorage.createDelivery({
      id: `del_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      status: 'success',
      responseCode: 200,
      responseMessage: 'OK',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
    })
  } catch (error: any) {
    // Update webhook stats
    webhookStorage.updateWebhook(webhook.id, {
      lastDeliveryAt: new Date().toISOString(),
      lastDeliveryStatus: 'failed',
      deliveryCount: webhook.deliveryCount + 1,
      failureCount: webhook.failureCount + 1,
    })

    // Create delivery record
    webhookStorage.createDelivery({
      id: `del_${randomUUID()}`,
      webhookId: webhook.id,
      event: payload.event,
      payload,
      status: 'failed',
      responseCode: error.status || 0,
      responseMessage: error.message || 'Unknown error',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
    })
  }
}

function generateSignature(payload: WebhookPayload, secret: string): string {
  // In a real implementation, use a proper HMAC signature
  // This is a simplified version for demonstration
  return `v1_${Buffer.from(JSON.stringify(payload)).toString('hex').substring(0, 16)}`
}
