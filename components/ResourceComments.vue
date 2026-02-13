<template>
  <div class="mt-12">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ contentConfig.comments.title }}
      </h2>
      <span class="text-sm text-gray-500"
        >{{ commentCount }} {{ contentConfig.comments.countLabel }}</span
      >
    </div>

    <!-- Comment Form with Micro-UX Enhancements -->
    <div
      class="bg-white border border-gray-200 rounded-lg p-6 mb-6 transition-all duration-300"
      :class="{
        'ring-2 ring-blue-500 ring-opacity-50 shadow-lg': isTextareaFocused,
        'shadow-sm': !isTextareaFocused,
      }"
    >
      <div class="relative">
        <textarea
          ref="textareaRef"
          v-model="newComment"
          :placeholder="contentConfig.comments.placeholders.newComment"
          class="w-full p-3 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none overflow-hidden"
          :class="{
            'border-red-300 focus:ring-red-500 focus:border-red-500':
              isOverLimit,
            'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500':
              isNearLimit && !isOverLimit,
            'animate-textarea-glow': showSuccessGlow && !prefersReducedMotion,
          }"
          :rows="MIN_ROWS"
          :aria-label="contentConfig.comments.aria.addComment"
          :aria-describedby="`comment-hint-${uniqueId}`"
          :maxlength="MAX_LENGTH"
          @focus="handleFocus"
          @blur="handleBlur"
          @input="handleInput"
          @keydown="handleKeyDown"
        />

        <!-- Character Counter Ring - Palette's Micro-UX Delight! -->
        <div
          v-if="newComment.length > 0"
          class="absolute right-3 top-3 transition-all duration-300"
          :class="{
            'scale-100 opacity-100': newComment.length > 0,
            'scale-0 opacity-0': newComment.length === 0,
          }"
        >
          <div
            class="relative w-8 h-8"
            :title="`${remainingChars} characters remaining`"
          >
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
              <!-- Background circle -->
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                class="text-gray-200"
              />
              <!-- Progress circle -->
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashOffset"
                :class="progressColorClass"
                class="transition-all duration-300 ease-out"
              />
            </svg>
            <!-- Count text -->
            <span
              class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold"
              :class="countTextColorClass"
            >
              {{ remainingChars }}
            </span>
          </div>
        </div>
      </div>

      <!-- Hint text -->
      <div
        :id="`comment-hint-${uniqueId}`"
        class="mt-2 flex items-center justify-between text-sm"
      >
        <span
          class="transition-colors duration-200"
          :class="hintTextColorClass"
        >
          <template v-if="isOverLimit">
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {{
                contentConfig.comments.validation.overLimit ||
                `${Math.abs(remainingChars)} characters over limit`
              }}
            </span>
          </template>
          <template v-else-if="isNearLimit">
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{
                contentConfig.comments.validation.nearLimit ||
                'Approaching limit'
              }}
            </span>
          </template>
          <template
            v-else-if="newComment.length < MIN_LENGTH && newComment.length > 0"
          >
            {{
              contentConfig.comments.validation.tooShort ||
              `Minimum ${MIN_LENGTH} characters`
            }}
          </template>
          <template v-else>
            {{
              contentConfig.comments.validation.hint ||
              `Press Enter to submit, Shift+Enter for new line`
            }}
          </template>
        </span>

        <!-- Submit Button with Loading State -->
        <button
          class="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="submitButtonClasses"
          :disabled="!canSubmit || isSubmitting"
          :aria-label="
            isSubmitting
              ? contentConfig.comments.aria.submitting
              : contentConfig.comments.aria.postComment
          "
          @click="submitComment"
        >
          <!-- Loading spinner -->
          <svg
            v-if="isSubmitting"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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

          <!-- Success checkmark -->
          <svg
            v-else-if="showSuccessCheck"
            class="h-4 w-4 animate-success-bounce"
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

          <span>{{ submitButtonText }}</span>
        </button>
      </div>
    </div>

    <!-- Comments List with Palette's Spring Animation -->
    <TransitionGroup name="comment-list" tag="div" class="space-y-4">
      <div
        v-for="comment in formattedComments"
        :key="comment.id"
        class="flex space-x-4"
        :class="{
          'is-new': isNewComment(comment.id) && !prefersReducedMotion,
        }"
      >
        <div class="flex-shrink-0">
          <!-- Avatar with Pulse Animation for New Comments -->
          <div
            class="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-400 rounded-xl w-10 h-10 flex items-center justify-center text-gray-500 font-semibold text-sm transition-all duration-300"
            :class="{
              'animate-avatar-pulse':
                isNewComment(comment.id) && !prefersReducedMotion,
            }"
            aria-hidden="true"
          >
            {{ comment.initials }}
          </div>
        </div>
        <div class="flex-1">
          <div
            class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="font-medium text-gray-900">{{
                  comment.displayName
                }}</span>
                <!-- Palette's micro-UX: Live timestamp with tooltip and indicator -->
                <time
                  class="ml-2 text-sm text-gray-500 flex items-center gap-1.5"
                  :datetime="comment.timestamp"
                  :title="new Date(comment.timestamp).toLocaleString()"
                >
                  {{ comment.displayTime }}
                  <!-- Live indicator for recent comments -->
                  <span
                    v-if="comment.isRecent"
                    class="live-indicator"
                    aria-hidden="true"
                    :class="{ 'animate-pulse': !prefersReducedMotion }"
                  />
                </time>
              </div>
              <!-- Like Button with Particle Burst - Palette's Micro-UX Delight! -->
              <button
                :ref="el => setLikeButtonRef(el, comment.id)"
                class="group flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-all duration-200 relative"
                :aria-label="contentConfig.comments.aria.likeComment"
                @click="event => toggleLike(comment.id, event)"
              >
                <!-- Particle Burst Container -->
                <span
                  v-if="
                    burstingComments.has(comment.id) && !prefersReducedMotion
                  "
                  class="particle-burst-container absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <span
                    v-for="n in 6"
                    :key="n"
                    class="particle"
                    :style="getParticleStyle(n)"
                  />
                </span>
                <svg
                  class="w-4 h-4 transition-transform duration-200 group-hover:scale-110 relative z-10"
                  :class="{
                    'text-red-500 fill-current': isLiked(comment.id),
                    'animate-heart-pop':
                      burstingComments.has(comment.id) && !prefersReducedMotion,
                  }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span class="relative z-10">{{ comment.displayLikes }}</span>
              </button>
            </div>
            <p class="mt-1 text-gray-700 whitespace-pre-wrap">
              {{ comment.displayContent }}
            </p>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Comment } from '~/types/community'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { validationConfig } from '~/configs/validation.config'
