import type { CipherGCM, DecipherGCM } from 'node:crypto'
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto'
import { logger } from '~/utils/logger'
import { securityConfig } from '~/configs/security.config'

const ENCRYPTION_KEY: string | undefined =
  process.env.WEBHOOK_SECRET_ENCRYPTION_KEY

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error(
    'FATAL: WEBHOOK_SECRET_ENCRYPTION_KEY must be set in production. ' +
      'Webhook secrets must be encrypted. Set the environment variable to a secure random key.'
  )
}

// Flexy loves modularity! Using config values instead of hardcoded constants
const { crypto: cryptoConfig } = securityConfig

/**
 * Derives a key from the environment variable using scrypt
 */
function getKey(): Buffer | null {
  const key = ENCRYPTION_KEY
  if (!key) return null
  // BugFixer: Fixed TypeScript type narrowing by extracting to local const
  return scryptSync(key, cryptoConfig.salt, cryptoConfig.keyLength)
}

/**
 * Encrypts a webhook secret using AES-256-GCM
 * Returns the encrypted string in format: iv:authTag:ciphertext (base64)
 */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  if (!key) return plaintext // Return plaintext if no encryption key configured

  const iv = randomBytes(cryptoConfig.ivLength)
  const cipher = createCipheriv(cryptoConfig.algorithm, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = (cipher as CipherGCM).getAuthTag()

  // Store as: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypts a webhook secret using AES-256-GCM
 * Expects format: iv:authTag:ciphertext (base64)
 */
export function decryptSecret(encrypted: string): string | null {
  const key = getKey()
  if (!key) return encrypted // Return as-is if no encryption key configured

  // If the secret doesn't contain colons, it's not encrypted
  if (!encrypted.includes(':')) return encrypted

  try {
    const [ivBase64, authTagBase64, ciphertext] = encrypted.split(':')
    if (!ivBase64 || !authTagBase64 || !ciphertext) return null

    const iv = Buffer.from(ivBase64, 'base64')
    const authTag = Buffer.from(authTagBase64, 'base64')

    const decipher = createDecipheriv(cryptoConfig.algorithm, key, iv)
    ;(decipher as DecipherGCM).setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    // Sanitize error logging to prevent potential sensitive data exposure
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to decrypt webhook secret:', errorMessage)
    return null
  }
}

/**
 * Checks if a secret appears to be encrypted
 */
export function isEncryptedSecret(secret: string): boolean {
  return secret.includes(':') && secret.split(':').length === 3
}
