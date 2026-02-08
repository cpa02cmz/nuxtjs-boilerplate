// Circuit Breaker Configuration - Circuit Breaker Settings
// Flexy hates hardcoded values! All circuit breaker settings are now configurable.

// Circuit breaker configuration interface
export interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  timeoutMs: number
  monitoringWindowMs: number
}

export const circuitBreakerConfig = {
  // Default Settings
  defaults: {
    // Number of failures before opening circuit
    failureThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5'
    ),

    // Number of successes before closing circuit
    successThreshold: parseInt(
      process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '2'
    ),

    // Timeout duration before attempting reset (ms)
    timeoutMs: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '60000'),

    // Monitoring window for failure rate calculation (ms)
    monitoringWindowMs: parseInt(
      process.env.CIRCUIT_BREAKER_MONITORING_WINDOW_MS || '300000'
    ),
  },

  // Preset Configurations for different use cases
  presets: {
    // Strict: Lower thresholds for critical services
    strict: {
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_STRICT_FAILURE_THRESHOLD || '3'
      ),
      successThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_STRICT_SUCCESS_THRESHOLD || '3'
      ),
      timeoutMs: parseInt(
        process.env.CIRCUIT_BREAKER_STRICT_TIMEOUT_MS || '30000'
      ),
      monitoringWindowMs: parseInt(
        process.env.CIRCUIT_BREAKER_STRICT_MONITORING_WINDOW_MS || '180000'
      ),
    },

    // Relaxed: Higher thresholds for non-critical services
    relaxed: {
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_RELAXED_FAILURE_THRESHOLD || '10'
      ),
      successThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_RELAXED_SUCCESS_THRESHOLD || '1'
      ),
      timeoutMs: parseInt(
        process.env.CIRCUIT_BREAKER_RELAXED_TIMEOUT_MS || '120000'
      ),
      monitoringWindowMs: parseInt(
        process.env.CIRCUIT_BREAKER_RELAXED_MONITORING_WINDOW_MS || '600000'
      ),
    },

    // Fast: Short timeouts for quick recovery
    fast: {
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_FAST_FAILURE_THRESHOLD || '5'
      ),
      successThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_FAST_SUCCESS_THRESHOLD || '2'
      ),
      timeoutMs: parseInt(
        process.env.CIRCUIT_BREAKER_FAST_TIMEOUT_MS || '10000'
      ),
      monitoringWindowMs: parseInt(
        process.env.CIRCUIT_BREAKER_FAST_MONITORING_WINDOW_MS || '60000'
      ),
    },
  },
} as const

export type CircuitBreakerConfig = typeof circuitBreakerConfig

// Helper function to get preset config
export function getCircuitBreakerPreset(
  preset: keyof typeof circuitBreakerConfig.presets
) {
  return circuitBreakerConfig.presets[preset]
}
