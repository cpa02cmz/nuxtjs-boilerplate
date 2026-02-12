<template>
  <div class="py-12">
    <!-- Confetti celebration for successful submission -->
    <ConfettiCelebration ref="confettiRef" intensity="medium" />

    <!-- Smart Paste indicator - Palette's micro-UX enhancement! -->
    <ClientOnly>
      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 scale-75 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-75 -translate-y-1"
        >
          <div
            v-if="smartPasteState.showIndicator"
            class="paste-indicator fixed z-50 px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
            :style="{
              left: `${smartPasteState.indicatorPosition.x}px`,
              top: `${smartPasteState.indicatorPosition.y}px`,
            }"
            role="status"
            aria-live="polite"
          >
            <span class="flex items-center gap-1.5">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {{ smartPasteState.indicatorMessage }}
            </span>
            <!-- Arrow pointing down -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
              <div class="w-2 h-2 bg-teal-600 transform rotate-45" />
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Submit a Resource
        </h1>
        <p class="mt-4 text-xl text-gray-500">
          Share valuable free resources with the community
        </p>
      </div>

      <div class="bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <form
          class="space-y-6"
          novalidate
          @submit.prevent="handleSubmitWithShake"
        >
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Resource Title <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="relative">
              <input
                id="title"
                ref="titleInput"
                v-model="formData.title"
                type="text"
                required
                :maxlength="maxTitleLength"
                aria-required="true"
                aria-describedby="title-description title-counter title-error"
                :aria-invalid="errors.title ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 pr-16 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 input-focus-glow',
                  errors.title
                    ? 'border-red-500 animate-form-shake'
                    : formData.title && !errors.title
                      ? 'border-green-500'
                      : 'border-gray-300',
                ]"
                :placeholder="contentConfig.submit.form.namePlaceholder"
                @focus="isTitleFocused = true"
                @blur="handleTitleBlur"
              />
              <div
                id="title-counter"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums transition-all duration-200"
                :class="titleCounterClass"
                aria-live="polite"
              >
                {{ formData.title.length }}/{{ maxTitleLength }}
              </div>
              <!-- Validation checkmark - Palette's micro-UX delight! -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <div
                  v-if="formData.title && !errors.title"
                  class="absolute right-[4.5rem] top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </Transition>
            </div>
            <p id="title-description" class="mt-1 text-sm text-gray-500">
              The name of the resource or service
            </p>
            <!-- Character limit progress bar for visual feedback -->
            <div
              v-if="formData.title.length > 0"
              class="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <div
                class="h-full transition-all duration-300 ease-out rounded-full"
                :class="titleProgressClass"
                :style="{
                  width: `${(formData.title.length / maxTitleLength) * 100}%`,
                }"
              />
            </div>

            <div
              v-if="errors.title"
              id="title-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.title }}
            </div>
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Description <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="relative">
              <textarea
                id="description"
                v-model="formData.description"
                required
                :rows="uiConfig.form.textareaRows"
                :maxlength="maxDescriptionLength"
                aria-required="true"
                aria-describedby="description-description description-counter description-error"
                :aria-invalid="errors.description ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 pr-16 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 resize-none input-focus-glow',
                  errors.description
                    ? 'border-red-500 animate-form-shake'
                    : formData.description && !errors.description
                      ? 'border-green-500'
                      : 'border-gray-300',
                ]"
                :placeholder="contentConfig.submit.form.descriptionPlaceholder"
                @focus="isDescriptionFocused = true"
                @blur="handleDescriptionBlur"
              />
              <div
                id="description-counter"
                class="absolute right-3 bottom-2 text-xs font-medium tabular-nums transition-all duration-200"
                :class="descriptionCounterClass"
                aria-live="polite"
              >
                {{ formData.description.length }}/{{ maxDescriptionLength }}
              </div>
              <!-- Validation checkmark - Palette's micro-UX delight! -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <div
                  v-if="formData.description && !errors.description"
                  class="absolute right-3 top-3 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </Transition>
            </div>
            <p id="description-description" class="mt-1 text-sm text-gray-500">
              {{ descriptionHelperText }}
            </p>
            <!-- Character limit progress bar for visual feedback -->
            <div
              v-if="formData.description.length > 0"
              class="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden"
              aria-hidden="true"
            >
              <div
                class="h-full transition-all duration-300 ease-out rounded-full"
                :class="descriptionProgressClass"
                :style="{
                  width: `${(formData.description.length / maxDescriptionLength) * 100}%`,
                }"
              />
            </div>

            <div
              v-if="errors.description"
              id="description-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.description }}
            </div>
          </div>

          <div>
            <label
              for="url"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              URL <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="relative">
              <input
                id="url"
                ref="urlInputRef"
                v-model="formData.url"
                type="url"
                required
                aria-required="true"
                aria-describedby="url-description url-error"
                :aria-invalid="errors.url ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 input-focus-glow',
                  errors.url
                    ? 'border-red-500 animate-form-shake'
                    : formData.url && !errors.url
                      ? 'border-green-500'
                      : 'border-gray-300',
                ]"
                :placeholder="contentConfig.placeholders.defaultUrl"
                @blur="handleUrlBlur"
                @paste="handleSmartPaste"
              />
              <!-- Validation checkmark - Palette's micro-UX delight! -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <div
                  v-if="formData.url && !errors.url"
                  class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </Transition>
            </div>
            <div
              v-if="errors.url"
              id="url-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.url }}
            </div>
          </div>

          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Category <span aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="relative">
              <select
                id="category"
                v-model="formData.category"
                required
                aria-required="true"
                aria-describedby="category-description category-error"
                :aria-invalid="errors.category ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 input-focus-glow appearance-none bg-white',
                  errors.category
                    ? 'border-red-500 animate-form-shake'
                    : formData.category && !errors.category
                      ? 'border-green-500'
                      : 'border-gray-300',
                ]"
                @blur="handleCategoryBlur"
              >
                <option value="" disabled>Select a category</option>
                <option
                  v-for="category in categoryOptions"
                  :key="category.value"
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
              <!-- Dropdown arrow for custom-styled select -->
              <div
                class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                aria-hidden="true"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <!-- Validation checkmark - Palette's micro-UX delight! -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out"
                enter-from-class="opacity-0 scale-50"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-50"
              >
                <div
                  v-if="formData.category && !errors.category"
                  class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                >
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </Transition>
            </div>
            <p id="category-description" class="mt-1 text-sm text-gray-500">
              Choose the most appropriate category for this resource
            </p>
            <div
              v-if="errors.category"
              id="category-error"
              class="mt-1 text-sm text-red-600"
              role="alert"
            >
              {{ errors.category }}
            </div>
          </div>

          <div>
            <label
              for="tags"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags (Optional)
            </label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              aria-describedby="tags-description"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 input-focus-glow"
              :placeholder="contentConfig.submit.form.tagsPlaceholder"
            />
            <p id="tags-description" class="mt-1 text-sm text-gray-500">
              Add relevant tags to help categorize this resource (e.g., "api,
              free-tier, openai")
            </p>
          </div>

          <div class="pt-4">
            <!-- Draft save indicator with Pulse Ring animation - Palette's micro-UX delight! -->
            <div
              class="flex items-center justify-center mb-3 min-h-[20px]"
              aria-live="polite"
            >
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 transform -translate-y-1"
                enter-to-class="opacity-100 transform translate-y-0"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 transform translate-y-0"
                leave-to-class="opacity-0 transform -translate-y-1"
              >
                <div
                  v-if="showSavedIndicator && lastSavedTimestamp"
                  class="flex items-center text-xs text-green-600 relative"
                >
                  <!-- Pulse ring animation container -->
                  <div
                    v-if="showDraftPulse && !prefersReducedMotion"
                    class="draft-save-pulse-ring"
                    aria-hidden="true"
                  />
                  <svg
                    class="w-3.5 h-3.5 mr-1.5 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span class="relative z-10"
                    >Draft saved {{ lastSavedText }}</span
                  >
                </div>
                <div
                  v-else-if="hasFormContent() && !submitSuccess"
                  class="text-xs text-gray-400"
                >
                  {{ contentConfig.submit.draft.autoSaveEnabled }}
                </div>
              </Transition>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
              aria-live="polite"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="!isSubmitting">{{
                contentConfig.submit.button.submit
              }}</span>
              <span v-else class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                {{ contentConfig.submit.button.submitting }}
              </span>
            </button>
          </div>
        </form>

        <!-- Success message -->
        <div
          v-if="submitSuccess"
          class="mt-8 p-4 bg-green-50 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                {{ contentConfig.submit.success.heading }}
              </h3>
              <div class="mt-2 text-sm text-green-700">
                <p>
                  Thank you for submitting a resource. Our team will review it
                  and approve it if it meets our quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div
          v-if="submitError"
          class="mt-8 p-4 bg-red-50 rounded-md"
          role="alert"
          aria-live="assertive"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
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
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ contentConfig.submit.error.heading }}
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ submitError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'
import { useNuxtApp } from '#app'
import { useSubmitPage } from '~/composables/useSubmitPage'
import { validationConfig } from '~/configs/validation.config'
import { animationConfig } from '~/configs/animation.config'
import { thresholdsConfig } from '~/configs/thresholds.config'
import { uiConfig } from '~/configs/ui.config'
import { categoriesConfig } from '~/configs/categories.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { timeConfig, TIME_MS } from '~/configs/time.config'
import { contentConfig } from '~/configs/content.config'
import { debounce } from '~/utils/debounce'
import { useSmartPaste } from '~/composables/useSmartPaste'
import ConfettiCelebration from '~/components/ConfettiCelebration.vue'

