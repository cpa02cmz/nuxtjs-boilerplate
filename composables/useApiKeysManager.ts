import { readonly, ref } from 'vue'
import { logError } from '~/utils/errorLogger'
import type { ApiKey } from '~/types/webhook'

export interface NewApiKey {
  name: string
  permissions: string[]
}

export const useApiKeysManager = () => {
  const apiKeys = ref<ApiKey[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchApiKeys = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      const response = await $fetch<{ apiKeys: ApiKey[]; data?: ApiKey[] }>(
        '/api/v1/auth/api-keys'
      )

      apiKeys.value = response.apiKeys ?? response.data ?? []
    } catch (err) {
      error.value = 'Failed to load API keys. Please try again.'
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

      const response = await $fetch<{ apiKey: ApiKey; data?: ApiKey }>(
        '/api/v1/auth/api-keys',
        {
          method: 'POST',
          body: newApiKey,
        }
      )

      const createdKey = response.apiKey ?? response.data

      if (createdKey) {
        apiKeys.value.unshift(createdKey)
      }

      return createdKey
    } catch (err) {
      error.value = 'Failed to create API key. Please try again.'
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

      await $fetch(`/api/v1/auth/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)

      return true
    } catch (err) {
      error.value = 'Failed to revoke API key. Please try again.'
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
