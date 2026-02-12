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
        v-if="healthScore >= limitsConfig.healthScore.excellent"
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
        v-else-if="healthScore >= limitsConfig.healthScore.good"
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
        v-else-if="healthScore >= limitsConfig.healthScore.fair"
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
import { uiConfig } from '../configs/ui.config'
import { limitsConfig } from '../configs/limits.config'
import { themeConfig } from '../configs/theme.config'
import { shadowsConfig } from '../configs/shadows.config'

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
  switch (props.status) {
    case 'active':
      return uiConfig.resourceStatus.labels.active
    case 'deprecated':
      return uiConfig.resourceStatus.labels.deprecated
    case 'discontinued':
      return uiConfig.resourceStatus.labels.discontinued
    case 'updated':
      return uiConfig.resourceStatus.labels.updated
    case 'pending':
      return uiConfig.resourceStatus.labels.pending
    default:
      return uiConfig.resourceStatus.labels.unknown
  }
})

const statusTitle = computed(() => {
  switch (props.status) {
    case 'active':
      return uiConfig.resourceStatus.descriptions.active
    case 'deprecated':
      return uiConfig.resourceStatus.descriptions.deprecated
    case 'discontinued':
      return uiConfig.resourceStatus.descriptions.discontinued
    case 'updated':
      return uiConfig.resourceStatus.descriptions.updated
    case 'pending':
      return uiConfig.resourceStatus.descriptions.pending
    default:
      return uiConfig.resourceStatus.descriptions.unknown
  }
})

const healthClass = computed(() => {
  if (props.healthScore === undefined) return 'health-unknown'
  if (props.healthScore >= limitsConfig.healthScore.excellent)
    return 'health-good'
  if (props.healthScore >= limitsConfig.healthScore.good)
    return 'health-warning'
  return 'health-bad'
})

const healthText = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  if (props.healthScore >= limitsConfig.healthScore.excellent)
    return 'Health: Excellent'
  if (props.healthScore >= limitsConfig.healthScore.good) return 'Health: Good'
  if (props.healthScore >= limitsConfig.healthScore.fair) return 'Health: Fair'
  return 'Health: Poor'
})

const healthLabel = computed(() => {
  if (props.healthScore === undefined) return 'Health status unknown'
  return `Health score: ${props.healthScore}%`
})
</script>

<style scoped>
.resource-status {
  display: flex;
  align-items: center;
  gap: v-bind('`${uiConfig.layout.spacing.md}rem`');
}

.status-badge {
  padding: v-bind('`${uiConfig.layout.spacing.sm}rem`')
    v-bind('`${uiConfig.layout.spacing.lg}rem`');
  border-radius: v-bind('`${uiConfig.layout.borderRadius.sm}rem`');
  font-size: v-bind('`${uiConfig.layout.fontSize.sm}rem`');
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: help;
  transition: all 0.2s ease;
  display: inline-block;
}

.status-badge:hover {
  transform: scale(1.05);
  box-shadow: v-bind('shadowsConfig.colors.black.opacity15');
}

.status-badge:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .status-badge {
    transition: none;
  }

  .status-badge:hover {
    transform: none;
    box-shadow: v-bind('shadowsConfig.colors.black.opacity10');
  }
}

.status-active {
  background-color: v-bind('themeConfig.resourceStatus.active.bg');
  color: v-bind('themeConfig.resourceStatus.active.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.active.border');
}

.status-deprecated {
  background-color: v-bind('themeConfig.resourceStatus.deprecated.bg');
  color: v-bind('themeConfig.resourceStatus.deprecated.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.deprecated.border');
}

.status-discontinued {
  background-color: v-bind('themeConfig.resourceStatus.discontinued.bg');
  color: v-bind('themeConfig.resourceStatus.discontinued.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.discontinued.border');
}

.status-updated {
  background-color: v-bind('themeConfig.resourceStatus.updated.bg');
  color: v-bind('themeConfig.resourceStatus.updated.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.updated.border');
}

.status-pending {
  background-color: v-bind('themeConfig.resourceStatus.pending.bg');
  color: v-bind('themeConfig.resourceStatus.pending.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.pending.border');
}

.status-unknown {
  background-color: v-bind('themeConfig.resourceStatus.unknown.bg');
  color: v-bind('themeConfig.resourceStatus.unknown.text');
  border: 1px solid v-bind('themeConfig.resourceStatus.unknown.border');
}

.health-indicator {
  display: inline-flex;
  align-items: center;
  gap: v-bind('`${uiConfig.layout.spacing.sm}rem`');
}

.health-indicator svg {
  width: 1.25rem;
  height: 1.25rem;
}

.health-good {
  color: v-bind('themeConfig.healthIndicator.good');
}

.health-warning {
  color: v-bind('themeConfig.healthIndicator.warning');
}

.health-bad {
  color: v-bind('themeConfig.healthIndicator.bad');
}

.health-unknown {
  color: v-bind('themeConfig.healthIndicator.unknown');
}
</style>
