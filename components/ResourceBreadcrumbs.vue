<template>
  <nav
    ref="breadcrumbRef"
    class="mb-6"
    aria-label="Breadcrumb"
    @keydown="handleKeydown"
  >
    <ol class="flex items-center space-x-2 text-sm">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="item.to || item.label"
        class="flex items-center"
      >
        <NuxtLink
          v-if="item.to"
          :ref="el => setItemRef(el, index)"
          :to="item.to"
          :tabindex="focusedIndex === index ? 0 : -1"
          class="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-1 -ml-1 transition-all duration-200"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="text-gray-700 font-medium flex items-center gap-1"
          aria-current="page"
        >
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span class="truncate">{{ item.label }}</span>
        </span>
        <span
          v-if="index < breadcrumbs.length - 1"
          class="mx-2 text-gray-400"
          aria-hidden="true"
        >/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  title: string
}>()

// Breadcrumb items configuration
const breadcrumbs = computed(() => [
  { label: 'Home', to: '/' },
  { label: 'Resources', to: '/search' },
  { label: props.title },
])

// Refs for keyboard navigation
const breadcrumbRef = ref<HTMLElement | null>(null)
const itemRefs = ref<(HTMLElement | null)[]>([])
const focusedIndex = ref(0)

const setItemRef = (el: HTMLElement | null, index: number) => {
  if (el) {
    itemRefs.value[index] = el
  }
}

// Keyboard navigation handler
const handleKeydown = (event: KeyboardEvent) => {
  const linkIndices = breadcrumbs.value
    .map((item, index) => (item.to ? index : -1))
    .filter(index => index !== -1)

  if (linkIndices.length === 0) return

  const currentLinkIndex = linkIndices.indexOf(focusedIndex.value)

  switch (event.key) {
    case 'ArrowRight':
      event.preventDefault()
      if (currentLinkIndex < linkIndices.length - 1) {
        focusedIndex.value = linkIndices[currentLinkIndex + 1]
        focusCurrentItem()
      }
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (currentLinkIndex > 0) {
        focusedIndex.value = linkIndices[currentLinkIndex - 1]
        focusCurrentItem()
      }
      break
    case 'Home':
      event.preventDefault()
      focusedIndex.value = linkIndices[0]
      focusCurrentItem()
      break
    case 'End':
      event.preventDefault()
      focusedIndex.value = linkIndices[linkIndices.length - 1]
      focusCurrentItem()
      break
  }
}

const focusCurrentItem = () => {
  nextTick(() => {
    const item = itemRefs.value[focusedIndex.value]
    if (item) {
      item.focus()
    }
  })
}

// Initialize first item as focusable
onMounted(() => {
  const firstLinkIndex = breadcrumbs.value.findIndex(item => item.to)
  if (firstLinkIndex !== -1) {
    focusedIndex.value = firstLinkIndex
  }
})
</script>
