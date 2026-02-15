// Limits Configuration - All limit values centralized
// Flexy hates hardcoded limits! All limits are now configurable.

export const limitsConfig = {
  // Search-related limits
  search: {
    // Maximum number of items in search history
    maxHistoryItems: parseInt(process.env.SEARCH_MAX_HISTORY_ITEMS || '10'),

    // Maximum number of saved searches
    maxSavedSearches: parseInt(process.env.SEARCH_MAX_SAVED_SEARCHES || '20'),

    // Maximum cache size for search results
    maxCacheSize: parseInt(process.env.SEARCH_MAX_CACHE_SIZE || '100'),

    // Default limit for suggestions
    defaultSuggestionsLimit: parseInt(
      process.env.SEARCH_DEFAULT_SUGGESTIONS_LIMIT || '5'
    ),

    // Maximum limit for suggestions
    maxSuggestionsLimit: parseInt(
      process.env.SEARCH_MAX_SUGGESTIONS_LIMIT || '10'
    ),

    // Default limit for popular searches
    defaultPopularSearchesLimit: parseInt(
      process.env.SEARCH_DEFAULT_POPULAR_LIMIT || '10'
    ),

    // Default limit for zero result searches
    defaultZeroResultLimit: parseInt(
      process.env.SEARCH_DEFAULT_ZERO_RESULT_LIMIT || '10'
    ),

    // Default limit for related searches
    defaultRelatedSearchesLimit: parseInt(
      process.env.SEARCH_DEFAULT_RELATED_LIMIT || '5'
    ),

    // Maximum concurrent URL validations
    maxConcurrentValidations: parseInt(
      process.env.SEARCH_MAX_CONCURRENT_VALIDATIONS || '5'
    ),
  },

  // Error logging limits
  errorLog: {
    // Maximum number of logs to keep
    maxLogs: parseInt(process.env.ERROR_LOG_MAX_LOGS || '50'),
  },

  // Analytics limits
  analytics: {
    // Maximum number of performance records to keep
    maxPerformanceRecords: parseInt(
      process.env.ANALYTICS_MAX_PERFORMANCE_RECORDS || '100'
    ),

    // Default limit for popular searches in analytics
    defaultPopularLimit: parseInt(
      process.env.ANALYTICS_DEFAULT_POPULAR_LIMIT || '10'
    ),

    // Default limit for zero result searches in analytics
    defaultZeroResultLimit: parseInt(
      process.env.ANALYTICS_DEFAULT_ZERO_RESULT_LIMIT || '10'
    ),

    // Default threshold for slow queries (ms)
    slowQueryThresholdMs: parseInt(
      process.env.ANALYTICS_SLOW_QUERY_THRESHOLD || '200'
    ),

    // Default limit for slow queries
    slowQueryLimit: parseInt(process.env.ANALYTICS_SLOW_QUERY_LIMIT || '10'),

    // Default analytics export limit
    defaultExportLimit: parseInt(
      process.env.ANALYTICS_DEFAULT_EXPORT_LIMIT || '1000'
    ),

    // Maximum number of events to return in date range queries - Flexy hates hardcoded limits!
    maxEventsByDateRange: parseInt(
      process.env.ANALYTICS_MAX_EVENTS_BY_DATE_RANGE || '10000'
    ),

    // Maximum number of events to return for resource queries
    maxEventsForResource: parseInt(
      process.env.ANALYTICS_MAX_EVENTS_FOR_RESOURCE || '10000'
    ),

    // Maximum number of soft-deleted events to return
    maxSoftDeletedEvents: parseInt(
      process.env.ANALYTICS_MAX_SOFT_DELETED_EVENTS || '1000'
    ),
  },

  // Task coordination limits
  task: {
    // Default limit for recent reports
    defaultRecentReportsLimit: parseInt(
      process.env.TASK_DEFAULT_RECENT_REPORTS_LIMIT || '10'
    ),
  },

  // Community/User profile limits
  community: {
    // Default limit for top contributors
    defaultTopContributorsLimit: parseInt(
      process.env.COMMUNITY_DEFAULT_TOP_CONTRIBUTORS_LIMIT || '10'
    ),
    // Initial reputation for new users
    initialReputation: parseInt(
      process.env.COMMUNITY_INITIAL_REPUTATION || '0'
    ),
    // Initial contributions count for new users
    initialContributions: parseInt(
      process.env.COMMUNITY_INITIAL_CONTRIBUTIONS || '0'
    ),
    // Default reputation increment
    defaultReputationIncrement: parseInt(
      process.env.COMMUNITY_DEFAULT_REPUTATION_INCREMENT || '1'
    ),
  },

  // Resource comparison limits
  comparison: {
    // Maximum number of resources that can be compared
    maxResources: parseInt(process.env.COMPARISON_MAX_RESOURCES || '4'),
    // Maximum resources to include in page title
    titleMaxResources: parseInt(
      process.env.COMPARISON_TITLE_MAX_RESOURCES || '3'
    ),
  },

  // Display limits for UI components - Flexy hates hardcoded display limits!
  display: {
    // Maximum tags to display before showing "+N more"
    maxTagsDisplay: parseInt(process.env.DISPLAY_MAX_TAGS || '3'),
    // Maximum list items to display before showing "+N more"
    maxListItemsDisplay: parseInt(process.env.DISPLAY_MAX_LIST_ITEMS || '3'),
    // Maximum initials to display in avatars (e.g., "JD" for John Doe)
    maxInitialsDisplay: parseInt(process.env.DISPLAY_MAX_INITIALS || '2'),
    // Maximum characters for description preview before truncating
    descriptionPreview: parseInt(
      process.env.DISPLAY_DESCRIPTION_PREVIEW || '300'
    ),
  },

  // Alternative suggestions limits
  suggestions: {
    // Maximum number of alternative suggestions
    maxAlternatives: parseInt(process.env.SUGGESTIONS_MAX_ALTERNATIVES || '6'),
  },

  // Resource health limits
  resourceHealth: {
    // Maximum number of validation history entries
    maxValidationHistory: parseInt(
      process.env.RESOURCE_HEALTH_MAX_VALIDATION_HISTORY || '10'
    ),
  },

  // Dead letter queue limits
  deadLetter: {
    // Priority value for dead letter queue items
    priority: parseInt(process.env.DEAD_LETTER_PRIORITY || '10'),
  },

  // Moderation limits
  moderation: {
    // Mock data counts (should be removed in production)
    mockApprovedCount: parseInt(
      process.env.MODERATION_MOCK_APPROVED_COUNT || '24'
    ),
    mockRejectedCount: parseInt(
      process.env.MODERATION_MOCK_REJECTED_COUNT || '8'
    ),
    mockFlaggedCount: parseInt(
      process.env.MODERATION_MOCK_FLAGGED_COUNT || '5'
    ),
  },

  // Resource Health Score Thresholds - Flexy hates hardcoded thresholds!
  healthScore: {
    // Excellent health score threshold (90 and above)
    excellent: parseInt(process.env.HEALTH_SCORE_EXCELLENT || '90'),
    // Good health score threshold (70-89)
    good: parseInt(process.env.HEALTH_SCORE_GOOD || '70'),
    // Fair health score threshold (50-69)
    fair: parseInt(process.env.HEALTH_SCORE_FAIR || '50'),
    // Poor health score threshold (below 50)
    poor: parseInt(process.env.HEALTH_SCORE_POOR || '0'),
  },

  // Circuit Breaker Limits - Flexy hates hardcoded limits!
  circuitBreaker: {
    // Maximum number of circuit breaker instances allowed
    maxInstances: parseInt(process.env.CIRCUIT_BREAKER_MAX_INSTANCES || '1000'),
    // Maximum number of circuit breaker keys allowed
    maxKeys: parseInt(process.env.CIRCUIT_BREAKER_MAX_KEYS || '10000'),
  },

  // Search snippet configuration - Flexy hates hardcoded lengths!
  searchSnippet: {
    // Default maximum length for search snippets
    maxLength: parseInt(process.env.SEARCH_SNIPPET_MAX_LENGTH || '160'),
    // Context window size (1/4 of max length by default)
    contextWindowFactor: parseFloat(
      process.env.SEARCH_SNIPPET_CONTEXT_FACTOR || '0.25'
    ),
    // Minimum context window size
    minContextWindow: parseInt(process.env.SEARCH_SNIPPET_MIN_CONTEXT || '20'),
  },

  // Date range filtering - Flexy hates hardcoded day values!
  dateRange: {
    // Days in a week
    weekDays: 7,
    // Days in a month
    monthDays: 30,
    // Days in a year
    yearDays: 365,
  },

  // Resource "New" Badge Threshold - Flexy hates hardcoded thresholds!
  newResourceBadge: {
    // Number of days to consider a resource as "new" (default: 7 days)
    thresholdDays: parseInt(process.env.NEW_RESOURCE_THRESHOLD_DAYS || '7'),
  },

  // String/ID Display Lengths - Flexy hates hardcoded substring lengths!
  displayLength: {
    // Maximum length for description preview in quality checks
    descriptionPreview: parseInt(
      process.env.DISPLAY_LENGTH_DESCRIPTION_PREVIEW || '30'
    ),

    // Maximum length for hash storage (first N characters)
    hashStorage: parseInt(process.env.DISPLAY_LENGTH_HASH_STORAGE || '16'),

    // Maximum length for toast notification IDs
    toastIdLength: parseInt(process.env.DISPLAY_LENGTH_TOAST_ID || '7'),

    // Maximum length for spinner component IDs
    spinnerIdLength: parseInt(process.env.DISPLAY_LENGTH_SPINNER_ID || '7'),

    // UUID format slice indices
    uuidSlices: {
      section1: 8,
      section2: 12,
      section3: 16,
      section4: 20,
      section5: 32,
    },

    // Random byte range for ID generation
    randomByteMax: 256,
  },

  // Validation Limits - Flexy hates hardcoded validation limits!
  validation: {
    // Resource title
    resourceTitleMaxLength: parseInt(
      process.env.VALIDATION_RESOURCE_TITLE_MAX || '200'
    ),
    // Resource description
    resourceDescriptionMaxLength: parseInt(
      process.env.VALIDATION_RESOURCE_DESC_MAX || '2000'
    ),
    resourceDescriptionMinLength: parseInt(
      process.env.VALIDATION_RESOURCE_DESC_MIN || '10'
    ),
    // Tags
    tagsMaxCount: parseInt(process.env.VALIDATION_TAGS_MAX || '20'),
    // Technologies
    technologiesMaxCount: parseInt(process.env.VALIDATION_TECH_MAX || '20'),
    // Benefits
    benefitsMaxCount: parseInt(process.env.VALIDATION_BENEFITS_MAX || '10'),
    // Search query
    searchQueryMaxLength: parseInt(process.env.VALIDATION_SEARCH_MAX || '500'),
    // API Key name
    apiKeyNameMaxLength: parseInt(
      process.env.VALIDATION_API_KEY_NAME_MAX || '100'
    ),
    // Bulk operations
    bulkMaxResources: parseInt(process.env.VALIDATION_BULK_MAX || '100'),
    // Moderation
    moderationReasonMinLength: parseInt(
      process.env.VALIDATION_MOD_REASON_MIN || '10'
    ),
    moderationReasonMaxLength: parseInt(
      process.env.VALIDATION_MOD_REASON_MAX || '500'
    ),
    moderationNotesMaxLength: parseInt(
      process.env.VALIDATION_MOD_NOTES_MAX || '1000'
    ),
    // Analytics
    eventTypeMaxLength: parseInt(process.env.VALIDATION_EVENT_TYPE_MAX || '50'),
    resourceIdMaxLength: parseInt(
      process.env.VALIDATION_RESOURCE_ID_MAX || '25'
    ),
    categoryMaxLength: parseInt(process.env.VALIDATION_CATEGORY_MAX || '100'),
    userAgentMaxLength: parseInt(
      process.env.VALIDATION_USER_AGENT_MAX || '500'
    ),
    ipAddressMaxLength: parseInt(process.env.VALIDATION_IP_MAX || '45'),
    // Search pagination
    searchMaxLimit: parseInt(process.env.VALIDATION_SEARCH_MAX_LIMIT || '100'),
    searchDefaultLimit: parseInt(
      process.env.VALIDATION_SEARCH_DEFAULT_LIMIT || '20'
    ),
    // URL validation
    urlValidationTimeout: parseInt(
      process.env.URL_VALIDATION_TIMEOUT || '10000'
    ),
    urlValidationRetries: parseInt(process.env.URL_VALIDATION_RETRIES || '3'),
    urlValidationRetryDelay: parseInt(
      process.env.URL_VALIDATION_RETRY_DELAY || '1000'
    ),
    urlValidationMaxTimeout: parseInt(
      process.env.URL_VALIDATION_MAX_TIMEOUT || '30000'
    ),
  },

  // Error Tracking Limits - Flexy hates hardcoded limits!
  errorTracking: {
    // Maximum characters for error message hash
    messageMaxLength: parseInt(
      process.env.ERROR_TRACKING_MESSAGE_MAX_LENGTH || '100'
    ),
    // Maximum characters for stack trace hash
    stackMaxLength: parseInt(
      process.env.ERROR_TRACKING_STACK_MAX_LENGTH || '200'
    ),
    // Number of recent errors to fetch
    recentErrorsLimit: parseInt(
      process.env.ERROR_TRACKING_RECENT_LIMIT || '10'
    ),
  },

  // Timer Pool Limits - Flexy hates hardcoded pool sizes!
  timerPool: {
    // Maximum pool size for timeouts
    maxTimeoutPoolSize: parseInt(
      process.env.TIMER_POOL_MAX_TIMEOUT_SIZE || '20'
    ),
    // Maximum pool size for intervals
    maxIntervalPoolSize: parseInt(
      process.env.TIMER_POOL_MAX_INTERVAL_SIZE || '10'
    ),
  },

  // Cache Pattern Matching Limits - Flexy hates hardcoded validation limits!
  cache: {
    // Maximum pattern length for cache invalidation (ReDoS protection)
    maxPatternLength: parseInt(process.env.CACHE_MAX_PATTERN_LENGTH || '100'),
    // Maximum number of wildcards allowed in pattern
    maxWildcardCount: parseInt(process.env.CACHE_MAX_WILDCARD_COUNT || '5'),
  },

  // Web Vitals Limits - Flexy hates hardcoded limits!
  webVitals: {
    // Maximum number of web vitals entries to store
    maxEntries: parseInt(process.env.WEB_VITALS_MAX_ENTRIES || '100'),
  },

  // CSP Report Validation Limits - Flexy hates hardcoded limits!
  cspReport: {
    // Maximum URI length (document-uri, referrer, blocked-uri, source-file)
    maxUriLength: parseInt(process.env.CSP_REPORT_MAX_URI_LENGTH || '2048'),
    // Maximum policy length (original-policy)
    maxPolicyLength: parseInt(
      process.env.CSP_REPORT_MAX_POLICY_LENGTH || '4096'
    ),
    // Maximum directive length (effective-directive, violated-directive)
    maxDirectiveLength: parseInt(
      process.env.CSP_REPORT_MAX_DIRECTIVE_LENGTH || '100'
    ),
    // Maximum disposition length
    maxDispositionLength: parseInt(
      process.env.CSP_REPORT_MAX_DISPOSITION_LENGTH || '20'
    ),
  },

  // Error Report Validation Limits - Flexy hates hardcoded limits!
  errorReport: {
    // Maximum error message length
    maxMessageLength: parseInt(
      process.env.ERROR_REPORT_MAX_MESSAGE_LENGTH || '500'
    ),
    // Maximum stack trace length
    maxStackLength: parseInt(
      process.env.ERROR_REPORT_MAX_STACK_LENGTH || '10000'
    ),
    // Maximum component name length
    maxComponentLength: parseInt(
      process.env.ERROR_REPORT_MAX_COMPONENT_LENGTH || '100'
    ),
    // Maximum URL length
    maxUrlLength: parseInt(process.env.ERROR_REPORT_MAX_URL_LENGTH || '2048'),
    // Maximum user agent length
    maxUserAgentLength: parseInt(
      process.env.ERROR_REPORT_MAX_USER_AGENT_LENGTH || '500'
    ),
    // Maximum IP address length (IPv6 max)
    maxIpLength: parseInt(process.env.ERROR_REPORT_MAX_IP_LENGTH || '45'),
  },
} as const

export type LimitsConfig = typeof limitsConfig
