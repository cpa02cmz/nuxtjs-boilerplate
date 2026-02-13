<template>
  <div
    class="review-queue"
    :class="{ 'review-queue--reduced-motion': prefersReducedMotion }"
  >
    <!-- Queue Header with Progress -->
    <div class="queue-header">
      <div class="queue-title-section">
        <h2 class="queue-title">
          {{ contentConfig.reviewQueue.title }}
        </h2>

        <!-- Queue Progress Ring - Palette's micro-UX delight! -->
        <div
          v-if="totalSubmissions > 0"
          class="queue-progress-wrapper"
          :title="progressTooltip"
        >
          <svg
            class="queue-progress-ring"
            :width="progressRingSize"
            :height="progressRingSize"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <!-- Background Circle -->
            <circle
              class="queue-progress-bg"
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke-width="3"
            />
            <!-- Progress Circle -->
            <circle
              class="queue-progress-fill"
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke-width="3"
              :stroke-dasharray="progressCircumference"
              :stroke-dashoffset="progressStrokeDashOffset"
              stroke-linecap="round"
              :class="{ 'queue-progress-fill--complete': isQueueComplete }"
            />
          </svg>
          <span
            class="queue-progress-text"
            :class="{ 'queue-progress-text--complete': isQueueComplete }"
          >
            {{ reviewedCount }}/{{ totalSubmissions }}
          </span>

          <!-- Celebration sparkles when complete -->
          <span
            v-if="isQueueComplete && !prefersReducedMotion"
            class="queue-complete-sparkles"
            aria-hidden="true"
          >
            <span
              v-for="n in 3"
              :key="n"
              class="sparkle"
              :class="`sparkle-${n}`"
            >✨</span>
          </span>
        </div>
      </div>

      <div class="queue-filters">
        <select
          v-model="statusFilter"
          class="filter-select"
          :aria-label="
            contentConfig.reviewQueue.aria?.filterByStatus || 'Filter by status'
          "
        >
          <option value="">
            {{ contentConfig.reviewQueue.filters.allStatuses }}
          </option>
          <option value="pending">
            {{ contentConfig.reviewQueue.filters.pending }}
          </option>
          <option value="approved">
            {{ contentConfig.reviewQueue.filters.approved }}
          </option>
          <option value="rejected">
            {{ contentConfig.reviewQueue.filters.rejected }}
          </option>
        </select>
        <input
          v-model="categoryFilter"
          type="text"
          :placeholder="moderationConfig.ui.categoryFilterPlaceholder"
          class="filter-input"
          :aria-label="
            contentConfig.reviewQueue.aria?.filterByCategory ||
              'Filter by category'
          "
        >
      </div>
    </div>

    <!-- Screen Reader Announcement -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcementText }}
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="loading-state"
      role="status"
      aria-live="polite"
    >
      <div class="loading-spinner-wrapper">
        <LoadingSpinner
          size="medium"
          :label="contentConfig.reviewQueue.loading"
          state="loading"
        />
      </div>
    </div>

    <!-- Submissions List with Staggered Animation -->
    <TransitionGroup
      v-else-if="filteredSubmissions.length > 0"
      name="submission-card"
      tag="div"
      class="submissions-list"
      :class="{ 'animations-enabled': !prefersReducedMotion }"
      appear
    >
      <article
        v-for="(submission, index) in filteredSubmissions"
        :key="submission.id"
        class="submission-card"
        :class="{
          'submission-card--hover': hoveredCard === submission.id,
          'submission-card--new': isNewSubmission(submission),
        }"
        :style="getCardStyle(index)"
        role="listitem"
        tabindex="0"
        @mouseenter="hoveredCard = submission.id"
        @mouseleave="hoveredCard = null"
        @keydown="e => handleCardKeydown(e, index)"
      >
        <!-- Card Shine Effect on Hover -->
        <div
          v-if="!prefersReducedMotion"
          class="card-shine"
          aria-hidden="true"
        />

        <div class="submission-header">
          <h3 class="submission-title">
            {{ submission.resourceData?.title }}
          </h3>
          <span
            :class="['status-badge', `status-${submission.status}`]"
            role="status"
          >
            {{ submission.status }}
          </span>
        </div>

        <div class="submission-details">
          <p class="description">
            {{ submission.resourceData?.description }}
          </p>
          <div class="meta-info">
            <span class="meta-item category">
              <svg
                class="meta-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
                />
              </svg>
              {{ contentConfig.reviewQueue.labels.category }}
              <strong>{{ submission.resourceData?.category }}</strong>
            </span>
            <span class="meta-item submitted-by">
              <svg
                class="meta-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ contentConfig.reviewQueue.labels.submittedBy }}
              <strong>{{ submission.submittedBy }}</strong>
            </span>
            <span class="meta-item submitted-at">
              <svg
                class="meta-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ contentConfig.reviewQueue.labels.submittedAt }}
              <strong>{{ formatDate(submission.submittedAt) }}</strong>
            </span>
          </div>

          <!-- Tags with staggered animation -->
          <div
            v-if="submission.resourceData?.tags?.length"
            class="tags"
          >
            <span
              v-for="(tag, tagIndex) in submission.resourceData.tags.slice(
                0,
                3
              )"
              :key="tag"
              class="tag"
              :style="getTagStyle(tagIndex)"
            >
              {{ tag }}
            </span>
            <span
              v-if="submission.resourceData.tags.length > 3"
              class="tag tag-more"
            >
              +{{ submission.resourceData.tags.length - 3 }}
            </span>
          </div>
        </div>

        <div class="submission-actions">
          <NuxtLink
            :to="`/moderation/review/${submission.id}`"
            class="btn btn-primary"
            :class="{ 'btn--hover': hoveredCard === submission.id }"
          >
            <span class="btn-text">{{
              contentConfig.reviewQueue.actions.review
            }}</span>
            <svg
              class="btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </div>
      </article>
    </TransitionGroup>

    <!-- Enhanced Empty State -->
    <div
      v-else
      class="empty-state"
      role="status"
      aria-live="polite"
    >
      <div
        class="empty-state-illustration"
        aria-hidden="true"
      >
        <!-- Animated Background Circle -->
        <div
          v-if="!prefersReducedMotion"
          class="empty-bg-circle"
        />

        <!-- Checkmark Icon -->
        <div class="empty-icon-wrapper">
          <svg
            class="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              class="checkmark-path"
              d="M20 6L9 17l-5-5"
              :class="{ 'animate-draw': !prefersReducedMotion }"
            />
          </svg>
        </div>

        <!-- Floating Particles -->
        <div
          v-if="!prefersReducedMotion"
          class="floating-particles"
        >
          <span
            v-for="n in 3"
            :key="n"
            class="particle"
            :class="`particle-${n}`"
          />
        </div>
      </div>

      <h3 class="empty-state-title">
        {{ emptyStateTitle }}
      </h3>
      <p class="empty-state-description">
        {{ emptyStateDescription }}
      </p>

      <!-- Quick Action Button -->
      <button
        v-if="hasActiveFilters"
        class="btn btn-secondary"
        @click="clearFilters"
      >
        <svg
          class="btn-icon-left"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        {{ contentConfig.reviewQueue.clearFilters || 'Clear filters' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useReviewQueue } from '~/composables/useReviewQueue'
import type { Submission } from '~/types/submission'
import { moderationConfig } from '~/configs/moderation.config'
import { contentConfig } from '~/configs/content.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { animationConfig } from '~/configs/animation.config'
import { EASING } from '~/configs/easing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'

interface Props {
  initialSubmissions?: Submission[]
}

const props = withDefaults(defineProps<Props>(), {
  initialSubmissions: () => [],
})

const {
  loading,
  error: _error,
  statusFilter,
  categoryFilter,
  filteredSubmissions,
  totalSubmissions,
  reviewedCount,
  formatDate,
  isNewSubmission,
  clearFilters,
} = useReviewQueue(props.initialSubmissions)

// Animation and interaction state
const prefersReducedMotion = ref(false)
const hoveredCard = ref<string | null>(null)
const announcementText = ref('')

// Progress ring configuration
const progressRingSize = 40
const progressRadius = 16
const progressCircumference = 2 * Math.PI * progressRadius

// Computed progress
const progressPercentage = computed(() => {
  if (totalSubmissions.value === 0) return 0
  return (reviewedCount.value / totalSubmissions.value) * 100
})

const progressStrokeDashOffset = computed(() => {
  return (
    progressCircumference -
    (progressPercentage.value / 100) * progressCircumference
  )
})

const isQueueComplete = computed(() => {
  return (
    reviewedCount.value > 0 && reviewedCount.value === totalSubmissions.value
  )
})

const progressTooltip = computed(() => {
  return `${reviewedCount.value} of ${totalSubmissions.value} submissions reviewed (${Math.round(progressPercentage.value)}%)`
})

const hasActiveFilters = computed(() => {
  return statusFilter.value !== '' || categoryFilter.value !== ''
})

const emptyStateTitle = computed(() => {
  if (hasActiveFilters.value) {
    return contentConfig.reviewQueue.emptyFilteredTitle || 'No matches found'
  }
  return contentConfig.reviewQueue.emptyAllTitle || 'All caught up!'
})

const emptyStateDescription = computed(() => {
  if (hasActiveFilters.value) {
    return (
      contentConfig.reviewQueue.emptyFilteredDesc ||
      'Try adjusting your filters to see more submissions.'
    )
  }
  return (
    contentConfig.reviewQueue.emptyAllDesc ||
    'There are no submissions waiting for review. Great job!'
  )
})

// Card style with staggered entrance animation
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  const staggerDelay = animationConfig.card.staggerDelayMs
  const maxDelay = animationConfig.card.maxDelayMs
  const delay = Math.min(index * staggerDelay, maxDelay)

  return {
    '--card-index': index,
    '--stagger-delay': `${delay}ms`,
    animationDelay: `${delay}ms`,
  }
}

