<template>
  <div class="mt-12">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ contentConfig.comments.title }}
      </h2>
      <span class="text-sm text-gray-500">{{ commentCount }} {{ contentConfig.comments.countLabel }}</span>
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
          rows="1"
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
            <svg
              class="w-full h-full transform -rotate-90"
              viewBox="0 0 32 32"
            >
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

    <!-- Comments List -->
    <div class="space-y-4">
      <div
        v-for="comment in formattedComments"
        :key="comment.id"
        class="flex space-x-4 animate-fade-in"
      >
        <div class="flex-shrink-0">
          <div
            class="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-400 rounded-xl w-10 h-10 flex items-center justify-center text-gray-500 font-semibold text-sm"
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
                <span class="ml-2 text-sm text-gray-500">{{
                  comment.displayTime
                }}</span>
              </div>
              <!-- Like Button with Heart Animation -->
              <button
                class="group flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-all duration-200"
                :aria-label="contentConfig.comments.aria.likeComment"
                @click="toggleLike(comment.id)"
              >
                <svg
                  class="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                  :class="{
                    'text-red-500 fill-current': isLiked(comment.id),
                    'animate-heart-beat':
                      likedComments.has(comment.id) && !prefersReducedMotion,
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
                <span>{{ comment.displayLikes }}</span>
              </button>
            </div>
            <p class="mt-1 text-gray-700 whitespace-pre-wrap">
              {{ comment.displayContent }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Comment } from '~/types/community'
import { TIME } from '~/server/utils/constants'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { validationConfig } from '~/configs/validation.config'
import { generateId } from '~/utils/generateId'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'

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

// Computed values for character counter ring
const circumference = 2 * Math.PI * 12 // r=12
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
  if (isSubmitting.value)
    return contentConfig.comments.buttons.posting || 'Posting...'
  if (showSuccessCheck.value)
    return contentConfig.comments.buttons.posted || 'Posted!'
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

  // Calculate new height based on content
  const lineHeight = 24 // approx line height in pixels
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

const toggleLike = (commentId: string) => {
  if (likedComments.value.has(commentId)) {
    likedComments.value.delete(commentId)
    // Light haptic for removing like
    hapticLight()
  } else {
    likedComments.value.add(commentId)
    emit('like', commentId)
    // Success haptic for adding like - Palette's micro-UX touch!
    hapticSuccess()
  }
}

const isLiked = (commentId: string) => likedComments.value.has(commentId)

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format comments with initials
const formattedComments = computed(() => {
  return props.comments.map(comment => ({
    ...comment,
    displayName: comment.userName || comment.userId,
    displayContent: comment.content,
    displayTime: formatTimeAgo(comment.timestamp),
    displayLikes: comment.votes + (likedComments.value.has(comment.id) ? 1 : 0),
    initials: getInitials(comment.userName || comment.userId),
  }))
})

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / TIME.MS_PER_SECOND
  )

  if (seconds < TIME.SECONDS_PER_MINUTE) return 'just now'
  if (seconds < TIME.SECONDS_PER_HOUR)
    return `${Math.floor(seconds / TIME.SECONDS_PER_MINUTE)} minutes ago`
  if (seconds < TIME.SECONDS_PER_DAY)
    return `${Math.floor(seconds / TIME.SECONDS_PER_HOUR)} hours ago`
  if (seconds < TIME.SECONDS_PER_WEEK)
    return `${Math.floor(seconds / TIME.SECONDS_PER_DAY)} days ago`
  return date.toLocaleDateString()
}

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
  animation: textarea-glow 0.6s ease-out;
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
  animation: success-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
  animation: heart-beat 0.4s ease-in-out;
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
  animation: fade-in 0.3s ease-out;
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-textarea-glow,
  .animate-success-bounce,
  .animate-heart-beat,
  .animate-fade-in {
    animation: none;
  }

  .transition-all {
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
</style>
