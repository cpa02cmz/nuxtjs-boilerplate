<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">
          {{ contentConfig.apiKeys.title }}
        </h1>

        <!-- Error display -->
        <div
          v-if="error"
          class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {{ error }}
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            {{ contentConfig.apiKeys.labels.yourKeys }}
          </h2>
          <p class="text-gray-600 mb-6">
            {{ contentConfig.apiKeys.description }}
          </p>

          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              v-model="newKeyName"
              type="text"
              :placeholder="contentConfig.apiKeys.placeholders.keyName"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <button
              :disabled="!newKeyName.trim()"
              class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="createApiKey"
            >
              {{ contentConfig.apiKeys.buttons.generate }}
            </button>
          </div>
        </div>

        <div
          v-if="apiKeys.length > 0"
          class="mb-8"
        >
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            {{ contentConfig.apiKeys.labels.yourKeys }}
          </h2>
          <div class="space-y-4">
            <div
              v-for="key in apiKeys"
              :key="key.id"
              class="border border-gray-200 rounded-md p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-800">
                    {{ key.name }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ contentConfig.apiKeys.labels.id }} {{ key.id }}
                  </p>
                  <p class="text-sm text-gray-600">
                    {{ contentConfig.apiKeys.labels.created }}
                    {{ formatDate(key.createdAt) }}
                  </p>
                  <p
                    v-if="key.expiresAt"
                    class="text-sm text-gray-600"
                  >
                    {{ contentConfig.apiKeys.labels.expires }}
                    {{ formatDate(key.expiresAt) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    class="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                    @click="revokeApiKey(key.id)"
                  >
                    {{ contentConfig.apiKeys.buttons.revoke }}
                  </button>
                </div>
              </div>
              <div
                v-if="key.showFullKey"
                class="mt-3 p-3 bg-gray-100 rounded-md"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="font-mono text-sm break-all flex-1">
                    API Key: {{ key.key }}
                  </p>
                  <!-- Copy Button - Palette's micro-UX enhancement! -->
                  <Tooltip
                    :content="getCopyTooltip(key.id)"
                    position="top"
                    :delay="animationConfig.tooltip.showDelayMs"
                  >
                    <button
                      :ref="
                        (el: unknown) =>
                          setCopyButtonRef(
                            key.id,
                            el as HTMLButtonElement | null
                          )
                      "
                      :class="[
                        'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 relative overflow-hidden',
                        copyStates[key.id]?.isCopied
                          ? 'bg-green-100 text-green-600 hover:bg-green-200 focus:ring-green-500'
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 focus:ring-indigo-500 border border-gray-300',
                      ]"
                      :aria-label="getCopyAriaLabel(key.id)"
                      @click="handleCopyKey(key)"
                    >
                      <!-- Copy Icon -->
                      <svg
                        v-if="!copyStates[key.id]?.isCopied"
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          :d="iconsConfig.paths.copy"
                        />
                      </svg>
                      <!-- Checkmark Icon with animation -->
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-4 h-4 animate-check-pop"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M5 13l4 4L19 7"
                          class="checkmark-path"
                        />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Make sure to copy this key now. You won't be able to see it
                  again.
                </p>
              </div>
              <div class="mt-2">
                <button
                  class="text-sm text-indigo-600 hover:text-indigo-800"
                  @click="toggleKeyVisibility(key)"
                >
                  {{ key.showFullKey ? 'Hide Key' : 'Show Key' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-center py-12"
        >
          <p class="text-gray-600">
            You don't have any API keys yet.
          </p>
          <p class="text-gray-500 text-sm mt-2">
            Generate your first API key to start using the API.
          </p>
        </div>

        <div class="mt-12">
          <h2 class="text-lg font-semibold text-gray-700 mb-4">
            API Documentation
          </h2>
          <p class="text-gray-600 mb-4">
            For detailed information about available endpoints, request/response
            formats, and authentication requirements, visit our interactive API
            documentation.
          </p>
          <a
            href="/api-docs"
            target="_blank"
            class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View API Documentation
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useApiKeysPage } from '~/composables/useApiKeysPage'
import { copyToClipboard } from '~/utils/clipboard'
import { useRipple } from '~/composables/useRipple'
import { animationConfig } from '~/configs/animation.config'
import { iconsConfig } from '~/configs/icons.config'
import { contentConfig } from '~/configs/content.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'
import Tooltip from '~/components/Tooltip.vue'
import type { ApiKeyDisplay } from '~/composables/useApiKeysPage'

const {
  apiKeys,
  newKeyName,
  error,
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
  toggleKeyVisibility,
  formatDate,
} = useApiKeysPage()

// Track copy states for each API key - Palette's micro-UX enhancement!
interface CopyState {
  isCopied: boolean
  timeoutId: ReturnType<typeof setTimeout> | null
}

const copyStates = reactive<Record<string, CopyState>>({})
const copyButtonRefs = reactive<Record<string, HTMLButtonElement | null>>({})

// Set copy button ref for ripple effect
const setCopyButtonRef = (keyId: string, el: HTMLButtonElement | null) => {
  if (el) {
    copyButtonRefs[keyId] = el
  }
}

// Get copy button tooltip text
const getCopyTooltip = (keyId: string): string => {
  return copyStates[keyId]?.isCopied
    ? contentConfig.messages.clipboard.copied
    : contentConfig.messages.clipboard.copy
}

// Get ARIA label for copy button
const getCopyAriaLabel = (keyId: string): string => {
  return copyStates[keyId]?.isCopied
    ? contentConfig.aria.clipboard.copied
    : contentConfig.aria.clipboard.copy
}

// Handle copy key with micro-interactions - Palette's delightful UX touch!
const handleCopyKey = async (key: ApiKeyDisplay) => {
  if (!key.key) return

  // Create ripple effect for tactile feedback
  const buttonEl = copyButtonRefs[key.id]
  if (buttonEl) {
    const { createRipple } = useRipple(ref(buttonEl), {
      color: animationConfig.ripple.successColor,
      duration: animationConfig.button.feedbackDurationMs,
    })
    createRipple({ clientX: 0, clientY: 0 } as MouseEvent)
  }

  try {
    const result = await copyToClipboard(key.key)

    if (result.success) {
      // Clear any existing timeout for this key
      if (copyStates[key.id]?.timeoutId) {
        clearTimeout(copyStates[key.id].timeoutId!)
      }

      // Set copied state with animation
      copyStates[key.id] = {
        isCopied: true,
        timeoutId: null,
      }

      // Haptic feedback for successful copy
      hapticSuccess()

      // Show toast notification for better UX
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-toast', {
            detail: {
              message: `"${key.name}" API key copied to clipboard`,
              type: 'success',
            },
          })
        )
      }

      // Reset after configured delay
      const timeoutId = setTimeout(() => {
        copyStates[key.id] = {
          isCopied: false,
          timeoutId: null,
        }
      }, animationConfig.copySuccess.resetDelayMs)

      copyStates[key.id].timeoutId = timeoutId
    } else {
      throw new Error(result.error || 'Copy failed')
    }
  } catch {
    // Haptic feedback for failed copy
    hapticError()

    // Show error toast
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: contentConfig.messages.clipboard.copyFailed,
            type: 'error',
          },
        })
      )
    }
  }
}

// Cleanup timeouts on unmount
onUnmounted(() => {
  Object.values(copyStates).forEach(state => {
    if (state.timeoutId) {
      clearTimeout(state.timeoutId)
    }
  })
})

useHead({
  title: 'API Keys - Free Stuff on the Internet',
  meta: [
    {
      name: 'description',
      content: 'Generate and manage API keys to access the API',
    },
  ],
})

onMounted(() => {
  fetchApiKeys()
})
</script>

<style scoped>
/* Checkmark animation - Palette's micro-UX delight! */
.checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-check 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

/* Pop animation for checkmark icon */
.animate-check-pop {
  animation: check-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes check-pop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .checkmark-path {
    animation: none;
    stroke-dashoffset: 0;
  }

  .animate-check-pop {
    animation: none;
  }
}
</style>
