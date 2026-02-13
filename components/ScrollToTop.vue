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
      :aria-label="config.aria.scrollToTop"
      @click="scrollToTop"
      @keydown="handleKeyDown"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = true"
      @blur="showTooltip = false"
    >
      <!-- Hover Tooltip - Palette's micro-UX enhancement! -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-75 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-75 translate-y-2"
      >
        <div
          v-if="showTooltip && !prefersReducedMotion"
          class="scroll-tooltip"
          role="tooltip"
          aria-hidden="true"
        >
          <div class="scroll-tooltip__content">
            <span class="scroll-tooltip__text">{{ scrollProgress }}%</span>
            <span class="scroll-tooltip__label">scrolled</span>
          </div>
          <div class="scroll-tooltip__arrow" />
        </div>
      </Transition>
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
import { zIndexConfig } from '~/configs/z-index.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { contentConfig } from '~/configs/content.config'
import { hapticLight } from '~/utils/hapticFeedback'

// Constants - Flexy hates hardcoded values! Using config instead.
const config = contentConfig
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
// Palette's micro-UX enhancement: Show tooltip on hover/focus
const showTooltip = ref(false)

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
  if (typeof window === 'undefined' || typeof document === 'undefined') return

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
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  // Check for reduced motion preference
  const behavior = prefersReducedMotion.value ? 'auto' : 'smooth'

  window.scrollTo({
    top: 0,
    behavior: behavior as 'auto' | 'smooth',
  })

  // Haptic feedback for mobile users - Palette's micro-UX touch!
  hapticLight()

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

// Keyboard shortcut handler - Press "Home" key to scroll to top
// Palette's micro-UX enhancement for power users!
const handleKeyboardShortcut = (event: KeyboardEvent) => {
  // Only trigger if Home key is pressed and no input/textarea is focused
  if (
    event.key === 'Home' &&
    !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)
  ) {
    event.preventDefault()
    scrollToTop()

    // Visual feedback - briefly highlight the button even if not visible
    if (!prefersReducedMotion.value) {
      // Temporarily show button for visual feedback
      const wasVisible = isVisible.value
      if (!wasVisible) {
        isVisible.value = true
        setTimeout(() => {
          if (!wasVisible && window.scrollY <= SCROLL_THRESHOLD) {
            isVisible.value = false
          }
        }, uiConfig.scrollToTop.keyboardShortcutFeedbackDurationMs || 600)
      }
    }
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    scrollToTop()
  }
}

const checkReducedMotion = () => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
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

  // Palette's micro-UX enhancement: Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut)

  updateScrollProgress() // Initial check

  // Store cleanup
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('keydown', handleKeyboardShortcut)
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
  transition: stroke-dashoffset
    v-bind('styles.transition.progressRingDurationSec') ease-out;
}

.scroll-to-top__icon {
  position: relative;
  z-index: v-bind('zIndexConfig.floatingLabel');
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

/* Palette's micro-UX enhancement: Hover tooltip showing scroll progress */
.scroll-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: v-bind('zIndexConfig.tooltip');
  pointer-events: none;
}

.scroll-tooltip__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  background: v-bind('themeConfig.scrollToTop.tooltipBg');
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}

.scroll-tooltip__text {
  font-size: 14px;
  font-weight: 700;
  color: v-bind('themeConfig.scrollToTop.tooltipText');
  line-height: 1;
}

.scroll-tooltip__label {
  font-size: 10px;
  font-weight: 500;
  color: v-bind('themeConfig.scrollToTop.tooltipLabel');
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.scroll-tooltip__arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid v-bind('themeConfig.scrollToTop.tooltipBg');
}

/* Reduced motion support for tooltip */
@media (prefers-reduced-motion: reduce) {
  .scroll-tooltip {
    display: none;
  }
}

/* High contrast mode support for tooltip */
@media (prefers-contrast: high) {
  .scroll-tooltip__content {
    border: 2px solid currentColor;
  }
}
</style>
