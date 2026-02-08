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
      viewBox="25 25 50 50"
      aria-hidden="true"
    >
      <circle
        class="loading-spinner__path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="2"
        stroke-miterlimit="10"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

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

// Generate unique ID for this spinner instance
const uniqueId = ref(`spinner-${Math.random().toString(36).substring(2, 9)}`)

// Track the last announced state to prevent duplicate announcements
const lastAnnouncedState = ref<string | null>(null)

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
}

.loading-spinner--small .loading-spinner__circular {
  width: 1rem;
  height: 1rem;
}

.loading-spinner .loading-spinner__circular {
  width: 1.5rem;
  height: 1.5rem;
}

.loading-spinner--large .loading-spinner__circular {
  width: 3rem;
  height: 3rem;
}

.loading-spinner__circular {
  animation: rotate 2s linear infinite;
}

.loading-spinner__path {
  stroke: currentColor;
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
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
    animation: pulse 2s ease-in-out infinite;
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
  font-size: 0.875rem;
  color: #6b7280;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
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
