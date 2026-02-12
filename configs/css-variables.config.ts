// CSS Variables Configuration - Centralized CSS values
// Flexy hates hardcoded values! All CSS values are now configurable.
import { EASING } from './easing.config'

/**
 * CSS Custom Properties Configuration
 * These values are injected into the CSS as custom properties (variables)
 * allowing for centralized theming and configuration.
 */
export const cssVariablesConfig = {
  // Focus styles for keyboard navigation
  focus: {
    outlineWidth: process.env.FOCUS_OUTLINE_WIDTH || '2px',
    outlineStyle: process.env.FOCUS_OUTLINE_STYLE || 'solid',
    outlineColor: process.env.FOCUS_OUTLINE_COLOR || '#1f2937', // gray-800
    outlineOffset: process.env.FOCUS_OUTLINE_OFFSET || '2px',
    highContrastOutlineWidth: process.env.FOCUS_HC_OUTLINE_WIDTH || '3px',
    highContrastOutlineColor: process.env.FOCUS_HC_OUTLINE_COLOR || '#000000',
  },

  // Skip link and accessibility styles
  accessibility: {
    skipLinkPadding: process.env.SKIP_LINK_PADDING || '8px',
    srOnlyWidth: process.env.SR_ONLY_WIDTH || '1px',
    srOnlyHeight: process.env.SR_ONLY_HEIGHT || '1px',
    srOnlyMargin: process.env.SR_ONLY_MARGIN || '-1px',
  },

  // Page transition animations
  transitions: {
    pageEnterDuration: process.env.TRANSITION_PAGE_ENTER_DURATION || '0.2s',
    pageLeaveDuration: process.env.TRANSITION_PAGE_LEAVE_DURATION || '0.2s',
    layoutDuration: process.env.TRANSITION_LAYOUT_DURATION || '0.2s',
    reducedMotionDuration:
      process.env.TRANSITION_REDUCED_MOTION_DURATION || '0.1s',
    easing: process.env.TRANSITION_EASING || 'ease',
  },

  // Page transition transforms
  transforms: {
    pageEnterY: process.env.TRANSFORM_PAGE_ENTER_Y || '8px',
    pageLeaveY: process.env.TRANSFORM_PAGE_LEAVE_Y || '-8px',
  },

  // Ripple effect animation
  ripple: {
    duration: process.env.RIPPLE_DURATION || '600ms',
    easing: process.env.RIPPLE_EASING || EASING.MATERIAL_STANDARD,
    scaleStart: parseFloat(process.env.RIPPLE_SCALE_START || '0'),
    scaleEnd: parseFloat(process.env.RIPPLE_SCALE_END || '4'),
    opacityStart: parseFloat(process.env.RIPPLE_OPACITY_START || '0.8'),
    opacityMid: parseFloat(process.env.RIPPLE_OPACITY_MID || '0.4'),
    opacityEnd: parseFloat(process.env.RIPPLE_OPACITY_END || '0'),
  },

  // High contrast mode colors
  highContrast: {
    backgroundColor: process.env.HC_BACKGROUND || '#ffffff',
    textColor: process.env.HC_TEXT || '#000000',
    linkColor: process.env.HC_LINK || '#0000ee',
    linkHoverColor: process.env.HC_LINK_HOVER || '#0000ee',
    borderWidth: process.env.HC_BORDER_WIDTH || '2px',
    borderColor: process.env.HC_BORDER_COLOR || '#000000',
  },

  // Reduced motion settings
  reducedMotion: {
    animationDuration:
      process.env.REDUCED_MOTION_ANIMATION_DURATION || '0.01ms',
    transitionDuration:
      process.env.REDUCED_MOTION_TRANSITION_DURATION || '0.01ms',
  },
} as const

/**
 * Generate CSS custom properties string for injection into global styles
 */
export function generateCSSVariables(): string {
  const config = cssVariablesConfig

  return `
    :root {
      /* Focus styles */
      --focus-outline-width: ${config.focus.outlineWidth};
      --focus-outline-style: ${config.focus.outlineStyle};
      --focus-outline-color: ${config.focus.outlineColor};
      --focus-outline-offset: ${config.focus.outlineOffset};
      --focus-hc-outline-width: ${config.focus.highContrastOutlineWidth};
      --focus-hc-outline-color: ${config.focus.highContrastOutlineColor};

      /* Accessibility */
      --skip-link-padding: ${config.accessibility.skipLinkPadding};
      --sr-only-width: ${config.accessibility.srOnlyWidth};
      --sr-only-height: ${config.accessibility.srOnlyHeight};
      --sr-only-margin: ${config.accessibility.srOnlyMargin};

      /* Transitions */
      --transition-page-enter-duration: ${config.transitions.pageEnterDuration};
      --transition-page-leave-duration: ${config.transitions.pageLeaveDuration};
      --transition-layout-duration: ${config.transitions.layoutDuration};
      --transition-reduced-motion-duration: ${config.transitions.reducedMotionDuration};
      --transition-easing: ${config.transitions.easing};

      /* Transforms */
      --transform-page-enter-y: ${config.transforms.pageEnterY};
      --transform-page-leave-y: ${config.transforms.pageLeaveY};

      /* Ripple */
      --ripple-duration: ${config.ripple.duration};
      --ripple-easing: ${config.ripple.easing};

      /* High Contrast */
      --hc-background: ${config.highContrast.backgroundColor};
      --hc-text: ${config.highContrast.textColor};
      --hc-link: ${config.highContrast.linkColor};
      --hc-link-hover: ${config.highContrast.linkHoverColor};
      --hc-border-width: ${config.highContrast.borderWidth};
      --hc-border-color: ${config.highContrast.borderColor};

      /* Reduced Motion */
      --reduced-motion-animation-duration: ${config.reducedMotion.animationDuration};
      --reduced-motion-transition-duration: ${config.reducedMotion.transitionDuration};
    }
  `
}

export type CSSVariablesConfig = typeof cssVariablesConfig