import { limitsConfig } from '~/configs/limits.config'
import { uiConfig } from '~/configs/ui.config'
import { generateId } from '~/utils/generateId'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'
import { formatTimeAgoOnce } from '~/composables/useTimeAgo'

interface Props {
  comments: Comment[]
  commentCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [comment: string]
  like: [commentId: string]
}>()

// Constants - Now using config values! Flexy approves!
const MIN_LENGTH = validationConfig.comments.minLength
const MAX_LENGTH = validationConfig.comments.maxLength
const MIN_ROWS = validationConfig.comments.minRows
const MAX_ROWS = validationConfig.comments.maxRows

// Reactive state
const newComment = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isTextareaFocused = ref(false)
const isSubmitting = ref(false)
const showSuccessCheck = ref(false)
const showSuccessGlow = ref(false)
const likedComments = ref<Set<string>>(new Set())
const prefersReducedMotion = ref(false)
const uniqueId = generateId({ prefix: 'comment' })

// Palette's Micro-UX: Track new comments for avatar pulse animation
const newComments = ref<Set<string>>(new Set())
const burstingComments = ref<Set<string>>(new Set())
const likeButtonRefs = ref<Map<string, HTMLElement>>(new Map())

// Computed values for character counter ring - Now using config, Flexy loves modularity!
const circumference = 2 * Math.PI * uiConfig.characterCounter.ringRadiusPx
const charCount = computed(() => newComment.value.length)
const remainingChars = computed(() => MAX_LENGTH - charCount.value)
const progressPercentage = computed(() =>
  Math.min(charCount.value / MAX_LENGTH, 1)
)
const strokeDashOffset = computed(
  () => circumference * (1 - progressPercentage.value)
)

// Validation states
const isNearLimit = computed(() => progressPercentage.value >= 0.8)
const isOverLimit = computed(() => charCount.value > MAX_LENGTH)
const isTooShort = computed(
  () => charCount.value > 0 && charCount.value < MIN_LENGTH
)
const canSubmit = computed(
  () =>
    charCount.value >= MIN_LENGTH && !isOverLimit.value && !isSubmitting.value
)

