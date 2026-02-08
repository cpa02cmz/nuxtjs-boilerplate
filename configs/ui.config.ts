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
    // Category-specific button labels - Flexy hates hardcoded strings!
    categoryButtonLabels: {
      'ai tools': process.env.RESOURCE_CARD_BTN_AI_TOOLS || 'Explore AI Tools',
      vps: process.env.RESOURCE_CARD_BTN_VPS || 'Get VPS',
      'web hosting': process.env.RESOURCE_CARD_BTN_HOSTING || 'Find Hosting',
      databases: process.env.RESOURCE_CARD_BTN_DATABASES || 'Explore Databases',
      cdn: process.env.RESOURCE_CARD_BTN_CDN || 'Get CDN',
    },
  },

  // Dropdown and Suggestion Settings
  dropdown: {
    maxHeight: process.env.DROPDOWN_MAX_HEIGHT || 'max-h-96',
    filterMaxHeight: process.env.FILTER_MAX_HEIGHT || 'max-h-40',
  },

  // Icon Sizes
  iconSizes: {
    suggestion: process.env.ICON_SUGGESTION_SIZE || 'w-4 h-4',
    default: process.env.ICON_DEFAULT_CLASS || 'w-5 h-5',
  },

  // Filter Chip Settings
  chips: {
    queryMaxWidth: process.env.CHIP_QUERY_MAX_WIDTH || 'max-w-[200px]',
    valueMaxWidth: process.env.CHIP_VALUE_MAX_WIDTH || 'max-w-[150px]',
    badgePadding: process.env.CHIP_BADGE_PADDING || 'px-2 py-0.5',
  },

  // Virtual List Settings
  virtualList: {
    itemHeight: parseInt(process.env.VIRTUAL_LIST_ITEM_HEIGHT || '320'),
    overscan: parseInt(process.env.VIRTUAL_LIST_OVERSCAN || '5'),
    pageItemHeight: parseInt(
      process.env.VIRTUAL_LIST_PAGE_ITEM_HEIGHT || '340'
    ),
    pageOverscan: parseInt(process.env.VIRTUAL_LIST_PAGE_OVERSCAN || '3'),
  },

  // Scrollbar Settings
  scrollbar: {
    width: process.env.SCROLLBAR_WIDTH || '8px',
    trackColor: process.env.SCROLLBAR_TRACK_COLOR || '#f1f5f9',
    thumbColor: process.env.SCROLLBAR_THUMB_COLOR || '#cbd5e1',
    thumbHoverColor: process.env.SCROLLBAR_THUMB_HOVER_COLOR || '#94a3b8',
  },

  // Timing Values (ms)
  timing: {
    // Animation timeouts
    bookmarkAnimationMs: parseInt(
      process.env.TIMING_BOOKMARK_ANIMATION || '400'
    ),
    bookmarkStatusClearMs: parseInt(
      process.env.TIMING_BOOKMARK_STATUS_CLEAR || '1000'
    ),
    copySuccessTimeoutMs: parseInt(process.env.TIMING_COPY_SUCCESS || '2000'),
    searchTrackingDelayMs: parseInt(
      process.env.TIMING_SEARCH_TRACKING || '500'
    ),
  },

  // Data Loading
  dataLoading: {
    maxRetries: parseInt(process.env.DATA_LOADING_MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.DATA_LOADING_RETRY_DELAY || '1000'),
  },

  // Search Highlighting
  search: {
    highlightClasses:
      process.env.SEARCH_HIGHLIGHT_CLASSES || 'bg-yellow-200 text-gray-900',
  },
} as const

export type UiConfig = typeof uiConfig
