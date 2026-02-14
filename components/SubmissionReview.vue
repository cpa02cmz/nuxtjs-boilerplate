<template>
  <div class="submission-review">
    <!-- Loading State with Skeleton Shimmer - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        class="skeleton-container"
        :class="{ 'skeleton-reduced-motion': prefersReducedMotion }"
      >
        <!-- Header Skeleton -->
        <div class="skeleton-header">
          <div
            class="skeleton-title"
            :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
          />
          <div
            class="skeleton-badge"
            :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
          />
        </div>

        <!-- Content Skeleton -->
        <div class="skeleton-content">
          <div
            v-for="n in 3"
            :key="n"
            class="skeleton-section"
            :style="{ animationDelay: `${(n - 1) * skeletonStaggerMs}ms` }"
          >
            <div
              class="skeleton-section-title"
              :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
            />
            <div class="skeleton-grid">
              <div v-for="i in 4" :key="i" class="skeleton-item">
                <div
                  class="skeleton-label"
                  :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
                />
                <div
                  class="skeleton-value"
                  :class="{ 'skeleton-shimmer': !prefersReducedMotion }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error State with Micro-UX Enhancement -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="error && !loading"
        class="error-container"
        role="alert"
        aria-live="assertive"
      >
        <div class="error-icon-wrapper">
          <svg
            class="error-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p class="error-message">{{ error }}</p>
        <button class="error-retry-btn" @click="fetchSubmission">
          <svg
            class="retry-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ contentConfig.submissionReview.actions.retry || 'Try Again' }}
        </button>
      </div>
    </Transition>

    <!-- Success Celebration Overlay - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <div
        v-if="showSuccessCelebration && !prefersReducedMotion"
        class="success-celebration-overlay"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="success-celebration-content">
          <!-- Animated Checkmark -->
          <div class="success-icon-container">
            <svg
              class="success-checkmark"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle class="success-circle" cx="12" cy="12" r="10" />
              <path class="success-path" d="M7 12l3 3 7-7" />
            </svg>
          </div>
          <span class="success-text">{{ successMessage }}</span>
        </div>
        <!-- Confetti Burst -->
        <div class="confetti-container" aria-hidden="true">
          <span
            v-for="n in 8"
            :key="n"
            class="confetti-piece"
            :style="{ '--confetti-index': n }"
          />
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
    >
      <div v-if="submission && !loading && !error" class="review-content">
        <div class="review-header">
          <h1>{{ submission.resourceData?.title }}</h1>
          <span
            :class="['status-badge', `status-${submission.status}`]"
            :aria-label="`Status: ${submission.status}`"
          >
            {{ submission.status }}
          </span>
        </div>

        <div class="review-details">
          <div class="detail-section">
            <h3>{{ contentConfig.submissionReview.sections.resourceInfo }}</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.description
                }}</label>
                <p>{{ submission.resourceData?.description }}</p>
              </div>

              <div class="info-item">
                <label>{{ contentConfig.submissionReview.labels.url }}</label>
                <a
                  :href="submission.resourceData?.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="url-link"
                >
                  {{ submission.resourceData?.url }}
                </a>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.category
                }}</label>
                <span>{{ submission.resourceData?.category }}</span>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.pricingModel
                }}</label>
                <span>{{
                  submission.resourceData?.pricingModel ||
                  contentConfig.submissionReview.values.notAvailable
                }}</span>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.difficulty
                }}</label>
                <span>{{
                  submission.resourceData?.difficulty ||
                  contentConfig.submissionReview.values.notAvailable
                }}</span>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.technologies
                }}</label>
                <div class="tag-list">
                  <span
                    v-for="tech in submission.resourceData?.technology || []"
                    :key="tech"
                    class="tag"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <label>{{ contentConfig.submissionReview.labels.tags }}</label>
                <div class="tag-list">
                  <span
                    v-for="tag in submission.resourceData?.tags || []"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.benefits
                }}</label>
                <ul>
                  <li
                    v-for="benefit in submission.resourceData?.benefits || []"
                    :key="benefit"
                  >
                    {{ benefit }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>
              {{ contentConfig.submissionReview.sections.submissionDetails }}
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.submittedBy
                }}</label>
                <span>{{
                  submission.submittedBy ||
                  contentConfig.submissionReview.values.anonymous
                }}</span>
              </div>

              <div class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.submittedAt
                }}</label>
                <span>{{ formatDate(submission.submittedAt) }}</span>
              </div>

              <div v-if="submission.reviewedAt" class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.reviewedBy
                }}</label>
                <span>{{
                  submission.reviewedBy ||
                  contentConfig.submissionReview.values.notAvailable
                }}</span>
              </div>

              <div v-if="submission.reviewedAt" class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.reviewedAt
                }}</label>
                <span>{{ formatDate(submission.reviewedAt) }}</span>
              </div>

              <div v-if="submission.rejectionReason" class="info-item">
                <label>{{
                  contentConfig.submissionReview.labels.rejectionReason
                }}</label>
                <span class="rejection-reason">{{
                  submission.rejectionReason
                }}</span>
              </div>

              <div v-if="submission.notes" class="info-item">
                <label>{{ contentConfig.submissionReview.labels.notes }}</label>
                <span>{{ submission.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Actions with Enhanced Micro-UX -->
        <Transition
          enter-active-class="transition-all duration-400 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="submission.status === 'pending'" class="review-actions">
            <!-- Approve Action -->
            <div class="action-group action-group-approve">
              <h4>
                {{ contentConfig.submissionReview.actions.approve.title }}
              </h4>
              <button
                class="btn btn-approve"
                :class="{
                  'btn-loading': isApproving,
                  'btn-success': showApproveSuccess,
                }"
                :disabled="isApproving || isRejecting"
                :aria-label="
                  isApproving ? 'Approving submission...' : 'Approve submission'
                "
                @click="handleApprove"
              >
                <!-- Loading Spinner -->
                <svg
                  v-if="isApproving"
                  class="btn-spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="spinner-track"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                  <circle
                    class="spinner-head"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                </svg>

                <!-- Success Checkmark -->
                <svg
                  v-else-if="showApproveSuccess"
                  class="btn-checkmark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

                <span class="btn-text">{{ approveButtonText }}</span>
              </button>
            </div>

            <!-- Reject Action -->
            <div class="action-group action-group-reject">
              <h4>{{ contentConfig.submissionReview.actions.reject.title }}</h4>
              <textarea
                v-model="rejectionReason"
                :placeholder="
                  contentConfig.submissionReview.placeholders.rejectionReason
                "
                class="rejection-textarea"
                :disabled="isRejecting"
                :class="{ 'textarea-disabled': isRejecting }"
              />
              <button
                class="btn btn-reject"
                :class="{ 'btn-loading': isRejecting }"
                :disabled="
                  isApproving || isRejecting || !rejectionReason.trim()
                "
                :aria-label="
                  isRejecting ? 'Rejecting submission...' : 'Reject submission'
                "
                @click="handleReject"
              >
                <!-- Loading Spinner -->
                <svg
                  v-if="isRejecting"
                  class="btn-spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="spinner-track"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                  <circle
                    class="spinner-head"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="3"
                  />
                </svg>

                <span class="btn-text">{{ rejectButtonText }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Screen Reader Announcements -->
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSubmissionReview } from '~/composables/useSubmissionReview'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { uiConfig } from '~/configs/ui.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticSuccess, hapticError, hapticLight } from '~/utils/hapticFeedback'

interface Props {
  submissionId?: string
}

const props = withDefaults(defineProps<Props>(), {
  submissionId: '',
})

// Reactive state for micro-UX
const prefersReducedMotion = ref(false)
const isApproving = ref(false)
const isRejecting = ref(false)
const showApproveSuccess = ref(false)
const showSuccessCelebration = ref(false)
const successMessage = ref('')
const announcement = ref('')

// Get skeleton stagger delay from config
const skeletonStaggerMs = computed(
  () => animationConfig.skeleton.staggerIncrementMs
)

// Use the submission review composable
const {
  loading,
  error,
  submission,
  rejectionReason,
  fetchSubmission,
  approveSubmission,
  rejectSubmission,
} = useSubmissionReview({
  submissionId: props.submissionId,
})

// Computed button text based on state
const approveButtonText = computed(() => {
  if (isApproving.value)
    return (
      contentConfig.submissionReview.actions.approve.loading || 'Approving...'
    )
  if (showApproveSuccess.value)
    return contentConfig.submissionReview.actions.approve.success || 'Approved!'
  return contentConfig.submissionReview.actions.approve.button
})

const rejectButtonText = computed(() => {
  if (isRejecting.value)
    return (
      contentConfig.submissionReview.actions.reject.loading || 'Rejecting...'
    )
  return contentConfig.submissionReview.actions.reject.button
})

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

// Announce to screen readers
const announce = (message: string) => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Handle approve with micro-UX enhancements
const handleApprove = async () => {
  if (isApproving.value || isRejecting.value) return

  isApproving.value = true

  // Haptic feedback when starting action
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  try {
    const success = await approveSubmission()

    if (success) {
      // Show success state on button
      showApproveSuccess.value = true

      // Haptic success feedback
      if (!prefersReducedMotion.value) {
        hapticSuccess()
      }

      // Show celebration overlay
      successMessage.value =
        contentConfig.submissionReview.actions.approve.celebration ||
        'Resource approved successfully!'
      showSuccessCelebration.value = true

      // Announce to screen readers
      announce(successMessage.value)

      // Reset button state after delay
      setTimeout(() => {
        showApproveSuccess.value = false
      }, animationConfig.submissionReview.buttonSuccessDurationMs || 2000)

      // Hide celebration after delay
      setTimeout(() => {
        showSuccessCelebration.value = false
      }, animationConfig.submissionReview.celebrationDurationMs || 3000)
    } else {
      handleError('approve')
    }
  } catch {
    handleError('approve')
  } finally {
    isApproving.value = false
  }
}

// Handle reject with micro-UX enhancements
const handleReject = async () => {
  if (isApproving.value || isRejecting.value || !rejectionReason.value.trim())
    return

  isRejecting.value = true

  // Haptic feedback when starting action
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  try {
    const success = await rejectSubmission(rejectionReason.value)

    if (success) {
      // Haptic success feedback
      if (!prefersReducedMotion.value) {
        hapticSuccess()
      }

      // Announce to screen readers
      announce(
        contentConfig.submissionReview.actions.reject.success ||
          'Resource rejected'
      )
    } else {
      handleError('reject')
    }
  } catch {
    handleError('reject')
  } finally {
    isRejecting.value = false
  }
}

// Handle errors with haptic feedback
const handleError = (action: 'approve' | 'reject') => {
  if (!prefersReducedMotion.value) {
    hapticError()
  }

  const errorMsg =
    error.value ||
    (action === 'approve'
      ? contentConfig.submissionReview.errors.approveFailed
      : contentConfig.submissionReview.errors.rejectFailed)

  announce(errorMsg || 'Action failed')
}

// Format date for display
const formatDate = (dateString?: string) => {
  if (!dateString) return contentConfig.submissionReview.values.notAvailable
  return new Date(dateString).toLocaleString()
}

// Initialize on mount
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)
  }

  fetchSubmission()
})
</script>

