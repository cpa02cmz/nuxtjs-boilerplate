// Component Styles Configuration - Component-specific styling values
// Flexy hates hardcoded values! All component styles are now configurable.
import { easingConfig } from './easing.config'

// Convenience alias for cubic-bezier easing functions
const EASING = easingConfig.cubicBezier

export const componentStylesConfig = {
  // Status Manager Component Styles
  statusManager: {
    padding: process.env.STATUS_MANAGER_PADDING || '1rem',
    borderWidth: process.env.STATUS_MANAGER_BORDER_WIDTH || '1px',
    borderStyle: process.env.STATUS_MANAGER_BORDER_STYLE || 'solid',
    borderColor: process.env.STATUS_MANAGER_BORDER_COLOR || '#e5e7eb',
    borderRadius: process.env.STATUS_MANAGER_BORDER_RADIUS || '0.5rem',
    backgroundColor: process.env.STATUS_MANAGER_BG_COLOR || '#fafafa',
    titleFontSize: process.env.STATUS_MANAGER_TITLE_SIZE || '1.25rem',
    titleFontWeight: process.env.STATUS_MANAGER_TITLE_WEIGHT || '600',
    titleMarginBottom: process.env.STATUS_MANAGER_TITLE_MARGIN || '1rem',
    titleColor: process.env.STATUS_MANAGER_TITLE_COLOR || '#1f2937',
    controlGap: process.env.STATUS_MANAGER_CONTROL_GAP || '1rem',
    labelColor: process.env.STATUS_MANAGER_LABEL_COLOR || '#374151',
    labelFontSize: process.env.STATUS_MANAGER_LABEL_SIZE || '0.875rem',
    inputPadding: process.env.STATUS_MANAGER_INPUT_PADDING || '0.5rem',
    inputBorderColor: process.env.STATUS_MANAGER_INPUT_BORDER || '#d1d5db',
    inputBorderRadius: process.env.STATUS_MANAGER_INPUT_RADIUS || '0.375rem',
    inputFontSize: process.env.STATUS_MANAGER_INPUT_SIZE || '1rem',
    notesMinHeight: process.env.STATUS_MANAGER_NOTES_MIN_HEIGHT || '60px',
    buttonPadding: process.env.STATUS_MANAGER_BUTTON_PADDING || '0.5rem 1rem',
    buttonBgColor: process.env.STATUS_MANAGER_BUTTON_BG || '#10b981',
    buttonTextColor: process.env.STATUS_MANAGER_BUTTON_TEXT || 'white',
    buttonBorderRadius: process.env.STATUS_MANAGER_BUTTON_RADIUS || '0.375rem',
    buttonFontWeight: process.env.STATUS_MANAGER_BUTTON_WEIGHT || '500',
    buttonFontSize: process.env.STATUS_MANAGER_BUTTON_SIZE || '1rem',
    buttonHoverBg: process.env.STATUS_MANAGER_BUTTON_HOVER_BG || '#059669',
    buttonDisabledBg:
      process.env.STATUS_MANAGER_BUTTON_DISABLED_BG || '#9ca3af',
    resultMarginTop: process.env.STATUS_MANAGER_RESULT_MARGIN || '1rem',
    resultPadding: process.env.STATUS_MANAGER_RESULT_PADDING || '0.75rem',
    resultBorderRadius: process.env.STATUS_MANAGER_RESULT_RADIUS || '0.375rem',
    // Message colors - Flexy hates hardcoded colors!
    message: {
      success: {
        textColor: process.env.STATUS_MSG_SUCCESS_TEXT || '#16a34a',
        bgColor: process.env.STATUS_MSG_SUCCESS_BG || '#dcfce7',
        borderColor: process.env.STATUS_MSG_SUCCESS_BORDER || '#bbf7d0',
      },
      error: {
        textColor: process.env.STATUS_MSG_ERROR_TEXT || '#dc2626',
        bgColor: process.env.STATUS_MSG_ERROR_BG || '#fee2e2',
        borderColor: process.env.STATUS_MSG_ERROR_BORDER || '#fecaca',
      },
    },
  },

  // Loading Spinner Component Styles
  loadingSpinner: {
    sizes: {
      small: {
        width: process.env.SPINNER_SMALL_WIDTH || '1rem',
        height: process.env.SPINNER_SMALL_HEIGHT || '1rem',
      },
      medium: {
        width: process.env.SPINNER_MEDIUM_WIDTH || '1.5rem',
        height: process.env.SPINNER_MEDIUM_HEIGHT || '1.5rem',
      },
      large: {
        width: process.env.SPINNER_LARGE_WIDTH || '3rem',
        height: process.env.SPINNER_LARGE_HEIGHT || '3rem',
      },
    },
    svg: {
      viewBoxMin: parseInt(process.env.SPINNER_VIEWBOX_MIN || '25'),
      viewBoxMax: parseInt(process.env.SPINNER_VIEWBOX_MAX || '50'),
      circleCx: parseInt(process.env.SPINNER_CIRCLE_CX || '50'),
      circleCy: parseInt(process.env.SPINNER_CIRCLE_CY || '50'),
      circleR: parseInt(process.env.SPINNER_CIRCLE_R || '20'),
      strokeWidth: parseInt(process.env.SPINNER_STROKE_WIDTH || '2'),
    },
    animation: {
      rotationDuration: process.env.SPINNER_ROTATION_DURATION || '2s',
      dashDuration: process.env.SPINNER_DASH_DURATION || '1.5s',
      reducedMotionPulseDuration:
        process.env.SPINNER_REDUCED_MOTION_DURATION || '2s',
    },
    label: {
      fontSize: process.env.SPINNER_LABEL_SIZE || '0.875rem',
      color: process.env.SPINNER_LABEL_COLOR || '#6b7280',
    },
    stroke: {
      width: parseInt(process.env.SPINNER_STROKE_WIDTH || '2'),
      dashArray: process.env.SPINNER_DASH_ARRAY || '1, 200',
      dashOffset: parseInt(process.env.SPINNER_DASH_OFFSET || '0'),
      // Animation keyframe values - Flexy hates hardcoded CSS!
      dashArrayMid: process.env.SPINNER_DASH_ARRAY_MID || '89, 200',
      dashOffsetMid: process.env.SPINNER_DASH_OFFSET_MID || '-35px',
      dashOffsetEnd: process.env.SPINNER_DASH_OFFSET_END || '-124px',
      // Reduced motion values
      reducedMotionDashArray:
        process.env.SPINNER_REDUCED_MOTION_DASH_ARRAY || '89, 200',
      reducedMotionDashOffset:
        process.env.SPINNER_REDUCED_MOTION_DASH_OFFSET || '-35px',
    },
  },

  // Empty State Component Styles
  emptyState: {
    illustrationSize: {
      width: process.env.EMPTY_STATE_ILLUSTRATION_WIDTH || '12rem',
      height: process.env.EMPTY_STATE_ILLUSTRATION_HEIGHT || '12rem',
    },
    iconSizes: {
      magnifyingGlass: process.env.EMPTY_STATE_ICON_MAGNIFY || '3rem',
      document: process.env.EMPTY_STATE_ICON_DOCUMENT || '4rem',
      star: process.env.EMPTY_STATE_ICON_STAR || '2rem',
      sparkles: process.env.EMPTY_STATE_ICON_SPARKLES || '1.5rem',
    },
    animation: {
      staggerDelayMs: parseInt(process.env.EMPTY_STATE_STAGGER_DELAY || '100'),
      floatDurationSec: parseInt(process.env.EMPTY_STATE_FLOAT_DURATION || '3'),
      pulseDurationSec: parseInt(process.env.EMPTY_STATE_PULSE_DURATION || '3'),
    },
    // SVG Illustration Coordinates - Flexy hates hardcoded values!
    illustration: {
      magnifyingGlass: {
        outerCircle: {
          cx: parseInt(process.env.EMPTY_STATE_OUTER_CIRCLE_CX || '11'),
          cy: parseInt(process.env.EMPTY_STATE_OUTER_CIRCLE_CY || '11'),
          r: parseInt(process.env.EMPTY_STATE_OUTER_CIRCLE_R || '7'),
          strokeWidth: parseFloat(
            process.env.EMPTY_STATE_OUTER_CIRCLE_STROKE || '1.5'
          ),
        },
        innerCircle: {
          cx: parseInt(process.env.EMPTY_STATE_INNER_CIRCLE_CX || '11'),
          cy: parseInt(process.env.EMPTY_STATE_INNER_CIRCLE_CY || '11'),
          r: parseInt(process.env.EMPTY_STATE_INNER_CIRCLE_R || '2'),
        },
        handle: {
          x1: parseInt(process.env.EMPTY_STATE_HANDLE_X1 || '21'),
          y1: parseInt(process.env.EMPTY_STATE_HANDLE_Y1 || '21'),
          x2: parseFloat(process.env.EMPTY_STATE_HANDLE_X2 || '16.65'),
          y2: parseFloat(process.env.EMPTY_STATE_HANDLE_Y2 || '16.65'),
        },
      },
      viewBox: process.env.EMPTY_STATE_VIEWBOX || '0 0 24 24',
    },
  },

  // Filter Chip Component Styles
  filterChip: {
    widths: {
      queryMax: process.env.FILTER_CHIP_QUERY_MAX || '200px',
      valueMax: process.env.FILTER_CHIP_VALUE_MAX || '150px',
    },
    animation: {
      staggerDelayMs: parseInt(process.env.FILTER_CHIP_STAGGER_DELAY || '100'),
    },
  },

  // Moderation Dashboard Styles
  moderationDashboard: {
    statusBgColors: {
      approved:
        process.env.MODERATION_STATUS_APPROVED_BG || 'rgba(40, 167, 69, 0.1)',
      rejected:
        process.env.MODERATION_STATUS_REJECTED_BG || 'rgba(220, 53, 69, 0.1)',
      flagged:
        process.env.MODERATION_STATUS_FLAGGED_BG || 'rgba(255, 193, 7, 0.1)',
      pending:
        process.env.MODERATION_STATUS_PENDING_BG || 'rgba(0, 123, 255, 0.1)',
    },
    cardShadow:
      process.env.MODERATION_CARD_SHADOW || '0 4px 8px rgba(0, 0, 0, 0.1)',
  },

  // Confetti Celebration Styles
  confetti: {
    particle: {
      startOffset: process.env.CONFETTI_PARTICLE_START_OFFSET || '-20px',
    },
  },

  // API Keys Component Styles - Flexy hates hardcoded CSS!
  apiKeys: {
    // Layout
    maxWidth: process.env.API_KEYS_MAX_WIDTH || '800px',
    padding: process.env.API_KEYS_PADDING || '1rem',
    headerMarginBottom: process.env.API_KEYS_HEADER_MARGIN || '1.5rem',

    // Form section
    formBackground: process.env.API_KEYS_FORM_BG || '#f8f9fa',
    formPadding: process.env.API_KEYS_FORM_PADDING || '1.5rem',
    formBorderRadius: process.env.API_KEYS_FORM_RADIUS || '0.5rem',
    formMarginBottom: process.env.API_KEYS_FORM_MARGIN || '1.5rem',

    // Form groups
    formGroupMarginBottom: process.env.API_KEYS_FORM_GROUP_MARGIN || '1rem',
    labelMarginBottom: process.env.API_KEYS_LABEL_MARGIN || '0.5rem',
    labelFontWeight: process.env.API_KEYS_LABEL_WEIGHT || '500',

    // Form controls
    inputWidth: process.env.API_KEYS_INPUT_WIDTH || '100%',
    inputPadding: process.env.API_KEYS_INPUT_PADDING || '0.5rem',
    inputBorder: process.env.API_KEYS_INPUT_BORDER || '1px solid #d1d5db',
    inputBorderRadius: process.env.API_KEYS_INPUT_RADIUS || '0.375rem',
    inputFontSize: process.env.API_KEYS_INPUT_SIZE || '1rem',
    inputMultipleMinHeight: process.env.API_KEYS_INPUT_MIN_HEIGHT || '100px',

    // Form actions
    actionsGap: process.env.API_KEYS_ACTIONS_GAP || '0.5rem',
    actionsMarginTop: process.env.API_KEYS_ACTIONS_MARGIN || '1rem',

    // List section
    listTitleMarginBottom: process.env.API_KEYS_LIST_TITLE_MARGIN || '1rem',
    emptyStatePadding: process.env.API_KEYS_EMPTY_PADDING || '2rem',
    emptyStateColor: process.env.API_KEYS_EMPTY_COLOR || '#6b7280',

    // Key items
    itemsGap: process.env.API_KEYS_ITEMS_GAP || '1rem',
    itemPadding: process.env.API_KEYS_ITEM_PADDING || '1rem',
    itemBorder: process.env.API_KEYS_ITEM_BORDER || '1px solid #e5e7eb',
    itemBorderRadius: process.env.API_KEYS_ITEM_RADIUS || '0.5rem',
    itemBackground: process.env.API_KEYS_ITEM_BG || 'white',

    // Key info
    keyNameFontWeight: process.env.API_KEYS_NAME_WEIGHT || '500',
    keyNameMarginBottom: process.env.API_KEYS_NAME_MARGIN || '0.25rem',
    keyMetaColor: process.env.API_KEYS_META_COLOR || '#6b7280',
    keyMetaFontSize: process.env.API_KEYS_META_SIZE || '0.875rem',
    keyMetaGap: process.env.API_KEYS_META_GAP || '1rem',

    // Permission tags
    permissionTagBackground: process.env.API_KEYS_PERM_BG || '#e0e7ff',
    permissionTagColor: process.env.API_KEYS_PERM_COLOR || '#4f46e5',
    permissionTagPadding: process.env.API_KEYS_PERM_PADDING || '0.25rem 0.5rem',
    permissionTagBorderRadius: process.env.API_KEYS_PERM_RADIUS || '9999px',
    permissionTagFontSize: process.env.API_KEYS_PERM_SIZE || '0.875rem',

    // Actions
    actionsGapSmall: process.env.API_KEYS_ACTIONS_GAP_SM || '0.5rem',

    // Modal
    modalOverlayBg: process.env.API_KEYS_MODAL_OVERLAY || 'rgba(0, 0, 0, 0.5)',
    modalZIndex: process.env.API_KEYS_MODAL_Z_INDEX || '1000',
    modalContentBackground: process.env.API_KEYS_MODAL_BG || 'white',
    modalContentPadding: process.env.API_KEYS_MODAL_PADDING || '1.5rem',
    modalContentBorderRadius: process.env.API_KEYS_MODAL_RADIUS || '0.5rem',
    modalContentMaxWidth: process.env.API_KEYS_MODAL_MAX_WIDTH || '500px',
    modalContentWidth: process.env.API_KEYS_MODAL_WIDTH || '90%',

    // Warning banner
    warningBackground: process.env.API_KEYS_WARNING_BG || '#fef3c7',
    warningColor: process.env.API_KEYS_WARNING_COLOR || '#92400e',
    warningPadding: process.env.API_KEYS_WARNING_PADDING || '0.75rem',
    warningBorderRadius: process.env.API_KEYS_WARNING_RADIUS || '0.375rem',
    warningMargin: process.env.API_KEYS_WARNING_MARGIN || '1rem 0',

    // Buttons
    buttonPadding: process.env.API_KEYS_BTN_PADDING || '0.5rem 1rem',
    buttonBorder: process.env.API_KEYS_BTN_BORDER || '1px solid transparent',
    buttonBorderRadius: process.env.API_KEYS_BTN_RADIUS || '0.375rem',
    buttonFontSize: process.env.API_KEYS_BTN_SIZE || '0.875rem',
    buttonFontWeight: process.env.API_KEYS_BTN_WEIGHT || '500',
    buttonTransition: process.env.API_KEYS_BTN_TRANSITION || 'all 0.15s ease',

    // Button variants
    buttonPrimaryBg: process.env.API_KEYS_BTN_PRIMARY_BG || '#3b82f6',
    buttonPrimaryColor: process.env.API_KEYS_BTN_PRIMARY_COLOR || 'white',
    buttonPrimaryHoverBg: process.env.API_KEYS_BTN_PRIMARY_HOVER || '#2563eb',

    buttonSecondaryBg: process.env.API_KEYS_BTN_SECONDARY_BG || '#6b7280',
    buttonSecondaryColor: process.env.API_KEYS_BTN_SECONDARY_COLOR || 'white',
    buttonSecondaryHoverBg:
      process.env.API_KEYS_BTN_SECONDARY_HOVER || '#374151',

    buttonDangerBg: process.env.API_KEYS_BTN_DANGER_BG || '#ef4444',
    buttonDangerColor: process.env.API_KEYS_BTN_DANGER_COLOR || 'white',
    buttonDangerHoverBg: process.env.API_KEYS_BTN_DANGER_HOVER || '#dc2626',

    buttonSuccessBg: process.env.API_KEYS_BTN_SUCCESS_BG || '#22c55e',
    buttonSuccessColor: process.env.API_KEYS_BTN_SUCCESS_COLOR || 'white',
    buttonSuccessHoverBg: process.env.API_KEYS_BTN_SUCCESS_HOVER || '#16a34a',

    // Button sizes
    buttonSmallPadding: process.env.API_KEYS_BTN_SM_PADDING || '0.25rem 0.5rem',
    buttonSmallFontSize: process.env.API_KEYS_BTN_SM_SIZE || '0.75rem',

    // Button icons
    buttonIconWidth: process.env.API_KEYS_BTN_ICON_WIDTH || '1rem',
    buttonIconHeight: process.env.API_KEYS_BTN_ICON_HEIGHT || '1rem',
    buttonIconMarginRight: process.env.API_KEYS_BTN_ICON_MARGIN || '0.5rem',

    // Animation
    checkAnimationDuration: process.env.API_KEYS_CHECK_DURATION || '300ms',
    checkAnimationEasing:
      process.env.API_KEYS_CHECK_EASING || EASING.SPRING_STANDARD,
    buttonTransitionDuration:
      process.env.API_KEYS_BTN_TRANSITION_DURATION || '200ms',
    buttonActiveScale: process.env.API_KEYS_BTN_ACTIVE_SCALE || '0.95',

    // Enhanced Empty State - Palette's micro-UX enhancement!
    emptyStateGradientStart:
      process.env.API_KEYS_EMPTY_GRADIENT_START || '#f0f9ff',
    emptyStateGradientEnd: process.env.API_KEYS_EMPTY_GRADIENT_END || '#e0f2fe',
    emptyStateBorderRadius: process.env.API_KEYS_EMPTY_RADIUS || '1rem',
    emptyStateBorder: process.env.API_KEYS_EMPTY_BORDER || '#bae6fd',
    emptyStateCircleBg: process.env.API_KEYS_EMPTY_CIRCLE_BG || '#0ea5e9',
    emptyStateIconColor: process.env.API_KEYS_EMPTY_ICON_COLOR || '#0284c7',
    emptyStateDotColor: process.env.API_KEYS_EMPTY_DOT_COLOR || '#38bdf8',
    emptyStateTitleColor: process.env.API_KEYS_EMPTY_TITLE_COLOR || '#0c4a6e',
    emptyStateDescColor: process.env.API_KEYS_EMPTY_DESC_COLOR || '#0369a1',
  },

  // Error Message Component Styles - Flexy hates hardcoded CSS!
  errorMessage: {
    // Container
    containerPosition: process.env.ERROR_MSG_CONTAINER_POSITION || 'relative',

    // Message box
    padding: process.env.ERROR_MSG_PADDING || '0.75rem',
    borderRadius: process.env.ERROR_MSG_RADIUS || '0.375rem',
    gap: process.env.ERROR_MSG_GAP || '0.5rem',
    position: process.env.ERROR_MSG_POSITION || 'relative',
    overflow: process.env.ERROR_MSG_OVERFLOW || 'hidden',

    // Dismissible variant
    dismissiblePaddingRight: process.env.ERROR_MSG_DISMISS_PADDING || '2.5rem',

    // Icon
    iconFlexShrink: process.env.ERROR_MSG_ICON_SHRINK || '0',
    iconDisplay: process.env.ERROR_MSG_ICON_DISPLAY || 'flex',
    iconAlignItems: process.env.ERROR_MSG_ICON_ALIGN || 'flex-start',

    // Icon pulse animation
    iconPulseDuration: process.env.ERROR_MSG_PULSE_DURATION || '2s',
    iconPulseScale: process.env.ERROR_MSG_PULSE_SCALE || '1.1',
    iconPulseOpacity: process.env.ERROR_MSG_PULSE_OPACITY || '0.8',

    // Content
    contentFlex: process.env.ERROR_MSG_CONTENT_FLEX || '1',
    contentMinWidth: process.env.ERROR_MSG_CONTENT_MIN_WIDTH || '0',

    // Text
    textFontSize: process.env.ERROR_MSG_TEXT_SIZE || '0.875rem',
    textLineHeight: process.env.ERROR_MSG_TEXT_LINE_HEIGHT || '1.25rem',

    // Action area
    actionMarginTop: process.env.ERROR_MSG_ACTION_MARGIN || '0.25rem',

    // Action button
    actionButtonFontSize: process.env.ERROR_MSG_ACTION_BTN_SIZE || '0.75rem',
    actionButtonFontWeight: process.env.ERROR_MSG_ACTION_BTN_WEIGHT || '500',
    actionButtonBackground:
      process.env.ERROR_MSG_ACTION_BTN_BG || 'transparent',
    actionButtonBorder: process.env.ERROR_MSG_ACTION_BTN_BORDER || 'none',
    actionButtonPadding:
      process.env.ERROR_MSG_ACTION_BTN_PADDING || '0.25rem 0.5rem',
    actionButtonBorderRadius:
      process.env.ERROR_MSG_ACTION_BTN_RADIUS || '0.25rem',
    actionButtonTransition:
      process.env.ERROR_MSG_ACTION_BTN_TRANSITION || 'all 0.2s ease',
    actionButtonMargin:
      process.env.ERROR_MSG_ACTION_BTN_MARGIN || '-0.25rem -0.5rem',
    actionButtonHoverBg:
      process.env.ERROR_MSG_ACTION_BTN_HOVER_BG || 'rgba(0, 0, 0, 0.05)',
    actionButtonFocusOutline:
      process.env.ERROR_MSG_ACTION_BTN_FOCUS || '2px solid currentColor',
    actionButtonFocusOffset: process.env.ERROR_MSG_ACTION_BTN_OFFSET || '2px',

    // Dismiss button
    dismissPosition: process.env.ERROR_MSG_DISMISS_POSITION || 'absolute',
    dismissTop: process.env.ERROR_MSG_DISMISS_TOP || '0.5rem',
    dismissRight: process.env.ERROR_MSG_DISMISS_RIGHT || '0.5rem',
    dismissPadding: process.env.ERROR_MSG_DISMISS_PADDING || '0.25rem',
    dismissBackground: process.env.ERROR_MSG_DISMISS_BG || 'transparent',
    dismissBorder: process.env.ERROR_MSG_DISMISS_BORDER || 'none',
    dismissBorderRadius: process.env.ERROR_MSG_DISMISS_RADIUS || '0.25rem',
    dismissOpacity: process.env.ERROR_MSG_DISMISS_OPACITY || '0.6',
    dismissTransition:
      process.env.ERROR_MSG_DISMISS_TRANSITION || 'all 0.2s ease',
    dismissHoverOpacity: process.env.ERROR_MSG_DISMISS_HOVER_OPACITY || '1',
    dismissHoverBg:
      process.env.ERROR_MSG_DISMISS_HOVER_BG || 'rgba(0, 0, 0, 0.05)',
    dismissHoverTransform:
      process.env.ERROR_MSG_DISMISS_HOVER_TRANSFORM || 'rotate(90deg)',
    dismissFocusOutline:
      process.env.ERROR_MSG_DISMISS_FOCUS || '2px solid currentColor',
    dismissFocusOffset: process.env.ERROR_MSG_DISMISS_OFFSET || '2px',

    // Progress bar
    progressPosition: process.env.ERROR_MSG_PROGRESS_POSITION || 'absolute',
    progressBottom: process.env.ERROR_MSG_PROGRESS_BOTTOM || '0',
    progressLeft: process.env.ERROR_MSG_PROGRESS_LEFT || '0',
    progressRight: process.env.ERROR_MSG_PROGRESS_RIGHT || '0',
    progressHeight: process.env.ERROR_MSG_PROGRESS_HEIGHT || '3px',
    progressBgColor: process.env.ERROR_MSG_PROGRESS_BG || 'rgba(0, 0, 0, 0.1)',
    progressBarHeight: process.env.ERROR_MSG_PROGRESS_BAR_HEIGHT || '100%',
    progressBarOpacity: process.env.ERROR_MSG_PROGRESS_BAR_OPACITY || '0.3',
    progressBarTransformOrigin: process.env.ERROR_MSG_PROGRESS_ORIGIN || 'left',

    // Undo button - Palette's micro-UX enhancement
    undoPosition: process.env.ERROR_MSG_UNDO_POSITION || 'relative',
    undoDisplay: process.env.ERROR_MSG_UNDO_DISPLAY || 'inline-flex',
    undoAlignItems: process.env.ERROR_MSG_UNDO_ALIGN || 'center',
    undoPadding: process.env.ERROR_MSG_UNDO_PADDING || '0.5rem 0.75rem',
    undoMarginBottom: process.env.ERROR_MSG_UNDO_MARGIN || '0.5rem',
    undoFontSize: process.env.ERROR_MSG_UNDO_SIZE || '0.875rem',
    undoFontWeight: process.env.ERROR_MSG_UNDO_WEIGHT || '500',
    undoColor: process.env.ERROR_MSG_UNDO_COLOR || '#92400e',
    undoBackground: process.env.ERROR_MSG_UNDO_BG || '#fffbeb',
    undoBorder: process.env.ERROR_MSG_UNDO_BORDER || '1px solid #fcd34d',
    undoBorderRadius: process.env.ERROR_MSG_UNDO_RADIUS || '0.375rem',
    undoCursor: process.env.ERROR_MSG_UNDO_CURSOR || 'pointer',
    undoTransition: process.env.ERROR_MSG_UNDO_TRANSITION || 'all 0.2s ease',
    undoOverflow: process.env.ERROR_MSG_UNDO_OVERFLOW || 'hidden',
    undoAnimation:
      process.env.ERROR_MSG_UNDO_ANIMATION ||
      'undo-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    // Undo hover
    undoHoverBackground: process.env.ERROR_MSG_UNDO_HOVER_BG || '#fef3c7',
    undoHoverBorderColor: process.env.ERROR_MSG_UNDO_HOVER_BORDER || '#f59e0b',
    undoHoverTransform:
      process.env.ERROR_MSG_UNDO_HOVER_TRANSFORM || 'translateY(-1px)',
    undoHoverShadow:
      process.env.ERROR_MSG_UNDO_HOVER_SHADOW || '0 2px 4px rgba(0, 0, 0, 0.1)',

    // Undo focus
    undoFocusShadow:
      process.env.ERROR_MSG_UNDO_FOCUS_SHADOW ||
      '0 0 0 2px #fff, 0 0 0 4px #f59e0b',

    // Undo active
    undoActiveTransform:
      process.env.ERROR_MSG_UNDO_ACTIVE_TRANSFORM || 'translateY(0)',

    // Undo progress bar
    undoProgressPosition:
      process.env.ERROR_MSG_UNDO_PROGRESS_POSITION || 'absolute',
    undoProgressBottom: process.env.ERROR_MSG_UNDO_PROGRESS_BOTTOM || '0',
    undoProgressLeft: process.env.ERROR_MSG_UNDO_PROGRESS_LEFT || '0',
    undoProgressHeight: process.env.ERROR_MSG_UNDO_PROGRESS_HEIGHT || '2px',
    undoProgressTransition:
      process.env.ERROR_MSG_UNDO_PROGRESS_TRANSITION || 'width 0.05s linear',

    // Undo animation keyframes
    undoSlideInDuration: process.env.ERROR_MSG_UNDO_SLIDE_DURATION || '0.3s',
    undoSlideInEasing:
      process.env.ERROR_MSG_UNDO_SLIDE_EASING || EASING.MATERIAL_STANDARD,
    undoSlideInStartOpacity:
      process.env.ERROR_MSG_UNDO_SLIDE_OPACITY_START || '0',
    undoSlideInStartTransform:
      process.env.ERROR_MSG_UNDO_SLIDE_TRANSFORM_START ||
      'translateY(-8px) scale(0.95)',
    undoSlideInMidTransform:
      process.env.ERROR_MSG_UNDO_SLIDE_TRANSFORM_MID ||
      'translateY(2px) scale(1.02)',
    undoSlideInEndOpacity: process.env.ERROR_MSG_UNDO_SLIDE_OPACITY_END || '1',
    undoSlideInEndTransform:
      process.env.ERROR_MSG_UNDO_SLIDE_TRANSFORM_END ||
      'translateY(0) scale(1)',

    // Screen reader only
    srOnlyPosition: process.env.ERROR_MSG_SR_POSITION || 'absolute',
    srOnlyWidth: process.env.ERROR_MSG_SR_WIDTH || '1px',
    srOnlyHeight: process.env.ERROR_MSG_SR_HEIGHT || '1px',
    srOnlyPadding: process.env.ERROR_MSG_SR_PADDING || '0',
    srOnlyMargin: process.env.ERROR_MSG_SR_MARGIN || '-1px',
    srOnlyOverflow: process.env.ERROR_MSG_SR_OVERFLOW || 'hidden',
    srOnlyClip: process.env.ERROR_MSG_SR_CLIP || 'rect(0, 0, 0, 0)',
    srOnlyWhiteSpace: process.env.ERROR_MSG_SR_WHITE_SPACE || 'nowrap',
    srOnlyBorderWidth: process.env.ERROR_MSG_SR_BORDER || '0',
  },

  // Error Boundary Component Styles
  errorBoundary: {
    minHeight: process.env.ERROR_BOUNDARY_MIN_HEIGHT || '300px',
    maxWidth: process.env.ERROR_BOUNDARY_MAX_WIDTH || '400px',
    iconMarginBottom: process.env.ERROR_BOUNDARY_ICON_MARGIN || '1rem',
    titleFontSize: process.env.ERROR_BOUNDARY_TITLE_SIZE || '1.5rem',
    titleMarginBottom: process.env.ERROR_BOUNDARY_TITLE_MARGIN || '0.5rem',
    messageFontSize: process.env.ERROR_BOUNDARY_MSG_SIZE || '0.875rem',
    buttonGap: process.env.ERROR_BOUNDARY_BUTTON_GAP || '0.5rem',
    buttonPadding: process.env.ERROR_BOUNDARY_BUTTON_PADDING || '0.5rem 1rem',
    buttonBorderRadius: process.env.ERROR_BOUNDARY_BUTTON_RADIUS || '0.375rem',
    buttonFontSize: process.env.ERROR_BOUNDARY_BUTTON_SIZE || '0.875rem',
  },

  // Reading Progress Component Styles
  readingProgress: {
    height: process.env.READING_PROGRESS_HEIGHT || '3px',
    gradient:
      process.env.READING_PROGRESS_GRADIENT ||
      'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
    shimmerWidth: process.env.READING_PROGRESS_SHIMMER_WIDTH || '100px',
    tooltipTop: process.env.READING_PROGRESS_TOOLTIP_TOP || '12px',
    tooltipPadding: process.env.READING_PROGRESS_TOOLTIP_PADDING || '6px 12px',
    tooltipBorderRadius: process.env.READING_PROGRESS_TOOLTIP_RADIUS || '8px',
    tooltipFontSize: process.env.READING_PROGRESS_TOOLTIP_SIZE || '12px',
    tooltipFontWeight: process.env.READING_PROGRESS_TOOLTIP_WEIGHT || '600',
    minHeightBreakpoint: parseInt(
      process.env.READING_PROGRESS_MIN_HEIGHT || '600'
    ),
  },

  // Scroll To Top Component Styles
  scrollToTop: {
    position: {
      bottom: process.env.SCROLLTOTOP_POSITION_BOTTOM || '2rem',
      right: process.env.SCROLLTOTOP_POSITION_RIGHT || '2rem',
    },
    size: {
      width: process.env.SCROLLTOTOP_WIDTH || '48px',
      height: process.env.SCROLLTOTOP_HEIGHT || '48px',
    },
    mobile: {
      bottom: process.env.SCROLLTOTOP_MOBILE_BOTTOM || '1.5rem',
      right: process.env.SCROLLTOTOP_MOBILE_RIGHT || '1.5rem',
      width: process.env.SCROLLTOTOP_MOBILE_WIDTH || '44px',
      height: process.env.SCROLLTOTOP_MOBILE_HEIGHT || '44px',
    },
    progressRing: {
      viewBox: process.env.SCROLLTOTOP_VIEWBOX || '0 0 48 48',
      center: parseInt(process.env.SCROLLTOTOP_CENTER || '24'),
      radius: parseInt(process.env.SCROLLTOTOP_RADIUS || '20'),
      strokeWidth: parseInt(process.env.SCROLLTOTOP_STROKE_WIDTH || '3'),
    },
    transition: {
      progressRingDurationSec:
        process.env.SCROLLTOTOP_TRANSITION_DURATION || '0.1s',
    },
  },

  // KeyboardShortcutsHelp Component - Flexy hates hardcoded layout values!
  keyboardShortcuts: {
    // Modal z-index
    zIndex: process.env.KB_SHORTCUTS_Z_INDEX || 'z-[100]',
    // Backdrop blur duration
    backdropDuration:
      process.env.KB_SHORTCUTS_BACKDROP_DURATION || 'duration-200',
    // Modal content max height
    maxHeight: process.env.KB_SHORTCUTS_MAX_HEIGHT || 'max-h-[60vh]',
    // Modal width
    modalWidth: process.env.KB_SHORTCUTS_MODAL_WIDTH || 'max-w-lg',
  },

  // SearchBar Component
  searchBar: {
    // Input transition duration
    inputDuration: process.env.SEARCHBAR_INPUT_DURATION || 'duration-200',
    // Clear button transition
    clearButtonDuration: process.env.SEARCHBAR_CLEAR_DURATION || 'duration-200',
  },

  // ResourceShare Component
  resourceShare: {
    // Button transition duration
    buttonDuration: process.env.SHARE_BUTTON_DURATION || 'transition-colors',
  },

  // Submit Page
  submit: {
    // Form input transition
    inputDuration: process.env.SUBMIT_INPUT_DURATION || 'duration-200',
    // Progress bar transition
    progressDuration: process.env.SUBMIT_PROGRESS_DURATION || 'duration-300',
  },

  // Swagger UI Styles - Flexy hates hardcoded CSS values!
  swaggerUi: {
    topbar: {
      backgroundColor: process.env.SWAGGER_TOPBAR_BG || '#4f46e5',
    },
    info: {
      titleFontSize: process.env.SWAGGER_TITLE_SIZE || '28px',
      titleMarginBottom: process.env.SWAGGER_TITLE_MARGIN || '10px',
      margin: process.env.SWAGGER_INFO_MARGIN || '20px 0',
    },
  },
} as const

export type ComponentStylesConfig = typeof componentStylesConfig
