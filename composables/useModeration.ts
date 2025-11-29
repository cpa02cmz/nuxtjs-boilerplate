import { ref, computed } from 'vue'
import type { Submission, ModerationQueueFilter } from '~/types/moderation'

export function useModeration() {
  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch moderation queue with optional filters
  const fetchModerationQueue = async (filters?: ModerationQueueFilter) => {
    loading.value = true
    error.value = null

    try {
      // Build query string from filters
      const params = new URLSearchParams()

      if (filters?.status) params.append('status', filters.status)
      if (filters?.searchQuery) params.append('search', filters.searchQuery)
      if (filters?.flaggedOnly) params.append('flaggedOnly', 'true')

      if (filters?.dateRange) {
        if (filters.dateRange.start)
          params.append('dateFrom', filters.dateRange.start)
        if (filters.dateRange.end)
          params.append('dateTo', filters.dateRange.end)
      }

      const queryString = params.toString()
      const url = `/api/moderation/queue${queryString ? `?${queryString}` : ''}`

      const response = await $fetch(url)
      submissions.value = response.submissions || []

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch moderation queue'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Approve a submission
  const approveSubmission = async (submissionId: string, notes?: string) => {
    try {
      const response = await $fetch('/api/moderation/approve', {
        method: 'POST',
        body: {
          submissionId,
          action: 'approve',
          reviewerId: 'current-user', // In a real app, get from auth context
          notes,
        },
      })

      // Update the submission in the local list
      const index = submissions.value.findIndex(sub => sub.id === submissionId)
      if (index !== -1) {
        submissions.value[index].status = 'approved'
        submissions.value[index].reviewedBy = 'current-user'
        submissions.value[index].reviewedAt = new Date().toISOString()
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to approve submission'
      throw err
    }
  }

  // Reject a submission
  const rejectSubmission = async (
    submissionId: string,
    rejectionReason?: string,
    notes?: string
  ) => {
    try {
      const response = await $fetch('/api/moderation/reject', {
        method: 'POST',
        body: {
          submissionId,
          action: 'reject',
          reviewerId: 'current-user', // In a real app, get from auth context
          rejectionReason,
          notes,
        },
      })

      // Update the submission in the local list
      const index = submissions.value.findIndex(sub => sub.id === submissionId)
      if (index !== -1) {
        submissions.value[index].status = 'rejected'
        submissions.value[index].reviewedBy = 'current-user'
        submissions.value[index].reviewedAt = new Date().toISOString()
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to reject submission'
      throw err
    }
  }

  // Flag a resource
  const flagResource = async (
    resourceId: string,
    reason: string,
    reportedBy: string
  ) => {
    try {
      const response = await $fetch('/api/moderation/flag', {
        method: 'PUT',
        body: {
          resourceId,
          reason,
          reportedBy,
        },
      })

      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to flag resource'
      throw err
    }
  }

  // Get user's submissions
  const getUserSubmissions = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(
        `/api/submissions?userId=${encodeURIComponent(userId)}`
      )
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user submissions'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filtered submissions based on status
  const pendingSubmissions = computed(() =>
    submissions.value.filter(sub => sub.status === 'pending')
  )

  const approvedSubmissions = computed(() =>
    submissions.value.filter(sub => sub.status === 'approved')
  )

  const rejectedSubmissions = computed(() =>
    submissions.value.filter(sub => sub.status === 'rejected')
  )

  return {
    submissions: readonly(submissions),
    loading: readonly(loading),
    error: readonly(error),
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    fetchModerationQueue,
    approveSubmission,
    rejectSubmission,
    flagResource,
    getUserSubmissions,
  }
}