const confettiRef = ref<InstanceType<typeof ConfettiCelebration> | null>(null)
const urlInputRef = ref<HTMLInputElement | null>(null)
const { $toast } = useNuxtApp()

// Timeout refs for cleanup - preventing memory leaks (Issue #1827)
const shakeTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const confettiTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Initialize smart paste for URL field - Palette's micro-UX enhancement!
const { state: smartPasteState, handlePaste: handleSmartPaste } = useSmartPaste(
  urlInputRef,
  {
    trimWhitespace: true,
    showIndicator: true,
  }
)

// Draft auto-save configuration - Flexy hates hardcoded values!
import { STORAGE_KEYS } from '~/server/utils/constants'
const DRAFT_STORAGE_KEY = STORAGE_KEYS.RESOURCE_DRAFT
const DRAFT_TIMESTAMP_KEY = STORAGE_KEYS.RESOURCE_DRAFT_TIMESTAMP

// Animation config values for CSS variables - Flexy hates hardcoded values!
const shakeDurationMs = `${animationConfig.validation.shakeDurationMs}ms`
const shakeIntensityPx = `${animationConfig.validation.shakeIntensityPx}px`

// Category options from config - Flexy hates hardcoded values!
const categoryOptions = categoriesConfig.resourceFormCategories

const {
  formData,
  tagsInput,
  errors,
  isSubmitting,
  submitSuccess,
  submitError,
  submitResource,
  validateForm,
  validateTitle,
  validateDescription,
  validateUrl,
  validateCategory,
  restoreFormData,
  getFormData,
  hasFormContent,
} = useSubmitPage()

