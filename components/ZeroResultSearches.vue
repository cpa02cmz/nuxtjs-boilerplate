<template>
  <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4">
      {{ contentConfig.search.popular.title }}
    </h3>

    <!-- Search suggestions list with staggered animations -->
    <TransitionGroup
      v-if="zeroResultSearches.length > 0"
      tag="div"
      class="space-y-2"
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slow} ease-out`"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.moderate} ease-in`"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
      :style="staggerStyles"
    >
      <button
        v-for="(search, index) in zeroResultSearches"
        :key="index"
        ref="searchButtons"
        :class="[
          'group w-full text-left p-3 rounded-lg transition-all ease-out flex justify-between items-center relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2',
          animationConfig.tailwindDurations.moderate,
          hoverIndex === index
            ? 'bg-gray-50 shadow-md -translate-y-0.5'
            : 'bg-white hover:bg-gray-50 hover:shadow-sm',
          clickedIndex === index ? 'scale-98' : 'scale-100',
        ]"
        :aria-label="`Try search: ${search.query} (${search.count} attempts)`"
        @click="handleClick(search.query, index, $event)"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
        @keydown="handleKeydown($event, index)"
      >
        <!-- Ripple effect container -->
        <span
          v-if="ripples[index]"
          class="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
          aria-hidden="true"
        >
          <span
            class="absolute rounded-full bg-gray-800 opacity-20 animate-ripple"
            :style="{
              left: `${ripples[index].x}px`,
              top: `${ripples[index].y}px`,
              width: `${ripples[index].size}px`,
              height: `${ripples[index].size}px`,
              transform: 'translate(-50%, -50%) scale(0)',
            }"
          />
        </span>

        <!-- Search query with icon -->
        <div class="flex items-center gap-2 flex-1 min-w-0 z-10">
          <span
            :class="`flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ${animationConfig.tailwindDurations.normal}`"
            aria-hidden="true"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <!-- 🎨 Pallete's micro-UX enhancement: Text Decode Effect - Cyberpunk-style scramble on hover! -->
          <span
            :class="`text-gray-800 truncate group-hover:text-gray-900 transition-colors ${animationConfig.tailwindDurations.normal} font-medium decode-text`"
            :data-original-text="search.query"
            :data-index="index"
            @mouseenter="startTextDecode(index, search.query)"
            @mouseleave="stopTextDecode(index)"
          >
            {{ decodedTexts[index] || search.query }}
          </span>
        </div>

        <!-- Attempt count with animated background -->
        <div class="flex items-center gap-2 z-10">
          <span
            :class="`text-xs font-medium bg-amber-100 text-amber-700 rounded-full px-2.5 py-1 transition-all ${animationConfig.tailwindDurations.standard} group-hover:bg-amber-200`"
          >
            {{ search.count }}
          </span>
          <!-- Arrow indicator on hover -->
          <span
            :class="`text-gray-400 opacity-0 -translate-x-2 transition-all ${animationConfig.tailwindDurations.standard} group-hover:opacity-100 group-hover:translate-x-0`"
            aria-hidden="true"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </button>
    </TransitionGroup>

    <!-- Enhanced empty state with illustration -->
    <!-- Flexy hates hardcoded duration-500 and duration-300! Using animationConfig.tailwindDurations -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.slower} ease-out`"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.standard} ease-in`"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="zeroResultSearches.length === 0"
        class="text-center text-gray-500 py-8 flex flex-col items-center"
      >
        <!-- Animated Illustration Container -->
        <div class="relative w-20 h-20 mb-4" aria-hidden="true">
          <!-- Background Circle with subtle pulse -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"
            :class="{ 'animate-pulse-subtle': !prefersReducedMotion }"
          />

          <!-- Smiley Face Container -->
          <div
            class="absolute inset-0 flex items-center justify-center"
            :class="{ 'animate-bounce-subtle': !prefersReducedMotion }"
          >
            <svg
              class="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Face Circle with Draw Animation -->
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke-width="1.5"
                class="origin-center"
                :class="{ 'animate-draw': !prefersReducedMotion }"
                :style="drawStyles"
              />
              <!-- Left Eye -->
              <circle
                cx="9"
                cy="10"
                r="1"
                fill="currentColor"
                class="opacity-60"
                :class="{ 'animate-fade-in-delayed': !prefersReducedMotion }"
              />
              <!-- Right Eye -->
              <circle
                cx="15"
                cy="10"
                r="1"
                fill="currentColor"
                class="opacity-60"
                :class="{ 'animate-fade-in-delayed': !prefersReducedMotion }"
              />
              <!-- Smile Line with Draw Animation -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 15.172a4 4 0 015.656 0"
                :class="{ 'animate-draw-delayed': !prefersReducedMotion }"
                :style="drawStyles"
              />
            </svg>
          </div>

          <!-- Floating Decorative Elements - Palette's visual delight! -->
          <div
            v-if="!prefersReducedMotion"
            class="absolute top-2 right-2 w-2 h-2 bg-gray-300 rounded-full animate-float"
          />
          <div
            v-if="!prefersReducedMotion"
            class="absolute bottom-4 left-3 w-1.5 h-1.5 bg-gray-300 rounded-full animate-float-delayed"
          />
        </div>

        <p class="text-sm font-medium">
          {{ contentConfig.search.popular.empty }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Great! No searches without results
        </p>
      </div>
    </Transition>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedResourceSearch } from '~/composables/useAdvancedResourceSearch'
