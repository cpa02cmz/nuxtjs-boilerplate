<template>
  <div class="relative">
    <!-- Copied tooltip - appears at click position for delightful micro-UX feedback -->
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
          {{ contentConfig.messages.clipboard.copied }}
        </span>
        <!-- Arrow pointing down -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5">
          <div class="w-2 h-2 bg-gray-900 transform rotate-45" />
        </div>
      </div>
    </Transition>

    <!-- Share button -->
    <button
      ref="triggerRef"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      :aria-label="
        isOpen
          ? contentConfig.share.ariaLabels.close
          : contentConfig.share.ariaLabels.share
      "
      :class="[
        shareButtonClasses,
        'relative overflow-hidden',
        isButtonPressed && !prefersReducedMotion && 'scale-95',
        isOpen && 'is-open',
      ]"
      @click="toggleDropdownWithRipple"
      @keydown="handleButtonKeydown"
      @mousedown="isButtonPressed = true"
      @mouseup="isButtonPressed = false"
      @mouseleave="isButtonPressed = false"
      @touchstart="isButtonPressed = true"
      @touchend="isButtonPressed = false"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        :class="socialConfig.platformStyles.shareButton.text"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    </button>

    <!-- Dropdown menu with enhanced animations -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :class="dropdownContainerClasses"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="triggerRef?.id || 'share-button'"
        @keydown="handleMenuKeydown"
      >
        <div class="py-1">
          <!-- Twitter/X -->
          <a
            :href="twitterUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="dropdownItemClasses"
            role="menuitem"
            tabindex="-1"
            @click="trackShare('twitter')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.twitter.icon.color"
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
            :class="dropdownItemClasses"
            role="menuitem"
            tabindex="-1"
            @click="trackShare('linkedin')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.linkedin.icon.color"
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
            :class="dropdownItemClasses"
            role="menuitem"
            tabindex="-1"
            @click="trackShare('facebook')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.facebook.icon.color"
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
            :class="dropdownItemClasses"
            role="menuitem"
            tabindex="-1"
            @click="trackShare('reddit')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.reddit.icon.color"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"
              />
            </svg>
            Share on Reddit
          </a>

          <!-- Email -->
          <a
            :href="emailUrl"
            :class="dropdownItemClasses"
            role="menuitem"
            tabindex="-1"
            @click="trackShare('email')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.email.icon.color"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Share via Email
          </a>

          <!-- Copy Link -->
          <button
            ref="copyButtonRef"
            type="button"
            :class="[
              dropdownItemClasses,
              'w-full text-left',
              copySuccess && 'bg-green-50 text-green-700',
            ]"
            role="menuitem"
            tabindex="-1"
            @click="copyLinkWithRipple"
          >
            <svg
              v-if="!copySuccess"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.copy.icon.color"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              :class="socialConfig.platformStyles.copy.icon.success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{
              copySuccess
                ? contentConfig.messages.clipboard.copied
                : contentConfig.messages.clipboard.copy
            }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Screen reader announcement -->
    <div
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcementText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { uiConfig } from '~/configs/ui.config'
import { socialConfig } from '~/configs/social.config'
import { contentConfig } from '~/configs/content.config'
import { animationConfig } from '~/configs/animation.config'
import { useSocialSharing } from '~/composables/useSocialSharing'
import { useRipple } from '~/composables/useRipple'
import { hapticSuccess, hapticLight } from '~/utils/hapticFeedback'

interface Props {
  title: string
  description: string
  url: string
  resourceId?: string
  resourceType?: string
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  resourceType: 'resource',
  resourceId: undefined,
  image: undefined,
})

const isOpen = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const copyButtonRef = ref<HTMLButtonElement | null>(null)
const copySuccess = ref(false)

// Palette's micro-UX enhancements
const isButtonPressed = ref(false)
const prefersReducedMotion = ref(false)
const announcementText = ref('')
const showCopiedTooltip = ref(false)
const copiedTooltipPosition = ref({ x: 0, y: 0 })
let copiedTooltipTimeout: ReturnType<typeof setTimeout> | null = null

// Use the enhanced social sharing composable
const { share, copyLink: copyLinkWithTracking } = useSocialSharing()

// Palette's micro-UX: Initialize ripple effects for tactile feedback
const { createRipple: createShareRipple } = useRipple(
  triggerRef as Ref<HTMLButtonElement | null>,
  {
    color: animationConfig.ripple.primaryColor,
    duration: animationConfig.button.feedbackDurationMs,
  }
)

const { createRipple: createCopyRipple } = useRipple(
  copyButtonRef as Ref<HTMLButtonElement | null>,
  {
    color: animationConfig.ripple.successColor,
    duration: animationConfig.button.feedbackDurationMs,
  }
)

// Flexy hates hardcoded Tailwind classes!
// Use configurable styles from socialConfig
const shareButtonClasses = computed(() => {
  const styles = socialConfig.platformStyles.shareButton
  return `p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 ${styles.bg} ${styles.ring}`
})

const dropdownContainerClasses = computed(() => {
  return `${socialConfig.dropdown.container} ${socialConfig.dropdown.position}`
})

const dropdownItemClasses = computed(() => socialConfig.dropdown.item)

