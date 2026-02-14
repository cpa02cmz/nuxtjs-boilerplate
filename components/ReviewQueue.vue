<template>
  <div class="review-queue">
    <!-- Header with counter animation -->
    <div class="queue-header">
      <div class="queue-title-wrapper">
        <h2>{{ contentConfig.reviewQueue.title }}</h2>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-50"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-50"
        >
          <span
            v-if="filteredSubmissions.length > 0"
            class="submission-count-badge"
            :class="{
              'pulse-animation': hasNewSubmissions && !prefersReducedMotion,
            }"
            aria-live="polite"
          >
            {{ filteredSubmissions.length }}
          </span>
        </Transition>
      </div>
      <div class="queue-filters">
        <select
          v-model="statusFilter"
          class="filter-select"
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
        >
      </div>
    </div>

    <!-- Loading State with Skeleton Animation -->
    <div
      v-if="loading"
      class="loading-state"
    >
      <div class="skeleton-wrapper">
        <div
          v-for="n in 3"
          :key="n"
          class="skeleton-card"
          :class="{ 'skeleton-wave': !prefersReducedMotion }"
          :style="{ animationDelay: `${(n - 1) * 150}ms` }"
        >
          <div class="skeleton-header">
            <div class="skeleton-title" />
            <div class="skeleton-badge" />
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line" />
            <div class="skeleton-line short" />
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-tags">
              <div class="skeleton-tag" />
              <div class="skeleton-tag" />
            </div>
            <div class="skeleton-button" />
          </div>
        </div>
      </div>
    </div>

    <!-- Submissions List with Stagger Animation -->
    <TransitionGroup
      v-else-if="filteredSubmissions.length > 0"
      name="submission-list"
      tag="div"
      class="submissions-list"
      :class="{ 'reduced-motion': prefersReducedMotion }"
    >
      <div
        v-for="(submission, index) in filteredSubmissions"
        :key="submission.id"
        class="submission-card"
        :class="{
          'is-hovered': hoveredCard === submission.id,
          'submission-enter': !prefersReducedMotion,
        }"
        :style="getCardStyle(index)"
        @mouseenter="hoveredCard = submission.id"
        @mouseleave="hoveredCard = null"
        @focusin="hoveredCard = submission.id"
        @focusout="hoveredCard = null"
      >
        <div class="submission-header">
          <h3>{{ submission.resourceData?.title }}</h3>
          <span
            :class="['status-badge', `status-${submission.status}`]"
            :aria-label="`Status: ${submission.status}`"
          >
            <span
              class="status-icon"
              aria-hidden="true"
            >
              <svg
                v-if="submission.status === 'pending'"
                class="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="submission.status === 'approved'"
                class="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="submission.status === 'rejected'"
                class="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            <span class="status-text">{{ submission.status }}</span>
          </span>
        </div>

        <div class="submission-details">
          <p class="description">
            {{ submission.resourceData?.description }}
          </p>
          <div class="meta-info">
            <span class="meta-item">
              <svg
                class="meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              {{ submission.resourceData?.category }}
            </span>
            <span class="meta-item">
              <svg
                class="meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {{ submission.submittedBy }}
            </span>
            <span class="meta-item">
              <svg
                class="meta-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ formatDate(submission.submittedAt) }}
            </span>
          </div>

          <div class="tags">
            <span
              v-for="tag in submission.resourceData?.tags || []"
              :key="tag"
              class="tag"
              :class="{ 'tag-hover': hoveredTag === tag }"
              @mouseenter="hoveredTag = tag"
              @mouseleave="hoveredTag = null"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="submission-actions">
          <NuxtLink
            :to="`/moderation/review/${submission.id}`"
            class="btn btn-primary"
            :class="{
              'btn-pulse':
                hoveredCard === submission.id && !prefersReducedMotion,
            }"
          >
            <span class="btn-text">{{
              contentConfig.reviewQueue.actions.review
            }}</span>
            <svg
              class="btn-arrow"
              :class="{
                'arrow-move':
                  hoveredCard === submission.id && !prefersReducedMotion,
              }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </TransitionGroup>

    <!-- Empty State with Illustration -->
    <div
      v-else
      class="empty-state"
    >
      <div
        class="empty-illustration"
        :class="{ 'float-animation': !prefersReducedMotion }"
        aria-hidden="true"
      >
        <svg
          class="empty-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <div class="empty-decoration" />
      </div>
      <p class="empty-title">
        {{ contentConfig.reviewQueue.emptyState }}
      </p>
      <p class="empty-subtitle">
        New submissions will appear here
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useReviewQueue } from '~/composables/useReviewQueue'
import type { Submission } from '~/types/submission'
import { moderationConfig } from '~/configs/moderation.config'
import { contentConfig } from '~/configs/content.config'
import { shadowsConfig } from '~/configs/shadows.config'
import { uiConfig } from '~/configs/ui.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { zIndexConfig } from '~/configs/z-index.config'

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
  formatDate,
} = useReviewQueue(props.initialSubmissions)

