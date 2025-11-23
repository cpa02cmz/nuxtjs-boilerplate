import { ref, getCurrentInstance, onMounted } from 'vue'

interface ToastOptions {
  title: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Global toast manager
const toastManager = ref<any>(null)

// Initialize toast manager
export const initToastManager = (manager: any) => {
  toastManager.value = manager
}

// Toast composable
export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    if (toastManager.value) {
      toastManager.value.addToast({
        title: options.title,
        description: options.description,
        type: options.type || 'info',
        duration: options.duration,
      })
    } else {
      // Fallback for development - log to console if no toast manager is available
      console.warn('Toast manager not initialized. Toast message:', options)
    }
  }

  const showSuccess = (
    title: string,
    description?: string,
    duration?: number
  ) => {
    showToast({ title, description, type: 'success', duration })
  }

  const showError = (
    title: string,
    description?: string,
    duration?: number
  ) => {
    showToast({ title, description, type: 'error', duration })
  }

  const showWarning = (
    title: string,
    description?: string,
    duration?: number
  ) => {
    showToast({ title, description, type: 'warning', duration })
  }

  const showInfo = (title: string, description?: string, duration?: number) => {
    showToast({ title, description, type: 'info', duration })
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
