// types/feedback.ts
export interface Feedback {
  id: string
  type:
    | 'bug_report'
    | 'feature_request'
    | 'general_feedback'
    | 'suggestion'
    | 'compliment'
    | 'complaint'
  title: string
  description: string
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  userId?: string
  userEmail?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  assignedTo?: string
  tags?: string[]
  response?: string
  respondedAt?: string
}

export interface FeedbackSubmission {
  type:
    | 'bug_report'
    | 'feature_request'
    | 'general_feedback'
    | 'suggestion'
    | 'compliment'
    | 'complaint'
  title: string
  description: string
  category?: string
  userEmail?: string
  userAgent?: string
}
