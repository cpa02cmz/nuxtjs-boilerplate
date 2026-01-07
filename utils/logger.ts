/**
 * Structured logging utility for application
 * Provides environment-based logging with different log levels
 */

export interface Logger {
  debug: (_message: string, ..._data: any[]) => void
  info: (_message: string, ..._data: any[]) => void
  warn: (_message: string, ..._data: any[]) => void
  error: (_message: string, ..._data: any[]) => void
}

export const logger: Logger = {
  debug: (_message: string, ..._data: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${_message}`, ..._data)
    }
  },
  info: (_message: string, ..._data: any[]) => {
    // Only log info in development or when specifically enabled
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.LOG_LEVEL === 'info' ||
      process.env.LOG_LEVEL === 'debug'
    ) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${_message}`, ..._data)
    }
  },
  warn: (_message: string, ..._data: any[]) => {
    // Log warnings in all environments except production unless specifically disabled
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.LOG_WARNINGS === 'true'
    ) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${_message}`, ..._data)
    }
  },
  error: (_message: string, ..._data: any[]) => {
    // Always log errors unless specifically disabled
    if (process.env.LOG_ERRORS !== 'false') {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${_message}`, ..._data)
    }
  },
}

export default logger
