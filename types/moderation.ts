// Define TypeScript interfaces for content moderation and approval workflow

import type { Resource } from './resource'

export interface ModerationResource extends Resource {
  status: 'pending' | 'approved' | 'rejected' | 'deprecated'
  submittedBy?: string // User ID
  reviewedBy?: string // Moderator ID
  reviewedAt?: string
  rejectionReason?: string
  qualityScore?: number
  flags?: readonly Flag[]
}

export interface Flag {
  readonly id: string
  readonly resourceId: string
  readonly reason: string
  readonly reportedBy: string
  readonly createdAt: string
  readonly resolved: boolean
}

export interface Submission {
  id: string
  resourceData: Partial<ModerationResource>
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: string
  submittedAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

export interface SubmissionReview {
  submissionId: string
  action: 'approve' | 'reject' | 'flag'
  reviewerId: string
  notes?: string
  rejectionReason?: string
}

export interface ModerationQueueFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'deprecated'
  dateRange?: { start: string; end: string }
  searchQuery?: string
  flaggedOnly?: boolean
}

export interface QualityCheckResult {
  isValid: boolean
  issues: string[]
  score: number
  recommendations: string[]
}
