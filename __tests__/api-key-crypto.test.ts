import { describe, it, expect } from 'vitest'
import {
  hashApiKey,
  verifyApiKey,
  generateApiKey,
  getKeyPrefix,
} from '~/server/utils/api-key-crypto'

describe('API Key Cryptography', () => {
  describe('generateApiKey', () => {
    it('generates API key with correct prefix', () => {
      const key = generateApiKey()
      expect(key.startsWith('ak_')).toBe(true)
    })

    it('generates unique keys', () => {
      const key1 = generateApiKey()
      const key2 = generateApiKey()
      expect(key1).not.toBe(key2)
    })

    it('generates keys of expected length', () => {
      const key = generateApiKey()
      // ak_ prefix + 32 bytes in base64url (~43 chars)
      expect(key.length).toBeGreaterThan(40)
    })
  })

  describe('getKeyPrefix', () => {
    it('extracts first 8 characters', () => {
      const key = 'ak_test123456789'
      expect(getKeyPrefix(key)).toBe('ak_test1')
    })

    it('handles short keys', () => {
      const key = 'short'
      expect(getKeyPrefix(key)).toBe('short')
    })
  })

  describe('hashApiKey and verifyApiKey', () => {
    it('hashes API key successfully', async () => {
      const key = generateApiKey()
      const hash = await hashApiKey(key)
      expect(hash).toBeDefined()
      expect(hash.startsWith('$2')).toBe(true) // bcrypt hash format
    })

    it('verifies correct API key', async () => {
      const key = generateApiKey()
      const hash = await hashApiKey(key)
      const isValid = await verifyApiKey(key, hash)
      expect(isValid).toBe(true)
    })

    it('rejects incorrect API key', async () => {
      const key = generateApiKey()
      const wrongKey = generateApiKey()
      const hash = await hashApiKey(key)
      const isValid = await verifyApiKey(wrongKey, hash)
      expect(isValid).toBe(false)
    })

    it('produces different hashes for same key (due to salt)', async () => {
      const key = generateApiKey()
      const hash1 = await hashApiKey(key)
      const hash2 = await hashApiKey(key)
      expect(hash1).not.toBe(hash2)
    })
  })
})
