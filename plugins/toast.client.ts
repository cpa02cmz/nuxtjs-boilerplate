import { defineNuxtPlugin, useState } from '#app'
import { TOAST_DURATION } from '~/server/utils/constants'
import { limitsConfig } from '~/configs/limits.config'
import { generateId } from '~/utils/generateId'

export default defineNuxtPlugin(nuxtApp => {
  // Toast type definition
  type ToastType = 'success' | 'error' | 'info' | 'warning'

  // Create a global toast state
  const toastState = useState('toast', () => ({
    toasts: [] as Array<{
      id: string
      type: ToastType
      message: string
      description?: string
    }>,
  }))

  // Create a global toast method
  nuxtApp.provide('toast', {
    addToast: (
      type: ToastType,
      message: string,
      description?: string,
      duration?: number
    ) => {
      const id = generateId({
        length: limitsConfig.displayLength.toastIdLength,
        prefix: 'toast',
      })
      const newToast = { id, type, message, description, duration }

      toastState.value.toasts.push(newToast)

      // Auto remove toast after duration
      const toastDuration =
        duration ||
        (type === 'error' ? TOAST_DURATION.ERROR : TOAST_DURATION.SUCCESS)
      if (toastDuration > 0) {
        setTimeout(() => {
          toastState.value.toasts = toastState.value.toasts.filter(
            t => t.id !== id
          )
        }, toastDuration)
      }
    },
    removeToast: (id: string) => {
      toastState.value.toasts = toastState.value.toasts.filter(t => t.id !== id)
    },
    success: (message: string, description?: string) => {
      const toast = nuxtApp.$toast as {
        addToast: (
          type: ToastType,
          message: string,
          description?: string
        ) => void
      }
      toast.addToast('success', message, description)
    },
    error: (message: string, description?: string) => {
      const toast = nuxtApp.$toast as {
        addToast: (
          type: ToastType,
          message: string,
          description?: string
        ) => void
      }
      toast.addToast('error', message, description)
    },
    warning: (message: string, description?: string) => {
      const toast = nuxtApp.$toast as {
        addToast: (
          type: ToastType,
          message: string,
          description?: string
        ) => void
      }
      toast.addToast('warning', message, description)
    },
    info: (message: string, description?: string) => {
      const toast = nuxtApp.$toast as {
        addToast: (
          type: ToastType,
          message: string,
          description?: string
        ) => void
      }
      toast.addToast('info', message, description)
    },
  })
})