// Micro-UX State
const hoveredCard = ref<string | null>(null)
const hoveredTag = ref<string | null>(null)
const prefersReducedMotion = ref(false)
const hasNewSubmissions = ref(false)
const previousCount = ref(0)

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

// Get staggered card animation style
const getCardStyle = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = index * animationConfig.reviewQueue?.staggerDelayMs || 100
  return {
    '--card-index': index,
    animationDelay: `${delay}ms`,
  } as Record<string, string>
}

// Watch for new submissions
watch(
  () => filteredSubmissions.value.length,
  (newCount, oldCount) => {
    if (newCount > (oldCount || 0) && oldCount !== undefined) {
      hasNewSubmissions.value = true
      setTimeout(() => {
        hasNewSubmissions.value = false
      }, 2000)
    }
    previousCount.value = newCount
  },
  { immediate: true }
)

// Setup on mount
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
.review-queue {
  padding: 1rem;
}

/* Header Styles with Badge */
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.queue-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.queue-header h2 {
  margin: 0;
  color: var(--color-text);
}

.submission-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.pulse-animation {
  animation: badge-pulse 0.6s ease-out;
}

@keyframes badge-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
  }
  100% {
    transform: scale(1);
  }
}

.queue-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  background: var(--color-background);
  color: var(--color-text);
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`') ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: v-bind('componentColorsConfig.reviewQueue.focus.border');
  box-shadow: 0 0 0 3px
    rgba(v-bind('componentColorsConfig.reviewQueue.focus.shadow'), 0.2);
  transform: translateY(-1px);
}

/* Loading Skeleton State */
.loading-state {
  padding: 1rem 0;
}

.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-card {
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  padding: 1rem;
  background: var(--color-card-background);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skeleton-title {
  width: 60%;
  height: 1.25rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
}

.skeleton-badge {
  width: 5rem;
  height: 1.5rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 9999px;
}

.skeleton-body {
  margin-bottom: 1rem;
}

.skeleton-line {
  width: 100%;
  height: 0.875rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-line.short {
  width: 75%;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-tags {
  display: flex;
  gap: 0.5rem;
}

.skeleton-tag {
  width: 4rem;
  height: 1.5rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
}

.skeleton-button {
  width: 5rem;
  height: 2rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
}

.skeleton-wave {
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Submissions List */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submission-card {
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  padding: 1.25rem;
  background: var(--color-card-background);
  box-shadow: v-bind('shadowsConfig.reviewQueue.cardShadow');
  transition: all v-bind('`${animationConfig.cssTransitions.standardSec}`')
    v-bind('easingConfig.cubicBezier.standard');
  will-change: transform, box-shadow;
}

.submission-card:hover,
.submission-card.is-hovered {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.submission-enter {
  animation: card-enter
    v-bind('`${animationConfig.reviewQueue?.entranceDurationMs || 400}ms`')
    v-bind('easingConfig.cubicBezier.spring') forwards;
  opacity: 0;
}

@keyframes card-enter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    filter: blur(4px);
  }
  70% {
    opacity: 1;
    transform: translateY(-2px) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Vue Transition Group Styles */
.submission-list-enter-active {
  transition: all v-bind('`${animationConfig.cssTransitions.slowerSec}`')
    v-bind('easingConfig.cubicBezier.spring');
}

.submission-list-leave-active {
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`') ease-in;
  position: absolute;
}

