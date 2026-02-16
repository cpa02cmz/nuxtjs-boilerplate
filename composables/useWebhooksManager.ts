/**
 * Composable for webhooks management
 * Handles webhook CRUD operations, validation, and state management
 *
 * Architecture:
 * - Business logic layer: Manages webhook operations and state
 * - Data access layer: Communicates with API endpoints via ApiClient
 * - Separation of concerns: Components handle presentation only
 *
 * Dependency Injection:
 * - ApiClient can be injected for testing
 * - Falls back to useNuxtApp() for production use
 */
import { ref, reactive, readonly, onUnmounted } from 'vue'
import { useNuxtApp } from '#app'
import logger from '~/utils/logger'
import { UI_FEEDBACK_DURATION } from '~/server/utils/constants'
import type { ApiClient } from '~/utils/api-client'
import type { Webhook } from '~/types/webhook'
import { apiConfig } from '~/configs/api.config'
import { validationConfig } from '~/configs/validation.config'

export interface WebhookFormData {
  url: string
  events: string[]
  active: boolean
}

export interface UseWebhooksManagerOptions {
  apiClient?: ApiClient
}

export const useWebhooksManager = (options: UseWebhooksManagerOptions = {}) => {
  const { apiClient: providedClient } = options

  const getClient = () => {
    if (providedClient) {
      return providedClient
    }
    const { $apiClient } = useNuxtApp()
    return $apiClient
  }

  const webhooks = ref<Webhook[]>([])
  const loading = ref(true)
  // Pallete: Separate loading state for create operation for better UX feedback
  const isCreating = ref(false)
  const errorMessage = ref('')
  const announcement = ref('')
  const timeouts = ref<ReturnType<typeof setTimeout>[]>([])

  const newWebhook = reactive<WebhookFormData>({
    url: '',
    events: [],
    active: true,
  })

  const availableEvents = [
    'resource.created',
    'resource.updated',
    'resource.deleted',
    'resource.approved',
    'user.registered',
    'submission.received',
  ] as const

  const fetchWebhooks = async () => {
    try {
      loading.value = true
      errorMessage.value = ''

      const client = getClient()
      const response = await client.get<{ data: Webhook[] }>(
        apiConfig.webhooks.base
      )

      if (response.success && response.data) {
        webhooks.value = response.data as unknown as Webhook[]
      } else {
        errorMessage.value = validationConfig.messages.error.fetchWebhooks
      }
    } catch (error) {
      logger.error('Error fetching webhooks:', error)
      errorMessage.value = validationConfig.messages.error.fetchWebhooks
    } finally {
      loading.value = false
    }
  }

  const createWebhook = async (webhookData: WebhookFormData) => {
    errorMessage.value = ''

    if (!webhookData.url) {
      errorMessage.value = validationConfig.messages.required.webhookUrl
      return false
    }

    if (!webhookData.events || webhookData.events.length === 0) {
      errorMessage.value = validationConfig.messages.required.events
      return false
    }

    // Pallete: Set loading state for better UX feedback during creation
    isCreating.value = true

    try {
      const client = getClient()
      const response = await client.post(apiConfig.webhooks.base, webhookData)

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          validationConfig.messages.error.createWebhook
        return false
      }

      announcement.value = validationConfig.messages.success.webhookCreated

      const timeout = setTimeout(() => {
        announcement.value = ''
      }, UI_FEEDBACK_DURATION.ANNOUNCEMENT_CLEAR)
      timeouts.value.push(timeout)

      await fetchWebhooks()
      return true
    } catch (error) {
      logger.error('Error creating webhook:', error)
      errorMessage.value = validationConfig.messages.error.createWebhook
      return false
    } finally {
      // Pallete: Reset loading state after creation completes
      isCreating.value = false
    }
  }

  const toggleWebhook = async (webhook: Webhook) => {
    try {
      const newStatus = !webhook.active
      const client = getClient()
      const response = await client.put(apiConfig.webhooks.byId(webhook.id), {
        active: newStatus,
      })

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          validationConfig.messages.error.updateWebhook
        return
      }

      announcement.value = newStatus
        ? validationConfig.messages.success.webhookActivated
        : validationConfig.messages.success.webhookDeactivated

      const timeout = setTimeout(() => {
        announcement.value = ''
      }, UI_FEEDBACK_DURATION.ANNOUNCEMENT_CLEAR)
      timeouts.value.push(timeout)

      await fetchWebhooks()
    } catch (error) {
      logger.error('Error toggling webhook:', error)
      errorMessage.value = validationConfig.messages.error.updateWebhook
    }
  }

  const deleteWebhook = async (webhook: Webhook) => {
    if (!confirm(`Are you sure you want to delete webhook: ${webhook.url}?`)) {
      return
    }

    try {
      const client = getClient()
      const response = await client.delete(apiConfig.webhooks.byId(webhook.id))

      if (!response.success) {
        errorMessage.value =
          response.error?.message ||
          validationConfig.messages.error.deleteWebhook
        return
      }

      announcement.value = validationConfig.messages.success.webhookDeleted

      const timeout = setTimeout(() => {
        announcement.value = ''
      }, UI_FEEDBACK_DURATION.ANNOUNCEMENT_CLEAR)
      timeouts.value.push(timeout)

      await fetchWebhooks()
    } catch (error) {
      logger.error('Error deleting webhook:', error)
      errorMessage.value = validationConfig.messages.error.deleteWebhook
    }
  }

  const resetForm = () => {
    newWebhook.url = ''
    newWebhook.events = []
    newWebhook.active = true
  }

  onUnmounted(() => {
    timeouts.value.forEach(clearTimeout)
    timeouts.value = []
  })

  return {
    webhooks,
    loading,
    // Pallete: Export creating state for loading feedback in UI
    isCreating: readonly(isCreating),
    errorMessage,
    announcement,
    newWebhook,
    availableEvents,
    fetchWebhooks,
    createWebhook,
    toggleWebhook,
    deleteWebhook,
    resetForm,
  }
}
