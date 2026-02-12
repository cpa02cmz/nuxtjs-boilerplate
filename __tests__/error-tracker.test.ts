import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createErrorTracker } from '~/server/utils/error-tracker'

// Mock transaction client
const createMockTransactionClient = () => ({
  trackedError: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
})

// Mock PrismaClient
const mockTransactionClient = createMockTransactionClient()

const mockPrismaClient = {
  trackedError: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn(),
  },
  errorMetric: {
    upsert: vi.fn(),
  },
  $transaction: vi.fn(async callback => {
    return await callback(mockTransactionClient)
  }),
}

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}))

describe('Error Tracker', () => {
  let errorTracker: ReturnType<typeof createErrorTracker>

  beforeEach(() => {
    vi.clearAllMocks()
    errorTracker = createErrorTracker()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('trackError', () => {
    beforeEach(() => {
      // Reset transaction client mocks before each test
      mockTransactionClient.trackedError.findFirst.mockReset()
      mockTransactionClient.trackedError.create.mockReset()
      mockTransactionClient.trackedError.update.mockReset()
    })

    it('should create new error entry when no existing error with same hash', async () => {
      mockTransactionClient.trackedError.findFirst.mockResolvedValue(null)
      mockTransactionClient.trackedError.create.mockResolvedValue({
        id: 'test-id',
      })
      mockPrismaClient.errorMetric.upsert.mockResolvedValue({})

      await errorTracker.trackError({
        message: 'Test error',
        severity: 'error',
        source: 'client',
      })

      expect(mockTransactionClient.trackedError.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: 'Test error',
          severity: 'error',
          source: 'client',
          occurrenceCount: 1,
          errorHash: expect.any(String),
        }),
      })
    })

    it('should increment occurrence count for existing error with same hash', async () => {
      const existingError = {
        id: 'existing-id',
        errorHash: 'test-hash',
        occurrenceCount: 5,
      }
      mockTransactionClient.trackedError.findFirst.mockResolvedValue(
        existingError
      )
      mockTransactionClient.trackedError.update.mockResolvedValue({})
      mockPrismaClient.errorMetric.upsert.mockResolvedValue({})

      await errorTracker.trackError({
        message: 'Test error',
        severity: 'error',
        source: 'client',
      })

      expect(mockTransactionClient.trackedError.update).toHaveBeenCalledWith({
        where: { id: 'existing-id' },
        data: {
          occurrenceCount: { increment: 1 },
          lastSeenAt: expect.any(Date),
        },
      })
    })

    it('should not throw when database operation fails', async () => {
      mockPrismaClient.$transaction.mockRejectedValueOnce(new Error('DB Error'))

      await expect(
        errorTracker.trackError({
          message: 'Test error',
          severity: 'error',
          source: 'client',
        })
      ).resolves.not.toThrow()

      // Restore the transaction mock for other tests
      mockPrismaClient.$transaction.mockImplementation(async callback => {
        return await callback(mockTransactionClient)
      })
    })

    it('should use default severity and source when not provided', async () => {
      mockTransactionClient.trackedError.findFirst.mockResolvedValue(null)
      mockTransactionClient.trackedError.create.mockResolvedValue({
        id: 'test-id',
      })
      mockPrismaClient.errorMetric.upsert.mockResolvedValue({})

      await errorTracker.trackError({
        message: 'Test error',
      })

      expect(mockTransactionClient.trackedError.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          severity: 'error',
          source: 'server',
        }),
      })
    })
  })

  describe('getErrorStats', () => {
    it('should return error statistics', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-02'),
      }

      mockPrismaClient.trackedError.count.mockResolvedValue(10)
      mockPrismaClient.trackedError.groupBy.mockResolvedValue([
        { severity: 'error', _count: { id: 5 } },
        { severity: 'critical', _count: { id: 3 } },
      ])
      mockPrismaClient.trackedError.findMany.mockResolvedValue([
        { id: '1', message: 'Error 1', severity: 'error', occurrenceCount: 5 },
      ])

      const stats = await errorTracker.getErrorStats(timeRange)

      expect(stats).toEqual({
        totalErrors: 10,
        errorsBySeverity: {
          error: 5,
          critical: 3,
        },
        recentErrors: [
          {
            id: '1',
            message: 'Error 1',
            severity: 'error',
            occurrenceCount: 5,
          },
        ],
      })
    })

    it('should return null when database operation fails', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-02'),
      }

      mockPrismaClient.trackedError.count.mockRejectedValue(
        new Error('DB Error')
      )

      const stats = await errorTracker.getErrorStats(timeRange)

      expect(stats).toBeNull()
    })
  })

  describe('resolveErrors', () => {
    it('should mark errors as resolved', async () => {
      mockPrismaClient.trackedError.updateMany.mockResolvedValue({ count: 2 })

      await errorTracker.resolveErrors(['error-1', 'error-2'])

      expect(mockPrismaClient.trackedError.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['error-1', 'error-2'] } },
        data: { resolvedAt: expect.any(Date) },
      })
    })

    it('should throw when database operation fails', async () => {
      mockPrismaClient.trackedError.updateMany.mockRejectedValue(
        new Error('DB Error')
      )

      await expect(errorTracker.resolveErrors(['error-1'])).rejects.toThrow(
        'DB Error'
      )
    })
  })
})
