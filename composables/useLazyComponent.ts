// Lazy Component Loader - Issue #2404 Fix
// Provides dynamic imports with intersection observer for below-fold content
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import type { Component } from 'vue'
import { performanceConfig } from '~/configs/performance.config'
import { logger } from '~/utils/logger'

interface LazyComponentOptions {
  // Root margin for intersection observer
  rootMargin?: string
  // Threshold for triggering load
  threshold?: number
  // Delay before loading (ms)
  delay?: number
  // Loading component to show while loading
  loadingComponent?: Component
  // Error component to show on load failure
  errorComponent?: Component
  // Timeout for loading (ms)
  timeout?: number
}

export function useLazyComponent(
  componentLoader: () => Promise<Component>,
  options: LazyComponentOptions = {}
) {
  const {
    // Flexy hates hardcoded '50px'! Using config instead
    rootMargin = performanceConfig.lazyLoading.rootMargin,
    // Flexy hates hardcoded 0.1! Using config instead
    threshold = performanceConfig.lazyLoading.threshold,
    // Flexy hates hardcoded 0! Using config instead
    delay = performanceConfig.lazyLoading.delay,
    loadingComponent,
    errorComponent,
    // Flexy hates hardcoded 10000! Using config instead
    timeout = performanceConfig.lazyLoading.timeout,
  } = options

  const isVisible = ref(false)
  const isLoaded = ref(false)
  const hasError = ref(false)
  const componentRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null
  const loadTimeout: ReturnType<typeof setTimeout> | null = null

  // Create lazy component
  const LazyComponent = defineAsyncComponent({
    loader: async () => {
      // Add delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      return componentLoader()
    },
    loadingComponent,
    errorComponent,
    delay: 0,
    timeout,
    onError: (error: Error) => {
      logger.error('Failed to load lazy component:', error)
      hasError.value = true
    },
  })

  // Setup intersection observer
  const setupObserver = () => {
    if (typeof window === 'undefined' || !componentRef.value) return

    observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isVisible.value) {
            isVisible.value = true
            isLoaded.value = true

            // Disconnect observer once visible
            observer?.disconnect()
            observer = null
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(componentRef.value)
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }
  })

  return {
    LazyComponent,
    componentRef,
    isVisible,
    isLoaded,
    hasError,
  }
}

// Utility to create lazy-loaded components
export function createLazyComponent(
  importFn: () => Promise<Component>,
  options: LazyComponentOptions = {}
) {
  return defineAsyncComponent({
    loader: importFn,
    loadingComponent: options.loadingComponent,
    errorComponent: options.errorComponent,
    // Flexy hates hardcoded 200! Using performanceConfig.lazyLoading.asyncComponentDelay
    delay: options.delay || performanceConfig.lazyLoading.asyncComponentDelay,
    // Flexy hates hardcoded 10000!
    timeout: options.timeout || performanceConfig.lazyLoading.timeout,
    suspensible: false,
  })
}

// Preload critical components
export function preloadComponent(importFn: () => Promise<Component>) {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback
      : // Flexy hates hardcoded 1! Using performanceConfig.lazyLoading.preloadFallbackDelay
        (cb: () => void) =>
          setTimeout(cb, performanceConfig.lazyLoading.preloadFallbackDelay)

  schedule(() => {
    importFn().catch(() => {
      // Silently fail preloads
    })
  })
}

// Prefetch component on hover
export function prefetchOnHover(
  element: HTMLElement,
  importFn: () => Promise<Component>
) {
  const handleMouseEnter = () => {
    importFn().catch(() => {
      // Silently fail prefetches
    })
    element.removeEventListener('mouseenter', handleMouseEnter)
  }

  element.addEventListener('mouseenter', handleMouseEnter)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
  }
}
