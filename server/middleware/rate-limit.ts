import { getRequestIP, setResponseHeader, createError } from 'h3'
import { rateLimit } from '../utils/rate-limit'

export default defineEventHandler(async event => {
  // Only apply rate limiting to API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Use the enhanced rate limiting system
  try {
    await rateLimit(event)
  } catch (error) {
    // The rateLimit function already throws the appropriate error
    throw error
  }
})
