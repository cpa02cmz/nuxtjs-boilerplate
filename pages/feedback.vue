<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Feedback</h1>
      <p class="text-lg text-gray-600">
        We value your feedback! Help us improve by sharing your thoughts,
        suggestions, or reporting issues.
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <FeedbackForm @submitted="onFeedbackSubmitted" />
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Why Your Feedback Matters
      </h2>
      <ul class="space-y-2 text-gray-600">
        <li class="flex items-start">
          <div class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
          <span class="ml-2">Helps us identify bugs and issues to fix</span>
        </li>
        <li class="flex items-start">
          <div class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
          <span class="ml-2">Guides our development priorities</span>
        </li>
        <li class="flex items-start">
          <div class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
          <span class="ml-2">Improves the overall user experience</span>
        </li>
        <li class="flex items-start">
          <div class="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
          <span class="ml-2">Ensures we're meeting your needs</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Feedback - Free Stuff on the Internet',
  description:
    'Submit your feedback to help us improve the Free Stuff on the Internet platform',
})

const onFeedbackSubmitted = (feedback: any) => {
  console.log('Feedback submitted:', feedback)
  // Handle successful feedback submission
}
</script>
