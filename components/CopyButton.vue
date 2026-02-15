<template>
  <div class="relative inline-flex">
    <Tooltip
      :content="isCopied ? copiedTooltipText : copyTooltipText"
      position="top"
      :delay="tooltipDelayMs"
    >
      <button
        ref="buttonRef"
        type="button"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 relative overflow-hidden',
          isCopied
            ? 'bg-green-100 text-green-700 focus:ring-green-500'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:ring-gray-400',
          { 'animate-focus-pulse': showFocusPulse && !prefersReducedMotion },
        ]"
        :aria-label="isCopied ? copiedAriaLabel : label"
        @click="handleCopyWithRipple"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <!-- Copy Icon -->
        <svg
          v-if="!isCopied"
          xmlns="http://www.w3.org/2000/svg"
          :class="[
            'h-3.5 w-3.5 transition-transform duration-200',
            isHovering && !prefersReducedMotion ? 'animate-icon-wiggle' : '',
          ]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <!-- Checkmark Icon -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-3.5 w-3.5 animate-check-pop"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
            class="checkmark-path"
          />
        </svg>
        <span>{{ isCopied ? copiedButtonText : copyButtonText }}</span>
      </button>
    </Tooltip>

    <!-- Screen reader live region for copy status announcement -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcementText }}
    </div>

    <!-- Palette's micro-UX enhancement: Copy Success Particle Burst ✨
         A delightful burst of particles to celebrate successful copy action -->
    <TransitionGroup
      v-if="showParticles && !prefersReducedMotion"
      tag="div"
      class="copy-particle-container"
      aria-hidden="true"
    >
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="copy-particle"
        :style="{
          '--particle-x': `${particle.x}px`,
          '--particle-y': `${particle.y}px`,
          '--particle-color': particle.color,
          '--particle-size': `${particle.size}px`,
          '--particle-rotation': `${particle.rotation}deg`,
        }"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import Tooltip from './Tooltip.vue'
import { useRipple } from '~/composables/useRipple'
import { animationConfig } from '~/configs/animation.config'
import { contentConfig } from '~/configs/content.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'

interface Props {
  content: string
  label?: string
  copyText?: string
  copiedText?: string
  tooltipDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: contentConfig.copyButton.defaultLabel,
  copyText: contentConfig.copyButton.copy,
  copiedText: contentConfig.copyButton.copied,
  tooltipDelay: animationConfig.tooltip.showDelayMs,
})

const emit = defineEmits<{
  copied: []
}>()

const isCopied = ref(false)
const isHovering = ref(false)
const announcementText = ref('')
const prefersReducedMotion = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

// Palette's micro-UX enhancement: Keyboard focus pulse for accessibility
const showFocusPulse = ref(false)
let focusPulseTimeout: ReturnType<typeof setTimeout> | null = null
const FOCUS_PULSE_DURATION_MS = 600

const handleFocus = () => {
  if (prefersReducedMotion.value) return

  // Clear any existing timeout
  if (focusPulseTimeout) {
    clearTimeout(focusPulseTimeout)
  }

  // Trigger focus pulse animation
  showFocusPulse.value = true

  // Reset after animation completes
  focusPulseTimeout = setTimeout(() => {
    showFocusPulse.value = false
  }, FOCUS_PULSE_DURATION_MS)
}

const handleBlur = () => {
  showFocusPulse.value = false
  if (focusPulseTimeout) {
    clearTimeout(focusPulseTimeout)
    focusPulseTimeout = null
  }
}

// Tooltip text computed from props or config
const copyTooltipText = contentConfig.copyButton.tooltip.copy
const copiedTooltipText = contentConfig.copyButton.tooltip.copied
const copyButtonText = props.copyText
const copiedButtonText = props.copiedText
const copiedAriaLabel = contentConfig.copyButton.aria.copied
const tooltipDelayMs = props.tooltipDelay

// Initialize ripple effect for tactile feedback - Palette's micro-UX touch!
const { createRipple } = useRipple(buttonRef as Ref<HTMLButtonElement | null>, {
  color: animationConfig.ripple.successColor,
  duration: animationConfig.button.feedbackDurationMs,
})

// Palette's micro-UX enhancement: Copy success particle burst state
const showParticles = ref(false)
const particles = ref<
  Array<{
    id: number
    x: number
    y: number
    color: string
    size: number
    rotation: number
  }>
>([])

