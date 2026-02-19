<template>
  <div class="api-keys-manager">
    <div class="api-keys-header">
      <h2>{{ contentConfig.apiKeys.title }}</h2>
      <button class="btn btn-primary" @click="showCreateForm = true">
        {{ contentConfig.apiKeys.buttons.create }}
      </button>
    </div>

    <!-- Create API Key Form -->
    <div
      v-if="showCreateForm"
      class="api-key-form"
      @keydown.esc="showCreateForm = false"
    >
      <h3>{{ contentConfig.apiKeys.buttons.create }}</h3>
      <form @submit.prevent="createApiKey">
        <div class="form-group">
          <label for="name">{{ contentConfig.apiKeys.labels.keyName }}</label>
          <input
            id="name"
            v-model="newApiKey.name"
            type="text"
            required
            :placeholder="contentConfig.apiKeys.placeholders.keyNameAlt"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="permissions">{{
            contentConfig.apiKeys.labels.permissions
          }}</label>
          <select
            id="permissions"
            v-model="newApiKey.permissions"
            multiple
            class="form-control"
          >
            <option value="read">
              {{ contentConfig.apiKeys.permissions.read }}
            </option>
            <option value="write">
              {{ contentConfig.apiKeys.permissions.write }}
            </option>
            <option value="delete">
              {{ contentConfig.apiKeys.permissions.delete }}
            </option>
            <option value="webhooks">
              {{ contentConfig.apiKeys.permissions.webhooks }}
            </option>
            <option value="admin">
              {{ contentConfig.apiKeys.permissions.admin }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isCreating"
            :aria-busy="isCreating"
          >
            <!-- Pallete: Loading spinner for better UX during async operations -->
            <svg
              v-if="isCreating"
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
            {{
              isCreating
                ? contentConfig.apiKeys.buttons.creating
                : contentConfig.apiKeys.buttons.create
            }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="showCreateForm = false"
          >
            {{ contentConfig.apiKeys.buttons.cancel }}
          </button>
        </div>
      </form>
    </div>

    <!-- API Keys List -->
    <div class="api-keys-list">
      <h3>{{ contentConfig.apiKeys.labels.yourKeys }}</h3>

      <!-- Enhanced Empty State -->
      <div
        v-if="apiKeys.length === 0"
        class="api-key-empty-state"
        role="status"
        aria-live="polite"
      >
        <!-- Animated Illustration -->
        <div class="api-key-illustration" aria-hidden="true">
          <!-- Background Circle -->
          <div
            class="api-key-bg-circle"
            :class="{ 'animate-pulse-slow': !reducedMotion }"
          />

          <!-- Key Icon Container -->
          <div
            class="api-key-icon-wrapper"
            :class="{ 'animate-bounce-subtle': !reducedMotion }"
          >
            <svg
              class="api-key-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Key Icon -->
              <path
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="api-key-path"
                :class="{ 'animate-draw': !reducedMotion }"
              />
            </svg>
          </div>

          <!-- Floating Dots -->
          <div
            v-if="!reducedMotion"
            class="api-key-float-dot api-key-float-dot-1"
          />
          <div
            v-if="!reducedMotion"
            class="api-key-float-dot api-key-float-dot-2"
          />
        </div>

        <!-- Title -->
        <h4 class="api-key-empty-title">
          {{ contentConfig.apiKeys.empty.title }}
        </h4>

        <!-- Description -->
        <p class="api-key-empty-description">
          {{ contentConfig.apiKeys.empty.description }}
        </p>

        <!-- CTA Button -->
        <button
          class="btn btn-primary api-key-empty-cta"
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
          {{ contentConfig.apiKeys.empty.ctaButton }}
        </button>
      </div>
      <div v-else class="api-key-items">
        <TransitionGroup
          name="api-key-item"
          tag="div"
          class="api-key-items-container"
        >
          <div
            v-for="(key, index) in apiKeys"
            :key="key.id"
            class="api-key-item"
            :class="{
              'api-key-item--hovered':
                hoveredKeyId === key.id && !reducedMotion,
              'api-key-item--active': !key.revokedAt,
              'api-key-item--revoked': key.revokedAt,
            }"
            :style="getKeyItemStyle(index)"
            @mouseenter="handleKeyItemHover(key.id)"
            @mouseleave="handleKeyItemLeave"
          >
            <!-- 🎨 Pallete's micro-UX: Status indicator with pulse animation -->
            <div
              class="api-key-status"
              :class="{
                'api-key-status--active': !key.revokedAt,
                'api-key-status--revoked': key.revokedAt,
                'api-key-status--pulse': !key.revokedAt && !reducedMotion,
              }"
              :aria-label="key.revokedAt ? 'Revoked' : 'Active'"
            >
              <span class="status-dot" />
              <span class="status-label">{{
                key.revokedAt ? 'Revoked' : 'Active'
              }}</span>
            </div>
            <div class="api-key-info">
              <div class="api-key-name">
                {{ key.name }}
              </div>
              <div class="api-key-id">
                {{ contentConfig.apiKeys.labels.id }} {{ key.id }}
              </div>
              <div class="api-key-permissions">
                <span
                  v-for="permission in key.permissions"
                  :key="permission"
                  class="permission-tag"
                >
                  {{ permission }}
                </span>
              </div>
              <div class="api-key-meta">
                <div>
                  {{ contentConfig.apiKeys.labels.created }}
                  {{ new Date(key.createdAt).toLocaleDateString() }}
                </div>
                <div v-if="key.lastUsedAt">
                  {{ contentConfig.apiKeys.labels.expires }}
                  {{ new Date(key.lastUsedAt).toLocaleDateString() }}
                </div>
              </div>
            </div>
            <div class="api-key-actions">
              <!-- Frontend Engineer: Press and Hold button for destructive revoke action -->
              <!-- Replaces confirm() dialog with intentional press-and-hold UX -->
              <button
                class="btn btn-sm btn-danger press-hold-button"
                :class="{
                  'is-pressing': getPressAndHold(key.id, key).isPressing,
                  'is-complete': getPressAndHold(key.id, key).isComplete,
                  'btn--revoking': revokingKeyId === key.id,
                }"
                :style="getPressAndHold(key.id, key).progressStyle"
                :aria-label="
                  contentConfig.apiKeys.aria.revokeButton.replace(
                    '{{name}}',
                    key.name
                  ) + ' (Press and hold to confirm)'
                "
                :disabled="revokingKeyId === key.id"
                :aria-busy="revokingKeyId === key.id"
                @mousedown="getPressAndHold(key.id, key).startPress"
                @mouseup="getPressAndHold(key.id, key).endPress"
                @mouseleave="getPressAndHold(key.id, key).endPress"
                @touchstart.prevent="getPressAndHold(key.id, key).startPress"
                @touchend.prevent="getPressAndHold(key.id, key).endPress"
                @touchcancel.prevent="getPressAndHold(key.id, key).endPress"
              >
                <!-- Progress Ring SVG -->
                <span
                  v-if="
                    getPressAndHold(key.id, key).isPressing && !reducedMotion
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
                <!-- Loading spinner during revocation -->
                <svg
                  v-if="revokingKeyId === key.id"
                  class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white inline-block"
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
                <!-- Button text changes during press -->
                <span class="button-text">
                  <template v-if="revokingKeyId === key.id">
                    {{ contentConfig.apiKeys.buttons.revoking }}
                  </template>
                  <template v-else-if="getPressAndHold(key.id, key).isPressing">
                    {{ Math.round(getPressAndHold(key.id, key).progress) }}%
                  </template>
                  <template v-else>
                    {{ contentConfig.apiKeys.buttons.revoke }}
                  </template>
                </span>
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- API Key Created Modal -->
    <div v-if="showKeyCreatedModal" class="modal-overlay" @click="closeModal">
      <div
        ref="modalContent"
        class="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="-1"
        @click.stop
        @keydown.esc="closeModal"
      >
        <h3 id="modal-title">
          {{ contentConfig.apiKeys.buttons.create }}
        </h3>
        <p><strong>Key:</strong> {{ createdApiKey?.key }}</p>
        <p class="warning" role="alert">
          Make sure to copy this key now. You won't be able to see it again.
        </p>
        <div class="form-actions">
          <button
            class="btn"
            :class="copySuccess ? 'btn-success' : 'btn-primary'"
            :aria-label="
              copySuccess
                ? 'API key copied to clipboard'
                : 'Copy API key to clipboard'
            "
            @click="copyApiKey"
          >
            <svg
              v-if="!copySuccess"
              xmlns="http://www.w3.org/2000/svg"
              class="btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path
                d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="btn-icon animate-check-scale"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            {{
              copySuccess
                ? contentConfig.messages.clipboard.copied
                : contentConfig.messages.clipboard.copy
            }}
          </button>
          <button class="btn btn-secondary" @click="closeModal">
            {{ contentConfig.apiKeys.buttons.cancel }}
          </button>
        </div>
        <!-- Screen reader announcement for copy feedback -->
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          class="sr-only"
        >
          {{ copySuccess ? 'API key has been copied to clipboard' : '' }}
        </div>

        <!-- 🎨 Pallete's micro-UX: Particle burst celebration for copy success ✨ -->
        <TransitionGroup
          v-if="showParticles && !reducedMotion"
          tag="div"
          class="api-key-particle-container"
          aria-hidden="true"
        >
          <span
            v-for="particle in particles"
            :key="particle.id"
            class="api-key-particle"
            :style="{
              '--particle-x': `${particle.x}px`,
              '--particle-y': `${particle.y}px`,
              '--particle-color': particle.color,
              '--particle-size': `${particle.size}px`,
              '--particle-rotation': `${particle.rotation}deg`,
            }"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import type { ApiKey } from '~/types/webhook'
