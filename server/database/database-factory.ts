/**
 * Database Factory
 * Creates appropriate database adapter based on provider configuration
 *
 * Issue: #3218 - Database abstraction layer for multi-database support
 */

import {
  type IDatabaseAdapter,
  type DatabaseConnectionConfig,
  type DatabaseProvider,
  type IDatabaseFactory,
} from './database-abstraction'
import { createPostgreSQLAdapter } from './postgresql-adapter'
import { databaseConfig } from '~/configs/database.config'

// Singleton instance cache
const adapterCache = new Map<string, IDatabaseAdapter>()

/**
 * Database Factory implementation
 * Creates and caches database adapters
 */
export class DatabaseFactory implements IDatabaseFactory {
  private static instance: DatabaseFactory

  private constructor() {}

  /**
   * Get singleton instance of DatabaseFactory
   */
  static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory()
    }
    return DatabaseFactory.instance
  }

  /**
   * Create database adapter based on provider type
   */
  createAdapter(config: DatabaseConnectionConfig): IDatabaseAdapter {
    // Create cache key from provider and URL
    const cacheKey = `${config.provider}-${config.url}`

    // Check if adapter already exists in cache
    if (adapterCache.has(cacheKey)) {
      return adapterCache.get(cacheKey)!
    }

    let adapter: IDatabaseAdapter

    switch (config.provider) {
      case 'postgresql':
        adapter = createPostgreSQLAdapter(config)
        break

      case 'sqlite':
        throw new Error(
          'SQLite adapter not yet implemented. Use PostgreSQL for now. ' +
            'See Issue #3218 for SQLite support timeline.'
        )

      case 'mysql':
        throw new Error(
          'MySQL adapter not yet implemented. Use PostgreSQL for now. ' +
            'See Issue #3218 for MySQL support timeline.'
        )

      default:
        throw new Error(`Unsupported database provider: ${config.provider}`)
    }

    // Cache the adapter
    adapterCache.set(cacheKey, adapter)

    return adapter
  }

  /**
   * Get list of supported database providers
   */
  getSupportedProviders(): DatabaseProvider[] {
    return ['postgresql'] // SQLite and MySQL planned for future
  }

  /**
   * Clear adapter cache
   * Useful for testing or when reconfiguring connections
   */
  clearCache(): void {
    adapterCache.clear()
  }

  /**
   * Get cached adapter by cache key
   */
  getCachedAdapter(cacheKey: string): IDatabaseAdapter | undefined {
    return adapterCache.get(cacheKey)
  }

  /**
   * Check if adapter is cached
   */
  hasCachedAdapter(cacheKey: string): boolean {
    return adapterCache.has(cacheKey)
  }

  /**
   * Gracefully shutdown all cached adapters
   * Disconnects all adapters and clears the cache
   * Important for graceful server shutdowns
   */
  async shutdownAll(): Promise<{ disconnected: number; errors: Error[] }> {
    const errors: Error[] = []
    let disconnected = 0

    for (const [cacheKey, adapter] of adapterCache.entries()) {
      try {
        if (adapter.isConnected()) {
          await adapter.disconnect()
          disconnected++
        }
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error
            : new Error(`Failed to disconnect adapter ${cacheKey}`)
        )
      }
    }

    adapterCache.clear()
    defaultAdapter = null

    return { disconnected, errors }
  }
}

/**
 * Create database adapter from environment configuration
 * Uses DATABASE_URL and DB_PROVIDER environment variables
 */
export function createAdapterFromEnv(): IDatabaseAdapter {
  const factory = DatabaseFactory.getInstance()

  const provider = (process.env.DB_PROVIDER as DatabaseProvider) || 'postgresql'
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL environment variable is required. ' +
        'Please set it in your .env file or environment.'
    )
  }

  const config: DatabaseConnectionConfig = {
    provider,
    url,
    directUrl: process.env.DIRECT_URL || url,
    pool: {
      // Flexy hates hardcoded values! Using databaseConfig.connectionPool
      min: parseInt(
        process.env.DB_POOL_MIN || String(databaseConfig.connectionPool.min)
      ),
      max: parseInt(
        process.env.DB_POOL_MAX || String(databaseConfig.connectionPool.max)
      ),
      acquireTimeoutMs: parseInt(
        process.env.DB_ACQUIRE_TIMEOUT_MS ||
          String(databaseConfig.connectionPool.acquireTimeoutMs)
      ),
      idleTimeoutMs: parseInt(
        process.env.DB_IDLE_TIMEOUT_MS ||
          String(databaseConfig.connectionPool.idleTimeoutMs)
      ),
    },
  }

  return factory.createAdapter(config)
}

/**
 * Get or create the default database adapter
 * Uses singleton pattern for connection reuse
 */
let defaultAdapter: IDatabaseAdapter | null = null

export function getDefaultAdapter(): IDatabaseAdapter {
  if (!defaultAdapter) {
    defaultAdapter = createAdapterFromEnv()
  }
  return defaultAdapter
}

/**
 * Reset default adapter (useful for testing)
 */
export function resetDefaultAdapter(): void {
  defaultAdapter = null
  DatabaseFactory.getInstance().clearCache()
}

// Export singleton factory instance
export const databaseFactory = DatabaseFactory.getInstance()
