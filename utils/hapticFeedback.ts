/**
 * Haptic feedback utility for mobile/touch devices
 * Provides tactile feedback for important user actions
 * Gracefully degrades on unsupported browsers
 */

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'

/**
 * Check if the device supports vibration API
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Check if user prefers reduced motion (should skip haptics)
 */
export const shouldSkipHaptics = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Trigger haptic feedback with specified intensity
 * @param type - The type of haptic feedback
 * @returns boolean - Whether haptic was triggered successfully
 */
export const triggerHaptic = (type: HapticType): boolean => {
  // Skip if reduced motion is preferred or not supported
  if (shouldSkipHaptics() || !isHapticSupported()) {
    return false
  }

  try {
    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: 50,
      success: [50, 100, 50],
      warning: [30, 50, 30],
      error: [100, 50, 100],
    }

    const pattern = patterns[type]
    return navigator.vibrate(pattern)
  } catch {
    // Gracefully fail if vibration API throws
    return false
  }
}

/**
 * Trigger haptic feedback for a successful action
 * Commonly used for: bookmarking, copying, adding to comparison
 */
export const hapticSuccess = (): boolean => triggerHaptic('success')

/**
 * Trigger haptic feedback for a warning/notification
 * Commonly used for: reaching limits, important notifications
 */
export const hapticWarning = (): boolean => triggerHaptic('warning')

/**
 * Trigger haptic feedback for an error
 * Commonly used for: failed actions, validation errors
 */
export const hapticError = (): boolean => triggerHaptic('error')

/**
 * Trigger light haptic feedback for subtle interactions
 * Commonly used for: button presses, toggles
 */
export const hapticLight = (): boolean => triggerHaptic('light')

/**
 * Trigger medium haptic feedback for standard interactions
 * Commonly used for: selections, confirmations
 */
export const hapticMedium = (): boolean => triggerHaptic('medium')

/**
 * Composite function that triggers both haptic and optional callback
 * Useful for combining haptics with other feedback
 */
export const withHaptic = <T>(
  hapticType: HapticType,
  callback?: () => T
): T | undefined => {
  triggerHaptic(hapticType)
  return callback?.()
}
