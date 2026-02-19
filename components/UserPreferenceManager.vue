<template>
  <div
    class="user-preference-manager p-6 bg-white dark:bg-gray-800 rounded-lg shadow"
  >
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      Personalize Your Experience
    </h2>

    <!-- ARIA Live Region for Announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcementText }}
    </div>

    <div class="space-y-6">
      <!-- Interests and Categories -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Your Interests
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Select categories and technologies you're interested in
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in availableCategories"
            :key="category"
            ref="(el) => _setCategoryChipRef(el as HTMLButtonElement, category)"
            :class="[
              `category-chip px-3 py-1 rounded-full text-sm font-medium transition-all ${animationConfig.tailwindDurations.normal}`,
              selectedCategories.includes(category)
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-600 dark:text-white category-chip--selected'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
              isAnimatingCategory === category && 'category-chip--animating',
            ]"
            :aria-pressed="selectedCategories.includes(category)"
            :aria-label="
              selectedCategories.includes(category)
                ? `Remove ${category} from interests`
                : `Add ${category} to interests`
            "
            @click="event => toggleCategory(category, event as MouseEvent)"
          >
            <span class="flex items-center gap-1">
              <!-- Checkmark icon for selected categories -->
              <svg
                v-if="selectedCategories.includes(category)"
                class="w-3 h-3 category-checkmark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ category }}
            </span>
          </button>
        </div>
      </div>

      <!-- Skill Level -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Skill Level
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Tell us your experience level to get appropriate recommendations
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            v-for="level in skillLevels"
            :key="level.value"
            ref="(el) => _setSkillButtonRef(el as HTMLButtonElement, level.value)"
            :class="[
              `skill-level-btn py-2 px-4 rounded-md text-center text-sm font-medium transition-all ${animationConfig.tailwindDurations.normal} ease-out`,
              selectedSkillLevel === level.value
                ? 'bg-indigo-600 text-white skill-level-btn--selected'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
              isAnimatingSkill === level.value && 'skill-level-btn--animating',
            ]"
            :aria-pressed="selectedSkillLevel === level.value"
            :aria-label="`Set skill level to ${level.label}`"
            @click="event => selectSkillLevel(level.value, event as MouseEvent)"
          >
            {{ level.label }}
          </button>
        </div>
      </div>

      <!-- Notification Settings -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Notifications
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Choose what updates you'd like to receive
        </p>

        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="notificationSettings.resourceUpdates"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Updates to resources you've bookmarked
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="notificationSettings.newContent"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              New content in your areas of interest
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="notificationSettings.weeklyDigest"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Weekly digest of popular resources
            </span>
          </label>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Privacy Controls
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Control how your data is used to personalize recommendations
        </p>

        <div class="space-y-3">
          <label class="flex items-center">
            <input
              v-model="privacySettings.allowPersonalization"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Allow personalized recommendations
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="privacySettings.allowDataCollection"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Allow usage data collection for improvements
            </span>
          </label>

          <label class="flex items-center">
            <input
              v-model="privacySettings.allowRecommendationExplanations"
              type="checkbox"
              class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">
              Show explanations for why resources are recommended
            </span>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="pt-4">
        <button
          ref="saveButtonRef"
          :disabled="saving || showSuccessAnimation"
          :class="[
            `save-button w-full md:w-auto px-6 py-3 font-medium rounded-md transition-all ${animationConfig.tailwindDurations.standard} ease-out`,
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            showSuccessAnimation
              ? 'save-button--success bg-green-600 hover:bg-green-700'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white',
            isSavePressed && !showSuccessAnimation && 'save-button--pressed',
          ]"
          :aria-label="
            saving
              ? 'Saving preferences...'
              : showSuccessAnimation
                ? 'Preferences saved successfully'
                : 'Save your preferences'
          "
          @click="savePreferences"
          @mousedown="isSavePressed = true"
          @mouseup="isSavePressed = false"
          @mouseleave="isSavePressed = false"
          @touchstart="isSavePressed = true"
          @touchend="isSavePressed = false"
        >
          <!-- Loading State -->
          <span v-if="saving" class="flex items-center justify-center gap-2">
            <svg
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
            Saving...
          </span>
          <!-- Success State -->
          <span
            v-else-if="showSuccessAnimation"
            class="flex items-center justify-center gap-2 save-success-text"
          >
            <svg
              class="w-5 h-5 save-checkmark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved!
          </span>
          <!-- Default State -->
          <span v-else class="flex items-center justify-center gap-2">
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Save Preferences
          </span>
        </button>

        <!-- Confetti Celebration -->
        <ConfettiCelebration
          :trigger="showConfetti"
          intensity="light"
          :duration="animationConfig.confetti.lightDurationMs"
        />

        <div
          v-if="error"
          class="mt-3 text-red-600 dark:text-red-400 text-sm animate-error-shake"
          role="alert"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import logger from '~/utils/logger'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { uiConfig } from '~/configs/ui.config'