// Tag style with mini stagger
const getTagStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}

  return {
    animationDelay: `${index * 50}ms`,
  }
}

// Keyboard navigation
const handleCardKeydown = (event: KeyboardEvent, index: number) => {
  const cards = document.querySelectorAll('.submission-card')

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (index < cards.length - 1) {
        ;(cards[index + 1] as HTMLElement)?.focus()
        announcementText.value = `Card ${index + 2} of ${cards.length}`
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (index > 0) {
        ;(cards[index - 1] as HTMLElement)?.focus()
        announcementText.value = `Card ${index} of ${cards.length}`
      }
      break
    case 'Home':
      event.preventDefault()
      ;(cards[0] as HTMLElement)?.focus()
      announcementText.value = `Card 1 of ${cards.length}`
      break
    case 'End':
      event.preventDefault()
      ;(cards[cards.length - 1] as HTMLElement)?.focus()
      announcementText.value = `Card ${cards.length} of ${cards.length}`
      break
  }

  // Clear announcement after screen reader has time to process
  setTimeout(() => {
    announcementText.value = ''
  }, 1000)
}

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Lifecycle
let mediaQuery: MediaQueryList | null = null
let handleMotionChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

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
</script>

<style scoped>
/* Base Styles */
.review-queue {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Styles */
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.queue-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.queue-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.text.primary');
}

