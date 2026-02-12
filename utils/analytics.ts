// utils/analytics.ts
// Client-side analytics tracking utilities
import logger from '~/utils/logger'
import { patternsConfig } from '~/configs/patterns.config'
import { appConfig } from '~/configs/app.config'

export interface AnalyticsEvent {
  type: string
  resourceId?: string
  category?: string
  url?: string
  properties?: Record<string, unknown>
}

// Event queue for batching analytics events
// BroCula fix: Prevents rate limiting by batching and debouncing events
interface QueuedEvent {
  event: AnalyticsEvent
  timestamp: number
  resolve: (value: boolean) => void
}

const eventQueue: QueuedEvent[] = []
let flushTimeout: ReturnType<typeof setTimeout> | null = null
const FLUSH_DELAY_MS = 2000 // Batch events over 2 seconds
const MAX_QUEUE_SIZE = 50 // Flush if queue reaches this size (max for batch endpoint)

// Get CSRF token from cookie
function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(patternsConfig.csrf.cookiePattern)
  return match ? match[2] : null
}

// Flush queued events to the server using batch endpoint
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return

  // Clear existing timeout
  if (flushTimeout) {
    clearTimeout(flushTimeout)
    flushTimeout = null
  }

  // Take all current events from queue
  const eventsToSend = eventQueue.splice(0, eventQueue.length)

  // Deduplicate events by type + resourceId + url combination
  const seen = new Set<string>()
  const deduplicated = eventsToSend.filter(({ event }) => {
    const key = `${event.type}:${event.resourceId || ''}:${event.url || ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Send all events in a single batch request
  const csrfToken = getCsrfToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  try {
    const events = deduplicated.map(({ event }) => ({
      type: event.type,
      resourceId: event.resourceId,
      category: event.category,
      url: event.url,
      properties: event.properties,
      timestamp: Date.now(),
    }))

    const response = await fetch('/api/analytics/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error(`Analytics batch API error (${response.status}):`, errorText)
      // Mark all events as failed
      deduplicated.forEach(({ resolve }) => resolve(false))
    } else {
      // Mark all events as successful (batch endpoint handles individual failures)
      deduplicated.forEach(({ resolve }) => resolve(true))
    }
  } catch (error) {
    logger.error('Error sending batch analytics events:', error)
    deduplicated.forEach(({ resolve }) => resolve(false))
  }
}

// Schedule a flush of the event queue
function scheduleFlush(): void {
  if (flushTimeout) return

  flushTimeout = setTimeout(() => {
    flushEvents()
  }, FLUSH_DELAY_MS)
}

// Flush events before page unload to prevent data loss
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery during page unload
      const csrfToken = getCsrfToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }

      const events = eventQueue.map(({ event }) => ({
        type: event.type,
        resourceId: event.resourceId,
        category: event.category,
        url: event.url,
        properties: event.properties,
        timestamp: Date.now(),
      }))

      const blob = new Blob([JSON.stringify({ events })], {
        type: 'application/json',
      })
      navigator.sendBeacon('/api/analytics/batch', blob)
    }
  })
}

// Track an analytics event
// BroCula fix: Events are now queued and batched to prevent rate limiting
export async function trackEvent(event: AnalyticsEvent): Promise<boolean> {
  return new Promise(resolve => {
    // Add event to queue
    eventQueue.push({
      event,
      timestamp: Date.now(),
      resolve,
    })

    // Flush immediately if queue is full
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      flushEvents()
    } else {
      // Otherwise schedule a flush
      scheduleFlush()
    }
  })
}

// Track a page view
export async function trackPageView(
  url: string,
  title?: string
): Promise<boolean> {
  return trackEvent({
    type: 'page_view',
    url,
    properties: {
      title,
      referrer:
        typeof document !== 'undefined'
          ? document.referrer
          : appConfig.analytics.defaultReferrer,
      userAgent:
        typeof navigator !== 'undefined'
          ? navigator.userAgent
          : appConfig.analytics.defaultUserAgent,
    },
  })
}

// Track a resource click
export async function trackResourceClick(
  resourceId: string,
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_click',
    resourceId,
    category,
    properties: {
      title,
    },
  })
}

// Track a resource view
export async function trackResourceView(
  resourceId: string,
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_view',
    resourceId,
    category,
    properties: {
      title,
    },
  })
}

// Track a search
export async function trackSearch(
  query: string,
  resultsCount: number,
  filters?: Record<string, unknown>
): Promise<boolean> {
  return trackEvent({
    type: 'search',
    properties: {
      query,
      resultsCount,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track advanced search with operators
export async function trackAdvancedSearch(
  query: string,
  resultsCount: number,
  operatorsUsed: string[],
  filters?: Record<string, unknown>
): Promise<boolean> {
  return trackEvent({
    type: 'advanced_search',
    properties: {
      query,
      resultsCount,
      operatorsUsed,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track search with zero results
export async function trackZeroResultSearch(
  query: string,
  filters?: Record<string, unknown>
): Promise<boolean> {
  return trackEvent({
    type: 'zero_result_search',
    properties: {
      query,
      filters,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track search result click
export async function trackSearchResultClick(
  resourceId: string,
  query: string,
  position: number
): Promise<boolean> {
  return trackEvent({
    type: 'search_result_click',
    resourceId,
    properties: {
      query,
      position,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track a filter application
export async function trackFilter(
  filterType: string,
  filterValue: string
): Promise<boolean> {
  return trackEvent({
    type: 'filter_applied',
    properties: {
      filterType,
      filterValue,
    },
  })
}

// Track a recommendation interaction
export async function trackRecommendationClick(
  resourceId: string,
  recommendationReason: string,
  position: number,
  recommendationId?: string
): Promise<boolean> {
  return trackEvent({
    type: 'recommendation_click',
    resourceId,
    properties: {
      reason: recommendationReason,
      position,
      recommendationId,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track resource rating
export async function trackResourceRating(
  resourceId: string,
  rating: number, // 1-5 scale
  title: string
): Promise<boolean> {
  if (rating < 1 || rating > 5) {
    logger.error('Rating must be between 1 and 5')
    return false
  }

  return trackEvent({
    type: 'resource_rating',
    resourceId,
    properties: {
      rating,
      title,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track time spent on a resource page
export async function trackTimeSpent(
  resourceId: string,
  timeSpent: number, // in seconds
  title: string,
  category: string
): Promise<boolean> {
  return trackEvent({
    type: 'time_spent',
    resourceId,
    category,
    properties: {
      timeSpent,
      title,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track a bookmark event
export async function trackBookmark(
  resourceId: string,
  title: string,
  category: string,
  action: 'add' | 'remove' = 'add'
): Promise<boolean> {
  return trackEvent({
    type: 'bookmark_action',
    resourceId,
    category,
    properties: {
      title,
      action,
      timestamp: new Date().toISOString(),
    },
  })
}

// Track a resource sharing event
export async function trackShare(
  resourceId: string,
  title: string,
  category: string,
  platform: string
): Promise<boolean> {
  return trackEvent({
    type: 'resource_shared',
    resourceId,
    category,
    properties: {
      title,
      platform,
      timestamp: new Date().toISOString(),
    },
  })
}
