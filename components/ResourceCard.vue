<template>
  <!--
    🎨 Pallete's micro-UX enhancement: Entrance animation wrapper
    Creates delightful cascading effect when cards appear in lists
    - Staggered animations based on card index
    - Respects reduced motion preferences
    - Smooth entrance with scale and translate effects
  -->
  <!--
    🎨 Pallete's micro-UX enhancement: 3D Hover Tilt Effect
    Adds subtle parallax depth when hovering over cards
    - Mouse-tracking 3D rotation for tactile feedback
    - Dynamic gradient shine that follows cursor
    - Respects reduced motion preferences
    - Fully configurable via animation.config.ts
  -->
  <div
    ref="cardContainerRef"
    :class="[
      'resource-card-entrance',
      {
        'is-visible': isVisible || prefersReducedMotion,
        'is-animated': !prefersReducedMotion && isVisible,
        'is-tilted': isHovering && !prefersReducedMotion,
      },
    ]"
    :style="[entranceStyle, tiltStyle]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <!-- 🎨 Pallete's micro-UX: Dynamic gradient shine overlay -->
    <div
      v-if="isHovering && !prefersReducedMotion"
      class="card-shine-overlay"
      :style="shineStyle"
      aria-hidden="true"
    />
    <ResourceCardBase
      :id="id"
      :title="title"
      :description="description"
      :benefits="benefits"
      :url="url"
      :category="category"
      :icon="icon"
      :new-tab="newTab"
      :button-label="buttonLabel"
      :highlighted-title="highlightedTitle"
      :highlighted-description="highlightedDescription"
      :search-query="searchQuery"
      :similarity-score="similarityScore"
      :similarity-reason="similarityReason"
      :status="status"
      :health-score="healthScore"
      :date-added="dateAdded"
      @visited="handleVisited"
      @error="handleError"
    >
      <template #actions>
        <ResourceCardActions
          :id="id"
          :title="title"
          :description="description"
          :url="url"
          :category="category"
          :benefits="benefits"
          :date-added="dateAdded"
        />
      </template>
    </ResourceCardBase>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ResourceCardBase from './ResourceCard/ResourceCardBase.vue'
import ResourceCardActions from './ResourceCard/ResourceCardActions.vue'
import { uiConfig } from '~/configs/ui.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexScale } from '~/configs/z-index.config'

interface Props {
  title: string
  description: string
  benefits: string[]
  url: string
  id?: string
  category?: string
  icon?: string
  newTab?: boolean
  buttonLabel?: string
  highlightedTitle?: string
  highlightedDescription?: string
  searchQuery?: string
  similarityScore?: number
  similarityReason?: string
  status?: string
  healthScore?: number
  dateAdded?: string
  /**
   * 🎨 Pallete's micro-UX: Index for staggered entrance animations
   * Determines the delay before this card animates in
   * @default 0
   */
  index?: number
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  category: 'unknown',
  newTab: true,
  buttonLabel: uiConfig.resourceCard.defaultButtonLabel,
  highlightedTitle: undefined,
  highlightedDescription: undefined,
  icon: undefined,
  searchQuery: '',
  status: 'active',
  healthScore: undefined,
  similarityScore: undefined,
  similarityReason: undefined,
  dateAdded: undefined,
  index: 0,
})

const emit = defineEmits<{
  (e: 'visited', id: string): void
  (e: 'error', error: Error): void
}>()

// 🎨 Pallete's micro-UX: Entrance animation state
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
const cardContainerRef = ref<HTMLDivElement | null>(null)

// 🎨 Pallete's micro-UX enhancement: 3D Hover Tilt Effect state
const isHovering = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const shineX = ref(50)
const shineY = ref(50)
const isTiltActive = ref(false)
let tiltRAF: number | null = null