import { userConfig, type SkillLevel } from '~/configs/user.config'
import { hapticLight, hapticSuccess, hapticError } from '~/utils/hapticFeedback'
import ConfettiCelebration from '~/components/ConfettiCelebration.vue'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { useRipple } from '~/composables/useRipple'

const userPrefs = useUserPreferences()

// Available categories from config - Flexy hates hardcoded!
const availableCategories = ref<string[]>(userConfig.availableCategories)

// Selected categories
const selectedCategories = ref<string[]>([])

// Skill levels from config
const skillLevels = userConfig.skillLevels

// Selected skill level
const selectedSkillLevel = ref<SkillLevel['value']>('intermediate')

// Notification settings
const notificationSettings = ref({
  resourceUpdates: true,
  newContent: true,
  weeklyDigest: true,
})

// Privacy settings
const privacySettings = ref({
  allowPersonalization: true,
  allowDataCollection: true,
  allowRecommendationExplanations: true,
})

// UI state - Palette's micro-UX enhancements!
const saving = ref(false)
const saveSuccess = ref(false)
const showSuccessAnimation = ref(false)
const showConfetti = ref(false)
const isSavePressed = ref(false)
const isAnimatingCategory = ref<string | null>(null)
const isAnimatingSkill = ref<string | null>(null)
const error = ref<string | null>(null)
const announcementText = ref('')
const saveButtonRef = ref<HTMLButtonElement | null>(null)

// 🎨 Pallete's micro-UX enhancement: Ripple effect refs for category chips and skill buttons
const categoryChipRefs = ref<Map<string, HTMLButtonElement>>(new Map())
const skillButtonRefs = ref<Map<string, HTMLButtonElement>>(new Map())
const categoryRipples = ref<Map<string, ReturnType<typeof useRipple>>>(
  new Map()
)
const skillRipples = ref<Map<string, ReturnType<typeof useRipple>>>(new Map())

// Timer refs for cleanup
let successAnimationTimer: ReturnType<typeof setTimeout> | null = null
let confettiTimer: ReturnType<typeof setTimeout> | null = null
let categoryAnimationTimer: ReturnType<typeof setTimeout> | null = null
let skillAnimationTimer: ReturnType<typeof setTimeout> | null = null
let announcementTimer: ReturnType<typeof setTimeout> | null = null

