/**
 * Error logging service for consistent error tracking across the application
 */

export interface ErrorLog {
  message: string
  stack?: string
  url?: string
  timestamp: number
  userAgent?: string
  type: 'error' | 'warning' | 'info'
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100 // Keep only the last 100 logs

  log(
    error: Error,
    type: 'error' | 'warning' | 'info' = 'error',
    url?: string
  ) {
    const errorLog: ErrorLog = {
      message: error.message || String(error),
      stack: error.stack,
      url:
        url ||
        (typeof window !== 'undefined' ? window.location.href : undefined),
      timestamp: Date.now(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      type,
    }

    this.logs.push(errorLog)

    // Keep only the last maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console[type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'log'](
        'ErrorLogger:',
        errorLog
      )
    }

    // In a real application, you might send this to an external service
    // this.sendToExternalService(errorLog)
  }

  getLogs(): ErrorLog[] {
    return [...this.logs] // Return a copy to prevent external mutations
  }

  clearLogs() {
    this.logs = []
  }

  private async sendToExternalService(errorLog: ErrorLog) {
    // This would be implemented to send errors to external services like Sentry, etc.
    // For now, it's a placeholder
    if (process.client) {
      // Only run in browser environment
      try {
        // Example: await fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorLog) })
      } catch (e) {
        // Fail silently to avoid creating more errors
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Failed to send error to external service:', e)
        }
      }
    }
  }
}

export const errorLogger = new ErrorLogger()
