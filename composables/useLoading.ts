import { ref, readonly } from 'vue'

/**
 * Composable for managing consistent loading states across the application
 * Provides a standardized way to handle loading, error, and success states
 */
export const useLoading = (initialLoading = false) => {
  const loading = ref(initialLoading)
  const error = ref<string | null>(null)
  const success = ref(false)
  const message = ref<string | null>(null)

  const startLoading = () => {
    loading.value = true
    error.value = null
    success.value = false
    message.value = null
  }

  const stopLoading = () => {
    loading.value = false
  }

  const setError = (errorValue: string) => {
    loading.value = false
    error.value = errorValue
    success.value = false
    message.value = null
  }

  const setSuccess = (messageValue: string) => {
    loading.value = false
    error.value = null
    success.value = true
    message.value = messageValue
  }

  const reset = () => {
    loading.value = false
    error.value = null
    success.value = false
    message.value = null
  }

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await fn()
      stopLoading()
      return result
    } catch (error: any) {
      setError(error?.message || 'An unexpected error occurred')
      throw error
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    success: readonly(success),
    message: readonly(message),
    startLoading,
    stopLoading,
    setError,
    setSuccess,
    reset,
    withLoading,
  }
}
