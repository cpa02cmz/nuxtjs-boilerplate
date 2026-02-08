/**
 * Resource status values
 * Use these enums instead of hardcoded string literals
 */
export enum ResourceStatus {
  /** Resource is active and visible */
  ACTIVE = 'active',
  /** Resource is pending approval */
  PENDING = 'pending',
  /** Resource is archived */
  ARCHIVED = 'archived',
  /** Resource is deprecated */
  DEPRECATED = 'deprecated',
}

/**
 * Submission status values
 */
export enum SubmissionStatus {
  /** Submission is pending review */
  PENDING = 'pending',
  /** Submission has been approved */
  APPROVED = 'approved',
  /** Submission has been rejected */
  REJECTED = 'rejected',
}

/**
 * Comment status values
 */
export enum CommentStatus {
  /** Comment is active and visible */
  ACTIVE = 'active',
  /** Comment is pending approval */
  PENDING = 'pending',
  /** Comment has been flagged for review */
  FLAGGED = 'flagged',
  /** Comment has been deleted */
  DELETED = 'deleted',
}

/**
 * Flag status values (for flagging system)
 */
export enum FlagStatus {
  /** Flag is pending review */
  PENDING = 'pending',
  /** Flag has been reviewed */
  REVIEWED = 'reviewed',
  /** Flag has been resolved */
  RESOLVED = 'resolved',
  /** Flag has been dismissed */
  DISMISSED = 'dismissed',
}

/**
 * Moderation status values
 */
export enum ModerationStatus {
  /** Item is pending moderation */
  PENDING = 'pending',
  /** Item has been approved */
  APPROVED = 'approved',
  /** Item has been rejected */
  REJECTED = 'rejected',
  /** Item is under review */
  UNDER_REVIEW = 'under_review',
}

/**
 * Task status values for coordination
 */
export enum TaskStatus {
  /** Task is pending */
  PENDING = 'pending',
  /** Task is in progress */
  IN_PROGRESS = 'in-progress',
  /** Task is completed */
  COMPLETED = 'completed',
  /** Task is blocked */
  BLOCKED = 'blocked',
  /** Task failed */
  FAILED = 'failed',
}

/**
 * All valid resource status values as a type
 */
export type ResourceStatusValue = `${ResourceStatus}`

/**
 * All valid submission status values as a type
 */
export type SubmissionStatusValue = `${SubmissionStatus}`

/**
 * All valid comment status values as a type
 */
export type CommentStatusValue = `${CommentStatus}`

/**
 * All valid flag status values as a type
 */
export type FlagStatusValue = `${FlagStatus}`

/**
 * All valid moderation status values as a type
 */
export type ModerationStatusValue = `${ModerationStatus}`

/**
 * All valid task status values as a type
 */
export type TaskStatusValue = `${TaskStatus}`
