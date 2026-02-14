<template>
  <div class="submission-review">
    <!-- Success Celebration Overlay - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showCelebration && !prefersReducedMotion"
        class="celebration-overlay"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="celebration-content">
          <!-- Animated checkmark circle -->
          <div class="celebration-icon">
            <svg
              class="checkmark-svg"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle class="checkmark-circle" cx="12" cy="12" r="10" />
              <path class="checkmark-path" d="M7 12l3 3 7-7" />
            </svg>
          </div>
          <span class="celebration-text">
            {{
              contentConfig.submissionReview.celebration?.approved ||
              'Submission Approved!'
            }}
          </span>
        </div>
        <!-- Confetti burst effect -->
        <div class="confetti-container" aria-hidden="true">
          <span
            v-for="n in 12"
            :key="n"
            class="confetti-piece"
            :style="{ '--confetti-index': n }"
          />
        </div>
      </div>
    </Transition>

    <div v-if="loading" class="loading">
      <LoadingSpinner
        :label="contentConfig.submissionReview.loading"
        size="medium"
      />
    </div>

    <div v-else-if="error" class="error" role="alert">
      <span class="error-icon">⚠️</span>
      {{ error }}
    </div>

    <Transition
      enter-active-class="transition-all duration-400 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="submission && !showCelebration"
        class="review-content"
        :class="{
          'review-content--approved': submission.status === 'approved',
        }"
      >
        <div class="review-header">
          <h1>{{ submission.resourceData?.title }}</h1>
          <span
            :class="[
              'status-badge',
              `status-${submission.status}`,
              {
                'status-badge--pulse':
                  submission.status === 'pending' && !prefersReducedMotion,
              },
            ]"
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

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div v-if="submission.status === 'pending'" class="review-actions">
            <div class="action-group">
              <h4>
                {{ contentConfig.submissionReview.actions.approve.title }}
              </h4>
              <button
                ref="approveButtonRef"
                :class="[
                  'btn btn-approve',
                  { 'btn--pressed': isApprovePressed && !prefersReducedMotion },
                ]"
                :disabled="isProcessing"
                @click="handleApprove"
                @mousedown="isApprovePressed = true"
                @mouseup="isApprovePressed = false"
                @mouseleave="isApprovePressed = false"
                @touchstart="isApprovePressed = true"
                @touchend="isApprovePressed = false"
              >
                <span class="btn-content">
                  <svg
                    v-if="isProcessing"
                    class="btn-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <template v-else>
                    {{ contentConfig.submissionReview.actions.approve.button }}
                  </template>
                </span>
              </button>
            </div>

            <div class="action-group">
              <h4>{{ contentConfig.submissionReview.actions.reject.title }}</h4>
              <textarea
                v-model="rejectionReason"
                :placeholder="
                  contentConfig.submissionReview.placeholders.rejectionReason
                "
                class="rejection-textarea"
                :disabled="isProcessing"
              />
              <button
                ref="rejectButtonRef"
                :class="[
                  'btn btn-reject',
                  { 'btn--pressed': isRejectPressed && !prefersReducedMotion },
                ]"
                :disabled="isProcessing"
                @click="handleReject"
                @mousedown="isRejectPressed = true"
                @mouseup="isRejectPressed = false"
                @mouseleave="isRejectPressed = false"
                @touchstart="isRejectPressed = true"
                @touchend="isRejectPressed = false"
              >
                <span class="btn-content">
                  <svg
                    v-if="isProcessing"
                    class="btn-spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <template v-else>
                    {{ contentConfig.submissionReview.actions.reject.button }}
                  </template>
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
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
import { shadowsConfig } from '~/configs/shadows.config'
import { hapticSuccess, hapticError, hapticLight } from '~/utils/hapticFeedback'
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  submissionId?: string
}

const props = withDefaults(defineProps<Props>(), {
  submissionId: '',
})

// Reactive state for micro-UX enhancements
const isApprovePressed = ref(false)
const isRejectPressed = ref(false)
const isProcessing = ref(false)
const showCelebration = ref(false)
const prefersReducedMotion = ref(false)
const announcement = ref('')
const approveButtonRef = ref<HTMLButtonElement | null>(null)
const rejectButtonRef = ref<HTMLButtonElement | null>(null)

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

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Celebration config
const celebrationConfig = computed(
  () => animationConfig.submissionReview?.celebration
)

