<template>
  <div
    class="feedback-form-container max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
  >
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Send Us Your Feedback</h2>

    <form @submit.prevent="submitFeedback" class="space-y-4">
      <div>
        <label
          for="feedback-type"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Feedback Type *
        </label>
        <select
          id="feedback-type"
          v-model="formData.type"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
        >
          <option value="">Select a type</option>
          <option value="bug_report">Bug Report</option>
          <option value="feature_request">Feature Request</option>
          <option value="general_feedback">General Feedback</option>
          <option value="suggestion">Suggestion</option>
          <option value="compliment">Compliment</option>
          <option value="complaint">Complaint</option>
        </select>
      </div>

      <div>
        <label
          for="feedback-title"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <input
          id="feedback-title"
          v-model="formData.title"
          type="text"
          required
          placeholder="Briefly describe your feedback"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
        />
      </div>

      <div>
        <label
          for="feedback-category"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <input
          id="feedback-category"
          v-model="formData.category"
          type="text"
          placeholder="Optional category (e.g., UI, API, Performance)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
        />
      </div>

      <div>
        <label
          for="feedback-description"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Description *
        </label>
        <textarea
          id="feedback-description"
          v-model="formData.description"
          required
          rows="5"
          placeholder="Please provide detailed information about your feedback"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
        ></textarea>
      </div>

      <div>
        <label
          for="user-email"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Email (Optional)
        </label>
        <input
          id="user-email"
          v-model="formData.userEmail"
          type="email"
          placeholder="Enter your email if you'd like us to follow up"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
        />
      </div>

      <div class="flex items-center">
        <input
          id="include-user-agent"
          v-model="includeUserAgent"
          type="checkbox"
          class="h-4 w-4 text-gray-800 focus:ring-gray-800 border-gray-300 rounded"
        />
        <label
          for="include-user-agent"
          class="ml-2 block text-sm text-gray-700"
        >
          Include browser information to help us troubleshoot
        </label>
      </div>

      <div class="pt-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50"
        >
          <span v-if="!isSubmitting">Submit Feedback</span>
          <span v-else>Submitting...</span>
        </button>
      </div>
    </form>

    <!-- Success message -->
    <div
      v-if="submitSuccess"
      class="mt-4 p-4 bg-green-50 text-green-800 rounded-md border border-green-200"
    >
      <p class="font-medium">Thank you for your feedback!</p>
      <p>
        We appreciate you taking the time to share your thoughts with us. Our
        team will review your feedback and respond if needed.
      </p>
    </div>

    <!-- Error message -->
    <div
      v-if="submitError"
      class="mt-4 p-4 bg-red-50 text-red-800 rounded-md border border-red-200"
    >
      <p class="font-medium">Error submitting feedback</p>
      <p>{{ submitError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FeedbackSubmission } from '~/types/feedback'

const emit = defineEmits(['submitted'])

const formData = reactive<FeedbackSubmission>({
  type: '',
  title: '',
  description: '',
  category: '',
  userEmail: '',
})

const includeUserAgent = ref(false)
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const submitFeedback = async () => {
  isSubmitting.value = true
  submitError.value = ''
  submitSuccess.value = false

  try {
    // Prepare the feedback data
    const feedbackData: FeedbackSubmission = {
      type: formData.type,
      title: formData.title,
      description: formData.description,
      category: formData.category || undefined,
      userEmail: formData.userEmail || undefined,
    }

    // Include user agent if requested
    if (
      includeUserAgent.value &&
      typeof window !== 'undefined' &&
      window.navigator
    ) {
      feedbackData.userAgent = window.navigator.userAgent
    }

    // Submit the feedback to the API
    const response = await $fetch('/api/feedback', {
      method: 'POST',
      body: feedbackData,
    })

    if (response.success) {
      // Reset form
      Object.assign(formData, {
        type: '',
        title: '',
        description: '',
        category: '',
        userEmail: '',
      })
      includeUserAgent.value = false
      submitSuccess.value = true

      // Track the feedback submission in analytics
      try {
        const { trackFeedbackSubmitted } = await import('~/utils/analytics')
        await trackFeedbackSubmitted(feedbackData.type, feedbackData.category)
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError)
      }

      emit('submitted', response.data)

      // Hide success message after 5 seconds
      setTimeout(() => {
        submitSuccess.value = false
      }, 5000)
    } else {
      submitError.value = response.message || 'Failed to submit feedback'
    }
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    submitError.value =
      error.message || 'An error occurred while submitting feedback'
  } finally {
    isSubmitting.value = false
  }
}
</script>