// Check for reduced motion preference
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Announce to screen readers - Palette's accessibility touch!
const announce = (message: string): void => {
  announcementText.value = message
  if (announcementTimer) clearTimeout(announcementTimer)
  announcementTimer = setTimeout(() => {
    announcementText.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Initialize with existing preferences
onMounted(async () => {
  await userPrefs.initProfile()

  if (userPrefs.userProfile.value) {
    const prefs = userPrefs.userProfile.value.preferences
    selectedCategories.value = [...prefs.categories]
    selectedSkillLevel.value = prefs.skillLevel
    notificationSettings.value = { ...prefs.notificationSettings }
    privacySettings.value = { ...prefs.privacySettings }
  }
})

// Cleanup timers on unmount
onUnmounted(() => {
  if (successAnimationTimer) clearTimeout(successAnimationTimer)
  if (confettiTimer) clearTimeout(confettiTimer)
  if (categoryAnimationTimer) clearTimeout(categoryAnimationTimer)
  if (skillAnimationTimer) clearTimeout(skillAnimationTimer)
  if (announcementTimer) clearTimeout(announcementTimer)
})

// 🎨 Pallete's micro-UX enhancement: Set up ripple for a category chip
const _setCategoryChipRef = (
  el: HTMLButtonElement | null,
  category: string
) => {
  if (!el) return
  categoryChipRefs.value.set(category, el)
  // Initialize ripple if not already set up
  if (!categoryRipples.value.has(category)) {
    const ripple = useRipple({ value: el } as Ref<HTMLButtonElement | null>, {
      color: selectedCategories.value.includes(category)
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(99, 102, 241, 0.2)',
      duration: animationConfig.ripple.durationMs,
    })
    categoryRipples.value.set(category, ripple)
  }
}

// 🎨 Pallete's micro-UX enhancement: Set up ripple for a skill button
const _setSkillButtonRef = (el: HTMLButtonElement | null, level: string) => {
  if (!el) return
  skillButtonRefs.value.set(level, el)
  // Initialize ripple if not already set up
  if (!skillRipples.value.has(level)) {
    const ripple = useRipple({ value: el } as Ref<HTMLButtonElement | null>, {
      color:
        selectedSkillLevel.value === level
          ? 'rgba(255, 255, 255, 0.3)'
          : 'rgba(99, 102, 241, 0.2)',
      duration: animationConfig.ripple.durationMs,
    })
    skillRipples.value.set(level, ripple)
  }
}

// Toggle category selection with haptic feedback, animation, and ripple
const toggleCategory = (category: string, event?: MouseEvent) => {
  const index = selectedCategories.value.indexOf(category)
  const isSelecting = index === -1

  if (index > -1) {
    selectedCategories.value.splice(index, 1)
    announce(`${category} removed from interests`)
  } else {
    selectedCategories.value.push(category)
    announce(`${category} added to interests`)
  }

  // 🎨 Pallete's micro-UX enhancement: Trigger ripple effect
  if (event && !prefersReducedMotion()) {
    const ripple = categoryRipples.value.get(category)
    if (ripple) {
      ripple.createRipple(event)
    }
  }

  // Haptic feedback - lighter for deselect, stronger for select
  if (isSelecting) {
    hapticLight()
  } else {
    hapticSuccess()
  }

  // Trigger animation
  if (!prefersReducedMotion()) {
    isAnimatingCategory.value = category
    if (categoryAnimationTimer) clearTimeout(categoryAnimationTimer)
    categoryAnimationTimer = setTimeout(() => {
      isAnimatingCategory.value = null
    }, animationConfig.microInteractions.categorySelectDurationMs)
  }
}

// Select skill level with haptic feedback, animation, and ripple
const selectSkillLevel = (level: SkillLevel['value'], event?: MouseEvent) => {
  if (selectedSkillLevel.value === level) return

  selectedSkillLevel.value = level
  const levelLabel = skillLevels.find(l => l.value === level)?.label || level
  announce(`Skill level set to ${levelLabel}`)

  // 🎨 Pallete's micro-UX enhancement: Trigger ripple effect
  if (event && !prefersReducedMotion()) {
    const ripple = skillRipples.value.get(level)
    if (ripple) {
      ripple.createRipple(event)
    }
  }

  // Haptic feedback
  hapticLight()

  // Trigger animation
  if (!prefersReducedMotion()) {
    isAnimatingSkill.value = level
    if (skillAnimationTimer) clearTimeout(skillAnimationTimer)
    skillAnimationTimer = setTimeout(() => {
      isAnimatingSkill.value = null
    }, animationConfig.microInteractions.skillSelectDurationMs)
  }
}

// Save preferences with enhanced micro-UX
const savePreferences = async () => {
  saving.value = true
  error.value = null
  saveSuccess.value = false
  showSuccessAnimation.value = false

  try {
    const success = await userPrefs.updatePreferences({
      categories: selectedCategories.value,
      technologies: selectedCategories.value,
      skillLevel: selectedSkillLevel.value,
      interests: selectedCategories.value,
      notificationSettings: notificationSettings.value,
      privacySettings: privacySettings.value,
    })

    if (success) {
      saveSuccess.value = true
      showSuccessAnimation.value = true
      announce('Preferences saved successfully!')

      // Haptic success feedback
      hapticSuccess()

      // Trigger confetti celebration (skip if reduced motion)
      if (!prefersReducedMotion()) {
        showConfetti.value = true
        if (confettiTimer) clearTimeout(confettiTimer)
        confettiTimer = setTimeout(() => {
          showConfetti.value = false
        }, animationConfig.confetti.durationMs)
      }

      // Clear success animation after delay
      if (successAnimationTimer) clearTimeout(successAnimationTimer)
      successAnimationTimer = setTimeout(() => {
        showSuccessAnimation.value = false
      }, animationConfig.userPreference.saveSuccessDurationMs)
    } else {
      error.value = 'Failed to save preferences'
      announce('Failed to save preferences')
      hapticError()
    }
  } catch (err) {
    error.value = 'An error occurred while saving preferences'
    announce('Error saving preferences')
    logger.error('Error saving preferences:', err)
    hapticError()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Palette's Micro-UX Enhancements */

/* Category Chip Styles with Animation */
.category-chip {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.category-chip--selected {
  animation: category-pop
    v-bind(
      '`${animationConfig?.microInteractions?.categorySelectDurationMs ?? 300}ms`'
    )
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

.category-chip--animating {
  transform: scale(0.95);
}

@keyframes category-pop {
  0% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Category Checkmark Animation */
.category-checkmark {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: checkmark-draw
    v-bind('animationConfig.cssAnimations.standardDurationSec') ease-out
    forwards;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Skill Level Button Styles */
.skill-level-btn {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.skill-level-btn--selected {
  animation: skill-pop
    v-bind(
      '`${animationConfig?.microInteractions?.skillSelectDurationMs ?? 250}ms`'
    )
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

.skill-level-btn--animating {
  transform: scale(0.95);
}

@keyframes skill-pop {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Save Button Micro-UX Styles */
.save-button {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, background-color;
}

.save-button--pressed {
  transform: scale(0.97) !important;
  transition: transform v-bind('animationConfig.cssTransitions.fastSec')
    ease-out !important;
}

.save-button--success {
  animation: save-success-pop
    v-bind(
      '`${animationConfig?.userPreference?.saveSuccessDurationMs ?? 600}ms`'
    )
    v-bind(
      'easingConfig?.cubicBezier?.spring ?? "cubic-bezier(0.175, 0.885, 0.32, 1.275)"'
    );
}

@keyframes save-success-pop {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Success Checkmark Animation */
.save-checkmark {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: save-checkmark-draw
    v-bind('animationConfig.cssAnimations.mediumDurationSec') ease-out
    v-bind('animationConfig.cssAnimations.smallDelaySec') forwards;
}

@keyframes save-checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

/* Success Text Animation */
.save-success-text {
  animation: success-text-fade
    v-bind('animationConfig.cssAnimations.standardDurationSec') ease-out;
}

@keyframes success-text-fade {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Error Shake Animation */
.animate-error-shake {
  animation: error-shake
    v-bind('`${animationConfig?.validation?.shakeDurationMs ?? 500}ms`')
    v-bind(
      'easingConfig?.cubicBezier?.standard ?? "cubic-bezier(0.4, 0, 0.2, 1)"'
    );
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-4px);
  }
  40% {
    transform: translateX(4px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
}

/* Loading Spinner - Flexy: using config instead of hardcoded values */
.animate-spin {
  animation: spin
    v-bind('animationConfig.optimizedImage.spinnerRotateDurationSec') linear
    infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
  .category-chip,
  .category-chip--selected,
  .skill-level-btn,
  .skill-level-btn--selected,
  .save-button,
  .save-button--success,
  .category-checkmark,
  .save-checkmark,
  .save-success-text {
    animation: none !important;
    transition: opacity v-bind('animationConfig.cssTransitions.quickSec')
      ease-out !important;
  }

  .category-chip--animating,
  .skill-level-btn--animating,
  .save-button--pressed {
    transform: none !important;
  }

  .animate-spin {
    animation: none;
    opacity: 0.5;
  }

  .animate-error-shake {
    animation: none;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .category-chip:focus-visible,
  .skill-level-btn:focus-visible,
  .save-button:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }
}
</style>
