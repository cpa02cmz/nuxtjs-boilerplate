<template>
  <div class="compare-page">
    <div class="page-header">
      <h1>Compare Resources</h1>
      <p>
        Select multiple resources to compare their features, pricing, and
        capabilities side-by-side
      </p>
    </div>

    <ComparisonBuilder />
  </div>
</template>

<script setup lang="ts">
import ComparisonBuilder from '~/components/ComparisonBuilder.vue'

// Set page metadata
useSeoMeta({
  title: 'Compare Resources | Nuxt.js Boilerplate',
  description:
    'Compare multiple resources side-by-side to make informed decisions. Evaluate features, pricing, and capabilities.',
  ogTitle: 'Compare Resources',
  ogDescription:
    'Compare multiple resources side-by-side to make informed decisions.',
  ogType: 'website',
  ogUrl: `${useRuntimeConfig().public.baseURL}/compare`,
})
</script>

<style scoped>
.compare-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #333;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .compare-page {
    padding: 1rem 0.5rem;
  }
}
</style>
