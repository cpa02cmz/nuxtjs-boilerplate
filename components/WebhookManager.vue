<template>
  <div
    class="webhook-manager"
    :style="{
      '--webhook-panel-bg': webhookColors.panelBg,
      '--webhook-border': webhookColors.border,
      '--webhook-muted-text': webhookColors.mutedText,
      '--webhook-card-border': webhookColors.cardBorder,
      '--webhook-status-active-bg': webhookColors.status.active.bg,
      '--webhook-status-active-text': webhookColors.status.active.text,
      '--webhook-status-enabled-bg': webhookColors.status.enabled.bg,
      '--webhook-status-enabled-text': webhookColors.status.enabled.text,
      '--webhook-status-disabled-bg': webhookColors.status.disabled.bg,
      '--webhook-status-disabled-text': webhookColors.status.disabled.text,
      '--webhook-status-error-bg': webhookColors.status.error.bg,
      '--webhook-status-error-text': webhookColors.status.error.text,
      '--webhook-btn-primary': webhookColors.button.primary,
      '--webhook-btn-primary-hover': webhookColors.button.primaryHover,
      '--webhook-btn-secondary': webhookColors.button.secondary,
      '--webhook-btn-secondary-hover': webhookColors.button.secondaryHover,
      '--webhook-btn-danger': webhookColors.button.danger,
      '--webhook-btn-danger-hover': webhookColors.button.dangerHover,
    }"
  >
    <div class="webhook-header">
      <h2>{{ contentConfig.webhooks.title }}</h2>
      <button
        class="btn btn-primary"
        :aria-label="contentConfig.webhooks.ariaLabels.createButton"
        @click="showCreateForm = true"
      >
        {{ contentConfig.webhooks.buttons.create }}
      </button>
    </div>

    <div
      id="webhook-announcement"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ announcement }}
    </div>

    <!-- Create Webhook Form -->
    <div
      v-if="showCreateForm"
      class="webhook-form"
    >
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
        @submit.prevent="handleCreateWebhook"
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
            v-model="newWebhook.url"
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
                  v-model="newWebhook.events"
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
              v-model="newWebhook.active"
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
            @click="showCreateForm = false"
          >
            {{ contentConfig.webhooks.buttons.cancel }}
          </button>
        </div>
      </form>
    </div>

    <!-- Webhooks List -->
    <div class="webhooks-list">
      <h3>{{ contentConfig.webhooks.list.title }}</h3>
      <div
        v-if="webhooks.length === 0"
        class="empty-state"
        role="status"
        aria-live="polite"
      >
        <!-- Animated webhook illustration - Palette's micro-UX delight! -->
        <div
          class="relative mx-auto h-32 w-32 mb-4"
          aria-hidden="true"
        >
          <!-- Background circle with pulse -->
          <div
            class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full"
            :class="{ 'animate-pulse-slow': !prefersReducedMotion }"
          />

          <!-- Floating webhook icon -->
          <div
            class="absolute inset-0 flex items-center justify-center"
            :class="{ 'animate-float-gentle': !prefersReducedMotion }"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-20 w-20 text-indigo-300"
              :class="{ 'animate-heartbeat': !prefersReducedMotion }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>

          <!-- Decorative sparkles -->
          <div
            v-if="!prefersReducedMotion"
            class="absolute top-2 right-4 w-3 h-3 text-indigo-400 animate-sparkle"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2l1.5 4.5h4.5l-3.75 2.75 1.5 4.5-3.75-2.75-3.75 2.75 1.5-4.5-3.75-2.75h4.5z"
              />
            </svg>
          </div>
          <div
            v-if="!prefersReducedMotion"
            class="absolute bottom-4 left-2 w-2 h-2 text-purple-400 animate-sparkle-delayed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2l1.5 4.5h4.5l-3.75 2.75 1.5 4.5-3.75-2.75-3.75 2.75 1.5-4.5-3.75-2.75h4.5z"
              />
            </svg>
          </div>
        </div>

        <h4 class="empty-state-heading">
          {{ contentConfig.webhooks.empty.heading || 'No webhooks configured' }}
        </h4>
        <p class="empty-state-description">
          {{
            contentConfig.webhooks.empty.description ||
              'Connect your external services to receive real-time notifications when events occur.'
          }}
        </p>

        <!-- Quick action CTA button -->
        <button
          class="btn btn-primary empty-state-cta"
          :aria-label="contentConfig.webhooks.ariaLabels.createButton"
          @click="showCreateForm = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="btn-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ contentConfig.webhooks.buttons.create }}
        </button>
      </div>
      <div
        v-else
        class="webhook-items"
      >
        <div
          v-for="webhook in webhooks"
          :key="webhook.id"
          class="webhook-item"
          role="listitem"
        >
          <div class="webhook-info">
            <div class="webhook-url">
              {{ webhook.url }}
            </div>
            <div
              class="webhook-events"
              :aria-label="contentConfig.webhooks.labels.subscribedEvents"
            >
              <span
                v-for="event in webhook.events"
                :key="event"
                class="event-tag"
              >
                {{ event }}
              </span>
            </div>
            <div class="webhook-status">
              <span
                :class="`status ${webhook.active ? 'active' : 'inactive'}`"
                :aria-label="
                  contentConfig.webhooks.ariaLabels.webhookStatus.replace(
                    '{{ status }}',
                    webhook.active
                      ? contentConfig.webhooks.status.active
                      : contentConfig.webhooks.status.inactive
                  )
                "
              >
                {{
                  webhook.active
                    ? contentConfig.webhooks.status.active
                    : contentConfig.webhooks.status.inactive
                }}
              </span>
              <span
                v-if="webhook.lastDeliveryStatus"
                :class="`status ${webhook.lastDeliveryStatus}`"
                :aria-label="
                  contentConfig.webhooks.ariaLabels.deliveryStatus.replace(
                    '{{ status }}',
                    webhook.lastDeliveryStatus
                  )
                "
              >
                {{ contentConfig.webhooks.labels.lastDelivery }}
                {{ webhook.lastDeliveryStatus }}
              </span>
            </div>
          </div>
          <div
            class="webhook-actions"
            role="group"
            :aria-label="contentConfig.webhooks.ariaLabels.webhookActions"
          >
            <button
              class="btn btn-sm"
              :aria-label="
                contentConfig.webhooks.ariaLabels.toggleWebhook
                  .replace(
                    '{{ action }}',
                    webhook.active
                      ? contentConfig.webhooks.buttons.deactivate
                      : contentConfig.webhooks.buttons.activate
                  )
                  .replace('{{ url }}', webhook.url)
              "
              @click="toggleWebhook(webhook)"
            >
              {{
                webhook.active
                  ? contentConfig.webhooks.buttons.deactivate
                  : contentConfig.webhooks.buttons.activate
              }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              :aria-label="contentConfig.webhooks.ariaLabels.deleteWebhook"
              @click="handleDeleteWebhook(webhook)"
            >
              {{ contentConfig.webhooks.buttons.delete }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Webhook } from '~/types/webhook'
import { useWebhooksManager } from '~/composables/useWebhooksManager'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { webhooksConfig } from '~/configs/webhooks.config'
import { contentConfig } from '~/configs/content.config'

// Check reduced motion preference for accessibility - Palette's micro-UX enhancement!
const prefersReducedMotion = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes in reduced motion preference
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }
    mediaQuery.addEventListener('change', handleChange)
  }
})

