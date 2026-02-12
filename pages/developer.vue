<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
          {{ contentConfig.developerPage.title }}
        </h1>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.gettingStarted.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{
              contentConfig.developerPage.sections.gettingStarted.description
            }}
          </p>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 class="font-medium text-blue-800 mb-2">
              {{
                contentConfig.developerPage.sections.gettingStarted.baseUrl
                  .label
              }}
            </h3>
            <p class="font-mono text-sm bg-white p-2 rounded">
              {{
                contentConfig.developerPage.sections.gettingStarted.baseUrl.url
              }}
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.authentication.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{
              contentConfig.developerPage.sections.authentication.description
            }}
          </p>

          <div class="bg-gray-100 rounded-md p-4 mb-4">
            <h3 class="font-medium text-gray-800 mb-2">
              {{
                contentConfig.developerPage.sections.authentication.headerFormat
              }}
            </h3>
            <pre
              class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
            >{{
                contentConfig.developerPage.sections.authentication.example
            }}</pre>
          </div>

          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            @click="goToApiKeys"
          >
            {{
              contentConfig.developerPage.sections.authentication.manageButton
            }}
          </button>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.apiExamples.title }}
          </h2>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{
                contentConfig.developerPage.sections.apiExamples.getResources
                  .title
              }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{
                  contentConfig.developerPage.sections.apiExamples.getResources
                    .code
              }}</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{
                contentConfig.developerPage.sections.apiExamples.searchResources
                  .title
              }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{
                  contentConfig.developerPage.sections.apiExamples
                    .searchResources.code
              }}</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              {{
                contentConfig.developerPage.sections.apiExamples.submitResource
                  .title
              }}
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >{{
                  contentConfig.developerPage.sections.apiExamples
                    .submitResource.code
              }}</pre>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.rateLimiting.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ contentConfig.developerPage.sections.rateLimiting.description }}
          </p>

          <ul class="list-disc pl-6 text-gray-600 space-y-2">
            <li>
              <strong>{{
                contentConfig.developerPage.sections.rateLimiting.limits.general
                  .label
              }}</strong>:
              {{
                contentConfig.developerPage.sections.rateLimiting.limits.general
                  .value
              }}
            </li>
            <li>
              <strong>{{
                contentConfig.developerPage.sections.rateLimiting.limits.search
                  .label
              }}</strong>:
              {{
                contentConfig.developerPage.sections.rateLimiting.limits.search
                  .value
              }}
              {{
                contentConfig.developerPage.sections.rateLimiting.limits.search
                  .note
              }}
            </li>
            <li>
              <strong>{{
                contentConfig.developerPage.sections.rateLimiting.limits
                  .submission.label
              }}</strong>:
              {{
                contentConfig.developerPage.sections.rateLimiting.limits
                  .submission.value
              }}
            </li>
          </ul>

          <div
            class="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4"
          >
            <h3 class="font-medium text-yellow-800 mb-2">
              {{
                contentConfig.developerPage.sections.rateLimiting.headers.title
              }}
            </h3>
            <p class="text-sm text-gray-700">
              {{
                contentConfig.developerPage.sections.rateLimiting.headers
                  .description
              }}
              <code
                v-for="(header, index) in contentConfig.developerPage.sections
                  .rateLimiting.headers.headers"
                :key="header"
                class="font-mono"
              >
                {{ header
                }}<template
                  v-if="
                    index <
                      contentConfig.developerPage.sections.rateLimiting.headers
                        .headers.length -
                      1
                  "
                >,
                </template> </code>.
            </p>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.errorHandling.title }}
          </h2>
          <p class="text-gray-600 mb-4">
            {{ contentConfig.developerPage.sections.errorHandling.description }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                {{
                  contentConfig.developerPage.sections.errorHandling
                    .successExample.title
                }}
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >{{
                  contentConfig.developerPage.sections.errorHandling
                    .successExample.code
              }}</pre>
            </div>

            <div class="border border-gray-200 rounded-md p-4">
              <h3 class="font-medium text-gray-800 mb-2">
                {{
                  contentConfig.developerPage.sections.errorHandling
                    .errorExample.title
                }}
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >{{
                  contentConfig.developerPage.sections.errorHandling
                    .errorExample.code
              }}</pre>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-700 mb-4">
            {{ contentConfig.developerPage.sections.apiDocumentation.title }}
          </h2>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/api-docs"
              target="_blank"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
            >
              {{
                contentConfig.developerPage.sections.apiDocumentation
                  .interactiveButton
              }}
            </a>
            <a
              href="/api-keys"
              class="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-center"
            >
              {{
                contentConfig.developerPage.sections.apiDocumentation.keysButton
              }}
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { contentConfig } from '~/configs/content.config'

const goToApiKeys = () => {
  navigateTo('/api-keys')
}

useHead({
  title: contentConfig.developerPage.seo.title,
  meta: [
    {
      name: 'description',
      content: contentConfig.developerPage.seo.description,
    },
  ],
})
</script>
