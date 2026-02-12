<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
          {{ config.developer.title }}
        </h1>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.gettingStarted.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ config.developer.gettingStarted.description }}
          </p>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 class="font-medium text-blue-800 mb-2">
              {{ config.developer.baseUrl.title }}
            </h3>
            <p class="font-mono text-sm bg-white p-2 rounded">
              {{ config.developer.baseUrl.url }}
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.authentication.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ config.developer.authentication.description }}
          </p>

          <div class="bg-gray-100 rounded-md p-4 mb-4">
            <h3 class="font-medium text-gray-800 mb-2">
              {{ config.developer.authentication.headerFormat }}
            </h3>
            <pre
              class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
            >{{ config.developer.authentication.headerExample }}</pre>
          </div>

          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            @click="goToApiKeys"
          >
            {{ config.developer.authentication.manageKeysButton }}
          </button>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.apiExamples.title }}
          </h2>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{ config.developer.apiExamples.getResources.title }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{ config.developer.apiExamples.getResources.command }}</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{ config.developer.apiExamples.searchResources.title }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{ config.developer.apiExamples.searchResources.command }}</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{ config.developer.apiExamples.submitResource.title }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{ config.developer.apiExamples.submitResource.command }}</pre>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.rateLimiting.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ config.developer.rateLimiting.description }}
          </p>

          <ul class="list-disc pl-6 text-gray-600 space-y-2">
            <li>
              <strong>{{ config.developer.rateLimiting.limits.general }}</strong>: {{ config.developer.rateLimiting.limits.generalValue }}
            </li>
            <li>
              <strong>{{ config.developer.rateLimiting.limits.search }}</strong>: {{ config.developer.rateLimiting.limits.searchValue }}
            </li>
            <li>
              <strong>{{
                config.developer.rateLimiting.limits.submission
              }}</strong>: {{ config.developer.rateLimiting.limits.submissionValue }}
            </li>
          </ul>

          <div
            class="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4"
          >
            <h3 class="font-medium text-yellow-800 mb-2">
              {{ config.developer.rateLimiting.headers.title }}
            </h3>
            <p class="text-sm text-gray-700">
              {{ config.developer.rateLimiting.headers.description }}
              <code class="font-mono">{{
                config.developer.rateLimiting.headers.limitHeader
              }}</code>,
              <code class="font-mono">{{
                config.developer.rateLimiting.headers.remainingHeader
              }}</code>, and
              <code class="font-mono">{{
                config.developer.rateLimiting.headers.resetHeader
              }}</code>.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.errorHandling.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ config.developer.errorHandling.description }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                {{ config.developer.errorHandling.success.title }}
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >{{ config.developer.errorHandling.success.example }}</pre>
            </div>

            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                {{ config.developer.errorHandling.error.title }}
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >{{ config.developer.errorHandling.error.example }}</pre>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ config.developer.documentation.title }}
          </h2>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/api-docs"
              target="_blank"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
            >
              {{ config.developer.documentation.interactiveButton }}
            </a>
            <a
              href="/api-keys"
              class="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
            >
              {{ config.developer.documentation.keyManagementButton }}
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { contentConfig } from '~/configs/content.config'

const config = contentConfig

const goToApiKeys = () => {
  navigateTo('/api-keys')
}

useHead({
  title: config.developer.pageTitle,
  meta: [
    {
      name: 'description',
      content: config.developer.metaDescription,
    },
  ],
})
</script>
