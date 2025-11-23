import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  it('creates a loading state with initial values', () => {
    const { createLoadingState } = useLoading()
    const loadingState = createLoadingState('Initial message')

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
    expect(loadingState.message).toBe('Initial message')
  })

  it('executes function with loading state using withLoading', async () => {
    const { createLoadingState } = useLoading()
    const loadingState = createLoadingState()

    const mockFn = vi.fn().mockResolvedValue('success')

    const result = await loadingState.withLoading(mockFn, 'Loading...')

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBeNull()
    expect(result).toBe('success')
    expect(loadingState.message).toBe('')
  })

  it('handles errors in withLoading function', async () => {
    const { createLoadingState } = useLoading()
    const loadingState = createLoadingState()

    const mockFn = vi.fn().mockRejectedValue(new Error('Test error'))

    await expect(
      loadingState.withLoading(mockFn, 'Loading...')
    ).rejects.toThrow('Test error')

    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBe('Test error')
    expect(loadingState.message).toBe('')
  })

  it('manually controls loading state with startLoading and stopLoading', () => {
    const { createLoadingState } = useLoading()
    const loadingState = createLoadingState()

    loadingState.startLoading('Custom loading message')
    expect(loadingState.loading).toBe(true)
    expect(loadingState.message).toBe('Custom loading message')
    expect(loadingState.error).toBeNull()

    loadingState.stopLoading()
    expect(loadingState.loading).toBe(false)
    expect(loadingState.message).toBe('')
  })

  it('sets and clears errors manually', () => {
    const { createLoadingState } = useLoading()
    const loadingState = createLoadingState()

    loadingState.setError('Custom error')
    expect(loadingState.loading).toBe(false)
    expect(loadingState.error).toBe('Custom error')

    loadingState.clearError()
    expect(loadingState.error).toBeNull()
  })

  it('manages global loading state', () => {
    const { globalLoading, startGlobalLoading, stopGlobalLoading } =
      useLoading()

    expect(globalLoading.value).toBe(false)

    startGlobalLoading()
    expect(globalLoading.value).toBe(true)

    stopGlobalLoading()
    expect(globalLoading.value).toBe(false)
  })
})