// Generate particles for copy success celebration
const generateCopyParticles = () => {
  const config = animationConfig.copyParticles
  const count = config.particleCount
  const newParticles = []

  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + Math.random() * 30
    const radians = (angle * Math.PI) / 180
    const distance = config.spreadPx * (0.7 + Math.random() * 0.6)
    const x = Math.cos(radians) * distance
    const y = Math.sin(radians) * distance

    newParticles.push({
      id: Date.now() + i,
      x,
      y,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size:
        config.minSizePx +
        Math.random() * (config.maxSizePx - config.minSizePx),
      rotation: Math.random() * 360,
    })
  }

  return newParticles
}

// Trigger copy success particle burst
const triggerCopyParticleBurst = () => {
  if (prefersReducedMotion.value) return

  particles.value = generateCopyParticles()
  showParticles.value = true

  // Hide particles after animation completes
  setTimeout(() => {
    showParticles.value = false
    particles.value = []
  }, animationConfig.copyParticles.durationMs + animationConfig.copyParticles.fadeDelayMs)
}

// Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
  }
})

const handleCopyWithRipple = async (event: MouseEvent) => {
  // Create ripple effect first - Palette's micro-UX touch!
  createRipple(event)

  await handleCopy()
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    announcementText.value = contentConfig.copyButton.announcement.success
    emit('copied')

    // Haptic feedback for successful copy - Palette's micro-UX touch!
    hapticSuccess()

    // Trigger particle burst for delightful feedback ✨
    triggerCopyParticleBurst()

    // Reset after configured duration
    setTimeout(() => {
      isCopied.value = false
      announcementText.value = ''
    }, animationConfig.copyFeedback.durationMs)
  } catch {
    // Handle clipboard failure gracefully
    announcementText.value = contentConfig.copyButton.announcement.failed

    // Haptic feedback for failed copy
    hapticError()

    // Clear announcement after delay
    setTimeout(() => {
      announcementText.value = ''
    }, animationConfig.copyFeedback.durationMs)
  }
}

// Cleanup on unmount to prevent memory leaks
onUnmounted(() => {
  if (focusPulseTimeout) {
    clearTimeout(focusPulseTimeout)
  }
})
</script>

<style scoped>
@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.animate-check-pop {
  animation: check-pop
    v-bind('animationConfig.copyFeedback.checkPopDurationMs + "ms"') ease-out;
}

/* Icon wiggle animation on hover - Palette's micro-UX delight! */
@keyframes icon-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.animate-icon-wiggle {
  animation: icon-wiggle
    v-bind('animationConfig.copyFeedback.iconWiggleDurationMs + "ms"')
    ease-in-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-check-pop,
  .animate-icon-wiggle {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button {
    border: 2px solid currentColor;
  }
}

/* Palette's micro-UX enhancement: Copy Success Particle Burst Styles ✨ */
.copy-particle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 50;
}

.copy-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--particle-size);
  height: var(--particle-size);
  background: var(--particle-color);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(var(--particle-rotation));
  animation: copy-particle-burst
    v-bind('`${animationConfig.copyParticles.durationMs}ms`') ease-out forwards;
  opacity: 0;
}

@keyframes copy-particle-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  30% {
    opacity: 1;
    transform: translate(
        calc(-50% + var(--particle-x) * 0.5),
        calc(-50% + var(--particle-y) * 0.5)
      )
      scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(
        calc(-50% + var(--particle-x)),
        calc(-50% + var(--particle-y))
      )
      scale(0.2);
  }
}

/* Alternative star-shaped particle variant */
.copy-particle:nth-child(3n) {
  border-radius: 0;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}

/* Alternative diamond-shaped particle variant */
.copy-particle:nth-child(5n) {
  border-radius: 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

/* Reduced motion support for particles */
@media (prefers-reduced-motion: reduce) {
  .copy-particle-container {
    display: none;
  }
}

/* Palette's micro-UX enhancement: Keyboard Focus Pulse Animation ✨
   Provides delightful visual feedback when button receives keyboard focus */
.animate-focus-pulse {
  animation: focus-pulse-ring 600ms ease-out;
}

@keyframes focus-pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Success state focus pulse uses green color */
.bg-green-100.animate-focus-pulse {
  animation: focus-pulse-ring-green 600ms ease-out;
}

@keyframes focus-pulse-ring-green {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
  }
  100% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
}

/* Reduced motion support for focus pulse */
@media (prefers-reduced-motion: reduce) {
  .animate-focus-pulse,
  .bg-green-100.animate-focus-pulse {
    animation: none;
  }
}
</style>
