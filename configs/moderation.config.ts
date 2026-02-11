// Moderation Configuration - Moderation-specific settings and colors
// Flexy hates hardcoded values! All moderation settings are now configurable.

export const moderationConfig = {
  // Submission status values
  statuses: {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  },

  // Status badge colors for ReviewQueue component
  // Flexy hates hardcoded hex codes!
  statusColors: {
    pending: {
      bg: process.env.MODERATION_STATUS_PENDING_BG || '#fff3cd',
      text: process.env.MODERATION_STATUS_PENDING_TEXT || '#856404',
    },
    approved: {
      bg: process.env.MODERATION_STATUS_APPROVED_BG || '#d4edda',
      text: process.env.MODERATION_STATUS_APPROVED_TEXT || '#155724',
    },
    rejected: {
      bg: process.env.MODERATION_STATUS_REJECTED_BG || '#f8d7da',
      text: process.env.MODERATION_STATUS_REJECTED_TEXT || '#721c24',
    },
  },

  // Review notes defaults
  notes: {
    approvedDefault:
      process.env.MODERATION_NOTES_APPROVED ||
      'Approved via moderation interface',
    rejectedDefault:
      process.env.MODERATION_NOTES_REJECTED ||
      'Rejected via moderation interface',
  },

  // Filter placeholders
  ui: {
    categoryFilterPlaceholder:
      process.env.MODERATION_CATEGORY_FILTER_PLACEHOLDER ||
      'Filter by category...',
  },

  // Permission defaults for moderation
  permissions: {
    defaultModeratorPermissions: ['read', 'write', 'moderate'],
  },

  // Validation limits - Flexy hates hardcoded values!
  validation: {
    notes: {
      maxLength: parseInt(process.env.MODERATION_NOTES_MAX_LENGTH || '1000'),
    },
  },
} as const

export type ModerationConfig = typeof moderationConfig
