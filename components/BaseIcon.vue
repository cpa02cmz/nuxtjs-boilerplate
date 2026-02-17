<template>
  <span :class="wrapperClass" :style="wrapperStyle" v-bind="wrapperAttrs">
    <svg
      :xmlns="SVG_NS"
      :viewBox="viewBox"
      :fill="fill"
      :stroke="stroke"
      :class="svgClass"
      :aria-hidden="ariaHidden"
      :aria-label="ariaLabel"
      v-bind="svgAttrs"
    >
      <slot />
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed, useAttrs, type StyleValue, ref, onMounted } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'

/**
 * BaseIcon Component - Flexy loves modularity!
 *
 * This component eliminates the need to repeat SVG xmlns attributes
 * across 72+ components. All SVG icons should use this as a base.
 *
 * Usage:
 * <BaseIcon viewBox="0 0 24 24" class="w-5 h-5">
 *   <path d="..." />
 * </BaseIcon>
 *
 * Interactive mode (Palette's micro-UX delight!):
 * <BaseIcon viewBox="0 0 24 24" class="w-5 h-5" interactive>
 *   <path d="..." />
 * </BaseIcon>
 *
 * With entrance animation:
 * <BaseIcon viewBox="0 0 24 24" class="w-5 h-5" animate-entrance>
 *   <path d="..." />
 * </BaseIcon>
 */

interface Props {
  viewBox?: string
  fill?: string
  stroke?: string
  class?: string
  ariaHidden?: boolean
  ariaLabel?: string
  /**
   * Enable interactive states (hover, active) with micro-animations
   * @default false
   */
  interactive?: boolean
  /**
   * Animation scale factor for hover state (1.0 = no scale)
   * @default 1.15
   */
  hoverScale?: number
  /**
   * Animation scale factor for active/pressed state
   * @default 0.95
   */
  activeScale?: number
  /**
   * Enable entrance animation when component mounts
   * @default false
   */
  animateEntrance?: boolean
  /**
   * Delay before entrance animation starts (ms)
   * Useful for staggered animations
   * @default 0
   */
  entranceDelay?: number
  /**
   * Enable wiggle animation on hover
   * @default false
   */
  wiggleOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  class: '',
  ariaHidden: true,
  ariaLabel: undefined,
  interactive: false,
  hoverScale: 1.15,
  activeScale: 0.95,
  animateEntrance: false,
  entranceDelay: 0,
  wiggleOnHover: false,
})

const attrs = useAttrs()

// Track if component has mounted for entrance animation
const isMounted = ref(false)
const prefersReducedMotion = ref(false)

// Check for reduced motion preference
const checkReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Trigger entrance animation on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  if (props.animateEntrance && !prefersReducedMotion.value) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      isMounted.value = true
    }, props.entranceDelay)
  } else {
    isMounted.value = true
  }
})

// Flexy hates hardcoded values! Using centralized constant
const SVG_NS = 'http://www.w3.org/2000/svg'

const svgClass = computed(() => props.class)

// Palette's micro-UX enhancement: Interactive icon states!
// Adds delightful hover lift and press effects for interactive icons
const wrapperClass = computed(() => {
  const classes = ['icon-wrapper']

  if (props.interactive) {
    classes.push('icon-wrapper--interactive')
  }

  if (props.animateEntrance && !prefersReducedMotion.value) {
    classes.push('icon-wrapper--entrance')
    if (isMounted.value) {
      classes.push('icon-wrapper--mounted')
    }
  }

  if (props.wiggleOnHover && !prefersReducedMotion.value) {
    classes.push('icon-wrapper--wiggle')
  }

  return classes.join(' ')
})

const wrapperStyle = computed<StyleValue>(() => {
  const style: Record<string, string> = {}

  if (props.interactive) {
    style['--icon-hover-scale'] = String(props.hoverScale)
    style['--icon-active-scale'] = String(props.activeScale)
    style['--icon-transition-duration'] =
      `${animationConfig.iconInteraction.durationMs}ms`
  }

  if (props.animateEntrance && !prefersReducedMotion.value) {
    style['--icon-entrance-duration'] = animationConfig.iconEntrance.durationSec
    style['--icon-entrance-delay'] = `${props.entranceDelay}ms`
    style['--icon-entrance-start-scale'] = String(
      animationConfig.iconEntrance.startScale
    )
    style['--icon-entrance-end-scale'] = String(
      animationConfig.iconEntrance.endScale
    )
    style['--icon-entrance-final-scale'] = String(
      animationConfig.iconEntrance.finalScale
    )
  }

  if (props.wiggleOnHover && !prefersReducedMotion.value) {
    style['--icon-wiggle-duration'] = animationConfig.iconWiggle.durationSec
    style['--icon-wiggle-rotation'] =
      `${animationConfig.iconWiggle.rotationDeg}deg`
  }

  return style as StyleValue
})