// Computed style for the copied tooltip position
const copiedTooltipStyle = computed(() => ({
  left: `${copiedTooltipPosition.value.x}px`,
  top: `${copiedTooltipPosition.value.y - 40}px`, // Position above the click
  transform: 'translateX(-50%)',
}))

// Computed URLs for different social platforms - Flexy hates hardcoded URLs!
const twitterUrl = computed(() =>
  socialConfig.urlBuilders.twitter(props.title, props.description, props.url)
)

const facebookUrl = computed(() => socialConfig.urlBuilders.facebook(props.url))

const linkedinUrl = computed(() =>
  socialConfig.urlBuilders.linkedin(props.title, props.description, props.url)
)

const redditUrl = computed(() =>
  socialConfig.urlBuilders.reddit(props.title, props.url)
)

const emailUrl = computed(() =>
  socialConfig.urlBuilders.email(props.title, props.description, props.url)
)

// Get all focusable menu items
const menuItems = computed(() => {
  if (!dropdownRef.value) return []
  return Array.from(
    dropdownRef.value.querySelectorAll<HTMLElement>(
      'a[role="menuitem"], button[role="menuitem"]'
    )
  )
})

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Announce to screen readers
const announce = (message: string): void => {
  announcementText.value = message
  setTimeout(() => {
    announcementText.value = ''
  }, uiConfig.feedback.announcementClearMs)
}

// Toggle dropdown visibility with ripple and haptic feedback
const toggleDropdownWithRipple = async (event: MouseEvent) => {
  // Create ripple effect - Palette's micro-UX touch!
  createShareRipple(event)

  isOpen.value = !isOpen.value

  // Haptic feedback
  hapticLight()

  if (isOpen.value) {
    announce(contentConfig.share.ariaLabels.menuOpened)
    await nextTick()
    // Focus first menu item for keyboard navigation
    menuItems.value[0]?.focus()
  } else {
    announce(contentConfig.share.ariaLabels.menuClosed)
  }
}

// Handle keyboard navigation for the share button
const handleButtonKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleDropdownWithRipple(event as unknown as MouseEvent)
  } else if (event.key === 'ArrowDown' && !isOpen.value) {
    event.preventDefault()
    isOpen.value = true
    nextTick(() => {
      menuItems.value[0]?.focus()
    })
  }
}

// Handle keyboard navigation within the menu
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

    case 'Home': {
      event.preventDefault()
      items[0]?.focus()
      break
    }

    case 'End': {
      event.preventDefault()
      items[items.length - 1]?.focus()
      break
    }

    case 'Escape': {
      event.preventDefault()
      isOpen.value = false
      triggerRef.value?.focus()
      announce(contentConfig.share.ariaLabels.menuClosed)
      break
    }

    case 'Tab': {
      // Close menu on tab out
      isOpen.value = false
      break
    }
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  if (
    triggerRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false
  }
}

// Track share events with enhanced analytics and haptic feedback
const trackShare = async (platform: string) => {
  // Haptic feedback
  hapticLight()

  await share(
    platform,
    {
      title: props.title,
      description: props.description,
      url: props.url,
      image: props.image,
      type: 'website',
    },
    {
      resourceId: props.resourceId,
      resourceType: props.resourceType,
    }
  )
  isOpen.value = false
  await nextTick()
  triggerRef.value?.focus()
}

// Copy link to clipboard with ripple, haptic feedback, and enhanced UX
const copyLinkWithRipple = async (event: MouseEvent) => {
  // Store click position for tooltip
  copiedTooltipPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }

  // Create ripple effect - Palette's micro-UX touch!
  createCopyRipple(event)

  const success = await copyLinkWithTracking(props.url, {
    resourceId: props.resourceId,
    resourceType: props.resourceType,
  })

  if (success) {
    copySuccess.value = true

    // Haptic feedback for success
    hapticSuccess()

    // Show copied tooltip
    showCopiedTooltip.value = true

    // Clear any existing tooltip timeout
    if (copiedTooltipTimeout) {
      clearTimeout(copiedTooltipTimeout)
    }

    // Hide tooltip after animation
    copiedTooltipTimeout = setTimeout(() => {
      showCopiedTooltip.value = false
    }, animationConfig.copySuccess.tooltipDurationMs || 1500)

    announce(contentConfig.messages.clipboard.copied)

    setTimeout(() => {
      copySuccess.value = false
    }, uiConfig.timing.copySuccessTimeoutMs)
  }

  isOpen.value = false
  await nextTick()
  triggerRef.value?.focus()
}

// Add event listeners when component is mounted
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  prefersReducedMotion.value = checkReducedMotion()

  // Listen for reduced motion preference changes
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionChange = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches
  }
  mediaQuery.addEventListener('change', handleMotionChange)
})

// Remove event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (copiedTooltipTimeout) {
    clearTimeout(copiedTooltipTimeout)
  }
})
</script>

<style scoped>
/* Palette's micro-UX: Copied tooltip styles */
.copied-tooltip {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* Share button open state */
button.is-open {
  background-color: v-bind('socialConfig.platformStyles.shareButton.activeBg');
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
  border-width: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .copied-tooltip {
    transition: opacity 0.15s ease-out !important;
    transform: translateX(-50%) !important;
  }
}
</style>
