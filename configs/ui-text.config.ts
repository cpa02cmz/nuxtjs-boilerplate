/**
 * UI Text Configuration
 * All user-facing text strings
 * Flexy says: "Text should be configurable, not hardcoded!"
 */

// Search-related text
export const SEARCH_TEXT = {
  placeholder: 'Search resources by name, description, tags...',
  noResults: 'No resources found matching your search',
  clearSearch: 'Clear search',
  searchButton: 'Search',
  recentSearches: 'Recent Searches',
  trendingSearches: 'Trending Searches',
  suggestions: {
    prefix: 'Search for',
    popular: 'Popular',
    category: 'Category',
    resource: 'Resource',
  },
} as const

// Button Labels
export const BUTTON_LABELS = {
  // Action buttons by category
  explore: {
    'AI/ML': 'Explore AI Tools',
    Development: 'Explore Dev Tools',
    Design: 'Get Design Assets',
    Cloud: 'Try Cloud Services',
    Marketing: 'Try Marketing Tools',
    Security: 'Try Security Tools',
    Productivity: 'Get Productivity Apps',
    default: 'Get Started',
  },

  // Generic buttons
  submit: 'Submit',
  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  view: 'View',
  compare: 'Compare',
  bookmark: 'Bookmark',
  removeBookmark: 'Remove Bookmark',
  share: 'Share',
  copy: 'Copy',
  download: 'Download',
  install: 'Install',
  dismiss: 'Dismiss',
  learnMore: 'Learn More',
  getStarted: 'Get Started',
  tryNow: 'Try Now',
  viewDetails: 'View Details',
} as const

// PWA Install Prompt
export const PWA_TEXT = {
  installTitle: 'Install App',
  installDescription: 'Add to your home screen for quick access',
  installButton: 'Install',
  dismissButton: 'Not Now',
  offlineReady: 'App ready to work offline',
  updateAvailable: 'Update available',
  updateButton: 'Update',
} as const

// Resource Card
export const RESOURCE_CARD_TEXT = {
  freeTierLabel: 'Free Tier:',
  pricing: {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
  },
  difficulty: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
  unavailable: {
    title: 'Resource Unavailable',
    message: 'This resource could not be displayed due to an error.',
  },
} as const

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'An error occurred',
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  notFound: 'Resource not found',
  unauthorized: 'Authentication required',
  forbidden: 'Access forbidden',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again',
  unknown: 'An unexpected error occurred',
} as const

// Toast Messages
export const TOAST_MESSAGES = {
  success: {
    saved: 'Successfully saved',
    deleted: 'Successfully deleted',
    bookmarked: 'Added to bookmarks',
    removed: 'Removed from bookmarks',
    copied: 'Copied to clipboard',
    installed: 'App installed successfully',
    submitted: 'Submission received',
  },
  error: {
    saveFailed: 'Failed to save',
    deleteFailed: 'Failed to delete',
    bookmarkFailed: 'Failed to add bookmark',
    copyFailed: 'Failed to copy',
    installFailed: 'Installation failed',
    submitFailed: 'Submission failed',
  },
  warning: {
    unsavedChanges: 'You have unsaved changes',
    offline: 'You are offline',
    deprecated: 'This resource is deprecated',
  },
  info: {
    loading: 'Loading...',
    processing: 'Processing...',
    updated: 'Content updated',
  },
} as const

// Empty States
export const EMPTY_STATE_TEXT = {
  noResources: {
    title: 'No resources found',
    description: 'Try adjusting your search or filters',
  },
  noBookmarks: {
    title: 'No bookmarks yet',
    description: 'Save your favorite resources here',
  },
  noHistory: {
    title: 'No search history',
    description: 'Your recent searches will appear here',
  },
  noComparisons: {
    title: 'No comparisons yet',
    description: 'Compare resources side by side',
  },
} as const

// Section Titles
export const SECTION_TITLES = {
  trending: 'Trending Resources',
  popular: 'Popular Resources',
  newArrivals: 'New Arrivals',
  similar: 'Similar Resources',
  related: 'Related Resources',
  categories: 'Categories',
  tags: 'Tags',
  features: 'Features',
  reviews: 'Reviews',
} as const

// Form Labels
export const FORM_LABELS = {
  name: 'Name',
  email: 'Email',
  description: 'Description',
  category: 'Category',
  tags: 'Tags',
  url: 'URL',
  pricing: 'Pricing Model',
  difficulty: 'Difficulty Level',
  search: 'Search',
} as const

// Navigation
export const NAVIGATION_TEXT = {
  home: 'Home',
  resources: 'Resources',
  categories: 'Categories',
  bookmarks: 'Bookmarks',
  compare: 'Compare',
  submit: 'Submit',
  about: 'About',
  search: 'Search',
} as const

// Meta/SEO
export const SEO_TEXT = {
  siteTitle: 'Free Stuff on the Internet',
  siteDescription:
    'Discover the best free tools and resources for developers, designers, and creators',
  suffix: ' - Free Resources for Developers',
  keywords: 'free tools, developer tools, design resources, free software',
} as const

// Status Labels
export const STATUS_LABELS = {
  verified: 'Verified',
  unverified: 'Unverified',
  deprecated: 'Deprecated',
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
} as const

// Time-related text
export const TIME_TEXT = {
  justNow: 'Just now',
  minutesAgo: 'minutes ago',
  hoursAgo: 'hours ago',
  daysAgo: 'days ago',
  lastUpdated: 'Last updated',
  updated: 'Updated',
} as const

// Export all UI text
export const UI_TEXT = {
  search: SEARCH_TEXT,
  buttons: BUTTON_LABELS,
  pwa: PWA_TEXT,
  resourceCard: RESOURCE_CARD_TEXT,
  errors: ERROR_MESSAGES,
  toast: TOAST_MESSAGES,
  emptyStates: EMPTY_STATE_TEXT,
  sections: SECTION_TITLES,
  forms: FORM_LABELS,
  navigation: NAVIGATION_TEXT,
  seo: SEO_TEXT,
  status: STATUS_LABELS,
  time: TIME_TEXT,
} as const

export default UI_TEXT
