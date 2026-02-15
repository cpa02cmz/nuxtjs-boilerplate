# Database Backup and Disaster Recovery

## Overview

This document describes the automated database backup and disaster recovery system for the Nuxt.js boilerplate application.

## Features

- **Automated Backups**: Scheduled daily backups with configurable retention
- **Compression**: Gzip compression to reduce storage requirements
- **Verification**: Automatic integrity checking of backups
- **Point-in-Time Recovery**: Restore to any backup snapshot
- **Health Monitoring**: Monitor backup status and age
- **Retention Policies**: Automatic cleanup of old backups

## Quick Start

### Create a Backup

```bash
# Create manual backup
npm run backup:create

# Create scheduled backup
npm run backup:create -- --type scheduled --tags daily,automated
```

### List Backups

```bash
npm run backup:list
```

### Verify a Backup

```bash
npm run backup:verify <backup-id>
```

### Restore from Backup

```bash
# Restore to default location (will prompt for confirmation)
npm run backup:restore <backup-id>

# Restore with force (no confirmation)
npm run backup:restore <backup-id> -- --force

# Restore to specific path
npm run backup:restore <backup-id> -- --target ./path/to/restore.db
```

### Check Backup Health

```bash
npm run backup:health
```

### Cleanup Old Backups

```bash
npm run backup:cleanup
```

## Configuration

All backup settings are configurable via environment variables in `configs/backup.config.ts`.

### Storage Configuration

| Environment Variable | Default                | Description                        |
| -------------------- | ---------------------- | ---------------------------------- |
| `BACKUP_DIR`         | `./backups`            | Directory where backups are stored |
| `BACKUP_DB_PATH`     | `./prisma/data/dev.db` | Source database file path          |
| `BACKUP_TEMP_DIR`    | `./tmp/backups`        | Temporary directory for operations |

### Scheduling

| Environment Variable       | Default     | Description                       |
| -------------------------- | ----------- | --------------------------------- |
| `BACKUP_SCHEDULE_ENABLED`  | `false`     | Enable automated backups          |
| `BACKUP_CRON_EXPRESSION`   | `0 2 * * *` | Cron schedule (daily at 2 AM)     |
| `BACKUP_ON_STARTUP`        | `false`     | Backup on application startup     |
| `BACKUP_BEFORE_MIGRATIONS` | `true`      | Backup before database migrations |

### Retention Policy

| Environment Variable   | Default | Description                               |
| ---------------------- | ------- | ----------------------------------------- |
| `BACKUP_DAILY_COUNT`   | `7`     | Number of daily backups to keep           |
| `BACKUP_WEEKLY_COUNT`  | `4`     | Number of weekly backups to keep          |
| `BACKUP_MONTHLY_COUNT` | `12`    | Number of monthly backups to keep         |
| `BACKUP_MAX_AGE_DAYS`  | `90`    | Maximum age of backups in days            |
| `BACKUP_MIN_BACKUPS`   | `3`     | Minimum backups to keep regardless of age |

### Compression

| Environment Variable         | Default | Description             |
| ---------------------------- | ------- | ----------------------- |
| `BACKUP_COMPRESSION_ENABLED` | `true`  | Enable gzip compression |
| `BACKUP_COMPRESSION_LEVEL`   | `6`     | Compression level (1-9) |
| `BACKUP_COMPRESSION_FORMAT`  | `gzip`  | Compression format      |

### Verification

| Environment Variable        | Default  | Description                     |
| --------------------------- | -------- | ------------------------------- |
| `BACKUP_VERIFY_ENABLED`     | `true`   | Enable automatic verification   |
| `BACKUP_VERIFY_INTEGRITY`   | `true`   | Verify database integrity       |
| `BACKUP_CHECKSUM_ALGO`      | `sha256` | Checksum algorithm              |
| `BACKUP_VERIFY_TIMEOUT_SEC` | `300`    | Verification timeout in seconds |

### Remote Storage (Optional)

