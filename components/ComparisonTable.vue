<template>
  <div v-if="resources && resources.length >= 2" class="overflow-x-auto">
    <table
      class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
      :aria-label="`Comparison of ${resources.length} resources`"
    >
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ contentConfig.comparison.headers.criteria }}
          </th>
          <th
            v-for="(resource, index) in resources"
            :key="`header-${index}`"
            scope="col"
            class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            <div class="flex flex-col items-center">
              <div class="font-bold text-sm">
                {{ resource.title }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-500">
                {{ resource.category }}
              </div>
              <Transition
                :enter-active-class="
                  [
                    'transition-all',
                    'ease-out',
                    animationConfig.tailwindDurations.normal,
                  ].join(' ')
                "
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                :leave-active-class="
                  [
                    'transition-all',
                    'ease-in',
                    animationConfig.tailwindDurations.quick,
                  ].join(' ')
                "
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
                mode="out-in"
              >
                <div
                  v-if="confirmingRemove === resource.id"
                  key="confirmation"
                  class="mt-1 flex flex-col items-center space-y-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-2 py-1"
                  role="alert"
                  aria-live="polite"
                >
                  <span
                    class="text-xs text-red-700 dark:text-red-400 font-medium"
                  >
                    {{ contentConfig.comparison.actions.removeConfirm }}
                  </span>
                  <div class="flex space-x-1">
                    <button
                      class="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-1.5 py-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition-colors"
                      @click="cancelRemove"
                    >
                      {{ contentConfig.comparison.actions.cancel }}
                    </button>
                    <button
                      class="text-xs text-red-700 dark:text-red-400 font-medium px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 transition-colors"
                      @click="confirmRemove(resource.id)"
                    >
                      {{ contentConfig.comparison.actions.yes }}
                    </button>
                  </div>
                </div>
                <button
                  v-else
                  key="remove-button"
                  class="mt-1 text-red-500 hover:text-red-700 text-xs flex items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:rounded"
                  :aria-label="`Remove ${resource.title} from comparison`"
                  @click="requestRemove(resource.id)"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {{ contentConfig.comparison.actions.remove }}
                </button>
              </Transition>
            </div>
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="criterion in criteria"
          :key="criterion.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td
            class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
          >
            {{ criterion.name }}
          </td>
          <td
            v-for="(resource, index) in resources"
            :key="`data-${index}-${criterion.id}`"
            class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 text-center"
          >
            <div class="flex justify-center">
              <LazyComparisonValue
                :value="getResourceValue(resource, criterion.id)"
                :type="criterion.type"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Delightful Empty State - Palette's micro-UX enhancement! -->
  <div
    v-else
    ref="emptyStateRef"
    class="relative overflow-hidden"
    role="region"
    :aria-label="contentConfig.comparison.emptyState.ariaLabel"
  >
    <!-- Decorative Background Elements -->
    <div
      v-if="!prefersReducedMotion"
      class="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <!-- Floating circles -->
      <div
        class="comparison-empty-circle comparison-empty-circle-1 absolute rounded-full bg-blue-100/50 dark:bg-blue-900/20"
      />
      <div
        class="comparison-empty-circle comparison-empty-circle-2 absolute rounded-full bg-purple-100/50 dark:bg-purple-900/20"
      />
      <div
        class="comparison-empty-circle comparison-empty-circle-3 absolute rounded-full bg-indigo-100/50 dark:bg-indigo-900/20"
      />
    </div>

    <Transition
      appear
      :enter-active-class="
        prefersReducedMotion
          ? ''
          : [
              'transition-all',
              'ease-out',
              animationConfig.tailwindDurations.slower,
            ].join(' ')
      "
      :enter-from-class="prefersReducedMotion ? '' : 'opacity-0 translate-y-4'"
      :enter-to-class="prefersReducedMotion ? '' : 'opacity-100 translate-y-0'"
    >
      <div class="relative z-10 text-center py-12 px-4">
        <!-- Animated Scale/Balance Icon -->
        <div
          class="relative mx-auto w-24 h-24 mb-6"
          :class="{ 'comparison-empty-icon-bounce': !prefersReducedMotion }"
        >
          <!-- Outer ring -->
          <div
            v-if="!prefersReducedMotion"
            class="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800 comparison-empty-ring-rotate"
            aria-hidden="true"
          />

          <!-- Main icon container -->
          <div
            class="absolute inset-2 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shadow-lg"
            :class="{ 'comparison-empty-icon-pulse': !prefersReducedMotion }"
          >
            <svg
              class="w-10 h-10 text-blue-500 dark:text-blue-400"
              :class="{ 'comparison-empty-scale-icon': !prefersReducedMotion }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <!-- Scale/Balance Icon -->
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>

          <!-- Floating dots -->
          <template v-if="!prefersReducedMotion">
            <div
              class="comparison-empty-dot comparison-empty-dot-1 absolute w-2 h-2 rounded-full bg-blue-400/60"
            />
            <div
              class="comparison-empty-dot comparison-empty-dot-2 absolute w-1.5 h-1.5 rounded-full bg-purple-400/60"
            />
            <div
              class="comparison-empty-dot comparison-empty-dot-3 absolute w-2 h-2 rounded-full bg-indigo-400/60"
            />
          </template>
        </div>

        <!-- Title -->
        <h3
          class="text-xl font-bold text-gray-900 dark:text-white mb-2"
          :class="{ 'comparison-empty-text-reveal': !prefersReducedMotion }"
        >
          {{ contentConfig.comparison.emptyState.title }}
        </h3>

        <!-- Description -->
        <p
          class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6"
          :class="{ 'comparison-empty-text-reveal': !prefersReducedMotion }"
          :style="{
            animationDelay:
              animationConfig.comparisonEmptyState.textRevealStaggerMs + 'ms',
          }"
        >
          {{ contentConfig.comparison.emptyState.description }}
        </p>

        <!-- CTA Button -->
        <div
          :class="{ 'comparison-empty-text-reveal': !prefersReducedMotion }"
          :style="{
            animationDelay:
              animationConfig.comparisonEmptyState.textRevealStaggerMs * 2 +
              'ms',
          }"
        >
          <button
            :class="[
              'group relative inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all',
              animationConfig.tailwindDurations.standard,
              {
                'hover:scale-105 active:scale-95': !prefersReducedMotion,
              },
            ]"
            @click="handleBrowseClick"
          >
            <svg
              :class="[
                'w-5 h-5 mr-2 transition-transform group-hover:rotate-12',
                animationConfig.tailwindDurations.standard,
              ]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {{ contentConfig.comparison.emptyState.browse }}
          </button>
        </div>

        <!-- Popular Resources Suggestions -->
        <div
          v-if="popularResources.length > 0"
          class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          :class="{ 'comparison-empty-text-reveal': !prefersReducedMotion }"
          :style="{
            animationDelay:
              animationConfig.comparisonEmptyState.textRevealStaggerMs * 3 +
              'ms',
          }"
        >
          <p
            class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4"
          >
            {{
              contentConfig.comparison.emptyState.popularLabel ||
              'Popular resources'
            }}
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="(resource, index) in popularResources"
              :key="resource.id"
              :class="[
                'group inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all',
                animationConfig.tailwindDurations.normal,
                {
                  'hover:scale-105 active:scale-95': !prefersReducedMotion,
                  'comparison-empty-suggestion': !prefersReducedMotion,
                },
              ]"
              :style="
                !prefersReducedMotion
                  ? { animationDelay: `${400 + index * 100}ms` }
                  : {}
              "
              @click="handleQuickAdd(resource)"
            >
              <span
                class="w-2 h-2 rounded-full mr-2"
                :class="getCategoryColor(resource.category)"
              />
              {{ resource.title }}
              <svg
                :class="[
                  'w-3 h-3 ml-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all',
                  animationConfig.tailwindDurations.normal,
                ]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Screen Reader Live Region -->
    <div class="sr-only" role="status" aria-live="polite">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Resource } from '~/types/resource'
