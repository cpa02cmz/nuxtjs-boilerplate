import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { databaseConfig, getDatabaseTimeout } from '~/configs/database.config'

declare global {
  var __dbPrisma: PrismaClient | undefined
}

// SQLite connection configuration
// Note: SQLite is file-based and doesn't use connection pooling like PostgreSQL/MySQL
// The better-sqlite3 adapter handles connections differently - it's synchronous and
// uses a single connection per database file. We configure timeout for busy handling.
// Flexy hates hardcoded! Using config values from databaseConfig

export const prisma =
  global.__dbPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: databaseConfig.connection.url,
      timeout: getDatabaseTimeout(),
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  global.__dbPrisma = prisma
}

export default prisma
