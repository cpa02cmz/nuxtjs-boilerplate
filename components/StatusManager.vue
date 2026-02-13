<template>
  <div class="status-manager">
    <div class="status-manager__header">
      <h3>{{ contentConfig.statusManager.title }}</h3>
      <!-- Status Badge - Palette's micro-UX delight! -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
        mode="out-in"
      >
        <span
          :key="selectedStatus"
          class="status-badge"
          :class="`status-badge--${selectedStatus}`"
        >
          <span class="status-badge__dot" />
          {{ getStatusLabel(selectedStatus) }}
        </span>
      </Transition>
    </div>

    <div class="status-controls">
      <div class="status-selector">
        <label for="status-select">{{
          contentConfig.statusManager.labels.changeStatus
        }}</label>
        <div class="status-select-wrapper">
          <select
            id="status-select"
            v-model="selectedStatus"
            class="status-dropdown"
            :class="{ 'status-dropdown--changed': hasStatusChanged }"
            @keydown="handleKeydown"
          >
            <option value="active">
              {{ contentConfig.statusManager.statusOptions.active }}
            </option>
            <option value="deprecated">
              {{ contentConfig.statusManager.statusOptions.deprecated }}
            </option>
            <option value="discontinued">
              {{ contentConfig.statusManager.statusOptions.discontinued }}
            </option>
            <option value="updated">
              {{ contentConfig.statusManager.statusOptions.updated }}
            </option>
            <option value="pending">
              {{ contentConfig.statusManager.statusOptions.pending }}
            </option>
          </select>
          <!-- Change indicator - Palette's micro-UX delight! -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-0"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-0"
          >
            <span
              v-if="hasStatusChanged"
              class="change-indicator"
              aria-hidden="true"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </span>
          </Transition>
        </div>
      </div>

      <div class="reason-input">
        <label for="reason-input">{{
          contentConfig.statusManager.labels.reason
        }}</label>
        <input
          id="reason-input"
          v-model="reason"
          type="text"
          :placeholder="contentConfig.statusManager.placeholders.reason"
          class="reason-field"
          @keydown="handleKeydown"
        />
      </div>

      <div class="notes-input">
        <label for="notes-input">{{
          contentConfig.statusManager.labels.notes
        }}</label>
        <textarea
          id="notes-input"
          v-model="notes"
          :placeholder="contentConfig.statusManager.placeholders.notes"
          class="notes-field"
          @keydown="handleKeydown"
        />
      </div>

      <button
        class="update-button"
        :class="{
          'update-button--ready': isReadyToUpdate && !isUpdating,
          'update-button--updating': isUpdating,
          'update-button--success': showSuccessState,
        }"
        :disabled="isUpdating || !selectedStatus"
        @click="handleUpdate"
      >
        <span class="update-button__content">
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-50"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-50"
            mode="out-in"
          >
            <span
              v-if="showSuccessState"
              key="success"
              class="update-button__icon"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <span
              v-else-if="isUpdating"
              key="loading"
              class="update-button__icon update-button__icon--spin"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
            <span v-else key="default" class="update-button__icon">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </span>
          </Transition>
          <span class="update-button__text">
            {{
              showSuccessState
                ? 'Updated!'
                : isUpdating
                  ? contentConfig.statusManager.buttons.updating
                  : contentConfig.statusManager.buttons.update
            }}
          </span>
          <!-- Keyboard shortcut hint - Palette's micro-UX delight! -->
          <kbd
            v-if="isReadyToUpdate && !isUpdating && !showSuccessState"
            class="update-button__shortcut"
            aria-hidden="true"
          >
            Ctrl + Enter
          </kbd>
        </span>
        <!-- Success ripple effect -->
        <span
          v-if="showSuccessState"
          class="update-button__ripple"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Enhanced Result Message with Animation - Palette's micro-UX delight! -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="lastUpdate"
        class="update-result"
        :class="{
          'update-result--success': lastUpdate.success,
          'update-result--error': !lastUpdate.success,
        }"
      >
        <div class="update-result__content">
          <span class="update-result__icon">
            <svg
              v-if="lastUpdate.success"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <span class="update-result__text">
            {{
              lastUpdate.success
                ? contentConfig.statusManager.messages.success
                : `${contentConfig.statusManager.messages.error} ${lastUpdate.error}`
            }}
          </span>
        </div>
        <!-- Auto-dismiss progress bar -->
        <div
          v-if="lastUpdate.success"
          class="update-result__progress"
          :style="{ animationDuration: `${messageDismissDelayMs}ms` }"
        />
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useResourceStatusManager } from '~/composables/useResourceStatusManager'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'

