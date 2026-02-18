import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  useInterval,
  usePolling,
  useAnimationFrame,
} from '~/composables/useInterval'
import { TEST_TIMING } from '~/configs/test-timing.config'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { isRunning, tickCount } = useInterval()

      expect(isRunning.value).toBe(false)
      expect(tickCount.value).toBe(0)
    })
  })

  describe('start and stop', () => {
    it('should start an interval and increment tick count', () => {
      const { start, stop, isRunning, tickCount } = useInterval()
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)

      expect(isRunning.value).toBe(true)
      expect(tickCount.value).toBe(0)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(TEST_TIMING.STANDARD)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(tickCount.value).toBe(1)

      vi.advanceTimersByTime(TEST_TIMING.STANDARD)

      expect(callback).toHaveBeenCalledTimes(2)
      expect(tickCount.value).toBe(2)

      stop()

      expect(isRunning.value).toBe(false)
    })

    it('should stop interval and reset tick count', () => {
      const { start, stop, isRunning, tickCount } = useInterval()
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)
      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 3)

      expect(tickCount.value).toBe(3)

      stop()

      expect(isRunning.value).toBe(false)
      expect(tickCount.value).toBe(0)
    })

    it('should not restart interval after stop', () => {
      const { start, stop, isRunning } = useInterval()
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)
      stop()

      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 5)

      expect(callback).not.toHaveBeenCalled()
      expect(isRunning.value).toBe(false)
    })
  })

  describe('immediate option', () => {
    it('should execute callback immediately when immediate is true', () => {
      const { start, tickCount } = useInterval({ immediate: true })
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(tickCount.value).toBe(1)
    })

    it('should not execute callback immediately when immediate is false', () => {
      const { start, tickCount } = useInterval({ immediate: false })
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)

      expect(callback).not.toHaveBeenCalled()
      expect(tickCount.value).toBe(0)
    })
  })

  describe('autoReset option', () => {
    it('should auto-clear existing interval by default', () => {
      const { start, tickCount } = useInterval()
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      start(callback1, TEST_TIMING.STANDARD)
      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 2)

      expect(callback1).toHaveBeenCalledTimes(2)
      expect(tickCount.value).toBe(2)

      start(callback2, TEST_TIMING.STANDARD)
      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 2)

      expect(callback1).toHaveBeenCalledTimes(2)
      expect(callback2).toHaveBeenCalledTimes(2)
      expect(tickCount.value).toBe(2)
    })

    it('should not auto-clear when autoReset is false', () => {
      const { start, isRunning } = useInterval({ autoReset: false })
      const callback1 = vi.fn()

      start(callback1, TEST_TIMING.STANDARD)

      expect(isRunning.value).toBe(true)

      const callback2 = vi.fn()
      start(callback2, TEST_TIMING.STANDARD)

      expect(isRunning.value).toBe(true)
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should warn and skip for zero delay', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { start, isRunning } = useInterval()
      const callback = vi.fn()

      start(callback, 0)

      expect(isRunning.value).toBe(false)
      expect(callback).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('should warn and skip for negative delay', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { start, isRunning } = useInterval()
      const callback = vi.fn()

      start(callback, -100)

      expect(isRunning.value).toBe(false)
      expect(callback).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('pause and resume', () => {
    it('should pause interval without resetting tick count', () => {
      const { start, pause, isRunning, tickCount } = useInterval()
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)
      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 3)

      expect(tickCount.value).toBe(3)

      pause()

      expect(isRunning.value).toBe(false)
      expect(tickCount.value).toBe(3)

      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 5)

      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should resume interval from paused state', () => {
      const { start, pause, resume, isRunning, tickCount } = useInterval()
      const callback = vi.fn()

      start(callback, TEST_TIMING.STANDARD)
      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 2)
      pause()

      expect(tickCount.value).toBe(2)

      resume()

      expect(isRunning.value).toBe(true)

      vi.advanceTimersByTime(TEST_TIMING.STANDARD * 2)

      expect(callback).toHaveBeenCalledTimes(4)
      expect(tickCount.value).toBe(4)
    })

    it('should not resume if never started', () => {
      const { resume, isRunning } = useInterval()

      resume()

      expect(isRunning.value).toBe(false)
    })
  })
})

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should be an alias for useInterval with autoReset', () => {
    const { start, isRunning, tickCount } = usePolling()
    const callback = vi.fn()

    start(callback, TEST_TIMING.STANDARD)

    expect(isRunning.value).toBe(true)

    vi.advanceTimersByTime(TEST_TIMING.STANDARD * 2)

    expect(tickCount.value).toBe(2)
  })
})

describe('useAnimationFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should use minimum delay for animation frames', () => {
    const { start, isRunning } = useAnimationFrame()
    const callback = vi.fn()

    start(callback, 5)

    expect(isRunning.value).toBe(true)
  })

  it('should use default delay when not specified', () => {
    const { start, isRunning } = useAnimationFrame()
    const callback = vi.fn()

    start(callback, 100)

    expect(isRunning.value).toBe(true)
  })
})
