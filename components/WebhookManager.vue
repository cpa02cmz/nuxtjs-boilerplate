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

      <!-- Enhanced Empty State -->
      <div
        v-if="webhooks.length === 0"
        class="webhook-empty-state"
        role="status"
        aria-live="polite"
      >
        <!-- Animated Illustration -->
        <div
          class="webhook-illustration"
          aria-hidden="true"
        >
          <!-- Background Circle -->
          <div
            class="webhook-bg-circle"
            :class="{ 'animate-pulse-slow': !reducedMotion }"
          />

          <!-- Webhook Icon Container -->
          <div
            class="webhook-icon-wrapper"
            :class="{ 'animate-bounce-subtle': !reducedMotion }"
          >
            <svg
              class="webhook-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Webhook/Link Icon -->
              <path
                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="webhook-link-path"
                :class="{ 'animate-draw': !reducedMotion }"
              />
              <path
                d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="webhook-link-path-delayed"
                :class="{ 'animate-draw-delayed': !reducedMotion }"
              />
            </svg>
          </div>

          <!-- Floating Dots -->
          <div
            v-if="!reducedMotion"
            class="webhook-float-dot webhook-float-dot-1"
          />
          <div
            v-if="!reducedMotion"
            class="webhook-float-dot webhook-float-dot-2"
          />
        </div>

        <!-- Title -->
        <h4 class="webhook-empty-title">
          {{ contentConfig.webhooks.empty.title }}
        </h4>

        <!-- Description -->
        <p class="webhook-empty-description">
          {{ contentConfig.webhooks.empty.description }}
        </p>

        <!-- CTA Button -->
        <button
          class="btn btn-primary webhook-empty-cta"
          :aria-label="contentConfig.webhooks.ariaLabels.createButton"
          @click="showCreateForm = true"
        >
          <svg
            class="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ contentConfig.webhooks.empty.ctaButton }}
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
            <!-- Delete button with Press and Hold protection - Palette's micro-UX enhancement! -->
            <button
              class="btn btn-sm btn-danger press-hold-button"
              :class="{
                'is-pressing': getPressAndHold(webhook.id, webhook).isPressing,
                'is-complete': getPressAndHold(webhook.id, webhook).isComplete,
              }"
              :style="getPressAndHold(webhook.id, webhook).progressStyle"
              :aria-label="
                contentConfig.webhooks.ariaLabels.deleteWebhook +
                  ' (Press and hold to confirm)'
              "
              @mousedown="getPressAndHold(webhook.id, webhook).startPress"
              @mouseup="getPressAndHold(webhook.id, webhook).endPress"
              @mouseleave="getPressAndHold(webhook.id, webhook).endPress"
              @touchstart.prevent="
                getPressAndHold(webhook.id, webhook).startPress
              "
              @touchend.prevent="getPressAndHold(webhook.id, webhook).endPress"
              @touchcancel.prevent="
                getPressAndHold(webhook.id, webhook).endPress
              "
            >
              <!-- Progress Ring SVG -->
              <span
                v-if="
                  getPressAndHold(webhook.id, webhook).isPressing &&
                    !reducedMotion
                "
                class="press-hold-ring"
                aria-hidden="true"
              >
                <svg
                  class="progress-ring"
                  :width="animationConfig.pressAndHold.ringSize"
                  :height="animationConfig.pressAndHold.ringSize"
                  :viewBox="`0 0 ${animationConfig.pressAndHold.ringSize} ${animationConfig.pressAndHold.ringSize}`"
                >
                  <!-- Background circle -->
                  <circle
                    class="progress-ring-bg"
                    :cx="animationConfig.pressAndHold.ringSize / 2"
                    :cy="animationConfig.pressAndHold.ringSize / 2"
                    :r="
                      (animationConfig.pressAndHold.ringSize -
                        animationConfig.pressAndHold.strokeWidth) /
                        2
                    "
                    fill="none"
                    :stroke-width="animationConfig.pressAndHold.strokeWidth"
                  />
                  <!-- Progress circle -->
                  <circle
                    class="progress-ring-fill"
                    :cx="animationConfig.pressAndHold.ringSize / 2"
                    :cy="animationConfig.pressAndHold.ringSize / 2"
                    :r="
                      (animationConfig.pressAndHold.ringSize -
                        animationConfig.pressAndHold.strokeWidth) /
                        2
                    "
                    fill="none"
                    :stroke-width="animationConfig.pressAndHold.strokeWidth"
                    :stroke-dasharray="`var(--circumference)`"
                    :stroke-dashoffset="`var(--progress-offset)`"
                    stroke-linecap="round"
                    :style="{
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                    }"
                  />
                </svg>
              </span>
              <!-- Button text changes during press -->
              <span class="button-text">
                <template
                  v-if="getPressAndHold(webhook.id, webhook).isPressing"
                >
                  {{
                    Math.round(getPressAndHold(webhook.id, webhook).progress)
                  }}%
                </template>
                <template v-else>
                  {{ contentConfig.webhooks.buttons.delete }}
                </template>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Webhook } from '~/types/webhook'
import { useWebhooksManager } from '~/composables/useWebhooksManager'
import { usePressAndHold } from '~/composables/usePressAndHold'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { webhooksConfig } from '~/configs/webhooks.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexConfig } from '~/configs/z-index.config'

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

