import { beforeAll, afterEach, afterAll } from 'vitest'
import { config } from '@vue/test-utils'

// Create mock implementations for Nuxt composables
const mockUseHead = vi.fn()
const mockUseSeoMeta = vi.fn()
const mockDefinePageMeta = vi.fn()
const mockUseState = vi.fn()
const mockUseFetch = vi.fn()
const mockUseAsyncData = vi.fn()
const mockNavigateTo = vi.fn()
const mock$fetch = vi.fn()

// Mock Nuxt composables
config.global.mocks = {
  $nuxt: {
    $router: {
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    $route: {
      path: '/',
      query: {},
      params: {},
      hash: '',
      name: 'index',
      meta: {},
    },
  },
  useHead: mockUseHead,
  useSeoMeta: mockUseSeoMeta,
  definePageMeta: mockDefinePageMeta,
  useState: mockUseState,
  useFetch: mockUseFetch,
  useAsyncData: mockUseAsyncData,
  navigateTo: mockNavigateTo,
  $fetch: mock$fetch,
}

// Add global properties to Vue app
config.global.provide = {
  ...config.global.provide,
  useHead: mockUseHead,
  useSeoMeta: mockUseSeoMeta,
  definePageMeta: mockDefinePageMeta,
  useState: mockUseState,
  useFetch: mockUseFetch,
  useAsyncData: mockUseAsyncData,
  navigateTo: mockNavigateTo,
  $fetch: mock$fetch,
}

// Add to globalThis for global access
Object.defineProperty(global, 'useHead', {
  value: mockUseHead,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'useSeoMeta', {
  value: mockUseSeoMeta,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'definePageMeta', {
  value: mockDefinePageMeta,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'useState', {
  value: mockUseState,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'useFetch', {
  value: mockUseFetch,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'useAsyncData', {
  value: mockUseAsyncData,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'navigateTo', {
  value: mockNavigateTo,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, '$fetch', {
  value: mock$fetch,
  writable: true,
  configurable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

beforeAll(() => {
  // Global test setup
})

afterEach(() => {
  // Clean up after each test
  vi.clearAllMocks()
})

afterAll(() => {
  // Global cleanup
})
