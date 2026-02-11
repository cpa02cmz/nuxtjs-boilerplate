<template>
  <div class="client-error-boundary">
    <ClientOnly>
      <ErrorBoundary
        :component-name="componentName"
        :show-details="showDetails"
        @error="
          (err: Error, info: { componentStack: string }) =>
            $emit('error', err, info)
        "
        @reset="$emit('reset')"
      >
        <slot />
      </ErrorBoundary>
      <template #fallback>
        <slot />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import ErrorBoundary from './ErrorBoundary.vue'

interface Props {
  componentName?: string
  showDetails?: boolean
}

withDefaults(defineProps<Props>(), {
  componentName: undefined,
  showDetails: false,
})

defineEmits<{
  error: [error: Error, info: { componentStack: string }]
  reset: []
}>()
</script>
