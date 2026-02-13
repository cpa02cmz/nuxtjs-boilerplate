// Z-Index Configuration - Centralized z-index values for consistent layering
// Flexy hates hardcoded values! All z-index values are now configurable.

/**
 * Z-Index Layer Configuration
 * Defines the stacking order of UI layers to prevent z-index conflicts
 * and maintain consistent layering across the application.
 */
export const zIndexConfig = {
  // Base layer (ground level)
  base: parseInt(process.env.Z_INDEX_BASE || '0', 10),

  // Low layers (1-10) - minor elevation
  floatingLabel: parseInt(process.env.Z_INDEX_FLOATING_LABEL || '1', 10),
  listItem: parseInt(process.env.Z_INDEX_LIST_ITEM || '10', 10),

  // Medium layers (11-100) - components
  tooltip: parseInt(process.env.Z_INDEX_TOOLTIP || '50', 10),
  dropdown: parseInt(process.env.Z_INDEX_DROPDOWN || '50', 10),
  focusRing: parseInt(process.env.Z_INDEX_FOCUS_RING || '100', 10),

  // High layers (101-1000) - overlays and modals
  overlay: parseInt(process.env.Z_INDEX_OVERLAY || '40', 10),
  drawer: parseInt(process.env.Z_INDEX_DRAWER || '50', 10),
  modal: parseInt(process.env.Z_INDEX_MODAL || '50', 10),

  // Critical layers (1000+) - system elements
  toast: parseInt(process.env.Z_INDEX_TOAST || '50', 10),
  notification: parseInt(process.env.Z_INDEX_NOTIFICATION || '50', 10),

  // Highest layers (10000+) - accessibility and system critical
  skipLink: parseInt(process.env.Z_INDEX_SKIP_LINK || '50', 10),
  focusSpotlight: parseInt(process.env.Z_INDEX_FOCUS_SPOTLIGHT || '9999', 10),
  focusGlow: parseInt(process.env.Z_INDEX_FOCUS_GLOW || '9998', 10),
  loadingOverlay: parseInt(process.env.Z_INDEX_LOADING_OVERLAY || '9999', 10),
} as const

/**
 * Z-Index Scale Configuration
 * Defines semantic z-index categories for consistent usage
 */
export const zIndexScale = {
  // Hidden below normal content
  hidden: -1,

  // Ground level
  ground: 0,

  // Minor elevation for small elements
  low: {
    1: 1,
    5: 5,
    10: 10,
  },

  // Medium elevation for components
  medium: {
    20: 20,
    30: 30,
    40: 40,
    50: 50,
  },

  // High elevation for overlays
  high: {
    100: 100,
    200: 200,
    500: 500,
  },

  // Critical elevation for system elements
  critical: {
    1000: 1000,
    5000: 5000,
  },

  // Maximum elevation for accessibility
  maximum: {
    9998: 9998,
    9999: 9999,
  },
} as const

/**
 * CSS Custom Properties for Z-Index
 * Generates CSS variable definitions for z-index values
 */
export function generateZIndexCSSVariables(): string {
  const config = zIndexConfig

  return `
    :root {
      /* Z-Index Layers */
      --z-base: ${config.base};
      --z-floating-label: ${config.floatingLabel};
      --z-list-item: ${config.listItem};
      --z-tooltip: ${config.tooltip};
      --z-dropdown: ${config.dropdown};
      --z-focus-ring: ${config.focusRing};
      --z-overlay: ${config.overlay};
      --z-drawer: ${config.drawer};
      --z-modal: ${config.modal};
      --z-toast: ${config.toast};
      --z-notification: ${config.notification};
      --z-skip-link: ${config.skipLink};
      --z-focus-spotlight: ${config.focusSpotlight};
      --z-focus-glow: ${config.focusGlow};
      --z-loading-overlay: ${config.loadingOverlay};

      /* Z-Index Scale */
      --z-hidden: ${zIndexScale.hidden};
      --z-ground: ${zIndexScale.ground};
      --z-low-1: ${zIndexScale.low[1]};
      --z-low-5: ${zIndexScale.low[5]};
      --z-low-10: ${zIndexScale.low[10]};
      --z-medium-20: ${zIndexScale.medium[20]};
      --z-medium-30: ${zIndexScale.medium[30]};
      --z-medium-40: ${zIndexScale.medium[40]};
      --z-medium-50: ${zIndexScale.medium[50]};
      --z-high-100: ${zIndexScale.high[100]};
      --z-high-200: ${zIndexScale.high[200]};
      --z-high-500: ${zIndexScale.high[500]};
      --z-critical-1000: ${zIndexScale.critical[1000]};
      --z-critical-5000: ${zIndexScale.critical[5000]};
      --z-max-9998: ${zIndexScale.maximum[9998]};
      --z-max-9999: ${zIndexScale.maximum[9999]};
    }
  `
}

export type ZIndexConfig = typeof zIndexConfig
export type ZIndexScale = typeof zIndexScale
