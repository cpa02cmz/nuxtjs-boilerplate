import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  it('should initialize with correct default values', () => {
    const { loading, error, success, message } = useLoading()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(success.value).toBe(false)
    expect(message.value).toBeNull()
  })

  it('should initialize with correct initial loading state', () => {
    const { loading } = useLoading(true)

    expect(loading.value).toBe(true)
  })

  it('should start loading correctly', () => {
    const { loading, startLoading, error, success, message } = useLoading()

    startLoading()

    expect(loading.value).toBe(true)
    expect(error.value).toBeNull()
    expect(success.value).toBe(false)
    expect(message.value).toBeNull()
  })

  it('should stop loading correctly', () => {
    const { loading, startLoading, stopLoading } = useLoading()

    startLoading()
    stopLoading()

    expect(loading.value).toBe(false)
  })

  it('should set error correctly', () => {
    const { error, setError, loading, success, message } = useLoading()

    setError('Test error')

    expect(error.value).toBe('Test error')
    expect(loading.value).toBe(false)
    expect(success.value).toBe(false)
    expect(message.value).toBeNull()
  })

  it('should set success correctly', () => {
    const { success, setSuccess, loading, error, message } = useLoading()

    setSuccess('Success message')

    expect(success.value).toBe(true)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(message.value).toBe('Success message')
  })

  it('should reset state correctly', () => {
    const {
      loading,
      error,
      success,
      message,
      startLoading,
      setError,
      setSuccess,
      reset,
    } = useLoading()

    startLoading()
    setError('Test error')
    setSuccess('Success message')

    // At this point, success should override error
    expect(success.value).toBe(true)
    expect(error.value).toBeNull()

    reset()

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(success.value).toBe(false)
    expect(message.value).toBeNull()
  })

  it('should execute function with loading state using withLoading', async () => {
    const { loading, withLoading } = useLoading()

    const mockFunction = vi.fn().mockResolvedValue('result')

    expect(loading.value).toBe(false)

    const result = await withLoading(mockFunction)

    expect(mockFunction).toHaveBeenCalledTimes(1)
    expect(result).toBe('result')
    expect(loading.value).toBe(false) // Should be false after completion
  })

  it('should handle errors in withLoading and set error state', async () => {
    const { loading, error, withLoading } = useLoading()

    const mockFunction = vi.fn().mockRejectedValue(new Error('Test error'))

    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()

    await expect(withLoading(mockFunction)).rejects.toThrow('Test error')

    expect(mockFunction).toHaveBeenCalledTimes(1)
    expect(loading.value).toBe(false) // Should be false after error
    expect(error.value).toBe('Test error')
  })

  it('should maintain loading state during async operation in withLoading', async () => {
    const { loading, withLoading } = useLoading()

    // Create a promise that resolves after a short delay
    const delayedFunction = () =>
      new Promise(resolve => setTimeout(() => resolve('result'), 10))

    // Start the async operation
    const promise = withLoading(delayedFunction)

    // Loading should be true during the operation
    expect(loading.value).toBe(true)

    // Wait for the operation to complete
    const result = await promise

    // Loading should be false after completion
    expect(loading.value).toBe(false)
    expect(result).toBe('result')
  })
})
