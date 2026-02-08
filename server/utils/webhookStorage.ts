import type {
  Webhook,
  WebhookEvent,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'
import type {
  Webhook as PrismaWebhook,
  WebhookDelivery as PrismaWebhookDelivery,
  ApiKey as PrismaApiKey,
  WebhookQueue as PrismaWebhookQueue,
  DeadLetterWebhook as PrismaDeadLetterWebhook,
} from '@prisma/client'
import { prisma } from './db'
import { PAGINATION } from './constants'
import { safeJsonParse } from './safeJsonParse'
import { logger } from '~/utils/logger'

function mapPrismaToWebhook(webhook: PrismaWebhook): Webhook {
  return {
    id: webhook.id,
    url: webhook.url,
    secret: webhook.secret ?? undefined,
    active: webhook.active,
    events: safeJsonParse<WebhookEvent[]>(webhook.events, []),
    createdAt: webhook.createdAt.toISOString(),
    updatedAt: webhook.updatedAt.toISOString(),
  }
}

function mapPrismaToWebhookDelivery(
  delivery: PrismaWebhookDelivery
): WebhookDelivery {
  return {
    id: delivery.id,
    webhookId: delivery.webhookId,
    event: delivery.event as WebhookEvent,
    payload: safeJsonParse(delivery.payload, {
      event: '',
      data: {},
      timestamp: '',
    }),
    status: delivery.status as 'success' | 'failed' | 'pending',
    statusCode: delivery.statusCode ?? undefined,
    responseBody: delivery.responseBody
      ? safeJsonParse(delivery.responseBody, undefined)
      : undefined,
    errorMessage: delivery.errorMessage ?? undefined,
    attemptCount: delivery.attemptCount,
    idempotencyKey: delivery.idempotencyKey,
    createdAt: delivery.createdAt.toISOString(),
    updatedAt: delivery.updatedAt.toISOString(),
  }
}

function mapPrismaToApiKey(apiKey: PrismaApiKey): ApiKey {
  return {
    id: apiKey.id,
    key: apiKey.key,
    userId: apiKey.userId ?? undefined,
    name: apiKey.name,
    permissions: safeJsonParse<string[]>(apiKey.permissions, []),
    active: apiKey.active,
    expiresAt: apiKey.expiresAt?.toISOString(),
    createdAt: apiKey.createdAt.toISOString(),
    updatedAt: apiKey.updatedAt.toISOString(),
  }
}

function mapPrismaToWebhookQueueItem(
  queueItem: PrismaWebhookQueue
): WebhookQueueItem {
  return {
    id: queueItem.id,
    webhookId: queueItem.webhookId,
    event: queueItem.event as WebhookEvent,
    payload: safeJsonParse(queueItem.payload, {
      event: '',
      data: {},
      timestamp: '',
    }),
    priority: queueItem.priority,
    retryCount: queueItem.retryCount,
    maxRetries: queueItem.maxRetries,
    scheduledFor: queueItem.scheduledFor.toISOString(),
    createdAt: queueItem.createdAt.toISOString(),
    updatedAt: queueItem.updatedAt.toISOString(),
  }
}

function mapPrismaToDeadLetterWebhook(
  deadLetter: PrismaDeadLetterWebhook
): DeadLetterWebhook {
  return {
    id: deadLetter.id,
    webhookId: deadLetter.webhookId,
    event: deadLetter.event as WebhookEvent,
    payload: safeJsonParse(deadLetter.payload, {
      event: '',
      data: {},
      timestamp: '',
    }),
    failureReason: deadLetter.failureReason,
    lastAttemptAt: deadLetter.lastAttemptAt.toISOString(),
    createdAt: deadLetter.createdAt.toISOString(),
    updatedAt: deadLetter.updatedAt.toISOString(),
    deliveryAttempts: safeJsonParse<WebhookDelivery[]>(
      deadLetter.deliveryAttempts,
      []
    ),
  }
}

/**
 * Handles storage errors with logging and re-throwing
 */
function handleStorageError(operation: string, error: unknown): never {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  logger.error(`Storage operation failed: ${operation}`, {
    error: errorMessage,
  })
  throw new Error(`Failed to ${operation}: ${errorMessage}`)
}

export const webhookStorage = {
  // Webhook methods
  async getAllWebhooks() {
    try {
      const webhooks = await prisma.webhook.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return webhooks.map(mapPrismaToWebhook)
    } catch (error) {
      handleStorageError('get all webhooks', error)
    }
  },

  async getWebhookById(id: string) {
    try {
      const webhook = await prisma.webhook.findFirst({
        where: { id, deletedAt: null },
      })

      if (!webhook) return null

      return mapPrismaToWebhook(webhook)
    } catch (error) {
      handleStorageError(`get webhook by id ${id}`, error)
    }
  },

  async createWebhook(webhook: Webhook) {
    try {
      const created = await prisma.webhook.create({
        data: {
          id: webhook.id,
          url: webhook.url,
          secret: webhook.secret,
          active: webhook.active,
          events: JSON.stringify(webhook.events),
        },
      })

      return mapPrismaToWebhook(created)
    } catch (error) {
      handleStorageError('create webhook', error)
    }
  },

  async updateWebhook(id: string, data: Partial<Webhook>) {
    try {
      const updated = await prisma.webhook.updateMany({
        where: { id, deletedAt: null },
        data: {
          ...(data.url && { url: data.url }),
          ...(data.secret !== undefined && { secret: data.secret }),
          ...(data.active !== undefined && { active: data.active }),
          ...(data.events && { events: JSON.stringify(data.events) }),
        },
      })

      if (updated.count === 0) return null

      const webhook = await prisma.webhook.findUnique({
        where: { id },
      })

      return webhook ? mapPrismaToWebhook(webhook) : null
    } catch (error) {
      handleStorageError(`update webhook ${id}`, error)
    }
  },

  async deleteWebhook(id: string) {
    try {
      const deleted = await prisma.webhook.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return deleted.count > 0
    } catch (error) {
      handleStorageError(`delete webhook ${id}`, error)
    }
  },

  async getWebhooksByEvent(event: string) {
    try {
      const webhooks = await prisma.webhook.findMany({
        where: {
          deletedAt: null,
          active: true,
          events: { contains: `"${event}"` },
        },
        take: PAGINATION.MAX_PAGE_SIZE,
      })

      return webhooks.map(mapPrismaToWebhook)
    } catch (error) {
      handleStorageError(`get webhooks by event ${event}`, error)
    }
  },

  // Delivery methods
  async getAllDeliveries() {
    try {
      const deliveries = await prisma.webhookDelivery.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return deliveries.map(mapPrismaToWebhookDelivery)
    } catch (error) {
      handleStorageError('get all deliveries', error)
    }
  },

  async getDeliveryById(id: string) {
    try {
      const delivery = await prisma.webhookDelivery.findFirst({
        where: { id, deletedAt: null },
      })

      if (!delivery) return null

      return mapPrismaToWebhookDelivery(delivery)
    } catch (error) {
      handleStorageError(`get delivery by id ${id}`, error)
    }
  },

  async createDelivery(delivery: WebhookDelivery) {
    try {
      const created = await prisma.webhookDelivery.create({
        data: {
          id: delivery.id,
          webhookId: delivery.webhookId,
          event: delivery.event,
          payload: JSON.stringify(delivery.payload),
          status: delivery.status,
          statusCode: delivery.statusCode,
          responseBody: delivery.responseBody
            ? JSON.stringify(delivery.responseBody)
            : null,
          errorMessage: delivery.errorMessage,
          attemptCount: delivery.attemptCount,
          idempotencyKey: delivery.idempotencyKey ?? undefined,
        },
      })

      return mapPrismaToWebhookDelivery(created)
    } catch (error) {
      handleStorageError('create delivery', error)
    }
  },

  async updateDelivery(id: string, data: Partial<WebhookDelivery>) {
    try {
      const updated = await prisma.webhookDelivery.updateMany({
        where: { id, deletedAt: null },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.statusCode && { statusCode: data.statusCode }),
          ...(data.responseBody && {
            responseBody: JSON.stringify(data.responseBody),
          }),
          ...(data.errorMessage && { errorMessage: data.errorMessage }),
          ...(data.attemptCount && { attemptCount: data.attemptCount }),
        },
      })

      if (updated.count === 0) return null

      const delivery = await prisma.webhookDelivery.findUnique({
        where: { id },
      })

      return delivery ? mapPrismaToWebhookDelivery(delivery) : null
    } catch (error) {
      handleStorageError(`update delivery ${id}`, error)
    }
  },

  async getDeliveriesByWebhookId(
    webhookId: string
  ): Promise<WebhookDelivery[]> {
    try {
      const deliveries = await prisma.webhookDelivery.findMany({
        where: { webhookId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return deliveries.map(mapPrismaToWebhookDelivery)
    } catch (error) {
      handleStorageError(`get deliveries by webhook id ${webhookId}`, error)
    }
  },

  // API Key methods
  async getAllApiKeys() {
    try {
      const apiKeys = await prisma.apiKey.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return apiKeys.map(mapPrismaToApiKey)
    } catch (error) {
      handleStorageError('get all API keys', error)
    }
  },

  async getApiKeyById(id: string) {
    try {
      const apiKey = await prisma.apiKey.findFirst({
        where: { id, deletedAt: null },
      })

      if (!apiKey) return null

      return mapPrismaToApiKey(apiKey)
    } catch (error) {
      handleStorageError(`get API key by id ${id}`, error)
    }
  },

  async getApiKeyByValue(key: string) {
    try {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          key,
          deletedAt: null,
          active: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      })

      if (!apiKey) return null

      return mapPrismaToApiKey(apiKey)
    } catch (error) {
      handleStorageError('get API key by value', error)
    }
  },

  async createApiKey(apiKey: ApiKey) {
    try {
      const created = await prisma.apiKey.create({
        data: {
          id: apiKey.id,
          key: apiKey.key,
          userId: apiKey.userId,
          name: apiKey.name,
          permissions: JSON.stringify(apiKey.permissions),
          active: apiKey.active,
          expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt) : null,
        },
      })

      return mapPrismaToApiKey(created)
    } catch (error) {
      handleStorageError('create API key', error)
    }
  },

  async updateApiKey(id: string, data: Partial<ApiKey>) {
    try {
      const updated = await prisma.apiKey.updateMany({
        where: { id, deletedAt: null },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.permissions && {
            permissions: JSON.stringify(data.permissions),
          }),
          ...(data.active !== undefined && { active: data.active }),
          ...(data.expiresAt !== undefined && {
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          }),
        },
      })

      if (updated.count === 0) return null

      const apiKey = await prisma.apiKey.findUnique({
        where: { id },
      })

      return apiKey ? mapPrismaToApiKey(apiKey) : null
    } catch (error) {
      handleStorageError(`update API key ${id}`, error)
    }
  },

  async deleteApiKey(id: string) {
    try {
      const deleted = await prisma.apiKey.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return deleted.count > 0
    } catch (error) {
      handleStorageError(`delete API key ${id}`, error)
    }
  },

  // Webhook Queue methods
  async getQueue() {
    try {
      const queue = await prisma.webhookQueue.findMany({
        where: { deletedAt: null },
        orderBy: [{ priority: 'asc' }, { scheduledFor: 'asc' }],
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return queue.map(mapPrismaToWebhookQueueItem)
    } catch (error) {
      handleStorageError('get queue', error)
    }
  },

  async getQueueItemById(id: string) {
    try {
      const item = await prisma.webhookQueue.findFirst({
        where: { id, deletedAt: null },
      })

      if (!item) return null

      return mapPrismaToWebhookQueueItem(item)
    } catch (error) {
      handleStorageError(`get queue item by id ${id}`, error)
    }
  },

  async addToQueue(item: WebhookQueueItem) {
    try {
      const created = await prisma.webhookQueue.create({
        data: {
          id: item.id,
          webhookId: item.webhookId,
          event: item.event,
          payload: JSON.stringify(item.payload),
          priority: item.priority,
          retryCount: item.retryCount,
          maxRetries: item.maxRetries,
          scheduledFor: new Date(item.scheduledFor),
        },
      })

      return mapPrismaToWebhookQueueItem(created)
    } catch (error) {
      handleStorageError('add to queue', error)
    }
  },

  async removeFromQueue(id: string) {
    try {
      const deleted = await prisma.webhookQueue.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return deleted.count > 0
    } catch (error) {
      handleStorageError(`remove from queue ${id}`, error)
    }
  },

  // Dead Letter Queue methods
  async getDeadLetterQueue() {
    try {
      const deadLetter = await prisma.deadLetterWebhook.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: PAGINATION.MAX_ITEMS_PER_REQUEST,
      })

      return deadLetter.map(mapPrismaToDeadLetterWebhook)
    } catch (error) {
      handleStorageError('get dead letter queue', error)
    }
  },

  async getDeadLetterWebhookById(id: string) {
    try {
      const item = await prisma.deadLetterWebhook.findFirst({
        where: { id, deletedAt: null },
      })

      if (!item) return null

      return mapPrismaToDeadLetterWebhook(item)
    } catch (error) {
      handleStorageError(`get dead letter webhook by id ${id}`, error)
    }
  },

  async addToDeadLetterQueue(item: DeadLetterWebhook) {
    try {
      const created = await prisma.deadLetterWebhook.create({
        data: {
          id: item.id,
          webhookId: item.webhookId,
          event: item.event,
          payload: JSON.stringify(item.payload),
          failureReason: item.failureReason,
          lastAttemptAt: new Date(item.lastAttemptAt),
          deliveryAttempts: JSON.stringify(item.deliveryAttempts),
        },
      })

      return mapPrismaToDeadLetterWebhook(created)
    } catch (error) {
      handleStorageError('add to dead letter queue', error)
    }
  },

  async removeFromDeadLetterQueue(id: string) {
    try {
      const deleted = await prisma.deadLetterWebhook.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      })

      return deleted.count > 0
    } catch (error) {
      handleStorageError(`remove from dead letter queue ${id}`, error)
    }
  },

  // Idempotency methods
  async getDeliveryByIdempotencyKey(key: string) {
    try {
      const idempotencyKey = await prisma.idempotencyKey.findFirst({
        where: {
          key,
          deletedAt: null,
        },
      })

      if (!idempotencyKey?.deliveryId) return null

      const delivery = await prisma.webhookDelivery.findFirst({
        where: { id: idempotencyKey.deliveryId, deletedAt: null },
      })

      if (!delivery) return null

      return mapPrismaToWebhookDelivery(delivery)
    } catch (error) {
      handleStorageError(`get delivery by idempotency key`, error)
    }
  },

  async setDeliveryByIdempotencyKey(key: string, delivery: WebhookDelivery) {
    try {
      await prisma.idempotencyKey.upsert({
        where: { key },
        create: {
          key,
          deliveryId: delivery.id,
        },
        update: {
          deliveryId: delivery.id,
        },
      })

      return delivery
    } catch (error) {
      handleStorageError('set delivery by idempotency key', error)
    }
  },

  async hasDeliveryWithIdempotencyKey(key: string) {
    try {
      const idempotencyKey = await prisma.idempotencyKey.findFirst({
        where: {
          key,
          deletedAt: null,
        },
      })

      return !!idempotencyKey
    } catch (error) {
      handleStorageError('check idempotency key', error)
    }
  },
}

export async function resetWebhookStorage() {
  try {
    await prisma.idempotencyKey.deleteMany({})
    await prisma.webhookDelivery.deleteMany({})
    await prisma.webhookQueue.deleteMany({})
    await prisma.deadLetterWebhook.deleteMany({})
    await prisma.webhook.deleteMany({})
    await prisma.apiKey.deleteMany({})
  } catch (error) {
    handleStorageError('reset webhook storage', error)
  }
}
