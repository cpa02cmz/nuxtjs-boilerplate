// Spacing Configuration - Centralized spacing values for consistency
// Flexy hates hardcoded values! All spacing values are now configurable.

/**
 * Spacing scale in rem units (based on 16px root font size)
 * xs: 0.125rem = 2px
 * sm: 0.25rem = 4px
 * md: 0.375rem = 6px
 * base: 0.5rem = 8px
 * lg: 0.75rem = 12px
 * xl: 1rem = 16px
 * 2xl: 1.5rem = 24px
 * 3xl: 2rem = 32px
 */
export const spacingConfig = {
  // Base spacing scale
  scale: {
    xs: process.env.SPACING_XS || '0.125rem', // 2px
    sm: process.env.SPACING_SM || '0.25rem', // 4px
    md: process.env.SPACING_MD || '0.375rem', // 6px
    base: process.env.SPACING_BASE || '0.5rem', // 8px
    lg: process.env.SPACING_LG || '0.75rem', // 12px
    xl: process.env.SPACING_XL || '1rem', // 16px
    '2xl': process.env.SPACING_2XL || '1.5rem', // 24px
    '3xl': process.env.SPACING_3XL || '2rem', // 32px
  },

  // Padding presets
  padding: {
    xs: process.env.PADDING_XS || '0.125rem',
    sm: process.env.PADDING_SM || '0.25rem',
    md: process.env.PADDING_MD || '0.375rem',
    base: process.env.PADDING_BASE || '0.5rem',
    lg: process.env.PADDING_LG || '0.75rem',
    xl: process.env.PADDING_XL || '1rem',
    '2xl': process.env.PADDING_2XL || '1.5rem',
    // Common padding combinations
    smMd: process.env.PADDING_SM_MD || '0.25rem 0.5rem', // Small vertical, medium horizontal
    smLg: process.env.PADDING_SM_LG || '0.25rem 0.75rem', // Small vertical, large horizontal
    baseLg: process.env.PADDING_BASE_LG || '0.5rem 1rem', // Base vertical, large horizontal
    baseXl: process.env.PADDING_BASE_XL || '0.5rem 1.5rem', // Base vertical, xl horizontal
  },

  // Gap presets
  gap: {
    xs: process.env.GAP_XS || '0.125rem',
    sm: process.env.GAP_SM || '0.25rem',
    md: process.env.GAP_MD || '0.375rem',
    base: process.env.GAP_BASE || '0.5rem',
    lg: process.env.GAP_LG || '0.75rem',
    xl: process.env.GAP_XL || '1rem',
  },

  // Margin presets
  margin: {
    xs: process.env.MARGIN_XS || '0.125rem',
    sm: process.env.MARGIN_SM || '0.25rem',
    md: process.env.MARGIN_MD || '0.375rem',
    base: process.env.MARGIN_BASE || '0.5rem',
    lg: process.env.MARGIN_LG || '0.75rem',
    xl: process.env.MARGIN_XL || '1rem',
    '2xl': process.env.MARGIN_2XL || '1.5rem',
    negativeSm: process.env.MARGIN_NEGATIVE_SM || '-0.25rem',
  },

  // Border radius presets
  borderRadius: {
    none: process.env.BORDER_RADIUS_NONE || '0',
    sm: process.env.BORDER_RADIUS_SM || '0.125rem', // 2px
    md: process.env.BORDER_RADIUS_MD || '0.25rem', // 4px
    base: process.env.BORDER_RADIUS_BASE || '0.375rem', // 6px - most common
    lg: process.env.BORDER_RADIUS_LG || '0.5rem', // 8px
    xl: process.env.BORDER_RADIUS_XL || '0.75rem', // 12px
    full: process.env.BORDER_RADIUS_FULL || '9999px', // pill shape
  },

  // Width/Height presets
  size: {
    auto: 'auto',
    full: '100%',
    screen: '100vw',
    px: '1px',
    // Icon sizes
    iconSm: process.env.ICON_SIZE_SM || '0.75rem', // 12px
    iconBase: process.env.ICON_SIZE_BASE || '1rem', // 16px
    iconLg: process.env.ICON_SIZE_LG || '1.5rem', // 24px
    iconXl: process.env.ICON_SIZE_XL || '2rem', // 32px
  },

  // Outline presets
  outline: {
    width: process.env.OUTLINE_WIDTH || '2px',
    style: process.env.OUTLINE_STYLE || 'solid',
    offset: process.env.OUTLINE_OFFSET || '2px',
  },

  // Border presets
  border: {
    width: process.env.BORDER_WIDTH || '1px',
    style: process.env.BORDER_STYLE || 'solid',
    transparent: process.env.BORDER_TRANSPARENT || '1px solid transparent',
  },
} as const

export type SpacingConfig = typeof spacingConfig
