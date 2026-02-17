/**
 * Database Abstraction Layer - Multi-Database Support Interface
 * Provides a unified interface for database operations across different providers
 * Supports PostgreSQL (current) and allows future extension for other databases
 *
 * Issue: #3218 - Database abstraction layer for multi-database support
 */

import type { PrismaClient } from '@prisma/client'

/**
 * Database provider types supported by the abstraction layer
 */
export type DatabaseProvider = 'postgresql' | 'sqlite' | 'mysql'

/**
 * Connection configuration for database providers
 */
export interface DatabaseConnectionConfig {
  provider: DatabaseProvider
  url: string
  directUrl?: string
  pool?: {
    min?: number
    max?: number
    acquireTimeoutMs?: number
    idleTimeoutMs?: number
  }
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  maxWait?: number
  timeout?: number
  isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
}

/**
 * Query options
 */
export interface QueryOptions {
  timeout?: number
  maxResults?: number
}

/**
 * Backup configuration
 */
export interface BackupConfig {
  type: 'full' | 'incremental' | 'schema-only'
  compression?: boolean
  encryption?: boolean
  destination: string
  tags?: string[]
}

/**
 * Restore configuration
 */
export interface RestoreConfig {
  source: string
  backupId: string
  verifyBeforeRestore?: boolean
  dropExisting?: boolean
}

/**
 * Database health status
 */
export interface DatabaseHealthStatus {
  connected: boolean
  latencyMs: number
  activeConnections: number
  idleConnections: number
  waitingConnections: number
  databaseSize?: number
  uptime?: number
  version?: string
  lastError?: string
}

/**
 * Backup metadata
 */
export interface DatabaseBackupMetadata {
  id: string
  createdAt: Date
  databaseType: DatabaseProvider
  databaseVersion?: string
  schemaVersion: string
  compressed: boolean
  compressedSize?: number
  uncompressedSize?: number
  checksum: string
  tables: string[]
  tags: string[]
}

/**
 * Abstract Database Interface
 * All database adapters must implement this interface
 */
export interface IDatabaseAdapter {
  readonly provider: DatabaseProvider

  // Connection Management
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean

  // Query Operations
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>

  // Transaction Support
  beginTransaction(options?: TransactionOptions): Promise<Transaction>

  // Schema Operations
  getTables(): Promise<string[]>
  getTableSchema(tableName: string): Promise<TableSchema>
  getIndexes(tableName: string): Promise<IndexInfo[]>

  // Backup & Restore
  createBackup(config: BackupConfig): Promise<DatabaseBackupMetadata>
  restoreBackup(
    config: RestoreConfig
  ): Promise<{ success: boolean; restoredTables: string[] }>
  listBackups(): Promise<DatabaseBackupMetadata[]>
  verifyBackup(backupId: string): Promise<boolean>

  // Health & Monitoring
  getHealthStatus(): Promise<DatabaseHealthStatus>
  getDatabaseSize(): Promise<number>
  getConnectionPoolStatus(): Promise<{
    active: number
    idle: number
    waiting: number
    max: number
  }>

  // Migration Support
  getMigrationStatus(): Promise<{
    pending: string[]
    applied: string[]
    lastApplied?: Date
  }>

  // Raw Client Access (for advanced operations)
  getRawClient(): PrismaClient
}

/**
 * Transaction interface
 */
export interface Transaction {
  commit(): Promise<void>
  rollback(): Promise<void>
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>
  execute(sql: string, params?: unknown[]): Promise<{ rowCount: number }>
}

/**
 * Table schema information
 */
export interface TableSchema {
  name: string
  columns: ColumnInfo[]
  primaryKey?: string[]
  foreignKeys: ForeignKeyInfo[]
}

/**
 * Column information
 */
export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue?: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  isUnique: boolean
  maxLength?: number
}

/**
 * Foreign key information
 */
export interface ForeignKeyInfo {
  column: string
  referencedTable: string
  referencedColumn: string
  onDelete?: string
  onUpdate?: string
}

/**
 * Index information
 */
export interface IndexInfo {
  name: string
  columns: string[]
  unique: boolean
  type: 'btree' | 'hash' | 'gin' | 'gist' | string
}

/**
 * Database abstraction factory
 * Creates appropriate adapter based on provider
 */
export interface IDatabaseFactory {
  createAdapter(config: DatabaseConnectionConfig): IDatabaseAdapter
  getSupportedProviders(): DatabaseProvider[]
}

/**
 * Repository interface for data access
 * Provides CRUD operations for entities
 */
export interface IRepository<T, CreateInput, UpdateInput, WhereInput> {
  findMany(params: {
    where?: WhereInput
    take?: number
    skip?: number
    orderBy?: Record<string, 'asc' | 'desc'>
    include?: Record<string, boolean>
  }): Promise<T[]>

  findUnique(where: WhereInput): Promise<T | null>

  findFirst(params: {
    where?: WhereInput
    orderBy?: Record<string, 'asc' | 'desc'>
  }): Promise<T | null>

  create(data: CreateInput): Promise<T>

  update(params: { where: WhereInput; data: UpdateInput }): Promise<T>

  delete(where: WhereInput): Promise<T>

  count(where?: WhereInput): Promise<number>

  exists(where: WhereInput): Promise<boolean>
}

/**
 * Soft delete repository interface
 * Extends base repository with soft delete capabilities
 */
export interface ISoftDeleteRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
> extends IRepository<T, CreateInput, UpdateInput, WhereInput> {
  softDelete(where: WhereInput): Promise<T>
  restore(where: WhereInput): Promise<T>
  findWithDeleted(params: {
    where?: WhereInput
    take?: number
    skip?: number
  }): Promise<T[]>
}

/**
 * Database configuration interface
 */
export interface DatabaseAbstractionConfig {
  provider: DatabaseProvider
  connection: DatabaseConnectionConfig
  softDeleteModels: string[]
  healthCheck: {
    enabled: boolean
    intervalMs: number
    timeoutMs: number
    query: string
  }
  logging: {
    enabled: boolean
    level: 'debug' | 'info' | 'warn' | 'error'
    slowQueryThresholdMs: number
  }
}
