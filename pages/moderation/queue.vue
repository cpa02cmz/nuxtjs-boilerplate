<template>
  <div class="moderation-queue-page">
    <h1>Moderation Queue</h1>
    <ReviewQueue />

    <!-- Pallete's micro-UX enhancement: Keyboard Shortcuts Help Modal 🎨
         Shows helpful keyboard shortcuts when user presses '?' key -->
    <Teleport to="body">
      <Transition
        :enter-active-class="`transition-all ${animationConfig.tailwindDurations.normal} ease-out`"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        :leave-active-class="`transition-all ${animationConfig.tailwindDurations.quick} ease-in`"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showShortcutsModal"
          class="shortcuts-modal-overlay"
          @click="closeShortcutsModal"
        >
          <div
            ref="shortcutsModalRef"
            class="shortcuts-modal"
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-modal="true"
            @keydown.esc="closeShortcutsModal"
            @click.stop
          >
            <div class="shortcuts-modal__header">
              <h2 id="shortcuts-title" class="shortcuts-modal__title">
                Keyboard Shortcuts
              </h2>
              <button
                class="shortcuts-modal__close"
                aria-label="Close keyboard shortcuts help"
                @click="closeShortcutsModal"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <div class="shortcuts-modal__content">
              <div
                v-for="(group, index) in shortcutGroups"
                :key="index"
                class="shortcuts-group"
              >
                <h3 class="shortcuts-group__title">
                  {{ group.title }}
                </h3>
                <ul class="shortcuts-group__list">
                  <li
                    v-for="shortcut in group.shortcuts"
                    :key="shortcut.key"
                    class="shortcuts-item"
                  >
                    <kbd class="shortcuts-item__key">{{ shortcut.key }}</kbd>
                    <span class="shortcuts-item__description">{{
                      shortcut.description
                    }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="shortcuts-modal__footer">
              <p class="shortcuts-modal__hint">
                Press <kbd class="shortcuts-modal__kbd">?</kbd> anytime to show
                this help
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Keyboard shortcut hint indicator -->
    <div
      v-if="showShortcutHint && !showShortcutsModal"
      class="keyboard-hint-indicator"
      role="status"
      aria-live="polite"
    >
      <span class="keyboard-hint-indicator__text">
        Press <kbd class="keyboard-hint-indicator__kbd">?</kbd> for keyboard
        shortcuts
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { uiConfig } from '~/configs/ui.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { uiTimingConfig } from '~/configs/ui-timing.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
import { zIndexScale } from '~/configs/z-index.config'

definePageMeta({
  layout: 'default',
  middleware: ['auth'], // In a real app, this would require moderation permissions
})

useHead({
  title: 'Moderation Queue - Resource Directory',
  meta: [
    {
      name: 'description',
      content: contentConfig.moderation.queue.description,
    },
  ],
})

// Pallete's micro-UX enhancement: Keyboard shortcuts modal state
const showShortcutsModal = ref(false)
const showShortcutHint = ref(false)
const shortcutsModalRef = ref<HTMLElement | null>(null)
let hintTimeout: ReturnType<typeof setTimeout> | null = null

// Keyboard shortcut groups
const shortcutGroups = [
  {
    title: 'Navigation',
    shortcuts: [
      { key: '↑ / ↓', description: 'Navigate between items' },
      { key: 'Enter', description: 'Open selected item' },
      { key: 'Esc', description: 'Close modal or cancel action' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { key: 'A', description: 'Approve selected item' },
      { key: 'R', description: 'Reject selected item' },
      { key: 'Space', description: 'Preview item details' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { key: '?', description: 'Show/hide keyboard shortcuts' },
      { key: '/', description: 'Focus search box' },
      { key: 'Cmd/Ctrl + K', description: 'Quick action menu' },
    ],
  },
]

// Open shortcuts modal
const openShortcutsModal = () => {
  showShortcutsModal.value = true
  // Focus the modal for accessibility - Flexy hates hardcoded 100!
  setTimeout(() => {
    shortcutsModalRef.value?.focus()
  }, uiTimingConfig.modalFocus.delayMs)
}

// Close shortcuts modal
const closeShortcutsModal = () => {
  showShortcutsModal.value = false
}

// Handle keyboard events
const handleKeyDown = (event: KeyboardEvent) => {
  // Don't trigger if user is typing in an input
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    (event.target instanceof HTMLElement && event.target.isContentEditable)
  ) {
    return
  }

  // '?' key opens shortcuts modal
  if (event.key === '?' && !showShortcutsModal.value) {
    event.preventDefault()
    openShortcutsModal()
  }

  // Esc closes shortcuts modal
  if (event.key === 'Escape' && showShortcutsModal.value) {
    event.preventDefault()
    closeShortcutsModal()
  }
}

// Show hint after a delay
const showHintWithDelay = () => {
  // Clear existing timeout
  if (hintTimeout) {
    clearTimeout(hintTimeout)
  }

  // Show hint after delay (don't show immediately to avoid being annoying)
  hintTimeout = setTimeout(() => {
    if (!showShortcutsModal.value) {
      showShortcutHint.value = true
    }
  }, animationConfig.keyboardShortcuts.hintDelayMs || 3000)
}

// Lifecycle hooks
onMounted(() => {
  // Add keyboard listener
  document.addEventListener('keydown', handleKeyDown)

  // Show hint after delay
  showHintWithDelay()
})

onUnmounted(() => {
  // Remove keyboard listener
  document.removeEventListener('keydown', handleKeyDown)

  // Clear timeout
  if (hintTimeout) {
    clearTimeout(hintTimeout)
  }
})
</script>

<style scoped>
/* Flexy hates hardcoded values! Using configurable container width from uiConfig */
.moderation-queue-page {
  max-width: v-bind('uiConfig.containers.admin');
  margin: 0 auto;
  padding: v-bind('`${uiConfig.layout.spacing.lg}rem`');
}

/* Pallete's micro-UX enhancement: Keyboard Shortcuts Modal Styles 🎨 */
/* Flexy hates hardcoded rgba values! Using componentColorsConfig.moderationQueue */
.shortcuts-modal-overlay {
  position: fixed;
  inset: 0;
  background: v-bind('componentColorsConfig.moderationQueue.modalOverlay');
  backdrop-filter: blur(4px);
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.medium[50]');
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.shortcuts-modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow:
    0 25px 50px -12px
      v-bind('`rgba(${componentColorsConfig.moderationQueue.modalShadow})`'),
    0 0 0 1px v-bind('componentColorsConfig.moderationQueue.modalBorder');
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  outline: none;
}

.shortcuts-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid
    v-bind('componentColorsConfig.moderationQueue.borderLight');
}

.shortcuts-modal__title {
  font-size: 1.125rem;
  font-weight: 600;
  /* Flexy hates hardcoded #111827! Using componentColorsConfig */
  color: v-bind('componentColorsConfig.moderationQueue.textHeading');
  margin: 0;
}

.shortcuts-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  /* Flexy hates hardcoded #6b7280! Using componentColorsConfig */
  color: v-bind('componentColorsConfig.moderationQueue.textMuted');
  background: transparent;
  border: none;
  cursor: pointer;
  /* Flexy hates hardcoded 150ms! Using animationConfig.moderationQueue.transitionDurationSec */
  transition: all
    v-bind('animationConfig.moderationQueue.transitionDurationSec') ease-out;
}

