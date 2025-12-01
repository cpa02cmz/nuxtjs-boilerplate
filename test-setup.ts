// Test setup file for Vitest with Nuxt
import { vi } from 'vitest'

// Mock DOM APIs that may be needed by components if not provided by node environment
// We need to check if window is available first
if (typeof window !== 'undefined') {
  // Mock Intersection Observer if not present
  if (typeof window.IntersectionObserver === 'undefined') {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    })
  }

  // Mock ResizeObserver if not present
  if (typeof window.ResizeObserver === 'undefined') {
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      value: vi.fn(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    })
  }

  // Mock additional APIs that might be missing
  if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn(query => ({
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

  // Mock window.dispatchEvent if needed
  if (typeof window.dispatchEvent === 'undefined') {
    Object.defineProperty(window, 'dispatchEvent', {
      writable: true,
      value: vi.fn(),
    })
  }

  // Mock localStorage if not available
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

  // Mock sessionStorage if not available
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
} else {
  // In node environment, we need to provide global mocks for DOM APIs
  global.window = global.window || {}

  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  }

  if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  }

  if (typeof global.matchMedia === 'undefined') {
    global.matchMedia = vi.fn(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  }

  // Add window.dispatchEvent which was missing and causing test failures
  if (typeof global.window.dispatchEvent === 'undefined') {
    global.window.dispatchEvent = vi.fn()
  }

  if (typeof global.CustomEvent === 'undefined') {
    global.CustomEvent = class CustomEvent {
      constructor(event, params = {}) {
        this.event = event
        this.detail = params.detail || undefined
      }
    }
  }

  if (typeof global.localStorage === 'undefined') {
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
  }

  if (typeof global.sessionStorage === 'undefined') {
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    }
  }

  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: vi.fn(() => ({
        style: {},
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getContext: vi.fn(),
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        insertBefore: vi.fn((newNode, refNode) => ({})), // Add this for Vue components
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
        body: {
          appendChild: vi.fn(),
          insertBefore: vi.fn((newNode, refNode) => ({})), // Add this too
        },
      })),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(),
      cookie: '',
      readyState: 'complete',
      createComment: vi.fn(() => ({})), // This is the missing function from the original error
    }
  }

  if (typeof global.HTMLElement === 'undefined') {
    global.HTMLElement = class HTMLElement {}
  }

  if (typeof global.SVGElement === 'undefined') {
    global.SVGElement = class SVGElement {}
  }

  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = vi.fn(callback => {
      return setTimeout(callback, 0)
    })
    global.cancelAnimationFrame = vi.fn(clearTimeout)
  }

  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
      userAgent: 'test-agent',
      platform: 'test-platform',
    }
  }

  // Add Node constants that might be missing
  if (typeof global.Node === 'undefined') {
    global.Node = {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3,
      COMMENT_NODE: 8,
      DOCUMENT_NODE: 9,
    }
  }
}

// Mock DOMPurify
vi.mock('dompurify', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    default: {
      sanitize: html => {
        // Basic sanitization for testing
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
      },
    },
  }
})

// Set test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test'
}