import { useResourceData } from '~/composables/useResourceData'
import { contentConfig } from '~/configs/content.config'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { triggerHaptic } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: limitsConfig.search.defaultZeroResultLimit,
})

const emit = defineEmits<{
  'search-select': [query: string]
}>()

const { resources } = useResourceData()
const { getZeroResultSearches } = useAdvancedResourceSearch(resources.value)

// Reactive state
const hoverIndex = ref<number | null>(null)
const clickedIndex = ref<number | null>(null)
const ripples = ref<{ [key: number]: { x: number; y: number; size: number } }>(
  {}
)
const announcement = ref('')
const searchButtons = ref<HTMLButtonElement[]>([])
const prefersReducedMotion = ref(false)
// 🎨 Pallete's micro-UX enhancement: Text decode effect state
const decodedTexts = ref<{ [key: number]: string }>({})
const textDecodeIntervals = ref<{
  [key: number]: ReturnType<typeof setInterval> | null
}>({})

const zeroResultSearches = computed(() => {
  return getZeroResultSearches(props.limit)
})

// Staggered animation styles - Palette's micro-UX enhancement!
const staggerStyles = computed(() => ({
  '--stagger-delay': `${animationConfig.popularSearches.staggerDelayMs}ms`,
}))

// Draw animation styles for SVG icon - Palette's delightful enhancement!
const drawStyles = computed(() => ({
  strokeDasharray: '60',
  strokeDashoffset: '60',
}))

// Check for reduced motion preference - Palette cares about accessibility!
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = mediaQuery.matches
}

// Handle click with ripple effect - Palette's delightful micro-interaction!
const handleClick = (query: string, index: number, event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 1.5

  ripples.value[index] = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    size,
  }

  // Click feedback animation
  clickedIndex.value = index
  setTimeout(() => {
    clickedIndex.value = null
  }, uiTimingConfig.clickFeedback.resetDelay)

  // Haptic feedback - BroCula fix: Use triggerHaptic to check user interaction
  if (!prefersReducedMotion.value) {
    triggerHaptic('light')
  }

  // Announce for screen readers
  announcement.value = `Trying search: ${query}`
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.announcementDuration)

  // Remove ripple after animation
  setTimeout(() => {
    delete ripples.value[index]
  }, uiTimingConfig.ripple.removalDelay)

  emit('search-select', query)
}

