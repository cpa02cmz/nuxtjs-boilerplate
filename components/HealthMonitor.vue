<template>
  <div class="health-monitor">
    <div class="monitor-header">
      <h3>{{ contentConfig.health.title }}</h3>
      <button
        class="check-button"
        :disabled="isChecking"
        @click="triggerHealthCheck"
      >
        {{
          isChecking
            ? contentConfig.health.button.checking
            : contentConfig.health.button.check
        }}
      </button>
    </div>

    <div
      v-if="healthStatus"
      class="health-status"
    >
      <div class="status-summary">
        <div class="status-item">
          <div
            class="status-icon"
            :class="healthClass"
          >
            <span v-if="healthStatus.isHealthy">✓</span>
            <span v-else-if="healthStatus.lastStatus === null">?</span>
            <span v-else>✗</span>
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
            <div
              v-if="healthStatus.responseTime"
              class="status-info"
            >
              <span class="info-label">{{
                contentConfig.health.labels.responseTime
              }}</span>
              <span class="info-value">{{ healthStatus.responseTime
              }}{{ contentConfig.health.units.ms }}</span>
            </div>
            <div
              v-if="healthStatus.error"
              class="status-error"
            >
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
              <span
                v-if="check.isAccessible"
                class="success-icon"
              >✓</span>
              <span
                v-else
                class="error-icon"
              >✗</span>
            </div>
            <div class="history-details">
              <div>{{ formatDate(check.timestamp) }}</div>
              <div class="history-info">
                <span v-if="check.status">{{ check.status }} {{ check.statusText }}</span>
                <span
                  v-if="check.responseTime"
                  class="response-time"
                >({{ check.responseTime
                }}{{ contentConfig.health.units.ms }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="no-health-data"
    >
      {{ contentConfig.health.emptyState }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResourceHealth } from '~/composables/useResourceHealth'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

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
}

.check-button:hover:not(:disabled) {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.primaryHover'
  );
}

.check-button:disabled {
  background-color: v-bind(
    'componentColorsConfig.healthMonitor.button.disabledBg'
  );
  cursor: not-allowed;
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
</style>
