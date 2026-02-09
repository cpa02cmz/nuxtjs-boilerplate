<template>
  <div class="resource-status">
    <span
      :class="['status-badge', statusClass]"
      :title="statusTitle"
      role="status"
      :aria-label="statusTitle"
      tabindex="0"
    >
      {{ statusText }}
    </span>
    <span
      v-if="healthScore !== undefined"
      :class="['health-indicator', healthClass]"
      :title="`Health: ${healthScore}%`"
      :aria-label="healthLabel"
    >
      <svg
        v-if="healthScore >= healthThresholds.excellent"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="healthScore >= healthThresholds.good"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="healthScore >= healthThresholds.fair"
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <span class="sr-only">{{ healthText }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { statusConfig } from '~/configs/status.config'
import { colorsConfig } from '~/configs/colors.config'

interface Props {
  status?:
    | 'active'
    | 'deprecated'
    | 'discontinued'
    | 'updated'
    | 'pending'
    | string
  healthScore?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  healthScore: undefined,
})

// Get health thresholds from config
const healthThresholds = statusConfig.healthThresholds

const statusClass = computed(() => {
  switch (props.status) {
    case 'active':
      return 'status-active'
    case 'deprecated':
      return 'status-deprecated'
    case 'discontinued':
      return 'status-discontinued'
    case 'updated':
      return 'status-updated'
    case 'pending':
      return 'status-pending'
    default:
      return 'status-unknown'
  }
})

const statusText = computed(() => {
  const normalizedStatus = props.status as keyof typeof statusConfig.statuses
  return (
    statusConfig.statuses[normalizedStatus]?.label ||
    statusConfig.statuses.unknown.label
  )
})

const statusTitle = computed(() => {
  const normalizedStatus = props.status as keyof typeof statusConfig.statuses
  return (
    statusConfig.statuses[normalizedStatus]?.title ||
    statusConfig.statuses.unknown.title
  )
})

const healthClass = computed(() => {
  if (props.healthScore === undefined) return 'health-unknown'
  if (props.healthScore >= healthThresholds.excellent) return 'health-good'
  if (props.healthScore >= healthThresholds.good) return 'health-warning'
  return 'health-bad'
})

const healthText = computed(() => {
  if (props.healthScore === undefined) return statusConfig.healthLabels.unknown
  if (props.healthScore >= healthThresholds.excellent)
    return statusConfig.healthLabels.excellent
  if (props.healthScore >= healthThresholds.good)
    return statusConfig.healthLabels.good
  if (props.healthScore >= healthThresholds.fair)
    return statusConfig.healthLabels.fair
  return statusConfig.healthLabels.poor
})

const healthLabel = computed(() => {
  if (props.healthScore === undefined) return statusConfig.healthLabels.unknown
  return `Health score: ${props.healthScore}%`
})
</script>

<style scoped>
.resource-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: help;
  transition: outline-offset 0.2s ease;
}

.status-badge:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.status-active {
  background-color: v-bind('colorsConfig.status.active.bg');
  color: v-bind('colorsConfig.status.active.text');
  border: 1px solid v-bind('colorsConfig.status.active.border');
}

.status-deprecated {
  background-color: v-bind('colorsConfig.status.deprecated.bg');
  color: v-bind('colorsConfig.status.deprecated.text');
  border: 1px solid v-bind('colorsConfig.status.deprecated.border');
}

.status-discontinued {
  background-color: v-bind('colorsConfig.status.discontinued.bg');
  color: v-bind('colorsConfig.status.discontinued.text');
  border: 1px solid v-bind('colorsConfig.status.discontinued.border');
}

.status-updated {
  background-color: v-bind('colorsConfig.status.updated.bg');
  color: v-bind('colorsConfig.status.updated.text');
  border: 1px solid v-bind('colorsConfig.status.updated.border');
}

.status-pending {
  background-color: v-bind('colorsConfig.status.pending.bg');
  color: v-bind('colorsConfig.status.pending.text');
  border: 1px solid v-bind('colorsConfig.status.pending.border');
}

.status-unknown {
  background-color: v-bind('colorsConfig.status.unknown.bg');
  color: v-bind('colorsConfig.status.unknown.text');
  border: 1px solid v-bind('colorsConfig.status.unknown.border');
}

.health-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.health-indicator svg {
  width: 1.25rem;
  height: 1.25rem;
}

.health-good {
  color: v-bind('colorsConfig.health.good');
}

.health-warning {
  color: v-bind('colorsConfig.health.fair');
}

.health-bad {
  color: v-bind('colorsConfig.health.poor');
}

.health-unknown {
  color: v-bind('colorsConfig.health.unknown');
}
</style>
