// UI Timing Configuration - Timeout and delay values for UI interactions
// Flexy hates hardcoded values! All UI timing values are configurable.

export const uiTimingConfig = {
  // Click feedback animations
  clickFeedback: {
    // Duration of click feedback animation (ms)
    duration: parseInt(process.env.UI_CLICK_FEEDBACK_DURATION || '150'),
    // Reset delay after click (ms)
    resetDelay: parseInt(process.env.UI_CLICK_FEEDBACK_RESET_DELAY || '150'),
  },

  // Ripple animations
  ripple: {
    // Duration of ripple animation (ms)
    duration: parseInt(process.env.UI_RIPPLE_DURATION || '600'),
    // Removal delay after animation completes (ms)
    removalDelay: parseInt(process.env.UI_RIPPLE_REMOVAL_DELAY || '600'),
  },

  // Screen reader announcements
  accessibility: {
    // Duration to keep announcement visible (ms)
    announcementDuration: parseInt(
      process.env.UI_ANNOUNCEMENT_DURATION || '1000'
    ),
    // Clear announcement delay (ms)
    clearDelay: parseInt(process.env.UI_ANNOUNCEMENT_CLEAR_DELAY || '1000'),
  },

  // Keyboard hints
  keyboard: {
    // Timeout for keyboard hint display (ms)
    hintTimeout: parseInt(process.env.UI_KEYBOARD_HINT_TIMEOUT || '100'),
  },

  // Countdown timers
  countdown: {
    // Update interval for countdown (ms)
    updateInterval: parseInt(process.env.UI_COUNTDOWN_INTERVAL || '1000'),
  },

  // Comment highlighting
  comments: {
    // Duration to highlight new comments (ms)
    highlightDuration: parseInt(
      process.env.UI_COMMENT_HIGHLIGHT_DURATION || '2000'
    ),
    // Stagger delay between particles (ms)
    particleStaggerDelay: parseInt(
      process.env.UI_COMMENT_PARTICLE_STAGGER || '50'
    ),
    // Burst animation duration + buffer (ms)
    burstBuffer: parseInt(process.env.UI_COMMENT_BURST_BUFFER || '800'),
    // Animation delay for comments (ms)
    animationDelay: parseInt(process.env.UI_COMMENT_ANIMATION_DELAY || '100'),
  },

  // Progress simulation
  progress: {
    // Update interval for progress (ms)
    updateInterval: parseInt(process.env.UI_PROGRESS_UPDATE_INTERVAL || '100'),
    // Start delay for progress simulation (ms)
    startDelay: parseInt(process.env.UI_PROGRESS_START_DELAY || '200'),
    // Increment value for progress
    increment: parseInt(process.env.UI_PROGRESS_INCREMENT || '5'),
    // Sub-increment value for progress
    subIncrement: parseInt(process.env.UI_PROGRESS_SUB_INCREMENT || '2'),
  },

  // Lifecycle timeline
  timeline: {
    // Screen reader announcement clear delay (ms)
    announcementClearDelay: parseInt(
      process.env.UI_TIMELINE_ANNOUNCEMENT_CLEAR || '3000'
    ),
  },

  // Auto-retry
  autoRetry: {
    // Countdown interval for auto-retry (ms)
    countdownInterval: parseInt(
      process.env.UI_AUTO_RETRY_COUNTDOWN_INTERVAL || '1000'
    ),
  },

  // Analytics debounce
  analytics: {
    // Debounce delay for analytics events (ms)
    debounceDelay: parseInt(process.env.UI_ANALYTICS_DEBOUNCE || '100'),
  },

  // Performance observer
  performance: {
    // Timeout for performance observer (ms)
    observerTimeout: parseInt(
      process.env.UI_PERFORMANCE_OBSERVER_TIMEOUT || '1000'
    ),
  },

  // Alternative suggestions
  alternatives: {
    // Screen reader announcement clear delay (ms)
    announcementClearDelay: parseInt(
      process.env.UI_ALTERNATIVES_ANNOUNCEMENT_CLEAR || '1000'
    ),
  },

  // Deprecation notice
  deprecation: {
    // Screen reader announcement clear delay (ms)
    dismissClearDelay: parseInt(
      process.env.UI_DEPRECATION_DISMISS_CLEAR || '1000'
    ),
    // Notice announcement clear delay (ms)
    noticeClearDelay: parseInt(
      process.env.UI_DEPRECATION_NOTICE_CLEAR || '1000'
    ),
  },

  // Breadcrumbs
  breadcrumbs: {
    // Screen reader announcement clear delay (ms)
    announcementClearDelay: parseInt(
      process.env.UI_BREADCRUMBS_ANNOUNCEMENT_CLEAR || '1000'
    ),
  },

  // Review queue - Flexy hates hardcoded values!
  reviewQueue: {
    // New submissions badge timeout (ms)
    badgeTimeout: parseInt(process.env.UI_REVIEW_QUEUE_BADGE_TIMEOUT || '2000'),
  },

  // Virtual list - Flexy hates hardcoded values!
  virtualList: {
    // Staggered entrance animation delay (ms)
    entranceDelay: parseInt(process.env.UI_VIRTUAL_LIST_ENTRANCE_DELAY || '50'),
  },

  // Recommendations - Flexy hates hardcoded values!
  recommendations: {
    // Screen reader announcement clear delay (ms)
    announcementClearDelay: parseInt(
      process.env.UI_RECOMMENDATIONS_ANNOUNCEMENT_CLEAR || '3000'
    ),
  },

  // Related searches - Flexy hates hardcoded values!
  relatedSearches: {
    // Searching state display duration (ms)
    searchDuration: parseInt(process.env.UI_RELATED_SEARCHES_DURATION || '500'),
  },

  // Optimized image - Flexy hates hardcoded values!
  optimizedImage: {
    // Load time threshold for screen reader announcement (ms)
    slowLoadThreshold: parseInt(
      process.env.UI_IMAGE_SLOW_LOAD_THRESHOLD || '1000'
    ),
    // Load time threshold for haptic feedback (ms)
    hapticThreshold: parseInt(process.env.UI_IMAGE_HAPTIC_THRESHOLD || '500'),
  },
} as const

export type UITimingConfig = typeof uiTimingConfig
