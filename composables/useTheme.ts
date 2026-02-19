import { ref, onMounted, getCurrentInstance, type Ref } from 'vue'
import { patternsConfig } from '~/configs/patterns.config'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = patternsConfig.storageKeys.themePreference

export interface UseThemeReturn {
  theme: Ref<Theme>
  isDark: Ref<boolean | null>
  isMounted: Ref<boolean>
  setTheme: (newTheme: Theme) => void
  toggleTheme: () => void
  cycleTheme: () => void
}

export function useTheme(): UseThemeReturn {
  // Initialize as null to indicate "not yet determined" - prevents hydration mismatches
  const theme = ref<Theme>('system')
  const isDark = ref<boolean | null>(null)
  const isMounted = ref(false)

  const updateThemeClass = () => {
    if (
      typeof document === 'undefined' ||
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return

    const root = document.documentElement

    if (theme.value === 'dark') {
      root.classList.add('dark')
      isDark.value = true
    } else if (theme.value === 'light') {
      root.classList.remove('dark')
      isDark.value = false
    } else {
      // System preference
      const systemPrefersDark = window.matchMedia(
        patternsConfig.mediaQueries.prefersDark
      ).matches
      if (systemPrefersDark) {
        root.classList.add('dark')
        isDark.value = true
      } else {
        root.classList.remove('dark')
        isDark.value = false
      }
    }
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme)
    }
    updateThemeClass()
  }

  const toggleTheme = () => {
    if (theme.value === 'light') {
      setTheme('dark')
    } else if (theme.value === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const cycleTheme = () => {
    toggleTheme()
  }

  // Watch for system preference changes
  // BroCula fix: Only call onMounted if there's an active Vue instance
  if (getCurrentInstance()) {
    onMounted(() => {
      isMounted.value = true

      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          theme.value = saved
        }
      }

      updateThemeClass()

      // Listen for system preference changes
      if (typeof window.matchMedia !== 'function') return
      const mediaQuery = window.matchMedia(
        patternsConfig.mediaQueries.prefersDark
      )
      const handleChange = () => {
        if (theme.value === 'system') {
          updateThemeClass()
        }
      }

      mediaQuery.addEventListener('change', handleChange)

      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    })
  }

  return {
    theme,
    isDark,
    isMounted,
    setTheme,
    toggleTheme,
    cycleTheme,
  }
}
