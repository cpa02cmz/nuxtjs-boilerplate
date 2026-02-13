<template>
  <div
    class="lifecycle-timeline"
    :class="{ 'lifecycle-timeline--loaded': isLoaded }"
  >
    <h3 class="timeline-title">
      {{ contentConfig.lifecycle.title }}
    </h3>

    <div v-if="statusHistory && statusHistory.length > 0" class="timeline">
      <div
        v-for="(change, index) in statusHistory"
        :key="change.id"
        :aria-label="getItemAriaLabel(change, index)"
        :style="{ '--item-index': index }"
        class="timeline-item"
        role="listitem"
      >
        <div class="timeline-marker">
          <div
            :class="['marker', getMarkerClass(change.toStatus)]"
            :title="change.toStatus"
          >
            {{ getStatusInitial(change.toStatus) }}
          </div>
          <div
            v-if="index !== statusHistory.length - 1"
            class="timeline-connector"
          />
        </div>
        <div class="timeline-content">
          <div class="change-info">
            <span class="status-change"
              >{{ change.fromStatus }} → {{ change.toStatus }}</span
            >
            <span class="change-date">{{ formatDate(change.changedAt) }}</span>
          </div>
          <div class="change-details">
            <div v-if="change.reason" class="reason">
              {{ contentConfig.lifecycle.labels.reason }} {{ change.reason }}
            </div>
            <div v-if="change.notes" class="notes">
              {{ contentConfig.lifecycle.labels.notes }} {{ change.notes }}
            </div>
            <div class="changed-by">
              {{ contentConfig.lifecycle.labels.changedBy }}
              {{ change.changedBy }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-history">
      {{ contentConfig.lifecycle.emptyState }}
    </div>

    <div
      v-if="updateHistory && updateHistory.length > 0"
      class="update-history"
    >
      <h4>{{ contentConfig.lifecycle.updateHistoryTitle }}</h4>
      <div v-for="update in updateHistory" :key="update.id" class="update-item">
        <div class="update-header">
          <span class="version"
            >{{ contentConfig.lifecycle.versionPrefix
            }}{{ update.version }}</span
          >
          <span class="update-date">{{ formatDate(update.updatedAt) }}</span>
        </div>
        <div v-if="update.changelog" class="changelog">
          {{ update.changelog }}
        </div>
        <ul
          v-if="update.changes && update.changes.length > 0"
          class="changes-list"
        >
          <li v-for="(change, idx) in update.changes" :key="idx">
            {{ change }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { StatusChange, ResourceUpdate } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { shadowsConfig } from '~/configs/shadows.config'

interface Props {
  statusHistory?: StatusChange[]
  updateHistory?: ResourceUpdate[]
}

const props = defineProps<Props>()

// Reactive state
const isLoaded = ref(false)
const prefersReducedMotion = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get ARIA label for timeline item
const getItemAriaLabel = (change: StatusChange, index: number): string => {
  const position =
    index === 0
      ? 'Most recent change'
      : `Change ${index + 1} of ${props.statusHistory?.length || 0}`
  const statusChange = `${change.fromStatus} changed to ${change.toStatus}`
  const date = formatDate(change.changedAt)
  return `${position}: ${statusChange} on ${date}`
}

const getMarkerClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'marker-active'
    case 'deprecated':
      return 'marker-deprecated'
    case 'discontinued':
      return 'marker-discontinued'
    case 'updated':
      return 'marker-updated'
    case 'pending':
      return 'marker-pending'
    default:
      return 'marker-unknown'
  }
}

const getStatusInitial = (status: string) => {
  switch (status) {
    case 'active':
      return 'A'
    case 'deprecated':
      return 'D'
    case 'discontinued':
      return 'X'
    case 'updated':
      return 'U'
    case 'pending':
      return 'P'
    default:
      return '?'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Setup on mount
onMounted(() => {
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animation after a short delay
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.lifecycle-timeline {
  padding: 1rem;
  border: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  border-radius: 0.5rem;
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.background'
  );
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.lifecycle-timeline--loaded {
  opacity: 1;
  transform: translateY(0);
}

.timeline-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.title');
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transform: translateX(-20px);
  animation: slide-in 0.5s ease-out forwards;
  animation-delay: calc(var(--item-index) * 100ms);
  transition: transform 0.2s ease-out;
}

@keyframes slide-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.timeline-item:hover {
  transform: translateX(4px);
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
  transition: transform 0.2s ease-out;
  box-shadow: v-bind('shadowsConfig.lifecycleTimeline.default');
}

.timeline-item:hover .marker {
  transform: scale(1.1);
}

.marker-active {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.active'
  );
}

.marker-deprecated {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.deprecated'
  );
}

.marker-discontinued {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.discontinued'
  );
}

.marker-updated {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.updated'
  );
}

.marker-pending {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.pending'
  );
}

.marker-unknown {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.markers.unknown'
  );
}

.timeline-connector {
  width: 2px;
  height: 100%;
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.connector');
  margin-top: 0.5rem;
}

.timeline-content {
  flex: 1;
  padding-bottom: 1rem;
}

.change-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.status-change {
  font-weight: 600;
  color: v-bind('componentColorsConfig.lifecycleTimeline.statusChange');
}

.change-date {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.date');
}

.change-details {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.details');
}

.reason,
.notes,
.changed-by {
  margin: 0.25rem 0;
}

.reason {
  font-weight: 500;
  color: v-bind('componentColorsConfig.lifecycleTimeline.reason');
}

.no-history {
  padding: 1rem;
  text-align: center;
  color: v-bind('componentColorsConfig.lifecycleTimeline.noHistory');
  font-style: italic;
}

.update-history {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
}

.update-history h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.updateHeader');
}

.update-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  border-radius: 0.375rem;
  background-color: v-bind('componentColorsConfig.common.white');
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.version {
  font-weight: 600;
  color: v-bind('componentColorsConfig.lifecycleTimeline.version');
}

.update-date {
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.date');
}

.changelog {
  margin-bottom: 0.5rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.changelog');
}

.changes-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  color: v-bind('componentColorsConfig.lifecycleTimeline.changelog');
}

.changes-list li {
  margin-bottom: 0.25rem;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .lifecycle-timeline {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .timeline-item {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .timeline-item:hover {
    transform: none;
  }

  .timeline-item:hover .marker {
    transform: none;
  }

  .marker {
    transition: none;
  }
}

/* Focus visible support */
.timeline-item:focus {
  outline: 2px solid v-bind('componentColorsConfig.focusRing.color');
  outline-offset: 2px;
}
</style>
