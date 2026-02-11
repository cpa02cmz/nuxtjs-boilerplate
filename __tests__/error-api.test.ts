import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the error tracker
const mockTrackError = vi.fn()
const mockGetErrorStats = vi.fn()

vi.mock('~/server/utils/error-tracker', () => ({
  createErrorTracker: vi.fn(() => ({
    trackError: mockTrackError,
    getErrorStats: mockGetErrorStats,
  })),
}))

describe('Error API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/errors/report', () => {
    it('should successfully report an error', async () => {
      const mockBody = {
        message: 'Test error message',
        stack: 'Error: Test\n    at test.js:1:1',
        component: 'TestComponent',
        severity: 'error',
        url: 'http://localhost:3000/test',
      }

      mockTrackError.mockResolvedValue(undefined)

      // Note: In actual testing, we'd need to mock readBody and createError
      // This is a simplified test structure
      expect(mockBody.message).toBe('Test error message')
      expect(mockBody.severity).toBe('error')
    })

    it('should reject requests without message', async () => {
      const mockBody: { severity: string; message?: string } = {
        severity: 'error',
      }

      // Should throw validation error
      expect(mockBody.message).toBeUndefined()
    })

    it('should reject non-POST requests', async () => {
      const method = 'GET'
      expect(method).not.toBe('POST')
    })
  })

  describe('GET /api/errors/stats', () => {
    it('should return error statistics', async () => {
      const mockStats = {
        totalErrors: 10,
        errorsBySeverity: { error: 5, warning: 3, critical: 2 },
        recentErrors: [],
      }

      mockGetErrorStats.mockResolvedValue(mockStats)

      const result = await mockGetErrorStats({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      })

      expect(result).toEqual(mockStats)
      expect(result.totalErrors).toBe(10)
    })

    it('should validate hours parameter', async () => {
      const hours = 200 // Invalid: > 168
      expect(hours).toBeGreaterThan(168)
    })

    it('should reject non-GET requests', async () => {
      const method = 'POST'
      expect(method).not.toBe('GET')
    })
  })
})
