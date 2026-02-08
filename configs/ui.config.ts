// UI Configuration - UI/UX Settings
// Flexy hates hardcoded values! All UI settings are now configurable.

export const uiConfig = {
  // Toast/Notification Settings
  toast: {
    // Display durations (ms)
    duration: {
      success: parseInt(process.env.TOAST_DURATION_SUCCESS || '5000'),
      error: parseInt(process.env.TOAST_DURATION_ERROR || '10000'),
      warning: parseInt(process.env.TOAST_DURATION_WARNING || '7000'),
      info: parseInt(process.env.TOAST_DURATION_INFO || '5000'),
    },

    // Positioning
    position: {
      top: parseInt(process.env.TOAST_POSITION_TOP || '20'),
      right: parseInt(process.env.TOAST_POSITION_RIGHT || '20'),
      maxWidth: parseInt(process.env.TOAST_MAX_WIDTH || '400'),
      minWidth: parseInt(process.env.TOAST_MIN_WIDTH || '300'),
    },

    // Animation
    animation: {
      durationMs: parseInt(process.env.TOAST_ANIMATION_DURATION || '300'),
      checkIntervalMs: parseInt(process.env.TOAST_CHECK_INTERVAL || '100'),
    },
  },

  // Feedback Messages
  feedback: {
    displayDurationMs: parseInt(
      process.env.FEEDBACK_DISPLAY_DURATION || '3000'
    ),
    announcementClearMs: parseInt(
      process.env.ANNOUNCEMENT_CLEAR_DURATION || '3000'
    ),
    successMessageClearMs: parseInt(
      process.env.SUCCESS_MESSAGE_CLEAR_DURATION || '3000'
    ),
  },

  // Animation Settings
  animation: {
    fast: parseFloat(process.env.ANIMATION_DURATION_FAST || '0.2'),
    normal: parseFloat(process.env.ANIMATION_DURATION_NORMAL || '0.3'),
    slow: parseFloat(process.env.ANIMATION_DURATION_SLOW || '0.5'),
    leaveDurationMs: parseInt(process.env.ANIMATION_LEAVE_DURATION || '200'),
  },

  // Z-Index Scale
  zIndex: {
    toast: parseInt(process.env.Z_INDEX_TOAST || '9999'),
    modal: parseInt(process.env.Z_INDEX_MODAL || '9000'),
    dropdown: parseInt(process.env.Z_INDEX_DROPDOWN || '1000'),
    sticky: parseInt(process.env.Z_INDEX_STICKY || '100'),
  },

  // Icon Settings
  icons: {
    defaultSize: parseInt(process.env.ICON_DEFAULT_SIZE || '48'),
    resourceCardSize: parseInt(process.env.ICON_RESOURCE_CARD_SIZE || '48'),
  },

  // Image Settings
  images: {
    quality: parseInt(process.env.IMAGE_QUALITY || '80'),
    defaultWidth: parseInt(process.env.IMAGE_DEFAULT_WIDTH || '48'),
    defaultHeight: parseInt(process.env.IMAGE_DEFAULT_HEIGHT || '48'),
  },

  // Keyboard Shortcuts
  keyboard: {
    searchShortcut: process.env.KEYBOARD_SEARCH_SHORTCUT || '/',
  },

  // Resource Card
  resourceCard: {
    defaultButtonLabel:
      process.env.RESOURCE_CARD_BUTTON_LABEL || 'Get Free Access',
    newTabIndicator: process.env.RESOURCE_CARD_NEW_TAB_INDICATOR || '(new tab)',
    freeTierLabel: process.env.RESOURCE_CARD_FREE_TIER_LABEL || 'Free Tier:',
  },
} as const

export type UiConfig = typeof uiConfig