// Respect user's motion preferences - Palette cares about accessibility!
const reducedMotion = computed(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

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

// Press and Hold state management for destructive delete action
const pressAndHoldStates = ref<Map<string, ReturnType<typeof usePressAndHold>>>(
  new Map()
)

// Initialize press and hold for a specific webhook
const getPressAndHold = (webhookId: string, webhook: Webhook) => {
  if (!pressAndHoldStates.value.has(webhookId)) {
    const pressAndHold = usePressAndHold({
      onComplete: () => {
        handleDeleteWebhook(webhook)
      },
      onCancel: () => {
        // Optional: Add haptic feedback or visual cancellation cue
      },
    })
    pressAndHoldStates.value.set(webhookId, pressAndHold)
  }
  return pressAndHoldStates.value.get(webhookId)!
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
  transition: all v-bind('animationConfig.webhookManager.transitionDurationSec')
    ease;
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

/* Webhook Empty State - Palette's delightful micro-UX enhancement! */
.webhook-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.webhook-illustration {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}

.webhook-bg-circle {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    v-bind('animationConfig.webhookManager.colors.gradientStart') 0%,
    v-bind('animationConfig.webhookManager.colors.gradientEnd') 100%
  );
  border-radius: 50%;
}

.webhook-icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.webhook-icon {
  width: 48px;
  height: 48px;
  color: var(--webhook-muted-text);
}

.webhook-float-dot {
  position: absolute;
  background: var(--webhook-border);
  border-radius: 50%;
}

.webhook-float-dot-1 {
  width: 8px;
  height: 8px;
  top: 20%;
  right: 15%;
  animation: webhook-float
    v-bind('`${animationConfig.webhookManager.floatDurationSec}s`') ease-in-out
    infinite;
}

.webhook-float-dot-2 {
  width: 6px;
  height: 6px;
  bottom: 25%;
  left: 20%;
  animation: webhook-float-delayed
    v-bind('`${animationConfig.webhookManager.floatDurationSec}s`') ease-in-out
    infinite;
  animation-delay: v-bind('`${animationConfig.webhookManager.floatDelaySec}s`');
}

.webhook-empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('animationConfig.webhookManager.colors.iconColor');
  margin-bottom: 0.5rem;
}

.webhook-empty-description {
  font-size: 0.875rem;
  color: var(--webhook-muted-text);
  max-width: 280px;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.webhook-empty-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all v-bind('animationConfig.webhookManager.transitionDurationSec')
    ease;
}

.webhook-empty-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px
    v-bind('animationConfig.webhookManager.colors.glowColor');
}

.webhook-empty-cta:active {
  transform: translateY(0);
}

/* Animation Keyframes */
@keyframes webhook-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.1);
  }
}

@keyframes webhook-float-delayed {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.05);
  }
}

@keyframes webhook-draw {
  from {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
  }
  to {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
  }
}

@keyframes webhook-draw-delayed {
  0%,
  30% {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    opacity: 0;
  }
  100% {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

@keyframes webhook-pulse-slow {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

@keyframes webhook-bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Animation Classes - Flexy hates hardcoded values! */
.animate-pulse-slow {
  animation: webhook-pulse-slow
    v-bind('`${animationConfig.webhookManager.pulseSlowDurationSec}s`')
    ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: webhook-bounce-subtle
    v-bind('`${animationConfig.webhookManager.bounceDurationSec}s`') ease-in-out
    infinite;
}

.animate-draw {
  animation: webhook-draw
    v-bind('`${animationConfig.webhookManager.drawDurationSec}s`') ease-out
    forwards;
}

.animate-draw-delayed {
  animation: webhook-draw-delayed
    v-bind('`${animationConfig.webhookManager.drawDurationSec}s`') ease-out
    forwards;
}

/* Press and Hold Button Styles - Palette's protective micro-UX enhancement! */
.press-hold-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  transition: all var(--duration, 200ms) ease-out;
  overflow: hidden;
}

.press-hold-button.is-pressing {
  transform: scale(v-bind('animationConfig.pressAndHold.pressScale'));
}

.press-hold-button.is-complete {
  background-color: v-bind(
    'animationConfig.webhookManager.colors.deleteBg'
  ) !important;
}

.press-hold-ring {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: var(--ring-bg-color, rgba(239, 68, 68, 0.2));
}

.progress-ring-fill {
  stroke: var(--ring-color, #ef4444);
  transition: stroke-dashoffset 50ms linear;
}

.button-text {
  position: relative;
  z-index: v-bind('zIndexConfig.floatingLabel');
  font-variant-numeric: tabular-nums;
  min-width: 2ch;
  text-align: center;
}

/* Shrink progress ring slightly to fit inside button */
.press-hold-ring .progress-ring {
  width: calc(var(--ring-size, 24px) * 0.9) !important;
  height: calc(var(--ring-size, 24px) * 0.9) !important;
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow,
  .animate-bounce-subtle,
  .animate-draw,
  .animate-draw-delayed {
    animation: none;
    opacity: 1;
  }

  .webhook-empty-cta:hover {
    transform: none;
  }

  .press-hold-button {
    transition: none;
  }

  .press-hold-button.is-pressing {
    transform: none;
  }

  .progress-ring-fill {
    transition: none;
  }
}
</style>