| Environment Variable      | Default    | Description                             |
| ------------------------- | ---------- | --------------------------------------- |
| `BACKUP_REMOTE_ENABLED`   | `false`    | Enable remote storage                   |
| `BACKUP_REMOTE_PROVIDER`  | `s3`       | Storage provider (s3, gcs, azure, sftp) |
| `BACKUP_REMOTE_BUCKET`    | -          | Remote bucket/container name            |
| `BACKUP_REMOTE_PREFIX`    | `backups/` | Path prefix in remote storage           |
| `BACKUP_REMOTE_RETENTION` | `30`       | Remote backup retention count           |
| `BACKUP_REMOTE_SYNC`      | `false`    | Sync local backups to remote            |

### Encryption (Optional)

| Environment Variable         | Default                 | Description                 |
| ---------------------------- | ----------------------- | --------------------------- |
| `BACKUP_ENCRYPTION_ENABLED`  | `false`                 | Enable encryption           |
| `BACKUP_ENCRYPTION_ALGO`     | `aes-256-gcm`           | Encryption algorithm        |
| `BACKUP_ENCRYPTION_KEY_PATH` | -                       | Path to encryption key file |
| `BACKUP_ENCRYPTION_KEY_ENV`  | `BACKUP_ENCRYPTION_KEY` | Key environment variable    |

### Notifications

| Environment Variable    | Default | Description                   |
| ----------------------- | ------- | ----------------------------- |
| `BACKUP_NOTIFY_ENABLED` | `false` | Enable notifications          |
| `BACKUP_NOTIFY_SUCCESS` | `false` | Notify on success             |
| `BACKUP_NOTIFY_FAILURE` | `true`  | Notify on failure             |
| `BACKUP_NOTIFY_WEBHOOK` | -       | Webhook URL for notifications |
| `BACKUP_NOTIFY_EMAIL`   | -       | Email for notifications       |

## Disaster Recovery Procedures

### Scenario 1: Database Corruption

1. **Stop the application**

   ```bash
   # Stop all running instances
   pkill -f "nuxt"
   ```

2. **Assess the damage**

   ```bash
   # Check database integrity
   sqlite3 ./prisma/data/dev.db "PRAGMA integrity_check;"
   ```

3. **List available backups**

   ```bash
   npm run backup:list
   ```

4. **Restore from the most recent valid backup**

   ```bash
   npm run backup:restore <backup-id> -- --force
   ```

5. **Verify the restored database**

   ```bash
   sqlite3 ./prisma/data/dev.db "PRAGMA integrity_check;"
   ```

6. **Restart the application**
   ```bash
   npm run dev
   ```

### Scenario 2: Accidental Data Deletion

1. **Create a pre-restore backup** (preserves current state)

   ```bash
   npm run backup:create -- --type pre-restore --tags before-recovery
   ```

2. **Find the backup before the deletion**

   ```bash
   npm run backup:list
   # Look for backups created before the deletion time
   ```

3. **Restore to the desired point**

   ```bash
   npm run backup:restore <backup-id> -- --force
   ```

4. **Verify the data is restored**
   ```bash
   # Check critical tables
   sqlite3 ./prisma/data/dev.db "SELECT COUNT(*) FROM Resource;"
   ```

### Scenario 3: Complete Database Loss

1. **Ensure backup directory is accessible**

   ```bash
   ls -la ./backups/
   ```

2. **Recreate the data directory**

   ```bash
   mkdir -p ./prisma/data
   ```

3. **Restore the most recent backup**

   ```bash
   # Get the latest backup ID
   npm run backup:list | head -5

   # Restore it
   npm run backup:restore <backup-id> -- --force
   ```