// Announce to screen readers
const announce = (message: string) => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

const handleApprove = async () => {
  if (isProcessing.value) return

  isProcessing.value = true

  // Haptic feedback for button press
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  const success = await approveSubmission()

  isProcessing.value = false

  if (success) {
    // Trigger celebration animation
    showCelebration.value = true

    // Haptic success feedback
    if (!prefersReducedMotion.value) {
      hapticSuccess()
    }

    // Announce to screen readers
    announce(
      contentConfig.submissionReview.celebration?.approvedAnnouncement ||
        'Submission approved successfully'
    )

    // Auto-hide celebration after delay
    setTimeout(() => {
      showCelebration.value = false
    }, celebrationConfig.value?.durationMs || 2500)
  } else {
    // Haptic error feedback
    if (!prefersReducedMotion.value) {
      hapticError()
    }

    announce(error.value || contentConfig.submissionReview.errors.approveFailed)
  }
}

const handleReject = async () => {
  if (isProcessing.value) return

  isProcessing.value = true

  // Haptic feedback for button press
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  const success = await rejectSubmission(rejectionReason.value)

  isProcessing.value = false

  if (success) {
    // Haptic success feedback (lighter for reject)
    if (!prefersReducedMotion.value) {
      hapticLight()
    }

    // Announce to screen readers
    announce(
      contentConfig.submissionReview.actions.reject.successMessage ||
        'Submission rejected'
    )
  } else {
    // Haptic error feedback
    if (!prefersReducedMotion.value) {
      hapticError()
    }

    announce(error.value || contentConfig.submissionReview.errors.rejectFailed)
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return contentConfig.submissionReview.values.notAvailable
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchSubmission()
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', () => {
      prefersReducedMotion.value = checkReducedMotion()
    })
  }
})
</script>

<style scoped>
.submission-review {
  padding: 1rem;
  position: relative;
}

/* Celebration Overlay - Palette's micro-UX delight! */
.celebration-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: v-bind('uiConfig.zIndex.modal');
}

.celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 3rem;
  background: linear-gradient(
    135deg,
    v-bind('componentColorsConfig.submissionReview.celebration.gradientStart')
      0%,
    v-bind('componentColorsConfig.submissionReview.celebration.gradientEnd')
      100%
  );
  border-radius: v-bind('`${uiConfig.layout.borderRadiusPx.xl}px`');
  box-shadow: v-bind(
    'componentColorsConfig.submissionReview.celebration.shadow'
  );
  animation: celebration-pop-in
    v-bind('celebrationConfig?.popInDurationSec || "0.5s"')
    v-bind('animationConfig.easing.spring');
}

@keyframes celebration-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  60% {
    transform: scale(1.05) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.celebration-icon {
  width: 64px;
  height: 64px;
}

.checkmark-svg {
  width: 100%;
  height: 100%;
}

.checkmark-circle {
  fill: white;
  animation: circle-scale
    v-bind('celebrationConfig?.circleScaleDurationMs || "300ms"') ease-out
    forwards;
}

@keyframes circle-scale {
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

.checkmark-path {
  stroke: v-bind(
    'componentColorsConfig.submissionReview.celebration.checkmarkColor'
  );
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw
    v-bind('celebrationConfig?.checkmarkDrawDurationMs || "400ms"') ease-out
    v-bind('celebrationConfig?.checkmarkDrawDelayMs || "200ms"') forwards;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.celebration-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Confetti burst animation */
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
    v-bind('celebrationConfig?.confettiDurationMs || "800ms"') ease-out
    v-bind('celebrationConfig?.confettiDelayMs || "100ms"') forwards;
  --angle: calc(var(--confetti-index) * 30deg);
  --color-index: calc(var(--confetti-index) % 6);
  --confetti-color-1: v-bind(
    'componentColorsConfig.confetti.colors[0] || "#ff6b6b"'
  );
  --confetti-color-2: v-bind(
    'componentColorsConfig.confetti.colors[1] || "#4ecdc4"'
  );
  --confetti-color-3: v-bind(
    'componentColorsConfig.confetti.colors[2] || "#45b7d1"'
  );
  --confetti-color-4: v-bind(
    'componentColorsConfig.confetti.colors[3] || "#96ceb4"'
  );
  --confetti-color-5: v-bind(
    'componentColorsConfig.confetti.colors[4] || "#ffeaa7"'
  );
  --confetti-color-6: v-bind(
    'componentColorsConfig.confetti.colors[5] || "#dda0dd"'
  );
}

.confetti-piece:nth-child(1),
.confetti-piece:nth-child(7) {
  background: var(--confetti-color-1);
}
.confetti-piece:nth-child(2),
.confetti-piece:nth-child(8) {
  background: var(--confetti-color-2);
}
.confetti-piece:nth-child(3),
.confetti-piece:nth-child(9) {
  background: var(--confetti-color-3);
}
.confetti-piece:nth-child(4),
.confetti-piece:nth-child(10) {
  background: var(--confetti-color-4);
}
.confetti-piece:nth-child(5),
.confetti-piece:nth-child(11) {
  background: var(--confetti-color-5);
}
.confetti-piece:nth-child(6),
.confetti-piece:nth-child(12) {
  background: var(--confetti-color-6);
}

@keyframes confetti-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-100px)
      scale(0.5);
  }
}

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
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.status-badge--pulse {
  animation: status-pulse
    v-bind('animationConfig.submissionReview.statusPulseDurationSec || "2s"')
    ease-in-out infinite;
}

