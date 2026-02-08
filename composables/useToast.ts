import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  primary?: boolean
  callback: () => void
}

interface ToastOptions {
  type: ToastType
  message: string
  description?: string
  duration?: number
  actions?: ToastAction[]
}

type AddToastFunction = (options: ToastOptions) => void

const addToastRef = ref<AddToastFunction | null>(null)

export const registerToastFunction = (fn: AddToastFunction) => {
  addToastRef.value = fn
}

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    if (addToastRef.value) {
      addToastRef.value(options)
    } else {
      console.warn('Toast notification system not initialized')
    }
  }

  const showSuccess = (
    message: string,
    description?: string,
    actions?: ToastAction[]
  ) => {
    showToast({ type: 'success', message, description, actions })
  }

  const showError = (
    message: string,
    description?: string,
    actions?: ToastAction[]
  ) => {
    showToast({ type: 'error', message, description, actions })
  }

  const showWarning = (
    message: string,
    description?: string,
    actions?: ToastAction[]
  ) => {
    showToast({ type: 'warning', message, description, actions })
  }

  const showInfo = (
    message: string,
    description?: string,
    actions?: ToastAction[]
  ) => {
    showToast({ type: 'info', message, description, actions })
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