.shortcuts-modal__close:hover {
  /* Flexy hates hardcoded #f3f4f6! Using componentColorsConfig */
  background: v-bind('componentColorsConfig.moderationQueue.bgLighter');
  /* Flexy hates hardcoded #374151! Using componentColorsConfig */
  color: v-bind('componentColorsConfig.moderationQueue.textSecondary');
}

.shortcuts-modal__close:focus-visible {
  /* Flexy hates hardcoded #3b82f6! Using componentColorsConfig */
  outline: 2px solid v-bind('componentColorsConfig.moderationQueue.primary');
  outline-offset: 2px;
}

.shortcuts-modal__content {
  padding: 1.5rem;
}

.shortcuts-group {
  margin-bottom: 1.5rem;
}

.shortcuts-group:last-child {
  margin-bottom: 0;
}

.shortcuts-group__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  /* Flexy hates hardcoded #6b7280! Using componentColorsConfig */
  color: v-bind('componentColorsConfig.moderationQueue.textMuted');
  margin: 0 0 0.75rem 0;
}

.shortcuts-group__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.shortcuts-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  /* Flexy hates hardcoded 150ms! Using animationConfig.moderationQueue.transitionDurationSec */
  transition: background-color
    v-bind('animationConfig.moderationQueue.transitionDurationSec') ease-out;
}

/* Flexy hates hardcoded #f9fafb! Using componentColorsConfig */
.shortcuts-item:hover {
  background: v-bind('componentColorsConfig.moderationQueue.bgLight');
}

.shortcuts-item__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3rem;
  padding: 0.25rem 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.shortcuts-item__description {
  font-size: 0.875rem;
  color: #4b5563;
  flex: 1;
}

.shortcuts-modal__footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 0.75rem 0.75rem;
}

.shortcuts-modal__hint {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.shortcuts-modal__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.375rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.625rem;
  font-weight: 600;
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  margin: 0 0.25rem;
}

/* Keyboard hint indicator */
.keyboard-hint-indicator {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  /* Flexy hates hardcoded z-index! Using zIndexScale */
  z-index: v-bind('zIndexScale.medium[40]');
  animation: hint-slide-in
    v-bind('animationConfig.moderationQueue.hintSlideInDurationSec') ease-out;
}

@keyframes hint-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.keyboard-hint-indicator__text {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
}

.keyboard-hint-indicator__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.375rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.625rem;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .shortcuts-modal {
    background: #1f2937;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  .shortcuts-modal__header {
    border-color: #374151;
  }

  .shortcuts-modal__title {
    color: #f9fafb;
  }

  .shortcuts-modal__close {
    color: #9ca3af;
  }

  .shortcuts-modal__close:hover {
    background: #374151;
    color: #e5e7eb;
  }

  .shortcuts-group__title {
    color: #9ca3af;
  }

  .shortcuts-item:hover {
    background: #374151;
  }

  .shortcuts-item__key {
    color: #e5e7eb;
    background: linear-gradient(180deg, #4b5563 0%, #374151 100%);
    border-color: #4b5563;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.1) inset,
      0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .shortcuts-item__description {
    color: #d1d5db;
  }

  .shortcuts-modal__footer {
    background: #111827;
    border-color: #374151;
  }

  .shortcuts-modal__hint {
    color: #9ca3af;
  }

  .shortcuts-modal__kbd {
    color: #e5e7eb;
    background: #374151;
    border-color: #4b5563;
  }

  .keyboard-hint-indicator__text {
    color: #9ca3af;
    background: #1f2937;
    border-color: #374151;
  }

  .keyboard-hint-indicator__kbd {
    color: #e5e7eb;
    background: #374151;
    border-color: #4b5563;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .keyboard-hint-indicator {
    animation: none;
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .shortcuts-modal {
    max-width: 100%;
    margin: 1rem;
  }

  .shortcuts-modal__content {
    padding: 1rem;
  }

  .keyboard-hint-indicator {
    bottom: 0.5rem;
    right: 0.5rem;
  }
}
</style>
