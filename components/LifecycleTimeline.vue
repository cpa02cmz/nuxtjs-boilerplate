<template>
  <div class="lifecycle-timeline">
    <h3 class="timeline-title">
      {{ contentConfig.lifecycle.title }}
    </h3>

    <div
      v-if="statusHistory && statusHistory.length > 0"
      class="timeline"
      role="list"
      aria-label="Status change history"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 -translate-x-4 scale-95"
      >
        <div
          v-for="(change, index) in statusHistory"
          :key="change.id"
          class="timeline-item"
          :class="{
            'timeline-item--recent': index === 0,
            'timeline-item--interactive': !prefersReducedMotion,
          }"
          role="listitem"
          :style="{
            animationDelay: prefersReducedMotion
              ? '0ms'
              : `${index * staggerDelayMs}ms`,
          }"
          tabindex="0"
        >
          <div class="timeline-marker">
            <div
              :class="[
                'marker',
                getMarkerClass(change.toStatus),
                { 'marker--pulse': index === 0 && !prefersReducedMotion },
              ]"
              :title="change.toStatus"
              :aria-label="`Status changed to ${change.toStatus}`"
            >
              <span class="marker-initial">{{
                getStatusInitial(change.toStatus)
              }}</span>
              <!-- Status indicator dot for recent changes -->
              <span
                v-if="index === 0"
                class="marker-indicator"
                aria-hidden="true"
              />
            </div>
            <div
              v-if="index !== statusHistory.length - 1"
              class="timeline-connector"
              :class="{ 'timeline-connector--animated': !prefersReducedMotion }"
              :style="{
                animationDelay: prefersReducedMotion
                  ? '0ms'
                  : `${index * staggerDelayMs + connectorDelayMs}ms`,
              }"
            />
          </div>
          <div class="timeline-content">
            <div class="change-info">
              <span class="status-change">
                <span class="sr-only">Changed from</span>
                <span class="status-from">{{ change.fromStatus }}</span>
                <span
                  class="status-arrow"
                  aria-hidden="true"
                >→</span>
                <span class="sr-only">to</span>
                <span class="status-to">{{ change.toStatus }}</span>
              </span>
              <time
                class="change-date"
                :datetime="change.changedAt"
              >
                {{ formatDate(change.changedAt) }}
              </time>
            </div>
            <div class="change-details">
              <div
                v-if="change.reason"
                class="reason"
              >
                <strong>{{ contentConfig.lifecycle.labels.reason }}</strong>
                {{ change.reason }}
              </div>
              <div
                v-if="change.notes"
                class="notes"
              >
                <strong>{{ contentConfig.lifecycle.labels.notes }}</strong>
                {{ change.notes }}
              </div>
              <div class="changed-by">
                <strong>{{ contentConfig.lifecycle.labels.changedBy }}</strong>
                {{ change.changedBy }}
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div
      v-else
      class="no-history"
    >
      {{ contentConfig.lifecycle.emptyState }}
    </div>

    <div
      v-if="updateHistory && updateHistory.length > 0"
      class="update-history"
    >
      <h4>{{ contentConfig.lifecycle.updateHistoryTitle }}</h4>
      <div
        v-for="update in updateHistory"
        :key="update.id"
        class="update-item"
      >
        <div class="update-header">
          <span class="version">{{ contentConfig.lifecycle.versionPrefix
          }}{{ update.version }}</span>
          <span class="update-date">{{ formatDate(update.updatedAt) }}</span>
        </div>
        <div
          v-if="update.changelog"
          class="changelog"
        >
          {{ update.changelog }}
        </div>
        <ul
          v-if="update.changes && update.changes.length > 0"
          class="changes-list"
        >
          <li
            v-for="(change, idx) in update.changes"
            :key="idx"
          >
            {{ change }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { StatusChange, ResourceUpdate } from '~/types/resource'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { animationConfig } from '~/configs/animation.config'

interface Props {
  statusHistory?: StatusChange[]
  updateHistory?: ResourceUpdate[]
}

defineProps<Props>()

// Palette's micro-UX: Animation and interaction state
const prefersReducedMotion = ref(false)
const staggerDelayMs = animationConfig.lifecycleTimeline?.staggerDelayMs ?? 100
const connectorDelayMs =
  animationConfig.lifecycleTimeline?.connectorDelayMs ?? 50

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Setup and cleanup
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for changes in reduced motion preference
  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }
})

