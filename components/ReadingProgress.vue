<template>
  <div
    class="reading-progress-container"
    role="progressbar"
    :aria-label="ariaLabel"
    :aria-valuenow="Math.round(progress)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="reading-progress-bar"
      :style="{ transform: `scaleX(${progress / 100})` }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
}

const props = withDefaults(defineProps<Props>(), {
  targetSelector: 'main',
  ariaLabel: 'Reading progress',
  color: 'bg-blue-500',
})

// Reactive state
const progress = ref(0)

// Track if component is mounted (to avoid SSR issues)
let isMounted = false

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
</style>
