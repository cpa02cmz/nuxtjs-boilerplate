import { ref, reactive } from 'vue'

// Define loading state types
interface LoadingState {
  loading: boolean
  error: string | null
  message: string
}

// Loading state management composable
export const useLoading = () => {
  // Global loading state
  const globalLoading = ref(false)

  // Create a named loading state
  const createLoadingState = (initialMessage: string = '') => {
    const state = reactive<LoadingState>({
      loading: false,
      error: null,
      message: initialMessage,
    })

    // Method to execute a function with loading state
    const withLoading = async <T>(
      fn: () => Promise<T>,
      loadingMessage: string = 'Loading...'
    ): Promise<T> => {
      state.loading = true
      state.error = null
      state.message = loadingMessage

      try {
        const result = await fn()
        state.loading = false
        state.message = ''
        return result
      } catch (err) {
        state.loading = false
        state.error = err instanceof Error ? err.message : 'An error occurred'
        state.message = ''
        throw err
      }
    }

    // Manual loading state control
    const startLoading = (message: string = 'Loading...') => {
      state.loading = true
      state.error = null
      state.message = message
    }

    const stopLoading = () => {
      state.loading = false
      state.message = ''
    }

    const setError = (error: string) => {
      state.loading = false
      state.error = error
      state.message = ''
    }

    const clearError = () => {
      state.error = null
    }

    return {
      get loading() {
        return state.loading
      },
      get error() {
        return state.error
      },
      get message() {
        return state.message
      },
      withLoading,
      startLoading,
      stopLoading,
      setError,
      clearError,
    }
  }

  // Global loading control
  const startGlobalLoading = () => {
    globalLoading.value = true
  }

  const stopGlobalLoading = () => {
    globalLoading.value = false
  }

  return {
    globalLoading: globalLoading,
    createLoadingState,
    startGlobalLoading,
    stopGlobalLoading,
  }
}
