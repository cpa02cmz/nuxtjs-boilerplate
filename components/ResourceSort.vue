<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-4">
    <div class="text-sm">
      <span
        ref="countRef"
        class="font-bold text-lg tabular-nums transition-colors duration-300"
        :class="countChangeClass"
        :aria-label="`${displayCount} resources found`"
      >{{ displayCount }}</span>
      <span class="text-gray-800"> resources found</span>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <span
          v-if="showChangeIndicator"
          class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
          :class="changeIndicatorClass"
          role="status"
          aria-live="polite"
        >
          {{ changeIndicatorText }}
        </span>
      </Transition>
    </div>
    <div class="flex items-center space-x-2">
      <label
        for="sort"
        class="text-sm text-gray-800"
      >Sort by:</label>
      <select
        id="sort"
        :value="selectedSortOption ?? 'popularity-desc'"
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-transparent sm:text-sm rounded-md"
        @change="handleChange"
        @keydown.enter="handleChange"
        @keydown.space="handleChange"
      >
        <option value="popularity-desc">
          Most Popular
        </option>
        <option value="alphabetical-asc">
          A-Z
        </option>
        <option value="alphabetical-desc">
          Z-A
        </option>
        <option value="date-added-desc">
          Newest First
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { thresholdsConfig } from '~/configs/thresholds.config'

interface Props {
  selectedSortOption?: string
  totalResources?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedSortOption: undefined,
  totalResources: 0,
})

const emit = defineEmits<{
  (e: 'update-sort-option', option: string): void
}>()

// Animated counter state
const displayCount = ref(props.totalResources)
const previousCount = ref(props.totalResources)
const countChangeClass = ref('text-gray-800')
const showChangeIndicator = ref(false)
const changeIndicatorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Compute the change from previous count
const countChange = computed(() => props.totalResources - previousCount.value)

// Compute change indicator text
const changeIndicatorText = computed(() => {
  const change = countChange.value
  if (change > 0) return `+${change}`
  if (change < 0) return `${change}`
  return ''
})

// Compute change indicator styling based on magnitude
const changeIndicatorClass = computed(() => {
  const change = countChange.value
  const absChange = Math.abs(change)
  const { highThreshold, mediumThreshold } = thresholdsConfig.changeIndicator

  if (change > 0) {
    // Positive change - green shades based on magnitude
    if (absChange >= highThreshold)
      return 'bg-green-100 text-green-700 ring-1 ring-green-200'
    if (absChange >= mediumThreshold) return 'bg-green-50 text-green-600'
    return 'text-green-600'
  }

  if (change < 0) {
    // Negative change - orange/amber shades based on magnitude
    if (absChange >= highThreshold)
      return 'bg-orange-100 text-orange-700 ring-1 ring-orange-200'
    if (absChange >= mediumThreshold) return 'bg-orange-50 text-orange-600'
    return 'text-orange-600'
  }

  return ''
})

// Animation frame reference for cleanup
const animationFrame = ref<number | null>(null)

// Smooth count animation function
const animateCount = (
  from: number,
  to: number,
  duration: number = thresholdsConfig.countAnimation.defaultDurationMs
) => {
  const startTime = performance.now()
  const diff = to - from

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // Easing function: easeOutQuart for smooth deceleration
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)

    displayCount.value = Math.round(from + diff * easeOutQuart)

    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(step)
    }
  }

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }

  animationFrame.value = requestAnimationFrame(step)
}

// Watch for count changes
watch(
  () => props.totalResources,
  (newCount, oldCount) => {
    if (newCount === oldCount) return

    // Update previous count reference
    const oldValue = previousCount.value
    previousCount.value = newCount

    // Animate the count change
    animateCount(displayCount.value, newCount)

    // Apply color change based on direction
    const change = newCount - oldValue

    if (change > 0) {
      countChangeClass.value = 'text-green-600'
    } else if (change < 0) {
      countChangeClass.value = 'text-orange-600'
    }

    // Reset color after animation
    setTimeout(() => {
      countChangeClass.value = 'text-gray-800'
    }, thresholdsConfig.countAnimation.colorResetDelayMs)

    // Show change indicator for significant changes
    if (Math.abs(change) >= thresholdsConfig.changeIndicator.minChange) {
      showChangeIndicator.value = true

      // Clear existing timeout
      if (changeIndicatorTimeout.value) {
        clearTimeout(changeIndicatorTimeout.value)
      }

      // Hide after delay
      changeIndicatorTimeout.value = setTimeout(() => {
        showChangeIndicator.value = false
      }, thresholdsConfig.changeIndicator.displayDurationMs)
    }
  },
  { immediate: false }
)

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update-sort-option', target.value)
}

// Cleanup on unmount
onUnmounted(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }
  if (changeIndicatorTimeout.value) {
    clearTimeout(changeIndicatorTimeout.value)
  }
})
</script>