// Track which fields should shake when validation fails
const shakeFields = ref<Record<string, boolean>>({})

// Draft save indicator state
const lastSavedTimestamp = ref<number | null>(null)
const showSavedIndicator = ref(false)
const savedIndicatorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
// Palette's micro-UX delight: Pulse ring animation trigger for draft save
const showDraftPulse = ref(false)
const draftPulseTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Check reduced motion preference for accessibility
const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Format relative time for saved indicator
const lastSavedText = computed(() => {
  if (!lastSavedTimestamp.value) return ''

  const now = Date.now()
  const diff = now - lastSavedTimestamp.value

  if (diff < TIME_MS.MINUTE) {
    return 'just now'
  } else if (diff < TIME_MS.HOUR) {
    const minutes = Math.floor(diff / TIME_MS.MINUTE)
    return `${minutes}m ago`
  } else {
    const hours = Math.floor(diff / TIME_MS.HOUR)
    return `${hours}h ago`
  }
})

// Field blur handlers for inline validation
const handleTitleBlur = () => {
  isTitleFocused.value = false
  validateTitle()
}

const handleDescriptionBlur = () => {
  isDescriptionFocused.value = false
  validateDescription()
}

const handleUrlBlur = () => {
  validateUrl()
}

const handleCategoryBlur = () => {
  validateCategory()
}