/* Progress Ring Styles */
.queue-progress-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.queue-progress-ring {
  transform: rotate(-90deg);
}

.queue-progress-bg {
  stroke: v-bind('componentColorsConfig.reviewQueue.progressBg');
}

.queue-progress-fill {
  stroke: v-bind('componentColorsConfig.reviewQueue.progressFill');
  transition: stroke-dashoffset
    v-bind('`${animationConfig.transition.normal.durationMs}ms`') ease-out;
}

.queue-progress-fill--complete {
  stroke: v-bind('componentColorsConfig.reviewQueue.progressComplete');
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%,
  100% {
    filter: drop-shadow(
      0 0 2px v-bind('componentColorsConfig.reviewQueue.progressComplete')
    );
  }
  50% {
    filter: drop-shadow(
      0 0 6px v-bind('componentColorsConfig.reviewQueue.progressComplete')
    );
  }
}

.queue-progress-text {
  position: absolute;
  font-size: 0.625rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.text.secondary');
  transition: color 0.3s ease;
}

.queue-progress-text--complete {
  color: v-bind('componentColorsConfig.reviewQueue.progressComplete');
}

/* Celebration Sparkles */
.queue-complete-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 0.75rem;
  opacity: 0;
  animation: sparkle-burst 1s ease-out forwards;
}

