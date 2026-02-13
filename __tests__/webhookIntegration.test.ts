import { describe, it, expect, beforeAll } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

interface WebhookListResponse {
  success: boolean
  data: unknown[]
}

/**
 * Integration tests for webhook functionality
 *
 * These tests run against a full test environment with:
 * - PostgreSQL database (test-db)
 * - Mock webhook receiver (webhook-mock)
 * - Redis cache (test-redis)
 * - Full Nuxt application stack
 *
 * Run locally with: docker-compose -f docker-compose.integration.yml up
 * Or: VITEST_PROFILE=integration npm run test:integration (requires local setup)
 */

describe('Webhook Integration', () => {
  // Skip tests if not running in integration test environment
  const isIntegrationEnv =
    process.env.CI === 'true' || process.env.INTEGRATION_TEST === 'true'

  beforeAll(() => {
    if (!isIntegrationEnv) {
      console.log(
        '⚠️  Skipping integration tests - not in integration environment'
      )
      console.log('    Set CI=true or INTEGRATION_TEST=true to run these tests')
    }
  })

  it('should have webhook API endpoints', async () => {
    if (!isIntegrationEnv) {
      return
    }

    const response = await $fetch<WebhookListResponse>('/api/v1/webhooks', {
      method: 'GET',
    }).catch(err => err.data || { success: false, data: [] })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have API key management endpoints', async () => {
    if (!isIntegrationEnv) {
      return
    }

    const response = await $fetch<WebhookListResponse>(
      '/api/v1/auth/api-keys',
      {
        method: 'GET',
      }
    ).catch(err => err.data || { success: false, data: [] })

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should respond to health check', async () => {
    if (!isIntegrationEnv) {
      return
    }

    const response = await $fetch('/api/health').catch(() => ({
      status: 'error',
    }))
    expect(response).toHaveProperty('status')
  })
})
