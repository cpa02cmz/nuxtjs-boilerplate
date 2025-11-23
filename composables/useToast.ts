import { ref } from 'vue'
import type { Toast, ToastType } from '~/components/ToastNotification.vue'

interface ToastOptions {
  duration?: number
  closable?: boolean
}

const toastQueue = ref<Toast[]>([])

export const useToast = () => {
  const addToast = (
    message: string,
    type: ToastType = 'info',
    options: ToastOptions = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      type,
      message,
      duration: options.duration ?? 5000,
      closable: options.closable ?? true,
    }

    toastQueue.value.push(toast)

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }
  }

  const removeToast = (id: string) => {
    toastQueue.value = toastQueue.value.filter(toast => toast.id !== id)
  }

  const success = (message: string, options?: ToastOptions) => {
    addToast(message, 'success', options)
  }

  const error = (message: string, options?: ToastOptions) => {
    addToast(message, 'error', options)
  }

  const warning = (message: string, options?: ToastOptions) => {
    addToast(message, 'warning', options)
  }

  const info = (message: string, options?: ToastOptions) => {
    addToast(message, 'info', options)
  }

  return {
    toasts: toastQueue,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
