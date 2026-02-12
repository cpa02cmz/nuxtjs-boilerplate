<template>
  <svg
    :xmlns="SVG_NS"
    :viewBox="viewBox"
    :fill="fill"
    :stroke="stroke"
    :class="svgClass"
    :aria-hidden="ariaHidden"
    :aria-label="ariaLabel"
    v-bind="$attrs"
  >
    <slot />
  </svg>
</template>

<script setup lang="ts">
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
 */

interface Props {
  viewBox?: string
  fill?: string
  stroke?: string
  class?: string
  ariaHidden?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  viewBox: iconsConfig.svg.viewBox.standard,
  fill: iconsConfig.svg.defaults.fill,
  stroke: iconsConfig.svg.defaults.stroke,
  class: '',
  ariaHidden: true,
  ariaLabel: undefined,
})

// Flexy hates hardcoded values! Using centralized config
import { iconsConfig } from '~/configs/icons.config'
const SVG_NS = iconsConfig.svg.xmlns

const svgClass = computed(() => props.class)
</script>
