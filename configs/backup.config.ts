// Backup Configuration - Automated Database Backup and Recovery
// Flexy hates hardcoded values! All backup settings are now configurable.

export const backupConfig = {
  // Backup Storage Paths
  paths: {
    // Directory where backups are stored
    backupDir: process.env.BACKUP_DIR || './backups',
    // SQLite database file path (source)
    databasePath: process.env.BACKUP_DB_PATH || './prisma/data/dev.db',
    // Temporary directory for backup operations
    tempDir: process.env.BACKUP_TEMP_DIR || './tmp/backups',
  },

  // Backup Schedule
  schedule: {
    // Enable automated backups
    enabled: process.env.BACKUP_SCHEDULE_ENABLED === 'true' || false,
    // Cron expression for automated backups (default: daily at 2 AM)
    cronExpression: process.env.BACKUP_CRON_EXPRESSION || '0 2 * * *',
    // Backup on application startup
    backupOnStartup: process.env.BACKUP_ON_STARTUP === 'true' || false,
    // Backup before migrations
    backupBeforeMigrations: process.env.BACKUP_BEFORE_MIGRATIONS !== 'false',
  },

  // Retention Policy
  retention: {
    // Number of daily backups to keep
    dailyCount: parseInt(process.env.BACKUP_DAILY_COUNT || '7'),
    // Number of weekly backups to keep
    weeklyCount: parseInt(process.env.BACKUP_WEEKLY_COUNT || '4'),
    // Number of monthly backups to keep
    monthlyCount: parseInt(process.env.BACKUP_MONTHLY_COUNT || '12'),
    // Maximum age of backups in days (overrides counts if set)
    maxAgeDays: parseInt(process.env.BACKUP_MAX_AGE_DAYS || '90'),
    // Minimum number of backups to keep regardless of age
    minBackups: parseInt(process.env.BACKUP_MIN_BACKUPS || '3'),
  },

  // Compression Settings
  compression: {
    // Enable compression
    enabled: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
    // Compression level (1-9, higher = smaller but slower)
    level: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
    // Compression format
    format: process.env.BACKUP_COMPRESSION_FORMAT || 'gzip',
  },

  // Verification Settings
  verification: {
    // Enable backup verification after creation
    enabled: process.env.BACKUP_VERIFY_ENABLED !== 'false',
    // Verify integrity by attempting restore to temp location
    verifyIntegrity: process.env.BACKUP_VERIFY_INTEGRITY === 'true' || true,
    // Checksum algorithm for verification
    checksumAlgorithm: process.env.BACKUP_CHECKSUM_ALGO || 'sha256',
    // Maximum verification time in seconds
    timeoutSeconds: parseInt(process.env.BACKUP_VERIFY_TIMEOUT_SEC || '300'),
  },

  // Remote Storage (Optional)
  remote: {
    // Enable remote backup storage
    enabled: process.env.BACKUP_REMOTE_ENABLED === 'true' || false,
    // Storage provider: 's3', 'gcs', 'azure', 'sftp'
    provider: process.env.BACKUP_REMOTE_PROVIDER || 's3',
    // Remote storage bucket/container name
    bucket: process.env.BACKUP_REMOTE_BUCKET || '',
    // Remote storage path prefix
    pathPrefix: process.env.BACKUP_REMOTE_PREFIX || 'backups/',
    // Number of backups to keep in remote storage
    retentionCount: parseInt(process.env.BACKUP_REMOTE_RETENTION || '30'),
    // Sync local backups to remote
    syncEnabled: process.env.BACKUP_REMOTE_SYNC === 'true' || false,
  },

  // Encryption Settings (Optional)
  encryption: {
    // Enable backup encryption
    enabled: process.env.BACKUP_ENCRYPTION_ENABLED === 'true' || false,
    // Encryption algorithm
    algorithm: process.env.BACKUP_ENCRYPTION_ALGO || 'aes-256-gcm',
    // Path to encryption key file (or base64 encoded key)
    keyPath: process.env.BACKUP_ENCRYPTION_KEY_PATH || '',
    // Key environment variable name
    keyEnvVar: process.env.BACKUP_ENCRYPTION_KEY_ENV || 'BACKUP_ENCRYPTION_KEY',
  },

  // Notification Settings
  notifications: {
    // Enable backup notifications
    enabled: process.env.BACKUP_NOTIFY_ENABLED === 'true' || false,
    // Notify on success
    notifyOnSuccess: process.env.BACKUP_NOTIFY_SUCCESS === 'true' || false,
    // Notify on failure
    notifyOnFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false',
    // Webhook URL for notifications
    webhookUrl: process.env.BACKUP_NOTIFY_WEBHOOK || '',
    // Email for notifications (if supported)
    email: process.env.BACKUP_NOTIFY_EMAIL || '',
  },

  // Performance Settings
  performance: {
    // Throttle backup to reduce system load (MB/s, 0 = no limit)
    throttleMbps: parseInt(process.env.BACKUP_THROTTLE_MBPS || '0'),
    // Use parallel compression if available
    parallelCompression:
      process.env.BACKUP_PARALLEL_COMPRESSION === 'true' || false,
    // Number of backup threads
    threads: parseInt(process.env.BACKUP_THREADS || '1'),
  },

  // Restore Settings
  restore: {
    // Require confirmation before restore
    requireConfirmation: process.env.RESTORE_REQUIRE_CONFIRMATION !== 'false',
    // Create backup before restore (for rollback)
    backupBeforeRestore: process.env.RESTORE_BACKUP_BEFORE !== 'false',
    // Verify backup before restore
    verifyBeforeRestore: process.env.RESTORE_VERIFY_BEFORE !== 'false',
    // Maximum restore time in seconds
    timeoutSeconds: parseInt(process.env.RESTORE_TIMEOUT_SEC || '600'),
  },

  // Disaster Recovery
  disasterRecovery: {
    // Enable point-in-time recovery (requires WAL archiving)
    pointInTimeEnabled:
      process.env.DR_POINT_IN_TIME_ENABLED === 'true' || false,
    // Recovery time objective (RTO) in minutes
    rtoMinutes: parseInt(process.env.DR_RTO_MINUTES || '60'),
    // Recovery point objective (RPO) in minutes
    rpoMinutes: parseInt(process.env.DR_RPO_MINUTES || '60'),
    // Last successful backup threshold for alerting (hours)
    healthCheckThresholdHours: parseInt(
      process.env.DR_HEALTH_CHECK_HOURS || '25'
    ),
  },

  // Logging
  logging: {
    // Log level: 'debug', 'info', 'warn', 'error'
    level: process.env.BACKUP_LOG_LEVEL || 'info',
    // Log file path (in addition to console)
    file: process.env.BACKUP_LOG_FILE || '',
    // Log rotation size in MB
    maxFileSizeMb: parseInt(process.env.BACKUP_LOG_MAX_SIZE_MB || '10'),
    // Number of log files to keep
    maxFiles: parseInt(process.env.BACKUP_LOG_MAX_FILES || '5'),
  },

  // Metadata
  metadata: {
    // Include git commit hash in backup metadata
    includeGitHash: process.env.BACKUP_INCLUDE_GIT_HASH !== 'false',
    // Include application version
    includeVersion: process.env.BACKUP_INCLUDE_VERSION !== 'false',
    // Include environment information
    includeEnvironment: process.env.BACKUP_INCLUDE_ENV !== 'false',
    // Custom backup tags
    tags: process.env.BACKUP_TAGS ? process.env.BACKUP_TAGS.split(',') : [],
  },

  // File Copy Settings - Flexy hates hardcoded chunk sizes!
  fileCopy: {
    // Chunk size for throttled file copy in bytes (default: 1MB = 1024 * 1024)
    chunkSizeBytes: parseInt(process.env.BACKUP_CHUNK_SIZE_BYTES || '1048576'),
    // Throttle timing calculation divisor in ms per MB (default: 1000)
    throttleMsPerMb: parseInt(process.env.BACKUP_THROTTLE_MS_PER_MB || '1000'),
  },

  // Timestamp Format Settings - Flexy hates hardcoded slice lengths!
  timestampFormat: {
    // ISO string slice length for backup IDs (default: 19 = 'YYYY-MM-DDTHH-mm-ss')
    sliceLength: parseInt(process.env.BACKUP_TIMESTAMP_SLICE_LENGTH || '19'),
    // Backup ID prefix
    prefix: process.env.BACKUP_ID_PREFIX || 'backup',
    // Character to replace colons with
    colonReplacement: process.env.BACKUP_TIMESTAMP_COLON_REPLACEMENT || '-',
    // Character to replace dots with
    dotReplacement: process.env.BACKUP_TIMESTAMP_DOT_REPLACEMENT || '-',
  },

  // File Size Formatting - Flexy hates hardcoded decimal places!
  fileSizeFormat: {
    // Decimal places for file size display (default: 2)
    sizeDecimals: parseInt(process.env.BACKUP_SIZE_DECIMALS || '2'),
    // Decimal places for compression ratio display (default: 1)
    ratioDecimals: parseInt(process.env.BACKUP_RATIO_DECIMALS || '1'),
    // Units for file size display
    units: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
  },
} as const

export type BackupConfig = typeof backupConfig
export default backupConfig
