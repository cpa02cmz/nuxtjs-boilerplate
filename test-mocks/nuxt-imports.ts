// Mock for #imports Nuxt alias in tests
import { vi } from 'vitest'

export const useNuxtApp = vi.fn(() => ({
  $config: {
    public: {
      apiBase: '/api',
      siteUrl: 'http://localhost:3000',
    },
  },
}))

export const useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBase: '/api',
    siteUrl: 'http://localhost:3000',
  },
}))

export const useState = vi.fn(() => ref(null))
export const useRequestHeaders = vi.fn(() => ({}))
export const useCookie = vi.fn(() => ref(null))
export const useAsyncData = vi.fn()
export const useFetch = vi.fn()
export const navigateTo = vi.fn()
export const definePageMeta = vi.fn()
export const useHead = vi.fn()
export const useError = vi.fn(() => ref(null))
export const showError = vi.fn()
export const clearError = vi.fn()
export const useRoute = vi.fn(() => ({
  path: '/',
  params: {},
  query: {},
}))
export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}))

// Re-export from Vue for convenience
import { ref } from 'vue'
export { ref }
