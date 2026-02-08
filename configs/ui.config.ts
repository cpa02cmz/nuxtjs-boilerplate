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

  // Virtual List Settings
  virtualList: {
    containerHeight: process.env.VIRTUAL_LIST_HEIGHT || 'calc(100vh - 200px)',
    overscan: parseInt(process.env.VIRTUAL_LIST_OVERSCAN || '5'),
  },

  // Search Suggestions
  searchSuggestions: {
    maxRecentSearches: parseInt(process.env.SEARCH_MAX_RECENT || '10'),
    clearHistoryLabel:
      process.env.SEARCH_CLEAR_HISTORY_LABEL || 'Clear History',
  },

  // Review Queue
  reviewQueue: {
    filterLabelAll: process.env.REVIEW_FILTER_ALL || 'All Statuses',
    filterLabelPending: process.env.REVIEW_FILTER_PENDING || 'Pending',
    filterLabelApproved: process.env.REVIEW_FILTER_APPROVED || 'Approved',
    filterLabelRejected: process.env.REVIEW_FILTER_REJECTED || 'Rejected',
    metaLabelCategory: process.env.REVIEW_META_CATEGORY || 'Category:',
    metaLabelSubmittedBy:
      process.env.REVIEW_META_SUBMITTED_BY || 'Submitted by:',
    metaLabelSubmitted: process.env.REVIEW_META_SUBMITTED || 'Submitted:',
  },

  // Status Manager
  statusManager: {
    statusOptions: [
      { value: 'ACTIVE', label: process.env.STATUS_LABEL_ACTIVE || 'Active' },
      {
        value: 'DEPRECATED',
        label: process.env.STATUS_LABEL_DEPRECATED || 'Deprecated',
      },
      {
        value: 'DISCONTINUED',
        label: process.env.STATUS_LABEL_DISCONTINUED || 'Discontinued',
      },
    ],
    updateButtonLabel: process.env.STATUS_UPDATE_BTN_LABEL || 'Update Status',
  },

  // Accessibility Labels
  accessibility: {
    skipToMain: process.env.A11Y_SKIP_TO_MAIN || 'Skip to main content',
    loadingContent: process.env.A11Y_LOADING_CONTENT || 'Loading content...',
    closeModal: process.env.A11Y_CLOSE_MODAL || 'Close modal',
    openMenu: process.env.A11Y_OPEN_MENU || 'Open menu',
    closeMenu: process.env.A11Y_CLOSE_MENU || 'Close menu',
    searchAriaLabel:
      process.env.A11Y_SEARCH_LABEL || 'Search for free resources',
    navAriaLabel: process.env.A11Y_NAV_LABEL || 'Main navigation',
  },

  // Loading Messages
  loading: {
    default: process.env.LOADING_DEFAULT || 'Loading...',
    updating: process.env.LOADING_UPDATING || 'Updating...',
    content: process.env.LOADING_CONTENT || 'Loading content...',
  },

  // Placeholders
  placeholders: {
    filterByCategory:
      process.env.PLACEHOLDER_FILTER_CATEGORY || 'Filter by category...',
    search: process.env.PLACEHOLDER_SEARCH || 'Search...',
  },

  // Error Handler
  errorHandler: {
    historyLimit: parseInt(process.env.ERROR_HISTORY_LIMIT || '50'),
  },

  // Resource Detail Page
  resourceDetail: {
    placeholderImage: process.env.PLACEHOLDER_IMAGE || '/placeholder-image.jpg',
  },
} as const

export type UiConfig = typeof uiConfig