import type { NewApiKey } from '~/composables/useApiKeysManager'
import { useApiKeysManager } from '~/composables/useApiKeysManager'
import { usePressAndHold } from '~/composables/usePressAndHold'
import logger from '~/utils/logger'
import { permissionsConfig } from '~/configs/permissions.config'
import { animationConfig } from '~/configs/animation.config'
import { zIndexScale, zIndexConfig } from '~/configs/z-index.config'
import { EASING } from '~/configs/easing.config'
import { contentConfig } from '~/configs/content.config'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { hapticSuccess, hapticError, hapticLight } from '~/utils/hapticFeedback'

const {
  apiKeys,
  fetchApiKeys,
  createApiKey: createApiKeys,
  revokeApiKey: revokeApiKeys,
  // Pallete: Destructure isCreating for loading state feedback
  isCreating,
} = useApiKeysManager()

// Accessibility: Respect reduced motion preferences - Palette cares about accessibility!
const reducedMotion = computed(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

const showCreateForm = ref(false)
const showKeyCreatedModal = ref(false)
const createdApiKey = ref<ApiKey | null>(null)
const modalContent = ref<HTMLElement | null>(null)
const copySuccess = ref(false)
// Pallete: Track which key is being revoked for granular loading feedback
const revokingKeyId = ref<string | null>(null)

// 🎨 Pallete's micro-UX: Particle burst system for copy celebration
interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
}

