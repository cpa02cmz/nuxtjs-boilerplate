<template>
  <div class="py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {{ contentConfig.about.title }}
        </h1>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          {{ contentConfig.about.sectionTitle }}
        </h2>
        <p class="mb-4 text-gray-600">
          {{ contentConfig.about.description }}
        </p>

        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          {{ contentConfig.about.categoriesTitle }}
        </h3>
        <ul class="space-y-2">
          <li class="flex items-start">
            <svg
              class="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ contentConfig.about.categories.ai }}</span>
          </li>
          <li class="flex items-start">
            <svg
              class="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ contentConfig.about.categories.vps }}</span>
          </li>
          <li class="flex items-start">
            <svg
              class="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ contentConfig.about.categories.hosting }}</span>
          </li>
          <li class="flex items-start">
            <svg
              class="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ contentConfig.about.categories.databases }}</span>
          </li>
          <li class="flex items-start">
            <svg
              class="h-6 w-6 text-green-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ contentConfig.about.categories.cdn }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { contentConfig } from '~/configs/content.config'
import { DEFAULT_DEV_URL } from '~/configs/url.config'

definePageMeta({
  layout: 'default',
})

// Set page-specific meta tags
const runtimeConfig = useRuntimeConfig()
useSeoMeta({
  title: `About - ${contentConfig.navigation.appName}`,
  ogTitle: `About - ${contentConfig.navigation.appName}`,
  description: contentConfig.about.description,
  ogDescription: contentConfig.about.description,
  ogImage: '/og-image.jpg',
  ogUrl: `${runtimeConfig.public.siteUrl || runtimeConfig.public.canonicalUrl || DEFAULT_DEV_URL}/about`,
  twitterCard: 'summary_large_image',
})
</script>