// Hover handlers
const handleMouseEnter = (index: number) => {
  hoverIndex.value = index
}

const handleMouseLeave = () => {
  hoverIndex.value = null
}

// Enhanced keyboard navigation - Palette cares about accessibility!
const handleKeydown = (event: KeyboardEvent, currentIndex: number) => {
  const buttons = searchButtons.value
  if (!buttons.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (currentIndex < buttons.length - 1) {
        buttons[currentIndex + 1]?.focus()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (currentIndex > 0) {
        buttons[currentIndex - 1]?.focus()
      }
      break
    case 'Home':
      event.preventDefault()
      buttons[0]?.focus()
      break
    case 'End':
      event.preventDefault()
      buttons[buttons.length - 1]?.focus()
      break
  }
}

// 🎨 Pallete's micro-UX enhancement: Text Decode Effect - Cyberpunk-style scramble!
// Scrambles characters through random symbols before revealing the original text
const startTextDecode = (index: number, originalText: string) => {
  if (prefersReducedMotion.value) return

  const config = animationConfig.zeroResultSearches.textDecode
  const duration = config.durationMs
  const frameInterval = config.frameIntervalMs
  const scrambleChars = config.scrambleChars

  let frame = 0
  const totalFrames = Math.floor(duration / frameInterval)

  // Clear any existing interval for this index
  if (textDecodeIntervals.value[index]) {
    clearInterval(textDecodeIntervals.value[index]!)
  }

  // Start the decode animation
  textDecodeIntervals.value[index] = setInterval(() => {
    frame++
    const progress = frame / totalFrames

    // Calculate how many characters should be revealed
    const revealedLength = Math.floor(progress * originalText.length)

    // Build the decoded text
    let result = ''
    for (let i = 0; i < originalText.length; i++) {
      if (i < revealedLength) {
        // Character is revealed
        result += originalText[i]
      } else if (originalText[i] === ' ') {
        // Keep spaces as spaces
        result += ' '
      } else {
        // Scramble this character
        const randomChar =
          scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        result += randomChar
      }
    }

    decodedTexts.value[index] = result

    // Animation complete
    if (frame >= totalFrames) {
      decodedTexts.value[index] = originalText
      if (textDecodeIntervals.value[index]) {
        clearInterval(textDecodeIntervals.value[index]!)
        textDecodeIntervals.value[index] = null
      }
    }
  }, frameInterval)
}

// Stop the text decode animation and restore original text
const stopTextDecode = (index: number) => {
  if (textDecodeIntervals.value[index]) {
    clearInterval(textDecodeIntervals.value[index]!)
    textDecodeIntervals.value[index] = null
  }
  decodedTexts.value[index] = ''
}

// Store mediaQuery reference for cleanup
let mediaQueryRef: MediaQueryList | null = null

// Lifecycle
onMounted(() => {
  checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryRef.addEventListener('change', checkReducedMotion)
  }
})

onUnmounted(() => {
  if (mediaQueryRef) {
    mediaQueryRef.removeEventListener('change', checkReducedMotion)
    mediaQueryRef = null
  }
  // 🎨 Pallete's micro-UX: Clean up text decode intervals to prevent memory leaks
  Object.values(textDecodeIntervals.value).forEach(interval => {
    if (interval) clearInterval(interval)
  })
  textDecodeIntervals.value = {}
})
</script>

