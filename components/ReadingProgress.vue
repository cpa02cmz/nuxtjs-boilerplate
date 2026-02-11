<template>
  <div
    class="reading-progress-container"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <div
      class="reading-progress-bar"
      :style="{ transform: `scaleX(${progress / 100})` }"
      aria-hidden="true"
    />

    <!-- Progress tooltip -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="showTooltip"
        class="reading-progress-tooltip"
        :style="tooltipStyle"
        role="tooltip"
        aria-hidden="true"
      >
        <span class="tooltip-text">{{ Math.round(progress) }}%</span>
        <div class="tooltip-arrow" />
      </div>
    </Transition>

    <!-- Screen reader announcement for progress changes -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ progressAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

interface Props {
  /**
   * The target element or selector to track scroll progress
   * @default 'main' - tracks the main content area
   */
  targetSelector?: string
  /**
   * Aria label for accessibility
   * @default 'Reading progress'
   */
  ariaLabel?: string
  /**
   * Color of the progress bar
   * @default 'bg-blue-500' - Tailwind blue-500
   */
  color?: string
  /**
   * Enable tooltip on hover
   * @default true
   */
  showTooltipOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  targetSelector: 'main',
  ariaLabel: 'Reading progress',
  color: 'bg-blue-500',
  showTooltipOnHover: true,
})

// Reactive state
const progress = ref(0)
const showTooltip = ref(false)
const tooltipPosition = ref(0)
const lastAnnouncedProgress = ref(0)

// Track if component is mounted (to avoid SSR issues)
let isMounted = false

// Computed tooltip style
const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value}px`,
}))

// Progress announcement state
const progressAnnouncement = ref('')

// Watch for milestone announcements (25% intervals)
watch(progress, newProgress => {
  const currentProgress = Math.round(newProgress)
  const milestone = Math.floor(currentProgress / 25) * 25

  // Only announce when crossing a 25% milestone
  if (milestone > lastAnnouncedProgress.value && milestone <= 100) {
    lastAnnouncedProgress.value = milestone
    progressAnnouncement.value = `${milestone}% reading progress`

    // Clear announcement after screen reader has time to read it
    setTimeout(() => {
      progressAnnouncement.value = ''
    }, 1000)
  }
})

// Calculate scroll progress
const calculateProgress = () => {
  if (typeof window === 'undefined' || !isMounted) return

  const target = document.querySelector(props.targetSelector)
  if (!target) {
    // Fallback: use document scroll
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight
    progress.value = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
    return
  }

  const rect = target.getBoundingClientRect()
  const elementTop = rect.top + window.scrollY
  const elementHeight = rect.height
  const windowHeight = window.innerHeight

  // Calculate how much of the element has been scrolled past
  const scrolled = window.scrollY - elementTop + windowHeight
  const totalScrollable = elementHeight + windowHeight

  if (totalScrollable > 0) {
    progress.value = Math.min(
      100,
      Math.max(0, (scrolled / totalScrollable) * 100)
    )
  } else {
    progress.value = 0
  }
}

// Tooltip event handlers
const handleMouseEnter = () => {
  if (props.showTooltipOnHover) {
    showTooltip.value = true
  }
}

const handleMouseLeave = () => {
  showTooltip.value = false
}

const handleMouseMove = (event: MouseEvent) => {
  if (props.showTooltipOnHover) {
    tooltipPosition.value = event.clientX
  }
}

// Use requestAnimationFrame for smooth updates
let ticking = false
const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      calculateProgress()
      ticking = false
    })
    ticking = true
  }
}

// Lifecycle hooks
onMounted(() => {
  isMounted = true
  // Initial calculation
  calculateProgress()
  // Add scroll listener with passive option for performance
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  isMounted = false
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.reading-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 9999;
  pointer-events: none;
}

.reading-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%);
  background-size: 200% 100%;
  transform-origin: left;
  transition: transform 0.1s ease-out;
  will-change: transform;
}

/* Shimmer animation for the progress bar */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.reading-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-bar {
    transition: none;
  }

  .reading-progress-bar::after {
    animation: none;
    display: none;
  }
}

/* Hide on very short pages */
@media (max-height: 600px) {
  .reading-progress-container {
    display: none;
  }
}

/* Progress tooltip */
.reading-progress-tooltip {
  position: absolute;
  top: 12px;
  transform: translateX(-50%);
  z-index: 10000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tooltip-text {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: tooltip-appear 0.2s ease-out;
}

.tooltip-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #374151;
  margin-top: -1px;
}

@keyframes tooltip-appear {
  0% {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support for tooltip */
@media (prefers-reduced-motion: reduce) {
  .reading-progress-tooltip {
    transition: none;
  }

  .tooltip-text {
    animation: none;
  }
}
</style>