// Flexy hates hardcoded values! Using config instead.
const styles = componentStylesConfig.statusManager

// Flexy loves modularity! Expose animation config for CSS v-bind
const animConfig = animationConfig.statusManager

interface Props {
  resourceId: string
  currentStatus?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentStatus: 'active',
})

const { selectedStatus, reason, notes, isUpdating, lastUpdate, updateStatus } =
  useResourceStatusManager(props.currentStatus)

const emit = defineEmits<{
  statusUpdated: [
    resource: {
      id: string
      status: string
      reason?: string
      notes?: string
    },
  ]
}>()

// Palette's micro-UX state management
const initialStatus = ref(props.currentStatus)
const showSuccessState = ref(false)
const announcement = ref('')
const successResetTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const messageDismissDelayMs = 4000 // Auto-dismiss message after 4 seconds

// Track if status has changed from initial
const hasStatusChanged = computed(() => {
  return selectedStatus.value !== initialStatus.value
})

// Check if ready to update (has changes and not currently updating)
const isReadyToUpdate = computed(() => {
  return hasStatusChanged.value && selectedStatus.value && !isUpdating.value
})

// Get status label for badge
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: contentConfig.statusManager.statusOptions.active,
    deprecated: contentConfig.statusManager.statusOptions.deprecated,
    discontinued: contentConfig.statusManager.statusOptions.discontinued,
    updated: contentConfig.statusManager.statusOptions.updated,
    pending: contentConfig.statusManager.statusOptions.pending,
  }
  return labels[status] || status
}

// Announce to screen readers
const announce = (message: string) => {
  announcement.value = message
  setTimeout(() => {
    announcement.value = ''
  }, 1000)
}

// Handle keyboard shortcuts - Palette's micro-UX delight!
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Enter to submit
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (isReadyToUpdate.value && !isUpdating.value) {
      event.preventDefault()
      handleUpdate()
    }
  }
}

const handleUpdate = async () => {
  const resource = await updateStatus(props.resourceId)
  if (resource) {
    emit('statusUpdated', resource)

    // Palette's micro-UX enhancements on success
    if (lastUpdate.value?.success) {
      // Trigger haptic feedback
      hapticSuccess()

      // Show success state on button
      showSuccessState.value = true

      // Update initial status to reflect new state
      initialStatus.value = selectedStatus.value

      // Announce to screen readers
      announce(contentConfig.statusManager.messages.success)

      // Reset success state after delay
      if (successResetTimeout.value) {
        clearTimeout(successResetTimeout.value)
      }
      successResetTimeout.value = setTimeout(() => {
        showSuccessState.value = false
      }, 2000)

      // Auto-clear lastUpdate after message dismiss delay
      setTimeout(() => {
        if (lastUpdate.value) {
          lastUpdate.value = null
        }
      }, messageDismissDelayMs)
    } else {
      // Error feedback
      hapticError()
      announce(
        `${contentConfig.statusManager.messages.error} ${lastUpdate.value?.error || ''}`
      )
    }
  }
}

// Watch for external status changes
watch(
  () => props.currentStatus,
  newStatus => {
    initialStatus.value = newStatus
  }
)

// Cleanup on unmount
onUnmounted(() => {
  if (successResetTimeout.value) {
    clearTimeout(successResetTimeout.value)
  }
})
</script>

