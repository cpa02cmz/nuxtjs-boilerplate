import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isHapticSupported,
  shouldSkipHaptics,
  triggerHaptic,
  hapticSuccess,
  hapticWarning,
  hapticError,
  hapticLight,
  hapticMedium,
  withHaptic,
} from '~/utils/hapticFeedback'

describe('hapticFeedback', () => {
  let vibrateMock: ReturnType<typeof vi.fn>
  let matchMediaMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock navigator.vibrate
    vibrateMock = vi.fn().mockReturnValue(true)
    Object.defineProperty(global.navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    })

    // Mock window.matchMedia
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(global.window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isHapticSupported', () => {
    it('returns true when vibrate is supported', () => {
      expect(isHapticSupported()).toBe(true)
    })

    it('returns false when vibrate is not supported', () => {
      // Mock navigator without vibrate
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
        configurable: true,
      })
      expect(isHapticSupported()).toBe(false)
    })
  })

  describe('shouldSkipHaptics', () => {
    it('returns true when reduced motion is preferred', () => {
      matchMediaMock.mockReturnValue({ matches: true })
      expect(shouldSkipHaptics()).toBe(true)
    })

    it('returns false when reduced motion is not preferred', () => {
      matchMediaMock.mockReturnValue({ matches: false })
      expect(shouldSkipHaptics()).toBe(false)
    })
  })

  describe('triggerHaptic', () => {
    it('triggers light haptic feedback', () => {
      triggerHaptic('light')
      expect(vibrateMock).toHaveBeenCalledWith(10)
    })

    it('triggers medium haptic feedback', () => {
      triggerHaptic('medium')
      expect(vibrateMock).toHaveBeenCalledWith(25)
    })

    it('triggers heavy haptic feedback', () => {
      triggerHaptic('heavy')
      expect(vibrateMock).toHaveBeenCalledWith(50)
    })

    it('triggers success haptic feedback', () => {
      triggerHaptic('success')
      expect(vibrateMock).toHaveBeenCalledWith([50, 100, 50])
    })

    it('triggers warning haptic feedback', () => {
      triggerHaptic('warning')
      expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30])
    })

    it('triggers error haptic feedback', () => {
      triggerHaptic('error')
      expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100])
    })

    it('returns false when reduced motion is preferred', () => {
      matchMediaMock.mockReturnValue({ matches: true })
      const result = triggerHaptic('light')
      expect(result).toBe(false)
      expect(vibrateMock).not.toHaveBeenCalled()
    })

    it('returns false when vibrate is not supported', () => {
      Object.defineProperty(global.navigator, 'vibrate', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const result = triggerHaptic('light')
      expect(result).toBe(false)
    })

    it('gracefully handles errors', () => {
      vibrateMock.mockImplementation(() => {
        throw new Error('Vibration error')
      })
      const result = triggerHaptic('light')
      expect(result).toBe(false)
    })
  })

  describe('convenience functions', () => {
    it('hapticSuccess triggers success pattern', () => {
      hapticSuccess()
      expect(vibrateMock).toHaveBeenCalledWith([50, 100, 50])
    })

    it('hapticWarning triggers warning pattern', () => {
      hapticWarning()
      expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30])
    })

    it('hapticError triggers error pattern', () => {
      hapticError()
      expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100])
    })

    it('hapticLight triggers light pattern', () => {
      hapticLight()
      expect(vibrateMock).toHaveBeenCalledWith(10)
    })

    it('hapticMedium triggers medium pattern', () => {
      hapticMedium()
      expect(vibrateMock).toHaveBeenCalledWith(25)
    })
  })

  describe('withHaptic', () => {
    it('triggers haptic and executes callback', () => {
      const callback = vi.fn().mockReturnValue('result')
      const result = withHaptic('success', callback)

      expect(vibrateMock).toHaveBeenCalledWith([50, 100, 50])
      expect(callback).toHaveBeenCalled()
      expect(result).toBe('result')
    })

    it('triggers haptic without callback', () => {
      const result = withHaptic('light')
      expect(vibrateMock).toHaveBeenCalledWith(10)
      expect(result).toBeUndefined()
    })
  })
})