4. **Run migrations if needed**

   ```bash
   npm run prisma:migrate
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

### Scenario 4: Migrating to Production (PostgreSQL)

When migrating from SQLite to PostgreSQL:

1. **Create a final SQLite backup**

   ```bash
   npm run backup:create -- --type pre-migration --tags sqlite-final
   ```

2. **Export SQLite data**

   ```bash
   sqlite3 ./prisma/data/dev.db .dump > migration.sql
   ```

3. **Update database configuration**
   - Update `DATABASE_URL` to point to PostgreSQL
   - Update `prisma/schema.prisma` datasource

4. **Run migrations on PostgreSQL**

   ```bash
   npm run prisma:migrate
   ```

5. **Enable PostgreSQL-specific features**
   - WAL archiving
   - Continuous backups (pg_basebackup)
   - Point-in-time recovery

## Backup Verification

Backups are automatically verified after creation:

1. **Checksum Verification**: SHA-256 hash is calculated and stored
2. **Integrity Check**: SQLite `PRAGMA integrity_check` is run
3. **Restoration Test**: Backup is restored to a temporary location and tested

To manually verify a backup:

```bash
npm run backup:verify <backup-id>
```

## Health Monitoring

Monitor backup health:

```bash
npm run backup:health
```

This checks:

- Last backup age (alerts if > 25 hours)
- Backup count
- Verification status
- Storage availability

## Best Practices

### 1. Regular Testing

Test your restore procedure regularly:

```bash
# Monthly restore test
npm run backup:restore <backup-id> -- --target ./test-restore.db
sqlite3 ./test-restore.db "PRAGMA integrity_check;"
rm ./test-restore.db
```

### 2. Offsite Backups

Enable remote storage for disaster recovery:

```bash
# .env
BACKUP_REMOTE_ENABLED=true
BACKUP_REMOTE_PROVIDER=s3
BACKUP_REMOTE_BUCKET=my-backup-bucket
BACKUP_REMOTE_SYNC=true
```

### 3. Monitoring

Set up monitoring for backup health:

```bash
# Add to crontab for health checks
0 */6 * * * cd /path/to/app && npm run backup:health 2>&1 | logger -t backup-health
```

### 4. Documentation

Keep a recovery runbook with:

- Recovery time objective (RTO): 60 minutes
- Recovery point objective (RPO): 60 minutes
- Contact information for team members
- External dependencies and vendor contacts

### 5. Security

- Encrypt backups if they contain sensitive data
- Store encryption keys separately from backups
- Use secure remote storage (S3 with encryption at rest)
- Regularly rotate encryption keys

## Troubleshooting

### Backup Fails

1. Check disk space

   ```bash
   df -h
   ```

2. Check database file permissions

   ```bash
   ls -la ./prisma/data/dev.db
   ```

3. Check backup directory permissions

   ```bash
   ls -la ./backups/
   ```

4. Review backup logs
   ```bash
   # Check console output or log file
   cat backup.log
   ```

### Restore Fails

1. Verify backup exists

   ```bash
   npm run backup:list
   ```

2. Check target directory permissions

   ```bash
   ls -la ./prisma/data/
   ```

3. Verify backup integrity

   ```bash
   npm run backup:verify <backup-id>
   ```

4. Check available disk space
   ```bash
   df -h
   ```

### Verification Fails

1. Check SQLite is installed

   ```bash
   sqlite3 --version
   ```

2. Verify backup file is not corrupted

   ```bash
   # Check file size
   ls -lh ./backups/<backup-id>.db.gz

   # Try manual decompression
   gunzip -t ./backups/<backup-id>.db.gz
   ```

3. Recreate the backup
   ```bash
   npm run backup:create
   ```

## API Reference

### Backup Manager Module

```typescript
import {
  createBackup,
  restoreBackup,
  verifyBackup,
  listBackups,
  cleanupOldBackups,
  getBackupHealth,
} from './utils/backup/backup-manager'

// Create backup
const result = await createBackup({
  type: 'manual',
  tags: ['custom-backup'],
})

// List backups
const backups = await listBackups()

// Restore backup
await restoreBackup('backup-2024-01-15-02-00-00', {
  targetPath: './prisma/data/dev.db',
})

// Verify backup
const { valid, error } = await verifyBackup('backup-2024-01-15-02-00-00')

// Check health
const health = await getBackupHealth()

// Cleanup old backups
await cleanupOldBackups()
```

## Migration Guide

### From Manual Backups

If you were previously using manual backups:

1. Move existing backups to `./backups/` directory
2. Create metadata files for existing backups
3. Update your backup scripts to use the new CLI

### To PostgreSQL

When migrating to PostgreSQL:

1. Follow the disaster recovery procedure for Scenario 4
2. Update backup configuration for PostgreSQL specifics
3. Enable point-in-time recovery
4. Set up streaming replication for high availability

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the backup logs
3. Open an issue with:
   - Backup/restore command used
   - Error messages
   - System information (OS, Node.js version)
   - Backup configuration (redact sensitive info)

## References

- [SQLite Backup API](https://www.sqlite.org/backup.html)
- [PostgreSQL Backup and Restore](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Backup Strategies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/backup.html)
- [Disaster Recovery Planning](https://en.wikipedia.org/wiki/Disaster_recovery)
