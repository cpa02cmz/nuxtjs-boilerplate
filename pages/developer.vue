<template>
  <div :class="[tailwind.layout.screenHeight, 'bg-gray-50 py-8']">
    <div :class="[tailwind.containers.medium, 'mx-auto px-4']">
      <div :class="[tailwind.cards.padded]">
        <h1 :class="[tailwind.typography.pageTitle, 'mb-6']">
          Developer Portal
        </h1>

        <section :class="[tailwind.spacing.section]">
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            Getting Started
          </h2>
          <p :class="[tailwind.typography.body, 'mb-4']">
            Welcome to the Free Stuff on the Internet API! Our API allows you to
            access and interact with our collection of free resources
            programmatically.
          </p>

          <div
            :class="[
              tailwind.status.info.bg,
              tailwind.status.info.border,
              'rounded-md p-4 mb-4',
            ]"
          >
            <h3 class="font-medium text-blue-800 mb-2">
              Base URL
            </h3>
            <p class="font-mono text-sm bg-white p-2 rounded">
              https://yourdomain.com/api
            </p>
          </div>
        </section>

        <section :class="[tailwind.spacing.section]">
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            Authentication
          </h2>
          <p :class="[tailwind.typography.body, 'mb-4']">
            To use the API, you need to include your API key in the request
            headers.
          </p>

          <div class="bg-gray-100 rounded-md p-4 mb-4">
            <h3 class="font-medium text-gray-800 mb-2">
              Header Format
            </h3>
            <pre class="font-mono text-sm bg-white p-3 rounded overflow-x-auto">
X-API-Key: your-api-key-here</pre>
          </div>

          <button
            :class="[tailwind.buttons.primaryBlue, 'focus:outline-none']"
            @click="goToApiKeys"
          >
            Manage API Keys
          </button>
        </section>

        <section :class="[tailwind.spacing.section]">
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            API Examples
          </h2>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              Get Resources
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >
curl -X GET \
  -H "X-API-Key: your-api-key-here" \
  "https://yourdomain.com/api/v1/resources?limit=10&category=tools"</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              Search Resources
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >
curl -X GET \
  -H "X-API-Key: your-api-key-here" \
  "https://yourdomain.com/api/v1/search?q=hosting&pricing=Free"</pre>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="font-medium text-gray-800 mb-2">
              Submit a Resource
            </h3>
            <div class="bg-gray-100 rounded-md p-4">
              <pre
                class="font-mono text-sm bg-white p-3 rounded overflow-x-auto"
              >
curl -X POST \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Resource",
    "description": "A brief description of my resource",
    "url": "https://example.com",
    "category": "Tools"
  }' \
  "https://yourdomain.com/api/submissions"</pre>
            </div>
          </div>
        </section>

        <section :class="[tailwind.spacing.section]">
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            Rate Limiting
          </h2>
          <p :class="[tailwind.typography.body, 'mb-4']">
            Our API implements rate limiting to ensure fair usage. Each API key
            has its own rate limits:
          </p>

          <ul class="list-disc pl-6 text-gray-600 space-y-2">
            <li><strong>General requests</strong>: 100 requests per minute</li>
            <li>
              <strong>Search requests</strong>: 50 requests per minute (more
              restrictive due to resource usage)
            </li>
            <li>
              <strong>Submission requests</strong>: 10 requests per minute
            </li>
          </ul>

          <div
            :class="[
              tailwind.status.warning.bg,
              tailwind.status.warning.border,
              'rounded-md p-4 mt-4',
            ]"
          >
            <h3 class="font-medium text-yellow-800 mb-2">
              Rate Limit Headers
            </h3>
            <p class="text-sm text-gray-700">
              Rate limit responses include headers:
              <code class="font-mono">X-RateLimit-Limit</code>,
              <code class="font-mono">X-RateLimit-Remaining</code>, and
              <code class="font-mono">X-RateLimit-Reset</code>.
            </p>
          </div>
        </section>

        <section :class="[tailwind.spacing.section]">
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            Error Handling
          </h2>
          <p :class="[tailwind.typography.body, 'mb-4']">
            The API returns standard HTTP status codes and error responses:
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div :class="[tailwind.cards.bordered, 'p-4']">
              <h3 :class="[tailwind.typography.cardTitle, 'mb-2']">
                Success Response
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >
{
  "success": true,
  "data": { ... }
}</pre>
            </div>

            <div :class="[tailwind.cards.bordered, 'p-4']">
              <h3 :class="[tailwind.typography.cardTitle, 'mb-2']">
                Error Response
              </h3>
              <pre
                class="font-mono text-xs bg-white p-2 rounded overflow-x-auto"
              >
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}</pre>
            </div>
          </div>
        </section>

        <section>
          <h2 :class="[tailwind.typography.sectionTitle, 'mb-4']">
            API Documentation
          </h2>
          <div class="flex flex-col sm:flex-row gap-4">
            <a
              href="/api-docs"
              target="_blank"
              :class="[
                tailwind.buttons.primaryBlue,
                'text-center',
                tailwind.focus.ringWithOffset,
              ]"
            >
              Interactive API Documentation
            </a>
            <a
              href="/api-keys"
              :class="[
                tailwind.buttons.primary,
                'text-center',
                tailwind.focus.ringWithOffset,
              ]"
            >
              API Key Management
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { tailwindClassesConfig as tailwind } from '~/configs/tailwind-classes.config'

const goToApiKeys = () => {
  navigateTo('/api-keys')
}

useHead({
  title: 'Developer Portal - Free Stuff on the Internet',
  meta: [
    {
      name: 'description',
      content:
        'Developer documentation and API access for Free Stuff on the Internet',
    },
  ],
})
</script>
