import { vi } from 'vitest'

// Mock the nuxt-vitest-app-entry that causes the original error
vi.mock('#app/nuxt-vitest-app-entry', () => ({
  default: () => {},
}))

vi.mock('#app', async () => {
  return {
    useNuxtApp: vi.fn(),
    useRuntimeConfig: vi.fn(),
    useState: vi.fn(),
    useRequestHeaders: vi.fn(),
    useCookie: vi.fn(),
    useAsyncData: vi.fn(),
    useFetch: vi.fn(),
    navigateTo: vi.fn(),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
    useError: vi.fn(),
    showError: vi.fn(),
    clearError: vi.fn(),
  }
})

vi.mock('#app/composables/router', () => {
  return {
    useRouter: vi.fn(),
    useRoute: vi.fn(),
  }
})

vi.mock('vue', async importOriginal => {
  const actual = await importOriginal()
  if (typeof actual === 'object' && actual !== null) {
    return {
      ...actual,
      getCurrentInstance: vi.fn(),
    }
  }
  return {
    getCurrentInstance: vi.fn(),
  }
})

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  if (typeof actual === 'object' && actual !== null) {
    return {
      ...actual,
      default: {
        sanitize: (html: string) => {
          // Basic sanitization for testing
          return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
        },
      },
    }
  }
  return {
    default: {
      sanitize: (html: string) => {
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Mock localStorage and sessionStorage if they don't exist
if (typeof window !== 'undefined') {
  if (typeof window.localStorage === 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
    })
  }

  if (typeof window.sessionStorage === 'undefined') {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      writable: true,
    })
  }

  if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }
}

if (typeof global !== 'undefined') {
  if (typeof global.window === 'undefined') {
    global.window = {
      document: {
        createElement: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => [] as unknown as NodeListOf<Element>),
        getElementById: vi.fn(),
        createComment: vi.fn(),
        createTextNode: vi.fn(),
      } as unknown as Document,
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      sessionStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      },
      location: {
        href: 'http://localhost',
        origin: 'http://localhost',
        protocol: 'http:',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        pathname: '/',
        search: '',
        hash: '',
      } as unknown as Location,
      navigator: {
        userAgent: 'test-agent',
      } as unknown as Navigator,
    } as any
  }

  // Mock fetch if not available
  if (typeof global.fetch === 'undefined') {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        ok: true,
        status: 200,
        headers: new Headers(),
        redirected: false,
        statusText: 'OK',
        type: 'basic',
        url: 'http://localhost',
        clone: vi.fn(function (this: Response) {
          return this
        }),
        body: null,
        bodyUsed: false,
        arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
        blob: vi.fn(() => Promise.resolve(new Blob())),
        formData: vi.fn(() => Promise.resolve(new FormData())),
        bytes: vi.fn(() => Promise.resolve(new Uint8Array())),
      } as Response)
    ) as unknown as typeof fetch
  }
}

// Set test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test'
}
