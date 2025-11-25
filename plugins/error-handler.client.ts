import { defineNuxtPlugin } from '#app'
import { errorLogger } from '~/utils/errorLogger'

export default defineNuxtPlugin(() => {
  // Global error handler for uncaught errors
  if (process.client) {
    window.addEventListener('error', event => {
      errorLogger.log('Global error caught:', event.error)
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        errorLogger.log('Error details:', {
          message: event.error?.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        })
      }
    })

    window.addEventListener('unhandledrejection', event => {
      errorLogger.log('Unhandled promise rejection:', event.reason)
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        errorLogger.log('Unhandled rejection details:', event.reason)
      }
    })
  }
})
