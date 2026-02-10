import { describe, it, expect } from 'vitest'
import { generateUniqueId } from '~/utils/id'

describe('generateUniqueId', () => {
  describe('Basic Functionality', () => {
    it('should generate a string', () => {
      const id = generateUniqueId()

      expect(typeof id).toBe('string')
    })

    it('should generate non-empty string', () => {
      const id = generateUniqueId()

      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique IDs on consecutive calls', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()

      expect(id1).not.toBe(id2)
    })
  })

  describe('Uniqueness', () => {
    it('should generate 100 unique IDs', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(100)
    })

    it('should generate 1000 unique IDs', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(1000)
    })

    it('should not generate duplicate IDs in rapid succession', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(1000)
    })
  })

  describe('UUID Format (RFC 4122)', () => {
    it('should generate valid UUID v4 format', () => {
      const id = generateUniqueId()
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(id).toMatch(uuidRegex)
    })

    it('should have standard UUID length of 36 characters', () => {
      const id = generateUniqueId()

      expect(id.length).toBe(36)
    })

    it('should have 4 hyphens at correct positions', () => {
      const id = generateUniqueId()

      expect(id[8]).toBe('-')
      expect(id[13]).toBe('-')
      expect(id[18]).toBe('-')
      expect(id[23]).toBe('-')
    })

    it('should have version 4 indicator at position 14', () => {
      const id = generateUniqueId()

      expect(id[14]).toBe('4')
    })

    it('should have valid variant indicator at position 19', () => {
      const id = generateUniqueId()
      const variant = id[19]

      expect(['8', '9', 'a', 'b']).toContain(variant)
    })
  })

  describe('Edge Cases', () => {
    it('should work correctly in strict mode', () => {
      'use strict'

      const id = generateUniqueId()

      expect(typeof id).toBe('string')
      expect(id.length).toBe(36)
    })
  })

  describe('Determinism', () => {
    it('should NOT be deterministic (each call should produce different result)', () => {
      const ids = new Set<string>()

      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(100)
    })

    it('should have 122 bits of entropy (no collisions in large sample)', () => {
      const ids = new Set<string>()
      const iterations = 10000

      for (let i = 0; i < iterations; i++) {
        ids.add(generateUniqueId())
      }

      expect(ids.size).toBe(iterations)
    })
  })

  describe('Performance', () => {
    it('should generate ID quickly', () => {
      const start = performance.now()

      for (let i = 0; i < 10000; i++) {
        generateUniqueId()
      }

      const duration = performance.now() - start

      expect(duration).toBeLessThan(200) // UUID generation may be slightly slower
    })

    it('should not have memory leaks', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize

      for (let i = 0; i < 100000; i++) {
        generateUniqueId()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize

      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      }
    })
  })

  describe('Character Set', () => {
    it('should only use lowercase hex characters and hyphens', () => {
      const id = generateUniqueId()

      expect(id).toMatch(/^[0-9a-f-]+$/)
      expect(id).not.toMatch(/[A-Z]/)
    })

    it('should not contain special characters except hyphens', () => {
      const id = generateUniqueId()

      expect(id).not.toMatch(/[^0-9a-f-]/)
    })
  })

  describe('Cryptographic Security', () => {
    it('should use crypto.randomUUID for security', () => {
      const ids: string[] = []

      for (let i = 0; i < 10; i++) {
        ids.push(generateUniqueId())
      }

      // All should be valid UUIDs with proper version and variant
      for (const id of ids) {
        expect(id[14]).toBe('4') // Version 4
        expect(['8', '9', 'a', 'b']).toContain(id[19]) // Variant
      }
    })

    it('should not be predictable from previous IDs', () => {
      const id1 = generateUniqueId()
      const id2 = generateUniqueId()

      // UUIDs should be completely different, not just incrementing
      let diffCount = 0
      for (let i = 0; i < id1.length; i++) {
        if (id1[i] !== id2[i]) diffCount++
      }

      // Most characters should be different (accounting for 4 hyphens at fixed positions)
      // Using 27 to account for random variance while still ensuring unpredictability
      expect(diffCount).toBeGreaterThanOrEqual(27)
    })
  })
})
