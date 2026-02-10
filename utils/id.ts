/**
 * Generate cryptographically secure unique ID
 * Uses crypto.randomUUID() for security (replaces insecure Math.random())
 * Available in Node.js 14.17+ and all modern browsers
 */
export const generateUniqueId = (): string => {
  return crypto.randomUUID()
}