// 🎨 Pallete's micro-UX: Calculate tilt based on mouse position
const calculateTilt = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const mouseX = event.clientX - centerX
  const mouseY = event.clientY - centerY

  // Get config values (with fallbacks)
  const maxTilt = animationConfig.resourceCard.tilt?.maxTiltDeg ?? 10
  const perspective = animationConfig.resourceCard.tilt?.perspectivePx ?? 1000

  // Calculate tilt angles (-maxTilt to +maxTilt)
  const rotateX = (mouseY / (rect.height / 2)) * -maxTilt
  const rotateY = (mouseX / (rect.width / 2)) * maxTilt

  return {
    rotateX: Math.max(-maxTilt, Math.min(maxTilt, rotateX)),
    rotateY: Math.max(-maxTilt, Math.min(maxTilt, rotateY)),
    perspective,
  }
}

// 🎨 Pallete's micro-UX: Calculate shine gradient position
const calculateShine = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  return { x, y }
}

// 🎨 Pallete's micro-UX: Mouse event handlers with RAF for smooth performance
const handleMouseEnter = () => {
  if (prefersReducedMotion.value) return
  isHovering.value = true
  isTiltActive.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
  // Reset tilt smoothly
  if (tiltRAF) {
    cancelAnimationFrame(tiltRAF)
  }
  const resetTilt = () => {
    if (!isHovering.value) {
      tiltX.value = tiltX.value * 0.9
      tiltY.value = tiltY.value * 0.9
      if (Math.abs(tiltX.value) > 0.1 || Math.abs(tiltY.value) > 0.1) {
        tiltRAF = requestAnimationFrame(resetTilt)
      } else {
        tiltX.value = 0
        tiltY.value = 0
        isTiltActive.value = false
      }
    }
  }
  resetTilt()
}

const handleMouseMove = (event: MouseEvent) => {
  if (
    !isHovering.value ||
    !cardContainerRef.value ||
    prefersReducedMotion.value
  )
    return

  if (tiltRAF) {
    cancelAnimationFrame(tiltRAF)
  }

  tiltRAF = requestAnimationFrame(() => {
    if (!cardContainerRef.value) return
    const tilt = calculateTilt(event, cardContainerRef.value)
    const shine = calculateShine(event, cardContainerRef.value)

    tiltX.value = tilt.rotateX
    tiltY.value = tilt.rotateY
    shineX.value = shine.x
    shineY.value = shine.y
  })
}

// 🎨 Pallete's micro-UX: Computed tilt styles
const tiltStyle = computed(() => {
  if (prefersReducedMotion.value || !isTiltActive.value) {
    return {}
  }

  const perspective = animationConfig.resourceCard.tilt?.perspectivePx ?? 1000
  const scale = animationConfig.resourceCard.tilt?.hoverScale ?? 1.02

  return {
    transform: `
      perspective(${perspective}px)
      rotateX(${tiltX.value}deg)
      rotateY(${tiltY.value}deg)
      scale3d(${scale}, ${scale}, ${scale})
    `,
    // Flexy hates hardcoded 0.1s and 0.3s! Using animationConfig.cssTransitions
    transition: isHovering.value
      ? `transform ${animationConfig.cssTransitions.fastSec} ease-out`
      : `transform ${animationConfig.cssTransitions.standardSec} ease-out`,
    // BugFixer: Fixed TypeScript error - transformStyle needs literal type
    transformStyle: 'preserve-3d' as const,
  }
})

