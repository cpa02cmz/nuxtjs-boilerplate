<template>
  <div
    class="loading-spinner"
    :class="{
      'loading-spinner--small': size === 'small',
      'loading-spinner--large': size === 'large',
    }"
    role="status"
    :aria-label="label || 'Loading'"
  >
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
    <span
      v-if="label"
      class="loading-spinner__label"
    >{{ label }}</span>
    <span
      v-else
      class="sr-only"
    >Loading</span>

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

    <!-- Dedicated announcement region for state changes -->
    <!-- This ensures screen readers announce completion/errors immediately -->
    <div
      aria-live="assertive"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcementMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { themeConfig } from '../configs/theme.config'
import { componentStylesConfig } from '../configs/component-styles.config'
import { limitsConfig } from '../configs/limits.config'

// Flexy hates hardcoded values! Using config instead.
const spinnerStyles = componentStylesConfig.loadingSpinner

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
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 'medium',
  state: null,
  customMessage: undefined,
})

// Generate unique ID for this spinner instance using configurable length
const uniqueId = ref(
  `spinner-${Math.random()
    .toString(36)
    .substring(2, 2 + limitsConfig.displayLength.spinnerIdLength)}`
)

// Track the last announced state to prevent duplicate announcements
const lastAnnouncedState = ref<string | null>(null)

// Announcement message that triggers screen reader announcements
// This is separate from statusMessage to ensure proper announcement timing
const announcementMessage = ref('')

// Computed status message based on state
const statusMessage = computed(() => {
  if (props.customMessage) {
    return props.customMessage
  }

  switch (props.state) {
    case 'loading':
      return props.label ? `${props.label} in progress` : 'Loading in progress'
    case 'complete':
      return props.label ? `${props.label} complete` : 'Loading complete'
    case 'error':
      return props.label ? `${props.label} failed` : 'Loading failed'
    default:
      return ''
  }
})

// Function to trigger screen reader announcement
// Uses nextTick to ensure DOM updates before announcement
const announceToScreenReader = async (message: string) => {
  // Clear first to ensure screen reader detects the change
  announcementMessage.value = ''
  await nextTick()
  // Small delay to ensure the clear takes effect
  setTimeout(() => {
    announcementMessage.value = message
  }, 100)
}

// Watch for state changes and announce to screen readers
watch(
  () => props.state,
  (newState, oldState) => {
    if (newState && newState !== lastAnnouncedState.value) {
      lastAnnouncedState.value = newState
      // Announce state changes to screen readers for better UX
      if (newState === 'complete') {
        announceToScreenReader(
          props.label ? `${props.label} complete` : 'Loading complete'
        )
      } else if (newState === 'error') {
        announceToScreenReader(
          props.label ? `${props.label} failed` : 'Loading failed'
        )
      } else if (newState === 'loading' && oldState) {
        // Only announce if transitioning from another state back to loading
        announceToScreenReader(
          props.label ? `${props.label} in progress` : 'Loading in progress'
        )
      }
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
