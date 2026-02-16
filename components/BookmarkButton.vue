<template>
  <div class="relative">
    <Tooltip
      :content="
        isBookmarked
          ? contentConfig.bookmarkButton.tooltip.remove
          : contentConfig.bookmarkButton.tooltip.add
      "
      position="top"
    >
      <button
        ref="buttonRef"
        :class="[
          'flex items-center justify-center w-10 h-10 rounded-full',
          `transition-all ${transitionClass} ease-out`,
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500',
          'active:scale-95 relative overflow-hidden',
          isBookmarked
            ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100 bookmarked'
            : 'text-gray-600 hover:text-yellow-500 hover:bg-gray-100',
          isAnimating && 'animate-bounce-scale',
        ]"
        :aria-label="
          isBookmarked
            ? contentConfig.bookmarkButton.aria.remove
            : contentConfig.bookmarkButton.aria.add
        "
        :aria-pressed="isBookmarked"
        @click="handleBookmarkToggleWithRipple"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="[
            `w-5 h-5 transition-transform ${transitionClass}`,
            isBookmarked ? 'fill-current' : 'stroke-current',
            isAnimating && 'animate-heart-pop',
          ]"
          :stroke-width="isBookmarked ? '0' : '1.5'"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="iconsConfig.svg.bookmark"
          />
        </svg>
      </button>
    </Tooltip>

    <!-- Particle Burst Effect - Palette's delightful micro-UX touch! -->
    <TransitionGroup
      v-if="showParticles && !prefersReducedMotion"
      tag="div"
      class="particle-container"
      aria-hidden="true"
    >
      <span
        v-for="particle in particles"
        :key="particle.id"
        class="particle"
        :style="{
          '--particle-x': `${particle.x}px`,
          '--particle-y': `${particle.y}px`,
          '--particle-color': particle.color,
          '--particle-size': `${particle.size}px`,
          '--particle-duration': `${particleConfig.durationSec}s`,
          '--particle-fade-delay': `${particleConfig.fadeDelaySec}s`,
          '--particle-rotation': `${particle.rotation}deg`,
        }"
      />
    </TransitionGroup>

    <!-- Newly Added Pulse Ring - Palette's micro-UX delight! 🎨
         Shows a subtle pulse when bookmark is first added to help users locate it -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-50"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-150"
    >
      <div
        v-if="isNewlyAdded && !prefersReducedMotion"
        class="newly-added-pulse-ring"
        aria-hidden="true"
      />
    </Transition>

    <div
      :id="`bookmark-announcement-${resourceId}`"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ bookmarkStatus }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookmarks } from '~/composables/useBookmarks'
import { useRipple } from '~/composables/useRipple'
import { useNuxtApp } from '#imports'
import { computed, ref, onUnmounted, type Ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { iconsConfig } from '~/configs/icons.config'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'
import { zIndexScale } from '~/configs/z-index.config'

interface Props {
  resourceId?: string
  title?: string
  description?: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  resourceId: '',
  title: '',
  description: '',
  url: '',
})

const { isBookmarked: checkBookmarked, toggleBookmark } = useBookmarks()

const isBookmarked = computed(() =>
  props.resourceId ? checkBookmarked(props.resourceId) : false
)

// Flexy hates hardcoded values! Using config-based transition classes
const transitionClass = computed(() => animationConfig.transition.normal.class)

// Flexy hates hardcoded rgba! Using configurable amber color
const amberColor = computed(() => componentColorsConfig.common.amber[400])

const bookmarkStatus = ref('')
const isAnimating = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

// Particle burst state - Palette's delightful micro-UX touch!
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

// Check for reduced motion preference
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

// Particle configuration from animation config
const particleConfig = computed(() => animationConfig.bookmark.particleBurst)

// Timeout refs for cleanup - preventing memory leaks (Issue #1826)
let animationTimeout: ReturnType<typeof setTimeout> | null = null
let statusTimeout: ReturnType<typeof setTimeout> | null = null
let particleTimeout: ReturnType<typeof setTimeout> | null = null
let newlyAddedTimeout: ReturnType<typeof setTimeout> | null = null

// Palette's micro-UX enhancement: Track newly added state for visual feedback
const isNewlyAdded = ref(false)
// Flexy hates hardcoded 2000! Using configurable animation config
const NEWLY_ADDED_DURATION_MS =
  animationConfig.bookmark?.newlyAdded?.displayDurationMs ?? 2000

