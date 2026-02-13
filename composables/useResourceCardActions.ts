import { ref, computed } from 'vue'
import { useRuntimeConfig, useNuxtApp } from '#imports'
import { useResourceComparison } from '~/composables/useResourceComparison'
import { useVisitedResources } from '~/composables/useVisitedResources'
import { copyToClipboard } from '~/utils/clipboard'
import { logError } from '~/utils/errorLogger'
import {
  hapticSuccess,
  hapticError,
  hapticWarning,
} from '~/utils/hapticFeedback'
import { limitsConfig } from '~/configs/limits.config'
import { animationConfig } from '~/configs/animation.config'
import { TIME_MS } from '~/configs/time.config'
import type { Resource } from '~/types/resource'

export interface ResourceActionState {
  isAddingToComparison: boolean
  isCompareAnimating: boolean
  showCompareFeedback: boolean
  isCopied: boolean
  isCopyError: boolean
  isCopyAnimating: boolean
  copyStatus: string
  showCopiedTooltip: boolean
  copiedTooltipPosition: { x: number; y: number }
}

export interface UseResourceCardActionsOptions {
  id?: string
  title: string
  description: string
  benefits: readonly string[]
  url: string
  category?: string
  dateAdded?: string
}

export function useResourceCardActions(options: UseResourceCardActionsOptions) {
  const {
    id,
    title,
    description,
    benefits,
    url,
    category = 'unknown',
  } = options

  // Get external composables
  const { addResource } = useResourceComparison()
  const { isVisited, markVisited } = useVisitedResources()
  const runtimeConfig = useRuntimeConfig()

  // State
  const isAddingToComparison = ref(false)
  const isCompareAnimating = ref(false)
  const showCompareFeedback = ref(false)
  const isCopied = ref(false)
  const isCopyError = ref(false)
  const isCopyAnimating = ref(false)
  const copyStatus = ref('')
  const copyErrorTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
  const showCopiedTooltip = ref(false)
  const copiedTooltipPosition = ref({ x: 0, y: 0 })
  let copiedTooltipTimeout: ReturnType<typeof setTimeout> | null = null

  // Check if resource is new (added within the configured threshold days)
  const isNew = computed(() => {
    if (!options.dateAdded) return false

    const addedDate = new Date(options.dateAdded)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - addedDate.getTime())
    const diffDays = Math.ceil(diffTime / TIME_MS.DAY)

    return diffDays <= limitsConfig.newResourceBadge.thresholdDays
  })

  // Check if resource has been visited
  const isResourceVisited = computed(() => {
    return id ? isVisited(id) : false
  })

  // Mark resource as visited
  const markResourceVisited = () => {
    if (id) {
      markVisited(id)
    }
  }

  // Add resource to comparison with UX feedback
  const addResourceToComparison = () => {
    if (!id || isAddingToComparison.value) return

    const resource: Partial<Resource> = {
      id,
      title,
      description,
      benefits,
      url,
      category,
    }

    const result = addResource(resource as Resource)

    if (result.success) {
      isAddingToComparison.value = true
      isCompareAnimating.value = true
      showCompareFeedback.value = true
      hapticSuccess()

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const navigationDelay = prefersReducedMotion
        ? 0
        : animationConfig.navigation.reducedMotionDelayMs

      setTimeout(() => {
        navigateTo('/compare')
      }, navigationDelay)
    } else if (result.reason === 'limit_reached') {
      const { $toast } = useNuxtApp()
      $toast.warning(
        `Comparison limit reached (${limitsConfig.comparison.maxResources} resources max). Remove a resource to add another.`
      )
      hapticWarning()
    } else if (result.reason === 'already_added') {
      const { $toast } = useNuxtApp()
      $toast.info(`"${title}" is already in your comparison`)
      hapticWarning()
    }
  }

  // Copy resource URL to clipboard with visual feedback
  const copyResourceUrl = async (event?: MouseEvent) => {
    if (!id || isCopied.value || isCopyError.value) return

    // Store click position for tooltip if event is provided
    if (event) {
      copiedTooltipPosition.value = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    const resourceUrl = `${runtimeConfig.public.canonicalUrl}/resources/${id}`
    const result = await copyToClipboard(resourceUrl)

    if (result.success) {
      isCopyError.value = false
      if (copyErrorTimeout.value) {
        clearTimeout(copyErrorTimeout.value)
        copyErrorTimeout.value = null
      }

      isCopied.value = true
      isCopyAnimating.value = true
      copyStatus.value = `Link to "${title}" copied to clipboard`
      hapticSuccess()

      // Show cursor-positioned tooltip for delightful micro-UX feedback
      showCopiedTooltip.value = true
      if (copiedTooltipTimeout) {
        clearTimeout(copiedTooltipTimeout)
      }
      copiedTooltipTimeout = setTimeout(() => {
        showCopiedTooltip.value = false
      }, animationConfig.copySuccess.tooltipDurationMs)

      const { $toast } = useNuxtApp()
      $toast.success(`Link to "${title}" copied to clipboard!`)

      setTimeout(() => {
        isCopied.value = false
        isCopyAnimating.value = false
        copyStatus.value = ''
      }, animationConfig.copySuccess.resetDelayMs)
    } else {
      isCopyError.value = true
      isCopyAnimating.value = true

      if (copyErrorTimeout.value) {
        clearTimeout(copyErrorTimeout.value)
      }

      copyStatus.value = `Failed to copy link to "${title}". Please try again.`

      const { $toast } = useNuxtApp()
      $toast.error('Failed to copy link. Please try again.')
      hapticError()
      logError(
        'Failed to copy resource URL to clipboard',
        new Error(result.error),
        'ResourceCardActions',
        { resourceId: id, resourceTitle: title }
      )

      copyErrorTimeout.value = setTimeout(() => {
        isCopyError.value = false
        isCopyAnimating.value = false
        copyStatus.value = ''
      }, animationConfig.copyError.resetDelayMs)
    }
  }

  return {
    // State
    isAddingToComparison,
    isCompareAnimating,
    showCompareFeedback,
    isCopied,
    isCopyError,
    isCopyAnimating,
    copyStatus,
    showCopiedTooltip,
    copiedTooltipPosition,
    // Computed
    isNew,
    isResourceVisited,
    // Actions
    markResourceVisited,
    addResourceToComparison,
    copyResourceUrl,
  }
}
