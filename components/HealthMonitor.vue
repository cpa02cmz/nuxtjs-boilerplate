<template>
  <div class="health-monitor">
    <div class="monitor-header">
      <h3>{{ contentConfig.health.title }}</h3>
      <button
        class="check-button"
        :class="{ 'is-checking': isChecking }"
        :disabled="isChecking"
        @click="handleCheckClick"
      >
        <span v-if="isChecking" class="button-spinner" />
        <span>{{
          isChecking
            ? contentConfig.health.button.checking
            : contentConfig.health.button.check
        }}</span>
      </button>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="healthStatus" key="status" class="health-status">
        <div class="status-summary">
          <div class="status-item">
            <div
              class="status-icon"
              :class="[
                healthClass,
                {
                  'is-checking': isChecking,
                  'checkmark-pop': showCheckmarkPop,
                },
              ]"
            >
              <Transition name="icon-fade" mode="out-in">
                <span
                  v-if="isChecking"
                  key="checking"
                  class="checking-indicator"
                  >⟳</span
                >
                <span
                  v-else-if="healthStatus.isHealthy"
                  key="healthy"
                  class="status-symbol"
                  >✓</span
                >
                <span
                  v-else-if="healthStatus.lastStatus === null"
                  key="unknown"
                  class="status-symbol"
                  >?</span
                >
                <span v-else key="unhealthy" class="status-symbol">✗</span>
              </Transition>
            </div>
            <div class="status-details">
              <div class="status-text">
                <span class="status-label">{{
                  contentConfig.health.labels.status
                }}</span>
                <Transition name="value-fade" mode="out-in">
                  <span
                    :key="healthStatus.isHealthy"
                    :class="['status-value', healthClass]"
                  >
                    {{
                      healthStatus.isHealthy
                        ? contentConfig.health.status.healthy
                        : healthStatus.lastStatus === null
                          ? contentConfig.health.status.unknown
                          : contentConfig.health.status.unhealthy
                    }}
                  </span>
                </Transition>
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
              <Transition name="slide-down">
                <div v-if="healthStatus.error" class="status-error">
                  <span class="error-label">{{
                    contentConfig.health.labels.error
                  }}</span>
                  <span class="error-value">{{ healthStatus.error }}</span>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <Transition name="slide-down">
          <div
            v-if="
              healthStatus.validationHistory &&
              healthStatus.validationHistory.length > 0
            "
            class="history-section"
          >
            <h4>{{ contentConfig.health.recentChecks }}</h4>
            <TransitionGroup name="history-item" tag="div" class="history-list">
              <div
                v-for="(check, index) in reversedHistory"
                :key="getHistoryKey(check, index)"
                class="history-item"
                :class="
                  check.isAccessible ? 'history-success' : 'history-error'
                "
                :style="getHistoryItemStyle(index)"
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
            </TransitionGroup>
          </div>
        </Transition>
      </div>

      <div v-else key="empty" class="no-health-data">
        {{ contentConfig.health.emptyState }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

// Animation states
const showCheckmarkPop = ref(false)
const previousHealthState = ref<boolean | null>(null)
const historyKeyCounter = ref(0)

// Computed
const reversedHistory = computed(() => {
  if (!healthStatus.value?.validationHistory) return []
  return healthStatus.value.validationHistory.slice().reverse()
})

// Get unique key for history items to enable animations
const getHistoryKey = (
  check: {
    timestamp: string
    isAccessible?: boolean
    status?: number
    statusText?: string
    responseTime?: number
  },
  index: number
) => {
  return `${check.timestamp}-${index}-${historyKeyCounter.value}`
}

// Get staggered animation delay for history items
const getHistoryItemStyle = (index: number) => {
  const delay = index * animationConfig.healthMonitor.historyStaggerMs
  return {
    '--history-delay': `${delay}ms`,
  }
}

// Handle check button click with haptic feedback
const handleCheckClick = () => {
  hapticLight()
  triggerHealthCheck()
}

// Watch for health status changes to trigger animations
watch(
  () => healthStatus.value?.isHealthy,
  (newValue, oldValue) => {
    // Store previous state
    if (oldValue !== undefined) {
      previousHealthState.value = oldValue
    }

    // Trigger checkmark pop animation when becoming healthy
    if (newValue === true && previousHealthState.value === false) {
      showCheckmarkPop.value = true
      setTimeout(() => {
        hapticSuccess()
      }, animationConfig.healthMonitor.hapticDelayMs)
      setTimeout(() => {
        showCheckmarkPop.value = false
      }, animationConfig.healthMonitor.checkmarkPopDurationMs)
    }

    // Trigger error haptic when becoming unhealthy
    if (newValue === false && previousHealthState.value === true) {
      setTimeout(() => {
        hapticError()
      }, animationConfig.healthMonitor.hapticDelayMs)
    }

    // Update history key counter to trigger animations
    if (newValue !== undefined && newValue !== previousHealthState.value) {
      historyKeyCounter.value++
    }
  },
  { immediate: true }
)
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

.check-button {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all v-bind('animationConfig.cssTransitions.normalSec');
}

.check-button:hover:not(:disabled) {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.primaryHover'
  );
  transform: translateY(-1px);
}

