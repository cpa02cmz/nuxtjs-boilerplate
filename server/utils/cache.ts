import type { H3Event } from 'h3'
import { enhancedCacheManager } from './enhanced-cache'

// Export the enhanced cache manager as cacheManager for backward compatibility
export { enhancedCacheManager as cacheManager }

// Re-export the cached decorator from enhanced-cache
export { cached } from './enhanced-cache'
