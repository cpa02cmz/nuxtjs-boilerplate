<template>
  <div class="health-monitor">
    <div class="monitor-header">
      <h3>{{ contentConfig.health.title }}</h3>
      <!-- Check button with spinner - Palette's micro-UX enhancement! -->
      <button
        class="check-button"
        :class="{ 'is-checking': isChecking }"
        :disabled="isChecking"
        @click="handleCheckClick"
      >
        <span v-if="isChecking" class="button-spinner" aria-hidden="true">
          <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
            <circle
              class="spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <circle
              class="spinner-head"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </span>
        <span class="button-text">{{
          isChecking
            ? contentConfig.health.button.checking
            : contentConfig.health.button.check
        }}</span>
      </button>
    </div>

    <div v-if="healthStatus" class="health-status">
      <div class="status-summary">
        <div class="status-item">
          <!-- Status icon with pulse animation - Palette's micro-UX delight! -->
          <div
            class="status-icon"
            :class="[
              healthClass,
              {
                'is-pulsing': isChecking && !prefersReducedMotion,
                'is-success': showSuccessAnimation && !prefersReducedMotion,
                'is-error': showErrorAnimation && !prefersReducedMotion,
              },
            ]"
            :aria-label="
              healthStatus.isHealthy
                ? 'Healthy'
                : healthStatus.lastStatus === null
                  ? 'Unknown'
                  : 'Unhealthy'
            "
          >
            <Transition
              mode="out-in"
              :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
              enter-from-class="opacity-0 scale-50"
              enter-to-class="opacity-100 scale-100"
              :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-50"
            >
              <span v-if="isChecking" key="checking" class="status-checking"
                >⋯</span
              >
              <span
                v-else-if="healthStatus.isHealthy"
                key="healthy"
                class="status-healthy-icon"
                >✓</span
              >
              <span v-else-if="healthStatus.lastStatus === null" key="unknown"
                >?</span
              >
              <span v-else key="unhealthy" class="status-unhealthy-icon"
                >✗</span
              >
            </Transition>
          </div>
          <div class="status-details">
            <div class="status-text">
              <span class="status-label">{{
                contentConfig.health.labels.status
              }}</span>
              <span :class="['status-value', healthClass]">
                {{
                  healthStatus.isHealthy
                    ? contentConfig.health.status.healthy
                    : healthStatus.lastStatus === null
                      ? contentConfig.health.status.unknown
                      : contentConfig.health.status.unhealthy
                }}
              </span>
            </div>
            <div class="status-info">
              <span class="info-label">{{
                contentConfig.health.labels.lastChecked
              }}</span>
              <span class="info-value">{{
                formatDate(healthStatus.lastChecked)
              }}</span>
            </div>
            <div v-if="healthStatus.responseTime" class="status-info">
              <span class="info-label">{{
                contentConfig.health.labels.responseTime
              }}</span>
              <span class="info-value"
                >{{ healthStatus.responseTime
                }}{{ contentConfig.health.units.ms }}</span
              >
            </div>
            <div v-if="healthStatus.error" class="status-error">
              <span class="error-label">{{
                contentConfig.health.labels.error
              }}</span>
              <span class="error-value">{{ healthStatus.error }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="
          healthStatus.validationHistory &&
          healthStatus.validationHistory.length > 0
        "
        class="history-section"
      >
        <h4>{{ contentConfig.health.recentChecks }}</h4>
        <div class="history-list">
          <div
            v-for="(check, index) in healthStatus.validationHistory
              .slice()
              .reverse()"
            :key="index"
            class="history-item"
            :class="check.isAccessible ? 'history-success' : 'history-error'"
          >
            <div class="history-status">
              <span v-if="check.isAccessible" class="success-icon">✓</span>
              <span v-else class="error-icon">✗</span>
            </div>
            <div class="history-details">
              <div>{{ formatDate(check.timestamp) }}</div>
              <div class="history-info">
                <span v-if="check.status"
                  >{{ check.status }} {{ check.statusText }}</span
                >
                <span v-if="check.responseTime" class="response-time"
                  >({{ check.responseTime
                  }}{{ contentConfig.health.units.ms }})</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-health-data">
      {{ contentConfig.health.emptyState }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useResourceHealth } from '~/composables/useResourceHealth'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticSuccess, hapticError, hapticLight } from '~/utils/hapticFeedback'

