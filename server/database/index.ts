/**
 * Database Abstraction Layer - Main Export File
 *
 * Provides unified database interface supporting multiple providers.
 * Currently supports PostgreSQL with SQLite and MySQL planned for future.
 *
 * Issue: #3218 - Database abstraction layer for multi-database support
 *
 * @example
 * ```typescript
 * // Using the factory
 * import { databaseFactory, createAdapterFromEnv } from '~/server/database'
 *
 * const adapter = createAdapterFromEnv()
 * await adapter.connect()
 *
 * // Query data
 * const results = await adapter.query('SELECT * FROM users WHERE active = $1', [true])
 *
 * // Get health status
 * const health = await adapter.getHealthStatus()
 * console.log(`Database connected: ${health.connected}`)
 * ```
 */

// Core interfaces and types
export {
  type IDatabaseAdapter,
  type DatabaseProvider,
  type DatabaseConnectionConfig,
  type TransactionOptions,
  type QueryOptions,
  type BackupConfig,
  type RestoreConfig,
  type DatabaseHealthStatus,
  type DatabaseBackupMetadata,
  type Transaction,
  type TableSchema,
  type ColumnInfo,
  type ForeignKeyInfo,
  type IndexInfo,
  type IDatabaseFactory,
  type IRepository,
  type ISoftDeleteRepository,
  type DatabaseAbstractionConfig,
} from './database-abstraction'

// Factory and adapter creation
export {
  DatabaseFactory,
  createAdapterFromEnv,
  getDefaultAdapter,
  resetDefaultAdapter,
  databaseFactory,
} from './database-factory'

/**
 * Gracefully shutdown all database adapters
 * Call this during server shutdown to properly close connections
 */
export async function shutdownAllAdapters(): Promise<{
  disconnected: number
  errors: Error[]
}> {
  return databaseFactory.shutdownAll()
}

// PostgreSQL adapter
export {
  PostgreSQLAdapter,
  createPostgreSQLAdapter,
} from './postgresql-adapter'

// Re-export Prisma types for convenience
export { PrismaClient, Prisma } from '@prisma/client'