const particles = ref<Particle[]>([])
const showParticles = ref(false)
let particleIdCounter = 0

// Generate particle burst for copy success celebration
const createParticleBurst = () => {
  if (reducedMotion.value) return

  // Flexy hates hardcoded colors! Now using config
  const colors = animationConfig.copyParticles.colors
  const newParticles: Particle[] = []
  const particleCount = animationConfig.copyParticles.particleCount

  // Flexy hates hardcoded 12! Now using configurable particle count
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2
    // Flexy hates hardcoded 30 and 20! Now using configurable spread
    const distance =
      animationConfig.copyParticles.spreadPx * 0.6 +
      Math.random() * (animationConfig.copyParticles.spreadPx * 0.4)
    // Flexy hates hardcoded 4! Now using configurable size range
    const size =
      animationConfig.copyParticles.minSizePx +
      Math.random() *
        (animationConfig.copyParticles.maxSizePx -
          animationConfig.copyParticles.minSizePx)
    newParticles.push({
      id: particleIdCounter++,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: size,
      rotation: Math.random() * 360,
    })
  }

  particles.value = newParticles
  showParticles.value = true

  // Clear particles after animation
  setTimeout(() => {
    showParticles.value = false
    particles.value = []
  }, animationConfig.copyParticles.durationMs)
}

// Store previously focused element
let previousActiveElement: HTMLElement | null = null

// 🎨 Pallete's micro-UX: Track hovered key for enhanced interactions
const hoveredKeyId = ref<string | null>(null)

// 🎨 Pallete's micro-UX: Handle key item hover with haptic feedback
const handleKeyItemHover = (keyId: string) => {
  hoveredKeyId.value = keyId
  if (!reducedMotion.value) {
    hapticLight()
  }
}

