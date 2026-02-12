// Content Configuration - UI Text, Labels, and User-Facing Strings
// Flexy hates hardcoded values! All user-facing text is now configurable.

/**
 * Parse comma-separated categories from environment variable
 * Flexy hates hardcoded arrays!
 */
function parseCategories(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

/**
 * Parse comma-separated placeholders from environment variable
 * Flexy hates hardcoded placeholder examples!
 */
function parsePlaceholders(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export const contentConfig = {
  // Data File Paths - Flexy hates hardcoded file paths!
  paths: {
    // Resources data file path
    resourcesData:
      process.env.CONTENT_RESOURCES_DATA_PATH || '~/data/resources.json',
  },

  // Form Placeholders - Flexy hates hardcoded placeholders!
  placeholders: {
    // URL input placeholder examples
    url: parsePlaceholders(
      process.env.CONTENT_PLACEHOLDER_URL ||
        'https://example.com,https://yoursite.com'
    ),
    // Default URL placeholder (first in list)
    get defaultUrl(): string {
      return contentConfig.placeholders.url[0] || 'https://example.com'
    },
  },
  // Valid Categories - Flexy hates hardcoded category lists!
  categories: {
    validCategories: parseCategories(
      process.env.VALID_CATEGORIES ||
        'Development, Design, Productivity, Marketing, Analytics, Security, AI/ML, DevOps, Testing, Education'
    ),
  },

  // Navigation
  navigation: {
    skipToMain: process.env.CONTENT_NAV_SKIP_TO_MAIN || 'Skip to main content',
    appName: process.env.CONTENT_NAV_APP_NAME || 'Free Stuff on the Internet',
    searchAriaLabel:
      process.env.CONTENT_NAV_SEARCH_ARIA || 'Search for free resources',
    menu: {
      open: process.env.CONTENT_NAV_MENU_OPEN || 'Open main menu',
      close: process.env.CONTENT_NAV_MENU_CLOSE || 'Close main menu',
    },
    items: {
      home: process.env.CONTENT_NAV_HOME || 'Home',
      search: process.env.CONTENT_NAV_SEARCH || 'Search',
      aiKeys: process.env.CONTENT_NAV_AI_KEYS || 'AI Keys',
      favorites: process.env.CONTENT_NAV_FAVORITES || 'Favorites',
      about: process.env.CONTENT_NAV_ABOUT || 'About',
      submit: process.env.CONTENT_NAV_SUBMIT || 'Submit',
      developer: process.env.CONTENT_NAV_DEVELOPER || 'Developer',
      apiAnalytics: process.env.CONTENT_NAV_API_ANALYTICS || 'API Analytics',
    },
  },

  // Search Components
  search: {
    placeholder:
      process.env.CONTENT_SEARCH_PLACEHOLDER ||
      'Search resources by name, description, tags...',
    ariaLabel:
      process.env.CONTENT_SEARCH_ARIA_LABEL ||
      'Search resources (Press / to focus)',
    clearAriaLabel: process.env.CONTENT_SEARCH_CLEAR_ARIA || 'Clear search',
    suggestions: {
      title: process.env.CONTENT_SEARCH_SUGGESTIONS_TITLE || 'Suggestions',
      recentTitle: process.env.CONTENT_SEARCH_RECENT_TITLE || 'Recent Searches',
      clearHistory:
        process.env.CONTENT_SEARCH_CLEAR_HISTORY || 'Clear search history',
      // Default search suggestions - Flexy hates hardcoded arrays!
      defaultSuggestions: parseSuggestions(
        process.env.CONTENT_SEARCH_DEFAULT_SUGGESTIONS ||
          'AI Tools, Web Hosting, Databases, APIs, VPS'
      ),
    },
    // Empty state configuration - Flexy hates hardcoded UX copy!
    emptyState: {
      noResultsTitle:
        process.env.CONTENT_SEARCH_EMPTY_TITLE || 'No matching resources found',
      noResultsSubtitle:
        process.env.CONTENT_SEARCH_EMPTY_SUBTITLE ||
        'Try a different search term or browse all resources',
      tryThese:
        process.env.CONTENT_SEARCH_EMPTY_TRY || 'Try these popular searches',
      clearSearch: process.env.CONTENT_SEARCH_EMPTY_CLEAR || 'Clear search',
      browseAll: process.env.CONTENT_SEARCH_EMPTY_BROWSE || 'Browse all',
    },
    popular: {
      title: process.env.CONTENT_SEARCH_POPULAR_TITLE || 'Popular Searches',
      empty:
        process.env.CONTENT_SEARCH_POPULAR_EMPTY || 'No popular searches yet',
    },
    related: {
      title: process.env.CONTENT_SEARCH_RELATED_TITLE || 'Did you mean?',
    },
  },

  // Filters
  filters: {
    title: process.env.CONTENT_FILTERS_TITLE || 'Filters',
    resetAll: process.env.CONTENT_FILTERS_RESET_ALL || 'Reset all',
    activeFilters: process.env.CONTENT_FILTERS_ACTIVE || 'Active filters:',
    clearAll: process.env.CONTENT_FILTERS_CLEAR_ALL || 'Clear all',
    labels: {
      category: process.env.CONTENT_FILTER_CATEGORY || 'Category:',
      pricing: process.env.CONTENT_FILTER_PRICING || 'Pricing:',
      difficulty: process.env.CONTENT_FILTER_DIFFICULTY || 'Difficulty:',
      tech: process.env.CONTENT_FILTER_TECH || 'Tech:',
      tag: process.env.CONTENT_FILTER_TAG || 'Tag:',
      benefit: process.env.CONTENT_FILTER_BENEFIT || 'Benefit:',
      date: process.env.CONTENT_FILTER_DATE || 'Date:',
    },
    dateRanges: {
      any: process.env.CONTENT_DATE_ANY || 'Any time',
      week: process.env.CONTENT_DATE_WEEK || 'Last week',
      month: process.env.CONTENT_DATE_MONTH || 'Last month',
      year: process.env.CONTENT_DATE_YEAR || 'Last year',
    },
  },

  // Sorting
  sort: {
    label: process.env.CONTENT_SORT_LABEL || 'Sort by:',
    resultsFound: process.env.CONTENT_SORT_RESULTS || 'resources found',
    options: {
      popular: process.env.CONTENT_SORT_POPULAR || 'Most Popular',
      az: process.env.CONTENT_SORT_AZ || 'A-Z',
      za: process.env.CONTENT_SORT_ZA || 'Z-A',
      newest: process.env.CONTENT_SORT_NEWEST || 'Newest First',
    },
  },

  // Resource Card
  resourceCard: {
    freeTier: process.env.CONTENT_RESOURCE_FREE_TIER || 'Free Tier:',
    newTab: process.env.CONTENT_RESOURCE_NEW_TAB || '(new tab)',
    defaultButtonLabel:
      process.env.CONTENT_RESOURCE_BUTTON_LABEL || 'Visit Resource',
    openingLabel: process.env.CONTENT_RESOURCE_OPENING_LABEL || 'Opening...',
  },

  // Favorites Page - Flexy hates hardcoded page content!
  favorites: {
    title: process.env.CONTENT_FAVORITES_TITLE || 'My Bookmarks',
    subtitle:
      process.env.CONTENT_FAVORITES_SUBTITLE ||
      '{{ count }} bookmarked resource{{ plural }}',
    emptyState: {
      heading:
        process.env.CONTENT_FAVORITES_EMPTY_HEADING || 'No bookmarks yet',
      description:
        process.env.CONTENT_FAVORITES_EMPTY_DESC ||
        'Save your favorite resources for quick access later. Click the bookmark icon on any resource card to bookmark it.',
      ctaButton: process.env.CONTENT_FAVORITES_CTA || 'Browse Resources',
    },
    proTip: {
      text:
        process.env.CONTENT_FAVORITES_PRO_TIP ||
        'Pro tip: Use the bookmark button on resource cards to save favorites',
    },
    controls: {
      showing:
        process.env.CONTENT_FAVORITES_SHOWING ||
        'Showing {{ count }} bookmarked resource{{ plural }}',
      export: process.env.CONTENT_FAVORITES_EXPORT || 'Export',
      clearAll: process.env.CONTENT_FAVORITES_CLEAR_ALL || 'Clear All',
      confirmDelete:
        process.env.CONTENT_FAVORITES_CONFIRM_DELETE ||
        'Delete {{ count }} bookmark{{ plural }}?',
      cancel: process.env.CONTENT_FAVORITES_CANCEL || 'Cancel',
      delete: process.env.CONTENT_FAVORITES_DELETE || 'Delete',
    },
    undoNotification: {
      singleRemoved:
        process.env.CONTENT_FAVORITES_SINGLE_REMOVED || 'Bookmark removed',
      multipleRemoved:
        process.env.CONTENT_FAVORITES_MULTI_REMOVED ||
        '{{ count }} bookmarks removed',
      undoHint:
        process.env.CONTENT_FAVORITES_UNDO_HINT || 'You can undo this action',
      undoButton: process.env.CONTENT_FAVORITES_UNDO_BTN || 'Undo',
    },
  },

  // Comparison
  comparison: {
    title: process.env.CONTENT_COMPARISON_TITLE || 'Compare Resources',
    description:
      process.env.CONTENT_COMPARISON_DESC ||
      'Compare up to {{ max }} resources side-by-side',
    clearAll: process.env.CONTENT_COMPARISON_CLEAR || 'Clear All',
    share: process.env.CONTENT_COMPARISON_SHARE || 'Share Comparison',
    copySuccess:
      process.env.CONTENT_COMPARISON_COPY_SUCCESS ||
      'Comparison URL copied to clipboard!',
    empty: {
      title:
        process.env.CONTENT_COMPARISON_EMPTY_TITLE || 'No resources selected',
      description:
        process.env.CONTENT_COMPARISON_EMPTY_DESC ||
        'Add resources to compare them side-by-side.',
      browse: process.env.CONTENT_COMPARISON_EMPTY_BROWSE || 'Browse Resources',
    },
  },

  // PWA
  pwa: {
    installTitle: process.env.CONTENT_PWA_INSTALL_TITLE || 'Install App',
    installDesc:
      process.env.CONTENT_PWA_INSTALL_DESC || 'Add to your home screen',
    notNow: process.env.CONTENT_PWA_NOT_NOW || 'Not now',
    install: process.env.CONTENT_PWA_INSTALL || 'Install',
    installing: process.env.CONTENT_PWA_INSTALLING || 'Installing...',
    // ARIA labels
    aria: {
      installPrompt:
        process.env.CONTENT_PWA_ARIA_PROMPT || 'Install app prompt',
      dismissButton:
        process.env.CONTENT_PWA_ARIA_DISMISS || 'Dismiss install prompt',
      installButton:
        process.env.CONTENT_PWA_ARIA_INSTALL || 'Install application',
      closeButton: process.env.CONTENT_PWA_ARIA_CLOSE || 'Close install prompt',
      appIcon: process.env.CONTENT_PWA_ARIA_ICON || 'App icon',
    },
  },

  // Submit Page
  submit: {
    title: process.env.CONTENT_SUBMIT_TITLE || 'Submit a Resource',
    subtitle:
      process.env.CONTENT_SUBMIT_SUBTITLE ||
      'Share valuable free resources with the community',
    form: {
      name: process.env.CONTENT_SUBMIT_NAME || 'Resource Name',
      nameDesc:
        process.env.CONTENT_SUBMIT_NAME_DESC || 'The name of the resource',
      namePlaceholder:
        process.env.CONTENT_SUBMIT_NAME_PLACEHOLDER || 'e.g., OpenAI API',
      description: process.env.CONTENT_SUBMIT_DESC || 'Description',
      descriptionDesc:
        process.env.CONTENT_SUBMIT_DESC_DESC ||
        'Brief description of what the resource offers',
      descriptionHelper:
        process.env.CONTENT_SUBMIT_DESC_HELPER ||
        "At least {{ min }} characters. Explain what this resource offers and why it's valuable.",
      descriptionPlaceholder:
        process.env.CONTENT_SUBMIT_DESC_PLACEHOLDER ||
        'Describe the resource and its benefits...',
      url: process.env.CONTENT_SUBMIT_URL || 'Website URL',
      category: process.env.CONTENT_SUBMIT_CATEGORY || 'Category',
      categoryPlaceholder:
        process.env.CONTENT_SUBMIT_CATEGORY_PLACEHOLDER || 'Select a category',
      tags: process.env.CONTENT_SUBMIT_TAGS || 'Tags',
      tagsDesc:
        process.env.CONTENT_SUBMIT_TAGS_DESC ||
        'Comma-separated tags (e.g., AI, API, hosting)',
      tagsPlaceholder:
        process.env.CONTENT_SUBMIT_TAGS_PLACEHOLDER ||
        'Enter tags separated by commas',
    },
    categories: {
      ai: process.env.CONTENT_CATEGORY_AI || 'AI & Machine Learning',
      cloud: process.env.CONTENT_CATEGORY_CLOUD || 'Cloud & Hosting',
      database: process.env.CONTENT_CATEGORY_DATABASE || 'Database',
      devtools: process.env.CONTENT_CATEGORY_DEVTOOLS || 'Developer Tools',
      design: process.env.CONTENT_CATEGORY_DESIGN || 'Design & Assets',
      security: process.env.CONTENT_CATEGORY_SECURITY || 'Security',
      learning: process.env.CONTENT_CATEGORY_LEARNING || 'Learning & Education',
    },
    button: {
      submit: process.env.CONTENT_SUBMIT_BTN || 'Submit Resource',
      submitting: process.env.CONTENT_SUBMIT_BTN_SUBMITTING || 'Submitting...',
    },
    success: {
      title: process.env.CONTENT_SUBMIT_SUCCESS_TITLE || 'Thank you!',
      heading:
        process.env.CONTENT_SUBMIT_SUCCESS_HEADING || 'Submission received!',
      message:
        process.env.CONTENT_SUBMIT_SUCCESS_MSG ||
        'Your resource has been submitted for review.',
      submitAnother:
        process.env.CONTENT_SUBMIT_SUCCESS_ANOTHER || 'Submit Another',
    },
    error: {
      title: process.env.CONTENT_SUBMIT_ERROR_TITLE || 'Submission failed',
      heading: process.env.CONTENT_SUBMIT_ERROR_HEADING || 'Submission failed',
      message:
        process.env.CONTENT_SUBMIT_ERROR_MSG ||
        'There was an error submitting your resource. Please try again.',
      retry: process.env.CONTENT_SUBMIT_ERROR_RETRY || 'Try Again',
    },
    // Draft auto-save configuration - Flexy hates hardcoded expiry!
    draft: {
      // How long drafts are kept in localStorage (hours)
      expiryHours: parseInt(process.env.CONTENT_DRAFT_EXPIRY_HOURS || '168'),
      // Auto-save debounce delay (ms)
      autoSaveDelayMs: parseInt(
        process.env.CONTENT_DRAFT_AUTOSAVE_DELAY_MS || '2000'
      ),
      // UI text for draft functionality
      autoSaveEnabled:
        process.env.CONTENT_SUBMIT_AUTOSAVE_ENABLED || 'Auto-saving enabled',
      draftSaved: process.env.CONTENT_SUBMIT_DRAFT_SAVED || 'Draft saved',
      justNow: process.env.CONTENT_SUBMIT_JUST_NOW || 'just now',
    },
  },

  // Error Page
  error: {
    notFound: {
      title: process.env.CONTENT_ERROR_404_TITLE || 'Page Not Found',
      message:
        process.env.CONTENT_ERROR_404_MSG ||
        "Sorry, we couldn't find the page you're looking for.",
    },
    generic: {
      title: process.env.CONTENT_ERROR_GENERIC_TITLE || 'Something Went Wrong',
      message:
        process.env.CONTENT_ERROR_GENERIC_MSG ||
        'An unexpected error occurred. Please try again later.',
    },
    details: process.env.CONTENT_ERROR_DETAILS || 'Error Details',
    goBack: process.env.CONTENT_ERROR_GO_BACK || 'Go Back',
    goHome: process.env.CONTENT_ERROR_GO_HOME || 'Go Home',
  },

  // Footer
  footer: {
    copyright: process.env.CONTENT_FOOTER_COPYRIGHT || 'All rights reserved.',
    contentEnd: process.env.CONTENT_FOOTER_CONTENT_END || 'Footer content ends',
  },

  // Search Results
  searchResults: {
    noResults: {
      title: process.env.CONTENT_NO_RESULTS_TITLE || 'No resources found',
      message:
        process.env.CONTENT_NO_RESULTS_MSG ||
        'Try adjusting your filters or search terms',
    },
  },

  // Resource Detail Page
  resourceDetail: {
    error: {
      notFound: process.env.CONTENT_RESOURCE_NOT_FOUND || 'Resource not found',
      loadFailed:
        process.env.CONTENT_RESOURCE_LOAD_FAILED || 'Failed to load resource',
      tryAgain:
        process.env.CONTENT_RESOURCE_TRY_AGAIN ||
        'Try searching for another resource',
      invalidId:
        process.env.CONTENT_RESOURCE_INVALID_ID || 'Invalid resource ID',
    },
  },

  // Similar Resources Section - Flexy hates hardcoded category labels!
  similarResources: {
    title: process.env.CONTENT_SIMILAR_TITLE || 'Related Resources',
    viewAll: process.env.CONTENT_SIMILAR_VIEW_ALL || 'View All',
    // Category-specific button labels
    categoryLabels: {
      'AI Tools': process.env.CONTENT_SIMILAR_BTN_AI_TOOLS || 'Try AI Tool',
      Hosting: process.env.CONTENT_SIMILAR_BTN_HOSTING || 'Get Hosting',
      Databases:
        process.env.CONTENT_SIMILAR_BTN_DATABASES || 'Connect Database',
      CDN: process.env.CONTENT_SIMILAR_BTN_CDN || 'Use CDN',
      VPS: process.env.CONTENT_SIMILAR_BTN_VPS || 'Get VPS',
      Analytics: process.env.CONTENT_SIMILAR_BTN_ANALYTICS || 'Use Analytics',
      APIs: process.env.CONTENT_SIMILAR_BTN_APIS || 'Use API',
      'Developer Tools':
        process.env.CONTENT_SIMILAR_BTN_DEV_TOOLS || 'Use Tool',
      Design: process.env.CONTENT_SIMILAR_BTN_DESIGN || 'Use Design Tool',
      Productivity:
        process.env.CONTENT_SIMILAR_BTN_PRODUCTIVITY || 'Boost Productivity',
    },
    // Default button label when category not found
    defaultButtonLabel:
      process.env.CONTENT_SIMILAR_DEFAULT_BTN || 'Get Resource',
    // "More" text for truncated lists
    moreItemsText: process.env.CONTENT_SIMILAR_MORE_TEXT || 'more',
  },

  // RSS Feed Configuration - Flexy hates hardcoded RSS values!
  rss: {
    title: process.env.CONTENT_RSS_TITLE || 'Free Developer Resources',
    description:
      process.env.CONTENT_RSS_DESCRIPTION ||
      'A collection of free resources for developers',
    language: process.env.CONTENT_RSS_LANGUAGE || 'en',
  },

  // Error Messages - Flexy hates hardcoded error messages!
  errors: {
    authentication: {
      required:
        process.env.CONTENT_ERROR_AUTH_REQUIRED || 'Authentication required',
      forbidden: process.env.CONTENT_ERROR_AUTH_FORBIDDEN || 'Access forbidden',
      rateLimit:
        process.env.CONTENT_ERROR_RATE_LIMIT ||
        'Rate limit exceeded. Please try again later.',
    },
    validation: {
      failed:
        process.env.CONTENT_ERROR_VALIDATION_FAILED || 'Validation failed',
      readBody:
        process.env.CONTENT_ERROR_READ_BODY || 'Failed to read request body',
    },
    clipboard: {
      copyFailed:
        process.env.CONTENT_ERROR_CLIPBOARD_COPY || 'execCommand copy failed',
    },
    community: {
      commentLogin:
        process.env.CONTENT_ERROR_COMMENT_LOGIN ||
        'User must be logged in to comment',
      replyLogin:
        process.env.CONTENT_ERROR_REPLY_LOGIN ||
        'User must be logged in to reply',
      flagLogin:
        process.env.CONTENT_ERROR_FLAG_LOGIN ||
        'User must be logged in to flag content',
      moderatePermission:
        process.env.CONTENT_ERROR_MODERATE_PERMISSION ||
        'User must be a moderator to moderate content',
      resolvePermission:
        process.env.CONTENT_ERROR_RESOLVE_PERMISSION ||
        'User must be a moderator to resolve flags',
      voteLogin:
        process.env.CONTENT_ERROR_VOTE_LOGIN ||
        'User must be logged in to vote',
    },
  },

  // Social Sharing - Flexy hates hardcoded sharing params!
  socialShare: {
    // UTM Parameters
    utm: {
      source: process.env.SHARE_UTM_SOURCE || 'social',
      medium: process.env.SHARE_UTM_MEDIUM || 'share',
      campaign: process.env.SHARE_UTM_CAMPAIGN || 'resource-sharing',
    },
    // Hashtags for Twitter
    hashtags: process.env.SHARE_HASHTAGS || 'FreeResources,WebDevelopment',
    // Platform URLs
    platforms: {
      twitter: 'https://twitter.com/intent/tweet',
      facebook: 'https://www.facebook.com/sharer/sharer.php',
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
      reddit: 'https://www.reddit.com/submit',
    },
  },

  // Messages - User-facing feedback messages
  messages: {
    clipboard: {
      copy: process.env.CONTENT_MSG_CLIPBOARD_COPY || 'Copy to clipboard',
      copied: process.env.CONTENT_MSG_CLIPBOARD_COPIED || 'Copied!',
      copyFailed:
        process.env.CONTENT_MSG_CLIPBOARD_FAILED ||
        'Failed to copy to clipboard',
    },
  },

  // ARIA Labels - Accessibility labels
  aria: {
    clipboard: {
      copy: process.env.CONTENT_ARIA_CLIPBOARD_COPY || 'Copy to clipboard',
      copied:
        process.env.CONTENT_ARIA_CLIPBOARD_COPIED || 'Copied to clipboard',
    },
  },
} as const

// Helper function to parse comma-separated suggestions
function parseSuggestions(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type ContentConfig = typeof contentConfig
