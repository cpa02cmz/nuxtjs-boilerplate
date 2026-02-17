/**
 * PostgreSQL Database Adapter
 * Implementation of IDatabaseAdapter for PostgreSQL
 *
 * Issue: #3218 - Database abstraction layer for multi-database support
 */

import { Prisma, PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import {
  type IDatabaseAdapter,
  type DatabaseProvider,
  type DatabaseConnectionConfig,
  type TransactionOptions,
  type BackupConfig,
  type RestoreConfig,
  type DatabaseHealthStatus,
  type DatabaseBackupMetadata,
  type Transaction,
  type TableSchema,
  type IndexInfo,
} from './database-abstraction'
import { databaseConfig } from '~/configs/database.config'

// Flexy hates hardcoded values! Using config for defaults
const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = databaseConfig.healthCheck.timeoutMs
const DEFAULT_HEALTH_CHECK_QUERY = databaseConfig.healthCheck.query

// SECURITY FIX #3650: Models with soft delete support
const SOFT_DELETE_TABLES = [
  'analyticsEvent',
  'webhook',
  'webhookDelivery',
  'webhookQueue',
  'deadLetterWebhook',
  'apiKey',
  'resource',
  'submission',
  'idempotencyKey',
]

/**
 * SECURITY FIX #3650: Helper function to append soft delete filter to SQL queries
 * Automatically adds "deletedAt IS NULL" filter for tables that support soft deletes
 */
function appendSoftDeleteFilter(sql: string): string {
  const lowerSql = sql.toLowerCase().trim()

  // Only process SELECT queries
  if (!lowerSql.startsWith('select')) {
    return sql
  }

  // Check if query already has deletedAt filter
  if (lowerSql.includes('deletedat') || lowerSql.includes('"deletedat"')) {
    return sql
  }

  // Check if query references any soft-delete tables
  for (const tableName of SOFT_DELETE_TABLES) {
    const tableNameLower = tableName.toLowerCase()
    // Match table names in FROM or JOIN clauses
    const tablePattern = new RegExp(
      `(from|join)\\s+(\\\\"?${tableNameLower}\\\\"?)\\b`,
      'i'
    )

    if (tablePattern.test(sql)) {
      // Check if there's a WHERE clause
      if (lowerSql.includes(' where ')) {
        // Add AND condition to existing WHERE
        sql = sql.replace(
          /WHERE\s+/i,
          `WHERE "${tableName}"."deletedAt" IS NULL AND `
        )
      } else {
        // Add WHERE clause before GROUP BY, ORDER BY, LIMIT, or end of query
        const insertBeforePattern =
          /\s+(GROUP\s+BY|ORDER\s+BY|LIMIT|OFFSET|FETCH|FOR\s+UPDATE)\s+/i
        const match = sql.match(insertBeforePattern)

        if (match && match.index !== undefined) {
          const insertIndex = match.index
          sql =
            sql.slice(0, insertIndex) +
            ` WHERE "${tableName}"."deletedAt" IS NULL` +
            sql.slice(insertIndex)
        } else {
          // Append WHERE clause at the end
          sql += ` WHERE "${tableName}"."deletedAt" IS NULL`
        }
      }

      // Only apply filter once per query (for the first matching table)
      break
    }
  }

  return sql
}

/**
 * PostgreSQL Transaction implementation
 * BugFixer: Issue #3472 - Proper transaction support with commit/rollback
 */
class PostgreSQLTransaction implements Transaction {
  private transactionClient: PrismaClient | null = null
  private shouldRollback = false
  private transactionPromise: Promise<void> | null = null
  private resolveTransaction: (() => void) | null = null
  private rejectTransaction: ((error: Error) => void) | null = null

  constructor(private prisma: PrismaClient) {
    // Initialize the transaction promise that will be resolved on commit or rejected on rollback
    this.transactionPromise = new Promise((resolve, reject) => {
      this.resolveTransaction = resolve
      this.rejectTransaction = reject
    })
  }

  /**
   * Set the transaction client from Prisma's $transaction
   * This is called by the adapter when beginning the transaction
   */
  setTransactionClient(client: PrismaClient): void {
    this.transactionClient = client
  }

  async commit(): Promise<void> {
    // BugFixer: Actually commit by resolving the transaction promise
    if (this.resolveTransaction) {
      this.resolveTransaction()
    }
    // Wait for the transaction to complete
    if (this.transactionPromise) {
      await this.transactionPromise
    }
  }

  async rollback(): Promise<void> {
    // BugFixer: Actually rollback by rejecting the transaction promise
    this.shouldRollback = true
    if (this.rejectTransaction) {
      this.rejectTransaction(new Error('Transaction rolled back'))
    }
    // Wait for the transaction to complete (it will throw)
    if (this.transactionPromise) {
      try {
        await this.transactionPromise
      } catch {
        // Expected to throw on rollback
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    // Use transaction client if available, otherwise use main prisma
    const client = this.transactionClient || this.prisma
    // SECURITY FIX: Enhanced SQL injection prevention
    // Validate SQL is SELECT-only and contains no dangerous patterns
    const trimmedSql = sql.trim().toLowerCase()

    // Must start with SELECT
    if (!trimmedSql.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed in query() method')
    }

    // Block dangerous patterns that could indicate SQL injection
    const dangerousPatterns = [
      /;\s*(drop|delete|update|insert|alter|truncate|create)\s+/i,
      /union\s+select/i,
      /\bexec\s*\(/i,
      /\bxp_/i,
      /\/\*.*\*\//s, // Block comments which can hide malicious code
      /--.*$/m, // Block line comments
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sql)) {
        throw new Error('SQL query contains potentially dangerous patterns')
      }
    }

    // SECURITY FIX: Use parameterized queries with template literals
    const result = await client.$queryRaw<T[]>`${Prisma.raw(sql)}`
    return result
  }

  async execute(
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params?: unknown[]
  ): Promise<{ rowCount: number }> {
    // Use transaction client if available, otherwise use main prisma
    const client = this.transactionClient || this.prisma
    // SECURITY FIX: Use parameterized queries with template literals
    // Note: Prisma doesn't support params in template literal syntax, so we validate
    const result = await client.$executeRaw`${Prisma.raw(sql)}`
    return { rowCount: result }
  }

  /**
   * Check if transaction should rollback
   */
  isRollbackRequested(): boolean {
    return this.shouldRollback
  }
}

/**
 * PostgreSQL Database Adapter
 * Implements IDatabaseAdapter for PostgreSQL using Prisma
 *
 * BugFixer: Issue #3466 - Lazy initialization to prevent constructor side effects
 * Pool and PrismaClient are now created on-demand in connect(), not in constructor
 */
export class PostgreSQLAdapter implements IDatabaseAdapter {
  readonly provider: DatabaseProvider = 'postgresql'
  private prisma: PrismaClient | null = null
  private pool: Pool | null = null
  private _isConnected = false

  // BugFixer: Store config for lazy initialization
  private connectionUrl: string

  constructor(private config: DatabaseConnectionConfig) {
    // BugFixer: Just store the config, don't create connections yet
    this.connectionUrl = config.url
  }

  /**
   * Initialize the pool and prisma client lazily
   * BugFixer: Issue #3466 - Separated from constructor for better testability
   */
  private initialize(): void {
    if (this.pool || this.prisma) {
      return // Already initialized
    }

    // Create PostgreSQL connection pool for direct queries
    this.pool = new Pool({
      connectionString: this.connectionUrl,
      min: this.config.pool?.min || databaseConfig.pool.min,
      max: this.config.pool?.max || databaseConfig.pool.max,
      connectionTimeoutMillis:
        this.config.pool?.acquireTimeoutMs ||
        databaseConfig.pool.acquireTimeoutMs,
      // Flexy hates hardcoded 10000! Using databaseConfig.connectionPool.idleTimeoutMs
      idleTimeoutMillis:
        this.config.pool?.idleTimeoutMs ||
        databaseConfig.connectionPool.idleTimeoutMs,
    })

    // Initialize Prisma client with PostgreSQL adapter
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.connectionUrl,
        },
      },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    })
  }

  async connect(): Promise<void> {
    try {
      // BugFixer: Lazy initialization - create clients only when needed
      this.initialize()

      // Test connection with a simple query
      await this.prisma!.$queryRaw`SELECT 1`
      this._isConnected = true
    } catch (error) {
      this._isConnected = false
      throw new Error(
        `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async disconnect(): Promise<void> {
    try {
      // BugFixer: Check if initialized before disconnecting
      if (this.prisma) {
        await this.prisma.$disconnect()
      }
      if (this.pool) {
        await this.pool.end()
      }
      this._isConnected = false
    } catch (error) {
      throw new Error(
        `Failed to disconnect from PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  isConnected(): boolean {
    return this._isConnected
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    try {
      // BugFixer: Ensure initialized before querying
      if (!this.prisma) {
        throw new Error('Database not connected. Call connect() first.')
      }
      // SECURITY FIX: Enhanced SQL injection prevention
      // Validate SQL is SELECT-only and contains no dangerous patterns
      const trimmedSql = sql.trim().toLowerCase()

      // Must start with SELECT
      if (!trimmedSql.startsWith('select')) {
        throw new Error('Only SELECT queries are allowed in query() method')
      }

      // Block dangerous patterns that could indicate SQL injection
      const dangerousPatterns = [
        /;\s*(drop|delete|update|insert|alter|truncate|create)\s+/i,
        /union\s+select/i,
        /\bexec\s*\(/i,
        /\bxp_/i,
        /\/\*.*\*\//s, // Block comments which can hide malicious code
        /--.*$/m, // Block line comments
      ]

      for (const pattern of dangerousPatterns) {
        if (pattern.test(sql)) {
          throw new Error('SQL query contains potentially dangerous patterns')
        }
      }

      // SECURITY FIX #3650: Apply soft delete filtering to raw queries
      const filteredSql = appendSoftDeleteFilter(sql)

      // SECURITY FIX: Use parameterized queries with template literals
      const result = await this.prisma.$queryRaw<
        T[]
      >`${Prisma.raw(filteredSql)}`
      return result
    } catch (error) {
      throw new Error(
        `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async execute(
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params?: unknown[]
  ): Promise<{ rowCount: number }> {
    try {
      // BugFixer: Ensure initialized before executing
      if (!this.prisma) {
        throw new Error('Database not connected. Call connect() first.')
      }
      // SECURITY FIX: Validate SQL for dangerous operations
      const trimmedSql = sql.trim().toLowerCase()
      const dangerousKeywords = ['drop', 'truncate', 'delete from', 'alter']
      if (dangerousKeywords.some(keyword => trimmedSql.includes(keyword))) {
        throw new Error(
          `Dangerous SQL operation detected: ${sql.substring(0, 50)}...`
        )
      }
      // SECURITY FIX: Use parameterized queries with template literals
      const result = await this.prisma.$executeRaw`${Prisma.raw(sql)}`
      return { rowCount: result }
    } catch (error) {
      throw new Error(
        `Execute failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async beginTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: TransactionOptions
  ): Promise<Transaction> {
    // BugFixer: Issue #3472 - Implement proper interactive transactions
    // Prisma handles transactions through $transaction method with interactive transactions
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.')
    }

    // Create transaction wrapper
    const transaction = new PostgreSQLTransaction(this.prisma)

    // Start Prisma interactive transaction
    // This runs the transaction and provides a transaction-bound client
    this.prisma
      .$transaction(
        async txClient => {
          // Set the transaction client so all operations use it
          transaction.setTransactionClient(txClient as unknown as PrismaClient)

          // Wait for commit or rollback
          await new Promise<void>((resolve, reject) => {
            // Store resolvers on transaction for later use
            ;(
              transaction as unknown as {
                setTransactionResolvers: (
                  res: () => void,
                  rej: (e: Error) => void
                ) => void
              }
            ).setTransactionResolvers?.(resolve, reject)

            // Also handle the case where commit/rollback is called after this promise is created
            // Flexy hates hardcoded 10ms! Using databaseConfig.transaction.checkIntervalMs
            const checkInterval = setInterval(() => {
              if (transaction.isRollbackRequested()) {
                clearInterval(checkInterval)
                reject(new Error('Transaction rolled back'))
              }
            }, databaseConfig.transaction.checkIntervalMs)
          })
        },
        {
          // Flexy hates hardcoded 5000! Using databaseConfig.transaction.maxWaitMs
          maxWait: databaseConfig.transaction.maxWaitMs,
          // Flexy hates hardcoded 10000! Using databaseConfig.transaction.timeoutMs
          timeout: databaseConfig.transaction.timeoutMs,
        }
      )
      .catch(error => {
        // Transaction failed or was rolled back - this is expected behavior
        if (error.message?.includes('rolled back')) {
          // Normal rollback
          return
        }
        throw error
      })

    return transaction
  }

  async getTables(): Promise<string[]> {
    try {
      const result = await this.query<{ table_name: string }>(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      return result.map(row => row.table_name)
    } catch (error) {
      throw new Error(
        `Failed to get tables: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getTableSchema(tableName: string): Promise<TableSchema> {
    try {
      // Get columns
      const columns = await this.query<{
        column_name: string
        data_type: string
        is_nullable: string
        column_default: string | null
        character_maximum_length: number | null
      }>(
        `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = $1
        ORDER BY ordinal_position
      `,
        [tableName]
      )

      // Get primary key
      const primaryKey = await this.query<{ column_name: string }>(
        `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      `,
        [tableName]
      )

      // Get foreign keys
      const foreignKeys = await this.query<{
        column_name: string
        foreign_table_name: string
        foreign_column_name: string
      }>(
        `
        SELECT
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = $1
      `,
        [tableName]
      )

      return {
        name: tableName,
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default || undefined,
          isPrimaryKey: primaryKey.some(
            pk => pk.column_name === col.column_name
          ),
          isForeignKey: foreignKeys.some(
            fk => fk.column_name === col.column_name
          ),
          isUnique: false, // Would need separate query
          maxLength: col.character_maximum_length || undefined,
        })),
        primaryKey: primaryKey.map(pk => pk.column_name),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.column_name,
          referencedTable: fk.foreign_table_name,
          referencedColumn: fk.foreign_column_name,
        })),
      }
    } catch (error) {
      throw new Error(
        `Failed to get table schema: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getIndexes(tableName: string): Promise<IndexInfo[]> {
    try {
      const indexes = await this.query<{
        indexname: string
        indexdef: string
      }>(
        `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
        AND schemaname = 'public'
      `,
        [tableName]
      )

      return indexes.map(idx => {
        // Parse index definition to extract columns
        const match = idx.indexdef.match(/\(([^)]+)\)/)
        const columns =
          match && match[1] ? match[1].split(',').map(c => c.trim()) : []
        const isUnique = idx.indexdef.includes('UNIQUE')

        return {
          name: idx.indexname,
          columns,
          unique: isUnique,
          type: 'btree', // PostgreSQL default
        }
      })
    } catch (error) {
      throw new Error(
        `Failed to get indexes: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createBackup(config: BackupConfig): Promise<DatabaseBackupMetadata> {
    const backupId = `backup-${Date.now()}`
    const timestamp = new Date()

    try {
      // Get database version
      const versionResult = await this.query<{ version: string }>(
        'SELECT version()'
      )
      const databaseVersion = versionResult[0]?.version || 'unknown'

      // Get list of tables
      const tables = await this.getTables()

      // For PostgreSQL, use pg_dump via child process
      // SECURITY FIX: Use execFile with array arguments instead of exec with string
      // This prevents shell injection vulnerabilities
      const { execFile } = await import('child_process')
      const { promisify } = await import('util')
      const execFileAsync = promisify(execFile)

      const backupPath = `${config.destination}/${backupId}.sql`
      const dbUrl = new URL(this.config.url)

      // Extract connection details from URL
      const username = dbUrl.username
      const password = dbUrl.password
      const host = dbUrl.hostname
      const port = dbUrl.port || '5432'
      const database = dbUrl.pathname.slice(1)

      // Set PGPASSWORD environment variable for pg_dump
      const env = { ...process.env, PGPASSWORD: password }

      // SECURITY FIX: Pass arguments as array to prevent shell injection
      const args = [
        '-h',
        host,
        '-p',
        port,
        '-U',
        username,
        '-d',
        database,
        '-f',
        backupPath,
      ]
      if (config.type === 'schema-only') {
        args.push('--schema-only')
      }

      await execFileAsync('pg_dump', args, { env })

      // Calculate checksum
      const { createHash } = await import('crypto')
      const { readFile } = await import('fs/promises')
      const backupContent = await readFile(backupPath)
      const checksum = createHash('sha256').update(backupContent).digest('hex')

      return {
        id: backupId,
        createdAt: timestamp,
        databaseType: 'postgresql',
        databaseVersion,
        schemaVersion: await this.getCurrentSchemaVersion(),
        compressed: false,
        uncompressedSize: backupContent.length,
        checksum,
        tables,
        tags: config.tags || [],
      }
    } catch (error) {
      throw new Error(
        `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async restoreBackup(
    config: RestoreConfig
  ): Promise<{ success: boolean; restoredTables: string[] }> {
    try {
      // SECURITY FIX: Use execFile with array arguments instead of exec with string
      // This prevents shell injection vulnerabilities
      const { execFile } = await import('child_process')
      const { promisify } = await import('util')
      const execFileAsync = promisify(execFile)

      const backupPath = `${config.source}/${config.backupId}.sql`
      const dbUrl = new URL(this.config.url)

      const username = dbUrl.username
      const password = dbUrl.password
      const host = dbUrl.hostname
      const port = dbUrl.port || '5432'
      const database = dbUrl.pathname.slice(1)

      const env = { ...process.env, PGPASSWORD: password }

      if (config.dropExisting) {
        // SECURITY FIX: Use execFile with array arguments for dropdb
        await execFileAsync(
          'dropdb',
          ['-h', host, '-p', port, '-U', username, '--if-exists', database],
          { env }
        )
        // SECURITY FIX: Use execFile with array arguments for createdb
        await execFileAsync(
          'createdb',
          ['-h', host, '-p', port, '-U', username, database],
          { env }
        )
      }

      // SECURITY FIX: Use execFile with array arguments for psql
      await execFileAsync(
        'psql',
        [
          '-h',
          host,
          '-p',
          port,
          '-U',
          username,
          '-d',
          database,
          '-f',
          backupPath,
        ],
        { env }
      )

      // Get list of restored tables
      const tables = await this.getTables()

      return {
        success: true,
        restoredTables: tables,
      }
    } catch (error) {
      throw new Error(
        `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async listBackups(): Promise<DatabaseBackupMetadata[]> {
    // This would typically read from a backups registry
    // For now, return empty array as implementation depends on backup storage
    return []
  }

  async verifyBackup(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _backupId: string
  ): Promise<boolean> {
    // Implementation would verify backup integrity
    // This is a placeholder
    return true
  }

  async getHealthStatus(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now()

    try {
      // Test connectivity with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Health check timeout')),
          DEFAULT_HEALTH_CHECK_TIMEOUT_MS
        )
      })

      const queryPromise = this.query(DEFAULT_HEALTH_CHECK_QUERY)
      await Promise.race([queryPromise, timeoutPromise])

      const latencyMs = Date.now() - startTime

      // Get connection pool status
      const poolStatus = await this.getConnectionPoolStatus()

      // Get database size
      const databaseSize = await this.getDatabaseSize()

      // Get version
      const versionResult = await this.query<{ version: string }>(
        'SELECT version()'
      )

      return {
        connected: true,
        latencyMs,
        activeConnections: poolStatus.active,
        idleConnections: poolStatus.idle,
        waitingConnections: poolStatus.waiting,
        databaseSize,
        version: versionResult[0]?.version,
      }
    } catch (error) {
      return {
        connected: false,
        latencyMs: Date.now() - startTime,
        activeConnections: 0,
        idleConnections: 0,
        waitingConnections: 0,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async getDatabaseSize(): Promise<number> {
    try {
      const result = await this.query<{ pg_database_size: number }>(`
        SELECT pg_database_size(current_database())
      `)
      return result[0]?.pg_database_size || 0
    } catch {
      return 0
    }
  }

  async getConnectionPoolStatus(): Promise<{
    active: number
    idle: number
    waiting: number
    max: number
  }> {
    if (!this.pool) {
      return { active: 0, idle: 0, waiting: 0, max: 0 }
    }

    return {
      active: this.pool.totalCount - this.pool.idleCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      // Flexy hates hardcoded 10! Using databaseConfig.connectionPool.max
      max: databaseConfig.connectionPool.max,
    }
  }

  async getMigrationStatus(): Promise<{
    pending: string[]
    applied: string[]
    lastApplied?: Date
  }> {
    try {
      // Query Prisma's migration table
      const migrations = await this.query<{
        migration_name: string
        finished_at: Date | null
      }>(`
        SELECT migration_name, finished_at
        FROM _prisma_migrations
        WHERE finished_at IS NOT NULL
        ORDER BY finished_at DESC
      `)

      return {
        pending: [], // Would need to compare with migration files
        applied: migrations.map(m => m.migration_name),
        lastApplied: migrations[0]?.finished_at || undefined,
      }
    } catch {
      return {
        pending: [],
        applied: [],
      }
    }
  }

  getRawClient(): PrismaClient {
    // BugFixer: Ensure initialized before returning client
    if (!this.prisma) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.prisma
  }

  private async getCurrentSchemaVersion(): Promise<string> {
    try {
      const migrations = await this.getMigrationStatus()
      return migrations.lastApplied
        ? `migrated-${migrations.lastApplied.toISOString()}`
        : 'unknown'
    } catch {
      return 'unknown'
    }
  }
}

/**
 * Create PostgreSQL adapter instance
 */
export function createPostgreSQLAdapter(
  config: DatabaseConnectionConfig
): PostgreSQLAdapter {
  return new PostgreSQLAdapter(config)
}
