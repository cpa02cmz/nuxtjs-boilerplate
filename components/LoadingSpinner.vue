<template>
  <div
    class="loading-spinner"
    :class="{
      'loading-spinner--small': size === 'small',
      'loading-spinner--large': size === 'large',
      'loading-spinner--glow': showGlow,
    }"
    role="status"
    :aria-label="label || config.default"
  >
    <!-- Shimmer Glow Effect - Palette's micro-UX delight! -->
    <div
      v-if="showGlow && !prefersReducedMotion"
      class="loading-spinner__glow"
      aria-hidden="true"
    />

    <div class="loading-spinner__container">
      <svg
        class="loading-spinner__circular"
        :viewBox="`${spinnerStyles.svg.viewBoxMin} ${spinnerStyles.svg.viewBoxMin} ${spinnerStyles.svg.viewBoxMax} ${spinnerStyles.svg.viewBoxMax}`"
        aria-hidden="true"
      >
        <circle
          :cx="spinnerStyles.svg.circleCx"
          :cy="spinnerStyles.svg.circleCy"
          :r="spinnerStyles.svg.circleR"
          fill="none"
          :stroke-width="spinnerStyles.svg.strokeWidth"
          stroke-miterlimit="10"
          class="loading-spinner__path"
        />
      </svg>
    </div>

    <span
      v-if="label"
      class="loading-spinner__label"
    >{{ label }}</span>
    <span
      v-else
      class="sr-only"
    >{{ config.default }}</span>

    <!-- Live region for status announcement to screen readers -->
    <div
      :id="`loading-status-${uniqueId}`"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { themeConfig } from '../configs/theme.config'
import { componentStylesConfig } from '../configs/component-styles.config'
import { limitsConfig } from '../configs/limits.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'

// Flexy hates hardcoded values! Using config instead.
const spinnerStyles = componentStylesConfig.loadingSpinner
const config = contentConfig.loading

interface Props {
  label?: string
  size?: 'small' | 'medium' | 'large'
  /**
   * Controls the loading state announcement.
   * 'loading' - announces loading has started
   * 'complete' - announces loading has finished
   * 'error' - announces loading failed
   * null/undefined - no announcement
   */
  state?: 'loading' | 'complete' | 'error' | null
  /** Custom message to announce when state changes. Overrides default messages. */
  customMessage?: string
  /** Enable shimmer glow effect around the spinner */
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 'medium',
  state: null,
  customMessage: undefined,
  glow: true,
})

// Generate unique ID for this spinner instance using configurable length
const uniqueId = ref(
  `spinner-${Math.random()
    .toString(36)
    .substring(2, 2 + limitsConfig.displayLength.spinnerIdLength)}`
)

// Track the last announced state to prevent duplicate announcements
const lastAnnouncedState = ref<string | null>(null)

// Check for reduced motion preference
const prefersReducedMotion = ref(false)

// Check reduced motion preference on mount
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
  }
})

// Show glow when enabled and not in reduced motion
const showGlow = computed(() => {
  return props.glow && animationConfig.spinnerGlow.respectReducedMotion
})

// Computed status message based on state
const statusMessage = computed(() => {
  if (props.customMessage) {
    return props.customMessage
  }

  switch (props.state) {
    case 'loading':
      return props.label
        ? `${props.label} ${config.inProgress}`
        : `${config.default} ${config.inProgress}`
    case 'complete':
      return props.label
        ? `${props.label} ${config.complete}`
        : `${config.default} ${config.complete}`
    case 'error':
      return props.label
        ? `${props.label} ${config.failed}`
        : `${config.default} ${config.failed}`
    default:
      return ''
  }
})

// Watch for state changes and update last announced state
watch(
  () => props.state,
  newState => {
    if (newState && newState !== lastAnnouncedState.value) {
      lastAnnouncedState.value = newState
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
}

.loading-spinner--small .loading-spinner__circular {
  width: v-bind('spinnerStyles.sizes.small.width');
  height: v-bind('spinnerStyles.sizes.small.height');
}

.loading-spinner .loading-spinner__circular {
  width: v-bind('spinnerStyles.sizes.medium.width');
  height: v-bind('spinnerStyles.sizes.medium.height');
}

.loading-spinner--large .loading-spinner__circular {
  width: v-bind('spinnerStyles.sizes.large.width');
  height: v-bind('spinnerStyles.sizes.large.height');
}

.loading-spinner__container {
  position: relative;
  z-index: 1;
}

.loading-spinner__circular {
  animation: rotate v-bind('spinnerStyles.animation.rotationDuration') linear
    infinite;
}

.loading-spinner__path {
  stroke: currentColor;
  stroke-dasharray: v-bind('spinnerStyles.stroke.dashArray');
  stroke-dashoffset: v-bind('spinnerStyles.stroke.dashOffset');
  stroke-linecap: round;
  animation: dash v-bind('spinnerStyles.animation.dashDuration') ease-in-out
    infinite;
}

/* Shimmer Glow Effect - Palette's micro-UX delight!
   Adds a subtle pulsing glow around the loading spinner */
.loading-spinner__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: v-bind('spinnerStyles.sizes.medium.width');
  height: v-bind('spinnerStyles.sizes.medium.height');
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: spinner-glow-pulse
    v-bind('animationConfig.spinnerGlow.durationSec') ease-in-out infinite;
}

.loading-spinner--small .loading-spinner__glow {
  width: v-bind('spinnerStyles.sizes.small.width');
  height: v-bind('spinnerStyles.sizes.small.height');
}

.loading-spinner--large .loading-spinner__glow {
  width: v-bind('spinnerStyles.sizes.large.width');
  height: v-bind('spinnerStyles.sizes.large.height');
}

@keyframes spinner-glow-pulse {
  0%,
  100% {
    box-shadow:
      0 0 v-bind('animationConfig.spinnerGlow.spreadMin + "px"')
        v-bind('animationConfig.spinnerGlow.primaryColor'),
      0 0 calc(v-bind('animationConfig.spinnerGlow.spreadMin + "px"') * 2)
        v-bind('animationConfig.spinnerGlow.secondaryColor');
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    box-shadow:
      0 0 v-bind('animationConfig.spinnerGlow.spreadMax + "px"')
        v-bind('animationConfig.spinnerGlow.primaryColor'),
      0 0 calc(v-bind('animationConfig.spinnerGlow.spreadMax + "px"') * 1.5)
        v-bind('animationConfig.spinnerGlow.secondaryColor');
    transform: translate(-50%, -50%)
      scale(v-bind('animationConfig.spinnerGlow.scale'));
  }
}

/* Respect user's motion preferences for accessibility */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner__circular {
    animation: none;
  }

  .loading-spinner__path {
    animation: none;
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
    opacity: 0.6;
  }

  /* Add a subtle pulse for reduced motion users */
  .loading-spinner__circular {
    animation: pulse
      v-bind('spinnerStyles.animation.reducedMotionPulseDuration') ease-in-out
      infinite;
  }

  /* Hide glow effect for reduced motion users */
  .loading-spinner__glow {
    display: none;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}

.loading-spinner__label {
  font-size: v-bind('spinnerStyles.label.fontSize');
  color: v-bind('themeConfig.loadingSpinner.labelColor');
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: v-bind('spinnerStyles.stroke.dashArray');
    stroke-dashoffset: v-bind('spinnerStyles.stroke.dashOffset');
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>
