// Navigation Configuration - Navigation Items and Structure
// Flexy hates hardcoded values! All navigation settings are now configurable.

export interface NavigationItem {
  label: string
  to: string
  ariaLabel?: string
  activeClass?: string
  highlight?: boolean
  mobileOnly?: boolean
  desktopOnly?: boolean
}

export const navigationConfig = {
  // Main Navigation Items
  main: [
    {
      label: process.env.NAV_HOME_LABEL || 'Home',
      to: '/',
      ariaLabel:
        process.env.NAV_HOME_ARIA ||
        'Free Stuff on the Internet - Return to home page',
    },
    {
      label: process.env.NAV_SEARCH_LABEL || 'Search',
      to: '/search',
      activeClass: 'bg-gray-100',
    },
    {
      label: process.env.NAV_AI_KEYS_LABEL || 'AI Keys',
      to: '/ai-keys',
      activeClass: 'bg-gray-100',
    },
    {
      label: process.env.NAV_FAVORITES_LABEL || 'Favorites',
      to: '/favorites',
      activeClass: 'bg-gray-100',
    },
    {
      label: process.env.NAV_ABOUT_LABEL || 'About',
      to: '/about',
      activeClass: 'bg-gray-100',
    },
    {
      label: process.env.NAV_SUBMIT_LABEL || 'Submit',
      to: '/submit',
      activeClass: 'bg-gray-200',
      highlight: true,
    },
    {
      label: process.env.NAV_DEVELOPER_LABEL || 'Developer',
      to: '/developer',
      activeClass: 'bg-gray-100',
    },
    {
      label: process.env.NAV_API_ANALYTICS_LABEL || 'API Analytics',
      to: '/api-analytics',
      activeClass: 'bg-gray-100',
    },
  ] as NavigationItem[],

  // Footer Navigation
  footer: {
    copyright: {
      text: process.env.FOOTER_COPYRIGHT_TEXT || 'All rights reserved.',
      year: new Date().getFullYear(),
    },
  },

  // Mobile Menu
  mobile: {
    menuButton: {
      ariaLabelOpen: process.env.MOBILE_MENU_OPEN_LABEL || 'Open main menu',
      ariaLabelClose: process.env.MOBILE_MENU_CLOSE_LABEL || 'Close main menu',
    },
  },

  // Skip Link
  skipLink: {
    label: process.env.SKIP_LINK_LABEL || 'Skip to main content',
  },

  // Site Branding
  branding: {
    siteName: process.env.SITE_NAME || 'Free Stuff on the Internet',
    ariaLabel:
      process.env.SITE_ARIA_LABEL ||
      'Free Stuff on the Internet - Return to home page',
  },

  // Search Bar
  search: {
    ariaLabel: process.env.SEARCH_ARIA_LABEL || 'Search for free resources',
    placeholder:
      process.env.SEARCH_PLACEHOLDER || 'Search for free resources...',
  },
} as const

export type NavigationConfig = typeof navigationConfig
