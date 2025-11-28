<template>
  <div class="feedback-analytics-dashboard min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Feedback Analytics</h1>
        <p class="mt-2 text-gray-600">
          Monitor and analyze user feedback to improve the platform
        </p>
      </div>

      <!-- Date Range Selector -->
      <div class="mb-6 bg-white p-4 rounded-lg shadow">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0"
        >
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Start Date</label
            >
            <input
              v-model="startDate"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >End Date</label
            >
            <input
              v-model="endDate"
              type="date"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="fetchFeedbackData"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="bg-white p-8 rounded-lg shadow flex justify-center"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white p-8 rounded-lg shadow">
        <div class="text-red-600 text-center">
          <p class="text-lg font-medium">Error loading feedback data</p>
          <p class="mt-2">{{ error }}</p>
          <button
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            @click="fetchFeedbackData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Feedback Overview Cards -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="rounded-full bg-blue-100 p-3">
              <svg
                class="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Total Feedback</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ feedbackData?.count || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="rounded-full bg-green-100 p-3">
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Resolved</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ resolvedCount }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="rounded-full bg-yellow-100 p-3">
              <svg
                class="h-6 w-6 text-yellow-600"
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
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">Open</h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ openCount }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="rounded-full bg-purple-100 p-3">
              <svg
                class="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">
                Avg Response Time
              </h3>
              <p class="text-2xl font-semibold text-gray-900">
                {{ avgResponseTime }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Type Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Feedback by Type
          </h2>
          <div
            v-if="!feedbackData?.data?.length"
            class="text-gray-500 text-center py-8"
          >
            No feedback data available
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="type in feedbackTypeCounts"
              :key="type.type"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div class="flex items-center">
                <span class="text-gray-700 font-medium capitalize">{{
                  type.type.replace('_', ' ')
                }}</span>
              </div>
              <span class="text-gray-700 font-medium">{{ type.count }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Recent Feedback
          </h2>
          <div
            v-if="!feedbackData?.data?.length"
            class="text-gray-500 text-center py-8"
          >
            No feedback data available
          </div>
          <ul v-else class="space-y-3">
            <li
              v-for="feedback in recentFeedback"
              :key="feedback.id"
              class="p-3 bg-gray-50 rounded-md"
            >
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-700 truncate">{{
                  feedback.title
                }}</span>
                <span class="text-xs text-gray-500">{{
                  formatDate(feedback.createdAt)
                }}</span>
              </div>
              <div class="mt-1 flex items-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ feedback.type.replace('_', ' ') }}
                </span>
                <span
                  class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {{ feedback.status }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- All Feedback Table -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-medium text-gray-900 mb-4">All Feedback</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="feedback in feedbackData?.data" :key="feedback.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="text-sm font-medium text-gray-900 truncate max-w-xs"
                  >
                    {{ feedback.title }}
                  </div>
                  <div class="text-sm text-gray-500 truncate max-w-xs">
                    {{ feedback.description.substring(0, 50) }}...
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize"
                  >
                    {{ feedback.type.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize"
                  >
                    {{ feedback.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(feedback.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewFeedback(feedback)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="respondToFeedback(feedback)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Respond
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Feedback } from '~/types/feedback'

// Define types
interface FeedbackResponse {
  success: boolean
  data: Feedback[]
  count: number
}

// State
const feedbackData = ref<FeedbackResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const startDate = ref('')
const endDate = ref('')

// Initialize date range to last 30 days
const now = new Date()
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(now.getDate() - 30)

startDate.value = thirtyDaysAgo.toISOString().split('T')[0]
endDate.value = now.toISOString().split('T')[0]

// Computed properties
const resolvedCount = computed(() => {
  if (!feedbackData.value?.data) return 0
  return feedbackData.value.data.filter(
    f => f.status === 'resolved' || f.status === 'closed'
  ).length
})

const openCount = computed(() => {
  if (!feedbackData.value?.data) return 0
  return feedbackData.value.data.filter(
    f => f.status === 'open' || f.status === 'in_progress'
  ).length
})

const avgResponseTime = computed(() => {
  if (!feedbackData.value?.data) return 'N/A'

  const withResponse = feedbackData.value.data.filter(f => f.respondedAt)
  if (withResponse.length === 0) return 'N/A'

  const totalResponseTime = withResponse.reduce((sum, feedback) => {
    const submittedDate = new Date(feedback.createdAt).getTime()
    const responseDate = new Date(feedback.respondedAt!).getTime()
    return sum + (responseDate - submittedDate)
  }, 0)

  const avgMs = totalResponseTime / withResponse.length
  const avgDays = Math.floor(avgMs / (1000 * 60 * 60 * 24))

  return `${avgDays} day${avgDays !== 1 ? 's' : ''}`
})

const feedbackTypeCounts = computed(() => {
  if (!feedbackData.value?.data) return []

  const typeMap: Record<string, number> = {}
  feedbackData.value.data.forEach(feedback => {
    typeMap[feedback.type] = (typeMap[feedback.type] || 0) + 1
  })

  return Object.entries(typeMap).map(([type, count]) => ({
    type,
    count,
  }))
})

const recentFeedback = computed(() => {
  if (!feedbackData.value?.data) return []
  return feedbackData.value.data.slice(0, 5)
})

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Fetch feedback data
const fetchFeedbackData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/feedback', {
      method: 'GET',
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    })

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch feedback data')
    }

    feedbackData.value = response
  } catch (err: any) {
    console.error('Error fetching feedback:', err)
    error.value = err.message || 'Failed to load feedback data'
  } finally {
    loading.value = false
  }
}

// View feedback details
const viewFeedback = (feedback: Feedback) => {
  alert(
    `Feedback Details:\n\nTitle: ${feedback.title}\nType: ${feedback.type}\nStatus: ${feedback.status}\nDescription: ${feedback.description}\nDate: ${formatDate(feedback.createdAt)}`
  )
}

// Respond to feedback
const respondToFeedback = (feedback: Feedback) => {
  alert(
    `Ready to respond to feedback: ${feedback.title}\n\nIn a real application, this would open a response form.`
  )
}

// Initialize data on component mount
onMounted(() => {
  fetchFeedbackData()
})

definePageMeta({
  layout: 'default',
  title: 'Feedback Analytics - Free Stuff on the Internet',
  description: 'Analytics dashboard for user feedback',
})
</script>
