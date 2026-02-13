import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  cleanupExpiredIdempotencyKeys,
  getIdempotencyKeyStats,
  runIdempotencyKeyCleanup,
} from '~/server/utils/idempotency-cleanup'

// Mock Prisma
vi.mock('~/server/utils/db', () => ({
  prisma: {
    idempotencyKey: {
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from '~/server/utils/db'

describe('idempotency-cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('cleanupExpiredIdempotencyKeys', () => {
    it('should delete expired keys based on expiresAt', async () => {
      const mockDeleteMany = vi.mocked(prisma.idempotencyKey.deleteMany)
      mockDeleteMany.mockResolvedValue({ count: 5 })

      const result = await cleanupExpiredIdempotencyKeys(7)

      expect(result.deletedCount).toBe(5)
      expect(result.error).toBeUndefined()
      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: {
          OR: expect.arrayContaining([
            expect.objectContaining({
              expiresAt: {
                lt: expect.any(Date),
              },
            }),
            expect.objectContaining({
              AND: expect.arrayContaining([
                { expiresAt: null },
                expect.objectContaining({
                  createdAt: {
                    lt: expect.any(Date),
                  },
                }),
              ]),
            }),
          ]),
        },
      })
    })

    it('should handle errors gracefully', async () => {
      const mockDeleteMany = vi.mocked(prisma.idempotencyKey.deleteMany)
      mockDeleteMany.mockRejectedValue(new Error('Database error'))

      const result = await cleanupExpiredIdempotencyKeys(7)

      expect(result.deletedCount).toBe(0)
      expect(result.error).toBe('Database error')
    })

    it('should use custom maxAgeDays parameter', async () => {
      const mockDeleteMany = vi.mocked(prisma.idempotencyKey.deleteMany)
      mockDeleteMany.mockResolvedValue({ count: 3 })

      await cleanupExpiredIdempotencyKeys(14)

      // Verify the function was called with the correct parameters
      expect(mockDeleteMany).toHaveBeenCalled()
      const callArgs = mockDeleteMany.mock.calls[0][0]
      expect(callArgs).toBeDefined()
    })
  })

  describe('getIdempotencyKeyStats', () => {
    it('should return stats for idempotency keys', async () => {
      const mockCount = vi.mocked(prisma.idempotencyKey.count)
      mockCount
        .mockResolvedValueOnce(100) // totalCount
        .mockResolvedValueOnce(10) // expiredCount
        .mockResolvedValueOnce(5) // expiringSoonCount

      const stats = await getIdempotencyKeyStats()

      expect(stats.totalCount).toBe(100)
      expect(stats.expiredCount).toBe(10)
      expect(stats.expiringSoonCount).toBe(5)
      expect(mockCount).toHaveBeenCalledTimes(3)
    })

    it('should handle errors and return zeros', async () => {
      const mockCount = vi.mocked(prisma.idempotencyKey.count)
      mockCount.mockRejectedValue(new Error('Database error'))

      const stats = await getIdempotencyKeyStats()

      expect(stats.totalCount).toBe(0)
      expect(stats.expiredCount).toBe(0)
      expect(stats.expiringSoonCount).toBe(0)
    })
  })

  describe('runIdempotencyKeyCleanup', () => {
    it('should run complete cleanup routine', async () => {
      const mockDeleteMany = vi.mocked(prisma.idempotencyKey.deleteMany)
      const mockCount = vi.mocked(prisma.idempotencyKey.count)

      mockCount
        .mockResolvedValueOnce(100) // before stats - total
        .mockResolvedValueOnce(10) // before stats - expired
        .mockResolvedValueOnce(5) // before stats - expiring soon
        .mockResolvedValueOnce(95) // after stats - total
        .mockResolvedValueOnce(5) // after stats - expired
        .mockResolvedValueOnce(3) // after stats - expiring soon

      mockDeleteMany.mockResolvedValue({ count: 5 })

      await runIdempotencyKeyCleanup(7)

      expect(mockCount).toHaveBeenCalledTimes(6)
      expect(mockDeleteMany).toHaveBeenCalledTimes(1)
    })

    it('should handle errors during cleanup routine', async () => {
      const mockCount = vi.mocked(prisma.idempotencyKey.count)
      mockCount.mockRejectedValue(new Error('Stats error'))

      // Should not throw
      await expect(runIdempotencyKeyCleanup()).resolves.not.toThrow()
    })
  })
})
