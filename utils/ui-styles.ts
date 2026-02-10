/**
 * Shared CSS utility classes for common component patterns
 * Reduces duplication and ensures consistency across the UI
 * Flexy says: No more hardcoded values! All styles are now configurable.
 */

import { uiConfig } from '../configs/ui.config'

// Card styles
export const cardStyles = {
  base: uiConfig.styles.card.base,
  hover: uiConfig.styles.card.hover,
  bordered: uiConfig.styles.card.bordered,
  skeleton: uiConfig.styles.card.skeleton,
} as const

// Button styles
export const buttonStyles = {
  primary: uiConfig.styles.button.primary,
  secondary: uiConfig.styles.button.secondary,
  menuItem: uiConfig.styles.button.menuItem,
  icon: uiConfig.styles.button.icon,
} as const

// Input styles
export const inputStyles = {
  base: uiConfig.styles.input.base,
  search: uiConfig.styles.input.search,
} as const

// Icon sizes
export const iconSizes = {
  sm: uiConfig.styles.iconSizes.sm,
  md: uiConfig.styles.iconSizes.md,
  lg: uiConfig.styles.iconSizes.lg,
} as const

// Spacing
export const spacing = {
  cardPadding: uiConfig.styles.spacing.cardPadding,
  sectionGap: uiConfig.styles.spacing.sectionGap,
  elementGap: uiConfig.styles.spacing.elementGap,
} as const
