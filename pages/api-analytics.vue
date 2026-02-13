<template>
  <div :class="[tailwind.layout.screenHeight, 'bg-gray-50 py-8']">
    <div :class="[tailwind.containers.wide, 'mx-auto px-4']">
      <div :class="[tailwind.cards.padded]">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            API Analytics
          </h1>
          <a
            href="/api-docs"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            API Documentation
          </a>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            v-for="metric in metrics"
            :key="metric.title"
            :class="`bg-${metric.color}-50 border border-${metric.color}-200 rounded-md p-4`"
          >
            <h3 :class="`text-lg font-medium text-${metric.color}-800 mb-2`">
              {{ metric.title }}
            </h3>
            <p :class="`text-3xl font-bold text-${metric.color}-600`">
              {{ metric.value }}
            </p>
            <p :class="`text-sm text-${metric.color}-700 mt-1`">
              {{ metric.subtext }}
            </p>
          </div>
        </div>

        <!-- Endpoint Usage -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Endpoint Usage
          </h2>
          <div class="space-y-4">
            <div
              v-for="endpoint in endpointUsage"
              :key="endpoint.name"
            >
              <div class="flex justify-between mb-1">
                <span class="text-gray-700">{{ endpoint.name }}</span>
                <span class="text-gray-600">{{ endpoint.requests }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  :class="`${endpoint.color} h-2.5 rounded-full`"
                  :style="{ width: `${endpoint.percentage}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Recent API Activity -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Recent API Activity
          </h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Endpoint
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Method
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    API Key
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="activity in recentActivity"
                  :key="`${activity.endpoint}-${activity.time}`"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ activity.endpoint }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ activity.method }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${activity.statusColor}-100 text-${activity.statusColor}-800`"
                    >{{ activity.status }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ activity.time }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ activity.apiKey }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Rate Limiting -->
        <div>
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            Rate Limiting
          </h2>
          <p class="text-gray-600 mb-4">
            Monitor rate limiting statistics to ensure fair API usage across all
            consumers.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="stat in rateLimitStats"
              :key="stat.title"
              class="border border-gray-200 rounded-md p-4"
            >
              <h3 class="font-medium text-gray-800 mb-2">
                {{ stat.title }}
              </h3>
              <p
                class="text-2xl font-bold"
                :class="
                  stat.title.includes('Exceeded')
                    ? 'text-red-600'
                    : 'text-gray-700'
                "
              >
                {{ stat.value }}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                {{ stat.subtext }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { tailwindClassesConfig as tailwind } from '~/configs/tailwind-classes.config'
import { analyticsDemoData } from '~/configs/analytics-demo.config'

useHead({
  title: 'API Analytics - Free Stuff on the Internet',
  meta: [
    {
      name: 'description',
      content:
        'API usage analytics and monitoring for Free Stuff on the Internet',
    },
  ],
})

// Use computed to make it reactive if needed in the future
const metrics = computed(() => Object.values(analyticsDemoData.metrics))
const endpointUsage = computed(() => analyticsDemoData.endpointUsage)
const recentActivity = computed(() => analyticsDemoData.recentActivity)
const rateLimitStats = computed(() =>
  Object.values(analyticsDemoData.rateLimiting)
)
</script>