// Watch for validation errors and trigger shake animation
const handleSubmitWithShake = async () => {
  // Reset shake state
  shakeFields.value = {}

  // Validate form first
  const isValid = validateForm()

  if (!isValid) {
    // Trigger shake on fields with errors
    const errorFields = Object.keys(errors.value)
    errorFields.forEach(field => {
      shakeFields.value[field] = true
    })

    // Clear shake after animation completes - tracked for cleanup (Issue #1827)
    if (shakeTimeout.value) clearTimeout(shakeTimeout.value)
    shakeTimeout.value = setTimeout(() => {
      shakeFields.value = {}
    }, animationConfig.validation.shakeDurationMs)
  }

  // Proceed with submission if valid
  if (isValid) {
    await submitResource()
  }
}

// Watch for successful submission to trigger confetti
watch(submitSuccess, success => {
  if (success) {
    // Small delay to let the success message appear first - tracked for cleanup (Issue #1827)
    if (confettiTimeout.value) clearTimeout(confettiTimeout.value)
    confettiTimeout.value = setTimeout(() => {
      confettiRef.value?.celebrate()
    }, animationConfig.confetti.submissionDelayMs)
  }
})

// Use config for max lengths - Flexy hates hardcoded values!
const maxTitleLength = validationConfig.resource.name.maxLength
const maxDescriptionLength = validationConfig.resource.description.maxLength

const titleInput = ref<HTMLInputElement | null>(null)

// Focus states for character counters
const isTitleFocused = ref(false)
const isDescriptionFocused = ref(false)

// Character counter styling with accessibility considerations
// Progress bar color based on character usage percentage - using config thresholds
const titleProgressClass = computed(() => {
  const percentage = (formData.value.title.length / maxTitleLength) * 100
  const { errorPercent, warningPercent } =
    thresholdsConfig.characterCounter.progress
  if (percentage >= errorPercent) {
    return 'bg-red-500'
  } else if (percentage >= warningPercent) {
    return 'bg-amber-500'
  }
  return 'bg-green-500'
})

const titleCounterClass = computed(() => {
  const length = formData.value.title.length
  const remaining = maxTitleLength - length

  // Always visible when field has content, fade in/out based on focus
  const baseClasses = length > 0 ? 'opacity-100' : 'opacity-0'

  // Color coding based on remaining characters - using config thresholds
  const { titleError, titleWarning } =
    thresholdsConfig.characterCounter.remaining
  if (remaining <= titleError) {
    return `${baseClasses} text-red-500`
  } else if (remaining <= titleWarning) {
    return `${baseClasses} text-amber-500`
  }
  return `${baseClasses} text-gray-400`
})

// Progress bar color based on character usage percentage - using config thresholds
const descriptionProgressClass = computed(() => {
  const percentage =
    (formData.value.description.length / maxDescriptionLength) * 100
  const { errorPercent, warningPercent } =
    thresholdsConfig.characterCounter.progress
  if (percentage >= errorPercent) {
    return 'bg-red-500'
  } else if (percentage >= warningPercent) {
    return 'bg-amber-500'
  }
  return 'bg-green-500'
})

const descriptionCounterClass = computed(() => {
  const length = formData.value.description.length
  const remaining = maxDescriptionLength - length

  // Always visible when field has content, fade in/out based on focus
  const baseClasses = length > 0 ? 'opacity-100' : 'opacity-0'

  // Color coding based on remaining characters - using config thresholds
  const { descriptionError, descriptionWarning } =
    thresholdsConfig.characterCounter.remaining
  if (remaining <= descriptionError) {
    return `${baseClasses} text-red-500`
  } else if (remaining <= descriptionWarning) {
    return `${baseClasses} text-amber-500`
  }
  return `${baseClasses} text-gray-400`
})

