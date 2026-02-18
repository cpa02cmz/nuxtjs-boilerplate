<template>
  <Teleport to="body">
    <Transition
      name="modal"
      @after-enter="focusCloseButton"
    >
      <div
        v-if="isOpen"
        ref="modalContainerRef"
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
            // Flexy hates hardcoded duration-200! Using animationConfig.tailwindDurations
            `relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all ${animationConfig.tailwindDurations.normal} overflow-hidden`,
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
                {{ config.title }}
              </h2>
            </div>
            <button
              ref="closeButtonRef"
              :class="`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${animationConfig.tailwindDurations.normal}`"
              :aria-label="config.aria.close"
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
              {{ config.description }}
            </p>

            <div class="space-y-4">
              <!-- Search Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  {{ config.sections.search }}
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.focusSearch
                    }}</span>
                    <kbd
                      :class="[
                        // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                        `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                        isKeyPressed('/') &&
                          'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                      ]"
                    >
                      /
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.clearSearch
                    }}</span>
                    <kbd
                      :class="[
                        // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                        `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                        isKeyPressed('Esc') &&
                          'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                      ]"
                    >
                      Esc
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.navigate
                    }}</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('↑') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        ↑
                      </kbd>
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('↓') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
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
                  {{ config.sections.navigation }}
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.nextFocus
                    }}</span>
                    <kbd
                      :class="[
                        // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                        `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                        isKeyPressed('Tab') &&
                          'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                      ]"
                    >
                      Tab
                    </kbd>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.prevFocus
                    }}</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('Shift') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Shift
                      </kbd>
                      <span class="text-gray-400">+</span>
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('Tab') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Tab
                      </kbd>
                    </div>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.closeModal
                    }}</span>
                    <kbd
                      :class="[
                        // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                        `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                        isKeyPressed('Esc') &&
                          'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                      ]"
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
                  {{ config.sections.filters }}
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.undoFilters
                    }}</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('Ctrl') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Ctrl
                      </kbd>
                      <span class="text-gray-400">+</span>
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          (isKeyPressed('z') || isKeyPressed('Z')) &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Z
                      </kbd>
                    </div>
                  </li>
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.selectFilter
                    }}</span>
                    <div class="flex items-center gap-1">
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('Enter') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Enter
                      </kbd>
                      <span class="text-gray-400">/</span>
                      <kbd
                        :class="[
                          // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                          `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                          isKeyPressed('Space') &&
                            'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                        ]"
                      >
                        Space
                      </kbd>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Quick Actions Section -->
              <div>
                <h3
                  class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2"
                >
                  {{ config.sections.quickActions }}
                </h3>
                <ul class="space-y-2">
                  <li
                    class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{
                      config.shortcuts.openHelp
                    }}</span>
                    <kbd
                      :class="[
                        // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                        `px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                        isKeyPressed('?') &&
                          'kbd-pressed scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                      ]"
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
                :class="[
                  // Flexy hates hardcoded duration-100! Using animationConfig.tailwindDurations
                  `px-1 py-0.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded transition-all ${animationConfig.tailwindDurations.fast}`,
                  isKeyPressed('?') &&
                    'scale-95 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-inner',
                ]"
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
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { hapticLight } from '~/utils/hapticFeedback'

// NodeListOf is a global DOM type, no need to import

const config = contentConfig.keyboardShortcuts

const isOpen = ref(false)
const modalRef = ref<HTMLElement | null>(null)
const modalContainerRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const lastFocusedElement = ref<HTMLElement | null>(null)

// Palette's micro-UX enhancement: Track currently pressed keys for live visual feedback
const pressedKeys = ref<Set<string>>(new Set())
const prefersReducedMotion = ref(false)

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get normalized key identifier for matching
const normalizeKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    Spacebar: 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    Escape: 'Esc',
  }
  return keyMap[key] || key
}

// Handle key down for visual feedback
const handleKeyDownVisual = (event: KeyboardEvent) => {
  if (!isOpen.value || prefersReducedMotion.value) return

  const normalizedKey = normalizeKey(event.key)
  pressedKeys.value.add(normalizedKey)

  // Handle modifier keys
  if (event.ctrlKey) pressedKeys.value.add('Ctrl')
  if (event.shiftKey) pressedKeys.value.add('Shift')
  if (event.metaKey) pressedKeys.value.add('Cmd')
}

// Handle key up for visual feedback
const handleKeyUpVisual = (event: KeyboardEvent) => {
  if (!isOpen.value) return

  const normalizedKey = normalizeKey(event.key)
  pressedKeys.value.delete(normalizedKey)

  // Handle modifier keys
  if (!event.ctrlKey) pressedKeys.value.delete('Ctrl')
  if (!event.shiftKey) pressedKeys.value.delete('Shift')
  if (!event.metaKey) pressedKeys.value.delete('Cmd')
}

// Check if a specific key is currently pressed (for template use)
const isKeyPressed = (key: string): boolean => {
  return pressedKeys.value.has(key)
}

const open = () => {
  lastFocusedElement.value = document.activeElement as HTMLElement
  isOpen.value = true
  document.body.style.overflow = 'hidden'
  // Check reduced motion preference
  prefersReducedMotion.value = checkReducedMotion()
  // Palette's micro-UX touch: Haptic feedback when opening modal
  hapticLight()
}

const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
  // Palette's micro-UX touch: Haptic feedback when closing modal
  hapticLight()
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
  // Palette's micro-UX enhancement: Visual feedback for key presses
  handleKeyDownVisual(event)

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
  document.addEventListener('keyup', handleKeyUpVisual)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('keyup', handleKeyUpVisual)
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
  transition: opacity v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative.w-full,
.modal-leave-active .relative.w-full {
  transition: transform v-bind('animationConfig.cssTransitions.normalSec')
    ease-out;
}

.modal-enter-from .relative.w-full,
.modal-leave-to .relative.w-full {
  transform: scale(0.95);
}

/* Palette's micro-UX enhancement: Key press animation for kbd elements */
@keyframes kbd-press {
  0% {
    transform: scale(1);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  50% {
    transform: scale(0.92);
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: scale(0.95);
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  }
}

.kbd-pressed {
  animation: kbd-press v-bind('animationConfig.cssTransitions.fastSec') ease-out
    forwards;
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

  /* Disable key press animations for reduced motion */
  .kbd-pressed {
    animation: none;
    transform: scale(0.95);
  }
}
</style>
