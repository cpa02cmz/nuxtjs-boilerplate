<template>
  <div class="relative">
    <!-- Copied tooltip - appears at click position -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-75 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-75 -translate-y-1"
    >
      <div
        v-if="showCopiedTooltip"
        class="copied-tooltip fixed z-50 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
        :style="copiedTooltipStyle"
        role="status"
        aria-live="polite"
      >
        <span class="flex items-center gap-1.5">
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
          Copied!
        </span>
        <!-- Arrow pointing down -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
          <div class="w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      </div>
    </Transition>

    <!-- Share button -->
    <button
      ref="shareButtonRef"
      :aria-label="copySuccess ? 'Link copied!' : `Share ${title}`"
      :aria-expanded="showShareMenu"
      :class="[
        'p-2 rounded-full transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 relative overflow-hidden',
        copySuccess
          ? 'bg-green-100 text-green-600 hover:bg-green-200'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      ]"
      @click.stop="toggleShareMenu"
    >
      <!-- Share icon - shown by default -->
      <svg
        v-if="!copySuccess"
        xmlns="http://www.w3.org/2000/svg"
        :class="[
          'h-5 w-5 transition-transform duration-200 ease-out',
          showShareMenu && 'rotate-90',
        ]"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
        />
      </svg>
      <!-- Checkmark icon - shown briefly after successful copy -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 animate-check-bounce"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Share menu dropdown with entrance animation -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="showShareMenu"
        ref="shareMenuRef"
        class="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        :class="positionClass"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="share-menu"
        @keydown="handleMenuKeydown"
      >
        <div class="py-1" role="none">
          <!-- Twitter -->
          <a
            :href="twitterUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-blue-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
              />
            </svg>
            Share on Twitter
          </a>

          <!-- LinkedIn -->
          <a
            :href="linkedinUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-blue-700"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            Share on LinkedIn
          </a>

          <!-- Facebook -->
          <a
            :href="facebookUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            Share on Facebook
          </a>

          <!-- Reddit -->
          <a
            :href="redditUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-orange-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"
              />
            </svg>
            Share on Reddit
          </a>

          <!-- Copy Link -->
          <button
            ref="copyButtonRef"
            class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-out relative overflow-hidden"
            :class="{
              'bg-green-50 text-green-700': copySuccess,
              'scale-[1.02]': copySuccess,
            }"
            role="menuitem"
            :aria-label="
              copySuccess ? 'Link copied!' : 'Copy link to clipboard'
            "
            @click="copyToClipboard($event)"
            @keydown="handleMenuKeydown"
          >
            <svg
              v-if="!copySuccess"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path
                d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2 text-green-600"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path class="checkmark-path" d="M4 10l4 4 8-8" />
            </svg>
            {{ copySuccess ? 'Copied!' : 'Copy link' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  type Ref,
} from 'vue'
import { generateResourceShareUrls } from '~/utils/shareUtils'
import logger from '~/utils/logger'
import { animationConfig } from '~/configs/animation.config'
import { patternsConfig } from '~/configs/patterns.config'
import { hapticSuccess, hapticError } from '~/utils/hapticFeedback'
import { useRipple } from '~/composables/useRipple'

interface Props {
  title?: string
  description?: string
  url?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  url: '',
})

const showShareMenu = ref(false)
const shareButtonRef = ref<HTMLButtonElement | null>(null)
const shareMenuRef = ref<HTMLElement | null>(null)
const copyButtonRef = ref<HTMLButtonElement | null>(null)
const copySuccess = ref(false)
let copySuccessTimeout: ReturnType<typeof setTimeout> | null = null

// Copied tooltip state for micro-UX feedback
const showCopiedTooltip = ref(false)
const copiedTooltipPosition = ref({ x: 0, y: 0 })
let copiedTooltipTimeout: ReturnType<typeof setTimeout> | null = null

// Computed style for the copied tooltip position
const copiedTooltipStyle = computed(() => ({
  left: `${copiedTooltipPosition.value.x}px`,
  top: `${copiedTooltipPosition.value.y - 40}px`, // Position above the click
  transform: 'translateX(-50%)',
}))

// Initialize ripple effects for tactile feedback - Palette's micro-UX touch!
const { createRipple: createShareRipple } = useRipple(
  shareButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: 'rgba(59, 130, 246, 0.3)', // Blue ripple for share
    duration: 500,
  }
)

const { createRipple: createCopyRipple } = useRipple(
  copyButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: 'rgba(34, 197, 94, 0.3)', // Green ripple for copy
    duration: 400,
  }
)

// Calculate position class based on available space
const positionClass = computed(() => {
  // Default to positioning below button
  return 'left-0 origin-top-right'
})

// Get all focusable menu items
const menuItems = computed(() => {
  if (!shareMenuRef.value) return []
  return Array.from(
    shareMenuRef.value.querySelectorAll<HTMLElement>(
      'a[role="menuitem"], button[role="menuitem"]'
    )
  )
})

