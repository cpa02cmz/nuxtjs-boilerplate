<template>
  <span
    :class="wrapperClass"
    :style="wrapperStyle"
    v-bind="wrapperAttrs"
  >
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
import { computed, useAttrs, type StyleValue } from 'vue'
import { animationConfig } from '~/configs/animation.config'

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
})

const attrs = useAttrs()

// Flexy hates hardcoded values! Using centralized constant
const SVG_NS = 'http://www.w3.org/2000/svg'

const svgClass = computed(() => props.class)

// Palette's micro-UX enhancement: Interactive icon states!
// Adds delightful hover lift and press effects for interactive icons
const wrapperClass = computed(() => {
  if (!props.interactive) return ''
  return 'icon-wrapper icon-wrapper--interactive'
})

const wrapperStyle = computed<StyleValue>(() => {
  if (!props.interactive) return {}
  return {
    '--icon-hover-scale': props.hoverScale,
    '--icon-active-scale': props.activeScale,
    '--icon-transition-duration': `${animationConfig.iconInteraction.durationMs}ms`,
  } as StyleValue
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
  transition: transform var(--icon-transition-duration, 200ms)
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
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

/* Reduced motion support: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .icon-wrapper--interactive {
    transition: none;
  }

  .icon-wrapper--interactive:hover,
  .icon-wrapper--interactive:active {
    transform: none;
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