// Description helper text with min characters - Flexy hates hardcoded strings!
const descriptionHelperText = computed(() => {
  const template = contentConfig.submit.form.descriptionHelper
  return template.replace(
    '{{ min }}',
    String(validationConfig.resource.description.minLength)
  )
})

// Draft auto-save functionality
// Auto-save draft to localStorage with debounce
const saveDraft = debounce(() => {
  if (hasFormContent()) {
    const draftData = getFormData()
    const now = Date.now()
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, now.toString())

    // Update save indicator
    lastSavedTimestamp.value = now
    showSavedIndicator.value = true

    // Palette's micro-UX delight: Trigger pulse ring animation
    // Only trigger if not already showing to avoid animation spam
    if (!showDraftPulse.value && !prefersReducedMotion.value) {
      // Small delay to let the indicator appear first
      setTimeout(() => {
        showDraftPulse.value = true

        // Clear previous pulse timeout if exists
        if (draftPulseTimeout.value) {
          clearTimeout(draftPulseTimeout.value)
        }

        // Hide pulse after animation completes
        draftPulseTimeout.value = setTimeout(() => {
          showDraftPulse.value = false
        }, animationConfig.draftSave.pulseDurationMs + animationConfig.draftSave.pulseDelayMs)
      }, animationConfig.draftSave.pulseDelayMs)
    }

    // Clear previous timeout if exists
    if (savedIndicatorTimeout.value) {
      clearTimeout(savedIndicatorTimeout.value)
    }

    // Hide indicator after 3 seconds
    savedIndicatorTimeout.value = setTimeout(() => {
      showSavedIndicator.value = false
    }, 3000)
  }
}, timeConfig.debounce.draft)

// Watch for changes and auto-save
watch(
  () => ({ ...formData.value, tagsInput: tagsInput.value }),
  () => {
    saveDraft()
  },
  { deep: true }
)

// Restore draft on mount with subtle notification
const restoreDraft = () => {
  if (typeof window === 'undefined') return

  const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
  const savedTimestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY)

  if (savedDraft && savedTimestamp) {
    try {
      const draftData = JSON.parse(savedDraft)
      const timestamp = parseInt(savedTimestamp, 10)
      const now = Date.now()
      // Flexy hates hardcoded time calculations! Using TIME_MS from config
      const hoursSinceSaved = (now - timestamp) / TIME_MS.HOUR

      // Only restore if draft is less than expiry period (configurable)
      if (hoursSinceSaved < contentConfig.submit.draft.expiryHours) {
        restoreFormData(draftData)

        // Show toast notification about restored draft
        const timeAgo =
          hoursSinceSaved < 1
            ? 'just now'
            : hoursSinceSaved < 24
              ? `${Math.floor(hoursSinceSaved)} hours ago`
              : `${Math.floor(hoursSinceSaved / 24)} days ago`

        $toast.info(contentConfig.toast.draft.restored.title, {
          description: contentConfig.toast.draft.restored.description.replace(
            '{{ timeAgo }}',
            timeAgo
          ),
          // Flexy hates hardcoded durations! Using config value
          duration: uiConfig.toast.duration.info,
        })
      } else {
        // Clear old draft
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        localStorage.removeItem(DRAFT_TIMESTAMP_KEY)
      }
    } catch {
      // Clear invalid draft data
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY)
    }
  }
}

// Clear draft from storage
const clearDraft = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DRAFT_STORAGE_KEY)
  localStorage.removeItem(DRAFT_TIMESTAMP_KEY)
}

// Beforeunload warning when form has unsaved changes
const hasUnsavedChanges = computed(() => {
  return hasFormContent() && !submitSuccess.value
})

// Watch for successful submission to trigger confetti
watch(submitSuccess, success => {
  if (success) {
    // Clear draft from storage
    clearDraft()

    // Small delay to let the success message appear first
    setTimeout(() => {
      confettiRef.value?.celebrate()
    }, animationConfig.confetti.submissionDelayMs)
  }
})

onMounted(() => {
  titleInput.value?.focus()
  restoreDraft()

  // Set up beforeunload handler
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', event => {
      if (hasUnsavedChanges.value) {
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    })
  }
})

