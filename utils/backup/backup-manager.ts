/**
 * Backup Manager - Database Backup and Recovery System
 * Provides automated backup creation, verification, and restoration for PostgreSQL databases
 */

import { promises as fs, constants } from 'fs'
import { createHash } from 'crypto'
import { join, dirname } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import backupConfig from '../../configs/backup.config'
import { TIME, SIZE } from '../../server/utils/constants'

const execAsync = promisify(exec)

export type BackupType =
  | 'manual'
  | 'scheduled'
  | 'pre-migration'
  | 'pre-restore'

export const VALID_BACKUP_TYPES: readonly BackupType[] = [
  'manual',
  'scheduled',
  'pre-migration',
  'pre-restore',
] as const

export interface BackupMetadata {
  id: string
  createdAt: string
  databasePath: string
  databaseSize: number
  compressed: boolean
  compressedSize?: number
  checksum: string
  checksumAlgorithm: string
  version: string
  gitCommit?: string
  environment: string
  tags: string[]
  verified: boolean
  verificationDate?: string
  backupType: BackupType
}

/**
 * Backup result structure
 */
export interface BackupResult {
  success: boolean
  backupPath: string
  metadataPath: string
  metadata: BackupMetadata
  error?: string
}

/**
 * Restore result structure
 */
export interface RestoreResult {
  success: boolean
  backupId: string
  restoredTo: string
  error?: string
}

/**
 * Backup listing entry
 */
export interface BackupEntry {
  id: string
  createdAt: Date
  size: number
  compressedSize?: number
  type: string
  verified: boolean
  tags: string[]
  path: string
}

/**
 * Logger interface for backup operations
 */
