/**
 * Composable for submission review management
 * Handles submission approval, rejection, and state management
 *
 * Architecture:
 * - Business logic layer: Manages submission moderation operations
 * - Data access layer: Communicates with API endpoints via ApiClient
 * - Separation of concerns: Components handle presentation only
 */
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import type { ApiClient } from '~/utils/api-client'
import { logError } from '~/utils/errorLogger'
import type { Submission } from '~/types/submission'
import { apiConfig } from '~/configs/api.config'
import { userConfig } from '~/configs/user.config'
import { moderationConfig } from '~/configs/moderation.config'
import { messagesConfig } from '~/configs/messages.config'
import { STATUS } from '~/configs/status.config'

export interface SubmissionReviewOptions {
  submissionId: string
  reviewedBy?: string
}

export interface UseSubmissionReviewOptions extends SubmissionReviewOptions {
  apiClient?: ApiClient
}

export const useSubmissionReview = (options: UseSubmissionReviewOptions) => {
  const {
    submissionId,
    reviewedBy = userConfig.defaults.moderatorId,
    apiClient: providedClient,
  } = options

  const getClient = () => {
    if (providedClient) {
      return providedClient
    }
    const { $apiClient } = useNuxtApp()
    return $apiClient
  }

  const loading = ref(true)
  const error = ref('')
  const submission = ref<Submission | null>(null)
  const rejectionReason = ref('')

  const fetchSubmission = async () => {
    try {
      loading.value = true
      error.value = ''

      const client = getClient()
      const response = await client.get<{ submission?: Submission }>(
        apiConfig.submissions.byId(submissionId)
      )

      if (response.success && response.data) {
        submission.value = response.data.submission || null
      } else {
        error.value =
          response.error?.message || messagesConfig.errors.submission.loadFailed
      }
    } catch (err) {
      error.value = messagesConfig.errors.submission.fetchError
      logError(
        'Error fetching submission in useSubmissionReview:',
        err as Error,
        'useSubmissionReview'
      )
    } finally {
      loading.value = false
    }
  }

  const approveSubmission = async () => {
    if (!submission.value) return false

    try {
      const client = getClient()
      const response = await client.post(apiConfig.moderation.approve, {
        submissionId,
        reviewedBy,
        notes: moderationConfig.notes.approvedDefault,
      })

      if (response.success) {
        submission.value.status = STATUS.APPROVED
        submission.value.reviewedBy = reviewedBy
        submission.value.reviewedAt = new Date().toISOString()
        return true
      } else {
        error.value =
          response.error?.message ||
          messagesConfig.errors.submission.approveFailed
        return false
      }
    } catch (err) {
      logError(
        'Error approving submission:',
        err as Error,
        'useSubmissionReview'
      )
      error.value = messagesConfig.errors.submission.approveError
      return false
    }
  }

  const rejectSubmission = async (reason: string) => {
    if (!submission.value) return false

    if (!reason.trim()) {
      error.value = messagesConfig.errors.submission.rejectionReasonRequired
      return false
    }

    try {
      const client = getClient()
      const response = await client.post(apiConfig.moderation.reject, {
        submissionId,
        reviewedBy,
        rejectionReason: reason,
        notes: moderationConfig.notes.rejectedDefault,
      })

      if (response.success) {
        submission.value.status = STATUS.REJECTED
        submission.value.reviewedBy = reviewedBy
        submission.value.reviewedAt = new Date().toISOString()
        submission.value.rejectionReason = reason
        return true
      } else {
        error.value =
          (response.error as { message?: string } | undefined)?.message ||
          messagesConfig.errors.submission.rejectFailed
        return false
      }
    } catch (err) {
      logError(
        'Error rejecting submission:',
        err as Error,
        'useSubmissionReview'
      )
      error.value = messagesConfig.errors.submission.rejectError
      return false
    }
  }

  return {
    loading,
    error,
    submission,
    rejectionReason,
    fetchSubmission,
    approveSubmission,
    rejectSubmission,
  }
}
