import { ref, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme-preference'

export function useTheme() {
  const theme = ref<Theme>('system')
  const isDark = ref(false)

  const updateThemeClass = () => {
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
        '(prefers-color-scheme: dark)'
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
  onMounted(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        theme.value = saved
      }
    }

    updateThemeClass()

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
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

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    cycleTheme,
  }
}