const handleKeyItemLeave = () => {
  hoveredKeyId.value = null
}

// 🎨 Pallete's micro-UX: Get staggered entrance style for key items
const getKeyItemStyle = (index: number) => {
  if (reducedMotion.value) return {}
  const delay = Math.min(
    index * animationConfig.apiKeys.staggerDelayMs,
    animationConfig.apiKeys.maxStaggerDelayMs
  )
  return { '--item-delay': `${delay}ms` }
}

// Focus trap for modal
const focusableElementsString =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const getFocusableElements = (element: HTMLElement) => {
  return element.querySelectorAll<HTMLElement>(focusableElementsString)
}

const trapFocus = (event: KeyboardEvent) => {
  if (!modalContent.value) return

  const focusableContent = getFocusableElements(modalContent.value)
  if (focusableContent.length === 0) return

  const firstElement = focusableContent[0]
  const lastElement = focusableContent[focusableContent.length - 1]

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Modal open/close handlers
const openModal = () => {
  previousActiveElement = document.activeElement as HTMLElement
  showKeyCreatedModal.value = true

  nextTick(() => {
    if (modalContent.value) {
      modalContent.value.focus()
      modalContent.value.addEventListener('keydown', trapFocus)
    }
  })
}

const closeModal = () => {
  showKeyCreatedModal.value = false

  if (modalContent.value) {
    modalContent.value.removeEventListener('keydown', trapFocus)
  }

  nextTick(() => {
    previousActiveElement?.focus()
  })
}

const newApiKey = reactive<NewApiKey>({
  name: '',
  permissions: [...permissionsConfig.apiKey.defaultPermissions],
})

// Create new API key
const createApiKey = async () => {
  const key = await createApiKeys(newApiKey)

  if (key) {
    // Show the created key in a modal
    createdApiKey.value = key
    openModal()

    // Reset form
    newApiKey.name = ''
    newApiKey.permissions = [...permissionsConfig.apiKey.defaultPermissions]
    showCreateForm.value = false
  }
}

// Revoke API key handler - called when press-and-hold completes
const handleRevokeApiKey = async (key: ApiKey) => {
  // Frontend Engineer: Track which key is being revoked for loading feedback
  revokingKeyId.value = key.id
  const success = await revokeApiKeys(key.id)
  revokingKeyId.value = null
  if (!success) {
    logger.error('Failed to revoke API key')
  } else {
    // Palette's micro-UX enhancement: Light haptic feedback for deletion
    hapticLight()
  }
}

// Frontend Engineer: Press and Hold state management for destructive revoke action
// Replaces confirm() dialog with intentional press-and-hold UX for consistency with WebhookManager
const pressAndHoldStates = ref<Map<string, ReturnType<typeof usePressAndHold>>>(
  new Map()
)

// Initialize press and hold for a specific API key
const getPressAndHold = (keyId: string, key: ApiKey) => {
  if (!pressAndHoldStates.value.has(keyId)) {
    const pressAndHold = usePressAndHold({
      onComplete: () => {
        handleRevokeApiKey(key)
      },
      onCancel: () => {
        // Optional: Add visual cancellation cue or haptic feedback
      },
    })
    // @ts-expect-error - Type mismatch between Ref and plain object in pressAndHold return
    pressAndHoldStates.value.set(keyId, pressAndHold)
  }
  return pressAndHoldStates.value.get(keyId)!
}

// Copy API key to clipboard with visual and haptic feedback
const copyApiKey = async () => {
  if (createdApiKey.value?.key) {
    try {
      await navigator.clipboard.writeText(createdApiKey.value.key)
      copySuccess.value = true

      // 🎨 Pallete's micro-UX: Trigger particle burst celebration
      createParticleBurst()

      // Haptic feedback for successful copy
      hapticSuccess()

      // Reset button state after configured duration
      setTimeout(() => {
        copySuccess.value = false
      }, animationConfig.copySuccess.resetDelayMs)
    } catch (error) {
      logger.error('Error copying API key to clipboard', error)
      // Haptic feedback for failed copy
      hapticError()
    }
  }
}

// Load API keys on component mount
onMounted(() => {
  fetchApiKeys()
})
</script>

<style scoped>
.api-keys-manager {
  max-width: v-bind('componentStylesConfig.apiKeys.maxWidth');
  margin: 0 auto;
  padding: v-bind('componentStylesConfig.apiKeys.padding');
}

.api-keys-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: v-bind('componentStylesConfig.apiKeys.headerMarginBottom');
}