<style scoped>
/* Staggered entrance animation - Palette's micro-UX enhancement! */
/* Issue #2752: GPU acceleration for smooth 60fps animations */
.space-y-2 > * {
  animation: stagger-entrance
    v-bind('animationConfig.zeroResultSearches.staggerDurationSec') ease-out
    backwards;
  animation-delay: calc(var(--stagger-delay) * var(--index, 0));
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.space-y-2 > *:nth-child(1) {
  --index: 0;
}
.space-y-2 > *:nth-child(2) {
  --index: 1;
}
.space-y-2 > *:nth-child(3) {
  --index: 2;
}
.space-y-2 > *:nth-child(4) {
  --index: 3;
}
.space-y-2 > *:nth-child(5) {
  --index: 4;
}
.space-y-2 > *:nth-child(6) {
  --index: 5;
}
.space-y-2 > *:nth-child(7) {
  --index: 6;
}
.space-y-2 > *:nth-child(8) {
  --index: 7;
}
.space-y-2 > *:nth-child(9) {
  --index: 8;
}
.space-y-2 > *:nth-child(10) {
  --index: 9;
}

@keyframes stagger-entrance {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Ripple animation - Palette's delightful micro-interaction! */
@keyframes ripple {
  to {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple
    v-bind('animationConfig.zeroResultSearches.rippleDurationSec') ease-out
    forwards;
  /* Issue #2752: GPU acceleration for ripple effect */
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Subtle pulse for empty state icon */
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle
    v-bind('animationConfig.zeroResultSearches.subtlePulseDurationSec')
    ease-in-out infinite;
}

/* Scale 98 for click feedback */
.scale-98 {
  transform: scale(0.98);
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

/* SVG Draw Animation - Palette's delightful enhancement! */
.animate-draw {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: draw-animation
    v-bind('animationConfig.zeroResultSearches.drawDurationSec')
    v-bind('animationConfig.zeroResultSearches.drawEasing') forwards;
}

.animate-draw-delayed {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-animation
    v-bind('animationConfig.zeroResultSearches.drawDurationSec')
    v-bind('animationConfig.zeroResultSearches.drawEasing') forwards;
  animation-delay: v-bind('animationConfig.zeroResultSearches.drawDelaySec');
}

@keyframes draw-animation {
  to {
    stroke-dashoffset: 0;
  }
}

/* Fade In Delayed Animation */
.animate-fade-in-delayed {
  opacity: 0;
  animation: fade-in-delayed
    v-bind('animationConfig.zeroResultSearches.fadeInDurationSec + "s"')
    ease-out forwards;
  animation-delay: v-bind('animationConfig.zeroResultSearches.drawDelaySec');
}

@keyframes fade-in-delayed {
  to {
    opacity: 0.6;
  }
}

/* Subtle Bounce Animation */
.animate-bounce-subtle {
  animation: bounce-subtle
    v-bind('animationConfig.zeroResultSearches.floatDurationSec') ease-in-out
    infinite;
}

@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Floating Animation - Palette's visual delight! */
.animate-float {
  animation: float v-bind('animationConfig.zeroResultSearches.floatDurationSec')
    ease-in-out infinite;
}

.animate-float-delayed {
  animation: float v-bind('animationConfig.zeroResultSearches.floatDurationSec')
    ease-in-out infinite;
  animation-delay: v-bind('animationConfig.zeroResultSearches.floatDelaySec');
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(
      v-bind('animationConfig.zeroResultSearches.floatDistance')
    );
  }
}

/* Spring Physics Hover - satisfying tactile feedback! */
.group {
  transition:
    transform v-bind('animationConfig.zeroResultSearches.springDurationSec')
      v-bind('animationConfig.zeroResultSearches.springEasing'),
    box-shadow v-bind('animationConfig.zeroResultSearches.springDurationSec')
      v-bind('animationConfig.zeroResultSearches.springEasing'),
    background-color v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .space-y-2 > * {
    animation: none;
  }

  .animate-pulse-subtle {
    animation: none;
    opacity: 1;
  }

  .animate-ripple {
    animation: none;
    opacity: 0;
  }

  .animate-draw,
  .animate-draw-delayed {
    stroke-dasharray: none;
    stroke-dashoffset: 0;
    animation: none;
  }

  .animate-fade-in-delayed {
    animation: none;
    opacity: 0.6;
  }

  .animate-bounce-subtle {
    animation: none;
  }

  .animate-float,
  .animate-float-delayed {
    animation: none;
  }

  .group {
    transition: none;
  }
}
</style>
