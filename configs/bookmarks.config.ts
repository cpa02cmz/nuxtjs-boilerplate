// Bookmarks Configuration - Bookmark-related settings
// Flexy hates hardcoded values! All bookmark settings are now configurable.

export const bookmarksConfig = {
  // Undo functionality
  undo: {
    // Duration in milliseconds for the undo window (default: 5 seconds)
    durationMs: parseInt(process.env.BOOKMARK_UNDO_DURATION_MS || '5000'),
    // Progress update interval in milliseconds for smooth animation (default: 50ms)
    progressIntervalMs: parseInt(
      process.env.BOOKMARK_UNDO_PROGRESS_INTERVAL_MS || '50'
    ),
    // Progress bar decrement percentage per update (default: 1)
    progressDecrement: parseInt(
      process.env.BOOKMARK_UNDO_PROGRESS_DECREMENT || '1'
    ),
  },

  // Toast notifications
  toast: {
    // Duration for info toast when removing a bookmark (default: 2 seconds)
    removeDurationMs: parseInt(
      process.env.BOOKMARK_TOAST_REMOVE_DURATION_MS || '2000'
    ),
    // Duration for success toast when undoing (default: 3 seconds)
    undoSuccessDurationMs: parseInt(
      process.env.BOOKMARK_TOAST_UNDO_SUCCESS_DURATION_MS || '3000'
    ),
  },

  // Animation settings
  animation: {
    // Empty state float animation duration in seconds (default: 3s)
    floatDurationSec: parseFloat(
      process.env.BOOKMARK_ANIMATION_FLOAT_DURATION_SEC || '3'
    ),
    // Heartbeat animation duration in seconds (default: 2s)
    heartbeatDurationSec: parseFloat(
      process.env.BOOKMARK_ANIMATION_HEARTBEAT_DURATION_SEC || '2'
    ),
    // Pulse animation duration in seconds (default: 4s)
    pulseDurationSec: parseFloat(
      process.env.BOOKMARK_ANIMATION_PULSE_DURATION_SEC || '4'
    ),
    // Sparkle animation duration in seconds (default: 3s)
    sparkleDurationSec: parseFloat(
      process.env.BOOKMARK_ANIMATION_SPARKLE_DURATION_SEC || '3'
    ),
    // Sparkle animation delay in seconds (default: 1.5s)
    sparkleDelaySec: parseFloat(
      process.env.BOOKMARK_ANIMATION_SPARKLE_DELAY_SEC || '1.5'
    ),
  },

  // Export settings
  export: {
    // Filename template for bookmark exports (use {date} placeholder)
    filenameTemplate:
      process.env.BOOKMARK_EXPORT_FILENAME_TEMPLATE ||
      'bookmarks-export-{date}.json',
  },
} as const

export type BookmarksConfig = typeof bookmarksConfig
