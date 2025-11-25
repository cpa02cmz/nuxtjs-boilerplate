/* eslint-disable no-console */
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // Global error handler for uncaught errors
  if (process.client) {
    window.addEventListener('error', event => {
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Global error caught:', event.error)
        console.error('Error details:', {
          message: event.error?.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        })
      }
    })

    window.addEventListener('unhandledrejection', event => {
      // In a real application, you would send this to an error tracking service
      // For now, we'll just log it to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled promise rejection:', event.reason)
        console.error('Unhandled rejection details:', event.reason)
      }
    })
  }
})
