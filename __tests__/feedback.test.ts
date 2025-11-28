import { describe, it, expect, beforeEach, vi } from 'vitest'
import { $fetch } from 'ofetch'

// Mock the $fetch function
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

describe('Feedback API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/feedback', () => {
    it('should successfully submit feedback', async () => {
      const mockFeedbackData = {
        type: 'feature_request',
        title: 'Test Feedback',
        description: 'This is a test feedback',
        category: 'UI',
        userEmail: 'test@example.com',
      }

      const mockResponse = {
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          id: 'feedback_test-id',
          type: 'feature_request',
          title: 'Test Feedback',
          description: 'This is a test feedback',
          category: 'UI',
          userEmail: 'test@example.com',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }

      // Mock the $fetch response
      const fetchMock = vi.mocked($fetch)
      fetchMock.mockResolvedValue(mockResponse)

      // Import and call the API
      const result = await $fetch('/api/feedback', {
        method: 'POST',
        body: mockFeedbackData,
      })

      expect(result).toEqual(mockResponse)
      expect(fetchMock).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        body: mockFeedbackData,
      })
    })

    it('should return error for missing required fields', async () => {
      const mockResponse = {
        success: false,
        message:
          'Missing required fields: type, title, and description are required',
      }

      const fetchMock = vi.mocked($fetch)
      fetchMock.mockRejectedValue(new Error('Bad Request'))

      await expect(
        $fetch('/api/feedback', {
          method: 'POST',
          body: { type: 'bug_report' }, // Missing title and description
        })
      ).rejects.toThrow('Bad Request')
    })

    it('should return error for invalid feedback type', async () => {
      const mockFeedbackData = {
        type: 'invalid_type',
        title: 'Test Feedback',
        description: 'This is a test feedback',
      }

      const fetchMock = vi.mocked($fetch)
      fetchMock.mockRejectedValue(new Error('Bad Request'))

      await expect(
        $fetch('/api/feedback', {
          method: 'POST',
          body: mockFeedbackData,
        })
      ).rejects.toThrow('Bad Request')
    })
  })

  describe('GET /api/feedback', () => {
    it('should return feedback list', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'feedback_1',
            type: 'bug_report',
            title: 'Test Bug',
            description: 'This is a test bug report',
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        count: 1,
      }

      const fetchMock = vi.mocked($fetch)
      fetchMock.mockResolvedValue(mockResponse)

      const result = await $fetch('/api/feedback')

      expect(result).toEqual(mockResponse)
      expect(fetchMock).toHaveBeenCalledWith('/api/feedback', { method: 'GET' })
    })

    it('should return filtered feedback by type', async () => {
      const mockResponse = {
        success: true,
        data: [],
        count: 0,
      }

      const fetchMock = vi.mocked($fetch)
      fetchMock.mockResolvedValue(mockResponse)

      const result = await $fetch('/api/feedback', {
        method: 'GET',
        params: { type: 'bug_report' },
      })

      expect(result).toEqual(mockResponse)
      expect(fetchMock).toHaveBeenCalledWith('/api/feedback', {
        method: 'GET',
        params: { type: 'bug_report' },
      })
    })
  })
})
