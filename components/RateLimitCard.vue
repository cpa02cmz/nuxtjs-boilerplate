<template>
  <!--
    Palette's micro-UX enhancement: Rate Limit Card
    - Added ARIA role and labels for screen readers
    - Added haptic feedback on hover for mobile
    - Enhanced focus states for keyboard navigation
    - Added subtle scale animation on hover
  -->
  <div
    ref="cardRef"
    class="rate-limit-card"
    :class="{
      'animate-fade-in': !prefersReducedMotion,
      'is-hovering': isHovering && !prefersReducedMotion,
      'is-focused': isFocused,
    }"
    :style="animationStyle"
    role="region"
    :aria-label="ariaLabel"
    tabindex="0"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    <!-- Palette's micro-UX: Hover glow effect for visual delight -->
    <div
      v-if="!prefersReducedMotion"
      class="card-glow"
      :class="{ 'glow-active': isHovering }"
      aria-hidden="true"
    />

    <div class="flex items-center gap-3 mb-2 relative z-10">
      <div
        class="icon-container"
        :class="[
          iconBgClass,
          { 'icon-pulse': isHovering && !prefersReducedMotion },
        ]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          :class="iconColorClass"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            v-if="type === 'general'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
          <path
            v-else-if="type === 'search'"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <h4 :id="titleId" class="font-semibold text-gray-800 capitalize">
        {{ type }}
      </h4>
    </div>

    <div class="flex items-baseline gap-1 relative z-10">
      <span
        class="text-2xl font-bold text-gray-900"
        :aria-label="`${limit} ${unit}`"
        >{{ limit }}</span
      >
    </div>

    <p
      class="text-sm text-gray-500 mt-1 relative z-10"
      :aria-label="`Rate limit resets ${unit}`"
    >
      {{ unit }}
    </p>

    <!-- Palette's micro-UX: Screen reader announcement for interactions -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { hapticLight } from '~/utils/hapticFeedback'
import { animationConfig } from '~/configs/animation.config'
import { generateId } from '~/utils/generateId'

interface Props {
  type: 'general' | 'search' | 'submission'
  limit: string
  unit: string
  delay?: number
}

const props = defineProps<Props>()

// Palette's micro-UX enhancement: Generate unique ID for accessibility
const titleId = generateId({ prefix: 'rate-limit' })

// Palette's micro-UX enhancement: Track interaction states
const isHovering = ref(false)
const isFocused = ref(false)
const announcement = ref('')
const cardRef = ref<HTMLElement | null>(null)

// BroCula fix: Store media query and handler for cleanup
let mediaQuery: MediaQueryList | null = null
let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null

// Palette's micro-UX enhancement: Computed ARIA label for screen readers
const ariaLabel = computed(() => {
  const typeDescriptions: Record<string, string> = {
    general: 'General API rate limit',
    search: 'Search rate limit',
    submission: 'Submission rate limit',
  }
  return `${typeDescriptions[props.type]}: ${props.limit} requests per ${props.unit}`
})

const iconBgClass = computed(() => {
  const classes = {
    general: 'bg-blue-100',
    search: 'bg-purple-100',
    submission: 'bg-orange-100',
  }
  return classes[props.type]
})

const iconColorClass = computed(() => {
  const classes = {
    general: 'text-blue-600',
    search: 'text-purple-600',
    submission: 'text-orange-600',
  }
  return classes[props.type]
})

// Palette's micro-UX enhancement: Check for reduced motion preference
const prefersReducedMotion = ref(false)
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes - BroCula: Store refs for cleanup!
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQueryHandler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', mediaQueryHandler)
  }
})

// BroCula fix: Clean up event listener to prevent memory leaks
onUnmounted(() => {
  if (mediaQuery && mediaQueryHandler) {
    mediaQuery.removeEventListener('change', mediaQueryHandler)
  }
})

// Flexy hates hardcoded values! Using animationConfig for all durations 🧩
const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    animationDelay: `${props.delay * 100}ms`,
  }
})

// Flexy hates hardcoded CSS durations! Using config values 🧩
const cardTransitionDuration = computed(
  () => animationConfig.rateLimitCard.transitionSec
)
const iconTransitionDuration = computed(
  () => animationConfig.rateLimitCard.iconTransitionSec
)
const iconPulseDuration = computed(
  () => animationConfig.rateLimitCard.iconPulseSec
)
const glowTransitionDuration = computed(
  () => animationConfig.rateLimitCard.glowTransitionSec
)
const fadeInDuration = computed(() => animationConfig.rateLimitCard.fadeInSec)

// Palette's micro-UX enhancement: Interaction handlers with haptic feedback
const handleMouseEnter = () => {
  isHovering.value = true
  // Haptic feedback for mobile users
  hapticLight()
}

const handleMouseLeave = () => {
  isHovering.value = false
}

const handleFocus = () => {
  isFocused.value = true
  // Announce to screen readers
  announcement.value = `Rate limit card focused: ${props.type} ${props.limit} per ${props.unit}`
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)
}

const handleBlur = () => {
  isFocused.value = false
}

// Palette's micro-UX enhancement: Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      // Provide feedback when card is "activated" via keyboard
      event.preventDefault()
      hapticLight()
      break
  }
}
</script>

<style scoped>
/* Palette's micro-UX enhancement: Base card styles with enhanced interactions */
.rate-limit-card {
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  /* Flexy hates hardcoded 0.3s! Using v-bind with animationConfig */
  transition: all v-bind(cardTransitionDuration) cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  outline: none;
  overflow: hidden;
}

/* Palette's micro-UX enhancement: Enhanced hover state */
.rate-limit-card:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

/* Palette's micro-UX enhancement: Scale effect on hover */
.rate-limit-card.is-hovering {
  transform: translateY(-2px) scale(1.02);
}

/* Palette's micro-UX enhancement: Focus state for keyboard navigation */
.rate-limit-card.is-focused,
.rate-limit-card:focus-visible {
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.3),
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

/* Palette's micro-UX enhancement: Icon container with pulse animation */
.icon-container {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Flexy hates hardcoded 0.3s! Using v-bind with animationConfig */
  transition: transform v-bind(iconTransitionDuration) ease-out;
}

/* Palette's micro-UX enhancement: Icon pulse on hover */
.icon-container.icon-pulse {
  /* Flexy hates hardcoded 0.6s! Using v-bind with animationConfig */
  animation: icon-pulse v-bind(iconPulseDuration) ease-in-out;
}

@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

/* Palette's micro-UX enhancement: Glow effect for visual delight */
.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(59, 130, 246, 0.08) 0%,
    transparent 70%
  );
  opacity: 0;
  /* Flexy hates hardcoded 0.3s! Using v-bind with animationConfig */
  transition: opacity v-bind(glowTransitionDuration) ease-out;
  pointer-events: none;
}

.card-glow.glow-active {
  opacity: 1;
}

/* Base fade-in animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
  /* Flexy hates hardcoded 0.4s! Using v-bind with animationConfig */
  animation: fade-in v-bind(fadeInDuration) ease-out forwards;
}

/* Palette's micro-UX enhancement: Screen reader only text */
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

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none !important;
    opacity: 1;
  }

  .rate-limit-card {
    transition: none;
  }

  .rate-limit-card:hover {
    transform: none;
  }

  .rate-limit-card.is-hovering {
    transform: none;
  }

  .icon-container.icon-pulse {
    animation: none;
  }

  .card-glow {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .rate-limit-card {
    border-width: 2px;
  }

  .rate-limit-card.is-focused,
  .rate-limit-card:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
