import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto'

const ENCRYPTION_KEY = process.env.WEBHOOK_SECRET_ENCRYPTION_KEY

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  console.warn(
    'Warning: WEBHOOK_SECRET_ENCRYPTION_KEY not set. Webhook secrets will not be encrypted.'
  )
}

/**
 * Derives a 32-byte key from the environment variable using scrypt
 */
function getKey(): Buffer | null {
  if (!ENCRYPTION_KEY) return null
  return scryptSync(ENCRYPTION_KEY, 'webhook-salt', 32)
}

/**
 * Encrypts a webhook secret using AES-256-GCM
 * Returns the encrypted string in format: iv:authTag:ciphertext (base64)
 */
export function encryptSecret(plaintext: string): string {
  const key = getKey()
  if (!key) return plaintext // Return plaintext if no encryption key configured

  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

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

    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Failed to decrypt webhook secret:', error)
    return null
  }
}

/**
 * Checks if a secret appears to be encrypted
 */
export function isEncryptedSecret(secret: string): boolean {
  return secret.includes(':') && secret.split(':').length === 3
}
