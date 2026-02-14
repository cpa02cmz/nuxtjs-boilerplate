import { ref, onUnmounted, type Ref } from 'vue'

export interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  immediate?: boolean
}

export interface UseIntersectionObserverReturn {
  isIntersecting: Ref<boolean>
  isLoaded: Ref<boolean>
  observe: (element: Element) => void
  unobserve: (element: Element) => void
}

/**
 * Composable for IntersectionObserver-based lazy loading
 *
 * @usage
 * ```vue
 * <template>
 *   <div ref="targetRef">
 *     <HeavyComponent v-if="isIntersecting" />
 *   </div>
 * </template>
 *
 * <script setup>
 * const targetRef = ref(null)
 * const { isIntersecting } = useIntersectionObserver({
 *   threshold: 0.1,
 *   rootMargin: '-100px'
 * })
 *
 * onMounted(() => {
 *   if (targetRef.value) {
 *     observe(targetRef.value)
 *   }
 * })
 * </script>
 * ```
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const { root = null, rootMargin = '0px', threshold = 0.1 } = options

  const isIntersecting = ref(false)
  const isLoaded = ref(false)
  let observer: IntersectionObserver | null = null

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isIntersecting.value = true
        isLoaded.value = true
        // Optionally unobserve after first intersection
        if (observer && entry.target) {
          observer.unobserve(entry.target)
        }
      }
    })
  }

  const observe = (element: Element) => {
    if (typeof window === 'undefined') return

    if (!observer) {
      observer = new IntersectionObserver(handleIntersection, {
        root,
        rootMargin,
        threshold,
      })
    }

    observer.observe(element)
  }

  const unobserve = (element: Element) => {
    if (observer && element) {
      observer.unobserve(element)
    }
  }

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    isIntersecting,
    isLoaded,
    observe,
    unobserve,
  }
}

/**
 * Directive for lazy loading elements with IntersectionObserver
 *
 * @usage
 * ```vue
 * <template>
 *   <div v-lazy-load="onIntersect">
 *     <HeavyComponent v-if="showComponent" />
 *   </div>
 * </template>
 *
 * <script setup>
 * const showComponent = ref(false)
 * const onIntersect = () => {
 *   showComponent.value = true
 * }
 * </script>
 * ```
 */
export function useLazyLoad(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
) {
  const { observe, unobserve } = useIntersectionObserver({
    ...options,
    immediate: true,
  })

  return {
    observe: (el: Element) => {
      observe(el)
    },
    unobserve: (el: Element) => {
      unobserve(el)
    },
  }
}
