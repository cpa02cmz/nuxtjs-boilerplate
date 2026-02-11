// Type declarations for Nuxt plugins and runtime config
import type { RouteLocationNormalized } from 'vue-router'

declare module '#app' {
  interface NuxtApp {
    $toast: {
      addToast: (
        type: 'success' | 'error' | 'info' | 'warning',
        message: string,
        description?: string,
        duration?: number
      ) => void
      removeToast: (id: string) => void
      success: (message: string, description?: string) => void
      error: (message: string, description?: string) => void
      warning: (message: string, description?: string) => void
      info: (message: string, description?: string) => void
    }
    $router?: {
      afterEach: (
        guard: (
          to: RouteLocationNormalized,
          from: RouteLocationNormalized
        ) => void
      ) => void
    }
    $analytics: {
      trackEvent: (
        type: string,
        properties?: Record<string, unknown>
      ) => Promise<boolean>
      trackPageView: (url: string, title?: string) => Promise<boolean>
      trackResourceClick: (
        resourceId: string,
        title: string,
        category: string
      ) => Promise<boolean>
      trackResourceView: (
        resourceId: string,
        title: string,
        category: string
      ) => Promise<boolean>
      trackSearch: (query: string, resultsCount: number) => Promise<boolean>
    }
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: NuxtApp['$toast']
    $analytics: NuxtApp['$analytics']
  }
}

// Network Information API type declarations
declare global {
  interface NetworkInformation extends EventTarget {
    readonly effectiveType: string
    readonly downlink: number
    readonly rtt: number
    readonly saveData: boolean
    readonly type?: string
    onchange: ((this: NetworkInformation, ev: Event) => unknown) | null
    addEventListener<K extends keyof NetworkInformationEventMap>(
      type: K,
      listener: (
        this: NetworkInformation,
        ev: NetworkInformationEventMap[K]
      ) => unknown,
      options?: boolean | AddEventListenerOptions
    ): void
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void
    removeEventListener<K extends keyof NetworkInformationEventMap>(
      type: K,
      listener: (
        this: NetworkInformation,
        ev: NetworkInformationEventMap[K]
      ) => unknown,
      options?: boolean | EventListenerOptions
    ): void
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void
  }

  interface NetworkInformationEventMap {
    change: Event
  }

  interface Navigator {
    connection?: NetworkInformation
  }
}

export {}
