import { computed, readonly, ref } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import type { ApiKey } from '~/types/webhook'
import { dateConfig } from '~/configs/date.config'
import { permissionsConfig } from '~/configs/permissions.config'
import { messagesConfig } from '~/configs/messages.config'
import { apiConfig } from '~/configs/api.config'

export interface ApiKeyDisplay extends ApiKey {
  showFullKey?: boolean
}

export const useApiKeysPage = () => {
  const newKeyName = ref('')
  const apiKeys = ref<ApiKeyDisplay[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchApiKeys = async () => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.get<{ data: ApiKey[] }>(
        apiConfig.auth.apiKeys
      )

      if (response.success && response.data?.data) {
        apiKeys.value = response.data.data.map(key => ({
          ...key,
          showFullKey: false,
        }))
      } else {
        apiKeys.value = []
      }
    } catch (err) {
      error.value = messagesConfig.errors.apiKey.loadFailed
      logError('Error fetching API keys', err as Error, 'useApiKeysPage', {
        operation: 'fetchApiKeys',
      })

      apiKeys.value = []
    } finally {
      loading.value = false
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.value.trim()) {
      return false
    }

    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.post<
        { data: ApiKey } & { key?: string }
      >(apiConfig.auth.apiKeys, {
        name: newKeyName.value.trim(),
        permissions: permissionsConfig.apiKey.defaultPermissions,
      })

      if (response.success) {
        const keyData = response.data?.data
        if (!keyData) {
          error.value = messagesConfig.errors.apiKey.createFailed
          return false
        }

        const newKey: ApiKeyDisplay = {
          ...keyData,
          showFullKey: true,
        }

        apiKeys.value.unshift(newKey)
        newKeyName.value = ''

        return true
      } else {
        error.value =
          response.error?.message || messagesConfig.errors.apiKey.createFailed
        return false
      }
    } catch (err) {
      error.value = messagesConfig.errors.apiKey.createFailed
      logError('Error creating API key', err as Error, 'useApiKeysPage', {
        operation: 'createApiKey',
      })
      return false
    } finally {
      loading.value = false
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      loading.value = true
      error.value = null

      const { $apiClient } = useNuxtApp()
      const response = await $apiClient.delete(apiConfig.auth.apiKeyById(keyId))

      if (response.success) {
        apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
        return true
      } else {
        error.value =
          response.error?.message || messagesConfig.errors.apiKey.revokeFailed
        return false
      }
    } catch (err) {
      error.value = messagesConfig.errors.apiKey.revokeFailed
      logError('Error revoking API key', err as Error, 'useApiKeysPage', {
        operation: 'revokeApiKey',
        keyId,
      })
      return false
    } finally {
      loading.value = false
    }
  }

  const toggleKeyVisibility = (key: ApiKeyDisplay) => {
    key.showFullKey = !key.showFullKey
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(dateConfig.locale, {
        year: dateConfig.formats.full.year as 'numeric' | '2-digit',
        month: dateConfig.formats.full.month as
          | 'short'
          | 'long'
          | 'narrow'
          | 'numeric'
          | '2-digit',
        day: dateConfig.formats.full.day as 'numeric' | '2-digit',
        hour: dateConfig.formats.full.hour as 'numeric' | '2-digit',
        minute: dateConfig.formats.full.minute as 'numeric' | '2-digit',
      })
    } catch (err) {
      logError('Error formatting date', err as Error, 'useApiKeysPage', {
        dateString,
      })
      return 'Invalid date'
    }
  }

  const keyCount = computed(() => apiKeys.value.length)

  return {
    apiKeys: readonly(apiKeys),
    newKeyName,
    loading: readonly(loading),
    error: readonly(error),
    keyCount,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    toggleKeyVisibility,
    formatDate,
  }
}