// Color classes based on state
const progressColorClass = computed(() => {
  if (isOverLimit.value) return 'text-red-500'
  if (isNearLimit.value) return 'text-yellow-500'
  return 'text-blue-500'
})

const countTextColorClass = computed(() => {
  if (isOverLimit.value) return 'text-red-600'
  if (isNearLimit.value) return 'text-yellow-600'
  return 'text-gray-600'
})

const hintTextColorClass = computed(() => {
  if (isOverLimit.value) return 'text-red-600 font-medium'
  if (isNearLimit.value) return 'text-yellow-600'
  if (isTooShort.value) return 'text-gray-500'
  return 'text-gray-400'
})

const submitButtonClasses = computed(() => {
  if (showSuccessCheck.value) {
    return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  }
  if (!canSubmit.value && charCount.value > 0) {
    return 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }
  return 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) return 'Posting...'
  if (showSuccessCheck.value) return 'Posted!'
  return contentConfig.comments.buttons.post
})

// Methods
const handleFocus = () => {
  isTextareaFocused.value = true
}

const handleBlur = () => {
  isTextareaFocused.value = false
}

const handleInput = () => {
  autoResizeTextarea()
}

const autoResizeTextarea = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'

  // Calculate new height based on content - Flexy hates hardcoded values!
  const lineHeight = uiConfig.characterCounter.lineHeightPx
  const newHeight = Math.min(
    Math.max(textarea.scrollHeight, lineHeight * MIN_ROWS),
    lineHeight * MAX_ROWS
  )

  textarea.style.height = `${newHeight}px`
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Submit on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSubmit.value) {
      submitComment()
    }
  }
}

const submitComment = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    emit('submit', newComment.value.trim())

    // Show success states
    showSuccessCheck.value = true
    showSuccessGlow.value = true

    // Haptic feedback for successful post - Palette's micro-UX touch!
    hapticSuccess()

    // Clear textarea
    newComment.value = ''

    // Reset textarea height
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }

    // Palette's Micro-UX: Track new comment for avatar pulse animation
    // We'll mark the most recent comment as new
    setTimeout(() => {
      const latestComment = formattedComments.value[0]
      if (latestComment) {
        newComments.value.add(latestComment.id)
        // Remove from new comments after animation completes
        setTimeout(() => {
          newComments.value.delete(latestComment.id)
        }, 2000)
      }
    }, 100)

    // Reset success states after animation
    setTimeout(() => {
      showSuccessCheck.value = false
    }, animationConfig.microInteractions.feedbackDurationMs)

    setTimeout(() => {
      showSuccessGlow.value = false
    }, animationConfig.microInteractions.glowDurationMs)
  } finally {
    isSubmitting.value = false
  }
}

// Palette's Micro-UX: Set like button ref for positioning
const setLikeButtonRef = (el: unknown, commentId: string) => {
  if (el && typeof el === 'object' && el !== null) {
    likeButtonRefs.value.set(commentId, el as HTMLElement)
  }
}