// Cleanup timeouts on unmount - preventing memory leaks (Issues #1814, #1827)
onUnmounted(() => {
  if (savedIndicatorTimeout.value) {
    clearTimeout(savedIndicatorTimeout.value)
  }
  if (shakeTimeout.value) {
    clearTimeout(shakeTimeout.value)
  }
  if (confettiTimeout.value) {
    clearTimeout(confettiTimeout.value)
  }
})

definePageMeta({
  layout: 'default',
  ssr: false,
})

const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: 'Submit a Resource - Free Stuff on the Internet',
  ogTitle: 'Submit a Resource - Free Stuff on the Internet',
  description:
    'Share valuable free resources with the community. Submit free AI tools, hosting services, databases, and other developer resources.',
  ogDescription:
    'Share valuable free resources with the community. Submit free AI tools, hosting services, databases, and other developer resources.',
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || DEFAULT_DEV_URL}/submit`,
  twitterCard: 'summary_large_image',
})
</script>

<style scoped>
/* Gentle shake animation for form validation errors */
/* Using scoped CSS variables for configurable values - Flexy hates hardcoded values! */
.animate-form-shake {
  --shake-intensity: v-bind('shakeIntensityPx');
  --shake-duration: v-bind('shakeDurationMs');
  animation: form-shake var(--shake-duration) ease-in-out;
}

@keyframes form-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(calc(var(--shake-intensity) * -1));
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(var(--shake-intensity));
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-form-shake {
    animation: none;
  }
}

/* Input Focus Glow Effect - Palette's micro-UX enhancement! */
/* Adds a subtle animated glow around focused inputs for better visibility */
.input-focus-glow {
  transition: box-shadow 0.2s ease-out;
}

.input-focus-glow:focus {
  animation: focus-glow-pulse v-bind('animationConfig.focusGlow.durationSec')
    ease-in-out infinite;
}

@keyframes focus-glow-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMin}px`')
        v-bind('animationConfig.focusGlow.secondaryColor'),
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMin * 2}px`')
        v-bind('animationConfig.focusGlow.color');
  }
  50% {
    box-shadow:
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMax}px`')
        v-bind('animationConfig.focusGlow.secondaryColor'),
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMax * 2}px`')
        v-bind('animationConfig.focusGlow.color');
  }
}

/* Respect reduced motion preferences for focus glow */
@media (prefers-reduced-motion: reduce) {
  .input-focus-glow:focus {
    animation: none;
    box-shadow:
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMin}px`')
        v-bind('animationConfig.focusGlow.secondaryColor'),
      0 0 0 v-bind('`${animationConfig.focusGlow.spreadMin * 2}px`')
        v-bind('animationConfig.focusGlow.color');
  }
}

/* Draft Save Pulse Ring Animation - Palette's micro-UX delight!
 * Creates a satisfying expanding ring effect when draft is saved
 */
.draft-save-pulse-ring {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  /* w-3.5 = 0.875rem, but we need space for the ring */
  height: 1.25rem;
  border-radius: 50%;
  border: v-bind('`${animationConfig.draftSave.ringWidth}px`') solid
    v-bind('animationConfig.draftSave.pulseColor');
  animation: draft-save-pulse
    v-bind('animationConfig.draftSave.pulseDurationSec') ease-out forwards;
  pointer-events: none;
  z-index: 1;
}

@keyframes draft-save-pulse {
  0% {
    transform: translateY(-50%) scale(1);
    opacity: 0.8;
    border-width: v-bind('`${animationConfig.draftSave.ringWidth}px`');
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-50%)
      scale(v-bind('animationConfig.draftSave.pulseScale'));
    opacity: 0;
    border-width: 0;
  }
}

/* Reduced motion: show a simple fade instead of pulse */
@media (prefers-reduced-motion: reduce) {
  .draft-save-pulse-ring {
    animation: draft-save-fade
      v-bind('animationConfig.draftSave.pulseDurationSec') ease-out forwards;
  }

  @keyframes draft-save-fade {
    0% {
      opacity: 0.6;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