// 🎨 Pallete's micro-UX: Computed shine gradient styles
const shineStyle = computed(() => {
  const opacity = animationConfig.resourceCard.tilt?.shineOpacity ?? 0.15

  return {
    background: `radial-gradient(
      circle at ${shineX.value}% ${shineY.value}%,
      rgba(255, 255, 255, ${opacity}) 0%,
      rgba(255, 255, 255, 0) 60%
    )`,
    opacity: isHovering.value ? 1 : 0,
    // Flexy hates hardcoded 0.3s! Using animationConfig.cssTransitions.standardSec
    transition: `opacity ${animationConfig.cssTransitions.standardSec} ease-out`,
  }
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Calculate staggered delay based on index
const staggerDelayMs = computed(() => {
  const config = animationConfig.resourceCard.entrance
  const delay = props.index * config.staggerMs
  // Cap the maximum delay to prevent excessive waiting
  return Math.min(delay, config.maxStaggerMs)
})

// Entrance animation style
const entranceStyle = computed(() => {
  // If reduced motion is preferred, no animation needed
  if (prefersReducedMotion.value) {
    return {}
  }

  const config = animationConfig.resourceCard.entrance

  return {
    '--entrance-duration': `${config.durationMs}ms`,
    '--entrance-delay': `${staggerDelayMs.value}ms`,
    '--entrance-easing': config.easing,
    '--entrance-start-scale': config.startScale,
    '--entrance-start-translate': `${config.startTranslateYPx}px`,
  }
})

// Event handlers
const handleVisited = (id: string) => {
  emit('visited', id)
}

const handleError = (error: Error) => {
  emit('error', error)
}

// 🎨 Pallete's micro-UX: Intersection Observer for entrance animation
// Only animate when card comes into viewport
let intersectionObserver: IntersectionObserver | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // If reduced motion is preferred, show immediately without animation
  if (prefersReducedMotion.value) {
    isVisible.value = true
    return
  }

  // Use IntersectionObserver to trigger animation when card enters viewport
  if (
    cardContainerRef.value &&
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window
  ) {
    intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add a small base delay even for the first card for smoother UX
            // Flexy hates hardcoded 50! Using animationConfig.card.firstCardBaseDelayMs
            const baseDelay =
              props.index === 0 ? animationConfig.card.firstCardBaseDelayMs : 0
            setTimeout(() => {
              isVisible.value = true
            }, baseDelay)
            // Disconnect after triggering to prevent re-animation
            intersectionObserver?.disconnect()
          }
        })
      },
      {
        // Flexy hates hardcoded 0.1! Using uiConfig.intersectionObserver.threshold
        threshold: uiConfig.intersectionObserver.threshold,
        // Flexy hates hardcoded 50px! Using animationConfig.card.intersectionRootMarginPx
        rootMargin: `${animationConfig.card.intersectionRootMarginPx}px 0px`,
      }
    )
    intersectionObserver.observe(cardContainerRef.value)
  } else {
    // Fallback: show immediately if observer not available
    isVisible.value = true
  }
})

onUnmounted(() => {
  if (intersectionObserver) {
    intersectionObserver.disconnect()
  }
  // 🎨 Pallete's micro-UX: Clean up tilt RAF to prevent memory leaks
  if (tiltRAF) {
    cancelAnimationFrame(tiltRAF)
  }
})
</script>

<style scoped>
/* 🎨 Pallete's micro-UX: Entrance animation styles */
.resource-card-entrance {
  opacity: 0;
  transform: scale(var(--entrance-start-scale, 0.95))
    translateY(var(--entrance-start-translate, 20px));
  transition:
    opacity var(--entrance-duration, 400ms)
      var(--entrance-easing, cubic-bezier(0.16, 1, 0.3, 1))
      var(--entrance-delay, 0ms),
    transform var(--entrance-duration, 400ms)
      var(--entrance-easing, cubic-bezier(0.16, 1, 0.3, 1))
      var(--entrance-delay, 0ms);
  will-change: opacity, transform;
}

/* Visible state */
.resource-card-entrance.is-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .resource-card-entrance {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* 🎨 Pallete's micro-UX enhancement: 3D Hover Tilt Effect styles */
.resource-card-entrance {
  position: relative;
  transform-style: preserve-3d;
}

/* Shine overlay for dynamic lighting effect */
.card-shine-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Flexy hates hardcoded z-index: 1! Using zIndexScale */
  z-index: v-bind('zIndexScale.low[1]');
  border-radius: inherit;
}

/* Enhanced hover state with smooth transitions */
.resource-card-entrance.is-tilted {
  /* Flexy hates hardcoded z-index: 10! Using zIndexScale */
  z-index: v-bind('zIndexScale.low[10]');
}

/* Ensure child elements maintain 3D context */
.resource-card-entrance :deep(*) {
  transform-style: preserve-3d;
}
</style>
