import { describe, it, expect, beforeEach } from 'vitest'
import { useLoading } from '~/composables/useLoading'

describe('useLoading', () => {
  let loadingComposable: ReturnType<typeof useLoading>

  beforeEach(() => {
    loadingComposable = useLoading()
  })

  it('initializes with correct default state', () => {
    expect(loadingComposable.loadingState.value.loading).toBe(false)
    expect(loadingComposable.loadingState.value.error).toBeNull()
    expect(loadingComposable.loadingState.value.message).toBe('')
  })

  it('starts loading with message', () => {
    loadingComposable.startLoading('Loading data...')

    expect(loadingComposable.loadingState.value.loading).toBe(true)
    expect(loadingComposable.loadingState.value.message).toBe('Loading data...')
    expect(loadingComposable.loadingState.value.error).toBeNull()
  })

  it('stops loading', () => {
    loadingComposable.startLoading('Loading data...')
    loadingComposable.stopLoading()

    expect(loadingComposable.loadingState.value.loading).toBe(false)
    // Message should persist after stop loading
    expect(loadingComposable.loadingState.value.message).toBe('Loading data...')
  })

  it('sets error state', () => {
    loadingComposable.setError('Something went wrong')

    expect(loadingComposable.loadingState.value.loading).toBe(false)
    expect(loadingComposable.loadingState.value.error).toBe(
      'Something went wrong'
    )
    expect(loadingComposable.loadingState.value.message).toBe('')
  })

  it('clears error state', () => {
    loadingComposable.setError('Something went wrong')
    loadingComposable.clearError()

    expect(loadingComposable.loadingState.value.error).toBeNull()
  })

  it('executes function with loading state using withLoading', async () => {
    const mockFn = vi.fn(() => Promise.resolve('success'))

    const result = await loadingComposable.withLoading(mockFn, 'Loading...')

    expect(result).toBe('success')
    expect(loadingComposable.loadingState.value.loading).toBe(false)
    expect(loadingComposable.loadingState.value.error).toBeNull()
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('handles error in withLoading', async () => {
    const mockFn = vi.fn(() => Promise.reject(new Error('Test error')))

    await expect(
      loadingComposable.withLoading(mockFn, 'Loading...')
    ).rejects.toThrow('Test error')

    expect(loadingComposable.loadingState.value.loading).toBe(false)
    expect(loadingComposable.loadingState.value.error).toBe('Test error')
  })
})
