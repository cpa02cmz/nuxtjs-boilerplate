import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { logError } from '~/utils/errorLogger'
import type { ApiClient } from '~/utils/api-client'
import type { ApiKey } from '~/types/webhook'
import { apiConfig } from '~/configs/api.config'
import { validationConfig } from '~/configs/validation.config'

export interface NewApiKey {
  name: string
  permissions: string[]
}

export interface UseApiKeysManagerOptions {
  apiClient?: ApiClient
}

export const useApiKeysManager = (options: UseApiKeysManagerOptions = {}) => {
  const { apiClient: providedClient } = options

  const getClient = () => {
    if (providedClient) {
      return providedClient
    }
    const { $apiClient } = useNuxtApp()
    return $apiClient
  }
  const apiKeys = ref<ApiKey[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchApiKeys = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const client = getClient()
      const response = await client.get<{
        apiKeys: ApiKey[]
        data?: ApiKey[]
      }>(apiConfig.auth.apiKeys)

      if (response.success) {
        apiKeys.value = response.data?.apiKeys ?? response.data?.data ?? []
      } else {
        error.value =
          response.error?.message ||
          validationConfig.messages.error.fetchApiKeys
        apiKeys.value = []
      }
    } catch (err) {
      error.value = validationConfig.messages.error.fetchApiKeys
      logError('Error fetching API keys', err as Error, 'useApiKeysManager', {
        operation: 'fetchApiKeys',
      })

      apiKeys.value = []
    } finally {
      loading.value = false
    }
  }

  const createApiKey = async (newApiKey: NewApiKey): Promise<ApiKey | null> => {
    try {
      loading.value = true
      error.value = null

      const client = getClient()
      const response = await client.post<{ apiKey: ApiKey; data?: ApiKey }>(
        apiConfig.auth.apiKeys,
        newApiKey
      )

      if (!response.success) {
        error.value =
          response.error?.message ||
          validationConfig.messages.error.createApiKey
        return null
      }

      const createdKey = response.data?.apiKey ?? response.data?.data

      if (createdKey) {
        apiKeys.value.unshift(createdKey)
      }

      return createdKey ?? null
    } catch (err) {
      error.value = validationConfig.messages.error.createApiKey
      logError('Error creating API key', err as Error, 'useApiKeysManager', {
        operation: 'createApiKey',
        keyName: newApiKey.name,
      })

      return null
    } finally {
      loading.value = false
    }
  }

  const revokeApiKey = async (keyId: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const client = getClient()
      const response = await client.delete(apiConfig.auth.apiKeyById(keyId))

      if (!response.success) {
        error.value =
          response.error?.message ||
          validationConfig.messages.error.revokeApiKey
        return false
      }

      apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)

      return true
    } catch (err) {
      error.value = validationConfig.messages.error.revokeApiKey
      logError('Error revoking API key', err as Error, 'useApiKeysManager', {
        operation: 'revokeApiKey',
        keyId,
      })

      return false
    } finally {
      loading.value = false
    }
  }

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
  }
}
