// Messages Configuration - User-facing error and success messages
// Flexy hates hardcoded values! All messages are now centralized and configurable.

export const messagesConfig = {
  // Error Messages
  errors: {
    // Generic errors
    generic: {
      default: process.env.ERROR_GENERIC_DEFAULT || 'An error occurred',
      unexpected:
        process.env.ERROR_GENERIC_UNEXPECTED || 'An unexpected error occurred',
      network:
        process.env.ERROR_GENERIC_NETWORK ||
        'Network error. Please check your connection.',
      timeout:
        process.env.ERROR_GENERIC_TIMEOUT ||
        'Request timed out. Please try again.',
      operationFailed:
        process.env.ERROR_GENERIC_OPERATION_FAILED || 'Operation failed',
    },

    // Resource-related errors
    resource: {
      loadFailed:
        process.env.ERROR_RESOURCE_LOAD_FAILED || 'Failed to load resources',
      loadSingleFailed:
        process.env.ERROR_RESOURCE_LOAD_SINGLE_FAILED ||
        'Failed to load resource',
      notFound: process.env.ERROR_RESOURCE_NOT_FOUND || 'Resource not found',
      createFailed:
        process.env.ERROR_RESOURCE_CREATE_FAILED || 'Failed to create resource',
      updateFailed:
        process.env.ERROR_RESOURCE_UPDATE_FAILED || 'Failed to update resource',
      deleteFailed:
        process.env.ERROR_RESOURCE_DELETE_FAILED || 'Failed to delete resource',
      idRequired:
        process.env.ERROR_RESOURCE_ID_REQUIRED || 'Resource ID is required',
      statusUpdateFailed:
        process.env.ERROR_RESOURCE_STATUS_UPDATE_FAILED ||
        'Failed to update status',
    },

    // Submission-related errors
    submission: {
      loadFailed:
        process.env.ERROR_SUBMISSION_LOAD_FAILED || 'Failed to load submission',
      loadListFailed:
        process.env.ERROR_SUBMISSION_LOAD_LIST_FAILED ||
        'Failed to load submissions',
      fetchError:
        process.env.ERROR_SUBMISSION_FETCH_ERROR ||
        'An error occurred while fetching submission',
      fetchListError:
        process.env.ERROR_SUBMISSION_FETCH_LIST_ERROR ||
        'An error occurred while fetching submissions',
      approveFailed:
        process.env.ERROR_SUBMISSION_APPROVE_FAILED ||
        'Failed to approve submission',
      approveError:
        process.env.ERROR_SUBMISSION_APPROVE_ERROR ||
        'An error occurred while approving submission',
      rejectFailed:
        process.env.ERROR_SUBMISSION_REJECT_FAILED ||
        'Failed to reject submission',
      rejectError:
        process.env.ERROR_SUBMISSION_REJECT_ERROR ||
        'An error occurred while rejecting submission',
      rejectionReasonRequired:
        process.env.ERROR_SUBMISSION_REJECTION_REASON_REQUIRED ||
        'Please provide a reason for rejection',
    },

    // API Key-related errors
    apiKey: {
      loadFailed:
        process.env.ERROR_API_KEY_LOAD_FAILED ||
        'Failed to load API keys. Please try again.',
      createFailed:
        process.env.ERROR_API_KEY_CREATE_FAILED ||
        'Failed to create API key. Please try again.',
      revokeFailed:
        process.env.ERROR_API_KEY_REVOKE_FAILED ||
        'Failed to revoke API key. Please try again.',
      required: process.env.ERROR_API_KEY_REQUIRED || 'API key required',
      invalid:
        process.env.ERROR_API_KEY_INVALID || 'Invalid or inactive API key',
    },

    // Clipboard-related errors
    clipboard: {
      copyFailed:
        process.env.ERROR_CLIPBOARD_COPY_FAILED ||
        'Failed to copy link. Please try again.',
      copyError:
        process.env.ERROR_CLIPBOARD_COPY_ERROR ||
        'Failed to copy resource URL to clipboard',
      copyToClipboardFailed:
        process.env.ERROR_CLIPBOARD_COPY_TO_CLIPBOARD_FAILED ||
        'Failed to copy to clipboard:',
    },

    // Comparison-related errors
    comparison: {
      loadFailed:
        process.env.ERROR_COMPARISON_LOAD_FAILED || 'Failed to load comparison',
    },

    // User-related errors
    user: {
      profileInitFailed:
        process.env.ERROR_USER_PROFILE_INIT_FAILED ||
        'Failed to initialize user profile',
      savePreferencesFailed:
        process.env.ERROR_USER_SAVE_PREFERENCES_FAILED ||
        'Failed to save preferences to storage',
      updatePreferencesFailed:
        process.env.ERROR_USER_UPDATE_PREFERENCES_FAILED ||
        'Failed to update preferences',
      saveInteractionFailed:
        process.env.ERROR_USER_SAVE_INTERACTION_FAILED ||
        'Failed to save interaction to storage',
      trackInteractionFailed:
        process.env.ERROR_USER_TRACK_INTERACTION_FAILED ||
        'Failed to track interaction',
    },

    // Analytics-related errors
    analytics: {
      loadFailed:
        process.env.ERROR_ANALYTICS_LOAD_FAILED ||
        'Failed to fetch search analytics data',
      loadDataFailed:
        process.env.ERROR_ANALYTICS_LOAD_DATA_FAILED ||
        'Failed to load search analytics data',
      pageLoadFailed:
        process.env.ERROR_ANALYTICS_PAGE_LOAD_FAILED ||
        'Failed to load analytics data',
    },

    // URL-related errors
    url: {
      paramRequired:
        process.env.ERROR_URL_PARAM_REQUIRED || 'URL parameter is required',
      invalid: process.env.ERROR_URL_INVALID || 'Invalid URL provided',
    },

    // Share-related errors
    share: {
      invalidData:
        process.env.ERROR_SHARE_INVALID_DATA || 'Invalid share event data',
      trackFailed:
        process.env.ERROR_SHARE_TRACK_FAILED || 'Failed to track social share:',
    },

    // Alternative-related errors
    alternative: {
      idRequired:
        process.env.ERROR_ALTERNATIVE_ID_REQUIRED ||
        'Alternative resource ID is required',
    },

    // Action-related errors
    action: {
      invalid:
        process.env.ERROR_ACTION_INVALID ||
        'Invalid action. Use "add" or "remove".',
    },

    // Pagination-related errors
    pagination: {
      invalidLimit:
        process.env.ERROR_PAGINATION_INVALID_LIMIT ||
        'Invalid limit parameter. Must be a positive integer.',
      invalidPage:
        process.env.ERROR_PAGINATION_INVALID_PAGE ||
        'Invalid page parameter. Must be a positive integer (1 or greater).',
      invalidOffset:
        process.env.ERROR_PAGINATION_INVALID_OFFSET ||
        'Invalid offset parameter. Must be a non-negative integer.',
    },

    // Sort-related errors
    sort: {
      invalidOrder:
        process.env.ERROR_SORT_INVALID_ORDER ||
        'Invalid order parameter. Must be "asc" or "desc".',
    },

    // Authentication-related errors
    auth: {
      required: process.env.ERROR_AUTH_REQUIRED || 'Authentication required',
    },
  },

  // Success Messages
  success: {
    // Generic success
    generic: {
      saved: process.env.SUCCESS_GENERIC_SAVED || 'Saved successfully',
      updated: process.env.SUCCESS_GENERIC_UPDATED || 'Updated successfully',
      deleted: process.env.SUCCESS_GENERIC_DELETED || 'Deleted successfully',
      copied: process.env.SUCCESS_GENERIC_COPIED || 'Copied to clipboard',
    },

    // Submission success
    submission: {
      approved:
        process.env.SUCCESS_SUBMISSION_APPROVED ||
        'Submission approved successfully',
      rejected:
        process.env.SUCCESS_SUBMISSION_REJECTED ||
        'Submission rejected successfully',
    },

    // API Key success
    apiKey: {
      created:
        process.env.SUCCESS_API_KEY_CREATED || 'API key created successfully',
      revoked:
        process.env.SUCCESS_API_KEY_REVOKED || 'API key revoked successfully',
    },

    // Webhook success
    webhook: {
      created:
        process.env.SUCCESS_WEBHOOK_CREATED || 'Webhook created successfully',
      updated:
        process.env.SUCCESS_WEBHOOK_UPDATED || 'Webhook updated successfully',
      deleted:
        process.env.SUCCESS_WEBHOOK_DELETED || 'Webhook deleted successfully',
    },
  },

  // Log Prefixes (for debugging)
  logs: {
    socialShare:
      process.env.LOG_PREFIX_SOCIAL_SHARE || 'Failed to track social share:',
    comparison:
      process.env.LOG_PREFIX_COMPARISON || 'Failed to load comparison',
    clipboard:
      process.env.LOG_PREFIX_CLIPBOARD || 'Failed to copy to clipboard:',
  },

  // Loading Messages
  loading: {
    default: process.env.LOADING_DEFAULT || 'Loading...',
    resources: process.env.LOADING_RESOURCES || 'Loading resources...',
    submissions: process.env.LOADING_SUBMISSIONS || 'Loading submissions...',
    apiKeys: process.env.LOADING_API_KEYS || 'Loading API keys...',
    analytics: process.env.LOADING_ANALYTICS || 'Loading analytics...',
    comparison: process.env.LOADING_COMPARISON || 'Loading comparison...',
  },

  // Empty State Messages
  empty: {
    default: process.env.EMPTY_DEFAULT || 'No data found',
    resources: process.env.EMPTY_RESOURCES || 'No resources found',
    submissions: process.env.EMPTY_SUBMISSIONS || 'No submissions found',
    apiKeys: process.env.EMPTY_API_KEYS || 'No API keys found',
    search: process.env.EMPTY_SEARCH || 'No results found for your search',
    bookmarks: process.env.EMPTY_BOOKMARKS || 'No bookmarks yet',
  },
} as const

export type MessagesConfig = typeof messagesConfig