// Separate wrapper and SVG attrs
const wrapperAttrs = computed(() => {
  if (!props.interactive) return {}
  // Only pass click-related attrs to wrapper when interactive
  const wrapperOnlyAttrs = [
    'onClick',
    'onMousedown',
    'onMouseup',
    'onTouchstart',
    'onTouchend',
  ]
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => wrapperOnlyAttrs.includes(key))
  )
})

const svgAttrs = computed(() => {
  // Pass all other attrs to SVG
  const wrapperOnlyAttrs = [
    'onClick',
    'onMousedown',
    'onMouseup',
    'onTouchstart',
    'onTouchend',
  ]
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => !wrapperOnlyAttrs.includes(key))
  )
})
</script>

<style scoped>
/* Palette's micro-UX enhancement: Interactive icon wrapper styles */
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.icon-wrapper--interactive {
  cursor: pointer;
  transition: transform
    v-bind('animationConfig.iconInteraction.durationMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Hover state: Subtle scale up for delight */
.icon-wrapper--interactive:hover {
  transform: scale(var(--icon-hover-scale, 1.15));
}

/* Active/pressed state: Slight scale down for tactile feedback */
.icon-wrapper--interactive:active {
  transform: scale(var(--icon-active-scale, 0.95));
}

/* Focus state: Visible focus ring for accessibility */
.icon-wrapper--interactive:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Palette's micro-UX enhancement: Entrance animation ✨
   Subtle fade-in + scale when icon first appears */
.icon-wrapper--entrance {
  opacity: 0;
  transform: scale(var(--icon-entrance-start-scale, 0.7));
}

/* Flexy hates hardcoded 0.4s! Using animationConfig.iconEntrance.durationSec */
.icon-wrapper--entrance.icon-wrapper--mounted {
  animation: icon-entrance
    var(
      --icon-entrance-duration,
      v-bind('animationConfig.iconEntrance.durationSec')
    )
    v-bind('EASING.SPRING_STANDARD') var(--icon-entrance-delay, 0s) forwards;
}

@keyframes icon-entrance {
  0% {
    opacity: 0;
    transform: scale(var(--icon-entrance-start-scale, 0.7));
  }
  60% {
    opacity: 1;
    transform: scale(var(--icon-entrance-end-scale, 1.05));
  }
  100% {
    opacity: 1;
    transform: scale(var(--icon-entrance-final-scale, 1));
  }
}

/* Palette's micro-UX enhancement: Wiggle animation on hover 🎨
   Playful rotation effect for extra delight */
/* Flexy hates hardcoded 0.5s! Using animationConfig.iconWiggle.durationSec */
.icon-wrapper--wiggle:hover {
  animation: icon-wiggle
    var(
      --icon-wiggle-duration,
      v-bind('animationConfig.iconWiggle.durationSec')
    )
    v-bind('EASING.SPRING_STANDARD');
}

@keyframes icon-wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(calc(var(--icon-wiggle-rotation, 10deg) * -1));
  }
  40% {
    transform: rotate(var(--icon-wiggle-rotation, 10deg));
  }
  60% {
    transform: rotate(calc(var(--icon-wiggle-rotation, 10deg) * -0.5));
  }
  80% {
    transform: rotate(calc(var(--icon-wiggle-rotation, 10deg) * 0.5));
  }
}

/* Reduced motion support: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .icon-wrapper--interactive {
    transition: none;
  }

  .icon-wrapper--interactive:hover,
  .icon-wrapper--interactive:active {
    transform: none;
  }

  .icon-wrapper--entrance {
    opacity: 1;
    transform: none;
    animation: none;
  }

  .icon-wrapper--entrance.icon-wrapper--mounted {
    animation: none;
  }

  .icon-wrapper--wiggle:hover {
    animation: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .icon-wrapper--interactive:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
</style>
