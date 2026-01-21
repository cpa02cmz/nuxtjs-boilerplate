import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  webhookStorage,
  resetWebhookStorage,
} from '~/server/utils/webhookStorage'
import type {
  Webhook,
  WebhookDelivery,
  ApiKey,
  WebhookQueueItem,
  DeadLetterWebhook,
} from '~/types/webhook'

describe('webhookStorage', () => {
  const mockWebhook: Webhook = {
    id: 'wh_test_webhook_001',
    url: 'https://example.com/webhook',
    events: ['resource.created', 'resource.updated'],
    active: true,
    secret: 'test-secret',
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  }

  const mockDelivery: WebhookDelivery = {
    id: 'del_test_delivery_001',
    webhookId: 'wh_test_webhook_001',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    status: 'success',
    statusCode: 200,
    attemptCount: 1,
    idempotencyKey: null,
    errorMessage: undefined,
    responseBody: undefined,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  }

  const mockApiKey: ApiKey = {
    id: 'ak_test_apikey_001',
    name: 'Test API Key',
    key: 'sk_test_123456',
    permissions: ['read', 'write'],
    active: true,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  }

  const mockQueueItem: WebhookQueueItem = {
    id: 'q_001',
    webhookId: 'wh_123',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    priority: 0,
    scheduledFor: '2024-01-01T00:00:05.000Z',
    retryCount: 0,
    maxRetries: 3,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  }

  const mockDeadLetterItem: DeadLetterWebhook = {
    id: 'dl_001',
    webhookId: 'wh_123',
    event: 'resource.created',
    payload: {
      event: 'resource.created',
      data: { id: 'res_1' },
      timestamp: '2024-01-01T00:00:00.000Z',
    },
    failureReason: 'Max retries exceeded',
    lastAttemptAt: '2024-01-01T00:00:10.000Z',
    deliveryAttempts: [],
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  }

  beforeEach(async () => {
    await resetWebhookStorage()
  })

  afterEach(async () => {
    await resetWebhookStorage()
  })

  describe('Webhook Methods', () => {
    describe('createWebhook', () => {
      it('should create a new webhook', async () => {
        const result = await webhookStorage.createWebhook(mockWebhook)

        expect(result).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
        expect(result.createdAt).toBeDefined()
        expect(result.updatedAt).toBeDefined()
        expect(await webhookStorage.getAllWebhooks()).toHaveLength(1)
      })

      it('should create multiple webhooks', async () => {
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_002',
          url: 'https://example2.com/webhook',
        }

        await webhookStorage.createWebhook(mockWebhook)
        await webhookStorage.createWebhook(webhook2)

        expect(await webhookStorage.getAllWebhooks()).toHaveLength(2)
      })
    })

    describe('getWebhookById', () => {
      it('should return webhook by id', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.getWebhookById(
          'wh_test_webhook_001'
        )

        expect(result).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://example.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('getAllWebhooks', () => {
      it('should return all webhooks', async () => {
        await webhookStorage.createWebhook(mockWebhook)
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_003',
          url: 'https://example2.com/webhook',
        }
        await webhookStorage.createWebhook(webhook2)

        const result = await webhookStorage.getAllWebhooks()

        expect(result).toHaveLength(2)
        expect(
          result.some((w: Webhook) => w.id === 'wh_test_webhook_001')
        ).toBe(true)
        expect(
          result.some((w: Webhook) => w.id === 'wh_test_webhook_003')
        ).toBe(true)
      })
    })

    describe('updateWebhook', () => {
      it('should update webhook', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.updateWebhook(
          'wh_test_webhook_001',
          {
            url: 'https://updated.com/webhook',
          }
        )

        expect(result).toMatchObject({
          id: 'wh_test_webhook_001',
          url: 'https://updated.com/webhook',
          events: ['resource.created', 'resource.updated'],
          active: true,
          secret: 'test-secret',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('deleteWebhook', () => {
      it('should delete webhook by id', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result = await webhookStorage.deleteWebhook('wh_test_webhook_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getAllWebhooks()).toHaveLength(0)
      })
    })

    describe('getWebhooksByEvent', () => {
      it('should return webhooks that match event', async () => {
        await webhookStorage.createWebhook(mockWebhook)

        const result =
          await webhookStorage.getWebhooksByEvent('resource.created')

        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toMatchObject({
          id: 'wh_test_webhook_001',
          events: ['resource.created', 'resource.updated'],
          active: true,
        })
        expect(result[0]?.createdAt).toBeDefined()
        expect(result[0]?.updatedAt).toBeDefined()
      })

      it('should only return active webhooks', async () => {
        await webhookStorage.createWebhook(mockWebhook)
        const webhook2: Webhook = {
          ...mockWebhook,
          id: 'wh_test_webhook_004',
          active: false,
        }
        await webhookStorage.createWebhook(webhook2)

        const result =
          await webhookStorage.getWebhooksByEvent('resource.created')

        expect(result.every((w: Webhook) => w.active)).toBe(true)
      })
    })
  })

  describe('Delivery Methods', () => {
    describe('createDelivery', () => {
      it('should create a new delivery', async () => {
        const result = await webhookStorage.createDelivery(mockDelivery)

        expect(result).toMatchObject({
          id: 'del_test_delivery_001',
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
        expect(result.createdAt).toBeDefined()
        // Note: updatedAt is generated by Prisma @updatedAt decorator
        // errorMessage and responseBody can be undefined (optional fields)
      })
    })

    describe('getDeliveryById', () => {
      it('should return delivery by id', async () => {
        await webhookStorage.createDelivery(mockDelivery)

        const result = await webhookStorage.getDeliveryById(
          'del_test_delivery_001'
        )

        expect(result).toMatchObject({
          id: 'del_test_delivery_001',
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
          idempotencyKey: null,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('getAllDeliveries', () => {
      it('should return all deliveries', async () => {
        await webhookStorage.createDelivery(mockDelivery)
        const delivery2: WebhookDelivery = {
          ...mockDelivery,
          id: 'del_789_unique',
          webhookId: 'wh_456',
        }
        await webhookStorage.createDelivery(delivery2)

        const result = await webhookStorage.getAllDeliveries()

        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(
          result.some((d: WebhookDelivery) => d.id === 'del_test_delivery_001')
        ).toBe(true)
      })
    })

    describe('updateDelivery', () => {
      it('should update delivery with partial data', async () => {
        await webhookStorage.createDelivery(mockDelivery)

        const result = await webhookStorage.updateDelivery(
          'del_test_delivery_001',
          { status: 'failed', errorMessage: 'Test error' }
        )

        expect(result).toMatchObject({
          id: 'del_test_delivery_001',
          status: 'failed',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('getDeliveriesByWebhookId', () => {
      it('should return deliveries for webhook', async () => {
        await webhookStorage.createDelivery(mockDelivery)

        const result = await webhookStorage.getDeliveriesByWebhookId(
          'wh_test_webhook_001'
        )

        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result[0]).toMatchObject({
          webhookId: 'wh_test_webhook_001',
        })
      })
    })
  })

  describe('API Key Methods', () => {
    describe('createApiKey', () => {
      it('should create a new API key', async () => {
        const result = await webhookStorage.createApiKey(mockApiKey)

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          permissions: ['read', 'write'],
          active: true,
        })
        expect(result.createdAt).toBeDefined()
        expect(result.updatedAt).toBeDefined()
      })
    })

    describe('getApiKeyById', () => {
      it('should return API key by id', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.getApiKeyById('ak_test_apikey_001')

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          permissions: ['read', 'write'],
          active: true,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('getApiKeyByValue', () => {
      it('should return API key by value', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.getApiKeyByValue('sk_test_123456')

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          name: 'Test API Key',
          key: 'sk_test_123456',
          permissions: ['read', 'write'],
          active: true,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('getAllApiKeys', () => {
      it('should return all API keys', async () => {
        await webhookStorage.createApiKey(mockApiKey)
        const apiKey2: ApiKey = {
          ...mockApiKey,
          id: 'ak_test_apikey_002',
          key: 'sk_test_789',
        }
        await webhookStorage.createApiKey(apiKey2)

        const result = await webhookStorage.getAllApiKeys()

        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result.some((k: ApiKey) => k.id === 'ak_test_apikey_001')).toBe(
          true
        )
      })
    })

    describe('updateApiKey', () => {
      it('should update API key', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.updateApiKey('ak_test_apikey_001', {
          active: false,
        })

        expect(result).toMatchObject({
          id: 'ak_test_apikey_001',
          active: false,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('deleteApiKey', () => {
      it('should delete API key by id', async () => {
        await webhookStorage.createApiKey(mockApiKey)

        const result = await webhookStorage.deleteApiKey('ak_test_apikey_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getAllApiKeys()).toHaveLength(0)
      })
    })
  })

  describe('Queue Methods', () => {
    describe('addToQueue', () => {
      it('should add item to queue', async () => {
        const result = await webhookStorage.addToQueue(mockQueueItem)

        expect(result).toMatchObject({
          id: 'q_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          priority: 0,
          retryCount: 0,
          maxRetries: 3,
          scheduledFor: '2024-01-01T00:00:05.000Z',
        })
        expect(result.createdAt).toBeDefined()
        expect(result.updatedAt).toBeDefined()
      })
    })

    describe('getQueue', () => {
      it('should return queue sorted by scheduledFor', async () => {
        const item2: WebhookQueueItem = {
          ...mockQueueItem,
          id: 'q_002',
          scheduledFor: '2024-01-01T00:00:10.000Z',
        }
        await webhookStorage.addToQueue(mockQueueItem)
        await webhookStorage.addToQueue(item2)

        const result = await webhookStorage.getQueue()

        expect(result.length).toBeGreaterThanOrEqual(2)
        expect(result[0]).toMatchObject({
          id: 'q_001',
          scheduledFor: '2024-01-01T00:00:05.000Z',
        })
        expect(result[0]?.createdAt).toBeDefined()
        expect(result[0]?.updatedAt).toBeDefined()
      })
    })

    describe('getQueueItemById', () => {
      it('should return queue item by id', async () => {
        await webhookStorage.addToQueue(mockQueueItem)

        const result = await webhookStorage.getQueueItemById('q_001')

        expect(result).toMatchObject({
          id: 'q_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          priority: 0,
          retryCount: 0,
          maxRetries: 3,
          scheduledFor: '2024-01-01T00:00:05.000Z',
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('removeFromQueue', () => {
      it('should remove item from queue', async () => {
        await webhookStorage.addToQueue(mockQueueItem)

        const result = await webhookStorage.removeFromQueue('q_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getQueue()).toHaveLength(0)
      })
    })

    describe('removeFromQueue', () => {
      it('should remove item from queue', async () => {
        await webhookStorage.addToQueue(mockQueueItem)

        const result = await webhookStorage.removeFromQueue('q_001')

        expect(result).toBe(true)
        expect(await webhookStorage.getQueue()).toHaveLength(0)
      })
    })
  })

  describe('Dead Letter Queue Methods', () => {
    describe('addToDeadLetterQueue', () => {
      it('should add item to dead letter queue', async () => {
        const result =
          await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        expect(result).toMatchObject({
          id: 'dl_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          failureReason: 'Max retries exceeded',
          lastAttemptAt: '2024-01-01T00:00:10.000Z',
          deliveryAttempts: [],
        })
        expect(result.createdAt).toBeDefined()
        expect(result.updatedAt).toBeDefined()
      })
    })

    describe('getDeadLetterQueue', () => {
      it('should return all dead letter items', async () => {
        await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)
        const item2: DeadLetterWebhook = {
          ...mockDeadLetterItem,
          id: 'dl_002',
        }
        await webhookStorage.addToDeadLetterQueue(item2)

        const result = await webhookStorage.getDeadLetterQueue()

        expect(result.length).toBeGreaterThanOrEqual(1)
        expect(result.some((d: DeadLetterWebhook) => d.id === 'dl_001')).toBe(
          true
        )
      })
    })

    describe('getDeadLetterWebhookById', () => {
      it('should return dead letter item by id', async () => {
        await webhookStorage.addToDeadLetterQueue(mockDeadLetterItem)

        const result = await webhookStorage.getDeadLetterWebhookById('dl_001')

        expect(result).toMatchObject({
          id: 'dl_001',
          webhookId: 'wh_123',
          event: 'resource.created',
          failureReason: 'Max retries exceeded',
          lastAttemptAt: '2024-01-01T00:00:10.000Z',
          deliveryAttempts: [],
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })
  })

  describe('Idempotency Methods', () => {
    describe('getDeliveryByIdempotencyKey', () => {
      it('should get delivery by idempotency key', async () => {
        const delivery = await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey('key_123', delivery)

        const result =
          await webhookStorage.getDeliveryByIdempotencyKey('key_123')

        expect(result).toMatchObject({
          id: delivery.id,
          webhookId: 'wh_test_webhook_001',
          event: 'resource.created',
          status: 'success',
          statusCode: 200,
          attemptCount: 1,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })

    describe('setDeliveryByIdempotencyKey', () => {
      it('should set delivery for idempotency key', async () => {
        const delivery = await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey('key_123', delivery)

        const result =
          await webhookStorage.getDeliveryByIdempotencyKey('key_123')

        expect(result).toMatchObject({
          id: delivery.id,
          webhookId: 'wh_test_webhook_001',
        })
      })
    })

    describe('Idempotency Key Overwrite', () => {
      it('should overwrite delivery for existing idempotency key', async () => {
        const delivery1 = await webhookStorage.createDelivery(mockDelivery)
        await webhookStorage.setDeliveryByIdempotencyKey('key_123', delivery1)

        const delivery2 = await webhookStorage.createDelivery({
          ...mockDelivery,
          id: 'del_999',
          status: 'failed',
          statusCode: 500,
        })
        await webhookStorage.setDeliveryByIdempotencyKey('key_123', delivery2)

        const result =
          await webhookStorage.getDeliveryByIdempotencyKey('key_123')

        expect(result).toMatchObject({
          id: 'del_999',
          webhookId: 'wh_test_webhook_001',
          status: 'failed',
          statusCode: 500,
        })
        expect(result?.createdAt).toBeDefined()
        expect(result?.updatedAt).toBeDefined()
      })
    })
  })
})
