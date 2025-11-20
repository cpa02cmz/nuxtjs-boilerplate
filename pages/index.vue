<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1
          class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Free Stuff on the Internet
        </h1>
        <p class="mt-6 max-w-lg mx-auto text-xl text-gray-500">
          Discover amazing free resources available on the internet - from AI
          tools to hosting services.
        </p>
      </div>

      <div class="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <ClientOnly>
          <ResourceCard
            title="Free AI API Keys"
            description="Access powerful AI models with free API keys for development and testing."
            :benefits="[
              'OpenAI API (limited free tier)',
              'Hugging Face Inference API',
              'Google AI Studio',
            ]"
            url="https://example.com"
            button-label="Explore AI Tools"
          />
        </ClientOnly>
        <ClientOnly>
          <ResourceCard
            title="Free VPS"
            description="Virtual Private Server options available for free or trial periods."
            :benefits="[
              'AWS Free Tier',
              'Google Cloud Free Tier',
              'Microsoft Azure Free Account',
            ]"
            url="https://example.com"
            button-label="Get VPS"
          />
        </ClientOnly>
        <ClientOnly>
          <ResourceCard
            title="Free Webhosting"
            description="Reliable web hosting services available for free to get your site online."
            :benefits="['Vercel', 'Netlify', 'GitHub Pages']"
            url="https://example.com"
            button-label="Find Hosting"
          />
        </ClientOnly>
      </div>

      <div class="mt-16 max-w-3xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          More Free Resources
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ClientOnly>
            <ResourceCard
              title="Free Databases"
              description="Reliable database solutions available for free."
              :benefits="[
                'MongoDB Atlas (Free Tier)',
                'Firebase',
                'PlanetScale MySQL',
              ]"
              url="https://example.com"
              button-label="Explore Databases"
            />
          </ClientOnly>
          <ClientOnly>
            <ResourceCard
              title="Free CDN"
              description="Content delivery networks to accelerate your content."
              :benefits="['Cloudflare', 'jsDelivr', 'UNPKG']"
              url="https://example.com"
              button-label="Get CDN"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import ResourceCard component with dynamic import for better performance
import { defineAsyncComponent } from 'vue'

const ResourceCard = defineAsyncComponent(
  () => import('~/components/ResourceCard.vue')
)

definePageMeta({
  layout: 'default',
})
</script>
