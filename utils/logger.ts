/**
 * Structured logging utility for the application
 * Provides environment-aware logging with different log levels
 */

interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error'
  enabled?: boolean
}

class Logger {
  private level: 'debug' | 'info' | 'warn' | 'error'
  private enabled: boolean

  constructor(options: LoggerOptions = {}) {
    const { level = 'info', enabled = true } = options
    this.level = level
    this.enabled = enabled && process.env.NODE_ENV !== 'production'
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    if (!this.enabled) return false

    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    return levels[level] >= levels[this.level]
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data)
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data)
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
    } else if (process.env.NODE_ENV === 'production') {
      // In production, still log warnings to capture important issues
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data)
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error') || process.env.NODE_ENV === 'production') {
      if (error instanceof Error) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
          message: error.message,
          stack: error.stack,
          ...dataIfObject(error),
        })
      } else {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
      }
    }
  }

  // Production-safe error logging that always logs errors
  prodError(message: string, error?: any): void {
    if (error instanceof Error) {
      console.error(`[PROD-ERROR] ${new Date().toISOString()} - ${message}`, {
        message: error.message,
        stack: error.stack,
        ...dataIfObject(error),
      })
    } else {
      console.error(
        `[PROD-ERROR] ${new Date().toISOString()} - ${message}`,
        error
      )
    }
  }
}

function dataIfObject(obj: any): Record<string, any> | undefined {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj
  }
  return undefined
}

// Create a single instance of the logger
const logger = new Logger({
  level:
    (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
  enabled:
    process.env.NODE_ENV !== 'production' || process.env.LOG_ENABLED === 'true',
})

export { logger }
export type { LoggerOptions }
