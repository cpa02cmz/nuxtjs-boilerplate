import { ref, readonly } from 'vue'

interface LoadingState {
  loading: boolean
  error: string | null
  message: string
}

export const useLoading = () => {
  const state = ref<LoadingState>({
    loading: false,
    error: null,
    message: '',
  })

  const startLoading = (message = 'Loading...') => {
    state.value = {
      loading: true,
      error: null,
      message,
    }
  }

  const stopLoading = () => {
    state.value = {
      ...state.value,
      loading: false,
    }
  }

  const setError = (errorMessage: string) => {
    state.value = {
      loading: false,
      error: errorMessage,
      message: '',
    }
  }

  const clearError = () => {
    state.value = {
      ...state.value,
      error: null,
    }
  }

  const withLoading = async <T>(
    fn: () => Promise<T>,
    loadingMessage = 'Loading...'
  ): Promise<T> => {
    startLoading(loadingMessage)
    try {
      const result = await fn()
      stopLoading()
      return result
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred'
      setError(errorMessage)
      stopLoading()
      throw error
    }
  }

  return {
    loadingState: readonly(state),
    startLoading,
    stopLoading,
    setError,
    clearError,
    withLoading,
  }
}
