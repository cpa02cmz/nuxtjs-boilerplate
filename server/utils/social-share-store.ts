/**
 * Shared social share store for persistent share counts across API endpoints
 * Uses Nitro's storage API for cross-request persistence
 */

import { createStorage, type Storage } from 'unstorage'
import memoryDriver from 'unstorage/drivers/memory'

// Share count data structure
interface ShareCountData {
  counts: Record<string, number>
  lastUpdated: string
}

// Initialize storage (in production, this could be replaced with Redis or database driver)
const storage: Storage = createStorage({
  driver: memoryDriver(),
})

const STORAGE_KEY_PREFIX = 'social:shares:'

/**
 * Get share counts for a URL
 */
export async function getShareCounts(
  url: string
): Promise<Record<string, number>> {
  const key = `${STORAGE_KEY_PREFIX}${encodeURIComponent(url)}`
  const data = await storage.getItem<ShareCountData>(key)
  return data?.counts || {}
}

/**
 * Increment share count for a URL and platform
 */
export async function incrementShareCount(
  url: string,
  platform: string
): Promise<number> {
  const key = `${STORAGE_KEY_PREFIX}${encodeURIComponent(url)}`
  const existing = await storage.getItem<ShareCountData>(key)

  const counts = existing?.counts || {}
  const newCount = (counts[platform] || 0) + 1
  counts[platform] = newCount

  await storage.setItem<ShareCountData>(key, {
    counts,
    lastUpdated: new Date().toISOString(),
  })

  return newCount
}

/**
 * Get total share count for a URL across all platforms
 */
export async function getTotalShareCount(url: string): Promise<number> {
  const counts = await getShareCounts(url)
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
}

/**
 * Reset share counts for a URL (useful for testing)
 */
export async function resetShareCounts(url: string): Promise<void> {
  const key = `${STORAGE_KEY_PREFIX}${encodeURIComponent(url)}`
  await storage.removeItem(key)
}

/**
 * Get all tracked URLs (for admin/debug purposes)
 */
export async function getAllTrackedUrls(): Promise<string[]> {
  const keys = await storage.getKeys(STORAGE_KEY_PREFIX)
  return keys.map(key =>
    decodeURIComponent(key.replace(STORAGE_KEY_PREFIX, ''))
  )
}
