/**
 * API Key Cryptography Utilities
 * Secure hashing and verification for API keys using bcrypt
 */
import bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto'

// Cost factor for bcrypt (higher = more secure but slower)
// 12 is a good balance between security and performance
const BCRYPT_ROUNDS = 12

// Length of key prefix to store for identification
const KEY_PREFIX_LENGTH = 8

/**
 * Extract a prefix from an API key for identification
 * @param apiKey - The full API key
 * @returns Prefix for database lookup
 */
export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, KEY_PREFIX_LENGTH)
}

/**
 * Hash an API key using bcrypt
 * @param apiKey - The API key to hash
 * @returns Bcrypt hash of the key
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, BCRYPT_ROUNDS)
}

/**
 * Verify an API key against a stored hash
 * @param apiKey - The plaintext API key to verify
 * @param hash - The stored bcrypt hash
 * @returns True if the key matches the hash
 */
export async function verifyApiKey(
  apiKey: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(apiKey, hash)
}

/**
 * Generate a secure random API key
 * @returns New API key with 'ak_' prefix
 */
export function generateApiKey(): string {
  const bytes = randomBytes(32)
  return `ak_${bytes.toString('base64url')}`
}