.sparkle-1 {
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
}

.sparkle-2 {
  top: 50%;
  right: -8px;
  transform: translateY(-50%);
  animation-delay: 0.1s;
}

.sparkle-3 {
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.2s;
}

@keyframes sparkle-burst {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(360deg);
  }
}

/* Filter Styles */
.queue-filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid v-bind('componentColorsConfig.border.default');
  border-radius: 0.5rem;
  background: v-bind('componentColorsConfig.background.input');
  color: v-bind('componentColorsConfig.text.primary');
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: v-bind('componentColorsConfig.border.focus');
  box-shadow: 0 0 0 3px v-bind('componentColorsConfig.focus.ring');
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner-wrapper {
  padding: 2rem;
}

/* Submissions List */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Submission Card */
.submission-card {
  position: relative;
  border: 1px solid v-bind('componentColorsConfig.border.light');
  border-radius: 0.75rem;
  padding: 1.25rem;
  background: v-bind('componentColorsConfig.background.card');
  box-shadow: v-bind('shadowsConfig.reviewQueue.cardShadow');
  transition: all 0.3s v-bind('EASING.MATERIAL_STANDARD');
  overflow: hidden;
}

.submission-card:focus {
  outline: none;
  border-color: v-bind('componentColorsConfig.border.focus');
  box-shadow: 0 0 0 3px v-bind('componentColorsConfig.focus.ring');
}

/* Hover Lift Effect */
.submission-card--hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: v-bind('shadowsConfig.reviewQueue.cardHoverShadow');
}

/* Card Shine Effect */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
  pointer-events: none;
}

.submission-card--hover .card-shine {
  left: 150%;
}

/* Submission Header */
.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.submission-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.text.primary');
  flex: 1;
  line-height: 1.4;
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  flex-shrink: 0;
}

.status-pending {
  background: v-bind('moderationConfig.statusColors.pending.bg');
  color: v-bind('moderationConfig.statusColors.pending.text');
}

.status-approved {
  background: v-bind('moderationConfig.statusColors.approved.bg');
  color: v-bind('moderationConfig.statusColors.approved.text');
}

.status-rejected {
  background: v-bind('moderationConfig.statusColors.rejected.bg');
  color: v-bind('moderationConfig.statusColors.rejected.text');
}

/* Submission Details */
.submission-details {
  margin-bottom: 1rem;
}

.description {
  color: v-bind('componentColorsConfig.text.secondary');
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
  font-size: 0.9375rem;
}

/* Meta Info */
.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: v-bind('componentColorsConfig.text.tertiary');
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-item strong {
  color: v-bind('componentColorsConfig.text.secondary');
  font-weight: 500;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  background: v-bind('componentColorsConfig.background.tag');
  color: v-bind('componentColorsConfig.text.tag');
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0;
  animation: tag-fade-in 0.3s ease-out forwards;
}