@keyframes status-pulse {
  0%,
  100% {
    box-shadow: v-bind('shadowsConfig.submissionReview.warningPulseStart');
  }
  50% {
    box-shadow: v-bind('shadowsConfig.submissionReview.warningPulseEnd');
  }
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
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.review-content--approved .detail-section {
  border-color: v-bind('componentColorsConfig.submissionReview.approvedBorder');
  box-shadow: v-bind('componentColorsConfig.submissionReview.approvedShadow');
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
  transition: color v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.url-link:hover {
  color: var(--color-primary-hover);
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
  transition: transform v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.tag:hover {
  transform: translateY(-1px);
}

.rejection-reason {
  color: var(--color-error);
  font-weight: 500;
}

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
  transition: all v-bind('animationConfig.cssTransitions.normalSec') ease-out;
}

.action-group:hover {
  box-shadow: v-bind(
    'componentColorsConfig.submissionReview.actionGroupHoverShadow'
  );
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
  transition:
    border-color v-bind('animationConfig.cssTransitions.fastSec') ease,
    box-shadow v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.rejection-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: v-bind('shadowsConfig.submissionReview.editButton');
}

.rejection-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
  min-width: 120px;
  transition: all v-bind('animationConfig.cssTransitions.normalSec')
    v-bind('animationConfig.easing.spring');
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-spinner {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.btn-approve {
  background: var(--color-success);
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background: v-bind(
    'componentColorsConfig.submissionReview.approveButtonHover'
  );
  transform: translateY(-2px);
  box-shadow: v-bind('shadowsConfig.submissionReview.approveGlow');
}

.btn-approve.btn--pressed {
  transform: scale(0.96);
  transition: transform v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.btn-reject {
  background: var(--color-error);
  color: white;
}

.btn-reject:hover:not(:disabled) {
  background: v-bind(
    'componentColorsConfig.submissionReview.rejectButtonHover'
  );
  transform: translateY(-2px);
  box-shadow: v-bind('shadowsConfig.submissionReview.rejectGlow');
}

.btn-reject.btn--pressed {
  transform: scale(0.96);
  transition: transform v-bind('animationConfig.cssTransitions.fastSec') ease;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-error);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 2rem;
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

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .celebration-content,
  .checkmark-circle,
  .checkmark-path,
  .confetti-piece {
    animation: none !important;
  }

  .status-badge--pulse {
    animation: none;
  }

  .btn {
    transition: none;
  }

  .btn:hover:not(:disabled) {
    transform: none;
  }

  .btn--pressed {
    transform: none;
  }

  .btn-spinner {
    animation: none;
    opacity: 0.5;
  }

  .checkmark-path {
    stroke-dashoffset: 0;
  }

  .confetti-piece {
    display: none;
  }

  .celebration-overlay {
    backdrop-filter: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }

  .status-badge {
    border: 2px solid currentColor;
  }
}
</style>
