import { ref, type Ref } from 'vue'
import { logError } from '~/utils/errorLogger'
import { messagesConfig } from '~/configs/messages.config'

export interface AsyncOperationOptions {
  /**
   * Operation name for error logging context
   */
  operationName: string
  /**
   * Whether to track loading state
   * @default true
   */
  trackLoading?: boolean
  /**
   * Whether to track error state
   * @default true
   */
  trackError?: boolean
  /**
   * Custom error message to display to users
   * If not provided, a generic message will be used
   */
  errorMessage?: string
  /**
   * Additional metadata to include in error logs
   */
  logMetadata?: Record<string, unknown>
  /**
   * Whether to log errors
   * @default true
   */
  logErrors?: boolean
}

export interface AsyncOperationResult<T> {
  /**
   * Whether the operation is currently loading
   */
  loading: Ref<boolean>
  /**
   * Error message if operation failed
   */
  error: Ref<string>
  /**
   * Execute the async operation
   */
  execute: (fn: () => Promise<T>) => Promise<T | null>
  /**
   * Clear error state
   */
  clearError: () => void
  /**
   * Reset both loading and error states
   */
  reset: () => void
}

/**
 * Composable for standardized async operation handling
 *
 * Provides consistent error handling, loading states, and logging
 * across all async operations in the application.
 *
 * @example
 * ```typescript
 * // In a composable
 * const { loading, error, execute, clearError } = useAsyncOperation<Resource[]>({
 *   operationName: 'fetchResources',
 *   errorMessage: 'Failed to load resources',
 *   logMetadata: { category: 'data-fetching' }
 * })
 *
 * const fetchResources = async () => {
 *   return await execute(async () => {
 *     const response = await apiClient.get('/api/resources')
 *     if (!response.success) {
 *       throw new Error(response.error?.message || 'Unknown error')
 *     }
 *     return response.data
 *   })
 * }
 * ```
 */
export function useAsyncOperation<T>(
  options: AsyncOperationOptions
): AsyncOperationResult<T> {
  const {
    operationName,
    trackLoading = true,
    trackError = true,
    errorMessage = messagesConfig.errors.generic.operationFailed,
    logMetadata = {},
    logErrors = true,
  } = options

  const loading = ref(false)
  const error = ref('')

  const clearError = () => {
    if (trackError) {
      error.value = ''
    }
  }

  const reset = () => {
    clearError()
    if (trackLoading) {
      loading.value = false
    }
  }

  const execute = async (fn: () => Promise<T>): Promise<T | null> => {
    clearError()

    if (trackLoading) {
      loading.value = true
    }

    try {
      const result = await fn()
      return result
    } catch (err) {
      const errorInstance = err instanceof Error ? err : new Error(String(err))

      if (trackError) {
        error.value = errorMessage
      }

      if (logErrors) {
        logError(
          `Error in ${operationName}: ${errorInstance.message}`,
          errorInstance,
          operationName,
          {
            ...logMetadata,
            errorType: errorInstance.constructor.name,
            timestamp: new Date().toISOString(),
          }
        )
      }

      return null
    } finally {
      if (trackLoading) {
        loading.value = false
      }
    }
  }

  return {
    loading,
    error,
    execute,
    clearError,
    reset,
  }
}

/**
 * Helper function for executing async operations without tracking state
 * Useful for one-off operations where you don't need reactive state
 *
 * @example
 * ```typescript
 * const result = await executeAsync(
 *   async () => await apiClient.post('/api/action', data),
 *   { operationName: 'performAction' }
 * )
 * ```
 */
export async function executeAsync<T>(
  fn: () => Promise<T>,
  options: Omit<AsyncOperationOptions, 'trackLoading' | 'trackError'>
): Promise<T | null> {
  const { execute } = useAsyncOperation<T>({
    ...options,
    trackLoading: false,
    trackError: false,
  })

  return execute(fn)
}