.tag-more {
  background: v-bind('componentColorsConfig.background.tagMore');
  color: v-bind('componentColorsConfig.text.tagMore');
}

@keyframes tag-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Submission Actions */
.submission-actions {
  display: flex;
  justify-content: flex-end;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: v-bind('componentColorsConfig.button.primary.bg');
  color: v-bind('componentColorsConfig.button.primary.text');
}

.btn-primary:hover,
.btn--hover {
  background: v-bind('componentColorsConfig.button.primary.hoverBg');
  transform: translateX(4px);
}

.btn-secondary {
  background: v-bind('componentColorsConfig.button.secondary.bg');
  color: v-bind('componentColorsConfig.button.secondary.text');
  border: 1px solid v-bind('componentColorsConfig.border.light');
}

.btn-secondary:hover {
  background: v-bind('componentColorsConfig.button.secondary.hoverBg');
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.btn--hover .btn-icon {
  transform: translateX(2px);
}

.btn-icon-left {
  width: 1rem;
  height: 1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 0.5rem;
}

.empty-bg-circle {
  position: absolute;
  inset: 0;
  background: v-bind('componentColorsConfig.reviewQueue.emptyBg');
  border-radius: 50%;
  opacity: 0.5;
  animation: empty-bg-pulse 3s ease-in-out infinite;
}

@keyframes empty-bg-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}

.empty-icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: v-bind('componentColorsConfig.reviewQueue.emptyIcon');
}

.checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
}

.checkmark-path.animate-draw {
  animation: checkmark-draw 0.8s ease-out forwards;
  animation-delay: 0.3s;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Floating Particles */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: v-bind('componentColorsConfig.reviewQueue.particleColor');
  border-radius: 50%;
  opacity: 0;
}

.particle-1 {
  top: 20%;
  right: 10%;
  animation: particle-float 2s ease-in-out infinite;
  animation-delay: 0s;
}

.particle-2 {
  bottom: 25%;
  left: 15%;
  animation: particle-float 2.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.particle-3 {
  top: 40%;
  left: 10%;
  animation: particle-float 2.2s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes particle-float {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-12px) scale(1);
  }
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('componentColorsConfig.text.primary');
  margin: 0;
}

.empty-state-description {
  color: v-bind('componentColorsConfig.text.secondary');
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
}

/* Staggered Entrance Animation */
.submissions-list.animations-enabled .submission-card {
  opacity: 0;
  transform: translateY(20px);
  animation: card-enter 0.5s v-bind('EASING.MATERIAL_STANDARD') forwards;
  animation-delay: var(--stagger-delay, 0ms);
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition Group Animations */
.submission-card-enter-active,
.submission-card-leave-active {
  transition: all 0.4s v-bind('EASING.MATERIAL_STANDARD');
}

.submission-card-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.submission-card-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.submission-card-move {
  transition: transform 0.3s v-bind('EASING.MATERIAL_STANDARD');
}

/* Screen Reader Only */
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

/* Reduced Motion Support */
.review-queue--reduced-motion .submission-card,
.review-queue--reduced-motion .tag,
.review-queue--reduced-motion .queue-progress-fill {
  animation: none !important;
  transition: opacity 0.2s ease !important;
}

.review-queue--reduced-motion .card-shine,
.review-queue--reduced-motion .empty-bg-circle,
.review-queue--reduced-motion .floating-particles,
.review-queue--reduced-motion .queue-complete-sparkles {
  display: none;
}

/* Mobile Adjustments */
@media (max-width: 640px) {
  .review-queue {
    padding: 1rem;
  }

  .queue-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .queue-filters {
    width: 100%;
  }

  .filter-select,
  .filter-input {
    flex: 1;
    min-width: 0;
  }

  .submission-card {
    padding: 1rem;
  }

  .meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .submission-card {
    border-width: 2px;
  }

  .status-badge {
    border: 1px solid currentColor;
  }

  .btn:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .card-shine {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
  }
}
</style>
