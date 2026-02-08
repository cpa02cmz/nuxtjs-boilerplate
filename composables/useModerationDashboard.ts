import { readonly, ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import type { ApiClient } from '~/utils/api-client'
import { limitsConfig } from '~/configs/limits.config'
import { TIME_CONSTANTS, SubmissionStatus } from '~/utils/constants'

export interface ActivityItem {
  id: string
  type: 'approve' | 'reject' | 'flag' | 'submit'
  message: string
  timestamp: string
}

export interface UseModerationDashboardOptions {
  apiClient?: ApiClient
}

export const useModerationDashboard = (
  options: UseModerationDashboardOptions = {}
) => {
  const { apiClient: providedClient } = options

  const getClient = () => {
    if (providedClient) {
      return providedClient
    }
    const { $apiClient } = useNuxtApp()
    return $apiClient
  }

  const pendingCount = ref(0)
  const approvedCount = ref(0)
  const rejectedCount = ref(0)
  const flaggedCount = ref(0)
  const recentActivity = ref<ActivityItem[]>([])

  const loadStatistics = async () => {
    try {
      const client = getClient()
      const queueResponse = await client.get<{ total?: number }>(
        '/api/moderation/queue',
        {
          params: { status: SubmissionStatus.PENDING },
        }
      )

      if (queueResponse.success) {
        pendingCount.value = queueResponse.data?.total || 0
      }

      // Mock data - will be replaced with real data from API
      approvedCount.value = limitsConfig.moderation.mockApprovedCount
      rejectedCount.value = limitsConfig.moderation.mockRejectedCount
      flaggedCount.value = limitsConfig.moderation.mockFlaggedCount

      recentActivity.value = [
        {
          id: '1',
          type: 'approve',
          message: 'Approved "React Best Practices Guide" submission',
          timestamp: new Date(
            Date.now() - TIME_CONSTANTS.HOUR_MS
          ).toISOString(),
        },
        {
          id: '2',
          type: 'reject',
          message: 'Rejected "Fake Resource" submission - spam',
          timestamp: new Date(
            Date.now() - TIME_CONSTANTS.HOUR_MS * 2
          ).toISOString(),
        },
        {
          id: '3',
          type: 'flag',
          message: 'Resource "Old Tool" flagged for being deprecated',
          timestamp: new Date(
            Date.now() - TIME_CONSTANTS.HOUR_MS * 3
          ).toISOString(),
        },
        {
          id: '4',
          type: 'submit',
          message: 'New submission "Vue 3 Components Library" received',
          timestamp: new Date(
            Date.now() - TIME_CONSTANTS.HOUR_MS * 4
          ).toISOString(),
        },
      ]
    } catch (err) {
      logError(
        'Error loading dashboard data:',
        err as Error,
        'useModerationDashboard'
      )

      pendingCount.value = limitsConfig.community.initialContributions
      approvedCount.value = limitsConfig.community.initialContributions
      rejectedCount.value = limitsConfig.community.initialContributions
      flaggedCount.value = limitsConfig.community.initialContributions
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return '✅'
      case 'reject':
        return '❌'
      case 'flag':
        return '🚩'
      case 'submit':
        return '📝'
      default:
        return 'ℹ️'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  onMounted(() => {
    loadStatistics()
  })

  return {
    pendingCount: readonly(pendingCount),
    approvedCount: readonly(approvedCount),
    rejectedCount: readonly(rejectedCount),
    flaggedCount: readonly(flaggedCount),
    recentActivity: readonly(recentActivity),
    loadStatistics,
    getActivityIcon,
    formatDate,
  }
}