// Flexy hates hardcoded colors! Using config values for webhook UI colors
const webhookColors = {
  panelBg: componentColorsConfig.webhookManager.panelBg,
  border: componentColorsConfig.webhookManager.border,
  mutedText: componentColorsConfig.webhookManager.mutedText,
  cardBorder: componentColorsConfig.webhookManager.cardBorder,
  status: componentColorsConfig.webhookManager.status,
  button: componentColorsConfig.webhookManager.button,
}

const showCreateForm = ref(false)

const {
  webhooks,
  errorMessage,
  announcement,
  newWebhook,
  availableEvents,
  fetchWebhooks,
  createWebhook,
  toggleWebhook,
  deleteWebhook,
  resetForm,
} = useWebhooksManager()

const handleCreateWebhook = async () => {
  const success = await createWebhook(newWebhook)
  if (success) {
    resetForm()
    showCreateForm.value = false
  }
}

const handleDeleteWebhook = async (webhook: Webhook) => {
  await deleteWebhook(webhook)
}

onMounted(() => {
  fetchWebhooks()
})
</script>

<style scoped>
.webhook-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.webhook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.webhook-form {
  background: var(--webhook-panel-bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--webhook-border);
  border-radius: 0.375rem;
  font-size: 1rem;
}

.event-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.webhooks-list h3 {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--webhook-muted-text);
}

.webhook-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.webhook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--webhook-card-border);
  border-radius: 0.5rem;
  background: white;
}

.webhook-info {
  flex: 1;
}

.webhook-url {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.webhook-events {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.event-tag {
  background: var(--webhook-status-active-bg);
  color: var(--webhook-status-active-text);
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.webhook-status {
  display: flex;
  gap: 1rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.active {
  background: var(--webhook-status-enabled-bg);
  color: var(--webhook-status-enabled-text);
}

.status.inactive {
  background: var(--webhook-status-disabled-bg);
  color: var(--webhook-status-disabled-text);
}

.status.success {
  background: var(--webhook-status-enabled-bg);
  color: var(--webhook-status-enabled-text);
}

.status.failed {
  background: var(--webhook-status-error-bg);
  color: var(--webhook-status-error-text);
}

.webhook-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--webhook-btn-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--webhook-btn-primary-hover);
}

.btn-secondary {
  background: var(--webhook-btn-secondary);
  color: white;
}

.btn-secondary:hover {
  background: var(--webhook-btn-secondary-hover);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-danger {
  background: var(--webhook-btn-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--webhook-btn-danger-hover);
}

.error-message {
  background: var(--webhook-status-error-bg);
  color: var(--webhook-status-error-text);
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

/* Enhanced Empty State Styles - Palette's micro-UX delight! */
.empty-state {
  text-align: center;
  padding: 2.5rem 2rem;
  color: var(--webhook-muted-text);
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0)
  );
  border-radius: 0.75rem;
}

.empty-state-heading {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state-description {
  font-size: 0.875rem;
  color: #6b7280;
  max-width: 24rem;
  margin: 0 auto 1.5rem;
  line-height: 1.5;
}

.empty-state-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  transition: all 0.2s ease;
}

.empty-state-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-state-cta:active {
  transform: translateY(0);
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Animations - Palette's micro-UX delight! */
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-float-gentle {
  animation: float-gentle 3s ease-in-out infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.animate-heartbeat {
  animation: heartbeat 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

.animate-sparkle {
  animation: sparkle 2.5s ease-in-out infinite;
}

.animate-sparkle-delayed {
  animation: sparkle 2.5s ease-in-out infinite;
  animation-delay: 1.25s;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow,
  .animate-float-gentle,
  .animate-heartbeat,
  .animate-sparkle,
  .animate-sparkle-delayed {
    animation: none;
  }
}
</style>