interface Props {
  resourceId?: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  resourceId: '',
  url: '',
})

const {
  healthStatus,
  isChecking,
  healthClass,
  formatDate,
  triggerHealthCheck,
} = useResourceHealth(props)

// Palette's micro-UX enhancement: Track reduced motion preference
const prefersReducedMotion = ref(false)

// Palette's micro-UX enhancement: Animation states
const showSuccessAnimation = ref(false)
const showErrorAnimation = ref(false)

// Palette's micro-UX enhancement: Track previous health state for transitions
const previousHealthState = ref<boolean | null>(null)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Palette's micro-UX enhancement: Handle check button click with haptic feedback
const handleCheckClick = () => {
  // Light haptic feedback when starting check
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
  triggerHealthCheck()
}

// Watch for health status changes to trigger animations and haptic feedback
watch(
  () => healthStatus.value,
  (newStatus, oldStatus) => {
    if (!newStatus || isChecking.value) return

    // Store previous state
    if (oldStatus) {
      previousHealthState.value = oldStatus.isHealthy
    }

    // Skip animations if reduced motion is preferred
    if (prefersReducedMotion.value) return

    // Trigger success animation and haptic for healthy status
    if (newStatus.isHealthy && previousHealthState.value !== true) {
      showSuccessAnimation.value = true
      setTimeout(() => {
        hapticSuccess()
      }, animationConfig.healthMonitor.hapticDelayMs)
      setTimeout(() => {
        showSuccessAnimation.value = false
      }, animationConfig.healthMonitor.successDurationMs)
    }

    // Trigger error animation and haptic for unhealthy status
    if (
      !newStatus.isHealthy &&
      newStatus.lastStatus !== null &&
      previousHealthState.value !== false
    ) {
      showErrorAnimation.value = true
      setTimeout(() => {
        hapticError()
      }, animationConfig.healthMonitor.hapticDelayMs)
      setTimeout(() => {
        showErrorAnimation.value = false
      }, animationConfig.healthMonitor.errorDurationMs)
    }
  },
  { immediate: false }
)

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using CSS variables from componentColorsConfig */
.health-monitor {
  padding: v-bind('componentColorsConfig.healthMonitor.container.padding');
  border: 1px solid
    v-bind('componentColorsConfig.healthMonitor.container.border');
  border-radius: v-bind(
    'componentColorsConfig.healthMonitor.container.borderRadius'
  );
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.container.background'
  );
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.monitor-header h3 {
  font-size: v-bind('componentColorsConfig.healthMonitor.header.fontSize');
  font-weight: 600;
  color: v-bind('componentColorsConfig.healthMonitor.header.text');
  margin: 0;
}

.health-status {
  width: 100%;
}

.status-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.status-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
  transition:
    transform v-bind('animationConfig.healthMonitor.successDurationMs + "ms"')
      ease-out,
    box-shadow v-bind('animationConfig.healthMonitor.successDurationMs + "ms"')
      ease-out;
}

/* Palette's micro-UX enhancement: Pulse animation during health check */
.status-icon.is-pulsing {
  animation: health-pulse
    v-bind('animationConfig.healthMonitor.pulseDurationSec') ease-in-out
    infinite;
}

@keyframes health-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(v-bind('animationConfig.healthMonitor.pulseScale'));
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Palette's micro-UX enhancement: Success celebration animation */
.status-icon.is-success {
  animation: health-success
    v-bind('animationConfig.healthMonitor.successDurationSec') ease-out;
}

@keyframes health-success {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.healthMonitor.successScale'));
  }
  100% {
    transform: scale(1)
      rotate(v-bind('animationConfig.healthMonitor.successRotationDeg + "deg"'));
  }
}

/* Palette's micro-UX enhancement: Error shake animation */
.status-icon.is-error {
  animation: health-error
    v-bind('animationConfig.healthMonitor.errorDurationSec') ease-in-out;
}

@keyframes health-error {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-4px);
  }
  40%,
  80% {
    transform: translateX(4px);
  }
}

/* Status checking state */
.status-checking {
  animation: checking-pulse 1s ease-in-out infinite;
}

