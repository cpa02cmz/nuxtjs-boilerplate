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
} as const

export type LimitsConfig = typeof limitsConfig
