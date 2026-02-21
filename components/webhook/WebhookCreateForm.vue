<script setup lang="ts">
/**
 * WebhookCreateForm.vue
 *
 * Extracted from WebhookManager.vue as part of performance optimization
 * Issue #2750: Large Vue components causing slow initial render
 *
 * This component handles the form for creating new webhooks.
 */

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { contentConfig } from '~/configs/content.config'
import { webhooksConfig } from '~/configs/webhooks.config'
import { animationConfig } from '~/configs/animation.config'
import { easingConfig } from '~/configs/easing.config'
import { zIndexConfig } from '~/configs/z-index.config'
import { hapticLight, hapticSuccess } from '~/utils/hapticFeedback'

interface WebhookFormData {
  url: string
  events: string[]
  active: boolean
}

const props = defineProps<{
  modelValue: WebhookFormData
  errorMessage: string
  availableEvents: readonly string[]
  // Pallete: Loading state for better UX feedback during submission
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: WebhookFormData]
  submit: []
  cancel: []
}>()

// Create a computed property for v-model support
const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

// Pallete's micro-UX enhancement: Form interaction state
const prefersReducedMotion = ref(false)
const isFormVisible = ref(false)
const focusedField = ref<string | null>(null)
const hoveredEvent = ref<string | null>(null)
const pressedEvent = ref<string | null>(null)
const shakeError = ref(false)

// Pallete's micro-UX enhancement: Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Pallete's micro-UX enhancement: Get staggered entrance delay
const getFieldDelay = (index: number) => {
  if (prefersReducedMotion.value) return {}
  const delay = Math.min(
    index * animationConfig.webhookForm.staggerDelayMs,
    animationConfig.webhookForm.maxStaggerDelayMs
  )
  return { '--field-delay': `${delay}ms` }
}

// Pallete's micro-UX enhancement: Handle field focus with haptic
const handleFieldFocus = (fieldName: string) => {
  focusedField.value = fieldName
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
}

// Pallete's micro-UX enhancement: Handle field blur
const handleFieldBlur = () => {
  focusedField.value = null
}

// Pallete's micro-UX enhancement: Handle event checkbox interactions
const handleEventMouseEnter = (event: string) => {
  hoveredEvent.value = event
}

const handleEventMouseLeave = () => {
  hoveredEvent.value = null
  pressedEvent.value = null
}

const handleEventPressStart = (event: string) => {
  if (prefersReducedMotion.value) return
  pressedEvent.value = event
}

const handleEventPressEnd = () => {
  pressedEvent.value = null
}

const handleEventChange = (event: string) => {
  // Toggle event in array
  const index = formData.value.events.indexOf(event)
  if (index > -1) {
    formData.value.events.splice(index, 1)
  } else {
    formData.value.events.push(event)
  }

  // Haptic feedback
  if (!prefersReducedMotion.value) {
    hapticSuccess()
  }
}

// Pallete's micro-UX enhancement: Handle submit with validation shake
const handleSubmit = () => {
  // Validate URL
  if (!formData.value.url || !formData.value.url.trim()) {
    shakeError.value = true
    if (!prefersReducedMotion.value) {
      hapticLight()
    }
    setTimeout(() => {
      shakeError.value = false
    }, animationConfig.webhookForm.shakeDurationMs)
    return
  }

  emit('submit')
}

// Pallete's micro-UX enhancement: Handle cancel with haptic
const handleCancel = () => {
  if (!prefersReducedMotion.value) {
    hapticLight()
  }
  emit('cancel')
}

// User Story Engineer: Keyboard shortcut handler for quick submission (Ctrl+Enter / Cmd+Enter)
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+Enter (Windows/Linux) or Cmd+Enter (macOS) submits the form
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    handleSubmit()
    if (!prefersReducedMotion.value) {
      hapticSuccess()
    }
  }
}

// Media query refs for cleanup
let mediaQueryRef: MediaQueryList | null = null
let handleMotionChangeRef: ((e: MediaQueryListEvent) => void) | null = null

