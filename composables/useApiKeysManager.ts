import { ref, readonly } from 'vue'
import { useNuxtApp } from '#app'
import { useErrorHandler } from '~/composables/useErrorHandler'
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
  // Pallete: Separate loading state for creation to enable granular UI feedback
  const isCreating = ref(false)
  const { error, handleError, clearError } = useErrorHandler()

  const fetchApiKeys = async (): Promise<void> => {
    try {
      loading.value = true
      clearError()

      const client = getClient()
      const response = await client.get<{
        apiKeys: ApiKey[]
        data?: ApiKey[]
      }>(apiConfig.auth.apiKeys)

      if (response.success) {
        apiKeys.value = response.data?.apiKeys ?? response.data?.data ?? []
      } else {
        handleError(
          response.error?.message ||
            validationConfig.messages.error.fetchApiKeys,
          { component: 'useApiKeysManager', severity: 'error' }
        )
        apiKeys.value = []
      }
    } catch {
      handleError(validationConfig.messages.error.fetchApiKeys, {
        component: 'useApiKeysManager',
        severity: 'error',
      })

      apiKeys.value = []
    } finally {
      loading.value = false
    }
  }

  const createApiKey = async (newApiKey: NewApiKey): Promise<ApiKey | null> => {
    try {
      // Pallete: Use specific loading state for creation feedback
      isCreating.value = true
      clearError()

      const client = getClient()
      const response = await client.post<{ apiKey: ApiKey; data?: ApiKey }>(
        apiConfig.auth.apiKeys,
        newApiKey
      )

      if (!response.success) {
        handleError(
          response.error?.message ||
            validationConfig.messages.error.createApiKey,
          { component: 'useApiKeysManager', severity: 'error' }
        )
        return null
      }

      const createdKey = response.data?.apiKey ?? response.data?.data

      if (createdKey) {
        apiKeys.value.unshift(createdKey)
      }

      return createdKey ?? null
    } catch {
      handleError(validationConfig.messages.error.createApiKey, {
        component: 'useApiKeysManager',
        severity: 'error',
      })

      return null
    } finally {
      // Pallete: Reset creation loading state
      isCreating.value = false
    }
  }

  const revokeApiKey = async (keyId: string): Promise<boolean> => {
    try {
      loading.value = true
      clearError()

      const client = getClient()
      const response = await client.delete(apiConfig.auth.apiKeyById(keyId))

      if (!response.success) {
        handleError(
          response.error?.message ||
            validationConfig.messages.error.revokeApiKey,
          { component: 'useApiKeysManager', severity: 'error' }
        )
        return false
      }

      apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)

      return true
    } catch {
      handleError(validationConfig.messages.error.revokeApiKey, {
        component: 'useApiKeysManager',
        severity: 'error',
      })

      return false
    } finally {
      loading.value = false
    }
  }

  return {
    apiKeys,
    loading,
    // Pallete: Export creation loading state for granular UI feedback
    isCreating: readonly(isCreating),
    error,
    handleError,
    clearError,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
  }
}
