import { webhookQueueSystem } from '~/server/utils/webhookQueue'
import {
  sendNotFoundError,
  sendSuccessResponse,
  handleApiRouteError,
} from '~/server/utils/api-response'

export default defineEventHandler(async event => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      sendNotFoundError(event, 'Dead Letter Webhook', id)
      return
    }

    const success = await webhookQueueSystem.retryDeadLetterWebhook(id)

    if (!success) {
      sendNotFoundError(event, 'Dead Letter Webhook', id)
      return
    }

    return sendSuccessResponse(event, {
      message: 'Webhook re-queued for delivery',
      id,
    })
  } catch (error) {
    handleApiRouteError(event, error)
  }
})
