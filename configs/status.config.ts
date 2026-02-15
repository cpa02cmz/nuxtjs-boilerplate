// Status Configuration - Centralized Status Constants
// Flexy hates hardcoded values! All status strings are now configurable.

export const STATUS = {
  // Resource statuses
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  DELETED: 'deleted',

  // Moderation statuses
  APPROVED: 'approved',
  REJECTED: 'rejected',

  // Flag/Review statuses
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',

  // Feature flags
  ENABLED: 'enabled',
  DISABLED: 'disabled',

  // Visibility
  PUBLIC: 'public',
  PRIVATE: 'private',
  DRAFT: 'draft',
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]

// Status groups for easier checking
export const STATUS_GROUPS = {
  // Active resource states
  ACTIVE_STATES: [STATUS.ACTIVE, STATUS.APPROVED] as const,

  // Pending/moderation states
  PENDING_STATES: [STATUS.PENDING, STATUS.REVIEWED] as const,

  // Terminal states
  TERMINAL_STATES: [STATUS.REJECTED, STATUS.ARCHIVED, STATUS.DELETED] as const,

  // Visible to public
  PUBLIC_STATES: [STATUS.ACTIVE, STATUS.APPROVED, STATUS.PUBLIC] as const,

  // All moderation statuses
  MODERATION_STATES: [
    STATUS.PENDING,
    STATUS.APPROVED,
    STATUS.REJECTED,
  ] as const,
} as const

// Status configuration for UI
export const statusConfig = {
  // Default statuses
  defaults: {
    resource: process.env.STATUS_DEFAULT_RESOURCE || STATUS.ACTIVE,
    submission: process.env.STATUS_DEFAULT_SUBMISSION || STATUS.PENDING,
    moderation: process.env.STATUS_DEFAULT_MODERATION || STATUS.PENDING,
  },

  // Status validation
  valid: {
    resource: [
      STATUS.ACTIVE,
      STATUS.PENDING,
      STATUS.INACTIVE,
      STATUS.ARCHIVED,
    ] as const,
    moderation: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED] as const,
    visibility: [STATUS.PUBLIC, STATUS.PRIVATE, STATUS.DRAFT] as const,
  },

  // Status transitions (what can transition to what)
  transitions: {
    [STATUS.PENDING]: [STATUS.APPROVED, STATUS.REJECTED, STATUS.ACTIVE],
    [STATUS.APPROVED]: [STATUS.ACTIVE, STATUS.ARCHIVED],
    [STATUS.ACTIVE]: [STATUS.INACTIVE, STATUS.ARCHIVED, STATUS.DELETED],
    [STATUS.INACTIVE]: [STATUS.ACTIVE, STATUS.ARCHIVED],
    [STATUS.REJECTED]: [STATUS.PENDING],
  },

  // Status colors for UI
  colors: {
    [STATUS.ACTIVE]: {
      bg: process.env.STATUS_COLOR_ACTIVE_BG || '#d4edda',
      text: process.env.STATUS_COLOR_ACTIVE_TEXT || '#155724',
    },
    [STATUS.PENDING]: {
      bg: process.env.STATUS_COLOR_PENDING_BG || '#fff3cd',
      text: process.env.STATUS_COLOR_PENDING_TEXT || '#856404',
    },
    [STATUS.APPROVED]: {
      bg: process.env.STATUS_COLOR_APPROVED_BG || '#d4edda',
      text: process.env.STATUS_COLOR_APPROVED_TEXT || '#155724',
    },
    [STATUS.REJECTED]: {
      bg: process.env.STATUS_COLOR_REJECTED_BG || '#f8d7da',
      text: process.env.STATUS_COLOR_REJECTED_TEXT || '#721c24',
    },
    [STATUS.INACTIVE]: {
      bg: process.env.STATUS_COLOR_INACTIVE_BG || '#e2e3e5',
      text: process.env.STATUS_COLOR_INACTIVE_TEXT || '#383d41',
    },
    [STATUS.ARCHIVED]: {
      bg: process.env.STATUS_COLOR_ARCHIVED_BG || '#f8f9fa',
      text: process.env.STATUS_COLOR_ARCHIVED_TEXT || '#6c757d',
    },
  },
} as const

export type StatusConfig = typeof statusConfig
export type StatusGroup = keyof typeof STATUS_GROUPS