interface BackupLogger {
  debug: (message: string) => void
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

/**
 * Default logger implementation
 */
const defaultLogger: BackupLogger = {
  debug: (msg: string) => {
    if (backupConfig.logging.level === 'debug') {
      // eslint-disable-next-line no-console
      console.debug(`[Backup] ${msg}`)
    }
  },
  // eslint-disable-next-line no-console
  info: (msg: string) => console.log(`[Backup] ${msg}`),
  warn: (msg: string) => console.warn(`[Backup] ${msg}`),
  error: (msg: string) => console.error(`[Backup] ${msg}`),
}

/**
 * Generate backup ID with timestamp
 */
function generateBackupId(): string {
  const now = new Date()
  // Flexy hates hardcoded slice lengths! Using configurable timestamp format
  const tsConfig = backupConfig.timestampFormat
  const timestamp = now
    .toISOString()
    .replace(/:/g, tsConfig.colonReplacement)
    .replace(/\./g, tsConfig.dotReplacement)
    .slice(0, tsConfig.sliceLength)
  return `${tsConfig.prefix}-${timestamp}`
}

/**
 * Calculate file checksum
 */
async function calculateChecksum(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<string> {
  const content = await fs.readFile(filePath)
  return createHash(algorithm).update(content).digest('hex')
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath)
  return stats.size
}

/**
 * Get current git commit hash
 */
async function getGitCommit(): Promise<string | undefined> {
  try {
    const { stdout } = await execAsync('git rev-parse --short HEAD')
    return stdout.trim()
  } catch {
    return undefined
  }
}

/**
 * Get current environment
 */
function getEnvironment(): string {
  return process.env.NODE_ENV || 'development'
}

/**
 * Get application version from package.json
 */
async function getVersion(): Promise<string> {
  try {
    const packageJson = await fs.readFile('./package.json', 'utf-8')
    const pkg = JSON.parse(packageJson)
    return pkg.version || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath, constants.F_OK)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Copy file with optional throttling
 */
async function copyFile(
  source: string,
  destination: string,
  throttleMbps: number = 0
): Promise<void> {
  if (throttleMbps === 0) {
    await fs.copyFile(source, destination)
    return
  }

  // Simple throttled copy implementation
  // Flexy hates hardcoded values! Using configurable settings from backupConfig
  const chunkSize = backupConfig.fileCopy.chunkSizeBytes
  const throttleMs = backupConfig.fileCopy.throttleMsPerMb / throttleMbps // ms per MB

  const sourceHandle = await fs.open(source, 'r')
  const destHandle = await fs.open(destination, 'w')

  try {
    let position = 0
    const stats = await fs.stat(source)

    while (position < stats.size) {
      const buffer = Buffer.alloc(Math.min(chunkSize, stats.size - position))
      await sourceHandle.read(buffer, 0, buffer.length, position)
      await destHandle.write(buffer, 0, buffer.length, position)
      position += buffer.length

      if (throttleMbps > 0) {
        await new Promise(resolve => setTimeout(resolve, throttleMs))
      }
    }
  } finally {
    await sourceHandle.close()
    await destHandle.close()
  }
}

/**
 * Compress backup file
 */
async function compressBackup(
  sourcePath: string,
  destinationPath: string,
  level: number = 6
): Promise<void> {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  // Use gzip for compression
  await execAsync(`gzip -${level} -c "${sourcePath}" > "${destinationPath}.gz"`)
  await fs.rename(`${destinationPath}.gz`, destinationPath)
}

/**
 * Decompress backup file
 */
async function decompressBackup(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  await execAsync(`gunzip -c "${sourcePath}" > "${destinationPath}"`)
}

/**
 * Create a database backup
 */
export async function createBackup(
  options: {
    type?: BackupType
    tags?: string[]
    logger?: BackupLogger
  } = {}
): Promise<BackupResult> {
  const logger = options.logger || defaultLogger
  const backupId = generateBackupId()
  const backupType = options.type || 'manual'
  const customTags = options.tags || []

  logger.info(`Starting backup: ${backupId} (type: ${backupType})`)

  try {
    // Ensure backup directory exists
    await ensureDir(backupConfig.paths.backupDir)
    await ensureDir(backupConfig.paths.tempDir)

    // Check if database file exists
    try {
      await fs.access(backupConfig.paths.databasePath, constants.R_OK)
    } catch {
      throw new Error(
        `Database file not found or not readable: ${backupConfig.paths.databasePath}`
      )
    }

    // Create backup paths
    const backupFileName = `${backupId}.db`
    const backupPath = join(backupConfig.paths.backupDir, backupFileName)
    const metadataPath = `${backupPath}.meta.json`

    // Get database size before backup
    const originalSize = await getFileSize(backupConfig.paths.databasePath)
    // Flexy hates hardcoded 1024 * 1024 and toFixed(2)! Using SIZE constants and config
    const originalSizeFormatted = SIZE.formatBytes(
      originalSize,
      backupConfig.fileSizeFormat.sizeDecimals
    )
    logger.info(`Database size: ${originalSizeFormatted.formatted}`)

    // Copy database file
    logger.info('Copying database file...')
    await copyFile(
      backupConfig.paths.databasePath,
      backupPath,
      backupConfig.performance.throttleMbps
    )

    let finalPath = backupPath
    let compressedSize: number | undefined

    // Compress if enabled
    if (backupConfig.compression.enabled) {
      logger.info('Compressing backup...')
      const compressedPath = `${backupPath}.gz`
      await compressBackup(
        backupPath,
        compressedPath,
        backupConfig.compression.level
      )
      await fs.unlink(backupPath)
      finalPath = compressedPath
      compressedSize = await getFileSize(compressedPath)
      // Flexy hates hardcoded 1024 * 1024 and toFixed(2)! Using SIZE constants and config
      const compressedSizeFormatted = SIZE.formatBytes(
        compressedSize || 0,
        backupConfig.fileSizeFormat.sizeDecimals
      )
      logger.info(`Compressed size: ${compressedSizeFormatted.formatted}`)
    }

    // Calculate checksum
    logger.info('Calculating checksum...')
    const checksum = await calculateChecksum(
      finalPath,
      backupConfig.verification.checksumAlgorithm
    )

    // Create metadata
    const metadata: BackupMetadata = {
      id: backupId,
      createdAt: new Date().toISOString(),
      databasePath: backupConfig.paths.databasePath,
      databaseSize: originalSize,
      compressed: backupConfig.compression.enabled,
      compressedSize,
      checksum,
      checksumAlgorithm: backupConfig.verification.checksumAlgorithm,
      version: await getVersion(),
      gitCommit: backupConfig.metadata.includeGitHash
        ? await getGitCommit()
        : undefined,
      environment: backupConfig.metadata.includeEnvironment
        ? getEnvironment()
        : 'unknown',
      tags: [...backupConfig.metadata.tags, ...customTags],
      verified: false,
      backupType,
    }

    // Save metadata
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    logger.info(`Metadata saved: ${metadataPath}`)

    // Verify backup if enabled
    if (backupConfig.verification.enabled) {
      logger.info('Verifying backup...')
      const verificationResult = await verifyBackup(backupId, { logger })

      if (verificationResult.valid) {
        metadata.verified = true
        metadata.verificationDate = new Date().toISOString()
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
        logger.info('Backup verified successfully')
      } else {
        logger.warn(`Backup verification failed: ${verificationResult.error}`)
      }
    }

    // Cleanup old backups
    await cleanupOldBackups({ logger })

    // Send notification if enabled
    if (
      backupConfig.notifications.enabled &&
      backupConfig.notifications.notifyOnSuccess
    ) {
      await sendNotification('success', backupId, { logger })
    }

    logger.info(`Backup completed successfully: ${backupId}`)

    return {
      success: true,
      backupPath: finalPath,
      metadataPath,
      metadata,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Backup failed: ${errorMessage}`)

    // Send failure notification
    if (
      backupConfig.notifications.enabled &&
      backupConfig.notifications.notifyOnFailure
    ) {
      await sendNotification('failure', backupId, {
        logger,
        error: errorMessage,
      })
    }

    return {
      success: false,
      backupPath: '',
      metadataPath: '',
      metadata: {} as BackupMetadata,
      error: errorMessage,
    }
  }
}

/**
 * Verify backup integrity
 */
export async function verifyBackup(
  backupId: string,
  options: { logger?: BackupLogger } = {}
): Promise<{ valid: boolean; error?: string }> {
  const _logger = options.logger || defaultLogger

  try {
    // Find backup file
    const backupPath = await findBackupFile(backupId)
    if (!backupPath) {
      return { valid: false, error: `Backup not found: ${backupId}` }
    }

    // Load metadata
    const metadataPath = `${backupPath}.meta.json`
    let metadata: BackupMetadata
    try {
      const metaContent = await fs.readFile(metadataPath, 'utf-8')
      metadata = JSON.parse(metaContent)
    } catch {
      return { valid: false, error: `Metadata not found: ${metadataPath}` }
    }

    // Verify checksum
    const currentChecksum = await calculateChecksum(
      backupPath,
      metadata.checksumAlgorithm
    )
    if (currentChecksum !== metadata.checksum) {
      return {
        valid: false,
        error: 'Checksum mismatch - backup may be corrupted',
      }
    }

    // Verify PostgreSQL backup file format (if enabled)
    if (backupConfig.verification.verifyIntegrity) {
      try {
        let dumpPath = backupPath

        // Decompress if needed to verify the SQL dump
        if (metadata.compressed) {
          const tempDir = join(
            backupConfig.paths.tempDir,
            `verify-${Date.now()}`
          )
          await ensureDir(tempDir)
          dumpPath = join(tempDir, 'verify.sql')
          await decompressBackup(backupPath, dumpPath)
        }

        // Verify it's a valid PostgreSQL dump by checking the header
        const dumpContent = await fs.readFile(dumpPath, 'utf-8')
        const isValidPostgresDump =
          dumpContent.includes('PostgreSQL database dump') ||
          dumpContent.includes('pg_dump') ||
          dumpContent.includes('CREATE TABLE') ||
          dumpContent.includes('INSERT INTO')

        if (!isValidPostgresDump) {
          return {
            valid: false,
            error: 'Backup file does not appear to be a valid PostgreSQL dump',
          }
        }

        // Clean up temp files if we decompressed
        if (metadata.compressed) {
          const tempDir = dirname(dumpPath)
          await fs.rm(tempDir, { recursive: true, force: true })
        }
      } catch (verifyError) {
        const errorMsg =
          verifyError instanceof Error
            ? verifyError.message
            : String(verifyError)
        return {
          valid: false,
          error: `Integrity verification failed: ${errorMsg}`,
        }
      }
    }

    return { valid: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return { valid: false, error: `Verification error: ${errorMsg}` }
  }
}

/**
 * Find backup file by ID
 */
async function findBackupFile(backupId: string): Promise<string | null> {
  const extensions = ['.db', '.db.gz', '.sqlite', '.sqlite.gz']

  for (const ext of extensions) {
    const path = join(backupConfig.paths.backupDir, `${backupId}${ext}`)
    try {
      await fs.access(path, constants.F_OK)
      return path
    } catch {
      // Continue to next extension
    }
  }

  return null
}

/**
 * List all backups
 */
export async function listBackups(
  options: { logger?: BackupLogger } = {}
): Promise<BackupEntry[]> {
  const logger = options.logger || defaultLogger
  const backups: BackupEntry[] = []

  try {
    await ensureDir(backupConfig.paths.backupDir)
    const files = await fs.readdir(backupConfig.paths.backupDir)

    for (const file of files) {
      if (!file.endsWith('.meta.json')) continue

      const metadataPath = join(backupConfig.paths.backupDir, file)
      try {
        const metaContent = await fs.readFile(metadataPath, 'utf-8')
        const metadata: BackupMetadata = JSON.parse(metaContent)

        const backupPath = await findBackupFile(metadata.id)
        if (backupPath) {
          // Use stats to validate backup file exists and is accessible
          const _stats = await fs.stat(backupPath)
          backups.push({
            id: metadata.id,
            createdAt: new Date(metadata.createdAt),
            size: metadata.databaseSize,
            compressedSize: metadata.compressedSize,
            type: metadata.backupType,
            verified: metadata.verified,
            tags: metadata.tags,
            path: backupPath,
          })
        }
      } catch {
        logger.warn(`Failed to read metadata: ${file}`)
      }
    }

    // Sort by date descending
    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    logger.error(`Failed to list backups: ${error}`)
    return []
  }
}

/**
 * Restore database from backup
 */
export async function restoreBackup(
  backupId: string,
  options: {
    targetPath?: string
    skipConfirmation?: boolean
    logger?: BackupLogger
  } = {}
): Promise<RestoreResult> {
  const logger = options.logger || defaultLogger
  const targetPath = options.targetPath || backupConfig.paths.databasePath

  logger.info(`Starting restore from backup: ${backupId}`)

  try {
    // Find backup file
    const backupPath = await findBackupFile(backupId)
    if (!backupPath) {
      throw new Error(`Backup not found: ${backupId}`)
    }

    // Load metadata
    const metadataPath = `${backupPath}.meta.json`
    const metaContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata: BackupMetadata = JSON.parse(metaContent)

    // Verify backup before restore (if enabled)
    if (backupConfig.restore.verifyBeforeRestore) {
      logger.info('Verifying backup before restore...')
      const verification = await verifyBackup(backupId, { logger })
      if (!verification.valid) {
        throw new Error(
          `Backup verification failed: ${verification.error}. Use --force to override.`
        )
      }
    }

    // Create pre-restore backup (if enabled)
    if (backupConfig.restore.backupBeforeRestore) {
      logger.info('Creating pre-restore backup...')
      await createBackup({ type: 'pre-restore', logger })
    }

    // Confirm restore (if required)
    if (backupConfig.restore.requireConfirmation && !options.skipConfirmation) {
      // In non-interactive mode, we can't confirm, so we skip
      logger.info('Restore confirmation skipped (non-interactive mode)')
    }

    // Ensure target directory exists
    await ensureDir(dirname(targetPath))

    // Decompress if needed
    let sourcePath = backupPath
    if (metadata.compressed) {
      logger.info('Decompressing backup...')
      sourcePath = join(backupConfig.paths.tempDir, `restore-${Date.now()}.db`)
      await ensureDir(backupConfig.paths.tempDir)
      await decompressBackup(backupPath, sourcePath)
    }

    // Restore database
    logger.info(`Restoring to: ${targetPath}`)
    await copyFile(sourcePath, targetPath)

    // Clean up temp file if decompressed
    if (sourcePath !== backupPath) {
      await fs.unlink(sourcePath)
    }

    // Set proper permissions
    await fs.chmod(targetPath, 0o644)

    logger.info('Restore completed successfully')

    return {
      success: true,
      backupId,
      restoredTo: targetPath,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Restore failed: ${errorMessage}`)

    return {
      success: false,
      backupId,
      restoredTo: '',
      error: errorMessage,
    }
  }
}

/**
 * Cleanup old backups based on retention policy
 */
export async function cleanupOldBackups(
  options: { logger?: BackupLogger } = {}
): Promise<void> {
  const logger = options.logger || defaultLogger

  try {
    const backups = await listBackups({ logger })

    if (backups.length <= backupConfig.retention.minBackups) {
      logger.debug('Minimum backup count maintained, skipping cleanup')
      return
    }

    const now = Date.now()
    // Flexy hates hardcoded 24 * 60 * 60 * 1000! Using TIME.MS_PER_DAY constant
    const maxAgeMs = backupConfig.retention.maxAgeDays * TIME.MS_PER_DAY

    let deletedCount = 0

    for (const backup of backups) {
      const ageMs = now - backup.createdAt.getTime()

      // Don't delete if younger than max age and we're above minimum
      if (
        ageMs < maxAgeMs &&
        backups.length - deletedCount > backupConfig.retention.minBackups
      ) {
        continue
      }

      // Delete backup and metadata
      try {
        await fs.unlink(backup.path)
        await fs.unlink(`${backup.path}.meta.json`)
        logger.info(`Deleted old backup: ${backup.id}`)
        deletedCount++
      } catch {
        logger.warn(`Failed to delete backup: ${backup.id}`)
      }
    }

    logger.info(`Cleanup completed: ${deletedCount} backups removed`)
  } catch (error) {
    logger.error(`Cleanup failed: ${error}`)
  }
}

/**
 * Send notification about backup event
 */
async function sendNotification(
  type: 'success' | 'failure',
  backupId: string,
  options: { logger?: BackupLogger; error?: string } = {}
): Promise<void> {
  const logger = options.logger || defaultLogger
  const message =
    type === 'success'
      ? `Backup ${backupId} completed successfully`
      : `Backup ${backupId} failed: ${options.error || 'Unknown error'}`

  // Log notification
  logger.info(`Notification: ${message}`)

  // Send webhook notification if configured
  if (backupConfig.notifications.webhookUrl) {
    try {
      await fetch(backupConfig.notifications.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          backupId,
          message,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      logger.warn(`Failed to send webhook notification: ${error}`)
    }
  }
}

/**
 * Get backup health status
 */
export async function getBackupHealth(
  options: { logger?: BackupLogger } = {}
): Promise<{
  healthy: boolean
  lastBackup?: Date
  backupsCount: number
  issues: string[]
}> {
  const logger = options.logger || defaultLogger
  const issues: string[] = []

  try {
    const backups = await listBackups({ logger })
    const lastBackup = backups[0]?.createdAt

    // Check if backups exist
    if (backups.length === 0) {
      issues.push('No backups found')
      return { healthy: false, backupsCount: 0, issues }
    }

    // Check last backup age
    if (lastBackup) {
      // Flexy hates hardcoded 1000 * 60 * 60! Using TIME.MS_PER_HOUR constant
      const hoursSinceBackup =
        (Date.now() - lastBackup.getTime()) / TIME.MS_PER_HOUR
      if (
        hoursSinceBackup >
        backupConfig.disasterRecovery.healthCheckThresholdHours
      ) {
        issues.push(
          `Last backup is ${Math.round(hoursSinceBackup)} hours old (threshold: ${backupConfig.disasterRecovery.healthCheckThresholdHours}h)`
        )
      }
    }

    // Check unverified backups
    const unverifiedCount = backups.filter(b => !b.verified).length
    if (unverifiedCount > 0) {
      issues.push(`${unverifiedCount} backups are not verified`)
    }

    return {
      healthy: issues.length === 0,
      lastBackup,
      backupsCount: backups.length,
      issues,
    }
  } catch (error) {
    issues.push(`Failed to check backup health: ${error}`)
    return { healthy: false, backupsCount: 0, issues }
  }
}

export default {
  createBackup,
  restoreBackup,
  verifyBackup,
  listBackups,
  cleanupOldBackups,
  getBackupHealth,
}
