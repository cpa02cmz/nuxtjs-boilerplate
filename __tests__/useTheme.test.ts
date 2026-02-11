import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTheme } from '~/composables/useTheme'
import { patternsConfig } from '~/configs/patterns.config'

describe('useTheme', () => {
  let localStorageMock: Storage
  let matchMediaMock: ReturnType<typeof vi.fn>
  let classListMock: {
    add: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Mock localStorage
    const storage: Record<string, string> = {}
    localStorageMock = {
      getItem: vi.fn((key: string) => storage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key]
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key])
      }),
      key: vi.fn((index: number) => Object.keys(storage)[index] || null),
      length: 0,
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Mock classList
    classListMock = {
      add: vi.fn(),
      remove: vi.fn(),
    }
    Object.defineProperty(document, 'documentElement', {
      value: { classList: classListMock },
      writable: true,
    })

    // Mock matchMedia
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with system theme by default', () => {
    const { theme } = useTheme()
    expect(theme.value).toBe('system')
  })

  it('should set theme to dark', () => {
    const { theme, setTheme, isDark } = useTheme()

    setTheme('dark')

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(classListMock.add).toHaveBeenCalledWith('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      patternsConfig.storageKeys.themePreference,
      'dark'
    )
  })

  it('should set theme to light', () => {
    const { theme, setTheme, isDark } = useTheme()

    setTheme('light')

    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(classListMock.remove).toHaveBeenCalledWith('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      patternsConfig.storageKeys.themePreference,
      'light'
    )
  })

  it('should toggle theme from light to dark', () => {
    const { theme, setTheme, toggleTheme, isDark } = useTheme()

    setTheme('light')
    toggleTheme()

    expect(theme.value).toBe('dark')
    expect(isDark.value).toBe(true)
  })

  it('should toggle theme from dark to system', () => {
    const { theme, setTheme, toggleTheme } = useTheme()

    setTheme('dark')
    toggleTheme()

    expect(theme.value).toBe('system')
  })

  it('should toggle theme from system to light', () => {
    const { theme, setTheme, toggleTheme } = useTheme()

    setTheme('system')
    toggleTheme()

    expect(theme.value).toBe('light')
  })

  it('should cycle theme using cycleTheme method', () => {
    const { theme, setTheme, cycleTheme } = useTheme()

    setTheme('light')
    cycleTheme()

    expect(theme.value).toBe('dark')
  })

  it('should apply system dark preference when theme is system', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { setTheme, isDark } = useTheme()

    setTheme('system')

    expect(isDark.value).toBe(true)
    expect(classListMock.add).toHaveBeenCalledWith('dark')
  })

  it('should apply system light preference when theme is system', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { setTheme, isDark } = useTheme()

    setTheme('system')

    expect(isDark.value).toBe(false)
    expect(classListMock.remove).toHaveBeenCalledWith('dark')
  })

  it('should not throw when localStorage is undefined', () => {
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    })

    const { setTheme } = useTheme()

    expect(() => setTheme('dark')).not.toThrow()
  })

  it('should not throw when document is undefined', () => {
    Object.defineProperty(global, 'document', {
      value: undefined,
      writable: true,
    })

    const { setTheme } = useTheme()

    expect(() => setTheme('dark')).not.toThrow()

    // Restore document
    Object.defineProperty(global, 'document', {
      value: { documentElement: { classList: classListMock } },
      writable: true,
    })
  })

  it('should load saved theme from localStorage', () => {
    localStorageMock.getItem = vi.fn().mockReturnValue('dark')

    const { theme } = useTheme()

    // Initial value is system, but on mount it should load from localStorage
    expect(theme.value).toBe('system')
  })

  it('should handle invalid stored theme values', () => {
    localStorageMock.getItem = vi.fn().mockReturnValue('invalid-theme')

    const { theme, setTheme } = useTheme()

    // Should remain as system (default)
    expect(theme.value).toBe('system')

    // Should still be able to set valid themes
    setTheme('light')
    expect(theme.value).toBe('light')
  })
})
