<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @after-enter="focusCloseButton"
    >
      <div
        v-if="isOpen"
        :class="[
          'fixed inset-0 flex items-center justify-center p-4',
          componentStylesConfig.keyboardShortcuts.zIndex,
        ]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div
          :class="[
            'absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity',
            componentStylesConfig.keyboardShortcuts.backdropDuration,
          ]"
          aria-hidden="true"
        />

        <!-- Modal -->
        <div
          ref="modalRef"
          :class="[
            'relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-200 overflow-hidden',
            componentStylesConfig.keyboardShortcuts.modalWidth,
          ]"
          role="document"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="[
                  'h-5 w-5',
                  componentColorsConfig.keyboardShortcuts.headerIcon,
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <h2
                id="shortcuts-title"
                class="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              ref="closeButtonRef"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              aria-label="Close keyboard shortcuts (press Escape)"
              @click="close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div
            :class="[
              'px-6 py-4 overflow-y-auto',
              componentStylesConfig.keyboardShortcuts.maxHeight,
            ]"
          >
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use these shortcuts to navigate faster and work more efficiently.
            </p>

            <div class="space-y-4">
              <!-- Search Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Search
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Focus search box</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      /
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Clear search / Close suggestions</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      Esc
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Navigate suggestions</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        ↑
                      </kbd>
                      <kbd
                        class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        ↓
                      </kbd>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Navigation Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Navigation
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Move to next focusable element</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      Tab
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Move to previous focusable element</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      Shift + Tab
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Close modals / menus</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      Esc
                    </kbd>
                  </li>
                </ul>
              </div>

              <!-- Filters Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Filters
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Undo clear filters</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        Ctrl
                      </kbd>
                      <span class="text-gray-400">+</span>
                      <kbd
                        class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        Z
                      </kbd>
                    </div>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Select/deselect filter option</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      Enter / Space
                    </kbd>
                  </li>
                </ul>
              </div>

              <!-- Quick Actions Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  Quick Actions
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">Open this help modal</span>
                    <kbd
                      class="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                    >
                      ?
                    </kbd>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700"
          >
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              Tip: Press
              <kbd
                class="px-1 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded"
              >?</kbd>
              anywhere to open this guide
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { componentStylesConfig } from '~/configs/component-styles.config'
import { componentColorsConfig } from '~/configs/component-colors.config'
// NodeListOf is a global DOM type, no need to import

const isOpen = ref(false)
const modalRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const lastFocusedElement = ref<HTMLElement | null>(null)

const open = () => {
  lastFocusedElement.value = document.activeElement as HTMLElement
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
  // Return focus to the element that had focus before opening
  nextTick(() => {
    lastFocusedElement.value?.focus()
  })
}

const focusCloseButton = () => {
  nextTick(() => {
    closeButtonRef.value?.focus()
  })
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Don't trigger if user is typing in an input, textarea, or select
  const target = event.target as HTMLElement
  const isInputElement =
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable

  // Open modal with ? key (but not when typing in inputs)
  if (
    event.key === '?' &&
    !event.ctrlKey &&
    !event.metaKey &&
    !isInputElement
  ) {
    event.preventDefault()
    if (!isOpen.value) {
      open()
    }
  }

  // Close modal with Escape
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
  }

  // Trap focus within modal when open
  if (isOpen.value && event.key === 'Tab') {
    const focusableElements = Array.from(
      modalRef.value?.querySelectorAll(
        'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ) as HTMLElement[]

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

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

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// Expose open method for programmatic access
defineExpose({
  open,
  close,
})
</script>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative.w-full,
.modal-leave-active .relative.w-full {
  transition: transform 0.2s ease-out;
}

.modal-enter-from .relative.w-full,
.modal-leave-to .relative.w-full {
  transform: scale(0.95);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .relative.w-full,
  .modal-leave-active .relative.w-full {
    transition: none;
  }

  .modal-enter-from .relative.w-full,
  .modal-leave-to .relative.w-full {
    transform: none;
  }
}
</style>
