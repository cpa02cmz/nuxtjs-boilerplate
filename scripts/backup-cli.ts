#!/usr/bin/env tsx
/**
 * Backup CLI - Command Line Interface for Database Backup Operations
 *
 * Usage:
 *   npm run backup:create          # Create a new backup
 *   npm run backup:restore <id>    # Restore from backup
 *   npm run backup:list            # List all backups
 *   npm run backup:verify <id>     # Verify a backup
 *   npm run backup:health          # Check backup health
 *   npm run backup:cleanup         # Cleanup old backups
 *
 * Options:
 *   --type <type>        Backup type: manual, scheduled, pre-migration, pre-restore
 *   --tags <tags>        Comma-separated list of tags
 *   --force              Skip confirmation prompts
 *   --target <path>      Target path for restore
 */

import {
  createBackup,
  restoreBackup,
  listBackups,
  verifyBackup,
  cleanupOldBackups,
  getBackupHealth,
} from '../../utils/backup/backup-manager'

interface CommandLineArgs {
  command: string
  backupId?: string
  type?: string
  tags?: string[]
  force?: boolean
  target?: string
}

function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2)
  const result: CommandLineArgs = { command: args[0] || 'help' }

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--type':
        result.type = args[++i]
        break
      case '--tags':
        result.tags = args[++i]?.split(',')
        break
      case '--force':
        result.force = true
        break
      case '--target':
        result.target = args[++i]
        break
      default:
        if (!result.backupId && !arg.startsWith('--')) {
          result.backupId = arg
        }
    }
  }

  return result
}

function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

async function showHelp(): Promise<void> {
  console.log(`
Database Backup CLI

Commands:
  create                    Create a new backup
  restore <backup-id>       Restore database from backup
  list                      List all backups
  verify <backup-id>        Verify backup integrity
  health                    Check backup health status
  cleanup                   Remove old backups based on retention policy
  help                      Show this help message

Options:
  --type <type>             Backup type: manual, scheduled, pre-migration, pre-restore
  --tags <tags>             Comma-separated list of tags
  --force                   Skip confirmation prompts
  --target <path>           Target path for restore (default: ./prisma/data/dev.db)

Examples:
  npm run backup:create
  npm run backup:create --type scheduled --tags daily,automated
  npm run backup:restore backup-2024-01-15-02-00-00
  npm run backup:list
  npm run backup:verify backup-2024-01-15-02-00-00
  npm run backup:health
  npm run backup:cleanup
`)
}

async function handleCreate(args: CommandLineArgs): Promise<void> {
  console.log('Creating backup...\n')

  const result = await createBackup({
    type: (args.type as any) || 'manual',
    tags: args.tags,
  })

  if (result.success) {
    console.log('✓ Backup created successfully')
    console.log(`  ID: ${result.metadata.id}`)
    console.log(`  Path: ${result.backupPath}`)
    console.log(`  Size: ${formatBytes(result.metadata.databaseSize)}`)
    if (result.metadata.compressed && result.metadata.compressedSize) {
      const ratio = (
        (1 - result.metadata.compressedSize / result.metadata.databaseSize) *
        100
      ).toFixed(1)
      console.log(
        `  Compressed: ${formatBytes(result.metadata.compressedSize)} (${ratio}% reduction)`
      )
    }
    console.log(`  Verified: ${result.metadata.verified ? 'Yes' : 'No'}`)
    console.log(`  Checksum: ${result.metadata.checksum}`)
  } else {
    console.error('✗ Backup failed')
    console.error(`  Error: ${result.error}`)
    process.exit(1)
  }
}

async function handleRestore(args: CommandLineArgs): Promise<void> {
  if (!args.backupId) {
    console.error('Error: Backup ID required')
    console.error('Usage: npm run backup:restore <backup-id>')
    process.exit(1)
  }

  console.log(`Restoring from backup: ${args.backupId}\n`)

  if (!args.force) {
    console.log('⚠ WARNING: This will replace the current database!')
    console.log('The current database will be backed up before restore.')
    console.log('Use --force to skip this warning.\n')
  }

  const result = await restoreBackup(args.backupId, {
    targetPath: args.target,
    skipConfirmation: args.force,
  })

  if (result.success) {
    console.log('✓ Restore completed successfully')
    console.log(`  Backup ID: ${result.backupId}`)
    console.log(`  Restored to: ${result.restoredTo}`)
  } else {
    console.error('✗ Restore failed')
    console.error(`  Error: ${result.error}`)
    process.exit(1)
  }
}

async function handleList(): Promise<void> {
  console.log('Listing backups...\n')

  const backups = await listBackups()

  if (backups.length === 0) {
    console.log('No backups found')
    return
  }

  console.log(`Found ${backups.length} backup(s):\n`)
  console.log(
    `${'ID'.padEnd(35)} ${'Type'.padEnd(15)} ${'Created'.padEnd(20)} ${'Size'.padEnd(12)} ${'Verified'}`
  )
  console.log('-'.repeat(100))

  for (const backup of backups) {
    const id = backup.id.slice(0, 34).padEnd(35)
    const type = backup.type.padEnd(15)
    const created = formatDate(backup.createdAt).padEnd(20)
    const size = formatBytes(backup.compressedSize || backup.size).padEnd(12)
    const verified = backup.verified ? '✓' : '✗'
    console.log(`${id} ${type} ${created} ${size} ${verified}`)
  }
}

async function handleVerify(args: CommandLineArgs): Promise<void> {
  if (!args.backupId) {
    console.error('Error: Backup ID required')
    console.error('Usage: npm run backup:verify <backup-id>')
    process.exit(1)
  }

  console.log(`Verifying backup: ${args.backupId}\n`)

  const result = await verifyBackup(args.backupId)

  if (result.valid) {
    console.log('✓ Backup is valid')
    console.log('  Checksum verified')
    console.log('  Database integrity confirmed')
  } else {
    console.error('✗ Backup verification failed')
    console.error(`  Error: ${result.error}`)
    process.exit(1)
  }
}

async function handleHealth(): Promise<void> {
  console.log('Checking backup health...\n')

  const health = await getBackupHealth()

  if (health.healthy) {
    console.log('✓ Backup system is healthy')
  } else {
    console.log('⚠ Backup system has issues:')
    for (const issue of health.issues) {
      console.log(`  - ${issue}`)
    }
  }

  console.log(`\nTotal backups: ${health.backupsCount}`)
  if (health.lastBackup) {
    const hoursAgo = Math.round(
      (Date.now() - health.lastBackup.getTime()) / (1000 * 60 * 60)
    )
    console.log(
      `Last backup: ${formatDate(health.lastBackup)} (${hoursAgo}h ago)`
    )
  }
}

async function handleCleanup(): Promise<void> {
  console.log('Cleaning up old backups...\n')

  await cleanupOldBackups()

  console.log('✓ Cleanup completed')

  // Show current backup count
  const backups = await listBackups()
  console.log(`Remaining backups: ${backups.length}`)
}

async function main(): Promise<void> {
  const args = parseArgs()

  try {
    switch (args.command) {
      case 'create':
        await handleCreate(args)
        break
      case 'restore':
        await handleRestore(args)
        break
      case 'list':
        await handleList()
        break
      case 'verify':
        await handleVerify(args)
        break
      case 'health':
        await handleHealth()
        break
      case 'cleanup':
        await handleCleanup()
        break
      case 'help':
      default:
        await showHelp()
    }
  } catch (error) {
    console.error(`Error: ${error}`)
    process.exit(1)
  }
}

main()
