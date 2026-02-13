// UI Configuration - UI/UX Settings
// Flexy hates hardcoded values! All UI settings are now configurable.

export const uiConfig = {
  // Tooltip Settings - Flexy hates hardcoded viewport padding!
  tooltip: {
    // Viewport padding to prevent tooltips from being cut off (px)
    viewportPadding: parseInt(process.env.TOOLTIP_VIEWPORT_PADDING || '8'),
  },

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
    // Reset confirmation duration for filter reset
    resetConfirmationMs: parseInt(
      process.env.FEEDBACK_RESET_CONFIRMATION_MS || '1500'
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

  // Toast Styles - Flexy hates hardcoded CSS values!
  toastStyles: {
    padding: process.env.TOAST_PADDING || '0.75rem',
    borderRadius: process.env.TOAST_BORDER_RADIUS || '0.5rem',
    borderLeftWidth: process.env.TOAST_BORDER_LEFT_WIDTH || '4px',
    gap: process.env.TOAST_GAP || '0.5rem',
    minWidth: process.env.TOAST_MIN_WIDTH_CSS || '300px',
    animationDuration: process.env.TOAST_ANIMATION_DURATION_CSS || '0.3s',
    colors: {
      success: {
        bg: process.env.TOAST_SUCCESS_BG || '#f0fdf4',
        border: process.env.TOAST_SUCCESS_BORDER || '#22c55e',
        text: process.env.TOAST_SUCCESS_TEXT || '#166534',
      },
      error: {
        bg: process.env.TOAST_ERROR_BG || '#fef2f2',
        border: process.env.TOAST_ERROR_BORDER || '#ef4444',
        text: process.env.TOAST_ERROR_TEXT || '#b91c1c',
      },
      warning: {
        bg: process.env.TOAST_WARNING_BG || '#fffbeb',
        border: process.env.TOAST_WARNING_BORDER || '#f59e0b',
        text: process.env.TOAST_WARNING_TEXT || '#92400e',
      },
      info: {
        bg: process.env.TOAST_INFO_BG || '#eff6ff',
        border: process.env.TOAST_INFO_BORDER || '#3b82f6',
        text: process.env.TOAST_INFO_TEXT || '#1e40af',
      },
    },
    icon: {
      marginRight: process.env.TOAST_ICON_MARGIN_RIGHT || '0.75rem',
      marginTop: process.env.TOAST_ICON_MARGIN_TOP || '0.125rem',
    },
    message: {
      fontWeight: process.env.TOAST_MESSAGE_FONT_WEIGHT || '500',
      fontSize: process.env.TOAST_MESSAGE_FONT_SIZE || '0.875rem',
      lineHeight: process.env.TOAST_MESSAGE_LINE_HEIGHT || '1.25rem',
    },
    description: {
      fontSize: process.env.TOAST_DESC_FONT_SIZE || '0.75rem',
      lineHeight: process.env.TOAST_DESC_LINE_HEIGHT || '1rem',
      marginTop: process.env.TOAST_DESC_MARGIN_TOP || '0.25rem',
      opacity: parseFloat(process.env.TOAST_DESC_OPACITY || '0.8'),
    },
    close: {
      marginLeft: process.env.TOAST_CLOSE_MARGIN_LEFT || '0.5rem',
      padding: process.env.TOAST_CLOSE_PADDING || '0.25rem',
      borderRadius: process.env.TOAST_CLOSE_BORDER_RADIUS || '0.25rem',
      opacity: parseFloat(process.env.TOAST_CLOSE_OPACITY || '0.7'),
      hoverOpacity: parseFloat(process.env.TOAST_CLOSE_HOVER_OPACITY || '1'),
    },
    progress: {
      height: process.env.TOAST_PROGRESS_HEIGHT || '3px',
      opacity: parseFloat(process.env.TOAST_PROGRESS_OPACITY || '0.3'),
    },
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
    // Default button label for similar resources section - Flexy hates hardcoded defaults!
    defaultSimilarButtonLabel:
      process.env.RESOURCE_CARD_DEFAULT_SIMILAR_LABEL || 'Get Resource',
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

    // Focus and interaction animations
    focusPulseDurationMs: parseInt(process.env.TIMING_FOCUS_PULSE || '600'),

    // Idle pulse animation delay (for keyboard shortcut discoverability)
    idlePulseDelayMs: parseInt(process.env.TIMING_IDLE_PULSE_DELAY || '3000'),

    // Shortcut success animation duration (for positive reinforcement)
    shortcutSuccessDurationMs: parseInt(
      process.env.TIMING_SHORTCUT_SUCCESS || '600'
    ),

    // Search complete animation duration - shows checkmark when search finishes
    // Provides positive feedback and closes the interaction loop
    searchCompleteDurationMs: parseInt(
      process.env.TIMING_SEARCH_COMPLETE || '800'
    ),

    // Navigation delays
    comparisonNavigationDelayMs: parseInt(
      process.env.TIMING_COMPARISON_NAVIGATION || '400'
    ),

    // Focus restoration timing - Flexy hates hardcoded values!
    focusRestoreDelayMs: parseInt(process.env.TIMING_FOCUS_RESTORE || '100'),

    // Scroll timeout for reading progress time estimate (ms)
    scrollTimeoutMs: parseInt(process.env.TIMING_SCROLL_TIMEOUT || '1500'),
  },

  // Data Loading
  dataLoading: {
    maxRetries: parseInt(process.env.DATA_LOADING_MAX_RETRIES || '3'),
    retryDelayMs: parseInt(process.env.DATA_LOADING_RETRY_DELAY || '1000'),
  },

  // Scroll To Top Button - Flexy hates hardcoded scroll values!
  scrollToTop: {
    // Scroll threshold in pixels before showing button
    thresholdPx: parseInt(process.env.SCROLL_THRESHOLD_PX || '200'),
    // Circle radius for SVG progress indicator
    circleRadius: parseInt(process.env.SCROLL_CIRCLE_RADIUS || '20'),
    // Button position from bottom
    bottomPosition: process.env.SCROLL_BOTTOM_POSITION || '2rem',
    // Button position from right
    rightPosition: process.env.SCROLL_RIGHT_POSITION || '2rem',
    // Button width
    buttonWidth: process.env.SCROLL_BUTTON_WIDTH || '48px',
    // Button height
    buttonHeight: process.env.SCROLL_BUTTON_HEIGHT || '48px',
    // Animation duration when scrolling
    scrollDurationMs: parseInt(process.env.SCROLL_DURATION_MS || '1000'),
    // Announcement timeout
    announcementTimeoutMs: parseInt(
      process.env.SCROLL_ANNOUNCEMENT_TIMEOUT || '1000'
    ),
    // Accessibility announcement text
    announcementText:
      process.env.SCROLL_ANNOUNCEMENT_TEXT || 'Scrolling to top of page',
    // Keyboard shortcut feedback duration - how long to show button when triggered via keyboard
    // Palette's micro-UX enhancement for visual feedback
    keyboardShortcutFeedbackDurationMs: parseInt(
      process.env.SCROLL_KEYBOARD_FEEDBACK_DURATION || '600'
    ),
  },

  // Resource Status Component
  resourceStatus: {
    // Status labels - Flexy hates hardcoded strings!
    labels: {
      active: process.env.STATUS_LABEL_ACTIVE || 'Active',
      deprecated: process.env.STATUS_LABEL_DEPRECATED || 'Deprecated',
      discontinued: process.env.STATUS_LABEL_DISCONTINUED || 'Discontinued',
      unstable: process.env.STATUS_LABEL_UNSTABLE || 'Unstable',
      unknown: process.env.STATUS_LABEL_UNKNOWN || 'Unknown',
      updated: process.env.STATUS_LABEL_UPDATED || 'Updated',
      pending: process.env.STATUS_LABEL_PENDING || 'Pending',
    },
    // Status descriptions - Flexy hates hardcoded descriptions!
    descriptions: {
      active:
        process.env.STATUS_DESC_ACTIVE ||
        'This resource is currently active and fully maintained.',
      deprecated:
        process.env.STATUS_DESC_DEPRECATED ||
        'This resource is deprecated and may be discontinued soon.',
      discontinued:
        process.env.STATUS_DESC_DISCONTINUED ||
        'This resource has been discontinued and is no longer available.',
      unstable:
        process.env.STATUS_DESC_UNSTABLE ||
        'This resource is currently experiencing issues.',
      unknown:
        process.env.STATUS_DESC_UNKNOWN ||
        'The status of this resource is unknown.',
      updated:
        process.env.STATUS_DESC_UPDATED ||
        'This resource has been recently updated.',
      pending:
        process.env.STATUS_DESC_PENDING || 'This resource is pending review.',
    },
  },

  // Layout Containers - Flexy hates hardcoded max-width classes!
  containers: {
    // Page container widths using Tailwind classes
    narrow: process.env.CONTAINER_NARROW || 'max-w-3xl',
    medium: process.env.CONTAINER_MEDIUM || 'max-w-4xl',
    wide: process.env.CONTAINER_WIDE || 'max-w-6xl',
    full: process.env.CONTAINER_FULL || 'max-w-7xl',
    small: process.env.CONTAINER_SMALL || 'max-w-md',
    // Admin/Moderation pages
    admin: process.env.CONTAINER_ADMIN || '1200px',
  },

  // Layout Spacing - Flexy hates hardcoded spacing values!
  layout: {
    // Spacing scale (in rem units, base 0.25)
    spacing: {
      xs: parseFloat(process.env.LAYOUT_SPACING_XS || '0.25'),
      sm: parseFloat(process.env.LAYOUT_SPACING_SM || '0.5'),
      md: parseFloat(process.env.LAYOUT_SPACING_MD || '0.75'),
      lg: parseFloat(process.env.LAYOUT_SPACING_LG || '1'),
      xl: parseFloat(process.env.LAYOUT_SPACING_XL || '1.5'),
      '2xl': parseFloat(process.env.LAYOUT_SPACING_2XL || '2'),
    },

    // Border radius (in rem)
    borderRadius: {
      sm: parseFloat(process.env.LAYOUT_BORDER_RADIUS_SM || '0.25'),
      md: parseFloat(process.env.LAYOUT_BORDER_RADIUS_MD || '0.5'),
      lg: parseFloat(process.env.LAYOUT_BORDER_RADIUS_LG || '0.75'),
    },

    // Font sizes (in rem)
    fontSize: {
      sm: parseFloat(process.env.LAYOUT_FONT_SIZE_SM || '0.75'),
      md: parseFloat(process.env.LAYOUT_FONT_SIZE_MD || '0.875'),
      lg: parseFloat(process.env.LAYOUT_FONT_SIZE_LG || '1'),
    },

    // Line heights (in rem)
    lineHeight: {
      sm: parseFloat(process.env.LAYOUT_LINE_HEIGHT_SM || '1'),
      md: parseFloat(process.env.LAYOUT_LINE_HEIGHT_MD || '1.25'),
      lg: parseFloat(process.env.LAYOUT_LINE_HEIGHT_LG || '1.5'),
    },
  },

  // Haptic Feedback Patterns (ms)
  // Haptic Feedback Patterns (ms)
  haptics: {
    patterns: {
      light: parseInt(process.env.HAPTIC_LIGHT_MS || '10'),
      medium: parseInt(process.env.HAPTIC_MEDIUM_MS || '25'),
      heavy: parseInt(process.env.HAPTIC_HEAVY_MS || '50'),
      success: process.env.HAPTIC_SUCCESS_PATTERN || '50,100,50',
      warning: process.env.HAPTIC_WARNING_PATTERN || '30,50,30',
      error: process.env.HAPTIC_ERROR_PATTERN || '100,50,100',
    },
  },

  // UI Style Classes - Flexy hates hardcoded Tailwind classes!
  styles: {
    card: {
      base: process.env.UI_CARD_BASE || 'bg-white rounded-lg shadow',
      hover:
        process.env.UI_CARD_HOVER ||
        'bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300',
      bordered:
        process.env.UI_CARD_BORDERED ||
        'bg-white rounded-lg shadow border border-gray-200',
      skeleton:
        process.env.UI_CARD_SKELETON ||
        'bg-white p-6 rounded-lg shadow animate-pulse',
    },
    button: {
      primary:
        process.env.UI_BUTTON_PRIMARY ||
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 transition-colors duration-200',
      secondary:
        process.env.UI_BUTTON_SECONDARY ||
        'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      menuItem:
        process.env.UI_BUTTON_MENU_ITEM ||
        'flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
      icon:
        process.env.UI_BUTTON_ICON ||
        'p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
    },
    input: {
      base:
        process.env.UI_INPUT_BASE ||
        'block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      search:
        process.env.UI_INPUT_SEARCH ||
        'block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus-visible:ring-offset-2 focus-visible:ring-blue-600 hover:border-gray-400',
    },
    iconSizes: {
      sm: process.env.UI_ICON_SIZE_SM || 'w-4 h-4',
      md: process.env.UI_ICON_SIZE_MD || 'w-5 h-5',
      lg: process.env.UI_ICON_SIZE_LG || 'w-6 h-6',
    },
    spacing: {
      cardPadding: process.env.UI_SPACING_CARD_PADDING || 'p-6',
      sectionGap: process.env.UI_SPACING_SECTION_GAP || 'mt-6',
      elementGap: process.env.UI_SPACING_ELEMENT_GAP || 'mt-3',
    },
  },

  // Filter Chip Settings
  filterChip: {
    iconSize: process.env.FILTER_CHIP_ICON_SIZE || 'w-3.5 h-3.5',
    undoWindowMs: parseInt(process.env.FILTER_UNDO_WINDOW_MS || '5000'),
    undoProgressIntervalMs: parseInt(
      process.env.FILTER_UNDO_PROGRESS_INTERVAL || '100'
    ),
    undoProgressDecrement: parseInt(
      process.env.FILTER_UNDO_PROGRESS_DECREMENT || '2'
    ),
    announcementClearMs: parseInt(
      process.env.FILTER_ANNOUNCEMENT_CLEAR_MS || '1000'
    ),
    // Progress bar color transition thresholds (percent)
    progressThresholds: {
      high: parseInt(process.env.FILTER_PROGRESS_THRESHOLD_HIGH || '60'),
      medium: parseInt(process.env.FILTER_PROGRESS_THRESHOLD_MEDIUM || '30'),
      low: parseInt(process.env.FILTER_PROGRESS_THRESHOLD_LOW || '10'),
    },
  },

  // Offline Indicator Settings
  offlineIndicator: {
    backOnlineTimeoutMs: parseInt(
      process.env.OFFLINE_BACK_ONLINE_TIMEOUT || '3000'
    ),
    reconnectingTimeoutMs: parseInt(
      process.env.OFFLINE_RECONNECTING_TIMEOUT || '5000'
    ),
  },

  // PWA Install Prompt Settings
  pwaInstall: {
    promptDelayMs: parseInt(process.env.PWA_PROMPT_DELAY_MS || '1000'),
  },

  // User Preference Settings
  userPreference: {
    saveMessageTimeoutMs: parseInt(
      process.env.USER_PREF_SAVE_TIMEOUT || '3000'
    ),
  },

  // Undo/Deletion Settings - Flexy hates hardcoded undo durations!
  undo: {
    // Duration for undo action window (ms)
    durationMs: parseInt(process.env.UNDO_DURATION_MS || '5000'),
    // Progress update interval for undo timer (ms)
    progressIntervalMs: parseInt(process.env.UNDO_PROGRESS_INTERVAL_MS || '50'),
  },

  // Form Settings
  form: {
    // Default textarea rows
    textareaRows: parseInt(process.env.FORM_TEXTAREA_ROWS || '4'),
    // Input positioning values - Flexy hates hardcoded positioning!
    inputPositioning: {
      // Character counter right position (rem)
      counterRightRem: parseFloat(process.env.FORM_COUNTER_RIGHT_REM || '0.75'),
      // Validation checkmark right position (rem)
      checkmarkRightRem: parseFloat(
        process.env.FORM_CHECKMARK_RIGHT_REM || '4.5'
      ),
      // Validation checkmark top offset for textarea
      checkmarkTopRem: parseFloat(process.env.FORM_CHECKMARK_TOP_REM || '0.75'),
    },
  },

  // Load More Button Settings - Palette's micro-UX enhancement!
  loadMore: {
    // Button text for pagination
    buttonText: process.env.LOAD_MORE_BUTTON_TEXT || 'Load More',
    // Button text when loading
    loadingText: process.env.LOAD_MORE_LOADING_TEXT || 'Loading...',
    // Text shown when all resources are loaded (completion celebration)
    allLoadedText:
      process.env.LOAD_MORE_ALL_LOADED_TEXT || 'All resources loaded!',
    // Minimum loading duration for perceived performance (ms)
    minLoadingDurationMs: parseInt(process.env.LOAD_MORE_MIN_DURATION || '400'),
    // Spinner animation duration (seconds)
    spinnerDuration: parseFloat(
      process.env.LOAD_MORE_SPINNER_DURATION || '0.8'
    ),
    // Progress circle radius for SVG indicator (px) - Flexy hates hardcoded 46!
    progressCircleRadiusPx: parseInt(
      process.env.LOAD_MORE_PROGRESS_RADIUS_PX || '46'
    ),
  },

  // Skeleton Loader Dimensions - Flexy hates hardcoded skeleton sizes!
  skeleton: {
    // Title dimensions
    title: {
      height: process.env.SKELETON_TITLE_HEIGHT || 'h-8',
      width: process.env.SKELETON_TITLE_WIDTH || 'w-3/4',
    },
    // Subtitle/description dimensions
    subtitle: {
      height: process.env.SKELETON_SUBTITLE_HEIGHT || 'h-4',
      width: process.env.SKELETON_SUBTITLE_WIDTH || 'w-1/2',
    },
    // Image/hero section dimensions
    image: {
      height: process.env.SKELETON_IMAGE_HEIGHT || 'h-32',
      width: process.env.SKELETON_IMAGE_WIDTH || 'w-full',
    },
    // Content block dimensions
    content: {
      height: process.env.SKELETON_CONTENT_HEIGHT || 'h-4',
      width: process.env.SKELETON_CONTENT_WIDTH || 'w-2/3',
    },
    // Small element dimensions (badges, tags)
    small: {
      height: process.env.SKELETON_SMALL_HEIGHT || 'h-4',
      width: process.env.SKELETON_SMALL_WIDTH || 'w-1/4',
    },
    // Animation duration
    animationDuration: process.env.SKELETON_ANIMATION_DURATION || '1.5s',
  },

  // Ripple Effect Configuration - Flexy hates hardcoded animation values!
  ripple: {
    // Default ripple color
    color: process.env.RIPPLE_COLOR || 'rgba(255, 255, 255, 0.25)',
    // Animation duration in ms
    durationMs: parseInt(process.env.RIPPLE_DURATION_MS || '600'),
    // Easing function
    easing: process.env.RIPPLE_EASING || 'ease-out',
  },

  // Character Counter Configuration - Flexy hates hardcoded values!
  characterCounter: {
    // SVG circle radius for progress ring (px)
    ringRadiusPx: parseInt(process.env.CHAR_COUNTER_RING_RADIUS_PX || '12'),
    // Ring size in pixels
    ringSizePx: parseInt(process.env.CHAR_COUNTER_RING_SIZE_PX || '32'),
    // Stroke width for progress ring
    strokeWidthPx: parseInt(process.env.CHAR_COUNTER_STROKE_WIDTH_PX || '3'),
    // Near limit threshold (percentage)
    nearLimitPercent:
      parseFloat(process.env.CHAR_COUNTER_NEAR_LIMIT_PERCENT || '0.8') * 100,
    // Textarea line height for auto-resize calculations (px) - Flexy hates hardcoded 24!
    lineHeightPx: parseInt(process.env.CHAR_COUNTER_LINE_HEIGHT_PX || '24'),
  },
} as const

export type UiConfig = typeof uiConfig