// Keyboard navigation for menu
const handleMenuKeydown = (event: KeyboardEvent) => {
  const items = menuItems.value
  if (items.length === 0) return

  const currentIndex = items.indexOf(document.activeElement as HTMLElement)

  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault()
      const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1
      items[nextIndex]?.focus()
      break
    }

    case 'ArrowUp': {
      event.preventDefault()
      const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1
      items[prevIndex]?.focus()
      break
    }

    case 'Home':
      event.preventDefault()
      items[0]?.focus()
      break

    case 'End':
      event.preventDefault()
      items[items.length - 1]?.focus()
      break

    case 'Escape':
      event.preventDefault()
      showShareMenu.value = false
      shareButtonRef.value?.focus()
      break
  }
}

// Generate share URLs with UTM parameters
const shareUrls = computed(() => {
  return generateResourceShareUrls(props.url, props.title, props.description)
})

// URLs for different social platforms
const twitterUrl = computed(() => shareUrls.value.twitter)
const linkedinUrl = computed(() => shareUrls.value.linkedin)
const facebookUrl = computed(() => shareUrls.value.facebook)
const redditUrl = computed(() => shareUrls.value.reddit)

// Toggle the share menu with ripple feedback
const toggleShareMenu = async (event: MouseEvent) => {
  // Create ripple effect first - Palette's micro-UX touch!
  createShareRipple(event)

  showShareMenu.value = !showShareMenu.value

  if (showShareMenu.value) {
    await nextTick()
    menuItems.value[0]?.focus()
  }
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  // Don't process if menu is already closed
  if (!showShareMenu.value) return

  if (
    shareButtonRef.value &&
    !shareButtonRef.value.contains(event.target as Node) &&
    shareMenuRef.value &&
    !shareMenuRef.value.contains(event.target as Node)
  ) {
    showShareMenu.value = false
  }
}

// Watch for menu visibility changes to manage focus
watch(showShareMenu, async isVisible => {
  if (isVisible) {
    await nextTick()
    menuItems.value[0]?.focus()
  } else {
    shareButtonRef.value?.focus()
  }
})

// Helper to show toast notifications
const showToast = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('show-toast', {
        detail: { message, type },
      })
    )
  }
}

// Copy URL to clipboard with ripple feedback
const copyToClipboard = async (event: MouseEvent) => {
  // Store click position for tooltip
  copiedTooltipPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }
  // Create ripple effect first - Palette's micro-UX touch!
  createCopyRipple(event)

  try {
    await navigator.clipboard.writeText(props.url)
    showCopySuccess()
  } catch {
    // Fallback for older browsers that don't support Clipboard API
    try {
      // Try to use the deprecated execCommand as a last resort
      const textArea = document.createElement('textarea')
      textArea.value = props.url
      // Avoid scrolling to bottom
      textArea.setAttribute('readonly', '')
      textArea.style.cssText = `
         position: absolute;
         left: -9999px;
         top: -9999px;
         opacity: 0;
         pointer-events: none;
        `
      document.body.appendChild(textArea)
      textArea.select()
      // Flexy hates hardcoded values! Using config for selection range.
      textArea.setSelectionRange(0, patternsConfig.clipboard.selectionRangeMax) // For mobile devices
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (!successful) {
        throw new Error('execCommand copy failed')
      }
      showCopySuccess()
    } catch (fallbackErr) {
      logger.error('Failed to copy to clipboard:', fallbackErr)
      showToast('Failed to copy link', 'error')

      // Haptic feedback for failed copy
      hapticError()

      showShareMenu.value = false
      await nextTick()
      shareButtonRef.value?.focus()
    }
  }
}

// Show copy success feedback
const showCopySuccess = async () => {
  copySuccess.value = true
  showToast('Link copied to clipboard!', 'success')

  // Haptic feedback for successful copy
  hapticSuccess()

  // Show the copied tooltip at cursor position for immediate feedback
  showCopiedTooltip.value = true

  // Clear any existing tooltip timeout
  if (copiedTooltipTimeout) {
    clearTimeout(copiedTooltipTimeout)
  }

  // Hide tooltip after animation
  copiedTooltipTimeout = setTimeout(() => {
    showCopiedTooltip.value = false
  }, animationConfig.copySuccess.tooltipDurationMs || 1500)

  // Close the menu immediately to show button feedback
  showShareMenu.value = false

  // Clear any existing timeout
  if (copySuccessTimeout) {
    clearTimeout(copySuccessTimeout)
  }

  // Reset after configured delay to clear the button success state - Flexy uses config!
  copySuccessTimeout = setTimeout(async () => {
    copySuccess.value = false
  }, animationConfig.copySuccess.resetDelayMs)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (copiedTooltipTimeout) {
    clearTimeout(copiedTooltipTimeout)
  }
})
</script>

<style scoped>
/* Animated checkmark path for copy feedback */
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

/* Copied tooltip styles - Palette's micro-UX enhancement */
.copied-tooltip {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* Reduced motion support for copied tooltip */
@media (prefers-reduced-motion: reduce) {
  .checkmark-path {
    animation: none;
    stroke-dashoffset: 0;
  }
  .transition-transform {
    transition: none !important;
    animation: none !important;
  }

  .copied-tooltip {
    transition: opacity 0.15s ease-out !important;
    transform: translateX(-50%) !important;
  }
}
</style>
