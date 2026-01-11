import { ref, computed, watch, onMounted } from 'vue'
import { logError } from '~/utils/errorLogger'
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

      const response = await $fetch<{
        success: boolean
        queue?: Submission[]
        message?: string
      }>('/api/moderation/queue', {
        params: {
          status: statusFilter.value,
          category: categoryFilter.value,
        },
      })

      if (response.success) {
        submissions.value = response.queue || []
      } else {
        error.value = response.message || 'Failed to load submissions'
      }
    } catch (err) {
      error.value = 'An error occurred while fetching submissions'
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

  watch([statusFilter, categoryFilter], () => {
    fetchSubmissions()
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