// Pallete's micro-UX enhancement: Lifecycle hooks
onMounted(() => {
  prefersReducedMotion.value = checkReducedMotion()

  // Trigger entrance animation
  setTimeout(() => {
    isFormVisible.value = true
  }, animationConfig.webhookForm.entranceDelayMs)

  // Listen for reduced motion preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQueryRef = window.matchMedia('(prefers-reduced-motion: reduce)')
    handleMotionChangeRef = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQueryRef.addEventListener('change', handleMotionChangeRef)
  }

  // User Story Engineer: Register keyboard shortcut listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  if (mediaQueryRef && handleMotionChangeRef) {
    mediaQueryRef.removeEventListener('change', handleMotionChangeRef)
    mediaQueryRef = null
    handleMotionChangeRef = null
  }

  // User Story Engineer: Clean up keyboard shortcut listener
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<template>
  <div
    class="webhook-form"
    :class="{
      'webhook-form--visible': isFormVisible,
      'webhook-form--reduced-motion': prefersReducedMotion,
    }"
  >
    <!-- Pallete's micro-UX enhancement: Form header with entrance animation -->
    <h3
      class="form-title"
      :class="{
        'form-title--animated': isFormVisible && !prefersReducedMotion,
      }"
    >
      {{ contentConfig.webhooks.form.title }}
    </h3>

    <!-- Pallete's micro-UX enhancement: Error message with shake animation -->
    <Transition
      :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      :leave-active-class="`transition-all ${animationConfig.tailwindDurations.fast} ease-in`"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="errorMessage"
        class="error-message"
        :class="{ 'error-message--shake': shakeError && !prefersReducedMotion }"
        role="alert"
        aria-live="assertive"
      >
        <svg
          class="error-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <form
      novalidate
      class="webhook-form__content"
      @submit.prevent="handleSubmit"
    >
      <!-- Pallete's micro-UX enhancement: URL field with focus glow -->
      <div
        class="form-group"
        :class="{
          'form-group--focused': focusedField === 'url',
          'form-group--error': shakeError && !formData.url,
        }"
        :style="getFieldDelay(0)"
      >
        <label for="webhook-url" class="form-label">
          {{ contentConfig.webhooks.form.urlLabel }}
          <span class="required-indicator" aria-hidden="true">*</span>
          <span class="sr-only">{{
            contentConfig.webhooks.form.required
          }}</span>
        </label>
        <div class="input-wrapper">
          <input
            id="webhook-url"
            v-model="formData.url"
            type="url"
            required
            aria-required="true"
            aria-describedby="webhook-url-description"
            :placeholder="webhooksConfig.placeholders.url"
            class="form-control"
            :class="{
              'form-control--focused': focusedField === 'url',
              'form-control--glow':
                focusedField === 'url' && !prefersReducedMotion,
            }"
            @focus="handleFieldFocus('url')"
            @blur="handleFieldBlur"
          />
          <!-- Pallete's micro-UX enhancement: Focus glow effect -->
          <span
            v-if="!prefersReducedMotion"
            class="focus-glow"
            :class="{ 'focus-glow--active': focusedField === 'url' }"
            aria-hidden="true"
          />
        </div>
        <p id="webhook-url-description" class="form-description">
          {{ contentConfig.webhooks.form.urlDescription }}
        </p>
      </div>

      <!-- Pallete's micro-UX enhancement: Events fieldset with staggered animations -->
      <div class="form-group" :style="getFieldDelay(1)">
        <fieldset class="events-fieldset">
          <legend class="form-label">
            {{ contentConfig.webhooks.form.eventsLabel }}
          </legend>
          <div
            role="group"
            :aria-label="contentConfig.webhooks.ariaLabels.eventsGroup"
            class="event-checkboxes"
          >
            <label
              v-for="(event, index) in availableEvents"
              :key="event"
              class="checkbox-label"
              :class="{
                'checkbox-label--hovered': hoveredEvent === event,
                'checkbox-label--pressed': pressedEvent === event,
                'checkbox-label--selected': formData.events.includes(event),
              }"
              :style="getFieldDelay(index + 2)"
              @mouseenter="handleEventMouseEnter(event)"
              @mouseleave="handleEventMouseLeave"
              @mousedown="handleEventPressStart(event)"
              @mouseup="handleEventPressEnd"
              @touchstart="handleEventPressStart(event)"
              @touchend="handleEventPressEnd"
            >
              <!-- Pallete's micro-UX enhancement: Custom checkbox with animation -->
              <span
                class="custom-checkbox"
                :class="{
                  'custom-checkbox--checked': formData.events.includes(event),
                  'custom-checkbox--pressed': pressedEvent === event,
                }"
                aria-hidden="true"
              >
                <svg
                  v-if="formData.events.includes(event)"
                  class="checkmark"
                  :class="{ 'checkmark--animate': !prefersReducedMotion }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <input
                type="checkbox"
                :value="event"
                :checked="formData.events.includes(event)"
                :aria-label="`Subscribe to ${event} event`"
                class="sr-only"
                @change="handleEventChange(event)"
              />
              <span class="checkbox-text">{{ event }}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <!-- Pallete's micro-UX enhancement: Active toggle with animation -->
      <div
        class="form-group"
        :style="getFieldDelay(availableEvents.length + 2)"
      >
        <label
          class="toggle-label"
          :class="{ 'toggle-label--active': formData.active }"
        >
          <span class="toggle-switch">
            <input
              v-model="formData.active"
              type="checkbox"
              :aria-label="contentConfig.webhooks.ariaLabels.enableWebhook"
              class="sr-only"
            />
            <span
              class="toggle-track"
              :class="{ 'toggle-track--active': formData.active }"
              aria-hidden="true"
            >
              <span
                class="toggle-thumb"
                :class="{ 'toggle-thumb--active': formData.active }"
              />
            </span>
          </span>
          <span class="toggle-text">{{
            contentConfig.webhooks.form.activeLabel
          }}</span>
        </label>
      </div>

      <!-- Pallete's micro-UX enhancement: Form actions with spring physics -->
      <div
        class="form-actions"
        :style="getFieldDelay(availableEvents.length + 3)"
      >
        <button
          type="submit"
          class="btn btn-primary"
          :class="{
            'btn--pressed': isSubmitting,
            'btn--spring': !prefersReducedMotion,
          }"
          :aria-label="contentConfig.webhooks.ariaLabels.submitCreate"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          <!-- Pallete: Loading spinner for better UX during async operations -->
          <svg
            v-if="isSubmitting"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
          <span class="btn-text">
            {{
              isSubmitting
                ? contentConfig.webhooks.buttons.creating
                : contentConfig.webhooks.buttons.createSubmit
            }}
          </span>
          <!-- Pallete's micro-UX enhancement: Success glow on idle -->
          <span
            v-if="!isSubmitting && formData.url && !prefersReducedMotion"
            class="btn-glow"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          :class="{ 'btn--spring': !prefersReducedMotion }"
          :aria-label="contentConfig.webhooks.ariaLabels.cancelCreate"
          @click="handleCancel"
        >
          {{ contentConfig.webhooks.buttons.cancel }}
        </button>
      </div>

      <!-- User Story Engineer: Keyboard shortcut hint for power users -->
      <p v-if="!prefersReducedMotion" class="keyboard-hint">
        <kbd class="kbd">Ctrl</kbd>+<kbd class="kbd">Enter</kbd> to submit
      </p>
    </form>
  </div>
