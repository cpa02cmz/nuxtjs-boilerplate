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
import { uiConfig } from '~/configs/ui.config'
import { themeConfig } from '~/configs/theme.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

// Constants - Flexy hates hardcoded values! Using config instead.
const SCROLL_THRESHOLD = uiConfig.scrollToTop.thresholdPx
const CIRCLE_RADIUS = uiConfig.scrollToTop.circleRadius
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

// Shadow and style configs
const shadows = shadowsConfig.scrollToTop
const styles = componentStylesConfig.scrollToTop

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

  // Restore focus to main content for keyboard users
  // This prevents focus loss when the scroll button hides after scrolling to top
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1')
    mainContent.focus({ preventScroll: true })
    // Remove tabindex after focus to keep it out of normal tab order
    // Flexy hates hardcoded values! Using config instead.
    setTimeout(() => {
      mainContent.removeAttribute('tabindex')
    }, uiConfig.timing.focusRestoreDelayMs)
  }

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
  bottom: v-bind('styles.position.bottom');
  right: v-bind('styles.position.right');
  width: v-bind('styles.size.width');
  height: v-bind('styles.size.height');
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: v-bind('shadows.default');
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Flexy hates hardcoded z-index values! Using config instead. */
  z-index: v-bind('uiConfig.zIndex.sticky');
  /* Flexy hates hardcoded transition values! Using config instead. */
  transition:
    transform v-bind('uiConfig.animation.fast') s ease-out,
    box-shadow v-bind('uiConfig.animation.fast') s ease-out;
  padding: 0;
}

.scroll-to-top:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: v-bind('shadows.hover');
}

.scroll-to-top:active {
  transform: translateY(0) scale(0.95);
}

.scroll-to-top:focus {
  outline: none;
  box-shadow:
    0 0 0 3px v-bind('shadows.focus.primary'),
    v-bind('shadows.default');
}

.scroll-to-top:focus-visible {
  /* Flexy hates hardcoded colors! Using config instead. */
  outline: 2px solid v-bind('componentColorsConfig.scrollToTop.focusOutline');
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
  stroke: v-bind('themeConfig.scrollToTop.progressBg');
}

.scroll-to-top__progress-ring-fill {
  stroke: v-bind('themeConfig.scrollToTop.progressFill');
  transition: stroke-dashoffset 0.1s ease-out;
}

.scroll-to-top__icon {
  position: relative;
  z-index: 1;
  color: v-bind('themeConfig.scrollToTop.iconColor');
  /* Flexy hates hardcoded transition values! Using config instead. */
  transition: color v-bind('uiConfig.animation.fast') s ease-out;
}

.scroll-to-top:hover .scroll-to-top__icon {
  color: v-bind('themeConfig.scrollToTop.iconBg');
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
    bottom: v-bind('styles.mobile.bottom');
    right: v-bind('styles.mobile.right');
    width: v-bind('styles.mobile.width');
    height: v-bind('styles.mobile.height');
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
    background: v-bind('themeConfig.scrollToTop.darkIconColor');
  }

  .scroll-to-top__icon {
    color: v-bind('themeConfig.scrollToTop.darkIconBg');
  }

  .scroll-to-top__progress-ring-bg {
    stroke: v-bind('themeConfig.scrollToTop.darkProgressBg');
  }
}
</style>