import type { ComparisonCriteria } from '~/types/comparison'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight, hapticMedium } from '~/utils/hapticFeedback'
import { uiTimingConfig } from '~/configs/ui-timing.config'

interface Props {
  resources?: Resource[]
  criteria?: ComparisonCriteria[]
}

defineProps<Props>()
const emit = defineEmits(['remove-resource', 'add-resource', 'browse'])

// Track which resource is being confirmed for removal
const confirmingRemove = ref<string | null>(null)

// Empty state refs
const emptyStateRef = ref<HTMLElement | null>(null)
const announcement = ref('')
const prefersReducedMotion = ref(false)

// Popular resources for quick-add suggestions
const popularResources = computed<Resource[]>(() => {
  // In a real implementation, these could come from analytics or config
  // For now, return empty array to avoid errors
  return []
})

// Check for reduced motion preference
onMounted(() => {
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    mediaQuery.addEventListener('change', e => {
      prefersReducedMotion.value = e.matches
    })
  }
})

const requestRemove = (resourceId: string) => {
  confirmingRemove.value = resourceId
}

const cancelRemove = () => {
  confirmingRemove.value = null
}

const confirmRemove = (resourceId: string) => {
  emit('remove-resource', resourceId)
  confirmingRemove.value = null
}

const handleBrowseClick = () => {
  // Provide haptic feedback on supported devices
  if (!prefersReducedMotion.value) {
    hapticLight()
  }

  announcement.value = 'Opening resource browser'
  emit('browse')

  // Clear announcement after screen reader has time to read it
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.clearDelay)
}

const handleQuickAdd = (resource: Resource) => {
  // Provide haptic feedback on supported devices
  if (!prefersReducedMotion.value) {
    hapticMedium()
  }

  announcement.value = `${resource.title} added to comparison`
  emit('add-resource', resource)

  // Clear announcement
  setTimeout(() => {
    announcement.value = ''
  }, uiTimingConfig.accessibility.clearDelay)
}

