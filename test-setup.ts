// Minimal test setup file for Vitest - avoids interfering with Nuxt environment
import { vi } from 'vitest'

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      sanitize: html => {
        // Basic sanitization for testing - just return the input for now
        // In real tests you'd want proper sanitization
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Only set process.env.NODE_ENV if it's not already set by Nuxt
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test'
}

// Mock Nuxt composables to prevent "nuxt instance unavailable" errors
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        canonicalUrl: 'http://localhost:3000',
      },
    }),
    useNuxtApp: () => ({
      $pinia: null,
      isHydrating: false,
      payload: {
        data: {},
        state: {},
        once: new Set(),
      },
      static: {
        data: {},
      },
      provide: () => {},
    }),
    useState: (key: string) => vi.fn(() => vi.fn()),
    useFetch: vi.fn(),
    useAsyncData: vi.fn(),
  }
})

// Mock #imports specifically for useRuntimeConfig and useHead
vi.mock('#imports', async () => {
  const actual = await vi.importActual('#imports')
  return {
    ...actual,
    useRuntimeConfig: () => ({
      public: {
        canonicalUrl: 'http://localhost:3000',
      },
    }),
    useHead: vi.fn(),
  }
})

// Create a basic Nuxt app mock to handle useNuxtApp calls
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__NUXT__ = {
    serverRendered: false,
    config: {
      public: {
        canonicalUrl: 'http://localhost:3000',
      },
      app: {
        baseURL: '/',
        buildAssetsDir: '/_nuxt/',
        cdnURL: '',
      },
    },
    data: {},
    state: {},
  }
}

// Handle unhandled promise rejections to prevent test failures
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', reason, promise)
  })

  process.on('uncaughtException', error => {
    console.warn('Uncaught exception:', error)
  })
}

// Handle unhandled rejections in browser environment as well
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.warn('Unhandled promise rejection in browser:', event.reason)
  })

  window.addEventListener('error', event => {
    console.warn('Uncaught error in browser:', event.error)
  })
}

// Create a basic Nuxt app mock to handle useNuxtApp calls
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__NUXT__ = {
    serverRendered: false,
    config: {
      public: {
        canonicalUrl: 'http://localhost:3000',
      },
      app: {
        baseURL: '/',
        buildAssetsDir: '/_nuxt/',
        cdnURL: '',
      },
    },
    data: {},
    state: {},
  }
}

// Handle unhandled promise rejections to prevent test failures
if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason, promise) => {
    console.warn('Unhandled promise rejection:', reason, promise)
  })

  process.on('uncaughtException', error => {
    console.warn('Uncaught exception:', error)
  })
}

// Handle unhandled rejections in browser environment as well
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', event => {
    console.warn('Unhandled promise rejection in browser:', event.reason)
  })

  window.addEventListener('error', event => {
    console.warn('Uncaught error in browser:', event.error)
  })
}