</template>

<style scoped>
/* Pallete's micro-UX enhancement: Form entrance animation */
.webhook-form {
  background: var(--webhook-panel-bg, #f9fafb);
  border: 1px solid var(--webhook-border, #e5e7eb);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity v-bind('animationConfig.webhookForm.entranceDurationSec') ease-out,
    transform v-bind('animationConfig.webhookForm.entranceDurationSec')
      v-bind('easingConfig.cubicBezier.decelerate');
}

.webhook-form--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Pallete's micro-UX enhancement: Staggered field animations */
.form-group {
  margin-bottom: 1.25rem;
  opacity: 0;
  transform: translateY(15px);
  transition:
    opacity v-bind('animationConfig.webhookForm.fieldEntranceDurationSec')
      ease-out,
    transform v-bind('animationConfig.webhookForm.fieldEntranceDurationSec')
      v-bind('easingConfig.cubicBezier.decelerate');
  /* Flexy hates hardcoded 0ms! Using animationConfig.stagger.baseDelayMs */
  transition-delay: var(
    --field-delay,
    v-bind('animationConfig.stagger.baseDelayMs + "ms"')
  );
}

.webhook-form--visible .form-group {
  opacity: 1;
  transform: translateY(0);
}

/* Form Title */
.form-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  opacity: 0;
  transform: translateY(-10px);
}

.form-title--animated {
  animation: title-entrance
    v-bind('animationConfig.webhookForm.titleEntranceDurationSec')
    v-bind('easingConfig.cubicBezier.spring') forwards;
}

@keyframes title-entrance {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pallete's micro-UX enhancement: Error message with shake animation */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: all v-bind('animationConfig.transition.normal.durationMs + "ms"')
    ease-out;
}

.error-message--shake {
  animation: error-shake
    v-bind('animationConfig.webhookForm.shakeDurationMs + "ms"') ease-in-out;
}

@keyframes error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

.error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Form Labels */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  transition: color v-bind('animationConfig.transition.fast.durationMs + "ms"')
    ease;
}

