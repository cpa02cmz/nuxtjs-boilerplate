import { defineNuxtPlugin } from '#app'
import { logError } from '~/utils/errorLogger'

export default defineNuxtPlugin(() => {
  // Global error handler for uncaught errors
  if (process.client) {
    window.addEventListener('error', event => {
      logError('Global error caught', event.error, 'GlobalErrorHandler', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', event => {
      logError(
        'Unhandled promise rejection',
        event.reason as Error,
        'GlobalErrorHandler',
        {
          reason: event.reason,
        }
      )
    })
  }
})
