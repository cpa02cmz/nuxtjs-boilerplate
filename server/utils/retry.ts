import { webhooksConfig } from '~/configs/webhooks.config'

interface RetryConfig {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  retryableErrors: Array<number | Error | string>
  jitterEnabled: boolean
  jitterFactor: number
}

interface RetryResult<T> {
  success: boolean
  data: T | null
  error: Error | null
  attempts: number
  totalDelayMs: number
}

interface RetryAttempt {
  attemptNumber: number
  delayMs: number
  error: Error
  timestamp: string
}

export class RetryError extends Error {
  public readonly attempts: number
  public readonly errors: RetryAttempt[]

  constructor(message: string, attempts: number, errors: RetryAttempt[]) {
    super(message)
    this.name = 'RetryError'
    this.attempts = attempts
    this.errors = errors
  }
}

export function isRetryableError(
  error: unknown,
  retryableErrors: Array<number | Error | string>
): boolean {
  if (retryableErrors.length === 0) {
    return true
  }

  const errorString = String(error)

  return retryableErrors.some(retryable => {
    if (typeof retryable === 'number') {
      return errorString.includes(retryable.toString())
    } else if (retryable instanceof Error) {
      return (
        error instanceof Error &&
        error.name === retryable.name &&
        error.message === retryable.message
      )
    } else {
      return errorString.includes(retryable)
    }
  })
}

import { timeConfig } from '~/configs/time.config'

export function calculateBackoff(
  attempt: number,
  baseDelayMs: number = timeConfig.retry.baseDelayMs,
  maxDelayMs: number = timeConfig.retry.maxDelayMs,
  jitterEnabled: boolean = true,
  jitterFactor: number = webhooksConfig.retry.jitterFactor
): number {
  let delay = baseDelayMs * Math.pow(2, attempt)

  delay = Math.min(delay, maxDelayMs)

  if (jitterEnabled) {
    const jitterRange = delay * jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter
  }

  return Math.max(0, Math.floor(delay))
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  let delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)

  delay = Math.min(delay, config.maxDelayMs)

  if (config.jitterEnabled) {
    const jitterRange = delay * config.jitterFactor
    const jitter = (Math.random() - 0.5) * jitterRange
    delay += jitter
  }

  return Math.max(0, Math.floor(delay))
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const defaultConfig: RetryConfig = {
    maxRetries: webhooksConfig.retry.maxAttempts,
    baseDelayMs: webhooksConfig.retry.baseDelayMs,
    maxDelayMs: webhooksConfig.retry.maxDelayMs,
    backoffMultiplier: timeConfig.retry.exponentialBase,
    retryableErrors: [],
    jitterEnabled: true,
    jitterFactor: webhooksConfig.retry.jitterFactor,
  }

  const finalConfig: RetryConfig = {
    ...defaultConfig,
    ...config,
    retryableErrors: config.retryableErrors ?? defaultConfig.retryableErrors,
  }

  const errors: RetryAttempt[] = []

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const timestamp = new Date().toISOString()

      errors.push({
        attemptNumber: attempt + 1,
        delayMs: 0,
        error: errorObj,
        timestamp,
      })

      const isLastAttempt = attempt === finalConfig.maxRetries
      const shouldRetry =
        !isLastAttempt && isRetryableError(error, finalConfig.retryableErrors)

      if (!shouldRetry) {
        if (isLastAttempt) {
          // All retries exhausted - throw RetryError with full history
          throw new RetryError(
            `All ${finalConfig.maxRetries + 1} retry attempts failed`,
            finalConfig.maxRetries + 1,
            errors
          )
        }
        // Non-retryable error - throw original error immediately
        throw error
      }

      const delay = calculateDelay(attempt, finalConfig)
      const lastError = errors[errors.length - 1]
      if (lastError) {
        lastError.delayMs = delay
      }

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new RetryError(
    `All ${finalConfig.maxRetries + 1} retry attempts failed`,
    finalConfig.maxRetries + 1,
    errors
  )
}

