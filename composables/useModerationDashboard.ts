import { readonly, ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import type { ApiClient } from '~/utils/api-client'
import { limitsConfig } from '~/configs/limits.config'
import { iconsConfig } from '~/configs/icons.config'
import { dateConfig } from '~/configs/date.config'
import { STATUS } from '~/configs/status.config'

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
          params: { status: STATUS.PENDING },
        }
      )

      if (queueResponse.success) {
        pendingCount.value = queueResponse.data?.total || 0
      }

      // Mock data - will be replaced with real data from API
      approvedCount.value = limitsConfig.moderation.mockApprovedCount
      rejectedCount.value = limitsConfig.moderation.mockRejectedCount
      flaggedCount.value = limitsConfig.moderation.mockFlaggedCount

      // Flexy hates hardcoded timestamps! Using configurable values.
      const { msPerHour } = dateConfig.intervals
      const { recent, moderate, older, oldest } = dateConfig.activityTiming

      recentActivity.value = [
        {
          id: '1',
          type: 'approve',
          message: 'Approved "React Best Practices Guide" submission',
          timestamp: new Date(Date.now() - recent * msPerHour).toISOString(),
        },
        {
          id: '2',
          type: 'reject',
          message: 'Rejected "Fake Resource" submission - spam',
          timestamp: new Date(Date.now() - moderate * msPerHour).toISOString(),
        },
        {
          id: '3',
          type: 'flag',
          message: 'Resource "Old Tool" flagged for being deprecated',
          timestamp: new Date(Date.now() - older * msPerHour).toISOString(),
        },
        {
          id: '4',
          type: 'submit',
          message: 'New submission "Vue 3 Components Library" received',
          timestamp: new Date(Date.now() - oldest * msPerHour).toISOString(),
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
    // Use iconsConfig - Flexy hates hardcoded values!
    switch (type) {
      case 'approve':
        return iconsConfig.activity.approve
      case 'reject':
        return iconsConfig.activity.reject
      case 'flag':
        return iconsConfig.activity.flag
      case 'submit':
        return iconsConfig.activity.submit
      default:
        return iconsConfig.activity.default
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
