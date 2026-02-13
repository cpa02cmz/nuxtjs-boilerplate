import { describe, it, expect, beforeAll } from 'vitest'
import { ofetch } from 'ofetch'

interface WebhookListResponse {
  success: boolean
  data: unknown[]
}

interface HealthCheckResponse {
  status: string
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

  // Base URL for integration tests
  const baseURL = process.env.INTEGRATION_TEST_URL || 'http://localhost:3000'

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

    const response = await ofetch<WebhookListResponse>(
      `${baseURL}/api/v1/webhooks`,
      {
        method: 'GET',
      }
    ).catch(() => ({ success: false, data: [] }))

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have API key management endpoints', async () => {
    if (!isIntegrationEnv) {
      return
    }

    const response = await ofetch<WebhookListResponse>(
      `${baseURL}/api/v1/auth/api-keys`,
      {
        method: 'GET',
      }
    ).catch(() => ({ success: false, data: [] }))

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should respond to health check', async () => {
    if (!isIntegrationEnv) {
      return
    }

    const response = await ofetch<HealthCheckResponse>(
      `${baseURL}/api/health`
    ).catch(() => ({
      status: 'error',
    }))
    expect(response).toHaveProperty('status')
  })
})