.submission-list-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.95);
}

.submission-list-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.submission-list-move {
  transition: transform v-bind('`${animationConfig.cssTransitions.slowerSec}`')
    v-bind('easingConfig.cubicBezier.standard');
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.submission-header h3 {
  margin: 0;
  color: var(--color-text);
  flex: 1;
  font-size: 1.125rem;
  font-weight: 600;
}

/* Status Badge with Icons */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`') ease;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.status-pending {
  background: v-bind('moderationConfig.statusColors.pending.bg');
  color: v-bind('moderationConfig.statusColors.pending.text');
  animation: pending-pulse 2s ease-in-out infinite;
}

.status-approved {
  background: v-bind('moderationConfig.statusColors.approved.bg');
  color: v-bind('moderationConfig.statusColors.approved.text');
}

.status-rejected {
  background: v-bind('moderationConfig.statusColors.rejected.bg');
  color: v-bind('moderationConfig.statusColors.rejected.text');
}

@keyframes pending-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0);
  }
}

.submission-details {
  margin-bottom: 1rem;
}

.description {
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  transition: color v-bind('`${animationConfig.cssTransitions.fastSec}`') ease;
}

.meta-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
}

.meta-item:hover {
  color: var(--color-text);
}

.meta-item:hover .meta-icon {
  opacity: 1;
}

/* Tags with Hover Effects */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  background: rgba(59, 130, 246, 0.1);
  color: v-bind('componentColorsConfig.reviewQueue.action.approve');
  padding: 0.25rem 0.625rem;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  font-size: 0.75rem;
  font-weight: 500;
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`')
    v-bind('easingConfig.cubicBezier.standard');
  cursor: default;
}

.tag-hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
}

/* Enhanced Button */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 500;
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`')
    v-bind('easingConfig.cubicBezier.standard');
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

.btn-pulse {
  animation: btn-pulse 0.4s ease-out;
}

@keyframes btn-pulse {
  0%,
  100% {
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.6);
  }
}

.btn-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform v-bind('`${animationConfig.cssTransitions.fastSec}`')
    ease;
}

.arrow-move {
  transform: translateX(3px);
}

/* Empty State with Illustration */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--color-text-secondary);
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: v-bind('componentColorsConfig.reviewQueue.divider');
  z-index: v-bind('zIndexConfig.floatingLabel');
}

.empty-decoration {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 50%;
  opacity: 0.5;
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
  margin: 0;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .submission-count-badge,
  .status-pending,
  .tag,
  .btn,
  .btn-arrow,
  .meta-item,
  .submission-card,
  .empty-illustration {
    animation: none !important;
    transition: opacity v-bind('`${animationConfig.cssTransitions.fastSec}`')
      ease !important;
    transform: none !important;
  }

  .skeleton-wave {
    animation: none !important;
  }

  .submission-enter {
    animation: none !important;
    opacity: 1 !important;
  }

  .submission-list-enter-active,
  .submission-list-leave-active,
  .submission-list-move {
    transition: opacity v-bind('`${animationConfig.cssTransitions.fastSec}`')
      ease !important;
  }

  .submission-list-enter-from,
  .submission-list-leave-to {
    transform: none !important;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .status-badge {
    border: 2px solid currentColor;
  }

  .tag {
    border: 1px solid currentColor;
  }

  .btn-primary {
    border: 2px solid currentColor;
  }
}

/* Focus Styles */
.submission-card:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.btn:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
}
</style>