// Initialize ripple effect for tactile feedback
// Flexy loves modularity! Using configurable animation duration from animationConfig
const { createRipple } = useRipple(buttonRef as Ref<HTMLButtonElement | null>, {
  color: animationConfig.ripple.bookmarkColor,
  duration: animationConfig.button.feedbackDurationMs,
})

// Flexy hates hardcoded values! Using configurable animation durations.
const { heartPopDurationMs, statusClearDelayMs } = animationConfig.bookmark

// Get toast notification system
const { $toast } = useNuxtApp()

// Generate random particles for burst effect - Palette's delightful micro-UX touch!
const generateParticles = () => {
  const config = particleConfig.value
  const count = config.enabled ? config.particleCount : 0
  const newParticles = []

  for (let i = 0; i < count; i++) {
    const angle =
      (360 / count) * i + Math.random() * (config.angleRandomnessDeg || 30)
    const radians = (angle * Math.PI) / 180
    const distance =
      config.spreadPx *
      ((config.distanceVariationMin || 0.7) +
        Math.random() *
          ((config.distanceVariationMax || 1.3) -
            (config.distanceVariationMin || 0.7)))
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

// Trigger particle burst animation
const triggerParticleBurst = () => {
  // Check reduced motion preference
  if (checkReducedMotion()) {
    prefersReducedMotion.value = true
    return
  }

  prefersReducedMotion.value = false

  // Don't show particles if disabled
  if (!particleConfig.value.enabled) return

  // Generate and show particles
  particles.value = generateParticles()
  showParticles.value = true

  // Clear any existing timeout
  if (particleTimeout) clearTimeout(particleTimeout)

  // Hide particles after animation completes
  const totalDuration =
    (particleConfig.value.durationSec + particleConfig.value.fadeDelaySec) *
    1000
  particleTimeout = setTimeout(() => {
    showParticles.value = false
    particles.value = []
  }, totalDuration)
}

const handleBookmarkToggle = () => {
  const wasBookmarked = isBookmarked.value

  // Trigger animation when adding bookmark - tracked for cleanup (Issue #1826)
  if (!wasBookmarked) {
    isAnimating.value = true
    if (animationTimeout) clearTimeout(animationTimeout)
    animationTimeout = setTimeout(() => {
      isAnimating.value = false
    }, heartPopDurationMs)
    // Haptic feedback for adding bookmark
    hapticSuccess()
    // Trigger particle burst for delightful feedback - Palette's micro-UX touch!
    triggerParticleBurst()
    // Show toast notification for better UX
    $toast.success(
      contentConfig.bookmarkButton.toast.added.replace('{{title}}', props.title)
    )
    // Palette's micro-UX enhancement: Show newly added pulse ring
    // Helps users locate their newly saved items
    isNewlyAdded.value = true
    if (newlyAddedTimeout) clearTimeout(newlyAddedTimeout)
    newlyAddedTimeout = setTimeout(() => {
      isNewlyAdded.value = false
    }, NEWLY_ADDED_DURATION_MS)
  } else {
    // Light haptic for removing bookmark
    hapticLight()
    // Show toast notification for better UX
    $toast.info(
      contentConfig.bookmarkButton.toast.removed.replace(
        '{{title}}',
        props.title
      )
    )
    // Clear newly added state when bookmark is removed
    isNewlyAdded.value = false
    if (newlyAddedTimeout) {
      clearTimeout(newlyAddedTimeout)
      newlyAddedTimeout = null
    }
  }

  toggleBookmark({
    id: props.resourceId,
    title: props.title,
    description: props.description,
    url: props.url,
  })

  bookmarkStatus.value = wasBookmarked
    ? contentConfig.bookmarkButton.status.removed
    : contentConfig.bookmarkButton.status.added

  // Tracked for cleanup - preventing memory leaks (Issue #1826)
  if (statusTimeout) clearTimeout(statusTimeout)
  statusTimeout = setTimeout(() => {
    bookmarkStatus.value = ''
  }, statusClearDelayMs)
}

// Cleanup timeouts on unmount - preventing memory leaks (Issue #1826)
onUnmounted(() => {
  if (animationTimeout) clearTimeout(animationTimeout)
  if (statusTimeout) clearTimeout(statusTimeout)
  if (particleTimeout) clearTimeout(particleTimeout)
  if (newlyAddedTimeout) clearTimeout(newlyAddedTimeout)
})

// Handle click with ripple effect - Palette's micro-UX touch!
const handleBookmarkToggleWithRipple = (event: MouseEvent) => {
  // Create ripple effect first
  createRipple(event)

  // Then handle the bookmark toggle
  handleBookmarkToggle()
}
</script>

<style scoped>
/* Bookmarked state pulse animation - Flexy hates hardcoded values! */
.bookmarked {
  animation: subtle-pulse
    v-bind('`${animationConfig?.bookmark?.pulseDurationSec ?? 2}s`') ease-in-out
    infinite;
}

@keyframes subtle-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0
      rgba(
        v-bind('amberColor'),
        v-bind('animationConfig?.bookmark?.pulseShadow?.startOpacity ?? 0.3')
      );
  }
  50% {
    box-shadow: 0 0 0
      v-bind('`${animationConfig?.bookmark?.pulseShadow?.endSpread ?? 8}px`')
      rgba(v-bind('amberColor'), 0);
  }
}

