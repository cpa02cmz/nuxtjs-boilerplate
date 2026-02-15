<script setup lang="ts">
/**
 * WebhookCreateForm.vue
 *
 * Extracted from WebhookManager.vue as part of performance optimization
 * Issue #2750: Large Vue components causing slow initial render
 *
 * This component handles the form for creating new webhooks.
 */

import { contentConfig } from '~/configs/content.config'
import { webhooksConfig } from '~/configs/webhooks.config'

interface WebhookFormData {
  url: string
  events: string[]
  active: boolean
}

const props = defineProps<{
  modelValue: WebhookFormData
  errorMessage: string
  availableEvents: string[]
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

const handleSubmit = () => {
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="webhook-form">
    <h3>{{ contentConfig.webhooks.form.title }}</h3>

    <div
      v-if="errorMessage"
      class="error-message"
      role="alert"
      aria-live="assertive"
    >
      {{ errorMessage }}
    </div>

    <form
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="form-group">
        <label for="webhook-url">{{ contentConfig.webhooks.form.urlLabel }}
          <span aria-hidden="true">*</span>
          <span class="sr-only">{{
            contentConfig.webhooks.form.required
          }}</span>
        </label>
        <input
          id="webhook-url"
          v-model="formData.url"
          type="url"
          required
          aria-required="true"
          aria-describedby="webhook-url-description"
          :placeholder="webhooksConfig.placeholders.url"
          class="form-control"
        >
        <p
          id="webhook-url-description"
          class="mt-1 text-sm text-gray-500"
        >
          {{ contentConfig.webhooks.form.urlDescription }}
        </p>
      </div>

      <div class="form-group">
        <fieldset>
          <legend class="font-medium mb-2">
            {{ contentConfig.webhooks.form.eventsLabel }}
          </legend>
          <div
            role="group"
            :aria-label="contentConfig.webhooks.ariaLabels.eventsGroup"
            class="event-checkboxes"
          >
            <label
              v-for="event in availableEvents"
              :key="event"
              class="checkbox-label"
            >
              <input
                v-model="formData.events"
                type="checkbox"
                :value="event"
                :aria-label="`Subscribe to ${event} event`"
              >
              {{ event }}
            </label>
          </div>
        </fieldset>
      </div>

      <div class="form-group">
        <label class="flex items-center gap-2">
          <input
            v-model="formData.active"
            type="checkbox"
            :aria-label="contentConfig.webhooks.ariaLabels.enableWebhook"
          >
          {{ contentConfig.webhooks.form.activeLabel }}
        </label>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :aria-label="contentConfig.webhooks.ariaLabels.submitCreate"
        >
          {{ contentConfig.webhooks.buttons.createSubmit }}
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          :aria-label="contentConfig.webhooks.ariaLabels.cancelCreate"
          @click="handleCancel"
        >
          {{ contentConfig.webhooks.buttons.cancel }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.webhook-form {
  background: var(--webhook-panel-bg, #f9fafb);
  border: 1px solid var(--webhook-border, #e5e7eb);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.webhook-form h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--webhook-btn-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.event-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--webhook-btn-primary, #3b82f6);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--webhook-btn-primary-hover, #2563eb);
}

.btn-secondary {
  background: var(--webhook-btn-secondary, #e5e7eb);
  color: #374151;
  border: none;
}

.btn-secondary:hover {
  background: var(--webhook-btn-secondary-hover, #d1d5db);
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

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

.mt-1 {
  margin-top: 0.25rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.font-medium {
  font-weight: 500;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
