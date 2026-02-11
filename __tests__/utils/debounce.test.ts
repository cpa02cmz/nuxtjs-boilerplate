import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from '~/utils/debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should only execute once for multiple rapid calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should reset timer on subsequent calls', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()

    vi.advanceTimersByTime(50)
    expect(mockFn).not.toHaveBeenCalled()

    debouncedFn()

    vi.advanceTimersByTime(50)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to the debounced function', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1', 'arg2', 123)

    vi.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 123)
  })

  it('should handle zero wait time', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 0)

    debouncedFn()

    // Even with 0ms, it should be debounced (executed on next tick)
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(0)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple separate debounced calls after wait', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)

    debouncedFn()
    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should work with different function types', () => {
    const voidFn = vi.fn()
    const debouncedVoid = debounce(voidFn, 100)

    debouncedVoid()
    vi.advanceTimersByTime(100)
    expect(voidFn).toHaveBeenCalled()

    const stringFn = vi.fn().mockReturnValue('result')
    const debouncedString = debounce(stringFn, 100)

    debouncedString()
    vi.advanceTimersByTime(100)
    expect(stringFn).toHaveBeenCalled()
  })

  it('should clear previous timeout when called again', () => {
    const mockFn = vi.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('first')
    debouncedFn('second')
    debouncedFn('third')

    vi.advanceTimersByTime(100)

    // Should only be called with the last set of arguments
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('third')
  })
})
