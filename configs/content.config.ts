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

// Sort option type definition
export interface SortOption {
  value: string
  label: string
  icon: string
}

export const contentConfig = {
  // Color references for content components - Flexy hates hardcoded colors!
  colors: {
    success: process.env.CONTENT_COLOR_SUCCESS || '#16a34a',
    error: process.env.CONTENT_COLOR_ERROR || '#dc2626',
    warning: process.env.CONTENT_COLOR_WARNING || '#f59e0b',
    info: process.env.CONTENT_COLOR_INFO || '#3b82f6',
  },

  // Data File Paths - Flexy hates hardcoded file paths!
  paths: {
    // Resources data file path
    resourcesData:
      process.env.CONTENT_RESOURCES_DATA_PATH || './data/resources.json',
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

  // Breadcrumbs - Palette's micro-UX enhancement!
  // Navigation breadcrumb text for screen readers and accessibility
  breadcrumbs: {
    currentPage:
      process.env.CONTENT_BREADCRUMBS_CURRENT || 'Currently viewing {{title}}',
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
    resetSuccess: process.env.CONTENT_FILTERS_RESET_SUCCESS || 'Reset!',
    activeFilters: process.env.CONTENT_FILTERS_ACTIVE || 'Active filters:',
    clearAll: process.env.CONTENT_FILTERS_CLEAR_ALL || 'Clear all',
    // Section labels for filter sections (without colons)
    sectionLabels: {
      category: process.env.CONTENT_FILTER_SECTION_CATEGORY || 'Category',
      pricingModel:
        process.env.CONTENT_FILTER_SECTION_PRICING || 'Pricing Model',
      difficulty: process.env.CONTENT_FILTER_SECTION_DIFFICULTY || 'Difficulty',
      technology: process.env.CONTENT_FILTER_SECTION_TECHNOLOGY || 'Technology',
      tags: process.env.CONTENT_FILTER_SECTION_TAGS || 'Tags',
      benefits: process.env.CONTENT_FILTER_SECTION_BENEFITS || 'Benefits',
      dateAdded: process.env.CONTENT_FILTER_SECTION_DATE || 'Date Added',
    },
    // ARIA labels for accessibility
    ariaLabels: {
      resetAll:
        process.env.CONTENT_FILTER_ARIA_RESET_ALL || 'Reset all filters',
      resetSuccess:
        process.env.CONTENT_FILTER_ARIA_RESET_SUCCESS ||
        'Filters reset successfully',
      category: process.env.CONTENT_FILTER_ARIA_CATEGORY || 'Category filters',
      pricingModel:
        process.env.CONTENT_FILTER_ARIA_PRICING || 'Pricing model filters',
      difficulty:
        process.env.CONTENT_FILTER_ARIA_DIFFICULTY ||
        'Difficulty level filters',
      technology:
        process.env.CONTENT_FILTER_ARIA_TECHNOLOGY || 'Technology filters',
      tags: process.env.CONTENT_FILTER_ARIA_TAGS || 'Tag filters',
      benefits: process.env.CONTENT_FILTER_ARIA_BENEFITS || 'Benefit filters',
      dateAdded: process.env.CONTENT_FILTER_ARIA_DATE || 'Filter by date added',
      region:
        process.env.CONTENT_FILTER_ARIA_REGION ||
        'Active filters. Use left and right arrow keys to navigate between filters. Press Delete or Backspace to remove a filter.',
      clearAll:
        process.env.CONTENT_FILTER_ARIA_CLEAR_ALL ||
        'Clear all filters (press Escape to clear all)',
    },
    // Chip aria-label templates
    chipAriaLabels: {
      removeSearch:
        process.env.CONTENT_FILTER_CHIP_REMOVE_SEARCH ||
        'Remove search query filter: {{value}}. Press Delete or Backspace to remove',
      removeCategory:
        process.env.CONTENT_FILTER_CHIP_REMOVE_CATEGORY ||
        'Remove category filter: {{value}}. Press Delete or Backspace to remove',
      removePricing:
        process.env.CONTENT_FILTER_CHIP_REMOVE_PRICING ||
        'Remove pricing filter: {{value}}. Press Delete or Backspace to remove',
      removeDifficulty:
        process.env.CONTENT_FILTER_CHIP_REMOVE_DIFFICULTY ||
        'Remove difficulty filter: {{value}}. Press Delete or Backspace to remove',
      removeTechnology:
        process.env.CONTENT_FILTER_CHIP_REMOVE_TECH ||
        'Remove technology filter: {{value}}. Press Delete or Backspace to remove',
      removeTag:
        process.env.CONTENT_FILTER_CHIP_REMOVE_TAG ||
        'Remove tag filter: {{value}}. Press Delete or Backspace to remove',
      removeBenefit:
        process.env.CONTENT_FILTER_CHIP_REMOVE_BENEFIT ||
        'Remove benefit filter: {{value}}. Press Delete or Backspace to remove',
      removeDate:
        process.env.CONTENT_FILTER_CHIP_REMOVE_DATE ||
        'Remove date filter: {{value}}. Press Delete or Backspace to remove',
      undo:
        process.env.CONTENT_FILTER_CHIP_UNDO ||
        'Undo removal of {{value}} filter. Press Control Z to undo',
    },
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
    // Keyboard shortcuts display
    keyboard: {
      ctrlZ: process.env.CONTENT_FILTER_KEY_CTRL_Z || 'Ctrl+Z',
      esc: process.env.CONTENT_FILTER_KEY_ESC || 'Esc',
    },
  },

  // Related Searches - Palette's micro-UX enhancement!
  relatedSearches: {
    title: process.env.CONTENT_RELATED_SEARCHES_TITLE || 'Did you mean?',
    aria: {
      region:
        process.env.CONTENT_RELATED_SEARCHES_ARIA_REGION ||
        'Related search suggestions',
      group:
        process.env.CONTENT_RELATED_SEARCHES_ARIA_GROUP ||
        'Related search options',
      button:
        process.env.CONTENT_RELATED_SEARCHES_ARIA_BUTTON ||
        'Search for {query}',
    },
    announcement: {
      searching:
        process.env.CONTENT_RELATED_SEARCHES_ANNOUNCE ||
        'Searching for {query}',
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
    // Sort options configuration with icons - Flexy hates hardcoded arrays!
    sortOptions: [
      {
        value: 'popularity-desc',
        label: process.env.CONTENT_SORT_POPULAR || 'Most Popular',
        icon: '🔥',
      },
      {
        value: 'alphabetical-asc',
        label: process.env.CONTENT_SORT_AZ || 'A-Z',
        icon: '🔤',
      },
      {
        value: 'alphabetical-desc',
        label: process.env.CONTENT_SORT_ZA || 'Z-A',
        icon: '🔠',
      },
      {
        value: 'date-added-desc',
        label: process.env.CONTENT_SORT_NEWEST || 'Newest First',
        icon: '✨',
      },
    ] as SortOption[],
  },

  // Resource Card
  resourceCard: {
    freeTier: process.env.CONTENT_RESOURCE_FREE_TIER || 'Free Tier:',
    newTab: process.env.CONTENT_RESOURCE_NEW_TAB || '(new tab)',
    defaultButtonLabel:
      process.env.CONTENT_RESOURCE_BUTTON_LABEL || 'Visit Resource',
    openingLabel: process.env.CONTENT_RESOURCE_OPENING_LABEL || 'Opening...',
  },

  // Resource Details Page - Flexy hates hardcoded detail page content!
  resourceDetails: {
    descriptionTitle:
      process.env.CONTENT_RESOURCE_DETAIL_DESC_TITLE || 'Description',
    readMore: process.env.CONTENT_RESOURCE_DETAIL_READ_MORE || 'Read more',
    readLess: process.env.CONTENT_RESOURCE_DETAIL_READ_LESS || 'Read less',
    wordSingular: process.env.CONTENT_RESOURCE_DETAIL_WORD_SINGULAR || 'word',
    wordPlural: process.env.CONTENT_RESOURCE_DETAIL_WORD_PLURAL || 'words',
    minRead: process.env.CONTENT_RESOURCE_DETAIL_MIN_READ || 'min read',
    // Palette's micro-UX enhancement: Section titles and announcements
    sections: {
      features: process.env.CONTENT_RESOURCE_FEATURES_TITLE || 'Features',
      specifications:
        process.env.CONTENT_RESOURCE_SPECIFICATIONS_TITLE || 'Specifications',
      benefits: process.env.CONTENT_RESOURCE_BENEFITS_TITLE || 'Benefits',
      limitations:
        process.env.CONTENT_RESOURCE_LIMITATIONS_TITLE || 'Limitations',
      screenshots:
        process.env.CONTENT_RESOURCE_SCREENSHOTS_TITLE || 'Screenshots',
    },
    aria: {
      featuresList:
        process.env.CONTENT_RESOURCE_FEATURES_LIST_ARIA || 'List of features',
    },
    announcements: {
      featureRevealed:
        process.env.CONTENT_RESOURCE_FEATURE_REVEALED || 'Feature: {feature}',
    },
    // Palette's micro-UX enhancement: Screenshots section content
    screenshotsTitle:
      process.env.CONTENT_RESOURCE_SCREENSHOTS_TITLE || 'Screenshots',
    viewScreenshot: process.env.CONTENT_RESOURCE_VIEW_SCREENSHOT || 'View',
    closeLightbox:
      process.env.CONTENT_RESOURCE_CLOSE_LIGHTBOX || 'Close screenshot viewer',
    previousScreenshot:
      process.env.CONTENT_RESOURCE_PREV_SCREENSHOT || 'Previous screenshot',
    nextScreenshot:
      process.env.CONTENT_RESOURCE_NEXT_SCREENSHOT || 'Next screenshot',
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
    // Toast messages - Flexy hates hardcoded toast strings!
    toast: {
      removed:
        process.env.CONTENT_FAVORITES_TOAST_REMOVED || '"{{title}}" removed',
      restored:
        process.env.CONTENT_FAVORITES_TOAST_RESTORED || 'Bookmark restored',
      multipleRestored:
        process.env.CONTENT_FAVORITES_TOAST_MULTI_RESTORED ||
        '{{count}} bookmarks restored',
      restoredDescription:
        process.env.CONTENT_FAVORITES_TOAST_RESTORED_DESC ||
        'All items have been added back',
    },
    // ARIA labels - Flexy hates hardcoded accessibility text!
    aria: {
      removeBookmark:
        process.env.CONTENT_FAVORITES_ARIA_REMOVE || 'Remove bookmark',
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
    headers: {
      criteria: process.env.CONTENT_COMPARISON_HEADER_CRITERIA || 'Criteria',
    },
    actions: {
      remove: process.env.CONTENT_COMPARISON_ACTION_REMOVE || 'Remove',
      removeConfirm: process.env.CONTENT_COMPARISON_REMOVE_CONFIRM || 'Remove?',
      cancel: process.env.CONTENT_COMPARISON_CANCEL || 'Cancel',
      yes: process.env.CONTENT_COMPARISON_YES || 'Yes',
    },
    emptyState: {
      title:
        process.env.CONTENT_COMPARISON_EMPTY_TITLE || 'No resources selected',
      description:
        process.env.CONTENT_COMPARISON_EMPTY_DESC ||
        'Add resources to compare them side-by-side.',
      browse: process.env.CONTENT_COMPARISON_EMPTY_BROWSE || 'Browse Resources',
      ariaLabel:
        process.env.CONTENT_COMPARISON_EMPTY_ARIA ||
        'Empty comparison state - no resources selected',
      popularLabel:
        process.env.CONTENT_COMPARISON_POPULAR_LABEL || 'Popular resources',
    },
    popularLabel: process.env.CONTENT_COMPARISON_POPULAR_LABEL || 'Popular',
  },

  // PWA
  pwa: {
    installTitle: process.env.CONTENT_PWA_INSTALL_TITLE || 'Install App',
    installDesc:
      process.env.CONTENT_PWA_INSTALL_DESC || 'Add to your home screen',
    notNow: process.env.CONTENT_PWA_NOT_NOW || 'Not now',
    install: process.env.CONTENT_PWA_INSTALL || 'Install',
    installing: process.env.CONTENT_PWA_INSTALLING || 'Installing...',
    installSuccess:
      process.env.CONTENT_PWA_INSTALL_SUCCESS ||
      'App installed successfully! 🎉',
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

  // Offline Indicator - Palette's micro-UX enhancement!
  offline: {
    // Main status messages
    offlineTitle: process.env.CONTENT_OFFLINE_TITLE || "You're offline",
    offlineSubtitle:
      process.env.CONTENT_OFFLINE_SUBTITLE ||
      'Some features may be unavailable',
    reconnectingText:
      process.env.CONTENT_OFFLINE_RECONNECTING || 'Reconnecting...',
    backOnlineText: process.env.CONTENT_OFFLINE_BACK_ONLINE || 'Back online!',
    // Retry button
    retryButton: process.env.CONTENT_OFFLINE_RETRY || 'Tap to retry',
    retryingButton: process.env.CONTENT_OFFLINE_RETRYING || 'Checking...',
    retrySuccess: process.env.CONTENT_OFFLINE_RETRY_SUCCESS || 'Connected!',
    retryFailed: process.env.CONTENT_OFFLINE_RETRY_FAILED || 'Still offline',
    // ARIA labels
    aria: {
      offlineAlert:
        process.env.CONTENT_OFFLINE_ARIA_ALERT ||
        'You are currently offline. Some features may be unavailable.',
      backOnlineStatus:
        process.env.CONTENT_OFFLINE_ARIA_BACK_ONLINE ||
        'Connection restored. You are back online.',
      retryButton:
        process.env.CONTENT_OFFLINE_ARIA_RETRY ||
        'Check connection status. Press Enter or Space to retry.',
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

  // Error Boundary - Palette's micro-UX: Auto-retry with countdown
  errorBoundary: {
    autoRetryMessage:
      process.env.CONTENT_ERROR_BOUNDARY_AUTO_RETRY ||
      'Auto-retrying in {{count}} seconds...',
    autoRetryPaused:
      process.env.CONTENT_ERROR_BOUNDARY_RETRY_PAUSED ||
      'Auto-retry paused (hover to continue)',
    autoRetryCanceled:
      process.env.CONTENT_ERROR_BOUNDARY_RETRY_CANCELED ||
      'Auto-retry canceled',
    cancelButton: process.env.CONTENT_ERROR_BOUNDARY_CANCEL_BTN || 'Cancel',
    aria: {
      cancelAutoRetry:
        process.env.CONTENT_ERROR_BOUNDARY_CANCEL_ARIA ||
        'Cancel automatic retry',
    },
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

  // Alternative Suggestions Section - Palette's micro-UX enhancement!
  alternativeSuggestions: {
    title: process.env.CONTENT_ALTERNATIVES_TITLE || 'Alternative Suggestions',
    subtitle:
      process.env.CONTENT_ALTERNATIVES_SUBTITLE ||
      'Users who viewed this resource also found these alternatives useful',
    emptyState: {
      title:
        process.env.CONTENT_ALTERNATIVES_EMPTY_TITLE || 'No alternatives found',
      message:
        process.env.CONTENT_ALTERNATIVES_EMPTY_MESSAGE ||
        'This resource is unique! Check out related resources below.',
      browseAll: process.env.CONTENT_ALTERNATIVES_BROWSE_ALL || 'Browse All',
    },
    loading: {
      title: process.env.CONTENT_ALTERNATIVES_LOADING_TITLE || 'Loading...',
      message:
        process.env.CONTENT_ALTERNATIVES_LOADING_MESSAGE ||
        'Finding similar resources for you',
    },
    aria: {
      regionLabel:
        process.env.CONTENT_ALTERNATIVES_ARIA_REGION ||
        'Alternative resource suggestions',
      loadingAnnouncement:
        process.env.CONTENT_ALTERNATIVES_ARIA_LOADING ||
        'Loading alternative suggestions',
      loadedAnnouncement:
        process.env.CONTENT_ALTERNATIVES_ARIA_LOADED ||
        'Alternative suggestions loaded',
    },
  },

  // RSS Feed Configuration - Flexy hates hardcoded RSS values!
  rss: {
    title: process.env.CONTENT_RSS_TITLE || 'Free Developer Resources',
    description:
      process.env.CONTENT_RSS_DESCRIPTION ||
      'A collection of free resources for developers',
    language: process.env.CONTENT_RSS_LANGUAGE || 'en',
  },

  // Bookmark Button - Flexy hates hardcoded button strings!
  bookmarkButton: {
    // Tooltip content
    tooltip: {
      add: process.env.CONTENT_BOOKMARK_TOOLTIP_ADD || 'Add to favorites',
      remove:
        process.env.CONTENT_BOOKMARK_TOOLTIP_REMOVE || 'Remove from favorites',
    },
    // ARIA labels for accessibility
    aria: {
      add: process.env.CONTENT_BOOKMARK_ARIA_ADD || 'Add to favorites',
      remove:
        process.env.CONTENT_BOOKMARK_ARIA_REMOVE || 'Remove from favorites',
    },
    // Toast messages
    toast: {
      added:
        process.env.CONTENT_BOOKMARK_TOAST_ADDED ||
        '"{{title}}" added to favorites',
      removed:
        process.env.CONTENT_BOOKMARK_TOAST_REMOVED ||
        '"{{title}}" removed from favorites',
    },
    // Status announcements for screen readers
    status: {
      added: process.env.CONTENT_BOOKMARK_STATUS_ADDED || 'Bookmark added',
      removed:
        process.env.CONTENT_BOOKMARK_STATUS_REMOVED || 'Bookmark removed',
    },
  },

  // Copy Button - Palette's micro-UX enhancement! 🎨
  // Provides accessible, delightful copy-to-clipboard functionality
  copyButton: {
    // Default button label
    defaultLabel: process.env.CONTENT_COPY_LABEL || 'Copy to clipboard',
    // Button text states
    copy: process.env.CONTENT_COPY_TEXT || 'Copy',
    copied: process.env.CONTENT_COPIED_TEXT || 'Copied!',
    // Tooltip content
    tooltip: {
      copy: process.env.CONTENT_COPY_TOOLTIP || 'Click to copy',
      copied: process.env.CONTENT_COPIED_TOOLTIP || 'Copied to clipboard!',
    },
    // ARIA labels for accessibility
    aria: {
      copy: process.env.CONTENT_COPY_ARIA || 'Copy to clipboard',
      copied: process.env.CONTENT_COPIED_ARIA || 'Copied to clipboard',
    },
    // Screen reader announcements
    announcement: {
      success:
        process.env.CONTENT_COPY_ANNOUNCE_SUCCESS ||
        'Content copied to clipboard',
      failed:
        process.env.CONTENT_COPY_ANNOUNCE_FAILED || 'Failed to copy content',
    },
  },

  // Saved Searches - Flexy hates hardcoded saved search strings!
  savedSearches: {
    toast: {
      deleted:
        process.env.CONTENT_SAVED_SEARCH_DELETED ||
        'Saved search "{{name}}" deleted',
      undoHint:
        process.env.CONTENT_SAVED_SEARCH_UNDO_HINT ||
        'Click undo to restore it',
    },
    // Palette's micro-UX enhancement: Restore prompt messages
    restorePrompt:
      process.env.CONTENT_SAVED_SEARCH_RESTORE_PROMPT ||
      '"{{name}}" has been deleted',
    restoreButton: process.env.CONTENT_SAVED_SEARCH_RESTORE_BUTTON || 'Restore',
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
    // Error boundary related errors
    retry: process.env.CONTENT_ERROR_RETRY || 'Retry',
    retryAria:
      process.env.CONTENT_ERROR_RETRY_ARIA || 'Retry loading component',
    componentError:
      process.env.CONTENT_ERROR_COMPONENT || 'Component error occurred',
    resetSuccess:
      process.env.CONTENT_ERROR_RESET_SUCCESS || 'Component reset successfully',
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
    // ARIA labels for sharing buttons - Flexy hates hardcoded aria-labels!
    ariaLabels: {
      twitter: process.env.CONTENT_SOCIAL_ARIA_TWITTER || 'Share on Twitter',
      facebook: process.env.CONTENT_SOCIAL_ARIA_FACEBOOK || 'Share on Facebook',
      linkedin: process.env.CONTENT_SOCIAL_ARIA_LINKEDIN || 'Share on LinkedIn',
      reddit: process.env.CONTENT_SOCIAL_ARIA_REDDIT || 'Share on Reddit',
      copy: process.env.CONTENT_SOCIAL_ARIA_COPY || 'Copy link to clipboard',
    },
    // Section heading
    heading: process.env.CONTENT_SOCIAL_HEADING || 'Share',
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
  ariaLabels: {
    clipboard: {
      copy: process.env.CONTENT_ARIA_CLIPBOARD_COPY || 'Copy to clipboard',
      copied:
        process.env.CONTENT_ARIA_CLIPBOARD_COPIED || 'Copied to clipboard',
      failed:
        process.env.CONTENT_ARIA_CLIPBOARD_FAILED ||
        'Failed to copy to clipboard',
    },
    description: {
      expanded:
        process.env.CONTENT_ARIA_DESC_EXPANDED || 'Description expanded',
      collapsed:
        process.env.CONTENT_ARIA_DESC_COLLAPSED || 'Description collapsed',
    },
    mainNavigation: process.env.CONTENT_ARIA_MAIN_NAV || 'Main navigation',
    mainContent: process.env.CONTENT_ARIA_MAIN_CONTENT || 'Main content',
    scrollToTop: process.env.CONTENT_ARIA_SCROLL_TOP || 'Scroll to top of page',
  },

  // Alias for ariaLabels - some components use config.aria
  get aria() {
    return this.ariaLabels
  },

  // Moderation - Flexy hates hardcoded moderation strings!
  moderation: {
    dashboard: {
      title:
        process.env.CONTENT_MODERATION_DASHBOARD_TITLE ||
        'Content Moderation Dashboard',
      subtitle:
        process.env.CONTENT_MODERATION_SUBTITLE ||
        'Manage resource submissions and content quality',
      recentActivity:
        process.env.CONTENT_MODERATION_RECENT_ACTIVITY || 'Recent Activity',
      quickActions:
        process.env.CONTENT_MODERATION_QUICK_ACTIONS || 'Quick Actions',
    },
    stats: {
      pendingTitle:
        process.env.CONTENT_MODERATION_PENDING_TITLE || 'Pending Reviews',
      approvedTitle:
        process.env.CONTENT_MODERATION_APPROVED_TITLE || 'Approved This Week',
      rejectedTitle:
        process.env.CONTENT_MODERATION_REJECTED_TITLE || 'Rejected This Week',
      flaggedTitle:
        process.env.CONTENT_MODERATION_FLAGGED_TITLE || 'Flagged Resources',
      viewQueue: process.env.CONTENT_MODERATION_VIEW_QUEUE || 'View Queue',
      viewFlags: process.env.CONTENT_MODERATION_VIEW_FLAGS || 'View Flags',
    },
    actions: {
      reviewQueue:
        process.env.CONTENT_MODERATION_REVIEW_QUEUE || 'Review Queue',
      flaggedContent:
        process.env.CONTENT_MODERATION_FLAGGED_CONTENT || 'Flagged Content',
      submissions: process.env.CONTENT_MODERATION_SUBMISSIONS || 'Submissions',
      settings: process.env.CONTENT_MODERATION_SETTINGS || 'Settings',
    },
    review: {
      resourceInfo:
        process.env.CONTENT_MODERATION_RESOURCE_INFO || 'Resource Information',
      submissionDetails:
        process.env.CONTENT_MODERATION_SUBMISSION_DETAILS ||
        'Submission Details',
      description:
        process.env.CONTENT_MOD_REVIEW_DESC ||
        'Review and moderate resource submission',
    },
    labels: {
      description:
        process.env.CONTENT_MODERATION_LABEL_DESCRIPTION || 'Description:',
      url: process.env.CONTENT_MODERATION_LABEL_URL || 'URL:',
      category: process.env.CONTENT_MODERATION_LABEL_CATEGORY || 'Category:',
      pricingModel:
        process.env.CONTENT_MODERATION_LABEL_PRICING || 'Pricing Model:',
      difficulty:
        process.env.CONTENT_MODERATION_LABEL_DIFFICULTY || 'Difficulty:',
      technologies:
        process.env.CONTENT_MODERATION_LABEL_TECH || 'Technologies:',
      tags: process.env.CONTENT_MODERATION_LABEL_TAGS || 'Tags:',
      benefits: process.env.CONTENT_MODERATION_LABEL_BENEFITS || 'Benefits:',
      submittedBy:
        process.env.CONTENT_MODERATION_LABEL_SUBMITTED_BY || 'Submitted By:',
      submittedAt:
        process.env.CONTENT_MODERATION_LABEL_SUBMITTED_AT || 'Submitted At:',
      reviewedBy:
        process.env.CONTENT_MODERATION_LABEL_REVIEWED_BY || 'Reviewed By:',
      reviewedAt:
        process.env.CONTENT_MODERATION_LABEL_REVIEWED_AT || 'Reviewed At:',
      rejectionReason:
        process.env.CONTENT_MODERATION_LABEL_REJECTION_REASON ||
        'Rejection Reason:',
      notes: process.env.CONTENT_MODERATION_LABEL_NOTES || 'Notes:',
    },
    buttons: {
      approve: process.env.CONTENT_MODERATION_BTN_APPROVE || 'Approve',
      reject: process.env.CONTENT_MODERATION_BTN_REJECT || 'Reject',
    },
    placeholders: {
      rejectionReason:
        process.env.CONTENT_MODERATION_PLACEHOLDER_REJECTION ||
        'Enter reason for rejection...',
      statusReason:
        process.env.CONTENT_MODERATION_PLACEHOLDER_STATUS_REASON ||
        'Enter reason for status change',
      statusNotes:
        process.env.CONTENT_MODERATION_PLACEHOLDER_STATUS_NOTES ||
        'Additional notes about this change',
    },
    defaults: {
      anonymous:
        process.env.CONTENT_MODERATION_DEFAULT_ANONYMOUS || 'Anonymous',
      notAvailable: process.env.CONTENT_MODERATION_DEFAULT_NA || 'N/A',
    },
    loading: {
      submission:
        process.env.CONTENT_MODERATION_LOADING_SUBMISSION ||
        'Loading submission...',
    },
    queue: {
      title: process.env.CONTENT_MODERATION_QUEUE_TITLE || 'Moderation Queue',
      description:
        process.env.CONTENT_MOD_QUEUE_DESC ||
        'Review pending resource submissions',
    },
    status: {
      title:
        process.env.CONTENT_MODERATION_STATUS_TITLE || 'Manage Resource Status',
    },
    // Activity section - BugFixer's bug fix!
    activity: {
      emptyState:
        process.env.CONTENT_MODERATION_ACTIVITY_EMPTY || 'No recent activity',
      approved: process.env.CONTENT_MODERATION_ACTIVITY_APPROVED || 'approved',
      rejected: process.env.CONTENT_MODERATION_ACTIVITY_REJECTED || 'rejected',
      flagged: process.env.CONTENT_MODERATION_ACTIVITY_FLAGGED || 'flagged',
    },
  },

  // API Keys - Flexy hates hardcoded API key strings!
  apiKeys: {
    title: process.env.CONTENT_API_KEYS_TITLE || 'API Keys',
    description:
      process.env.CONTENT_API_KEYS_DESCRIPTION ||
      'Generate and manage API keys to access the API',
    form: {
      title: process.env.CONTENT_API_KEYS_FORM_TITLE || 'Create New API Key',
      keyNameLabel: process.env.CONTENT_API_KEYS_LABEL_NAME || 'Key Name',
      permissionsLabel:
        process.env.CONTENT_API_KEYS_LABEL_PERMISSIONS || 'Permissions',
    },
    buttons: {
      create: process.env.CONTENT_API_KEYS_BTN_CREATE || 'Create API Key',
      createSubmit:
        process.env.CONTENT_API_KEYS_BTN_CREATE_SUBMIT || 'Create API Key',
      generate: process.env.CONTENT_API_KEYS_BTN_GENERATE || 'Generate API Key',
      revoke: process.env.CONTENT_API_KEYS_BTN_REVOKE || 'Revoke',
      cancel: process.env.CONTENT_API_KEYS_BTN_CANCEL || 'Cancel',
    },
    permissions: {
      read: process.env.CONTENT_API_KEYS_PERM_READ || 'Read',
      write: process.env.CONTENT_API_KEYS_PERM_WRITE || 'Write',
      delete: process.env.CONTENT_API_KEYS_PERM_DELETE || 'Delete',
      webhooks: process.env.CONTENT_API_KEYS_PERM_WEBHOOKS || 'Webhooks',
      admin: process.env.CONTENT_API_KEYS_PERM_ADMIN || 'Admin',
    },
    list: {
      title: process.env.CONTENT_API_KEYS_LIST_TITLE || 'Your API Keys',
    },
    labels: {
      id: process.env.CONTENT_API_KEYS_LABEL_ID || 'ID:',
      created: process.env.CONTENT_API_KEYS_LABEL_CREATED || 'Created:',
      lastUsed: process.env.CONTENT_API_KEYS_LABEL_LAST_USED || 'Last Used:',
      expires: process.env.CONTENT_API_KEYS_LABEL_EXPIRES || 'Expires:',
      yourKeys: process.env.CONTENT_API_KEYS_LABEL_YOUR_KEYS || 'Your API Keys',
      apiKeyPrefix: process.env.CONTENT_API_KEYS_LABEL_PREFIX || 'API Key:',
      keyName: process.env.CONTENT_API_KEYS_LABEL_KEY_NAME || 'Key Name',
      permissions:
        process.env.CONTENT_API_KEYS_LABEL_PERMISSIONS || 'Permissions',
    },
    empty: {
      message:
        process.env.CONTENT_API_KEYS_EMPTY ||
        "You don't have any API keys yet.",
      title: process.env.CONTENT_API_KEYS_EMPTY_TITLE || 'No API keys yet',
      description:
        process.env.CONTENT_API_KEYS_EMPTY_DESC ||
        'Generate your first API key to start using the API.',
      ctaButton:
        process.env.CONTENT_API_KEYS_EMPTY_CTA || 'Create Your First API Key',
    },
    placeholders: {
      keyName:
        process.env.CONTENT_API_KEYS_PLACEHOLDER_NAME || 'My Application Key',
      keyNameAlt:
        process.env.CONTENT_API_KEYS_PLACEHOLDER_NAME_ALT ||
        'e.g., My Application Key',
    },
    toggle: {
      hide: process.env.CONTENT_API_KEYS_TOGGLE_HIDE || 'Hide Key',
      show: process.env.CONTENT_API_KEYS_TOGGLE_SHOW || 'Show Key',
    },
    messages: {
      copyWarning:
        process.env.CONTENT_API_KEYS_COPY_WARNING ||
        "Make sure to copy this key now. You won't be able to see it again.",
    },
    documentation: {
      title: process.env.CONTENT_API_KEYS_DOC_TITLE || 'API Documentation',
      description:
        process.env.CONTENT_API_KEYS_DOC_DESC ||
        'For detailed information about available endpoints, request/response formats, and authentication requirements, visit our interactive API documentation.',
      button:
        process.env.CONTENT_API_KEYS_DOC_BUTTON || 'View API Documentation',
    },
    toast: {
      copied:
        process.env.CONTENT_API_KEYS_TOAST_COPIED ||
        '{{ name }} API key copied to clipboard',
    },
    // ARIA labels for accessibility - Pallete's micro-UX enhancement!
    aria: {
      revokeButton:
        process.env.CONTENT_API_KEYS_ARIA_REVOKE || 'Revoke API key: {{name}}',
    },
  },

  // Comments - Flexy hates hardcoded comment strings!
  comments: {
    title: process.env.CONTENT_COMMENTS_TITLE || 'Comments',
    countLabel: process.env.CONTENT_COMMENTS_COUNT_LABEL || 'comments',
    placeholders: {
      newComment:
        process.env.CONTENT_COMMENTS_PLACEHOLDER ||
        'Write a comment... (Markdown supported)',
    },
    aria: {
      addComment: process.env.CONTENT_COMMENTS_ARIA_ADD || 'Add a comment',
      submitting:
        process.env.CONTENT_COMMENTS_ARIA_SUBMITTING || 'Submitting comment...',
      postComment: process.env.CONTENT_COMMENTS_ARIA_POST || 'Post comment',
      likeComment: process.env.CONTENT_COMMENTS_ARIA_LIKE || 'Like comment',
    },
    validation: {
      minLength: parseInt(process.env.CONTENT_COMMENTS_MIN_LENGTH || '3'),
      maxLength: parseInt(process.env.CONTENT_COMMENTS_MAX_LENGTH || '1000'),
      overLimit: process.env.CONTENT_COMMENTS_OVER_LIMIT || 'Over limit',
      nearLimit: process.env.CONTENT_COMMENTS_NEAR_LIMIT || 'Near limit',
      tooShort: process.env.CONTENT_COMMENTS_TOO_SHORT || 'Too short',
      hint: process.env.CONTENT_COMMENTS_HINT || 'Hint',
    },
    buttons: {
      post: process.env.CONTENT_COMMENTS_BTN_POST || 'Post Comment',
      cancel: process.env.CONTENT_COMMENTS_BTN_CANCEL || 'Cancel',
      reply: process.env.CONTENT_COMMENTS_BTN_REPLY || 'Reply',
    },
  },

  // Webhooks - Flexy hates hardcoded webhook strings!
  webhooks: {
    title: process.env.CONTENT_WEBHOOKS_TITLE || 'Webhook Management',
    buttons: {
      create: process.env.CONTENT_WEBHOOKS_BTN_CREATE || 'Create Webhook',
      createSubmit:
        process.env.CONTENT_WEBHOOKS_BTN_CREATE_SUBMIT || 'Create Webhook',
      activate: process.env.CONTENT_WEBHOOKS_BTN_ACTIVATE || 'Activate',
      deactivate: process.env.CONTENT_WEBHOOKS_BTN_DEACTIVATE || 'Deactivate',
      delete: process.env.CONTENT_WEBHOOKS_BTN_DELETE || 'Delete',
      cancel: process.env.CONTENT_WEBHOOKS_BTN_CANCEL || 'Cancel',
    },
    form: {
      title: process.env.CONTENT_WEBHOOKS_FORM_TITLE || 'Create New Webhook',
      urlLabel: process.env.CONTENT_WEBHOOKS_LABEL_URL || 'Webhook URL',
      urlDescription:
        process.env.CONTENT_WEBHOOKS_URL_DESC ||
        'Enter the endpoint URL where webhook events will be sent',
      eventsLabel: process.env.CONTENT_WEBHOOKS_LABEL_EVENTS || 'Events',
      activeLabel: process.env.CONTENT_WEBHOOKS_LABEL_ACTIVE || 'Active',
      required: process.env.CONTENT_WEBHOOKS_REQUIRED || '(required)',
    },
    list: {
      title: process.env.CONTENT_WEBHOOKS_LIST_TITLE || 'Webhooks',
    },
    status: {
      active: process.env.CONTENT_WEBHOOKS_STATUS_ACTIVE || 'Active',
      inactive: process.env.CONTENT_WEBHOOKS_STATUS_INACTIVE || 'Inactive',
    },
    labels: {
      lastDelivery: process.env.CONTENT_WEBHOOKS_LABEL_LAST || 'Last:',
      subscribedEvents:
        process.env.CONTENT_WEBHOOKS_LABEL_SUBSCRIBED || 'Subscribed events',
    },
    empty: {
      message: process.env.CONTENT_WEBHOOKS_EMPTY || 'No webhooks configured',
      title: process.env.CONTENT_WEBHOOKS_EMPTY_TITLE || 'No webhooks yet',
      description:
        process.env.CONTENT_WEBHOOKS_EMPTY_DESC ||
        'Create your first webhook to receive real-time notifications when events occur',
      ctaButton:
        process.env.CONTENT_WEBHOOKS_EMPTY_CTA || 'Create Your First Webhook',
    },
    ariaLabels: {
      createButton:
        process.env.CONTENT_WEBHOOKS_ARIA_CREATE || 'Create new webhook',
      eventsGroup:
        process.env.CONTENT_WEBHOOKS_ARIA_EVENTS || 'Select webhook events',
      enableWebhook:
        process.env.CONTENT_WEBHOOKS_ARIA_ENABLE || 'Enable webhook',
      submitCreate:
        process.env.CONTENT_WEBHOOKS_ARIA_SUBMIT || 'Create new webhook',
      cancelCreate:
        process.env.CONTENT_WEBHOOKS_ARIA_CANCEL || 'Cancel webhook creation',
      webhookActions:
        process.env.CONTENT_WEBHOOKS_ARIA_ACTIONS || 'Webhook actions',
      deleteWebhook:
        process.env.CONTENT_WEBHOOKS_ARIA_DELETE || 'Delete webhook',
      toggleWebhook:
        process.env.CONTENT_WEBHOOKS_ARIA_TOGGLE ||
        '{{ action }} webhook at {{ url }}',
      webhookStatus:
        process.env.CONTENT_WEBHOOKS_ARIA_STATUS || 'Webhook is {{ status }}',
      deliveryStatus:
        process.env.CONTENT_WEBHOOKS_ARIA_DELIVERY ||
        'Last delivery status: {{ status }}',
    },
    success: {
      created:
        process.env.CONTENT_WEBHOOKS_SUCCESS_CREATED ||
        'Webhook created successfully!',
    },
  },

  // Loading States - Flexy hates hardcoded loading messages!
  loading: {
    default: process.env.CONTENT_LOADING_DEFAULT || 'Loading',
    resourceCard:
      process.env.CONTENT_LOADING_RESOURCE_CARD || 'Loading resource card',
    filters: process.env.CONTENT_LOADING_FILTERS || 'Loading filters',
    searchResults:
      process.env.CONTENT_LOADING_SEARCH_RESULTS || 'Loading search results',
    filterOptions:
      process.env.CONTENT_LOADING_FILTER_OPTIONS || 'Loading filter options',
    analytics:
      process.env.CONTENT_LOADING_ANALYTICS || 'Loading analytics data',
    aiKeys: process.env.CONTENT_LOADING_AI_KEYS || 'Loading AI API keys',
    comparison:
      process.env.CONTENT_LOADING_COMPARISON || 'Loading comparison data',
    searchAnalytics:
      process.env.CONTENT_LOADING_SEARCH_ANALYTICS ||
      'Loading search analytics',
    recommendations:
      process.env.CONTENT_LOADING_RECOMMENDATIONS || 'Loading recommendations',
    inProgress: process.env.CONTENT_LOADING_IN_PROGRESS || 'in progress',
    complete: process.env.CONTENT_LOADING_COMPLETE || 'complete',
    failed: process.env.CONTENT_LOADING_FAILED || 'failed',
  },

  // Keyboard Shortcuts - Flexy hates hardcoded shortcut descriptions!
  keyboardShortcuts: {
    title: process.env.CONTENT_KEYBOARD_TITLE || 'Keyboard Shortcuts',
    description:
      process.env.CONTENT_KEYBOARD_DESCRIPTION ||
      'Use these shortcuts to navigate faster and work more efficiently.',
    sections: {
      search: process.env.CONTENT_KEYBOARD_SECTION_SEARCH || 'Search',
      navigation: process.env.CONTENT_KEYBOARD_SECTION_NAV || 'Navigation',
      filters: process.env.CONTENT_KEYBOARD_SECTION_FILTERS || 'Filters',
      quickActions:
        process.env.CONTENT_KEYBOARD_SECTION_ACTIONS || 'Quick Actions',
    },
    shortcuts: {
      focusSearch:
        process.env.CONTENT_KEYBOARD_FOCUS_SEARCH || 'Focus search box',
      clearSearch:
        process.env.CONTENT_KEYBOARD_CLEAR_SEARCH ||
        'Clear search / Close suggestions',
      navigate: process.env.CONTENT_KEYBOARD_NAVIGATE || 'Navigate suggestions',
      nextFocus:
        process.env.CONTENT_KEYBOARD_NEXT_FOCUS ||
        'Move to next focusable element',
      prevFocus:
        process.env.CONTENT_KEYBOARD_PREV_FOCUS ||
        'Move to previous focusable element',
      closeModal:
        process.env.CONTENT_KEYBOARD_CLOSE_MODAL || 'Close modals / menus',
      undoFilters:
        process.env.CONTENT_KEYBOARD_UNDO_FILTERS || 'Undo clear filters',
      selectFilter:
        process.env.CONTENT_KEYBOARD_SELECT_FILTER ||
        'Select/deselect filter option',
      openHelp:
        process.env.CONTENT_KEYBOARD_OPEN_HELP || 'Open this help modal',
    },
    trigger: {
      label: process.env.CONTENT_KEYBOARD_TRIGGER_LABEL || 'Shortcuts',
      aria:
        process.env.CONTENT_KEYBOARD_TRIGGER_ARIA ||
        'View keyboard shortcuts (press ? to open)',
    },
    aria: {
      close:
        process.env.CONTENT_KEYBOARD_CLOSE_ARIA ||
        'Close keyboard shortcuts (press Escape)',
    },
  },

  // Health Monitor - Flexy hates hardcoded health strings!
  health: {
    title: process.env.CONTENT_HEALTH_TITLE || 'Resource Health',
    button: {
      check: process.env.CONTENT_HEALTH_BTN_CHECK || 'Check Health',
      checking: process.env.CONTENT_HEALTH_BTN_CHECKING || 'Checking...',
    },
    status: {
      healthy: process.env.CONTENT_HEALTH_STATUS_HEALTHY || 'Healthy',
      unhealthy: process.env.CONTENT_HEALTH_STATUS_UNHEALTHY || 'Unhealthy',
      unknown: process.env.CONTENT_HEALTH_STATUS_UNKNOWN || 'Unknown',
    },
    labels: {
      status: process.env.CONTENT_HEALTH_LABEL_STATUS || 'Status:',
      lastChecked:
        process.env.CONTENT_HEALTH_LABEL_LAST_CHECKED || 'Last checked:',
      responseTime:
        process.env.CONTENT_HEALTH_LABEL_RESPONSE_TIME || 'Response time:',
      error: process.env.CONTENT_HEALTH_LABEL_ERROR || 'Error:',
    },
    units: {
      ms: process.env.CONTENT_HEALTH_UNIT_MS || 'ms',
    },
    recentChecks: process.env.CONTENT_HEALTH_RECENT_CHECKS || 'Recent Checks',
    emptyState:
      process.env.CONTENT_HEALTH_EMPTY ||
      'Health data not available for this resource.',
  },

  // About Page - Flexy hates hardcoded about content!
  about: {
    title:
      process.env.CONTENT_ABOUT_TITLE || 'About Free Stuff on the Internet',
    sectionTitle:
      process.env.CONTENT_ABOUT_SECTION_TITLE || 'About This Resource',
    description:
      process.env.CONTENT_ABOUT_DESC ||
      `Free Stuff on the Internet is a curated collection of free resources for developers, designers, and tech enthusiasts. We gather the best free tiers, trials, and genuinely free tools to help you build amazing things without breaking the bank.`,
    categoriesTitle:
      process.env.CONTENT_ABOUT_CATEGORIES_TITLE || 'Categories Covered',
    categories: {
      ai: process.env.CONTENT_ABOUT_CATEGORY_AI || 'Free AI API Keys and Tools',
      vps:
        process.env.CONTENT_ABOUT_CATEGORY_VPS || 'Free VPS and Cloud Services',
      hosting:
        process.env.CONTENT_ABOUT_CATEGORY_HOSTING ||
        'Free Web Hosting Platforms',
      databases:
        process.env.CONTENT_ABOUT_CATEGORY_DATABASES ||
        'Free Databases and Storage Solutions',
      cdn:
        process.env.CONTENT_ABOUT_CATEGORY_CDN ||
        'Free CDN and Performance Tools',
    },
  },

  // Developer Page - Flexy hates hardcoded developer strings!
  developer: {
    rateLimits: {
      general: process.env.CONTENT_DEV_RATE_GENERAL || 'General requests',
      search: process.env.CONTENT_DEV_RATE_SEARCH || 'Search requests',
      submission:
        process.env.CONTENT_DEV_RATE_SUBMISSION || 'Submission requests',
    },
  },

  // Analytics - Flexy hates hardcoded analytics labels!
  analytics: {
    labels: {
      startDate: process.env.CONTENT_ANALYTICS_START_DATE || 'Start Date',
      endDate: process.env.CONTENT_ANALYTICS_END_DATE || 'End Date',
    },
  },

  // Error Message Component - Flexy hates hardcoded error strings!
  errorMessage: {
    undo: {
      aria:
        process.env.CONTENT_ERROR_UNDO_ARIA ||
        'Undo dismissal of {variant} message. Press Control Z to restore',
    },
    dismissed:
      process.env.CONTENT_ERROR_DISMISSED ||
      '{variant} message dismissed. Press Control Z to restore.',
    restored:
      process.env.CONTENT_ERROR_RESTORED || '{variant} message restored.',
    dismiss: {
      aria:
        process.env.CONTENT_ERROR_DISMISS_ARIA || 'Dismiss {variant} message',
    },
  },

  // Profile Page - Flexy hates hardcoded profile strings!
  profile: {
    settings: {
      recommendations:
        process.env.CONTENT_PROFILE_RECOMMENDATIONS ||
        'Personalized recommendations',
      dataCollection:
        process.env.CONTENT_PROFILE_DATA_COLLECTION || 'Data collection',
      explanations:
        process.env.CONTENT_PROFILE_EXPLANATIONS ||
        'Recommendation explanations',
    },
  },

  // Common Buttons - Flexy hates hardcoded button labels!
  buttons: {
    cancel: process.env.CONTENT_BTN_CANCEL || 'Cancel',
    delete: process.env.CONTENT_BTN_DELETE || 'Delete',
    undo: process.env.CONTENT_BTN_UNDO || 'Undo',
    scrollToTop: process.env.CONTENT_BTN_SCROLL_TOP || 'Scroll to top',
  },

  // Search - Flexy hates hardcoded search strings!
  searchExtra: {
    tooltip: {
      focus:
        process.env.CONTENT_SEARCH_TOOLTIP_FOCUS || 'Press / to focus search',
      clear: process.env.CONTENT_SEARCH_TOOLTIP_CLEAR || 'Clear search (Esc)',
    },
    autoUpdateMessage:
      process.env.CONTENT_SEARCH_AUTO_UPDATE ||
      'Search results will be updated automatically',
    searching: process.env.CONTENT_SEARCH_SEARCHING || 'Searching...',
  },

  // Resource Card - Flexy hates hardcoded card strings!
  resourceCardExtra: {
    hoverHint: process.env.CONTENT_RESOURCE_HOVER_HINT || 'Hover for actions',
  },

  // Resource Detail - Flexy hates hardcoded detail strings!
  resourceDetailExtra: {
    updateHistory:
      process.env.CONTENT_RESOURCE_UPDATE_HISTORY || 'Update History',
  },

  // Comments - Flexy hates hardcoded comment strings!
  // Social Share - Flexy hates hardcoded social strings!
  socialShareExtra: {
    aria: {
      share: process.env.CONTENT_SOCIAL_SHARE_ARIA || 'Share this resource',
    },
  },

  // Empty State - Flexy hates hardcoded empty state strings!
  emptyState: {
    buttons: {
      reset: process.env.CONTENT_EMPTY_RESET || 'Reset Filters',
      browseAll: process.env.CONTENT_EMPTY_BROWSE_ALL || 'Browse All Resources',
    },
    tips: {
      title: process.env.CONTENT_EMPTY_TIPS_TITLE || 'Search Tips',
      fewerFilters:
        process.env.CONTENT_EMPTY_TIPS_FEWER ||
        'Use fewer filters to see more results',
      synonyms:
        process.env.CONTENT_EMPTY_TIPS_SYNONYMS ||
        'Try synonyms or related terms',
      spelling:
        process.env.CONTENT_EMPTY_TIPS_SPELLING ||
        'Check spelling and try broader keywords',
    },
  },

  // Form - Flexy hates hardcoded form strings!
  form: {
    required: process.env.CONTENT_FORM_REQUIRED || '(required)',
  },

  // Review Queue - Flexy hates hardcoded moderation strings!
  reviewQueue: {
    title: process.env.CONTENT_REVIEW_QUEUE_TITLE || 'Moderation Queue',
    filters: {
      allStatuses: process.env.CONTENT_REVIEW_FILTER_ALL || 'All Statuses',
      pending: process.env.CONTENT_REVIEW_FILTER_PENDING || 'Pending',
      approved: process.env.CONTENT_REVIEW_FILTER_APPROVED || 'Approved',
      rejected: process.env.CONTENT_REVIEW_FILTER_REJECTED || 'Rejected',
    },
    // Palette's micro-UX enhancement: ARIA labels for accessibility
    aria: {
      statusFilter:
        process.env.CONTENT_REVIEW_ARIA_STATUS_FILTER ||
        'Filter submissions by status',
      categoryFilter:
        process.env.CONTENT_REVIEW_ARIA_CATEGORY_FILTER ||
        'Filter submissions by category',
      submissionsList:
        process.env.CONTENT_REVIEW_ARIA_SUBMISSIONS_LIST ||
        'List of resource submissions',
      submissionCard:
        process.env.CONTENT_REVIEW_ARIA_SUBMISSION_CARD ||
        'Submission from {{submitter}} - {{title}}',
    },
    loading: process.env.CONTENT_REVIEW_LOADING || 'Loading submissions...',
    emptyState:
      process.env.CONTENT_REVIEW_EMPTY ||
      'No submissions found matching your criteria.',
    actions: {
      review: process.env.CONTENT_REVIEW_ACTION_REVIEW || 'Review',
    },
    labels: {
      category: process.env.CONTENT_REVIEW_LABEL_CATEGORY || 'Category:',
      submittedBy:
        process.env.CONTENT_REVIEW_LABEL_SUBMITTED_BY || 'Submitted by:',
      submittedAt:
        process.env.CONTENT_REVIEW_LABEL_SUBMITTED_AT || 'Submitted:',
    },
  },

  // Status Management - Flexy hates hardcoded status UI text!
  statusManager: {
    title: process.env.CONTENT_STATUS_TITLE || 'Manage Resource Status',
    labels: {
      changeStatus: process.env.CONTENT_STATUS_LABEL_CHANGE || 'Change Status:',
      reason: process.env.CONTENT_STATUS_LABEL_REASON || 'Reason:',
      notes: process.env.CONTENT_STATUS_LABEL_NOTES || 'Notes (optional):',
    },
    placeholders: {
      reason:
        process.env.CONTENT_STATUS_PLACEHOLDER_REASON ||
        'Enter reason for status change',
      notes:
        process.env.CONTENT_STATUS_PLACEHOLDER_NOTES ||
        'Additional notes about this change',
    },
    buttons: {
      update: process.env.CONTENT_STATUS_BTN_UPDATE || 'Update Status',
      updating: process.env.CONTENT_STATUS_BTN_UPDATING || 'Updating...',
    },
    statusOptions: {
      active: process.env.CONTENT_STATUS_OPT_ACTIVE || 'Active',
      deprecated: process.env.CONTENT_STATUS_OPT_DEPRECATED || 'Deprecated',
      discontinued:
        process.env.CONTENT_STATUS_OPT_DISCONTINUED || 'Discontinued',
      updated: process.env.CONTENT_STATUS_OPT_UPDATED || 'Updated',
      pending: process.env.CONTENT_STATUS_OPT_PENDING || 'Pending',
    },
    messages: {
      success:
        process.env.CONTENT_STATUS_MSG_SUCCESS ||
        'Status updated successfully!',
      error: process.env.CONTENT_STATUS_MSG_ERROR || 'Error updating status:',
    },
  },

  // Submission Review - Flexy hates hardcoded review UI text!
  submissionReview: {
    loading: process.env.CONTENT_REVIEW_LOADING || 'Loading submission...',
    sections: {
      resourceInfo:
        process.env.CONTENT_REVIEW_SECTION_RESOURCE || 'Resource Information',
      submissionDetails:
        process.env.CONTENT_REVIEW_SECTION_SUBMISSION || 'Submission Details',
    },
    labels: {
      description: process.env.CONTENT_REVIEW_LABEL_DESC || 'Description:',
      url: process.env.CONTENT_REVIEW_LABEL_URL || 'URL:',
      category: process.env.CONTENT_REVIEW_LABEL_CATEGORY || 'Category:',
      pricingModel:
        process.env.CONTENT_REVIEW_LABEL_PRICING || 'Pricing Model:',
      difficulty: process.env.CONTENT_REVIEW_LABEL_DIFFICULTY || 'Difficulty:',
      technologies: process.env.CONTENT_REVIEW_LABEL_TECH || 'Technologies:',
      tags: process.env.CONTENT_REVIEW_LABEL_TAGS || 'Tags:',
      benefits: process.env.CONTENT_REVIEW_LABEL_BENEFITS || 'Benefits:',
      submittedBy:
        process.env.CONTENT_REVIEW_LABEL_SUBMITTED_BY || 'Submitted By:',
      submittedAt:
        process.env.CONTENT_REVIEW_LABEL_SUBMITTED_AT || 'Submitted At:',
      reviewedBy:
        process.env.CONTENT_REVIEW_LABEL_REVIEWED_BY || 'Reviewed By:',
      reviewedAt:
        process.env.CONTENT_REVIEW_LABEL_REVIEWED_AT || 'Reviewed At:',
      rejectionReason:
        process.env.CONTENT_REVIEW_LABEL_REJECTION || 'Rejection Reason:',
      notes: process.env.CONTENT_REVIEW_LABEL_NOTES || 'Notes:',
    },
    values: {
      anonymous: process.env.CONTENT_REVIEW_VAL_ANON || 'Anonymous',
      notAvailable: process.env.CONTENT_REVIEW_VAL_NA || 'N/A',
    },
    placeholders: {
      rejectionReason:
        process.env.CONTENT_REVIEW_PLACEHOLDER_REJECTION ||
        'Enter reason for rejection...',
    },
    actions: {
      approve: {
        title:
          process.env.CONTENT_REVIEW_ACTION_APPROVE_TITLE ||
          'Approve Submission',
        button: process.env.CONTENT_REVIEW_ACTION_APPROVE_BTN || 'Approve',
        successMessage:
          process.env.CONTENT_REVIEW_ACTION_APPROVE_SUCCESS ||
          'Submission approved successfully',
      },
      reject: {
        title:
          process.env.CONTENT_REVIEW_ACTION_REJECT_TITLE || 'Reject Submission',
        button: process.env.CONTENT_REVIEW_ACTION_REJECT_BTN || 'Reject',
        successMessage:
          process.env.CONTENT_REVIEW_ACTION_REJECT_SUCCESS ||
          'Submission rejected successfully',
      },
    },
    errors: {
      approveFailed:
        process.env.CONTENT_REVIEW_ERR_APPROVE ||
        'Failed to approve submission',
      rejectFailed:
        process.env.CONTENT_REVIEW_ERR_REJECT || 'Failed to reject submission',
    },
    // Palette's micro-UX delight: Celebration text for approval
    celebration: {
      approved:
        process.env.CONTENT_REVIEW_CELEBRATION_APPROVED ||
        'Submission Approved! 🎉',
      approvedAnnouncement:
        process.env.CONTENT_REVIEW_CELEBRATION_ANNOUNCE ||
        'Submission approved successfully',
    },
  },

  // Resource Lifecycle Timeline - Flexy hates hardcoded timeline text!
  lifecycle: {
    title: process.env.CONTENT_LIFECYCLE_TITLE || 'Resource Lifecycle',
    emptyState:
      process.env.CONTENT_LIFECYCLE_EMPTY ||
      'No status history available for this resource.',
    updateHistoryTitle:
      process.env.CONTENT_LIFECYCLE_UPDATE_TITLE || 'Update History',
    labels: {
      reason: process.env.CONTENT_LIFECYCLE_LABEL_REASON || 'Reason:',
      notes: process.env.CONTENT_LIFECYCLE_LABEL_NOTES || 'Notes:',
      changedBy:
        process.env.CONTENT_LIFECYCLE_LABEL_CHANGED_BY || 'Changed by:',
    },
    versionPrefix: process.env.CONTENT_LIFECYCLE_VERSION_PREFIX || 'v',
  },

  // Deprecation Notice - Flexy hates hardcoded deprecation strings!
  deprecation: {
    icons: {
      deprecated: process.env.CONTENT_DEPRECATION_ICON_DEPRECATED || '⚠️',
      discontinued: process.env.CONTENT_DEPRECATION_ICON_DISCONTINUED || '🚫',
      pending: process.env.CONTENT_DEPRECATION_ICON_PENDING || '⏳',
    },
    titles: {
      deprecated:
        process.env.CONTENT_DEPRECATION_TITLE_DEPRECATED ||
        'Deprecated Resource',
      discontinued:
        process.env.CONTENT_DEPRECATION_TITLE_DISCONTINUED ||
        'Discontinued Resource',
      pending:
        process.env.CONTENT_DEPRECATION_TITLE_PENDING || 'Pending Review',
    },
    messages: {
      deprecated:
        process.env.CONTENT_DEPRECATION_MSG_DEPRECATED ||
        'This resource is deprecated and no longer recommended. Consider using alternatives.',
      discontinued:
        process.env.CONTENT_DEPRECATION_MSG_DISCONTINUED ||
        'This resource has been discontinued and is no longer maintained.',
      pending:
        process.env.CONTENT_DEPRECATION_MSG_PENDING ||
        'This resource is pending review and not yet available to all users.',
    },
    actions: {
      migrationPath:
        process.env.CONTENT_DEPRECATION_ACTION_MIGRATION || 'Migration Path',
      viewAlternatives:
        process.env.CONTENT_DEPRECATION_ACTION_ALTERNATIVES ||
        'View Alternatives',
      dismiss:
        process.env.CONTENT_DEPRECATION_ACTION_DISMISS || 'Dismiss notice',
    },
  },

  // Toast Messages - Flexy hates hardcoded toast messages!
  toast: {
    draft: {
      restored: {
        title: process.env.CONTENT_TOAST_DRAFT_TITLE || 'Draft restored',
        description:
          process.env.CONTENT_TOAST_DRAFT_DESC ||
          'Your previous submission draft from {{ timeAgo }} has been restored.',
      },
    },
    comparison: {
      copied: {
        title:
          process.env.CONTENT_TOAST_COMPARISON_TITLE ||
          'Comparison URL copied to clipboard!',
      },
    },
    savedSearch: {
      added:
        process.env.CONTENT_TOAST_SAVED_SEARCH_ADDED ||
        'Saved search "{{name}}" successfully!',
      updated:
        process.env.CONTENT_TOAST_SAVED_SEARCH_UPDATED ||
        'Updated saved search "{{name}}"!',
      removed:
        process.env.CONTENT_TOAST_SAVED_SEARCH_REMOVED ||
        'Removed saved search "{{name}}".',
    },
    share: {
      copied:
        process.env.CONTENT_TOAST_SHARE_COPIED || 'Link copied to clipboard!',
      failed: process.env.CONTENT_TOAST_SHARE_FAILED || 'Failed to copy link',
    },
  },

  // Share Button - Flexy hates hardcoded share strings!
  share: {
    ariaLabels: {
      copySuccess:
        process.env.CONTENT_SHARE_ARIA_COPY_SUCCESS || 'Link copied!',
      shareTitle:
        process.env.CONTENT_SHARE_ARIA_SHARE_TITLE || 'Share {{title}}',
      close: process.env.CONTENT_SHARE_ARIA_CLOSE || 'Close share menu',
      share: process.env.CONTENT_SHARE_ARIA_SHARE || 'Share this resource',
      menuOpened:
        process.env.CONTENT_SHARE_ARIA_MENU_OPENED || 'Share menu opened',
      menuClosed:
        process.env.CONTENT_SHARE_ARIA_MENU_CLOSED || 'Share menu closed',
    },
  },

  // Layout - Flexy hates hardcoded layout strings!
  layout: {
    ariaLabels: {
      homeLink:
        process.env.CONTENT_LAYOUT_ARIA_HOME ||
        'Free Stuff on the Internet - Return to home page',
      search:
        process.env.CONTENT_LAYOUT_ARIA_SEARCH || 'Search for free resources',
      mainNav: process.env.CONTENT_LAYOUT_ARIA_MAIN_NAV || 'Main navigation',
      compare:
        process.env.CONTENT_LAYOUT_ARIA_COMPARE ||
        'Compare {{count}} resources',
      mainContent:
        process.env.CONTENT_LAYOUT_ARIA_MAIN_CONTENT || 'Main content',
      keyboardShortcuts:
        process.env.CONTENT_LAYOUT_ARIA_KEYBOARD ||
        'View keyboard shortcuts (press ? to open)',
    },
  },

  // Resource Pages - Flexy hates hardcoded resource strings!
  resource: {
    ariaLabels: {
      readingProgress:
        process.env.CONTENT_RESOURCE_ARIA_READING_PROGRESS ||
        'Resource reading progress',
      loading: process.env.CONTENT_RESOURCE_ARIA_LOADING || 'Loading resource',
    },
    readingProgress: {
      completionText:
        process.env.CONTENT_RESOURCE_READING_COMPLETE || 'Reading complete!',
      completionAnnouncement:
        process.env.CONTENT_RESOURCE_READING_ANNOUNCEMENT ||
        'Congratulations! You have finished reading this resource',
    },
  },

  // Reading Configuration - Flexy hates hardcoded reading values!
  reading: {
    // Average words per minute for reading time calculation
    wordsPerMinute: parseInt(process.env.READING_WORDS_PER_MINUTE || '200'),
  },

  // Alias for readingProgress - some components use contentConfig.readingProgress
  get readingProgress() {
    return this.resource.readingProgress
  },

  // Search Page - Flexy hates hardcoded search strings!
  searchPage: {
    ariaLabels: {
      loadingResults:
        process.env.CONTENT_SEARCH_ARIA_LOADING_RESULTS ||
        'Loading search results',
      loadingFilters:
        process.env.CONTENT_SEARCH_ARIA_LOADING_FILTERS ||
        'Loading filter options',
      resourceFilters:
        process.env.CONTENT_SEARCH_ARIA_RESOURCE_FILTERS || 'Resource filters',
    },
  },

  // Favorites Page - Flexy hates hardcoded favorites strings!
  favoritesPage: {
    ariaLabels: {
      removeBookmark:
        process.env.CONTENT_FAVORITES_ARIA_REMOVE ||
        'Remove {{title}} from bookmarks',
      bookmarkTitle:
        process.env.CONTENT_FAVORITES_ARIA_BOOKMARK_TITLE || 'Remove bookmark',
    },
  },

  // OptimizedImage Component - Palette's micro-UX enhancement!
  // Accessibility labels and user-facing text for image loading states
  optimizedImage: {
    error: {
      title: process.env.CONTENT_IMAGE_ERROR_TITLE || 'Failed to load image',
      retryButton: process.env.CONTENT_IMAGE_RETRY_BUTTON || 'Retry',
      retryAriaLabel:
        process.env.CONTENT_IMAGE_RETRY_ARIA || 'Retry loading image',
      announcement:
        process.env.CONTENT_IMAGE_ERROR_ANNOUNCEMENT || 'Image failed to load',
    },
    loadAnnouncement:
      process.env.CONTENT_IMAGE_LOAD_ANNOUNCEMENT || 'Image loaded',
  },

  // Comparison Value Component - Palette's micro-UX enhancement!
  // Copy-to-clipboard functionality with delightful feedback
  comparisonValue: {
    // Tooltip text for copy button
    copyTooltip: process.env.CONTENT_COMPARISON_COPY_TOOLTIP || 'Click to copy',
    // Success announcement for screen readers
    copySuccessAnnouncement:
      process.env.CONTENT_COMPARISON_COPY_SUCCESS ||
      '{{value}} copied to clipboard',
    // Aria labels
    ariaLabels: {
      copyButton:
        process.env.CONTENT_COMPARISON_ARIA_COPY ||
        'Copy {{value}} to clipboard',
      copyAllButton:
        process.env.CONTENT_COMPARISON_ARIA_COPY_ALL ||
        'Copy all {{count}} items to clipboard',
    },
  },

  // Resource Header Component - Palette's micro-UX enhancement!
  // Header section for resource detail pages with animated interactions
  resourceHeader: {
    // Button text for visiting external resource
    visitButton:
      process.env.CONTENT_RESOURCE_HEADER_VISIT_BUTTON || 'Visit Resource',
    // Aria label for accessibility
    visitButtonAria:
      process.env.CONTENT_RESOURCE_HEADER_VISIT_ARIA ||
      'Visit external resource: {{title}}',
    // Announcement for screen readers when opening link
    openingAnnouncement:
      process.env.CONTENT_RESOURCE_HEADER_OPENING ||
      'Opening Visit Resource in a new tab',
  },

  // Page Transition - Palette's micro-UX enhancement!
  // Smooth page transition animations for visual continuity during navigation
  pageTransition: {
    // Loading text displayed during transition
    loadingText: process.env.CONTENT_PAGE_TRANSITION_LOADING || 'Loading...',
    // Screen reader announcement when transition starts
    announcement:
      process.env.CONTENT_PAGE_TRANSITION_ANNOUNCE || 'Page loading',
    // Completion message (optional, shown after transition)
    complete: process.env.CONTENT_PAGE_TRANSITION_COMPLETE || 'Page loaded',
  },
} as const

// Helper function to parse comma-separated suggestions
function parseSuggestions(value: string): string[] {
  return value.split(',').map(s => s.trim())
}

export type ContentConfig = typeof contentConfig