onUnmounted(() => {
  if (mediaQuery && handleMotionChange) {
    mediaQuery.removeEventListener('change', handleMotionChange)
  }
})

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
</script>

<style scoped>
.lifecycle-timeline {
  padding: 1rem;
  border: 1px solid v-bind('componentColorsConfig.lifecycleTimeline.border');
  border-radius: 0.5rem;
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.background'
  );
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

/* Palette's micro-UX: Enhanced timeline item interactions */
.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 200ms ease-out;
  cursor: default;
}

.timeline-item--interactive {
  transition: all 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.timeline-item:hover {
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.hoverBg');
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.timeline-item:focus-visible {
  outline: 2px solid v-bind('componentColorsConfig.lifecycleTimeline.focusRing');
  outline-offset: 2px;
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.focusBg');
}

/* Recent change highlighting */
.timeline-item--recent {
  background-color: v-bind('componentColorsConfig.lifecycleTimeline.recentBg');
  border-left: 3px solid
    v-bind('componentColorsConfig.lifecycleTimeline.recentBorder');
}

.timeline-item--recent:hover {
  background-color: v-bind(
    'componentColorsConfig.lifecycleTimeline.recentHoverBg'
  );
}

/* Entrance animation for items */
.timeline-item {
  animation: fade-in-up 0.4s ease-out backwards;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  position: relative;
  transition:
    transform 200ms ease-out,
    box-shadow 200ms ease-out;
}

/* Palette's micro-UX: Marker hover effect */
.timeline-item:hover .marker {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Marker pulse animation for recent changes */
.marker--pulse {
  animation: marker-pulse 2s ease-in-out infinite;
}

@keyframes marker-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
}

/* Status indicator dot */
.marker-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background-color: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  animation: indicator-blink 2s ease-in-out infinite;
}

@keyframes indicator-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
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
  position: relative;
  overflow: hidden;
}

/* Palette's micro-UX: Animated connector line */
.timeline-connector--animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    v-bind('componentColorsConfig.lifecycleTimeline.connectorHighlight') 50%,
    transparent 100%
  );
  animation: connector-flow 2s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes connector-flow {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Status transition styling */
.status-from {
  color: v-bind('componentColorsConfig.lifecycleTimeline.statusFrom');
  text-decoration: line-through;
  opacity: 0.7;
}

.status-arrow {
  color: v-bind('componentColorsConfig.lifecycleTimeline.statusArrow');
  font-weight: bold;
  transition: transform 200ms ease;
}

.timeline-item:hover .status-arrow {
  transform: translateX(4px);
}

.status-to {
  color: v-bind('componentColorsConfig.lifecycleTimeline.statusTo');
  position: relative;
}

.status-to::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: currentColor;
  transform: scaleX(0);
  transition: transform 200ms ease;
}

.timeline-item:hover .status-to::after {
  transform: scaleX(1);
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

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .timeline-item {
    animation: none;
    transition: none;
  }

  .timeline-item:hover {
    transform: none;
  }

  .timeline-connector--animated::before {
    animation: none;
    display: none;
  }

  .marker--pulse {
    animation: none;
  }

  .marker-indicator {
    animation: none;
  }

  .timeline-item:hover .marker {
    transform: none;
  }

  .timeline-item:hover .status-arrow {
    transform: none;
  }

  .status-to::after {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .timeline-item {
    border: 1px solid currentColor;
  }

  .timeline-item:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .marker {
    border: 2px solid currentColor;
  }
}
</style>
