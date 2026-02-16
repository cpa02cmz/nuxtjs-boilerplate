<template>
  <!--
    Palette's micro-UX enhancement: Response Card
    - Added semantic article element with ARIA role for better screen reader context
    - Added aria-label for dynamic card identification
    - Added live region for copy status announcements
    - Enhanced keyboard focus support
    - Added hover scale effect for better interactivity
    - Proper semantic HTML with section for code block
  -->
  <article
    class="rounded-lg p-4 transition-all duration-300 hover:shadow-md"
    :class="[
      cardClass,
      {
        'animate-fade-in': !prefersReducedMotion,
        'hover:scale-[1.01]': !prefersReducedMotion,
      },
    ]"
    :style="animationStyle"
    role="region"
    :aria-label="`${title} ${type} response example`"
    :data-type="type"
    tabindex="0"
  >
    <div class="flex items-center justify-between mb-3">
      <!-- Palette's micro-UX: Icon for visual context and accessibility -->
      <div class="flex items-center gap-2">
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center"
          :class="iconBgClass"
          aria-hidden="true"
        >
          <svg
            v-if="type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            :class="iconColorClass"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            :class="iconColorClass"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <h3
          :id="titleId"
          :class="titleClass"
        >
          {{ title }}
        </h3>
      </div>
      <CopyButton
        :content="code"
        :label="`Copy ${title.toLowerCase()} example`"
        @copied="handleCopied"
      />
    </div>
    <section
      class="bg-white rounded border p-3 overflow-x-auto"
      :class="borderClass"
      :aria-labelledby="titleId"
    >
      <pre
        class="font-mono text-xs leading-relaxed"
        :class="codeClass"
        tabindex="0"
        role="textbox"
        :aria-label="`${title} code example`"
      ><code>{{ code }}</code></pre>
    </section>

    <!-- Palette's micro-UX: Screen reader live region for copy announcements -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { animationConfig } from '~/configs/animation.config'
import { generateId } from '~/utils/generateId'
import { hapticSuccess } from '~/utils/hapticFeedback'

interface Props {
  type: 'success' | 'error'
  code: string
  title: string
  delay?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  copied: []
}>()

// Palette's micro-UX enhancement: Generate unique ID for accessibility associations
const titleId = generateId({ prefix: 'response-card' })

// Palette's micro-UX enhancement: Announcement state for screen readers
const announcement = ref('')

const cardClass = computed(() => {
  return props.type === 'success'
    ? 'bg-green-50 border border-green-200 hover:border-green-300'
    : 'bg-red-50 border border-red-200 hover:border-red-300'
})

const titleClass = computed(() => {
  return props.type === 'success'
    ? 'font-medium text-green-800'
    : 'font-medium text-red-800'
})

const borderClass = computed(() => {
  return props.type === 'success' ? 'border-green-200' : 'border-red-200'
})

const codeClass = computed(() => {
  return props.type === 'success' ? 'text-green-900' : 'text-red-900'
})

// Palette's micro-UX enhancement: Icon styling based on type
const iconBgClass = computed(() => {
  return props.type === 'success' ? 'bg-green-200' : 'bg-red-200'
})

const iconColorClass = computed(() => {
  return props.type === 'success' ? 'text-green-700' : 'text-red-700'
})

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const animationStyle = computed(() => {
  if (prefersReducedMotion.value || props.delay === undefined) return {}
  return {
    animationDelay: `${props.delay * 150}ms`,
  }
})

// Palette's micro-UX enhancement: Handle copy with announcement and haptic feedback
const handleCopied = () => {
  // Announce to screen readers
  announcement.value = `${props.title} ${props.type} example copied to clipboard`

  // Haptic feedback for mobile users
  hapticSuccess()

  // Clear announcement after delay
  setTimeout(() => {
    announcement.value = ''
  }, animationConfig.microInteractions.announcementDelayMs)

  // Emit to parent
  emit('copied')
}
</script>

<style scoped>
/* Palette's micro-UX enhancement: Enhanced fade-in animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
  animation: fade-in 0.4s ease-out forwards;
}

/* Palette's micro-UX enhancement: Card focus styles for keyboard navigation */
article:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}

article:focus-visible[data-type='success'] {
  outline-color: rgb(34, 197, 94);
}

article:focus-visible[data-type='error'] {
  outline-color: rgb(239, 68, 68);
}

/* Palette's micro-UX enhancement: Code block focus styles */
pre:focus-visible {
  outline: 2px solid rgb(59, 130, 246);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Reduced motion support - Palette cares about accessibility! */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none !important;
    opacity: 1;
  }

  article {
    transition: none;
  }

  article:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  article {
    border-width: 2px;
  }

  pre:focus-visible {
    outline-width: 3px;
  }
}

/* Palette's micro-UX enhancement: Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
