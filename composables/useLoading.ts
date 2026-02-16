import { reactive, readonly, onUnmounted, ref, getCurrentInstance } from 'vue'
import { UI_FEEDBACK_DURATION } from '~/server/utils/constants'
import { messagesConfig } from '~/configs/messages.config'

// Define loading state interface
export interface LoadingState {
  loading: boolean
  error: string | null
  success: boolean
  message: string | null
}

// Loading composable for consistent loading state management
export const useLoading = () => {
  const loadingState = reactive<LoadingState>({
    loading: false,
    error: null,
    success: false,
    message: null,
  })

  // Track all timeout IDs for cleanup
  const timeoutIds = ref<ReturnType<typeof setTimeout>[]>([])

  // Wrapper function to execute async operations with loading states
  const withLoading = async <T>(
    fn: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
    }
  ): Promise<T | null> => {
    try {
      loadingState.loading = true
      loadingState.error = null
      loadingState.success = false
      loadingState.message = null

      const result = await fn()

      if (options?.successMessage) {
        loadingState.success = true
        loadingState.message = options.successMessage
      }

      return result
    } catch (err) {
      const errorMessage =
        options?.errorMessage ||
        (err instanceof Error
          ? err.message
          : messagesConfig.errors.generic.default)
      loadingState.error = errorMessage
      loadingState.message = errorMessage

      return null
    } finally {
      loadingState.loading = false
      // Clear success message after a delay to allow user to see it
      if (loadingState.success) {
        const timeoutId = setTimeout(() => {
          if (loadingState.success) {
            loadingState.success = false
            loadingState.message = null
          }
        }, UI_FEEDBACK_DURATION.SUCCESS_MESSAGE_CLEAR)
        timeoutIds.value.push(timeoutId)
      }
    }
  }

  // Manual loading state control
  const startLoading = (message?: string) => {
    loadingState.loading = true
    loadingState.error = null
    loadingState.success = false
    loadingState.message = message || null
  }

  const stopLoading = (message?: string, isSuccess: boolean = false) => {
    loadingState.loading = false
    loadingState.success = isSuccess
    loadingState.message = message || null
  }

  const setError = (error: string) => {
    loadingState.error = error
    loadingState.loading = false
    loadingState.success = false
    loadingState.message = error
  }

  const reset = () => {
    loadingState.loading = false
    loadingState.error = null
    loadingState.success = false
    loadingState.message = null
  }

  // Cleanup all timeouts on component unmount
  // BugFixer: Only register onUnmounted if we're in a component context
  if (getCurrentInstance()) {
    onUnmounted(() => {
      timeoutIds.value.forEach(id => clearTimeout(id))
      timeoutIds.value = []
    })
  }

  return {
    loadingState: readonly(loadingState),
    withLoading,
    startLoading,
    stopLoading,
    setError,
    reset,
  }
}