<style scoped>
/* Base Container */
.submission-review {
  padding: 1rem;
  position: relative;
}

/* Skeleton Loading States - Palette's micro-UX delight! */
.skeleton-container {
  padding: 1rem;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-title {
  height: 2rem;
  width: 60%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
}

.skeleton-badge {
  height: 1.5rem;
  width: 5rem;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.skeleton-section {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  padding: 1.5rem;
}

.skeleton-section-title {
  height: 1.25rem;
  width: 30%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  margin-bottom: 1rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-label {
  height: 0.875rem;
  width: 40%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
}

.skeleton-value {
  height: 1rem;
  width: 80%;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
}

/* Shimmer Animation */
.skeleton-shimmer {
  animation: shimmer v-bind('`${animationConfig.skeleton.shimmerDurationMs}ms`')
    ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Reduced motion: static pulse instead of shimmer */
.skeleton-reduced-motion .skeleton-shimmer {
  animation: skeleton-pulse
    v-bind('`${animationConfig.skeleton.pulseDurationSec}`') ease-in-out
    infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Error State with Micro-UX */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  background: v-bind('componentColorsConfig.submissionReview.error.bg');
  border: 1px solid
    v-bind('componentColorsConfig.submissionReview.error.border');
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  margin: 1rem;
}

.error-icon-wrapper {
  width: 4rem;
  height: 4rem;
  background: v-bind('componentColorsConfig.submissionReview.error.iconBg');
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  width: 2rem;
  height: 2rem;
  color: v-bind('componentColorsConfig.submissionReview.error.iconColor');
}

.error-message {
  color: v-bind('componentColorsConfig.submissionReview.error.text');
  font-size: 1rem;
  margin: 0;
}

.error-retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: v-bind('componentColorsConfig.submissionReview.error.retryBg');
  color: v-bind('componentColorsConfig.submissionReview.error.retryText');
  border: 1px solid
    v-bind('componentColorsConfig.submissionReview.error.retryBorder');
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  cursor: pointer;
  font-weight: 500;
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`') ease-out;
}

.error-retry-btn:hover {
  background: v-bind(
    'componentColorsConfig.submissionReview.error.retryHoverBg'
  );
  transform: translateY(-1px);
}

.error-retry-btn:active {
  transform: translateY(0);
}

.retry-icon {
  width: 1rem;
  height: 1rem;
  transition: transform v-bind('`${animationConfig.cssTransitions.normalSec}`')
    ease-out;
}

.error-retry-btn:hover .retry-icon {
  transform: rotate(180deg);
}

/* Success Celebration Overlay */
.success-celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind('uiConfig.zIndex.modal');
  backdrop-filter: blur(4px);
}

.success-celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 3rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: celebration-pop-in
    v-bind(
      '`${animationConfig.submissionReview?.celebrationPopDurationMs || 500}ms`'
    )
    cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes celebration-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  60% {
    transform: scale(1.05) translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.success-icon-container {
  width: 4rem;
  height: 4rem;
}

.success-checkmark {
  width: 100%;
  height: 100%;
}

.success-circle {
  fill: white;
  animation: success-circle-scale
    v-bind(
      '`${animationConfig.submissionReview?.checkmarkCircleDurationMs || 300}ms`'
    )
    ease-out 0.1s both;
}

@keyframes success-circle-scale {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-path {
  stroke: #10b981;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: success-path-draw
    v-bind(
      '`${animationConfig.submissionReview?.checkmarkDrawDurationMs || 400}ms`'
    )
    ease-out
    v-bind(
      '`${animationConfig.submissionReview?.checkmarkDrawDelayMs || 200}ms`'
    )
    forwards;
}

@keyframes success-path-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.success-text {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  animation: success-text-fade
    v-bind(
      '`${animationConfig.submissionReview?.textFadeInDurationMs || 300}ms`'
    )
    ease-out
    v-bind('`${animationConfig.submissionReview?.textFadeInDelayMs || 300}ms`')
    both;
}

@keyframes success-text-fade {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Confetti Burst */
.confetti-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0;
  animation: confetti-burst
    v-bind(
      '`${animationConfig.submissionReview?.confettiBurstDurationMs || 800}ms`'
    )
    ease-out
    v-bind(
      '`${animationConfig.submissionReview?.confettiBurstDelayMs || 100}ms`'
    )
    forwards;
  --angle: calc(var(--confetti-index) * 45deg);
}

.confetti-piece:nth-child(1) {
  background: #ff6b6b;
  --confetti-index: 1;
}
.confetti-piece:nth-child(2) {
  background: #4ecdc4;
  --confetti-index: 2;
}
.confetti-piece:nth-child(3) {
  background: #45b7d1;
  --confetti-index: 3;
}
.confetti-piece:nth-child(4) {
  background: #96ceb4;
  --confetti-index: 4;
}
.confetti-piece:nth-child(5) {
  background: #ffeaa7;
  --confetti-index: 5;
}
.confetti-piece:nth-child(6) {
  background: #dda0dd;
  --confetti-index: 6;
}
.confetti-piece:nth-child(7) {
  background: #98d8c8;
  --confetti-index: 7;
}
.confetti-piece:nth-child(8) {
  background: #f7dc6f;
  --confetti-index: 8;
}

@keyframes confetti-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-80px)
      scale(0);
  }
}

/* Review Content */
.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.review-header h1 {
  margin: 0;
  color: var(--color-text);
  flex: 1;
}

.status-badge {
  padding: v-bind('componentColorsConfig.submissionReview.badge.padding');
  border-radius: v-bind(
    'componentColorsConfig.submissionReview.badge.borderRadius'
  );
  font-size: v-bind('componentColorsConfig.submissionReview.badge.fontSize');
  font-weight: bold;
  text-transform: capitalize;
}

.status-pending {
  background: v-bind('componentColorsConfig.submissionReview.badge.pending.bg');
  color: v-bind('componentColorsConfig.submissionReview.badge.pending.text');
}

.status-approved {
  background: v-bind(
    'componentColorsConfig.submissionReview.badge.approved.bg'
  );
  color: v-bind('componentColorsConfig.submissionReview.badge.approved.text');
}

.status-rejected {
  background: v-bind(
    'componentColorsConfig.submissionReview.badge.rejected.bg'
  );
  color: v-bind('componentColorsConfig.submissionReview.badge.rejected.text');
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  padding: 1.5rem;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: bold;
  color: var(--color-text);
  font-size: 0.9rem;
}

.info-item p,
.info-item span,
.info-item ul {
  margin: 0;
  color: var(--color-text-secondary);
  word-break: break-word;
}

.info-item ul {
  padding-left: 1.5rem;
}

.url-link {
  color: var(--color-primary);
  text-decoration: none;
}

.url-link:hover {
  text-decoration: underline;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: var(--color-tag-background);
  color: var(--color-text);
  padding: 0.25rem 0.5rem;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.lg}px`');
  font-size: 0.8rem;
}

.rejection-reason {
  color: var(--color-error);
  font-weight: 500;
}

/* Review Actions */
.review-actions {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.action-group {
  flex: 1;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.md}px`');
  padding: 1.5rem;
  transition: all v-bind('`${animationConfig.cssTransitions.normalSec}`')
    ease-out;
}

.action-group-approve {
  border-color: v-bind('componentColorsConfig.submissionReview.approve.border');
}

.action-group-approve:hover {
  border-color: v-bind(
    'componentColorsConfig.submissionReview.approve.hoverBorder'
  );
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
}

.action-group-reject {
  border-color: v-bind('componentColorsConfig.submissionReview.reject.border');
}

.action-group-reject:hover {
  border-color: v-bind(
    'componentColorsConfig.submissionReview.reject.hoverBorder'
  );
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.rejection-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  margin-bottom: 1rem;
  resize: vertical;
  background: var(--color-background);
  color: var(--text-color);
  transition: all v-bind('`${animationConfig.cssTransitions.fastSec}`') ease-out;
}

.rejection-textarea:focus {
  outline: none;
  border-color: v-bind(
    'componentColorsConfig.submissionReview.reject.focusBorder'
  );
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.textarea-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Enhanced Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xs}px`');
  cursor: pointer;
  font-weight: 500;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all v-bind('`${animationConfig.cssTransitions.normalSec}`')
    ease-out;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-approve {
  background: var(--color-success);
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.btn-reject {
  background: var(--color-error);
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.btn-loading {
  padding-left: 2.5rem;
}

.btn-success {
  background: #059669;
}

/* Button Spinner Animation */
.btn-spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: btn-spinner-rotate
    v-bind('`${animationConfig.submissionReview?.spinnerDurationMs || 1000}ms`')
    linear infinite;
}

.spinner-track {
  opacity: 0.3;
}

.spinner-head {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: btn-spinner-dash
    v-bind('`${animationConfig.submissionReview?.spinnerDurationMs || 1000}ms`')
    ease-in-out infinite;
  transform-origin: center;
}

@keyframes btn-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes btn-spinner-dash {
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

/* Button Checkmark Animation */
.btn-checkmark {
  width: 1.25rem;
  height: 1.25rem;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: btn-checkmark-draw
    v-bind(
      '`${animationConfig.submissionReview?.checkmarkDrawDurationMs || 300}ms`'
    )
    ease-out forwards;
}

@keyframes btn-checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
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

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer,
  .btn-spinner,
  .btn-checkmark,
  .confetti-piece,
  .success-celebration-content,
  .success-circle,
  .success-path,
  .success-text {
    animation: none !important;
  }

  .success-path {
    stroke-dashoffset: 0;
  }

  .confetti-piece {
    display: none;
  }

  .btn:hover:not(:disabled) {
    transform: none;
  }

  .action-group:hover {
    transform: none;
    box-shadow: none;
  }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .review-actions {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}
</style>
