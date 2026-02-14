// Typography Configuration - Centralized typography values for consistency
// Flexy hates hardcoded values! All typography values are now configurable.

/**
 * Typography scale in rem units (based on 16px root font size)
 * xs: 0.75rem = 12px
 * sm: 0.875rem = 14px - most common body text
 * base: 1rem = 16px
 * lg: 1.125rem = 18px
 * xl: 1.25rem = 20px
 * 2xl: 1.5rem = 24px
 */
export const typographyConfig = {
  // Font size scale
  fontSize: {
    xs: process.env.FONT_SIZE_XS || '0.75rem', // 12px
    sm: process.env.FONT_SIZE_SM || '0.875rem', // 14px - most common
    base: process.env.FONT_SIZE_BASE || '1rem', // 16px
    lg: process.env.FONT_SIZE_LG || '1.125rem', // 18px
    xl: process.env.FONT_SIZE_XL || '1.25rem', // 20px
    '2xl': process.env.FONT_SIZE_2XL || '1.5rem', // 24px
    '3xl': process.env.FONT_SIZE_3XL || '1.875rem', // 30px
  },

  // Line height scale
  lineHeight: {
    none: process.env.LINE_HEIGHT_NONE || '1',
    tight: process.env.LINE_HEIGHT_TIGHT || '1.25',
    snug: process.env.LINE_HEIGHT_SNUG || '1.375',
    normal: process.env.LINE_HEIGHT_NORMAL || '1.5',
    relaxed: process.env.LINE_HEIGHT_RELAXED || '1.625',
    loose: process.env.LINE_HEIGHT_LOOSE || '2',
    // Specific rem values
    sm: process.env.LINE_HEIGHT_SM || '1.25rem', // 20px
    base: process.env.LINE_HEIGHT_BASE || '1.5rem', // 24px
  },

  // Font weight scale
  fontWeight: {
    light: process.env.FONT_WEIGHT_LIGHT || '300',
    normal: process.env.FONT_WEIGHT_NORMAL || '400',
    medium: process.env.FONT_WEIGHT_MEDIUM || '500',
    semibold: process.env.FONT_WEIGHT_SEMIBOLD || '600',
    bold: process.env.FONT_WEIGHT_BOLD || '700',
  },

  // Letter spacing
  letterSpacing: {
    tighter: process.env.LETTER_SPACING_TIGHTER || '-0.05em',
    tight: process.env.LETTER_SPACING_TIGHT || '-0.025em',
    normal: process.env.LETTER_SPACING_NORMAL || '0',
    wide: process.env.LETTER_SPACING_WIDE || '0.025em',
    wider: process.env.LETTER_SPACING_WIDER || '0.05em',
  },

  // Font style
  fontStyle: {
    normal: 'normal',
    italic: 'italic',
  },

  // Text transform
  textTransform: {
    none: 'none',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
  },

  // Common typography combinations for components
  components: {
    // Body text - most common
    body: {
      fontSize: process.env.TYPOGRAPHY_BODY_SIZE || '0.875rem',
      lineHeight: process.env.TYPOGRAPHY_BODY_LINE_HEIGHT || '1.25rem',
      fontWeight: process.env.TYPOGRAPHY_BODY_WEIGHT || '400',
    },
    // Small text
    small: {
      fontSize: process.env.TYPOGRAPHY_SMALL_SIZE || '0.75rem',
      lineHeight: process.env.TYPOGRAPHY_SMALL_LINE_HEIGHT || '1rem',
      fontWeight: process.env.TYPOGRAPHY_SMALL_WEIGHT || '400',
    },
    // Labels and badges
    label: {
      fontSize: process.env.TYPOGRAPHY_LABEL_SIZE || '0.75rem',
      lineHeight: process.env.TYPOGRAPHY_LABEL_LINE_HEIGHT || '1rem',
      fontWeight: process.env.TYPOGRAPHY_LABEL_WEIGHT || '500',
    },
    // Headings
    headingSm: {
      fontSize: process.env.TYPOGRAPHY_HEADING_SM_SIZE || '1.25rem',
      fontWeight: process.env.TYPOGRAPHY_HEADING_SM_WEIGHT || '600',
    },
    headingBase: {
      fontSize: process.env.TYPOGRAPHY_HEADING_BASE_SIZE || '1.5rem',
      fontWeight: process.env.TYPOGRAPHY_HEADING_BASE_WEIGHT || '600',
    },
  },
} as const

export type TypographyConfig = typeof typographyConfig
