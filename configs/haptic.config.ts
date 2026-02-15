// Haptic Feedback Configuration - Vibration patterns for mobile devices
// Flexy hates hardcoded values! All haptic feedback patterns are configurable.

type HapticPatternArray = number[]

interface HapticFeatureConfig {
  enabled: boolean
  pattern?: string
  addPattern?: string
  removePattern?: string
  reconnectPattern?: string
  retryPattern?: string
  entrancePattern?: string
  enableEntranceHaptic?: boolean
  doublePulseDelayMs?: number
}

interface HapticConfigType {
  duration: {
    light: number
    medium: number
    heavy: number
    success: number
    error: number
    ultraLight: number
  }
  patterns: {
    light: HapticPatternArray
    medium: HapticPatternArray
    heavy: HapticPatternArray
    success: HapticPatternArray
    successEmphasis: HapticPatternArray
    error: HapticPatternArray
    errorEmphasis: HapticPatternArray
    buttonPress: HapticPatternArray
    toggle: HapticPatternArray
    ultraLight: HapticPatternArray
  }
  features: {
    loadMore: HapticFeatureConfig
    bookmark: HapticFeatureConfig
    filter: HapticFeatureConfig
    button: HapticFeatureConfig
    pwaInstall: HapticFeatureConfig
    offline: HapticFeatureConfig
    lazyResourceCard: HapticFeatureConfig
    readingProgress: HapticFeatureConfig
  }
  getPattern(
    patternName: keyof HapticConfigType['patterns']
  ): HapticPatternArray
  isEnabled(featureName: keyof HapticConfigType['features']): boolean
}

export const hapticConfig: HapticConfigType = {
  // Vibration durations in milliseconds
  duration: {
    // Light tap feedback (ms)
    light: parseInt(process.env.HAPTIC_DURATION_LIGHT || '10'),
    // Medium feedback (ms)
    medium: parseInt(process.env.HAPTIC_DURATION_MEDIUM || '20'),
    // Heavy/strong feedback (ms)
    heavy: parseInt(process.env.HAPTIC_DURATION_HEAVY || '30'),
    // Success feedback pattern (ms)
    success: parseInt(process.env.HAPTIC_DURATION_SUCCESS || '15'),
    // Error feedback pattern (ms)
    error: parseInt(process.env.HAPTIC_DURATION_ERROR || '40'),
    // Ultra-light feedback for subtle interactions (ms) - Palette's micro-UX!
    ultraLight: parseInt(process.env.HAPTIC_DURATION_ULTRA_LIGHT || '5'),
  },

  // Vibration patterns (arrays of ms: on, off, on, off...)
  patterns: {
    // Light tap pattern
    light: [10],
    // Medium feedback pattern
    medium: [20],
    // Heavy feedback pattern
    heavy: [30],
    // Success pattern: short pulse
    success: [15],
    // Success pattern with emphasis (for major actions)
    successEmphasis: [10, 50, 15],
    // Error pattern: longer vibration
    error: [40],
    // Error pattern with emphasis
    errorEmphasis: [30, 50, 40],
    // Button press feedback
    buttonPress: [10],
    // Toggle switch feedback
    toggle: [5, 25, 5],
    // Ultra-light pattern for subtle interactions - Palette's micro-UX!
    ultraLight: [5],
  },

  // Feature-specific haptic settings
  features: {
    // Load more button haptic
    loadMore: {
      enabled: process.env.HAPTIC_LOAD_MORE_ENABLED !== 'false',
      pattern: process.env.HAPTIC_LOAD_MORE_PATTERN || 'light',
    },
    // Reading progress completion celebration haptic
    readingProgress: {
      enabled: process.env.HAPTIC_READING_PROGRESS_ENABLED !== 'false',
      pattern: 'successEmphasis',
      // Double pulse delay for celebration (ms) - Flexy hates hardcoded 150!
      doublePulseDelayMs: parseInt(
        process.env.HAPTIC_READING_PROGRESS_DOUBLE_PULSE_DELAY_MS || '150'
      ),
    },
    // Bookmark toggle haptic
    bookmark: {
      enabled: process.env.HAPTIC_BOOKMARK_ENABLED !== 'false',
      addPattern: process.env.HAPTIC_BOOKMARK_ADD_PATTERN || 'successEmphasis',
      removePattern: process.env.HAPTIC_BOOKMARK_REMOVE_PATTERN || 'light',
    },
    // Filter selection haptic
    filter: {
      enabled: process.env.HAPTIC_FILTER_ENABLED !== 'false',
      pattern: process.env.HAPTIC_FILTER_PATTERN || 'buttonPress',
    },
    // Button press haptic
    button: {
      enabled: process.env.HAPTIC_BUTTON_ENABLED !== 'false',
      pattern: process.env.HAPTIC_BUTTON_PATTERN || 'buttonPress',
    },
    // PWA install prompt haptic
    pwaInstall: {
      enabled: process.env.HAPTIC_PWA_ENABLED !== 'false',
      pattern: process.env.HAPTIC_PWA_PATTERN || 'medium',
    },
    // Offline indicator haptic
    offline: {
      enabled: process.env.HAPTIC_OFFLINE_ENABLED !== 'false',
      reconnectPattern: process.env.HAPTIC_OFFLINE_RECONNECT || 'success',
      retryPattern: process.env.HAPTIC_OFFLINE_RETRY || 'light',
    },
    // Lazy Resource Card haptic - Palette's micro-UX delight! 🎨
    lazyResourceCard: {
      enabled: process.env.HAPTIC_LAZY_CARD_ENABLED !== 'false',
      entrancePattern:
        process.env.HAPTIC_LAZY_CARD_ENTRANCE_PATTERN || 'ultraLight',
      enableEntranceHaptic:
        process.env.HAPTIC_LAZY_CARD_ENTRANCE_ENABLED !== 'false',
    },
  },

  // Helper function to get pattern array from pattern name
  getPattern(
    patternName: keyof HapticConfigType['patterns']
  ): HapticPatternArray {
    return this.patterns[patternName] || this.patterns.light
  },

  // Helper function to check if haptic is enabled for a feature
  isEnabled(featureName: keyof HapticConfigType['features']): boolean {
    const feature = this.features[featureName]
    return feature ? feature.enabled : true
  },
}

export type HapticConfig = typeof hapticConfig
export type HapticPattern = keyof typeof hapticConfig.patterns
export type HapticFeature = keyof typeof hapticConfig.features