.check-button:active:not(:disabled) {
  transform: translateY(0);
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
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: button-spin
    v-bind('animationConfig.healthMonitor.pulseDurationSec') linear infinite;
}

@keyframes button-spin {
  to {
    transform: rotate(360deg);
  }
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
  transition: all v-bind('animationConfig.healthMonitor.statusTransitionSec')
    cubic-bezier(0.4, 0, 0.2, 1);
}

.status-icon.is-checking {
  animation: status-pulse
    v-bind('animationConfig.healthMonitor.pulseDurationSec') ease-in-out
    infinite;
}

.status-icon.checkmark-pop {
  animation: checkmark-pop
    v-bind('animationConfig.healthMonitor.checkmarkPopDurationSec')
    cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes checkmark-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(v-bind('animationConfig.healthMonitor.checkmarkPopScale'));
  }
  100% {
    transform: scale(1);
  }
}

.checking-indicator {
  display: inline-block;
  animation: rotate-checking
    v-bind('animationConfig.healthMonitor.pulseDurationSec') linear infinite;
}

@keyframes rotate-checking {
  from {
    transform: rotate(0deg);
  }
  to {
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
  transition: color v-bind('animationConfig.healthMonitor.statusTransitionSec')
    ease;
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

/* Transition Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.value-fade-enter-active,
.value-fade-leave-active {
  transition: all v-bind('animationConfig.healthMonitor.statusTransitionSec')
    ease;
}

.value-fade-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.value-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.slowSec')
    cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* History item animations */
.history-item-enter-active {
  transition: all
    v-bind('animationConfig.healthMonitor.historySlideDurationSec')
    cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--history-delay, 0ms);
}

.history-item-leave-active {
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease;
}

.history-item-enter-from {
  opacity: 0;
  transform: translateX(
    calc(
      -1 * v-bind('animationConfig.healthMonitor.historySlideDistancePx + "px"')
    )
  );
}

.history-item-leave-to {
  opacity: 0;
  transform: translateX(
    v-bind('animationConfig.healthMonitor.historySlideDistancePx + "px"')
  );
}

.history-item-move {
  transition: transform v-bind('animationConfig.cssTransitions.slowSec') ease;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .status-icon,
  .status-value,
  .check-button,
  .history-item {
    transition: none !important;
    animation: none !important;
  }

  .checking-indicator {
    animation: none !important;
  }

  .button-spinner {
    animation: none !important;
    border-top-color: rgba(255, 255, 255, 0.3);
  }

  .fade-enter-active,
  .fade-leave-active,
  .icon-fade-enter-active,
  .icon-fade-leave-active,
  .value-fade-enter-active,
  .value-fade-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active,
  .history-item-enter-active,
  .history-item-leave-active {
    transition: none !important;
  }
}
</style>