<style scoped>
.status-manager {
  padding: v-bind('styles.padding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.borderColor');
  border-radius: v-bind('styles.borderRadius');
  background-color: v-bind('styles.backgroundColor');
}

.status-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v-bind('styles.titleMarginBottom');
}

.status-manager h3 {
  font-size: v-bind('styles.titleFontSize');
  font-weight: v-bind('styles.titleFontWeight');
  color: v-bind('styles.titleColor');
  margin: 0;
}

/* Status Badge - Palette's micro-UX delight! */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  transition: all v-bind('animConfig.transitionDurationSec') ease-out;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: status-pulse v-bind('`${animConfig.badgePulseDurationSec}s`')
    ease-in-out infinite;
}

/* Status badge color variants - Flexy hates hardcoded hex codes! */
.status-badge--active {
  background-color: v-bind('animConfig.colors.active.bg');
  color: v-bind('animConfig.colors.active.text');
}

.status-badge--active .status-badge__dot {
  background-color: v-bind('animConfig.colors.active.dot');
}

.status-badge--deprecated {
  background-color: v-bind('animConfig.colors.deprecated.bg');
  color: v-bind('animConfig.colors.deprecated.text');
}

.status-badge--deprecated .status-badge__dot {
  background-color: v-bind('animConfig.colors.deprecated.dot');
}

.status-badge--discontinued {
  background-color: v-bind('animConfig.colors.discontinued.bg');
  color: v-bind('animConfig.colors.discontinued.text');
}

.status-badge--discontinued .status-badge__dot {
  background-color: v-bind('animConfig.colors.discontinued.dot');
}

.status-badge--updated {
  background-color: v-bind('animConfig.colors.updated.bg');
  color: v-bind('animConfig.colors.updated.text');
}

.status-badge--updated .status-badge__dot {
  background-color: v-bind('animConfig.colors.updated.dot');
}

.status-badge--pending {
  background-color: v-bind('animConfig.colors.pending.bg');
  color: v-bind('animConfig.colors.pending.text');
}