const getCategoryColor = (category?: string): string => {
  const colorMap: Record<string, string> = {
    Development: 'bg-blue-500',
    Design: 'bg-purple-500',
    Productivity: 'bg-green-500',
    Marketing: 'bg-orange-500',
    Analytics: 'bg-yellow-500',
    Security: 'bg-red-500',
    'AI/ML': 'bg-indigo-500',
    DevOps: 'bg-cyan-500',
    Testing: 'bg-pink-500',
    Education: 'bg-teal-500',
  }
  return colorMap[category || ''] || 'bg-gray-500'
}

const getResourceValue = (resource: Resource, field: string) => {
  // Handle nested properties
  if (field.includes('.')) {
    const parts = field.split('.')
    let value: unknown = resource
    for (const part of parts) {
      value = (value as Record<string, unknown>)[part]
      if (value === undefined) break
    }
    return value as string | number | boolean
  }

  // Handle direct properties
  return (resource as unknown as Record<string, unknown>)[field] as
    | string
    | number
    | boolean
}
</script>

<style scoped>
/* Palette's Delightful Empty State Animations - Flexy hates hardcoded values! */

/* Icon bounce animation */
.comparison-empty-icon-bounce {
  animation: comparisonIconBounce
    v-bind(
      'animationConfig.comparisonEmptyState?.iconBounceDurationSec || "2s"'
    )
    ease-in-out infinite;
}

@keyframes comparisonIconBounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Icon pulse animation */
.comparison-empty-icon-pulse {
  animation: comparisonIconPulse
    v-bind('animationConfig.comparisonEmptyState?.iconPulseDurationSec || "3s"')
    ease-in-out infinite;
}

@keyframes comparisonIconPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
  }
}

/* Scale icon animation */
.comparison-empty-scale-icon {
  animation: comparisonScaleIcon
    v-bind('animationConfig.comparisonEmptyState?.scaleIconDurationSec || "4s"')
    ease-in-out infinite;
  transform-origin: center;
}

@keyframes comparisonScaleIcon {
  0%,
  100% {
    transform: rotate(-2deg) scale(1);
  }
  25% {
    transform: rotate(2deg) scale(1.05);
  }
  50% {
    transform: rotate(-1deg) scale(1);
  }
  75% {
    transform: rotate(1deg) scale(1.02);
  }
}

/* Ring rotation animation */
.comparison-empty-ring-rotate {
  animation: comparisonRingRotate
    v-bind(
      'animationConfig.comparisonEmptyState?.ringRotateDurationSec || "20s"'
    )
    linear infinite;
}

@keyframes comparisonRingRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Floating dots animations */
.comparison-empty-dot {
  animation: comparisonDotFloat
    v-bind('animationConfig.comparisonEmptyState?.dotFloatDurationSec || "3s"')
    ease-in-out infinite;
}

.comparison-empty-dot-1 {
  top: 0;
  right: 0;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.dotFloatDelaysSec[0] + "s"'
  );
}

.comparison-empty-dot-2 {
  bottom: 4px;
  left: 0;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.dotFloatDelaysSec[1] + "s"'
  );
}

.comparison-empty-dot-3 {
  top: 50%;
  right: -4px;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.dotFloatDelaysSec[2] + "s"'
  );
}

@keyframes comparisonDotFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
}

/* Background circles */
.comparison-empty-circle {
  filter: blur(40px);
}

.comparison-empty-circle-1 {
  width: 120px;
  height: 120px;
  top: -20px;
  left: 20%;
  animation: comparisonCircleFloat
    v-bind(
      'animationConfig.comparisonEmptyState?.circleFloatDurationsSec?.[0] || "8s"'
    )
    ease-in-out infinite;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.circleFloatDelaysSec[0] + "s"'
  );
}

.comparison-empty-circle-2 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 15%;
  animation: comparisonCircleFloat
    v-bind(
      'animationConfig.comparisonEmptyState?.circleFloatDurationsSec?.[1] || "10s"'
    )
    ease-in-out infinite;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.circleFloatDelaysSec[1] + "s"'
  );
}

.comparison-empty-circle-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 25%;
  animation: comparisonCircleFloat
    v-bind(
      'animationConfig.comparisonEmptyState?.circleFloatDurationsSec?.[2] || "12s"'
    )
    ease-in-out infinite;
  animation-delay: v-bind(
    'animationConfig.comparisonEmptyState.circleFloatDelaysSec[2] + "s"'
  );
}

@keyframes comparisonCircleFloat {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  33% {
    transform: translateY(-20px) translateX(10px) scale(1.1);
  }
  66% {
    transform: translateY(10px) translateX(-10px) scale(0.9);
  }
}

/* Text reveal animation */
.comparison-empty-text-reveal {
  animation: comparisonTextReveal
    v-bind(
      'animationConfig.comparisonEmptyState?.textRevealDurationSec || "0.6s"'
    )
    cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes comparisonTextReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Suggestion button entrance animation */
.comparison-empty-suggestion {
  animation: comparisonSuggestionPop
    v-bind(
      'animationConfig.comparisonEmptyState?.suggestionPopDurationSec || "0.4s"'
    )
    cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: scale(0.8);
}

@keyframes comparisonSuggestionPop {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Reduced motion preferences are handled via JS class binding */
/* All animations respect prefers-reduced-motion */
</style>