.api-key-form {
  background: v-bind('componentStylesConfig.apiKeys.formBackground');
  padding: v-bind('componentStylesConfig.apiKeys.formPadding');
  border-radius: v-bind('componentStylesConfig.apiKeys.formBorderRadius');
  margin-bottom: v-bind('componentStylesConfig.apiKeys.formMarginBottom');
}

.form-group {
  margin-bottom: v-bind('componentStylesConfig.apiKeys.formGroupMarginBottom');
}

.form-group label {
  display: block;
  margin-bottom: v-bind('componentStylesConfig.apiKeys.labelMarginBottom');
  font-weight: v-bind('componentStylesConfig.apiKeys.labelFontWeight');
}

.form-control {
  width: v-bind('componentStylesConfig.apiKeys.inputWidth');
  padding: v-bind('componentStylesConfig.apiKeys.inputPadding');
  border: v-bind('componentStylesConfig.apiKeys.inputBorder');
  border-radius: v-bind('componentStylesConfig.apiKeys.inputBorderRadius');
  font-size: v-bind('componentStylesConfig.apiKeys.inputFontSize');
}

.form-control[multiple] {
  height: auto;
  min-height: v-bind('componentStylesConfig.apiKeys.inputMultipleMinHeight');
}

.form-actions {
  display: flex;
  gap: v-bind('componentStylesConfig.apiKeys.actionsGap');
  margin-top: v-bind('componentStylesConfig.apiKeys.actionsMarginTop');
}

.api-keys-list h3 {
  margin-bottom: v-bind('componentStylesConfig.apiKeys.listTitleMarginBottom');
}

.empty-state {
  text-align: center;
  padding: v-bind('componentStylesConfig.apiKeys.emptyStatePadding');
  color: v-bind('componentStylesConfig.apiKeys.emptyStateColor');
}

.api-key-items {
  display: flex;
  flex-direction: column;
  gap: v-bind('componentStylesConfig.apiKeys.itemsGap');
}

/* 🎨 Pallete's micro-UX: Enhanced API Key Item Styles */
.api-key-items-container {
  display: flex;
  flex-direction: column;
  gap: v-bind('componentStylesConfig.apiKeys.itemsGap');
}

.api-key-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: v-bind('componentStylesConfig.apiKeys.itemPadding');
  border: v-bind('componentStylesConfig.apiKeys.itemBorder');
  border-radius: v-bind('componentStylesConfig.apiKeys.itemBorderRadius');
  background: v-bind('componentStylesConfig.apiKeys.itemBackground');
  transition: all v-bind('animationConfig.apiKeys.itemTransitionMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
  will-change: transform, box-shadow;
  opacity: 0;
  transform: translateY(
    v-bind('animationConfig.apiKeys.itemEntranceDistancePx + "px"')
  );
  animation: key-item-entrance
    v-bind('animationConfig.apiKeys.itemEntranceDurationMs + "ms"')
    v-bind('EASING.SPRING_STANDARD') forwards;
  animation-delay: var(--item-delay, 0ms);
}

/* Entrance animation for list items */
@keyframes key-item-entrance {
  0% {
    opacity: 0;
    transform: translateY(
        v-bind('animationConfig.apiKeys.itemEntranceDistancePx + "px"')
      )
      scale(0.98);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 🎨 Pallete's micro-UX: Hover lift effect */
.api-key-item--hovered {
  transform: translateY(
    v-bind('"-" + animationConfig.apiKeys.itemHoverLiftPx + "px"')
  ) !important;
  box-shadow: 0 v-bind('animationConfig.apiKeys.itemHoverShadowY + "px"')
    v-bind('animationConfig.apiKeys.itemHoverShadowBlur + "px"')
    v-bind('animationConfig.apiKeys.itemHoverShadowSpread + "px"')
    v-bind('animationConfig.shadows.light.md');
  border-color: v-bind('componentStylesConfig.apiKeys.itemHoverBorderColor');
}

/* 🎨 Pallete's micro-UX: Status indicator styles */
.api-key-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  /* Flexy hates hardcoded 0.3s! Using animationConfig.apiKeys.statusTransitionDurationSec */
  transition: all
    v-bind('animationConfig.apiKeys.statusTransitionDurationSec + "s"') ease;
}

.api-key-status--active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
}

