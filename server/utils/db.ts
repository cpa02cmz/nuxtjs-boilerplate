import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

declare global {
  var __dbPrisma: PrismaClient | undefined
}

// SQLite connection configuration
// Note: SQLite is file-based and doesn't use connection pooling like PostgreSQL/MySQL
// The better-sqlite3 adapter handles connections differently - it's synchronous and
// uses a single connection per database file. We configure timeout for busy handling.
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development'

  // Environment-specific configurations
  const configs = {
    development: {
      timeout: 5000, // 5 seconds busy timeout
    },
    production: {
      timeout: 10000, // 10 seconds busy timeout for high load
    },
    test: {
      timeout: 1000, // 1 second for fast test failures
    },
  }

  return configs[env as keyof typeof configs] || configs.development
}

const dbConfig = getDatabaseConfig()

export const prisma =
  global.__dbPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || './data/dev.db',
      timeout: dbConfig.timeout,
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  global.__dbPrisma = prisma
}

export default prisma
