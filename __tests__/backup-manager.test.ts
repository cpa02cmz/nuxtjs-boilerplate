/**
 * Backup Manager Tests
 * Tests for database backup and recovery functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import {
  createBackup,
  restoreBackup,
  verifyBackup,
  listBackups,
  getBackupHealth,
  cleanupOldBackups,
} from '../utils/backup/backup-manager'

// Mock backup config
vi.mock('../configs/backup.config', () => ({
  default: {
    paths: {
      backupDir: './test-backups',
      databasePath: './test-data/test.db',
      tempDir: './test-tmp/backups',
    },
    schedule: {
      enabled: false,
      cronExpression: '0 2 * * *',
      backupOnStartup: false,
      backupBeforeMigrations: true,
    },
    retention: {
      dailyCount: 7,
      weeklyCount: 4,
      monthlyCount: 12,
      maxAgeDays: 90,
      minBackups: 3,
    },
    compression: {
      enabled: false,
      level: 6,
      format: 'gzip',
    },
    verification: {
      enabled: false,
      verifyIntegrity: false,
      checksumAlgorithm: 'sha256',
      timeoutSeconds: 300,
    },
    remote: {
      enabled: false,
      provider: 's3',
      bucket: '',
      pathPrefix: 'backups/',
      retentionCount: 30,
      syncEnabled: false,
    },
    encryption: {
      enabled: false,
      algorithm: 'aes-256-gcm',
      keyPath: '',
      keyEnvVar: 'BACKUP_ENCRYPTION_KEY',
    },
    notifications: {
      enabled: false,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      webhookUrl: '',
      email: '',
    },
    performance: {
      throttleMbps: 0,
      parallelCompression: false,
      threads: 1,
    },
    restore: {
      requireConfirmation: false,
      backupBeforeRestore: false,
      verifyBeforeRestore: false,
      timeoutSeconds: 600,
    },
    disasterRecovery: {
      pointInTimeEnabled: false,
      rtoMinutes: 60,
      rpoMinutes: 60,
      healthCheckThresholdHours: 25,
    },
    logging: {
      level: 'error',
      file: '',
      maxFileSizeMb: 10,
      maxFiles: 5,
    },
    metadata: {
      includeGitHash: false,
      includeVersion: false,
      includeEnvironment: false,
      tags: [],
    },
  },
}))

describe('Backup Manager', () => {
  const testDbPath = './test-data/test.db'
  const testBackupDir = './test-backups'
  const testTempDir = './test-tmp/backups'

  beforeEach(async () => {
    // Clean up any existing test directories
    try {
      await fs.rm(testBackupDir, { recursive: true, force: true })
      await fs.rm(testTempDir, { recursive: true, force: true })
      await fs.rm('./test-data', { recursive: true, force: true })
    } catch {
      // Ignore errors if directories don't exist
    }

    // Create test directories
    await fs.mkdir(testBackupDir, { recursive: true })
    await fs.mkdir(testTempDir, { recursive: true })
    await fs.mkdir('./test-data', { recursive: true })

    // Create a simple test database file
    await fs.writeFile(testDbPath, 'test database content')
  })

  afterEach(async () => {
    // Clean up test directories
    try {
      await fs.rm(testBackupDir, { recursive: true, force: true })
      await fs.rm(testTempDir, { recursive: true, force: true })
      await fs.rm('./test-data', { recursive: true, force: true })
    } catch {
      // Ignore errors
    }
  })

  describe('createBackup', () => {
    it('should create a backup successfully', async () => {
      const result = await createBackup({ type: 'manual' })

      expect(result.success).toBe(true)
      expect(result.backupPath).toBeTruthy()
      expect(result.metadataPath).toBeTruthy()
      expect(result.metadata).toBeDefined()
      expect(result.metadata.id).toMatch(/^backup-\d{4}/)
      expect(result.metadata.backupType).toBe('manual')
      expect(result.metadata.compressed).toBe(false)
    })

    it('should create backup with custom tags', async () => {
      const result = await createBackup({
        type: 'manual',
        tags: ['test', 'automated'],
      })

      expect(result.success).toBe(true)
      expect(result.metadata.tags).toContain('test')
      expect(result.metadata.tags).toContain('automated')
    })

    it('should fail when database file does not exist', async () => {
      // Remove the database file
      await fs.unlink(testDbPath)

      const result = await createBackup({ type: 'manual' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('listBackups', () => {
    it('should return empty list when no backups exist', async () => {
      const backups = await listBackups()

      expect(backups).toEqual([])
    })

    it('should list created backups', async () => {
      // Create a backup
      await createBackup({ type: 'manual' })

      const backups = await listBackups()

      expect(backups.length).toBe(1)
      expect(backups[0].type).toBe('manual')
      expect(backups[0].verified).toBe(false)
    })

    it('should return backup entries with correct structure', async () => {
      // Create a backup
      await createBackup({ type: 'manual' })

      const backups = await listBackups()

      expect(backups.length).toBe(1)
      // Verify backup entry structure
      expect(backups[0]).toHaveProperty('id')
      expect(backups[0]).toHaveProperty('createdAt')
      expect(backups[0]).toHaveProperty('size')
      expect(backups[0]).toHaveProperty('type')
      expect(backups[0]).toHaveProperty('verified')
      expect(backups[0]).toHaveProperty('path')
    })
  })

  describe('getBackupHealth', () => {
    it('should report unhealthy when no backups exist', async () => {
      const health = await getBackupHealth()

      expect(health.healthy).toBe(false)
      expect(health.backupsCount).toBe(0)
      expect(health.issues.length).toBeGreaterThan(0)
    })

    it('should report status when backups exist', async () => {
      // Create a backup
      await createBackup({ type: 'manual' })

      const health = await getBackupHealth()

      // Health status depends on verification and backup age
      expect(health.backupsCount).toBe(1)
      expect(health.lastBackup).toBeDefined()
    })
  })

  describe('cleanupOldBackups', () => {
    it('should maintain minimum backup count', async () => {
      // Create multiple backups
      await createBackup({ type: 'manual' })
      await new Promise(resolve => setTimeout(resolve, 50))
      await createBackup({ type: 'manual' })

      await cleanupOldBackups()

      const backups = await listBackups()
      // Should maintain at least the minimum required backups
      expect(backups.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('restoreBackup', () => {
    it('should fail when backup does not exist', async () => {
      const result = await restoreBackup('non-existent-backup')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should restore from backup successfully', async () => {
      // Create a backup
      const backupResult = await createBackup({ type: 'manual' })
      expect(backupResult.success).toBe(true)

      // Modify the original database
      await fs.writeFile(testDbPath, 'modified content')

      // Restore from backup
      const restoreResult = await restoreBackup(backupResult.metadata.id, {
        skipConfirmation: true,
      })

      expect(restoreResult.success).toBe(true)
      expect(restoreResult.backupId).toBe(backupResult.metadata.id)

      // Verify the file was restored
      const restoredContent = await fs.readFile(testDbPath, 'utf-8')
      expect(restoredContent).toBe('test database content')
    })
  })

  describe('verifyBackup', () => {
    it('should fail when backup does not exist', async () => {
      const result = await verifyBackup('non-existent-backup')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should verify backup checksum', async () => {
      // Create a backup
      const backupResult = await createBackup({ type: 'manual' })
      expect(backupResult.success).toBe(true)

      const result = await verifyBackup(backupResult.metadata.id)

      expect(result.valid).toBe(true)
    })
  })
})