.api-key-status--active.api-key-status--pulse .status-dot {
  animation: status-pulse
    v-bind('animationConfig.apiKeys.statusPulseDurationSec + "s"') ease-in-out
    infinite;
}

.api-key-status--revoked .status-dot {
  background: #9ca3af;
}

.api-key-status--active .status-label {
  color: #059669;
}

.api-key-status--revoked .status-label {
  color: #6b7280;
}

@keyframes status-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
}

/* 🎨 Pallete's micro-UX: Revoked key visual state */
.api-key-item--revoked {
  opacity: 0.7;
  background: v-bind('componentStylesConfig.apiKeys.revokedItemBackground');
}

.api-key-item--revoked .api-key-name {
  text-decoration: line-through;
  color: #9ca3af;
}

/* 🎨 Pallete's micro-UX: TransitionGroup animations */
.api-key-item-enter-active,
.api-key-item-leave-active {
  transition: all v-bind('animationConfig.apiKeys.itemTransitionMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
}

.api-key-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.api-key-item-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.api-key-item-move {
  transition: transform
    v-bind('animationConfig.apiKeys.itemTransitionMs + "ms"')
    v-bind('EASING.SPRING_STANDARD');
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: v-bind('componentStylesConfig.apiKeys.itemPadding');
  border: v-bind('componentStylesConfig.apiKeys.itemBorder');
  border-radius: v-bind('componentStylesConfig.apiKeys.itemBorderRadius');
  background: v-bind('componentStylesConfig.apiKeys.itemBackground');
}

.api-key-info {
  flex: 1;
}

.api-key-name {
  font-weight: v-bind('componentStylesConfig.apiKeys.keyNameFontWeight');
  margin-bottom: v-bind('componentStylesConfig.apiKeys.keyNameMarginBottom');
}

.api-key-id {
  color: v-bind('componentStylesConfig.apiKeys.keyMetaColor');
  font-size: v-bind('componentStylesConfig.apiKeys.keyMetaFontSize');
  margin-bottom: 0.5rem;
}

.api-key-permissions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.permission-tag {
  background: v-bind('componentStylesConfig.apiKeys.permissionTagBackground');
  color: v-bind('componentStylesConfig.apiKeys.permissionTagColor');
  padding: v-bind('componentStylesConfig.apiKeys.permissionTagPadding');
  border-radius: v-bind(
    'componentStylesConfig.apiKeys.permissionTagBorderRadius'
  );
  font-size: v-bind('componentStylesConfig.apiKeys.permissionTagFontSize');
}

.api-key-meta {
  display: flex;
  gap: v-bind('componentStylesConfig.apiKeys.keyMetaGap');
  font-size: v-bind('componentStylesConfig.apiKeys.keyMetaFontSize');
  color: v-bind('componentStylesConfig.apiKeys.keyMetaColor');
}

.api-key-actions {
  display: flex;
  gap: v-bind('componentStylesConfig.apiKeys.actionsGapSmall');
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind('componentStylesConfig.apiKeys.modalOverlayBg');
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: v-bind('componentStylesConfig.apiKeys.modalZIndex');
}

.modal-content {
  background: v-bind('componentStylesConfig.apiKeys.modalContentBackground');
  padding: v-bind('componentStylesConfig.apiKeys.modalContentPadding');
  border-radius: v-bind(
    'componentStylesConfig.apiKeys.modalContentBorderRadius'
  );
  max-width: v-bind('componentStylesConfig.apiKeys.modalContentMaxWidth');
  width: v-bind('componentStylesConfig.apiKeys.modalContentWidth');
}

.warning {
  background: v-bind('componentStylesConfig.apiKeys.warningBackground');
  color: v-bind('componentStylesConfig.apiKeys.warningColor');
  padding: v-bind('componentStylesConfig.apiKeys.warningPadding');
  border-radius: v-bind('componentStylesConfig.apiKeys.warningBorderRadius');
  margin: v-bind('componentStylesConfig.apiKeys.warningMargin');
}

.btn {
  padding: v-bind('componentStylesConfig.apiKeys.buttonPadding');
  border: v-bind('componentStylesConfig.apiKeys.buttonBorder');
  border-radius: v-bind('componentStylesConfig.apiKeys.buttonBorderRadius');
  font-size: v-bind('componentStylesConfig.apiKeys.buttonFontSize');
  font-weight: v-bind('componentStylesConfig.apiKeys.buttonFontWeight');
  cursor: pointer;
  transition: v-bind('componentStylesConfig.apiKeys.buttonTransition');
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: v-bind('componentStylesConfig.apiKeys.buttonPrimaryBg');
  color: v-bind('componentStylesConfig.apiKeys.buttonPrimaryColor');
}

.btn-primary:hover {
  background: v-bind('componentStylesConfig.apiKeys.buttonPrimaryHoverBg');
}

.btn-secondary {
  background: v-bind('componentStylesConfig.apiKeys.buttonSecondaryBg');
  color: v-bind('componentStylesConfig.apiKeys.buttonSecondaryColor');
}

.btn-secondary:hover {
  background: v-bind('componentStylesConfig.apiKeys.buttonSecondaryHoverBg');
}

.btn-sm {
  padding: v-bind('componentStylesConfig.apiKeys.buttonSmallPadding');
  font-size: v-bind('componentStylesConfig.apiKeys.buttonSmallFontSize');
}

.btn-danger {
  background: v-bind('componentStylesConfig.apiKeys.buttonDangerBg');
  color: v-bind('componentStylesConfig.apiKeys.buttonDangerColor');
}

.btn-danger:hover {
  background: v-bind('componentStylesConfig.apiKeys.buttonDangerHoverBg');
}

.btn-success {
  background: v-bind('componentStylesConfig.apiKeys.buttonSuccessBg');
  color: v-bind('componentStylesConfig.apiKeys.buttonSuccessColor');
}

.btn-success:hover {
  background: v-bind('componentStylesConfig.apiKeys.buttonSuccessHoverBg');
}

.btn-icon {
  width: v-bind('componentStylesConfig.apiKeys.buttonIconWidth');
  height: v-bind('componentStylesConfig.apiKeys.buttonIconHeight');
  margin-right: v-bind('componentStylesConfig.apiKeys.buttonIconMarginRight');
  display: inline-block;
  vertical-align: middle;
}

/* Checkmark scale animation for copy feedback */
.animate-check-scale {
  animation: check-scale
    v-bind('componentStylesConfig.apiKeys.checkAnimationDuration')
    v-bind('componentStylesConfig.apiKeys.checkAnimationEasing');
}

@keyframes check-scale {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Button transition for smooth color change */
.btn {
  transition: all
    v-bind('componentStylesConfig.apiKeys.buttonTransitionDuration') ease-out;
}

.btn:active {
  transform: scale(v-bind('componentStylesConfig.apiKeys.buttonActiveScale'));
}

/* Enhanced Empty State Styles */
.api-key-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1.5rem;
  background: linear-gradient(
    135deg,
    v-bind('componentStylesConfig.apiKeys.emptyStateGradientStart'),
    v-bind('componentStylesConfig.apiKeys.emptyStateGradientEnd')
  );
  border-radius: v-bind('componentStylesConfig.apiKeys.emptyStateBorderRadius');
  border: 1px solid v-bind('componentStylesConfig.apiKeys.emptyStateBorder');
}

.api-key-illustration {
  position: relative;
  width: v-bind('componentStylesConfig.apiKeys.emptyStateIllustrationWidth');
  height: v-bind('componentStylesConfig.apiKeys.emptyStateIllustrationHeight');
  margin-bottom: 1.5rem;
}

.api-key-bg-circle {
  position: absolute;
  inset: 0;
  background: v-bind('componentStylesConfig.apiKeys.emptyStateCircleBg');
  border-radius: 50%;
  opacity: 0.3;
}

.api-key-icon-wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.api-key-icon {
  width: v-bind('componentStylesConfig.apiKeys.emptyStateIconWidth');
  height: v-bind('componentStylesConfig.apiKeys.emptyStateIconHeight');
  color: v-bind('componentStylesConfig.apiKeys.emptyStateIconColor');
}

.api-key-path {
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
}

.api-key-float-dot {
  position: absolute;
  width: v-bind('componentStylesConfig.apiKeys.emptyStateDotSize');
  height: v-bind('componentStylesConfig.apiKeys.emptyStateDotSize');
  background: v-bind('componentStylesConfig.apiKeys.emptyStateDotColor');
  border-radius: 50%;
  opacity: 0.6;
}

.api-key-float-dot-1 {
  top: 20%;
  right: 15%;
  animation: api-key-float-1
    v-bind('`${animationConfig.apiKeys.pulseSlowDurationSec}s`') ease-in-out
    infinite;
}

.api-key-float-dot-2 {
  bottom: 25%;
  left: 10%;
  animation: api-key-float-2
    v-bind('`${animationConfig.apiKeys.floatDurationSec}s`') ease-in-out
    infinite;
}

.api-key-empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind('componentStylesConfig.apiKeys.emptyStateTitleColor');
  margin-bottom: 0.5rem;
}

