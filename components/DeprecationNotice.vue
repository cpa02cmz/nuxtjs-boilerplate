<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-x-4 scale-95"
    enter-to-class="opacity-100 translate-x-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0 scale-100"
    leave-to-class="opacity-0 translate-x-4 scale-95"
  >
    <div
      v-if="showNotice && !isDismissed"
      class="deprecation-notice"
      :class="noticeClass"
      role="alert"
      aria-live="polite"
    >
      <!-- Icon with attention animation - Palette's micro-UX delight! -->
      <div
        class="notice-icon"
        :class="{ 'animate-attention': !prefersReducedMotion }"
      >
        <span v-if="status === 'deprecated'">{{
          contentConfig.deprecation.icons.deprecated
        }}</span>
        <span v-else-if="status === 'discontinued'">{{
          contentConfig.deprecation.icons.discontinued
        }}</span>
        <span v-else-if="status === 'pending'">{{
          contentConfig.deprecation.icons.pending
        }}</span>
      </div>

      <div class="notice-content">
        <div class="notice-header">
          <h4>{{ noticeTitle }}</h4>
          <!-- Dismiss button - Palette's micro-UX delight! -->
          <button
            v-if="dismissible"
            type="button"
            class="dismiss-btn"
            :aria-label="
              contentConfig.deprecation.actions.dismiss || 'Dismiss notice'
            "
            @click="handleDismiss"
            @mouseenter="isHoveringDismiss = true"
            @mouseleave="isHoveringDismiss = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              :class="{
                'rotate-90': isHoveringDismiss && !prefersReducedMotion,
              }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p>{{ noticeMessage }}</p>
        <div
          v-if="migrationPath || alternatives"
          class="notice-actions"
        >
          <a
            v-if="migrationPath"
            :href="migrationPath"
            target="_blank"
            rel="noopener noreferrer"
            class="migration-link"
            :class="{ 'animate-pulse-subtle': !prefersReducedMotion }"
          >
            <span class="link-text">{{
              contentConfig.deprecation.actions.migrationPath
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 ml-1 inline-block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <a
            v-if="alternatives && alternatives.length > 0"
            href="/search"
            class="alternatives-link"
          >
            <span class="link-text">{{
              contentConfig.deprecation.actions.viewAlternatives
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 ml-1 inline-block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </a>
        </div>
      </div>

      <!-- Auto-dismiss progress bar - Palette's micro-UX delight! -->
      <div
        v-if="autoDismiss && dismissible && !isPaused"
        class="dismiss-progress"
        :class="`dismiss-progress--${status}`"
        :style="{ animationDuration: `${autoDismiss}ms` }"
      />

      <!-- Screen reader announcement -->
      <div
        class="sr-only"
        role="status"
        aria-live="polite"
      >
        {{ announcementText }}
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { shadowsConfig } from '~/configs/shadows.config'

interface Props {
  status?:
    | 'active'
    | 'deprecated'
    | 'discontinued'
    | 'updated'
    | 'pending'
    | string
  migrationPath?: string
  alternatives?: string[]
  deprecationDate?: string
  /**
   * Allow users to dismiss the notice
   * @default true
   */
  dismissible?: boolean
  /**
   * Auto-dismiss after specified duration (ms). Set to 0 to disable.
   * @default 0
   */
  autoDismiss?: number
}

const props = withDefaults(defineProps<Props>(), {
  status: 'active',
  migrationPath: undefined,
  alternatives: () => [],
  deprecationDate: undefined,
  dismissible: true,
  autoDismiss: 0,
})

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

// Reactive state
const isDismissed = ref(false)
const isHoveringDismiss = ref(false)
const isPaused = ref(false)
const prefersReducedMotion = ref(false)
const announcementText = ref('')

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Compute if notice should be shown
const showNotice = computed(() => {
  return (
    props.status === 'deprecated' ||
    props.status === 'discontinued' ||
    props.status === 'pending'
  )
})

// Compute notice class based on status
const noticeClass = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return 'deprecation-warning'
    case 'discontinued':
      return 'discontinuation-error'
    case 'pending':
      return 'pending-info'
    default:
      return ''
  }
})

// Compute notice title
const noticeTitle = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return contentConfig.deprecation.titles.deprecated
    case 'discontinued':
      return contentConfig.deprecation.titles.discontinued
    case 'pending':
      return contentConfig.deprecation.titles.pending
    default:
      return ''
  }
})

// Compute notice message
const noticeMessage = computed(() => {
  switch (props.status) {
    case 'deprecated':
      return contentConfig.deprecation.messages.deprecated
    case 'discontinued':
      return contentConfig.deprecation.messages.discontinued
    case 'pending':
      return contentConfig.deprecation.messages.pending
    default:
      return ''
  }
})

// Handle dismiss action
const handleDismiss = () => {
  isDismissed.value = true
  announcementText.value = 'Notice dismissed'
  emit('dismiss')

  // Clear announcement after screen reader has had time to read it
  setTimeout(() => {
    announcementText.value = ''
  }, 1000)
}

