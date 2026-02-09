<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-90"
  >
    <button
      v-show="isVisible"
      ref="scrollButtonRef"
      class="scroll-to-top"
      :class="{ 'scroll-to-top--reduced-motion': prefersReducedMotion }"
      :style="progressStyle"
      aria-label="Scroll to top of page"
      title="Scroll to top"
      @click="scrollToTop"
      @keydown="handleKeyDown"
    >
      <!-- Progress Ring Background -->
      <svg
        class="scroll-to-top__progress-ring"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <!-- Background circle -->
        <circle
          class="scroll-to-top__progress-ring-bg"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke-width="3"
        />
        <!-- Progress circle -->
        <circle
          class="scroll-to-top__progress-ring-fill"
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashOffset"
          stroke-linecap="round"
        />
      </svg>

      <!-- Arrow Icon -->
      <div class="scroll-to-top__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- Screen reader announcement -->
      <span class="sr-only">
        {{ announcementText }}
      </span>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { uiConfig } from '../configs/ui.config'

// Constants - Flexy hates hardcoded values! Using config instead.
const SCROLL_THRESHOLD = uiConfig.scrollToTop.thresholdPx
const CIRCLE_RADIUS = uiConfig.scrollToTop.circleRadius
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

// Reactive state
const isVisible = ref(false)
const scrollProgress = ref(0)
const prefersReducedMotion = ref(false)
const announcementText = ref('')
const scrollButtonRef = ref<HTMLButtonElement | null>(null)

// Computed
const circumference = computed(() => CIRCUMFERENCE)

const strokeDashOffset = computed(() => {
  return CIRCUMFERENCE - (scrollProgress.value / 100) * CIRCUMFERENCE
})

const progressStyle = computed(() => {
  return {
    '--scroll-progress': `${scrollProgress.value}%`,
  } as Record<string, string>
})

// Methods
const updateScrollProgress = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight

  // Show/hide button based on threshold
  isVisible.value = scrollTop > SCROLL_THRESHOLD

  // Calculate progress percentage
  if (scrollHeight > 0) {
    scrollProgress.value = Math.min(
      100,
      Math.round((scrollTop / scrollHeight) * 100)
    )
  }
}

const scrollToTop = () => {
  // Check for reduced motion preference
  const behavior = prefersReducedMotion.value ? 'auto' : 'smooth'

  window.scrollTo({
    top: 0,
    behavior: behavior as 'auto' | 'smooth',
  })

  // Announce to screen readers
  announcementText.value = uiConfig.scrollToTop.announcementText
  setTimeout(() => {
    announcementText.value = ''
  }, uiConfig.scrollToTop.announcementTimeoutMs)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    scrollToTop()
  }
}

const checkReducedMotion = () => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }
  return undefined
}

// Lifecycle hooks
let cleanupReducedMotion: (() => void) | undefined

onMounted(() => {
  // Check initial reduced motion preference
  cleanupReducedMotion = checkReducedMotion()

  // Add scroll listener with RAF for performance
  let ticking = false
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  updateScrollProgress() // Initial check

  // Store cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (cleanupReducedMotion) {
      cleanupReducedMotion()
    }
  })
})
</script>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: v-bind('uiConfig.scrollToTop.bottomPosition');
  right: v-bind('uiConfig.scrollToTop.rightPosition');
  width: v-bind('uiConfig.scrollToTop.buttonWidth');
  height: v-bind('uiConfig.scrollToTop.buttonHeight');
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out;
  padding: 0;
}

.scroll-to-top:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.scroll-to-top:active {
  transform: translateY(0) scale(0.95);
}

.scroll-to-top:focus {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.scroll-to-top:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.scroll-to-top__progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.scroll-to-top__progress-ring-bg {
  stroke: #e5e7eb;
}

.scroll-to-top__progress-ring-fill {
  stroke: #3b82f6;
  transition: stroke-dashoffset 0.1s ease-out;
}

.scroll-to-top__icon {
  position: relative;
  z-index: 1;
  color: #374151;
  transition: color 0.2s ease-out;
}

.scroll-to-top:hover .scroll-to-top__icon {
  color: #1f2937;
}

/* Reduced motion support */
.scroll-to-top--reduced-motion {
  transition: none;
}

.scroll-to-top--reduced-motion:hover {
  transform: none;
}

.scroll-to-top--reduced-motion .scroll-to-top__progress-ring-fill {
  transition: none;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .scroll-to-top {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 44px;
    height: 44px;
  }

  .scroll-to-top__icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* Ensure button doesn't overlap with other fixed elements on mobile */
@media (max-width: 768px) {
  .scroll-to-top {
    bottom: 5rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .scroll-to-top {
    border: 2px solid currentColor;
  }

  .scroll-to-top__progress-ring-fill {
    stroke: currentColor;
  }
}

/* Dark mode support (if needed in future) */
@media (prefers-color-scheme: dark) {
  .scroll-to-top {
    background: #1f2937;
  }

  .scroll-to-top__icon {
    color: #f3f4f6;
  }

  .scroll-to-top__progress-ring-bg {
    stroke: #374151;
  }
}
</style>