.api-key-empty-description {
  font-size: 0.875rem;
  color: v-bind('componentStylesConfig.apiKeys.emptyStateDescColor');
  margin-bottom: 1.5rem;
  max-width: v-bind('componentStylesConfig.apiKeys.emptyStateDescMaxWidth');
}

.api-key-empty-cta {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
}

.api-key-empty-cta svg {
  width: v-bind('componentStylesConfig.apiKeys.emptyStateCtaIconWidth');
  height: v-bind('componentStylesConfig.apiKeys.emptyStateCtaIconHeight');
  margin-right: 0.5rem;
}

/* Animation Keyframes */
@keyframes api-key-float-1 {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.1);
  }
}

@keyframes api-key-float-2 {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(0.95);
  }
}

.animate-pulse-slow {
  animation: pulse-slow
    v-bind('`${animationConfig.apiKeys.pulseSlowDurationSec}s`') ease-in-out
    infinite;
}

.animate-bounce-subtle {
  animation: bounce-subtle
    v-bind('`${animationConfig.apiKeys.bounceSubtleDurationSec}s`') ease-in-out
    infinite;
}

.animate-draw {
  animation: draw v-bind('animationConfig.apiKeys.drawDurationSec') ease-out
    forwards;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.5;
  }
}

@keyframes bounce-subtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .animate-check-scale {
    animation: none;
  }

  .btn {
    transition: none;
  }

  .btn:active {
    transform: none;
  }

  .animate-pulse-slow,
  .animate-bounce-subtle,
  .animate-draw {
    animation: none;
  }

  .api-key-path {
    stroke-dasharray: none;
  }
}

