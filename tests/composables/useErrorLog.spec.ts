import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useErrorLog } from '~/composables/useErrorLog'

describe('useErrorLog', () => {
  beforeEach(() => {
    // Mock console methods to avoid actual console output during tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('should initialize with empty error logs', () => {
    const { errorLogs } = useErrorLog()

    expect(errorLogs.value).toEqual([])
  })

  it('should log an error correctly', () => {
    const { errorLogs, logError } = useErrorLog()

    logError('Test error message', 'Test stack trace', 'TestComponent', {
      test: 'data',
    })

    expect(errorLogs.value).toHaveLength(1)
    const logEntry = errorLogs.value[0]
    expect(logEntry.message).toBe('Test error message')
    expect(logEntry.stack).toBe('Test stack trace')
    expect(logEntry.component).toBe('TestComponent')
    expect(logEntry.level).toBe('error')
    expect(logEntry.meta).toEqual({ test: 'data' })
    expect(logEntry.id).toMatch(/^log-\d+-\d+$/)
  })

  it('should log a warning correctly', () => {
    const { errorLogs, logWarning } = useErrorLog()

    logWarning('Test warning message', 'Test stack trace', 'TestComponent', {
      test: 'data',
    })

    expect(errorLogs.value).toHaveLength(1)
    const logEntry = errorLogs.value[0]
    expect(logEntry.message).toBe('Test warning message')
    expect(logEntry.stack).toBe('Test stack trace')
    expect(logEntry.component).toBe('TestComponent')
    expect(logEntry.level).toBe('warning')
    expect(logEntry.meta).toEqual({ test: 'data' })
    expect(logEntry.id).toMatch(/^log-\d+-\d+$/)
  })

  it('should clear logs correctly', () => {
    const { errorLogs, logError, clearLogs } = useErrorLog()

    logError('Test error message')
    expect(errorLogs.value).toHaveLength(1)

    clearLogs()
    expect(errorLogs.value).toEqual([])
  })

  it('should return only errors when calling getErrors', () => {
    const { logError, logWarning, getErrors } = useErrorLog()

    logError('Error message')
    logWarning('Warning message')
    logError('Another error')

    const errors = getErrors()
    expect(errors).toHaveLength(2)
    expect(errors.every(log => log.level === 'error')).toBe(true)
  })

  it('should return only warnings when calling getWarnings', () => {
    const { logError, logWarning, getWarnings } = useErrorLog()

    logError('Error message')
    logWarning('Warning message')
    logError('Another error')
    logWarning('Another warning')

    const warnings = getWarnings()
    expect(warnings).toHaveLength(2)
    expect(warnings.every(log => log.level === 'warning')).toBe(true)
  })

  it('should return all logs when calling getAllLogs', () => {
    const { logError, logWarning, getAllLogs } = useErrorLog()

    logError('Error message')
    logWarning('Warning message')

    const allLogs = getAllLogs()
    expect(allLogs).toHaveLength(2)
    expect(allLogs.some(log => log.level === 'error')).toBe(true)
    expect(allLogs.some(log => log.level === 'warning')).toBe(true)
  })

  it('should limit the number of logs to maxLogEntries', () => {
    const { logError, errorLogs } = useErrorLog()

    // Log more entries than the max
    for (let i = 0; i < 110; i++) {
      logError(`Error message ${i}`)
    }

    // Should only keep the last 100 entries
    expect(errorLogs.value).toHaveLength(100)
  })
})
