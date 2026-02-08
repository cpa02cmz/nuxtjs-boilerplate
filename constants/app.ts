/**
 * Application Constants
 * Centralized configuration for app branding, metadata, and core settings
 * Flexy approves - no more hardcoded values!
 */

// App branding
export const APP_NAME = 'Free Stuff on the Internet' as const
export const APP_SHORT_NAME = 'Free Resources' as const
export const APP_DESCRIPTION =
  'Discover amazing free resources available on the internet - from AI tools to hosting services.' as const
export const APP_AUTHOR = 'Free Stuff on the Internet' as const

// Language settings
export const DEFAULT_LANGUAGE = 'en' as const

// Copyright template
export const getCopyrightText = (year: number): string =>
  `© ${year} ${APP_NAME}. All rights reserved.`

// App URLs
export const OG_IMAGE_PATH = '/og-image.jpg' as const
export const OG_IMAGE_DIMENSIONS = {
  width: '1200',
  height: '630',
  type: 'image/jpeg',
} as const

// Favicon
export const FAVICON_PATH = '/favicon.ico' as const

// Theme colors
export const THEME_COLORS = {
  primary: '#4f46e5',
  background: '#ffffff',
  text: '#1f2937',
} as const

// Accessibility labels
export const ACCESSIBILITY_LABELS = {
  skipToMainContent: 'Skip to main content',
  searchResources: 'Search for free resources',
  returnToHome: `${APP_NAME} - Return to home page`,
  openMainMenu: 'Open main menu',
  closeMainMenu: 'Close main menu',
} as const

// Page titles
export const PAGE_TITLES = {
  home: `${APP_NAME} - Free Resources for Developers`,
  default: APP_NAME,
} as const

// Keywords for SEO
export const SEO_KEYWORDS = [
  'free resources',
  'AI tools',
  'hosting',
  'databases',
  'CDN',
  'VPS',
  'web development',
] as const