.form-group--focused .form-label {
  color: var(--webhook-btn-primary, #3b82f6);
}

.required-indicator {
  color: #dc2626;
  margin-left: 0.25rem;
}

/* Pallete's micro-UX enhancement: Input wrapper for focus glow */
.input-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  background: white;
  transition:
    border-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    box-shadow v-bind('animationConfig.transition.fast.durationMs + "ms"') ease,
    transform v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--webhook-btn-primary, #3b82f6);
}

.form-control--focused {
  transform: translateY(-1px);
}

/* Pallete's micro-UX enhancement: Focus glow effect */
.focus-glow {
  position: absolute;
  inset: -2px;
  border-radius: calc(0.375rem + 2px);
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.3),
    rgba(147, 51, 234, 0.3)
  );
  opacity: 0;
  filter: blur(8px);
  transition: opacity
    v-bind('animationConfig.transition.normal.durationMs + "ms"') ease;
  pointer-events: none;
  z-index: -1;
}

.focus-glow--active {
  opacity: 1;
}

.form-description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Events Fieldset */
.events-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

/* Pallete's micro-UX enhancement: Event checkboxes with custom styling */
.event-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-weight: 400;
  cursor: pointer;
  background: white;
  border: 1px solid #e5e7eb;
  transition:
    background-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    border-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    transform v-bind('animationConfig.transition.fast.durationMs + "ms"') ease,
    box-shadow v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

