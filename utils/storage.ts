import logger from './logger'

/**
 * Storage Adapter Interface
 *
 * Abstracts storage operations to enable:
 * - Swappable storage backends (localStorage, memory, IndexedDB, etc.)
 * - Easy testing with mock storage
 * - Cleaner separation of concerns
 *
 * @example
 * ```typescript
 * // Production usage
 * const storage = createLocalStorageAdapter<Bookmark[]>('bookmarks', [])
 *
 * // Testing usage
 * const storage = createMemoryStorageAdapter<Bookmark[]>([])
 *
 * // Usage in composable
 * const bookmarks = ref(storage.get())
 * storage.set(bookmarks.value)
 * ```
 */
export interface StorageAdapter<T> {
  /**
   * Get the stored value
   * Returns default value if no value is stored or on error
   */
  get(): T

  /**
   * Set the stored value
   * @returns true if successful, false otherwise
   */
  set(value: T): boolean

  /**
   * Remove the stored value
   * @returns true if successful, false otherwise
   */
  remove(): boolean
}

/**
 * Base options for storage adapters
 */
export interface StorageAdapterOptions<T> {
  /**
   * Serializer function to convert value to string
   * @default JSON.stringify
   */
  serializer?: (value: T) => string
  /**
   * Deserializer function to convert string to value
   * @default JSON.parse
   */
  deserializer?: (value: string) => T
  /**
   * Default value to return if no stored value exists
   */
  defaultValue: T
}

/**
 * Date-aware serializer that preserves Date objects
 * Dates are stored as { __date__: true, value: ISOString }
 */
export const dateSerializer = <T>(value: T): string => {
  return JSON.stringify(value, (_, v) => {
    if (v instanceof Date) {
      return { __date__: true, value: v.toISOString() }
    }
    return v
  })
}

/**
 * Date-aware deserializer that restores Date objects
 */
export const dateDeserializer = <T>(value: string): T => {
  return JSON.parse(value, (_, v) => {
    if (v && typeof v === 'object' && v.__date__ === true) {
      return new Date(v.value)
    }
    return v
  })
}

/**
 * Creates a localStorage-based storage adapter
 *
 * @param key - The storage key
 * @param defaultValue - Default value if no stored value exists
 * @param options - Optional serializer/deserializer
 * @returns StorageAdapter instance
 *
 * @example
 * ```typescript
 * const storage = createLocalStorageAdapter<UserPreferences>('preferences', {
 *   theme: 'light',
 *   notifications: true
 * })
 *
 * const prefs = storage.get()
 * prefs.theme = 'dark'
 * storage.set(prefs)
 * ```
 */
export function createLocalStorageAdapter<T>(
  key: string,
  defaultValue: T,
  options: Omit<StorageAdapterOptions<T>, 'defaultValue'> = {}
): StorageAdapter<T> {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options

  return {
    get(): T {
      if (typeof window === 'undefined') return defaultValue

      try {
        const stored = localStorage.getItem(key)
        if (stored === null) return defaultValue
        return deserializer(stored)
      } catch (e) {
        logger.error(`Error reading from localStorage (key: ${key}):`, e)
        return defaultValue
      }
    },

    set(value: T): boolean {
      if (typeof window === 'undefined') return false

      try {
        localStorage.setItem(key, serializer(value))
        return true
      } catch (e) {
        logger.error(`Error writing to localStorage (key: ${key}):`, e)
        return false
      }
    },

    remove(): boolean {
      if (typeof window === 'undefined') return false

      try {
        localStorage.removeItem(key)
        return true
      } catch (e) {
        logger.error(`Error removing from localStorage (key: ${key}):`, e)
        return false
      }
    },
  }
}

/**
 * Creates an in-memory storage adapter
 * Useful for testing and server-side rendering
 *
 * @param defaultValue - Default value
 * @param options - Optional serializer/deserializer
 * @returns StorageAdapter instance
 *
 * @example
 * ```typescript
 * // In tests
 * const storage = createMemoryStorageAdapter<Bookmark[]>([])
 *
 * // Simulate adding bookmarks
 * storage.set([{ id: '1', title: 'Test' }])
 * expect(storage.get()).toHaveLength(1)
 *
 * // Clean up
 * storage.remove()
 * expect(storage.get()).toHaveLength(0)
 * ```
 */
export function createMemoryStorageAdapter<T>(
  defaultValue: T,
  options: Omit<StorageAdapterOptions<T>, 'defaultValue'> = {}
): StorageAdapter<T> {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options
  let storedValue: string | null = null

  return {
    get(): T {
      if (storedValue === null) return defaultValue

      try {
        return deserializer(storedValue)
      } catch (e) {
        logger.error('Error deserializing from memory storage:', e)
        return defaultValue
      }
    },

    set(value: T): boolean {
      try {
        storedValue = serializer(value)
        return true
      } catch (e) {
        logger.error('Error serializing to memory storage:', e)
        return false
      }
    },

    remove(): boolean {
      storedValue = null
      return true
    },
  }
}

