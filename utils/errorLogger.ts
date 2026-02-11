// Error logging service for consistent error tracking
import { generateUniqueId } from './generateId'
import { logger } from './logger'
import { limitsConfig } from '~/configs/limits.config'

export interface ErrorLog {
  id: string
  timestamp: Date
  message: string
  stack?: string
  url?: string
  userAgent?: string
  component?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  additionalInfo?: Record<string, unknown>
}

/**
 * Configuration for remote error reporting
 */
interface RemoteReportingConfig {
  enabled: boolean
  endpoint: string
  sampleRate: number // 0-1, percentage of errors to report
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = limitsConfig.errorLog.maxLogs
  private remoteConfig: RemoteReportingConfig = {
    enabled: typeof window !== 'undefined', // Only enabled on client-side
    endpoint: '/api/errors/report',
    sampleRate: 1.0, // Report all errors by default
  }

  // Log an error with different severity levels
  log(
    message: string,
    severity: ErrorLog['severity'] = 'error',
    error?: Error,
    component?: string,
    additionalInfo?: Record<string, unknown>
  ): void {
    const log: ErrorLog = {
      id: generateUniqueId(),
      timestamp: new Date(),
      message,
      stack: error?.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : undefined,
      component,
      severity,
      additionalInfo,
    }

    this.logs.push(log)

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // In development, log to console using our new logger
    if (process.env.NODE_ENV === 'development') {
      if (severity === 'error' || severity === 'critical') {
        logger.error(
          `[${severity.toUpperCase()}] ${message}`,
          error,
          additionalInfo
        )
      } else if (severity === 'warning') {
        logger.warn(
          `[${severity.toUpperCase()}] ${message}`,
          error,
          additionalInfo
        )
      } else {
        logger.info(
          `[${severity.toUpperCase()}] ${message}`,
          error,
          additionalInfo
        )
      }
    }

    // Send to remote error tracking service (async, don't block)
    if (
      this.remoteConfig.enabled &&
      Math.random() <= this.remoteConfig.sampleRate
    ) {
      this.sendToRemoteService(log).catch(err => {
        // Silent fail - error reporting should never break the app
        if (process.env.NODE_ENV === 'development') {
          logger.error('Failed to send error to remote service:', err)
        }
      })
    }
  }

  // Get all logs
  getLogs(): ErrorLog[] {
    return [...this.logs] // Return a copy to prevent external mutation
  }

  // Get logs by severity
  getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity)
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = []
  }

  // Get error count
  getErrorCount(): number {
    return this.logs.filter(
      log => log.severity === 'error' || log.severity === 'critical'
    ).length
  }

  /**
   * Send error log to remote tracking service
   */
  private async sendToRemoteService(log: ErrorLog): Promise<void> {
    const response = await fetch(this.remoteConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: log.message,
        stack: log.stack,
        component: log.component,
        severity: log.severity,
        url: log.url,
        userAgent: log.userAgent,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  /**
   * Configure remote error reporting
   */
  configureRemoteReporting(config: Partial<RemoteReportingConfig>): void {
    this.remoteConfig = { ...this.remoteConfig, ...config }
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger()

// Convenience functions for different severity levels
export const logError = (
  message: string,
  error?: Error,
  component?: string,
  additionalInfo?: Record<string, unknown>
) => {
  errorLogger.log(message, 'error', error, component, additionalInfo)
}

export const logWarning = (
  message: string,
  error?: Error,
  component?: string,
  additionalInfo?: Record<string, unknown>
) => {
  errorLogger.log(message, 'warning', error, component, additionalInfo)
}

export const logInfo = (
  message: string,
  error?: Error,
  component?: string,
  additionalInfo?: Record<string, unknown>
) => {
  errorLogger.log(message, 'info', error, component, additionalInfo)
}

export const logCritical = (
  message: string,
  error?: Error,
  component?: string,
  additionalInfo?: Record<string, unknown>
) => {
  errorLogger.log(message, 'critical', error, component, additionalInfo)
}