@keyframes checking-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Button spinner styles - Palette's micro-UX enhancement! */
.check-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.primaryBg'
  );
  color: v-bind('componentColorsConfig.healthMonitor.button.text');
  border: none;
  border-radius: v-bind(
    'componentColorsConfig.healthMonitor.button.borderRadius'
  );
  cursor: pointer;
  font-weight: 500;
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.check-button:hover:not(:disabled) {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.primaryHover'
  );
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.check-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.check-button:disabled {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.disabledBg'
  );
  cursor: not-allowed;
  opacity: 0.8;
}

.check-button.is-checking {
  padding-left: 0.75rem;
}

.button-spinner {
  display: inline-flex;
  width: 1rem;
  height: 1rem;
}

.spinner-icon {
  width: 100%;
  height: 100%;
  animation: spinner-rotate
    v-bind('animationConfig.healthMonitor.spinnerDurationMs + "ms"') linear
    infinite;
}

.spinner-track {
  opacity: 0.3;
}

.spinner-head {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: spinner-dash
    v-bind('animationConfig.healthMonitor.spinnerDurationMs + "ms"') ease-in-out
    infinite;
  transform-origin: center;
}

@keyframes spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-dash {
  0% {
    stroke-dashoffset: 60;
    transform: rotate(0deg);
  }
  50% {
    stroke-dashoffset: 0;
    transform: rotate(45deg);
  }
  100% {
    stroke-dashoffset: 60;
    transform: rotate(360deg);
  }
}

.status-healthy {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.status.healthy.bg'
  );
  color: v-bind('componentColorsConfig.healthMonitor.status.healthy.text');
}

.status-unhealthy {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.status.unhealthy.bg'
  );
  color: v-bind('componentColorsConfig.healthMonitor.status.unhealthy.text');
}

.status-unknown {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.status.unknown.bg'
  );
  color: v-bind('componentColorsConfig.healthMonitor.status.unknown.text');
}

.status-details {
  flex: 1;
}

.status-text {
  margin-bottom: 0.25rem;
}

.status-label {
  font-weight: 500;
  color: v-bind('componentColorsConfig.healthMonitor.labels.primary');
  margin-right: 0.5rem;
}

.status-value {
  font-weight: 600;
}

.status-info {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.healthMonitor.labels.info');
}

.info-label {
  color: v-bind('componentColorsConfig.healthMonitor.labels.secondary');
  margin-right: 0.5rem;
}

.status-error {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: v-bind('componentColorsConfig.healthMonitor.error.bg');
  border-left: 3px solid
    v-bind('componentColorsConfig.healthMonitor.error.border');
  border-radius: 0 0.25rem 0.25rem 0;
}

.error-label {
  font-weight: 500;
  color: v-bind('componentColorsConfig.healthMonitor.error.text');
  margin-right: 0.5rem;
}

.error-value {
  color: v-bind('componentColorsConfig.healthMonitor.error.text');
}

.history-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid
    v-bind('componentColorsConfig.healthMonitor.container.border');
}

.history-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: v-bind('componentColorsConfig.healthMonitor.history.sectionHeader');
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
}

.history-success {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.history.success.bg'
  );
  border: 1px solid
    v-bind('componentColorsConfig.healthMonitor.history.success.border');
}

.history-error {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.history.error.bg'
  );
  border: 1px solid
    v-bind('componentColorsConfig.healthMonitor.history.error.border');
}

.history-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.success-icon {
  color: v-bind('componentColorsConfig.healthMonitor.history.success.icon');
  font-weight: bold;
}

.error-icon {
  color: v-bind('componentColorsConfig.healthMonitor.history.error.icon');
  font-weight: bold;
}

.history-details {
  flex: 1;
}

.history-info {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.healthMonitor.history.info');
}

.response-time {
  margin-left: 0.5rem;
  color: v-bind('componentColorsConfig.healthMonitor.history.responseTime');
}

.no-health-data {
  padding: 1rem;
  text-align: center;
  color: v-bind('componentColorsConfig.healthMonitor.emptyState');
  font-style: italic;
}

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .status-icon,
  .status-icon.is-pulsing,
  .status-icon.is-success,
  .status-icon.is-error,
  .check-button,
  .button-spinner,
  .spinner-icon {
    animation: none !important;
    transition: opacity v-bind('animationConfig.cssTransitions.fastSec')
      ease-out !important;
  }

  .status-checking {
    animation: none;
    opacity: 0.7;
  }

  .check-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
