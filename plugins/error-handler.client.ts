import { defineNuxtPlugin } from '#app'
import { logError } from '~/utils/errorLogger'

export default defineNuxtPlugin(() => {
  // Global error handler for uncaught errors
  if (process.client && typeof window !== 'undefined') {
    window.addEventListener('error', event => {
      // In a real application, you would send this to an error tracking service
      // For now, we'll log it using our error logging utility
      logError(
        event.error?.message || 'Global error caught',
        event.error,
        'GlobalErrorHandler',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          type: 'global-error',
        }
      )
    })

    window.addEventListener('unhandledrejection', event => {
      // In a real application, you would send this to an error tracking service
      // For now, we'll log it using our error logging utility
      logError(
        event.reason?.message || 'Unhandled promise rejection',
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        'GlobalErrorHandler',
        {
          type: 'unhandled-rejection',
          reason: event.reason,
        }
      )
    })
  }
})