.status-badge--pending .status-badge__dot {
  background-color: v-bind('animConfig.colors.pending.dot');
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.status-controls {
  display: flex;
  flex-direction: column;
  gap: v-bind('styles.controlGap');
}

.status-selector,
.reason-input,
.notes-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-selector label,
.reason-input label,
.notes-input label {
  font-weight: 500;
  color: v-bind('styles.labelColor');
  font-size: v-bind('styles.labelFontSize');
}

/* Status Select Wrapper - Palette's micro-UX delight! */
.status-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.status-dropdown {
  width: 100%;
  padding: v-bind('styles.inputPadding');
  padding-right: 2.5rem;
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  background-color: white;
  font-size: v-bind('styles.inputFontSize');
  transition: all v-bind('animConfig.transitionDurationSec') ease-out;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.status-dropdown:focus {
  outline: none;
  border-color: v-bind('animConfig.focusColor');
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Change indicator animation - Flexy hates hardcoded values! */
.status-dropdown--changed {
  border-color: v-bind('animConfig.changeBorderColor');
  background-color: v-bind('animConfig.changeBgColor');
}

.change-indicator {
  position: absolute;
  right: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  background-color: v-bind('animConfig.changeBorderColor');
  color: white;
  border-radius: 50%;
  animation: change-pulse v-bind('`${animConfig.changePulseDurationSec}s`')
    ease-in-out infinite;
}

@keyframes change-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.reason-field {
  padding: v-bind('styles.inputPadding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  font-size: v-bind('styles.inputFontSize');
  transition: all v-bind('animConfig.transitionDurationSec') ease-out;
}

.reason-field:focus {
  outline: none;
  border-color: v-bind('animConfig.focusColor');
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.notes-field {
  padding: v-bind('styles.inputPadding');
  border: v-bind('styles.borderWidth') v-bind('styles.borderStyle')
    v-bind('styles.inputBorderColor');
  border-radius: v-bind('styles.inputBorderRadius');
  font-size: v-bind('styles.inputFontSize');
  min-height: v-bind('styles.notesMinHeight');
  resize: vertical;
  transition: all v-bind('animConfig.transitionDurationSec') ease-out;
}

.notes-field:focus {
  outline: none;
  border-color: v-bind('animConfig.focusColor');
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.update-button {
  position: relative;
  align-self: flex-start;
  padding: v-bind('styles.buttonPadding');
  background-color: v-bind('styles.buttonBgColor');
  color: v-bind('styles.buttonTextColor');
  border: none;
  border-radius: v-bind('styles.buttonBorderRadius');
  cursor: pointer;
  font-weight: v-bind('styles.buttonFontWeight');
  font-size: v-bind('styles.buttonFontSize');
  overflow: hidden;
  transition: all v-bind('animConfig.transitionDurationSec') ease-out;
  min-width: 140px;
}

.update-button__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.update-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.update-button__icon--spin {
  animation: button-spin v-bind('`${animConfig.buttonSpinDurationSec}s`') linear
    infinite;
}

@keyframes button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.update-button__text {
  flex: 1;
  text-align: center;
}

/* Keyboard shortcut hint */
.update-button__shortcut {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.25rem;
  opacity: 0.8;
}

/* Ready state - subtle pulse to indicate actionability - Flexy hates hardcoded values! */
.update-button--ready {
  animation: ready-pulse v-bind('`${animConfig.readyPulseDurationSec}s`')
    ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
}

@keyframes ready-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0);
  }
}

/* Success state - Flexy hates hardcoded values! */
.update-button--success {
  background-color: v-bind('animConfig.colors.active.dot') !important;
  animation: success-bounce v-bind('`${animConfig.successBounceDurationSec}s`')
    ease-out;
}

@keyframes success-bounce {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.05);
  }
  60% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

/* Success ripple effect - Flexy hates hardcoded values! */
.update-button__ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  animation: ripple-out v-bind('`${animConfig.rippleOutDurationSec}s`') ease-out
    forwards;
  pointer-events: none;
}

@keyframes ripple-out {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.update-button:hover:not(:disabled) {
  background-color: v-bind('styles.buttonHoverBg');
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.update-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.update-button:disabled {
  background-color: v-bind('styles.buttonDisabledBg');
  cursor: not-allowed;
  opacity: 0.7;
}

.update-result {
  margin-top: v-bind('styles.resultMarginTop');
  padding: v-bind('styles.resultPadding');
  border-radius: v-bind('styles.resultBorderRadius');
  position: relative;
  overflow: hidden;
}

.update-result--success {
  background-color: v-bind('animConfig.colors.active.bg');
  border: 1px solid #a7f3d0;
  color: v-bind('animConfig.colors.active.text');
}

.update-result--error {
  background-color: v-bind('animConfig.colors.discontinued.bg');
  border: 1px solid #fecaca;
  color: v-bind('animConfig.colors.discontinued.text');
}

.update-result__content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.update-result__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.update-result__text {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Auto-dismiss progress bar */
.update-result__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: currentColor;
  opacity: 0.3;
  animation: progress-shrink linear forwards;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Legacy message styles for backward compatibility */
.success-message {
  color: v-bind('styles.message.success.textColor');
  background-color: v-bind('styles.message.success.bgColor');
  border: 1px solid v-bind('styles.message.success.borderColor');
}

.error-message {
  color: v-bind('styles.message.error.textColor');
  background-color: v-bind('styles.message.error.bgColor');
  border: 1px solid v-bind('styles.message.error.borderColor');
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
  .status-badge,
  .update-button,
  .change-indicator,
  .status-dropdown,
  .reason-field,
  .notes-field {
    transition: none !important;
    animation: none !important;
  }

  .update-button__icon--spin {
    animation: none;
    opacity: 0.5;
  }

  .update-button__ripple {
    display: none;
  }

  .update-result__progress {
    animation: none;
    opacity: 0.15;
  }

  .status-badge__dot {
    animation: none;
  }
}
</style>
