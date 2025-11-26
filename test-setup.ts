// Simple test setup file for Vitest
import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed } from 'vue'

// Mock DOMPurify function
const createDOMPurifyMock = () => ({
  sanitize: (html: string): string => {
    // Basic sanitization for testing
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  },
})

vi.mock('dompurify', () => ({
  default: createDOMPurifyMock(),
}))

// Mock Nuxt imports
vi.mock('#imports', () => ({
  useHead: vi.fn(),
  useRuntimeConfig: () => ({
    public: {
      canonicalUrl: 'https://example.com',
    },
  }),
  useState: (key: string, defaultValue?: any) => ref(defaultValue),
  useFetch: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  }),
  useAsyncData: () => ({
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  }),
  navigateTo: vi.fn(),
  $fetch: vi.fn(),
}))

// Mock OptimizedImage component
vi.mock('~/components/OptimizedImage.vue', () => ({
  default: {
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'width', 'height'],
  },
}))

// Mock SocialShare component
vi.mock('~/components/SocialShare.vue', () => ({
  default: {
    template: '<div class="social-share">Social Share</div>',
    props: ['title', 'description', 'url', 'resourceType'],
  },
}))

// Global test configuration
config.global.stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
  },
  NuxtImg: {
    template: '<img />',
    props: ['src', 'alt', 'width', 'height'],
  },
  NuxtPicture: {
    template: '<picture><img /></picture>',
    props: ['src', 'alt', 'width', 'height'],
  },
  OptimizedImage: {
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'width', 'height'],
  },
  SocialShare: {
    template: '<div class="social-share">Social Share</div>',
    props: ['title', 'description', 'url', 'resourceType'],
  },
}

// Set test environment
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test'
}
