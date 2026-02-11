// Test Timing Configuration - Test-specific timing constants
// Flexy hates hardcoded values! All test timing is now configurable.

export const testTimingConfig = {
  // Standard test timeout values
  timeout: {
    // Quick timeout for simple operations (ms)
    quick: parseInt(process.env.TEST_TIMEOUT_QUICK_MS || '1'),

    // Standard timeout for most tests (ms)
    standard: parseInt(process.env.TEST_TIMEOUT_STANDARD_MS || '100'),

    // Long timeout for complex operations (ms)
    long: parseInt(process.env.TEST_TIMEOUT_LONG_MS || '350'),

    // Extended timeout for async operations (ms)
    extended: parseInt(process.env.TEST_TIMEOUT_EXTENDED_MS || '500'),

    // Default test timeout from Vitest config
    default: parseInt(process.env.TEST_TIMEOUT_DEFAULT_MS || '10000'),

    // Performance test timeout (ms) - for performance benchmarks
    performance: parseInt(process.env.TEST_TIMEOUT_PERFORMANCE_MS || '60000'),
  },

  // Animation/wait timing for component tests
  animation: {
    // Debounce delay wait time (ms)
    debounceDelay: parseInt(
      process.env.TEST_ANIMATION_DEBOUNCE_DELAY_MS || '350'
    ),

    // Wait time after interactions (ms)
    interactionWait: parseInt(
      process.env.TEST_ANIMATION_INTERACTION_WAIT_MS || '100'
    ),

    // State update wait time (ms)
    stateUpdate: parseInt(process.env.TEST_ANIMATION_STATE_UPDATE_MS || '10'),

    // Focus/blur transition time (ms)
    focusTransition: parseInt(
      process.env.TEST_ANIMATION_FOCUS_TRANSITION_MS || '50'
    ),
  },

  // Resource data loading timing
  resourceData: {
    // Simulated load delay (ms)
    loadDelay: parseInt(process.env.TEST_RESOURCE_LOAD_DELAY_MS || '100'),

    // Cache duration for test data (ms)
    cacheDuration: parseInt(
      process.env.TEST_RESOURCE_CACHE_DURATION_MS || '60000'
    ),
  },

  // Loading state timing
  loading: {
    // Minimum loading duration (ms)
    minDuration: parseInt(process.env.TEST_LOADING_MIN_DURATION_MS || '1'),

    // Simulated async delay (ms)
    asyncDelay: parseInt(process.env.TEST_LOADING_ASYNC_DELAY_MS || '100'),
  },

  // User preferences timing
  preferences: {
    // Storage operation delay (ms)
    storageDelay: parseInt(
      process.env.TEST_PREFERENCES_STORAGE_DELAY_MS || '10'
    ),

    // Batch update delay (ms)
    batchDelay: parseInt(process.env.TEST_PREFERENCES_BATCH_DELAY_MS || '10'),
  },
} as const

export type TestTimingConfig = typeof testTimingConfig

// Backward-compatible timing constants for tests
export const TEST_TIMING = {
  // Quick timeouts
  QUICK: testTimingConfig.timeout.quick,
  STANDARD: testTimingConfig.timeout.standard,
  LONG: testTimingConfig.timeout.long,
  EXTENDED: testTimingConfig.timeout.extended,

  // Animation timing
  DEBOUNCE_DELAY: testTimingConfig.animation.debounceDelay,
  INTERACTION_WAIT: testTimingConfig.animation.interactionWait,
  STATE_UPDATE: testTimingConfig.animation.stateUpdate,
  FOCUS_TRANSITION: testTimingConfig.animation.focusTransition,

  // Resource timing
  RESOURCE_LOAD_DELAY: testTimingConfig.resourceData.loadDelay,
  RESOURCE_CACHE_DURATION: testTimingConfig.resourceData.cacheDuration,

  // Loading timing
  LOADING_MIN_DURATION: testTimingConfig.loading.minDuration,
  LOADING_ASYNC_DELAY: testTimingConfig.loading.asyncDelay,

  // Preferences timing
  PREFERENCES_STORAGE_DELAY: testTimingConfig.preferences.storageDelay,
  PREFERENCES_BATCH_DELAY: testTimingConfig.preferences.batchDelay,
} as const