export async function retryWithResult<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const defaultConfig: RetryConfig = {
    maxRetries: webhooksConfig.retry.maxAttempts,
    baseDelayMs: webhooksConfig.retry.baseDelayMs,
    maxDelayMs: webhooksConfig.retry.maxDelayMs,
    backoffMultiplier: timeConfig.retry.exponentialBase,
    retryableErrors: [],
    jitterEnabled: true,
    jitterFactor: webhooksConfig.retry.jitterFactor,
  }

  const finalConfig: RetryConfig = {
    ...defaultConfig,
    ...config,
    retryableErrors: config.retryableErrors ?? defaultConfig.retryableErrors,
  }

  const errors: RetryAttempt[] = []
  let totalDelayMs = 0

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn()

      return {
        success: true,
        data: result,
        error: null,
        attempts: attempt + 1,
        totalDelayMs,
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const timestamp = new Date().toISOString()

      errors.push({
        attemptNumber: attempt + 1,
        delayMs: 0,
        error: errorObj,
        timestamp,
      })

      const isLastAttempt = attempt === finalConfig.maxRetries
      const shouldRetry =
        !isLastAttempt && isRetryableError(error, finalConfig.retryableErrors)

      if (!shouldRetry) {
        return {
          success: false,
          data: null,
          error: errorObj,
          attempts: attempt + 1,
          totalDelayMs,
        }
      }

      const delay = calculateDelay(attempt, finalConfig)
      totalDelayMs += delay
      const lastError = errors[errors.length - 1]
      if (lastError) {
        lastError.delayMs = delay
      }

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return {
    success: false,
    data: null,
    error: new RetryError(
      `All ${finalConfig.maxRetries + 1} retry attempts failed`,
      finalConfig.maxRetries + 1,
      errors
    ),
    attempts: finalConfig.maxRetries + 1,
    totalDelayMs,
  }
}

export function getRetryableHttpCodes(): number[] {
  // Flexy hates hardcoded status codes! Using config instead
  return webhooksConfig.retryableErrors.httpCodes
}

export function isRetryableHttpCode(statusCode: number): boolean {
  return getRetryableHttpCodes().includes(statusCode)
}

// Retry presets - Flexy hates hardcoded values!
// All presets now use configurable values from webhooksConfig
export const retryPresets = {
  quick: {
    maxRetries: webhooksConfig.retryPresets.quick.maxRetries,
    baseDelayMs: webhooksConfig.retryPresets.quick.baseDelayMs,
    maxDelayMs: webhooksConfig.retryPresets.quick.maxDelayMs,
    backoffMultiplier: webhooksConfig.retryPresets.quick.backoffMultiplier,
    jitterEnabled: webhooksConfig.retryPresets.quick.jitterEnabled,
    jitterFactor: webhooksConfig.retryPresets.quick.jitterFactor,
  },
  standard: {
    maxRetries: webhooksConfig.retryPresets.standard.maxRetries,
    baseDelayMs: webhooksConfig.retryPresets.standard.baseDelayMs,
    maxDelayMs: webhooksConfig.retryPresets.standard.maxDelayMs,
    backoffMultiplier: webhooksConfig.retryPresets.standard.backoffMultiplier,
    retryableErrors: getRetryableHttpCodes(),
    jitterEnabled: webhooksConfig.retryPresets.standard.jitterEnabled,
    jitterFactor: webhooksConfig.retryPresets.standard.jitterFactor,
  },
  slow: {
    maxRetries: webhooksConfig.retryPresets.slow.maxRetries,
    baseDelayMs: webhooksConfig.retryPresets.slow.baseDelayMs,
    maxDelayMs: webhooksConfig.retryPresets.slow.maxDelayMs,
    backoffMultiplier: webhooksConfig.retryPresets.slow.backoffMultiplier,
    jitterEnabled: webhooksConfig.retryPresets.slow.jitterEnabled,
    jitterFactor: webhooksConfig.retryPresets.slow.jitterFactor,
  },
  aggressive: {
    maxRetries: webhooksConfig.retryPresets.aggressive.maxRetries,
    baseDelayMs: webhooksConfig.retryPresets.aggressive.baseDelayMs,
    maxDelayMs: webhooksConfig.retryPresets.aggressive.maxDelayMs,
    backoffMultiplier: webhooksConfig.retryPresets.aggressive.backoffMultiplier,
    jitterEnabled: webhooksConfig.retryPresets.aggressive.jitterEnabled,
    jitterFactor: webhooksConfig.retryPresets.aggressive.jitterFactor,
  },
  httpRetry: {
    maxRetries: webhooksConfig.retryPresets.http.maxRetries,
    baseDelayMs: webhooksConfig.retryPresets.http.baseDelayMs,
    maxDelayMs: webhooksConfig.retryPresets.http.maxDelayMs,
    backoffMultiplier: webhooksConfig.retryPresets.http.backoffMultiplier,
    retryableErrors: getRetryableHttpCodes(),
    jitterEnabled: webhooksConfig.retryPresets.http.jitterEnabled,
    jitterFactor: webhooksConfig.retryPresets.http.jitterFactor,
  },
}