/**
 * Creates a sessionStorage-based storage adapter
 * Data persists for the session only
 *
 * @param key - The storage key
 * @param defaultValue - Default value if no stored value exists
 * @param options - Optional serializer/deserializer
 * @returns StorageAdapter instance
 *
 * @example
 * ```typescript
 * const storage = createSessionStorageAdapter<FormData>('draft-form', {})
 *
 * // Auto-save form data
 * storage.set(formData)
 *
 * // Restore on page reload
 * const saved = storage.get()
 * ```
 */
export function createSessionStorageAdapter<T>(
  key: string,
  defaultValue: T,
  options: Omit<StorageAdapterOptions<T>, 'defaultValue'> = {}
): StorageAdapter<T> {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options

  return {
    get(): T {
      if (typeof window === 'undefined') return defaultValue

      try {
        const stored = sessionStorage.getItem(key)
        if (stored === null) return defaultValue
        return deserializer(stored)
      } catch (e) {
        logger.error(`Error reading from sessionStorage (key: ${key}):`, e)
        return defaultValue
      }
    },

    set(value: T): boolean {
      if (typeof window === 'undefined') return false

      try {
        sessionStorage.setItem(key, serializer(value))
        return true
      } catch (e) {
        logger.error(`Error writing to sessionStorage (key: ${key}):`, e)
        return false
      }
    },

    remove(): boolean {
      if (typeof window === 'undefined') return false

      try {
        sessionStorage.removeItem(key)
        return true
      } catch (e) {
        logger.error(`Error removing from sessionStorage (key: ${key}):`, e)
        return false
      }
    },
  }
}

/**
 * Creates a localStorage adapter with Date serialization support
 *
 * @param key - The storage key
 * @param defaultValue - Default value if no stored value exists
 * @returns StorageAdapter instance with Date support
 *
 * @example
 * ```typescript
 * interface Event {
 *   id: string
 *   createdAt: Date
 * }
 *
 * const storage = createLocalStorageWithDates<Event[]>('events', [])
 * storage.set([{ id: '1', createdAt: new Date() }])
 *
 * const events = storage.get()
 * // events[0].createdAt is a Date object, not a string
 * ```
 */
export function createLocalStorageWithDates<T>(
  key: string,
  defaultValue: T
): StorageAdapter<T> {
  return createLocalStorageAdapter(key, defaultValue, {
    serializer: dateSerializer,
    deserializer: dateDeserializer,
  })
}

/**
 * Creates a memory storage adapter with Date serialization support
 *
 * @param defaultValue - Default value
 * @returns StorageAdapter instance with Date support
 */
export function createMemoryStorageWithDates<T>(
  defaultValue: T
): StorageAdapter<T> {
  return createMemoryStorageAdapter(defaultValue, {
    serializer: dateSerializer,
    deserializer: dateDeserializer,
  })
}

/**
 * Factory function to create the appropriate storage adapter
 * Automatically selects localStorage for client, memory for SSR
 *
 * @param key - The storage key
 * @param defaultValue - Default value if no stored value exists
 * @param options - Optional configuration
 * @returns StorageAdapter instance
 *
 * @example
 * ```typescript
 * const storage = createStorage('user-prefs', defaultPrefs)
 * // Uses localStorage on client, memory storage on server
 * ```
 */
export function createStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    useDates?: boolean
    storageType?: 'local' | 'session' | 'memory'
  } = {}
): StorageAdapter<T> {
  const { useDates = false, storageType = 'local' } = options

  const serializer = useDates ? dateSerializer : JSON.stringify
  const deserializer = useDates ? dateDeserializer : JSON.parse

  switch (storageType) {
    case 'session':
      return createSessionStorageAdapter(key, defaultValue, {
        serializer,
        deserializer,
      })
    case 'memory':
      return createMemoryStorageAdapter(defaultValue, {
        serializer,
        deserializer,
      })
    case 'local':
    default:
      return createLocalStorageAdapter(key, defaultValue, {
        serializer,
        deserializer,
      })
  }
}

/**
 * Creates a storage instance with date serialization support
 * @deprecated Use createLocalStorageWithDates instead
 */
export const createStorageWithDateSerialization = <T>(
  key: string,
  defaultValue: T
): StorageAdapter<T> => {
  return createLocalStorageWithDates<T>(key, defaultValue)
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use StorageAdapter instead
 */
export interface StorageOptions<T> {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}
