import logger from './logger'

export interface EventDetail {
  [key: string]: unknown
}

export type EventListener = () => void
export type CustomEventListener<T extends EventDetail = EventDetail> = (
  event: CustomEvent<T>
) => void

let cleanupFunctions: (() => void)[] = []

export const emitEvent = (eventName: string, detail?: EventDetail): boolean => {
  if (typeof window === 'undefined') {
    logger.warn(
      `Attempted to emit event '${eventName}' in non-browser environment`
    )
    return false
  }

  try {
    if (detail) {
      const event = new CustomEvent(eventName, { detail })
      window.dispatchEvent(event)
    } else {
      const event = new Event(eventName)
      window.dispatchEvent(event)
    }
    return true
  } catch (error) {
    logger.error(`Error emitting event '${eventName}':`, error)
    return false
  }
}

export const addEventListener = <T extends EventDetail = EventDetail>(
  eventName: string,
  listener: CustomEventListener<T>,
  options?: boolean | AddEventListenerOptions
): (() => void) => {
  if (typeof window === 'undefined') {
    logger.warn(
      `Attempted to add listener for event '${eventName}' in non-browser environment`
    )
    return () => {}
  }

  const wrappedListener = listener as EventListener

  try {
    window.addEventListener(eventName, wrappedListener, options)

    const cleanup = () => {
      window.removeEventListener(eventName, wrappedListener, options)
    }

    cleanupFunctions.push(cleanup)
    return cleanup
  } catch (error) {
    logger.error(`Error adding listener for event '${eventName}':`, error)
    return () => {}
  }
}

export const addSimpleEventListener = (
  eventName: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): (() => void) => {
  if (typeof window === 'undefined') {
    logger.warn(
      `Attempted to add listener for event '${eventName}' in non-browser environment`
    )
    return () => {}
  }

  try {
    window.addEventListener(eventName, listener, options)

    const cleanup = () => {
      window.removeEventListener(eventName, listener, options)
    }

    cleanupFunctions.push(cleanup)
    return cleanup
  } catch (error) {
    logger.error(`Error adding listener for event '${eventName}':`, error)
    return () => {}
  }
}

export const removeAllEventListeners = (): void => {
  cleanupFunctions.forEach(cleanup => {
    try {
      cleanup()
    } catch (error) {
      logger.error('Error removing event listener:', error)
    }
  })
  cleanupFunctions = []
}
