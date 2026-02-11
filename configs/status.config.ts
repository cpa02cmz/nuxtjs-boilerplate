// Status Constants - All status values centralized
// Flexy hates hardcoded status strings! All statuses are now modular.

/**
 * Resource/Content Status Constants
 */
export const RESOURCE_STATUS = {
  /** Active and visible to users */
  ACTIVE: 'active',
  /** Pending approval/moderation */
  PENDING: 'pending',
  /** Rejected by moderation */
  REJECTED: 'rejected',
  /** Deprecated/no longer available */
  DEPRECATED: 'deprecated',
  /** Under review */
  UNDER_REVIEW: 'under_review',
  /** Archived */
  ARCHIVED: 'archived',
} as const

/**
 * Comment Status Constants
 */
export const COMMENT_STATUS = {
  /** Active and visible */
  ACTIVE: 'active',
  /** Pending moderation */
  PENDING: 'pending',
  /** Hidden/removed */
  HIDDEN: 'hidden',
  /** Flagged for review */
  FLAGGED: 'flagged',
} as const

/**
 * Moderation Status Constants
 */
export const MODERATION_STATUS = {
  /** Pending moderation review */
  PENDING: 'pending',
  /** Approved by moderator */
  APPROVED: 'approved',
  /** Rejected by moderator */
  REJECTED: 'rejected',
  /** Flagged for review */
  FLAGGED: 'flagged',
  /** Auto-approved */
  AUTO_APPROVED: 'auto_approved',
  /** Reviewed by moderator */
  REVIEWED: 'reviewed',
  /** Resolved/closed */
  RESOLVED: 'resolved',
  /** Dismissed by moderator */
  DISMISSED: 'dismissed',
} as const

/**
 * Submission Status Constants
 */
export const SUBMISSION_STATUS = {
  /** Pending review */
  PENDING: 'pending',
  /** Approved and published */
  APPROVED: 'approved',
  /** Rejected */
  REJECTED: 'rejected',
  /** In review queue */
  IN_REVIEW: 'in_review',
  /** Draft state */
  DRAFT: 'draft',
} as const

/**
 * Webhook Status Constants
 */
export const WEBHOOK_STATUS = {
  /** Active and receiving events */
  ACTIVE: 'active',
  /** Inactive/paused */
  INACTIVE: 'inactive',
  /** Failed/error state */
  FAILED: 'failed',
  /** Pending verification */
  PENDING: 'pending',
} as const

/**
 * User Status Constants
 */
export const USER_STATUS = {
  /** Active user */
  ACTIVE: 'active',
  /** Suspended user */
  SUSPENDED: 'suspended',
  /** Banned user */
  BANNED: 'banned',
  /** Pending verification */
  PENDING: 'pending',
} as const

/**
 * API Key Status Constants
 */
export const API_KEY_STATUS = {
  /** Active API key */
  ACTIVE: 'active',
  /** Revoked API key */
  REVOKED: 'revoked',
  /** Expired API key */
  EXPIRED: 'expired',
} as const

/**
 * Validation Status Constants
 */
export const VALIDATION_STATUS = {
  /** Valid */
  VALID: 'valid',
  /** Invalid */
  INVALID: 'invalid',
  /** Pending validation */
  PENDING: 'pending',
  /** Validation error */
  ERROR: 'error',
} as const

// Type exports for TypeScript
export type ResourceStatus =
  (typeof RESOURCE_STATUS)[keyof typeof RESOURCE_STATUS]
export type CommentStatus = (typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS]
export type ModerationStatus =
  (typeof MODERATION_STATUS)[keyof typeof MODERATION_STATUS]
export type SubmissionStatus =
  (typeof SUBMISSION_STATUS)[keyof typeof SUBMISSION_STATUS]
export type WebhookStatus = (typeof WEBHOOK_STATUS)[keyof typeof WEBHOOK_STATUS]
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]
export type ApiKeyStatus = (typeof API_KEY_STATUS)[keyof typeof API_KEY_STATUS]
export type ValidationStatus =
  (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS]
