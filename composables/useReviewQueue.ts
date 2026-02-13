import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import { debounce } from '~/utils/debounce'
import { timeConfig } from '~/configs/time.config'
import { messagesConfig } from '~/configs/messages.config'
import { apiConfig } from '~/configs/api.config'
import type { Submission } from '~/types/submission'

export function useReviewQueue(initialSubmissions: Submission[] = []) {
  const submissions = ref<Submission[]>(initialSubmissions)
  const loading = ref(true)
  const error = ref('')
  const statusFilter = ref('')
  const categoryFilter = ref('')

  const fetchSubmissions = async () => {
    try {
      loading.value = true
      error.value = ''

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<{
        queue?: Submission[]
        message?: string
      }>(apiConfig.moderation.queue, {
        params: {
          status: statusFilter.value,
          category: categoryFilter.value,
        },
      })

      if (response.success && response.data) {
        submissions.value = response.data.queue || []
      } else {
        error.value =
          response.data?.message ||
          response.error?.message ||
          messagesConfig.errors.submission.loadListFailed
      }
    } catch (err) {
      error.value = messagesConfig.errors.submission.fetchListError
      logError(
        'Error fetching submissions in ReviewQueue:',
        err as Error,
        'ReviewQueue'
      )
    } finally {
      loading.value = false
    }
  }

  const filteredSubmissions = computed(() => {
    let result = [...submissions.value]

    if (statusFilter.value) {
      result = result.filter(sub => sub.status === statusFilter.value)
    }

    if (categoryFilter.value) {
      result = result.filter(sub =>
        sub.resourceData?.category
          ?.toLowerCase()
          .includes(categoryFilter.value.toLowerCase())
      )
    }

    return result
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Debounced fetch to prevent excessive API calls when filters change rapidly
  // Flexy hates hardcoded values! Using config instead.
  const debouncedFetchSubmissions = debounce(
    fetchSubmissions,
    timeConfig.debounce.search
  )

  watch([statusFilter, categoryFilter], () => {
    debouncedFetchSubmissions()
  })

  onMounted(() => {
    fetchSubmissions()
  })

  return {
    submissions,
    loading,
    error,
    statusFilter,
    categoryFilter,
    filteredSubmissions,
    formatDate,
    fetchSubmissions,
  }
}
