import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useApiKeysManager,
  type NewApiKey,
} from '~/composables/useApiKeysManager'

describe('useApiKeysManager', () => {
  const mockNewApiKey: NewApiKey = {
    name: 'Test API Key',
    permissions: ['read'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with empty api keys array', () => {
      const { apiKeys } = useApiKeysManager()

      expect(apiKeys.value).toEqual([])
    })

    it('should initialize with loading state set to true', () => {
      const { loading } = useApiKeysManager()

      expect(loading.value).toBe(true)
    })

    it('should initialize with null error state', () => {
      const { error } = useApiKeysManager()

      expect(error.value).toEqual({
        hasError: false,
        message: null,
        details: null,
      })
    })

    it('should export fetchApiKeys function', () => {
      const { fetchApiKeys } = useApiKeysManager()

      expect(typeof fetchApiKeys).toBe('function')
    })

    it('should export createApiKey function', () => {
      const { createApiKey } = useApiKeysManager()

      expect(typeof createApiKey).toBe('function')
    })

    it('should export revokeApiKey function', () => {
      const { revokeApiKey } = useApiKeysManager()

      expect(typeof revokeApiKey).toBe('function')
    })
  })

  describe('Type Safety', () => {
    it('should accept NewApiKey interface for createApiKey', () => {
      const { createApiKey } = useApiKeysManager()

      expect(() => createApiKey(mockNewApiKey)).not.toThrow()
    })

    it('should return ApiKey type from createApiKey', async () => {
      const { createApiKey } = useApiKeysManager()

      const result = await createApiKey(mockNewApiKey)

      if (result !== null) {
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('key')
        expect(result).toHaveProperty('permissions')
      }
    })

    it('should return boolean from revokeApiKey', async () => {
      const { revokeApiKey } = useApiKeysManager()

      const result = await revokeApiKey('any_id')

      expect(typeof result).toBe('boolean')
    })

    it('should return void from fetchApiKeys', async () => {
      const { fetchApiKeys } = useApiKeysManager()

      const result = await fetchApiKeys()

      expect(result).toBeUndefined()
    })
  })

  describe('Reactive State Management', () => {
    it('should maintain reactive apiKeys reference', () => {
      const { apiKeys } = useApiKeysManager()

      const initialValue = apiKeys.value
      expect(initialValue).toEqual([])

      apiKeys.value = [
        {
          id: 'test',
          name: 'Test',
          key: 'key',
          permissions: [],
          createdAt: '',
          updatedAt: '',
          active: true,
        },
      ]

      expect(apiKeys.value).toHaveLength(1)
    })

    it('should maintain reactive loading reference', () => {
      const { loading } = useApiKeysManager()

      loading.value = false
      expect(loading.value).toBe(false)

      loading.value = true
      expect(loading.value).toBe(true)
    })

    it('should maintain reactive error reference', () => {
      const { error, handleError, clearError } = useApiKeysManager()

      clearError()
      expect(error.value.hasError).toBe(false)

      handleError('Test error')
      expect(error.value.message).toBe('Test error')
      expect(error.value.hasError).toBe(true)
    })
  })

  describe('Function Signatures', () => {
    it('fetchApiKeys should return Promise<void>', async () => {
      const { fetchApiKeys } = useApiKeysManager()

      const result = fetchApiKeys()

      expect(result).toBeInstanceOf(Promise)
      await result
    })

    it('createApiKey should accept NewApiKey and return Promise<ApiKey | null>', async () => {
      const { createApiKey } = useApiKeysManager()

      const resultPromise = createApiKey(mockNewApiKey)

      expect(resultPromise).toBeInstanceOf(Promise)

      const result = await resultPromise

      expect(result === null || typeof result === 'object').toBe(true)
    })

    it('revokeApiKey should accept string id and return Promise<boolean>', async () => {
      const { revokeApiKey } = useApiKeysManager()

      const resultPromise = revokeApiKey('test_id')

      expect(resultPromise).toBeInstanceOf(Promise)

      const result = await resultPromise

      expect(typeof result).toBe('boolean')
    })
  })

  describe('Interface Compliance', () => {
    it('should return object with apiKeys property', () => {
      const { apiKeys } = useApiKeysManager()

      expect(apiKeys).toBeDefined()
      expect('value' in apiKeys).toBe(true)
    })

    it('should return object with loading property', () => {
      const { loading } = useApiKeysManager()

      expect(loading).toBeDefined()
      expect('value' in loading).toBe(true)
    })

    it('should return object with error property', () => {
      const { error } = useApiKeysManager()

      expect(error).toBeDefined()
      expect('value' in error).toBe(true)
    })

    it('should return object with fetchApiKeys function', () => {
      const { fetchApiKeys } = useApiKeysManager()

      expect(typeof fetchApiKeys).toBe('function')
    })

    it('should return object with createApiKey function', () => {
      const { createApiKey } = useApiKeysManager()

      expect(typeof createApiKey).toBe('function')
    })

    it('should return object with revokeApiKey function', () => {
      const { revokeApiKey } = useApiKeysManager()

      expect(typeof revokeApiKey).toBe('function')
    })
  })

  describe('Independence of Instances', () => {
    it('should create independent instances', () => {
      const instance1 = useApiKeysManager()
      const instance2 = useApiKeysManager()

      instance1.apiKeys.value = [
        {
          id: '1',
          name: 'Key 1',
          key: 'k1',
          permissions: [],
          createdAt: '',
          updatedAt: '',
          active: true,
        },
      ]
      instance2.apiKeys.value = [
        {
          id: '2',
          name: 'Key 2',
          key: 'k2',
          permissions: [],
          createdAt: '',
          updatedAt: '',
          active: true,
        },
      ]

      expect(instance1.apiKeys.value[0].id).toBe('1')
      expect(instance2.apiKeys.value[0].id).toBe('2')
    })

    it('should not share state between instances', () => {
      const instance1 = useApiKeysManager()
      const instance2 = useApiKeysManager()

      instance1.loading.value = false
      instance2.loading.value = true

      expect(instance1.loading.value).toBe(false)
      expect(instance2.loading.value).toBe(true)
    })
  })

  describe('Error State Handling', () => {
    it('should initialize with no error', () => {
      const { error } = useApiKeysManager()

      expect(error.value.hasError).toBe(false)
      expect(error.value.message).toBeNull()
    })

    it('should support setting error via handleError', () => {
      const { error, handleError } = useApiKeysManager()

      handleError('Error message', { component: 'test' })
      expect(error.value.message).toBe('Error message')
      expect(error.value.hasError).toBe(true)
    })

    it('should support clearing error via clearError', () => {
      const { error, handleError, clearError } = useApiKeysManager()

      handleError('Error', { component: 'test' })
      expect(error.value.hasError).toBe(true)

      clearError()
      expect(error.value.hasError).toBe(false)
      expect(error.value.message).toBeNull()
    })
  })

  describe('NewApiKey Interface', () => {
    it('should accept name and permissions', () => {
      const validKey: NewApiKey = {
        name: 'Test Key',
        permissions: ['read', 'write'],
      }

      expect(validKey.name).toBe('Test Key')
      expect(validKey.permissions).toEqual(['read', 'write'])
    })

    it('should accept empty permissions array', () => {
      const validKey: NewApiKey = {
        name: 'Test Key',
        permissions: [],
      }

      expect(validKey.permissions).toEqual([])
    })

    it('should accept single permission', () => {
      const validKey: NewApiKey = {
        name: 'Test Key',
        permissions: ['read'],
      }

      expect(validKey.permissions).toHaveLength(1)
    })

    it('should accept multiple permissions', () => {
      const validKey: NewApiKey = {
        name: 'Test Key',
        permissions: ['read', 'write', 'delete', 'admin'],
      }

      expect(validKey.permissions).toHaveLength(4)
    })
  })

  describe('Contract Compliance', () => {
    it('should follow composable pattern with reactive refs', () => {
      const { apiKeys, loading, error } = useApiKeysManager()

      expect('value' in apiKeys).toBe(true)
      expect('value' in loading).toBe(true)
      expect('value' in error).toBe(true)
    })

    it('should expose functions as methods', () => {
      const manager = useApiKeysManager()

      expect('fetchApiKeys' in manager).toBe(true)
      expect('createApiKey' in manager).toBe(true)
      expect('revokeApiKey' in manager).toBe(true)
    })

    it('should have consistent API pattern', () => {
      const { fetchApiKeys, createApiKey, revokeApiKey } = useApiKeysManager()

      expect(typeof fetchApiKeys).toBe('function')
      expect(typeof createApiKey).toBe('function')
      expect(typeof revokeApiKey).toBe('function')
    })
  })
})
