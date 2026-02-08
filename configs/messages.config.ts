// Messages Configuration - Error Messages and User Feedback
// Flexy hates hardcoded values! All messages are now configurable.

export const messagesConfig = {
  // Error Messages
  errors: {
    // Authentication errors
    auth: {
      notLoggedIn:
        process.env.ERROR_AUTH_NOT_LOGGED_IN ||
        'You must be logged in to perform this action',
      unauthorized:
        process.env.ERROR_AUTH_UNAUTHORIZED || 'Unauthorized access',
      sessionExpired:
        process.env.ERROR_AUTH_SESSION_EXPIRED ||
        'Your session has expired. Please log in again',
    },

    // Resource errors
    resource: {
      notFound: process.env.ERROR_RESOURCE_NOT_FOUND || 'Resource not found',
      loadFailed:
        process.env.ERROR_RESOURCE_LOAD_FAILED || 'Failed to load resource',
      fetchFailed:
        process.env.ERROR_RESOURCE_FETCH_FAILED ||
        'Failed to fetch resource data',
      updateFailed:
        process.env.ERROR_RESOURCE_UPDATE_FAILED || 'Failed to update resource',
      invalidData:
        process.env.ERROR_RESOURCE_INVALID_DATA || 'Invalid resource data',
    },

    // Community feature errors
    community: {
      commentFailed:
        process.env.ERROR_COMMENT_FAILED || 'Failed to post comment',
      replyFailed: process.env.ERROR_REPLY_FAILED || 'Failed to post reply',
      voteFailed: process.env.ERROR_VOTE_FAILED || 'Failed to submit vote',
      alreadyVoted:
        process.env.ERROR_ALREADY_VOTED ||
        'You have already voted on this item',
      notLoggedInToComment:
        process.env.ERROR_COMMENT_NOT_LOGGED_IN ||
        'User must be logged in to comment',
      notLoggedInToReply:
        process.env.ERROR_REPLY_NOT_LOGGED_IN ||
        'User must be logged in to reply',
      notLoggedInToVote:
        process.env.ERROR_VOTE_NOT_LOGGED_IN ||
        'User must be logged in to vote',
    },

    // Moderation errors
    moderation: {
      reviewFailed:
        process.env.ERROR_MODERATION_REVIEW_FAILED || 'Failed to submit review',
      approvalFailed:
        process.env.ERROR_MODERATION_APPROVAL_FAILED ||
        'Failed to approve item',
      rejectionFailed:
        process.env.ERROR_MODERATION_REJECTION_FAILED ||
        'Failed to reject item',
      notModerator:
        process.env.ERROR_NOT_MODERATOR ||
        'You do not have moderator privileges',
    },

    // General errors
    general: {
      unknownError: process.env.ERROR_UNKNOWN || 'An unknown error occurred',
      networkError:
        process.env.ERROR_NETWORK ||
        'Network error. Please check your connection',
      serverError:
        process.env.ERROR_SERVER || 'Server error. Please try again later',
      validationError: process.env.ERROR_VALIDATION || 'Validation failed',
      clipboardCopyFailed:
        process.env.ERROR_CLIPBOARD_COPY || 'Failed to copy to clipboard',
      execCommandCopyFailed:
        process.env.ERROR_EXEC_COMMAND_COPY || 'execCommand copy failed',
    },
  },

  // Success Messages
  success: {
    resource: {
      updated:
        process.env.SUCCESS_RESOURCE_UPDATED || 'Resource updated successfully',
      created:
        process.env.SUCCESS_RESOURCE_CREATED || 'Resource created successfully',
      deleted:
        process.env.SUCCESS_RESOURCE_DELETED || 'Resource deleted successfully',
    },
    community: {
      commentPosted:
        process.env.SUCCESS_COMMENT_POSTED || 'Comment posted successfully',
      replyPosted:
        process.env.SUCCESS_REPLY_POSTED || 'Reply posted successfully',
      voteSubmitted:
        process.env.SUCCESS_VOTE_SUBMITTED || 'Vote submitted successfully',
    },
    moderation: {
      itemApproved:
        process.env.SUCCESS_ITEM_APPROVED || 'Item approved successfully',
      itemRejected:
        process.env.SUCCESS_ITEM_REJECTED || 'Item rejected successfully',
      reviewSubmitted:
        process.env.SUCCESS_REVIEW_SUBMITTED || 'Review submitted successfully',
    },
    general: {
      statusUpdated:
        process.env.SUCCESS_STATUS_UPDATED || 'Status updated successfully',
      saved: process.env.SUCCESS_SAVED || 'Changes saved successfully',
      copied: process.env.SUCCESS_COPIED || 'Copied to clipboard',
    },
  },

  // Loading Messages
  loading: {
    default: process.env.LOADING_DEFAULT || 'Loading...',
    updating: process.env.LOADING_UPDATING || 'Updating...',
    saving: process.env.LOADING_SAVING || 'Saving...',
    submitting: process.env.LOADING_SUBMITTING || 'Submitting...',
    fetching: process.env.LOADING_FETCHING || 'Fetching data...',
    processing: process.env.LOADING_PROCESSING || 'Processing...',
    content: process.env.LOADING_CONTENT || 'Loading content...',
  },

  // UI Labels and Placeholders
  ui: {
    // Button labels
    buttons: {
      updateStatus: process.env.BTN_UPDATE_STATUS || 'Update Status',
      submit: process.env.BTN_SUBMIT || 'Submit',
      cancel: process.env.BTN_CANCEL || 'Cancel',
      save: process.env.BTN_SAVE || 'Save',
      delete: process.env.BTN_DELETE || 'Delete',
      edit: process.env.BTN_EDIT || 'Edit',
      close: process.env.BTN_CLOSE || 'Close',
      clearHistory: process.env.BTN_CLEAR_HISTORY || 'Clear History',
      loadMore: process.env.BTN_LOAD_MORE || 'Load More',
      viewDetails: process.env.BTN_VIEW_DETAILS || 'View Details',
    },

    // Placeholders
    placeholders: {
      filterByCategory:
        process.env.PLACEHOLDER_FILTER_CATEGORY || 'Filter by category...',
      search: process.env.PLACEHOLDER_SEARCH || 'Search...',
      comment: process.env.PLACEHOLDER_COMMENT || 'Write a comment...',
    },

    // Section headers
    headers: {
      suggestions: process.env.HEADER_SUGGESTIONS || 'Suggestions',
      recentSearches: process.env.HEADER_RECENT_SEARCHES || 'Recent Searches',
      moderationQueue:
        process.env.HEADER_MODERATION_QUEUE || 'Moderation Queue',
    },

    // Filter labels
    filters: {
      allStatuses: process.env.FILTER_ALL_STATUSES || 'All Statuses',
      pending: process.env.FILTER_PENDING || 'Pending',
      approved: process.env.FILTER_APPROVED || 'Approved',
      rejected: process.env.FILTER_REJECTED || 'Rejected',
    },

    // Status labels
    status: {
      active: process.env.STATUS_ACTIVE || 'Active',
      deprecated: process.env.STATUS_DEPRECATED || 'Deprecated',
      discontinued: process.env.STATUS_DISCONTINUED || 'Discontinued',
      pending: process.env.STATUS_PENDING || 'Pending',
    },

    // Meta labels
    meta: {
      category: process.env.META_CATEGORY || 'Category:',
      submittedBy: process.env.META_SUBMITTED_BY || 'Submitted by:',
      submitted: process.env.META_SUBMITTED || 'Submitted:',
    },

    // Empty states
    empty: {
      noResults: process.env.EMPTY_NO_RESULTS || 'No results found',
      noItems: process.env.EMPTY_NO_ITEMS || 'No items to display',
      noComments: process.env.EMPTY_NO_COMMENTS || 'No comments yet',
      queueEmpty: process.env.EMPTY_QUEUE || 'Moderation queue is empty',
    },

    // Accessibility labels
    accessibility: {
      skipToMain: process.env.A11Y_SKIP_TO_MAIN || 'Skip to main content',
      loadingContent: process.env.A11Y_LOADING_CONTENT || 'Loading content...',
      closeModal: process.env.A11Y_CLOSE_MODAL || 'Close modal',
      openMenu: process.env.A11Y_OPEN_MENU || 'Open menu',
      closeMenu: process.env.A11Y_CLOSE_MENU || 'Close menu',
    },
  },

  // SEO and Meta
  seo: {
    defaultTitle: process.env.SEO_DEFAULT_TITLE || 'Free Stuff on the Internet',
    defaultDescription:
      process.env.SEO_DEFAULT_DESCRIPTION ||
      'Discover amazing free resources available on the internet',
    siteName: process.env.SEO_SITE_NAME || 'Free Stuff on the Internet',
    author: process.env.SEO_AUTHOR || 'Free Stuff on the Internet Team',
  },

  // Footer
  footer: {
    copyright: process.env.FOOTER_COPYRIGHT || 'All rights reserved.',
    madeWith: process.env.FOOTER_MADE_WITH || 'Made with',
  },
} as const

export type MessagesConfig = typeof messagesConfig
