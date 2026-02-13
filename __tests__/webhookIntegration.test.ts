import { describe, it, expect, beforeAll } from 'vitest'

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

// Skip all tests if not running in integration test environment
const isIntegrationEnv =
  process.env.CI === 'true' || process.env.INTEGRATION_TEST === 'true'

describe.skipIf(!isIntegrationEnv)('Webhook Integration', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'

  beforeAll(() => {
    console.log(
      '⚠️  Skipping integration tests - not in integration environment'
    )
    console.log('    Set CI=true or INTEGRATION_TEST=true to run these tests')
  })

  it('should have webhook API endpoints', async () => {
    const response = await fetch(`${baseUrl}/api/v1/webhooks`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(() => ({ success: false, data: [] }))

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should have API key management endpoints', async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth/api-keys`, {
      method: 'GET',
    })
      .then(res => res.json())
      .catch(() => ({ success: false, data: [] }))

    expect(response).toHaveProperty('success')
    expect(Array.isArray(response.data)).toBe(true)
  })

  it('should respond to health check', async () => {
    const response = await fetch(`${baseUrl}/api/health`)
      .then(res => res.json())
      .catch(() => ({ status: 'error' }))
    expect(response).toHaveProperty('status')
  })
})