// Palette's Micro-UX: Generate particle styles for burst animation
const getParticleStyle = (index: number) => {
  const angle = (index - 1) * 60 // 60-degree increments for 6 particles
  const delay = (index - 1) * 50 // Staggered delay
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}ms`,
  }
}

// Palette's Micro-UX: Check if comment is new (for avatar pulse)
const isNewComment = (commentId: string) => newComments.value.has(commentId)

const toggleLike = (commentId: string, _event?: Event) => {
  if (likedComments.value.has(commentId)) {
    likedComments.value.delete(commentId)
    // Light haptic for removing like
    hapticLight()
  } else {
    likedComments.value.add(commentId)
    emit('like', commentId)
    // Success haptic for adding like - Palette's micro-UX touch!
    hapticSuccess()

    // Palette's Micro-UX: Trigger particle burst animation
    if (!prefersReducedMotion.value) {
      burstingComments.value.add(commentId)
      setTimeout(() => {
        burstingComments.value.delete(commentId)
      }, 800) // Animation duration + buffer
    }
  }
}

const isLiked = (commentId: string) => likedComments.value.has(commentId)

// Flexy hates hardcoded limits! Use configurable display limit for initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, limitsConfig.display.maxInitialsDisplay)
}

// Format comments with initials
// Palette's micro-UX enhancement: Using live-updating time display!
const formattedComments = computed(() => {
  return props.comments.map(comment => {
    const timeAgoResult = formatTimeAgoOnce(comment.timestamp)
    const isRecent = timeAgoResult === 'just now'

    return {
      ...comment,
      displayName: comment.userName || comment.userId,
      displayContent: comment.content,
      displayTime: timeAgoResult,
      displayLikes:
        comment.votes + (likedComments.value.has(comment.id) ? 1 : 0),
      initials: getInitials(comment.userName || comment.userId),
      // Palette's micro-UX: Track if comment is recent for live indicator
      isRecent,
      timestamp: comment.timestamp,
    }
  })
})

// Check for reduced motion preference
onMounted(() => {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
  }
})

// Expose min/max length for external use
defineExpose({
  minLength: MIN_LENGTH,
  maxLength: MAX_LENGTH,
})
</script>

<style scoped>
/* Textarea glow animation on successful post */
.animate-textarea-glow {
  animation: textarea-glow
    v-bind('animationConfig?.cssTransitions?.longSec ?? "0.6s"') ease-out;
}

@keyframes textarea-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

/* Success bounce animation for checkmark */
.animate-success-bounce {
  animation: success-bounce
    v-bind('animationConfig?.validation?.shakeDurationSec ?? "0.5s"')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes success-bounce {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Heart beat animation for likes */
.animate-heart-beat {
  animation: heart-beat
    v-bind('animationConfig?.cssAnimations?.mediumDurationSec ?? "0.4s"')
    ease-in-out;
}

@keyframes heart-beat {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.1);
  }
}

/* Fade in animation for comments */
.animate-fade-in {
  animation: fade-in
    v-bind('animationConfig?.cssAnimations?.standardDurationSec ?? "0.3s"')
    ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Palette's Micro-UX: Particle Burst Animation */
.particle-burst-container {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%);
  border-radius: 50%;
  animation: particle-burst
    v-bind('animationConfig?.cssTransitions?.longSec ?? "0.6s"')
    cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes particle-burst {
  0% {
    transform: rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: rotate(var(--angle)) translateY(-24px) scale(0);
    opacity: 0;
  }
}

/* Palette's Micro-UX: Heart Pop Animation (Enhanced) */
.animate-heart-pop {
  animation: heart-pop
    v-bind('animationConfig?.validation?.shakeDurationSec ?? "0.5s"')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heart-pop {
  0% {
    transform: scale(0.8);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.95);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Palette's Micro-UX: Avatar Pulse for New Comments */
.animate-avatar-pulse {
  animation: avatar-pulse 2s ease-in-out;
}

@keyframes avatar-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
  25% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
  }
  50% {
    transform: scale(1);
    box-shadow: 0 0 0 16px rgba(59, 130, 246, 0.1);
  }
  75% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.05);
  }
}

/* Palette's Micro-UX: TransitionGroup Animations for Comments List */
.comment-list-enter-active {
  transition: all
    v-bind('animationConfig?.validation?.shakeDurationSec ?? "0.5s"')
    cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.comment-list-leave-active {
  transition: all
    v-bind('animationConfig?.cssAnimations?.standardDurationSec ?? "0.3s"')
    ease-out;
  position: absolute;
}

.comment-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.comment-list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.comment-list-move {
  transition: transform
    v-bind('animationConfig?.cssAnimations?.mediumDurationSec ?? "0.4s"')
    ease-out;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-textarea-glow,
  .animate-success-bounce,
  .animate-heart-beat,
  .animate-fade-in,
  .animate-heart-pop,
  .animate-avatar-pulse {
    animation: none;
  }

  .transition-all {
    transition: none;
  }

  .particle {
    display: none;
  }

  .comment-list-enter-active,
  .comment-list-leave-active {
    transition: none;
  }
}

/* Smooth textarea transition */
textarea {
  transition:
    height 0.2s ease-out,
    box-shadow 0.2s ease-out,
    border-color 0.2s ease-out;
}

/* Palette's Micro-UX: Live indicator for recent comments */
.live-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.live-indicator.animate-pulse {
  animation: live-pulse 2s ease-in-out infinite;
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
  }
}

/* Reduced motion support for live indicator */
@media (prefers-reduced-motion: reduce) {
  .live-indicator.animate-pulse {
    animation: none;
  }
}
</style>