/* Heart pop animation when bookmarking */
.animate-heart-pop {
  animation: heart-pop
    v-bind('`${animationConfig?.bookmark?.heartPopDurationMs ?? 400}ms`')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig?.bookmark?.heartPopScale ?? 1.3'));
  }
  100% {
    transform: scale(1);
  }
}

/* Bounce scale animation for button */
.animate-bounce-scale {
  animation: bounce-scale
    v-bind('`${animationConfig?.bookmark?.bounceScaleDurationMs ?? 400}ms`')
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes bounce-scale {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(
      v-bind('animationConfig?.bookmark?.bounceScale?.shrink ?? 0.9')
    );
  }
  80% {
    transform: scale(
      v-bind('animationConfig?.bookmark?.bounceScale?.expand ?? 1.1')
    );
  }
  100% {
    transform: scale(1);
  }
}

/* Particle Burst Animation - Palette's delightful micro-UX touch! */
.particle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: v-bind('zIndexScale.low[10]');
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--particle-size);
  height: var(--particle-size);
  background: var(--particle-color);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(var(--particle-rotation));
  animation: particle-burst var(--particle-duration) ease-out forwards;
  animation-delay: v-bind('animationConfig.cssAnimations.zeroDelaySec');
  opacity: 0;
}

@keyframes particle-burst {
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
.particle:nth-child(3n) {
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
.particle:nth-child(5n) {
  border-radius: 0;
  transform: translate(-50%, -50%) rotate(45deg);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .bookmarked {
    animation: none;
  }

  .animate-heart-pop,
  .animate-bounce-scale {
    animation: none;
  }

  .particle-container {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .particle {
    background: currentColor;
  }
}

/* Palette's micro-UX enhancement: Newly Added Pulse Ring 🎨
   A subtle expanding ring that helps users locate newly bookmarked items */
.newly-added-pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: v-bind(
    '`${animationConfig?.bookmark?.newlyAdded?.ringSizePx ?? 56}px`'
  );
  height: v-bind(
    '`${animationConfig?.bookmark?.newlyAdded?.ringSizePx ?? 56}px`'
  );
  border-radius: 50%;
  border: v-bind(
      '`${animationConfig?.bookmark?.newlyAdded?.ringWidthPx ?? 3}px`'
    )
    solid v-bind('componentColorsConfig?.common?.amber?.[400] ?? "#fbbf24"');
  pointer-events: none;
  z-index: v-bind('zIndexScale?.low?.[5] ?? 5');
  animation: newly-added-pulse
    v-bind(
      '`${animationConfig?.bookmark?.newlyAdded?.pulseDurationMs ?? 600}ms`'
    )
    v-bind(
      'easingConfig?.cubicBezier?.decelerate ?? "cubic-bezier(0, 0, 0.2, 1)"'
    );
}

@keyframes newly-added-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: v-bind('animationConfig?.bookmark?.newlyAdded?.startOpacity ?? 1');
    border-width: v-bind(
      '`${animationConfig?.bookmark?.newlyAdded?.ringWidthPx ?? 3}px`'
    );
  }
  50% {
    opacity: v-bind('animationConfig?.bookmark?.newlyAdded?.midOpacity ?? 0.6');
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
    border-width: v-bind(
      '`${(animationConfig?.bookmark?.newlyAdded?.ringWidthPx ?? 3) / 2}px`'
    );
  }
}

/* Reduced motion support for newly added pulse */
@media (prefers-reduced-motion: reduce) {
  .newly-added-pulse-ring {
    display: none;
  }
}
</style>