.checkbox-label:hover,
.checkbox-label--hovered {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

.checkbox-label--pressed {
  transform: scale(0.97);
}

.checkbox-label--selected {
  background-color: #eff6ff;
  border-color: var(--webhook-btn-primary, #3b82f6);
}

/* Pallete's micro-UX enhancement: Custom checkbox */
.custom-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  transition:
    background-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    border-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    transform v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
  flex-shrink: 0;
}

.checkbox-label:hover .custom-checkbox,
.checkbox-label--hovered .custom-checkbox {
  border-color: #9ca3af;
}

.custom-checkbox--checked {
  background-color: var(--webhook-btn-primary, #3b82f6);
  border-color: var(--webhook-btn-primary, #3b82f6);
}

.custom-checkbox--pressed {
  transform: scale(0.9);
}

.checkmark {
  width: 0.875rem;
  height: 0.875rem;
  color: white;
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
}

.checkmark--animate {
  animation: checkmark-draw
    v-bind('animationConfig.webhookForm.checkmarkDrawSec') ease-out forwards;
}

@keyframes checkmark-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.checkbox-text {
  font-size: 0.875rem;
  color: #374151;
}

/* Pallete's micro-UX enhancement: Toggle switch */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color
    v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

.toggle-label:hover {
  background-color: #f9fafb;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;
}

.toggle-track {
  position: absolute;
  inset: 0;
  background-color: #e5e7eb;
  border-radius: 9999px;
  transition: background-color
    v-bind('animationConfig.transition.normal.durationMs + "ms"') ease;
}

.toggle-track--active {
  background-color: var(--webhook-btn-primary, #3b82f6);
}

.toggle-thumb {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform
    v-bind('animationConfig.transition.normal.durationMs + "ms"')
    v-bind('easingConfig.cubicBezier.spring');
}

.toggle-thumb--active {
  transform: translateX(1.25rem);
}

.toggle-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Pallete's micro-UX enhancement: Buttons with spring physics */
.btn {
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    transform v-bind('animationConfig.transition.fast.durationMs + "ms"') ease,
    box-shadow v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
  overflow: hidden;
}

.btn--spring {
  transition:
    background-color v-bind('animationConfig.transition.fast.durationMs + "ms"')
      ease,
    transform v-bind('animationConfig.transition.fast.durationMs + "ms"')
      v-bind('easingConfig.cubicBezier.spring'),
    box-shadow v-bind('animationConfig.transition.fast.durationMs + "ms"') ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn:active,
.btn--pressed {
  transform: scale(0.97) translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-primary {
  background: var(--webhook-btn-primary, #3b82f6);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--webhook-btn-primary-hover, #2563eb);
}

.btn-primary:disabled {
  background: var(--webhook-btn-primary, #3b82f6);
}

/* Pallete's micro-UX enhancement: Button success glow */
.btn-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.4),
    rgba(34, 197, 94, 0.2)
  );
  border-radius: calc(0.375rem + 2px);
  opacity: 0;
  filter: blur(8px);
  animation: btn-glow-pulse
    v-bind('animationConfig.webhookForm.btnGlowDurationSec') ease-in-out
    infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes btn-glow-pulse {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.btn-secondary {
  background: var(--webhook-btn-secondary, #e5e7eb);
  color: #374151;
  border: none;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--webhook-btn-secondary-hover, #d1d5db);
}

.btn-text {
  position: relative;
  /* 🧩 Flexy hates hardcoded z-index: 1! Using zIndexConfig.floatingLabel */
  z-index: v-bind('zIndexConfig.floatingLabel');
}

/* Pallete: Spinner animation for loading state */
/* Flexy hates hardcoded 1s! Using animationConfig.spinner.rotateDurationSec */
.animate-spin {
  animation: spin v-bind('animationConfig.spinner.rotateDurationSec')
    v-bind('animationConfig.spinner.timingFunction')
    v-bind('animationConfig.spinner.iterationCount');
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.inline-block {
  display: inline-block;
  vertical-align: middle;
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
  border: 0;
}

/* Pallete's micro-UX enhancement: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .webhook-form,
  .form-group,
  .form-title,
  .error-message,
  .form-control,
  .focus-glow,
  .checkbox-label,
  .custom-checkbox,
  .checkmark,
  .toggle-track,
  .toggle-thumb,
  .btn {
    transition: none;
    animation: none;
  }

  .webhook-form {
    opacity: 1;
    transform: none;
  }

  .form-group {
    opacity: 1;
    transform: none;
  }

  .form-title--animated {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .checkmark--animate {
    animation: none;
    stroke-dashoffset: 0;
  }

  .btn-glow {
    display: none;
  }

  .btn:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-control:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  .checkbox-label {
    border-width: 2px;
  }

  .btn:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

/* User Story Engineer: Keyboard shortcut hint styles */
.keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
  opacity: 0;
  transform: translateY(-5px);
  animation: hint-fade-in
    v-bind('animationConfig.transition.normal.durationMs + "ms"') ease-out
    v-bind('animationConfig.webhookForm.entranceDelayMs + 200 + "ms"') forwards;
}

@keyframes hint-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1;
  color: #374151;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  box-shadow:
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.1),
    0 1px 0 0 rgba(0, 0, 0, 0.05);
}
</style>
