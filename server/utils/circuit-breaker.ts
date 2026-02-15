import { webhooksConfig } from '~/configs/webhooks.config'
import { limitsConfig } from '~/configs/limits.config'
import { Mutex } from 'async-mutex'

interface CircuitBreakerState {
  isOpen: boolean
  isHalfOpen: boolean
  failureCount: number
  lastFailureTime: number | null
  successCount: number
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  monitoringWindowMs: number
}

export interface CircuitBreakerStats {
  state: 'closed' | 'open' | 'half-open'
  failureCount: number
  successCount: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  failureRate: number
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private lastSuccessTime: number | null
  private mutex: Mutex

  constructor(config: CircuitBreakerConfig) {
    this.config = config
    this.state = {
      isOpen: false,
      isHalfOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    }
    this.lastSuccessTime = null
    this.mutex = new Mutex()
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    const release = await this.mutex.acquire()

    try {
      if (this.state.isOpen) {
        if (this.shouldAttemptReset()) {
          this.state.isOpen = false
          this.state.isHalfOpen = true
          this.state.successCount = 0
          this.state.failureCount = 0
        } else {
          if (fallback) {
            return fallback()
          }
          throw new Error(
            `Circuit breaker is OPEN. Last failure at ${new Date(this.state.lastFailureTime || 0).toISOString()}`
          )
        }
      }

      try {
        const result = await fn()
        this.onSuccess()
        return result
      } catch (error) {
        // Only count server errors (5xx) and network errors as failures
        // 4xx client errors should not trip the circuit breaker
        if (this.isServerError(error)) {
          this.onFailure()
        }
        if (fallback) {
          return fallback()
        }
        throw error
      }
    } finally {
      release()
    }
  }

  /**
   * Determines if an error represents a server-side failure (5xx) or network error
   * that should count toward the circuit breaker failure threshold.
   * 4xx client errors are NOT counted as they are client-side issues, not service failures.
   */
  private isServerError(error: unknown): boolean {
    // Check for HTTP status code in error
    if (error && typeof error === 'object') {
      const statusCode =
        (error as { statusCode?: number }).statusCode ||
        (error as { response?: { status?: number } }).response?.status ||
        (error as { status?: number }).status

      if (typeof statusCode === 'number') {
        // 4xx errors are client errors, not server failures
        if (statusCode >= 400 && statusCode < 500) {
          return false
        }
        // 5xx errors are server failures
        if (statusCode >= 500) {
          return true
        }
      }
    }

    // Network errors, timeouts, and other non-HTTP errors are considered failures
    return true
  }

  private onSuccess(): void {
    this.state.successCount++
    this.lastSuccessTime = Date.now()

    if (this.state.isHalfOpen) {
      if (this.state.successCount >= this.config.successThreshold) {
        this.state.isHalfOpen = false
        this.state.failureCount = 0
        this.state.successCount = 0
      }
    } else {
      this.state.failureCount = 0
    }
  }

  private onFailure(): void {
    this.state.failureCount++
    this.state.lastFailureTime = Date.now()

    if (this.state.isHalfOpen) {
      this.state.isOpen = true
      this.state.isHalfOpen = false
      this.state.successCount = 0
    } else if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.isOpen = true
      this.state.successCount = 0
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.state.lastFailureTime) return false
    return (
      Date.now() - this.state.lastFailureTime >= this.config.monitoringWindowMs
    )
  }

  getStats(): CircuitBreakerStats {
    const totalRequests = this.state.failureCount + this.state.successCount
    const failureRate =
      totalRequests > 0 ? (this.state.failureCount / totalRequests) * 100 : 0

    return {
      state: this.state.isOpen
        ? 'open'
        : this.state.isHalfOpen
          ? 'half-open'
          : 'closed',
      failureCount: this.state.failureCount,
      successCount: this.state.successCount,
      lastFailureTime: this.state.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      failureRate,
    }
  }

  reset(): void {
    this.state = {
      isOpen: false,
      isHalfOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    }
    this.lastSuccessTime = null
  }

  isOpen(): boolean {
    return this.state.isOpen
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>()
// Flexy hates hardcoded limits! Using config instead
const MAX_CIRCUIT_BREAKERS = limitsConfig.circuitBreaker.maxInstances

export function getCircuitBreaker(
  key: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(key)) {
    if (circuitBreakers.size >= MAX_CIRCUIT_BREAKERS) {
      const oldestKey = circuitBreakers.keys().next().value
      if (oldestKey) {
        circuitBreakers.delete(oldestKey)
      }
    }

    const defaultConfig: CircuitBreakerConfig = {
      failureThreshold: webhooksConfig.circuitBreaker.failureThreshold,
      successThreshold: webhooksConfig.circuitBreaker.successThreshold,
      timeoutMs: webhooksConfig.circuitBreaker.timeoutMs,
      monitoringWindowMs: webhooksConfig.circuitBreaker.resetTimeoutMs,
    }

    circuitBreakers.set(
      key,
      new CircuitBreaker({ ...defaultConfig, ...config })
    )
  }

  return circuitBreakers.get(key)!
}

export function resetCircuitBreaker(key: string): void {
  const breaker = circuitBreakers.get(key)
  if (breaker) {
    breaker.reset()
  }
}

export function getAllCircuitBreakerStats(): Record<
  string,
  CircuitBreakerStats
> {
  const stats: Record<string, CircuitBreakerStats> = {}

  for (const [key, breaker] of circuitBreakers.entries()) {
    stats[key] = breaker.getStats()
  }

  return stats
}
