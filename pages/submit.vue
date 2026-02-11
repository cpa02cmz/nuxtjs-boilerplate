<template>
  <ClientErrorBoundary component-name="SubmitPage">
    <div class="py-12">
      <!-- Confetti celebration for successful submission -->
      <ConfettiCelebration ref="confettiRef" intensity="medium" />
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
                    'w-full px-4 py-2 pr-16 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200',
                    errors.title
                      ? 'border-red-500 animate-form-shake'
                      : formData.title && !errors.title
                        ? 'border-green-500'
                        : 'border-gray-300',
                  ]"
                  placeholder="e.g., OpenAI API"
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
                    'w-full px-4 py-2 pr-16 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200 resize-none',
                    errors.description
                      ? 'border-red-500 animate-form-shake'
                      : formData.description && !errors.description
                        ? 'border-green-500'
                        : 'border-gray-300',
                  ]"
                  placeholder="Describe the resource and its benefits..."
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
              </div>
              <p
                id="description-description"
                class="mt-1 text-sm text-gray-500"
              >
                At least 10 characters. Explain what this resource offers and
                why it's valuable.
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
              <input
                id="url"
                v-model="formData.url"
                type="url"
                required
                aria-required="true"
                aria-describedby="url-description url-error"
                :aria-invalid="errors.url ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200',
                  errors.url
                    ? 'border-red-500 animate-form-shake'
                    : formData.url && !errors.url
                      ? 'border-green-500'
                      : 'border-gray-300',
                ]"
                placeholder="https://example.com"
                @blur="handleUrlBlur"
              />
              <p id="url-description" class="mt-1 text-sm text-gray-500">
                The official website or page for this resource
              </p>
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
              <select
                id="category"
                v-model="formData.category"
                required
                aria-required="true"
                aria-describedby="category-description category-error"
                :aria-invalid="errors.category ? 'true' : 'false'"
                :class="[
                  'w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200',
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
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter tags separated by commas"
              />
              <p id="tags-description" class="mt-1 text-sm text-gray-500">
                Add relevant tags to help categorize this resource (e.g., "api,
                free-tier, openai")
              </p>
            </div>

            <div class="pt-4">
              <button
                type="submit"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
                aria-live="polite"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span v-if="!isSubmitting">Submit Resource</span>
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
                  Submitting...
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
                  Submission received!
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
                  Submission failed
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
  </ClientErrorBoundary>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useSubmitPage } from '~/composables/useSubmitPage'
import { validationConfig } from '~/configs/validation.config'
import { animationConfig } from '~/configs/animation.config'
import { thresholdsConfig } from '~/configs/thresholds.config'
import { uiConfig } from '~/configs/ui.config'
import { categoriesConfig } from '~/configs/categories.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'
import { timeConfig } from '~/configs/time.config'
import { debounce } from '~/utils/debounce'
import ConfettiCelebration from '~/components/ConfettiCelebration.vue'

const confettiRef = ref<InstanceType<typeof ConfettiCelebration> | null>(null)
const { $toast } = useNuxtApp()

// Draft auto-save configuration
const DRAFT_STORAGE_KEY = 'resource-draft'
const DRAFT_TIMESTAMP_KEY = 'resource-draft-timestamp'

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

    // Clear shake after animation completes
    setTimeout(() => {
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
    // Small delay to let the success message appear first
    setTimeout(() => {
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

// Draft auto-save functionality
// Auto-save draft to localStorage with debounce
const saveDraft = debounce(() => {
  if (hasFormContent()) {
    const draftData = getFormData()
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, Date.now().toString())
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
      const hoursSinceSaved = (now - timestamp) / (1000 * 60 * 60)

      // Only restore if draft is less than 7 days old
      if (hoursSinceSaved < 168) {
        restoreFormData(draftData)

        // Show toast notification about restored draft
        const timeAgo =
          hoursSinceSaved < 1
            ? 'just now'
            : hoursSinceSaved < 24
              ? `${Math.floor(hoursSinceSaved)} hours ago`
              : `${Math.floor(hoursSinceSaved / 24)} days ago`

        $toast.info('Draft restored', {
          description: `Your previous submission draft from ${timeAgo} has been restored.`,
          duration: 5000,
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

definePageMeta({
  layout: 'default',
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
</style>
