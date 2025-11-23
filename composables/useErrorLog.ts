import { ref } from 'vue'

interface ErrorLogEntry {
  id: string
  message: string
  stack?: string
  component?: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  meta?: Record<string, any>
}

export const useErrorLog = () => {
  const errorLogs = ref<ErrorLogEntry[]>([])
  const maxLogEntries = 100 // Keep only the last 100 entries

  const logError = (
    message: string,
    stack?: string,
    component?: string,
    meta?: Record<string, any>
  ) => {
    const errorEntry: ErrorLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      message,
      stack,
      component,
      timestamp: new Date(),
      level: 'error',
      meta,
    }

    errorLogs.value.unshift(errorEntry) // Add to the beginning

    // Limit the number of logs to maxLogEntries
    if (errorLogs.value.length > maxLogEntries) {
      errorLogs.value = errorLogs.value.slice(0, maxLogEntries)
    }

    // In development, also log to console
    if (process.dev) {
      console.error(`[Error Log] ${message}`, {
        component,
        stack,
        meta,
        timestamp: errorEntry.timestamp,
      })
    }
  }

  const logWarning = (
    message: string,
    stack?: string,
    component?: string,
    meta?: Record<string, any>
  ) => {
    const warningEntry: ErrorLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      message,
      stack,
      component,
      timestamp: new Date(),
      level: 'warning',
      meta,
    }

    errorLogs.value.unshift(warningEntry) // Add to the beginning

    // Limit the number of logs to maxLogEntries
    if (errorLogs.value.length > maxLogEntries) {
      errorLogs.value = errorLogs.value.slice(0, maxLogEntries)
    }

    // In development, also log to console
    if (process.dev) {
      console.warn(`[Warning Log] ${message}`, {
        component,
        stack,
        meta,
        timestamp: warningEntry.timestamp,
      })
    }
  }

  const clearLogs = () => {
    errorLogs.value = []
  }

  const getErrors = () => {
    return errorLogs.value.filter(log => log.level === 'error')
  }

  const getWarnings = () => {
    return errorLogs.value.filter(log => log.level === 'warning')
  }

  const getAllLogs = () => {
    return errorLogs.value
  }

  return {
    errorLogs: errorLogs,
    logError,
    logWarning,
    clearLogs,
    getErrors,
    getWarnings,
    getAllLogs,
  }
}