// Handle keyboard events (Escape to dismiss)
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.dismissible && !isDismissed.value) {
    handleDismiss()
  }
}

// Auto-dismiss logic
let autoDismissTimeout: ReturnType<typeof setTimeout> | null = null

const startAutoDismiss = () => {
  if (props.autoDismiss > 0 && props.dismissible) {
    autoDismissTimeout = setTimeout(() => {
      if (!isPaused.value) {
        handleDismiss()
      }
    }, props.autoDismiss)
  }
}

// Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()
  document.addEventListener('keydown', handleKeyDown)

  // Announce notice appearance to screen readers
  if (showNotice.value) {
    announcementText.value = `${noticeTitle.value}: ${noticeMessage.value}`
    setTimeout(() => {
      announcementText.value = ''
    }, 1000)
  }

  // Start auto-dismiss if enabled
  startAutoDismiss()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (autoDismissTimeout) {
    clearTimeout(autoDismissTimeout)
  }
})
</script>

<style scoped>
.deprecation-notice {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border-left-width: 4px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease-out;
}

/* Status-specific styles using config */
.deprecation-warning {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.warning.bg'
  );
  border-left-color: v-bind(
    'componentColorsConfig.deprecationNotice.warning.border'
  );
}

.discontinuation-error {
  background-color: v-bind('componentColorsConfig.deprecationNotice.error.bg');
  border-left-color: v-bind(
    'componentColorsConfig.deprecationNotice.error.border'
  );
}

.pending-info {
  background-color: v-bind('componentColorsConfig.deprecationNotice.info.bg');
  border-left-color: v-bind(
    'componentColorsConfig.deprecationNotice.info.border'
  );
}

/* Icon with attention animation - Palette's micro-UX delight! */
.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  padding-top: 0.125rem;
}

.animate-attention {
  animation: icon-attention 2s ease-in-out;
  animation-delay: 0.5s;
}

@keyframes icon-attention {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(-10deg);
  }
  20% {
    transform: rotate(10deg);
  }
  30% {
    transform: rotate(-10deg);
  }
  40% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(0deg);
  }
}

/* Header layout */
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.deprecation-warning .notice-content h4 {
  color: v-bind('componentColorsConfig.deprecationNotice.warning.border');
}

.discontinuation-error .notice-content h4 {
  color: v-bind('componentColorsConfig.deprecationNotice.error.border');
}

.pending-info .notice-content h4 {
  color: v-bind('componentColorsConfig.deprecationNotice.info.border');
}

.notice-content p {
  margin: 0 0 0.5rem 0;
  color: v-bind('componentColorsConfig.deprecationNotice.text');
}

/* Dismiss button - Palette's micro-UX delight! */
.dismiss-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  margin: -0.25rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: currentColor;
  opacity: 0.5;
  transition: all 0.2s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dismiss-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.dismiss-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  opacity: 1;
}

.dismiss-btn svg {
  transition: transform 0.2s ease-out;
}

/* Action buttons */
.notice-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.migration-link,
.alternatives-link {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease-out;
  display: inline-flex;
  align-items: center;
}

.migration-link {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.warning.button'
  );
  color: white;
}

.migration-link:hover {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.warning.buttonHover'
  );
  transform: translateY(-1px);
  box-shadow: v-bind('shadowsConfig.deprecationNotice.default');
}

.alternatives-link {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.info.button'
  );
  color: white;
}

.alternatives-link:hover {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.info.buttonHover'
  );
  transform: translateY(-1px);
  box-shadow: v-bind('shadowsConfig.deprecationNotice.warning');
}

/* Subtle pulse animation for migration link */
.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%,
  100% {
    box-shadow: 0 0 0 0 v-bind('shadowsConfig.deprecationNotice.pulseStart');
  }
  50% {
    box-shadow: 0 0 0 4px v-bind('shadowsConfig.deprecationNotice.pulseEnd');
  }
}

/* Auto-dismiss progress bar - Palette's micro-UX delight! */
.dismiss-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: currentColor;
  opacity: 0.3;
  animation: progress-shrink linear forwards;
}

.dismiss-progress--deprecated {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.warning.border'
  );
}

.dismiss-progress--discontinued {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.error.border'
  );
}

.dismiss-progress--pending {
  background-color: v-bind(
    'componentColorsConfig.deprecationNotice.info.border'
  );
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Screen reader only */
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

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-attention {
    animation: none;
  }

  .animate-pulse-subtle {
    animation: none;
  }

  .dismiss-progress {
    animation: none;
    width: 100%;
    opacity: 0.15;
  }

  .dismiss-btn svg {
    transition: none;
  }

  .migration-link:hover,
  .alternatives-link:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .deprecation-notice {
    border-width: 2px;
  }

  .dismiss-btn:focus-visible {
    outline-width: 3px;
  }
}
</style>
