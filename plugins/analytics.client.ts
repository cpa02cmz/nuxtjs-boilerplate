// plugins/analytics.client.ts
// Client-side analytics plugin for automatic tracking

import { defineNuxtPlugin } from '#app'
import type { RouteLocationNormalized, Router } from 'vue-router'

export default defineNuxtPlugin(nuxtApp => {
  // Track initial page view
  if (process.client) {
    import('~/utils/analytics')
      .then(({ trackPageView }) => {
        // Wait for page to load before tracking
        if (window && document) {
          setTimeout(() => {
            trackPageView(window.location.pathname, document.title)
          }, 100)
        }

        // Track route changes
        ;(nuxtApp.$router as Router | undefined)?.afterEach(
          (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
            // Only track if route actually changed
            if (to.path !== from.path) {
              setTimeout(() => {
                trackPageView(to.path, document.title)
              }, 100)
            }
          }
        )
      })
      .catch((error: Error) => {
        console.warn('Analytics module failed to load:', error.message)
      })
  }

  return {
    provide: {
      analytics: {
        trackEvent: (type: string, properties?: Record<string, unknown>) => {
          if (process.client) {
            return import('~/utils/analytics')
              .then(({ trackEvent }) => trackEvent({ type, properties }))
              .catch((error: Error) => {
                console.warn('Analytics trackEvent failed:', error.message)
                return false
              })
          }
          return Promise.resolve(false)
        },
        trackPageView: (url: string, title?: string) => {
          if (process.client) {
            return import('~/utils/analytics')
              .then(({ trackPageView }) => trackPageView(url, title))
              .catch((error: Error) => {
                console.warn('Analytics trackPageView failed:', error.message)
                return false
              })
          }
          return Promise.resolve(false)
        },
        trackResourceClick: (
          resourceId: string,
          title: string,
          category: string
        ) => {
          if (process.client) {
            return import('~/utils/analytics')
              .then(({ trackResourceClick }) =>
                trackResourceClick(resourceId, title, category)
              )
              .catch((error: Error) => {
                console.warn(
                  'Analytics trackResourceClick failed:',
                  error.message
                )
                return false
              })
          }
          return Promise.resolve(false)
        },
        trackResourceView: (
          resourceId: string,
          title: string,
          category: string
        ) => {
          if (process.client) {
            return import('~/utils/analytics')
              .then(({ trackResourceView }) =>
                trackResourceView(resourceId, title, category)
              )
              .catch((error: Error) => {
                console.warn(
                  'Analytics trackResourceView failed:',
                  error.message
                )
                return false
              })
          }
          return Promise.resolve(false)
        },
        trackSearch: (query: string, resultsCount: number) => {
          if (process.client) {
            return import('~/utils/analytics')
              .then(({ trackSearch }) => trackSearch(query, resultsCount))
              .catch((error: Error) => {
                console.warn('Analytics trackSearch failed:', error.message)
                return false
              })
          }
          return Promise.resolve(false)
        },
      },
    },
  }
})