/* Pallete: Spinner animation for loading state */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  /* Flexy hates hardcoded 1s! Using animationConfig.apiKeys.spinDurationSec */
  animation: spin v-bind('animationConfig.apiKeys.spinDurationSec + "s"') linear
    infinite;
}

/* Pallete: Disabled button state */
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* 🎨 Pallete's micro-UX: Particle burst celebration styles */
.api-key-particle-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  /* Flexy hates hardcoded z-index values! Use config instead */
  z-index: v-bind('zIndexScale.high[100]');
}

.api-key-particle {
  position: absolute;
  width: var(--particle-size);
  height: var(--particle-size);
  background: var(--particle-color);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(var(--particle-rotation));
  animation: api-key-particle-burst
    v-bind('animationConfig.copyParticles.durationMs + "ms"') ease-out forwards;
  box-shadow: 0 0 6px var(--particle-color);
}

@keyframes api-key-particle-burst {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(-50% + var(--particle-x)),
        calc(-50% + var(--particle-y))
      )
      scale(0);
    opacity: 0;
  }
}

/* Reduced motion: Disable particle animations */
@media (prefers-reduced-motion: reduce) {
  .api-key-particle-container {
    display: none;
  }
}

/* Frontend Engineer: Press and Hold Button Styles */
/* Consistent with WebhookManager.vue press-and-hold UX pattern */
.press-hold-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 5rem;
  transition: all v-bind('animationConfig.apiKeys.itemTransitionMs + "ms"')
    ease-out;
  overflow: hidden;
}

.press-hold-button.is-pressing {
  transform: scale(v-bind('animationConfig.pressAndHold.pressScale'));
}

.press-hold-button.is-complete {
  background-color: v-bind(
    'componentStylesConfig.apiKeys.buttonDangerHoverBg'
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
  /* Flexy hates hardcoded 300ms! Using animationConfig.apiKeys.progressRingTransitionMs */
  transition: stroke-dashoffset
    v-bind('animationConfig.apiKeys.progressRingTransitionMs + "ms"') linear;
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
</style>
