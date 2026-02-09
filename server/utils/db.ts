import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Import PrismaClient class directly from the generated client
// Note: We use require-like import pattern for CommonJS compatibility
import type { PrismaClient as PrismaClientClass } from '../../../node_modules/.prisma/client/index'

// Get the PrismaClient class at runtime
import prismaClientPkg from '@prisma/client'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrismaClient = (prismaClientPkg as any)
  .PrismaClient as typeof PrismaClientClass

type PrismaClientInstance = InstanceType<typeof PrismaClientClass>

declare global {
  var __dbPrisma: PrismaClientInstance | undefined
}

// SQLite connection configuration
const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development'

  const configs = {
    development: {
      timeout: 5000,
    },
    production: {
      timeout: 10000,
    },
    test: {
      timeout: 1000,
    },
  }

  return configs[env as keyof typeof configs] || configs.development
}

const dbConfig = getDatabaseConfig()

const MAX_RETRIES = 3

function createPrismaClient(): PrismaClientInstance {
  let retries = 0

  const attemptConnection = (): PrismaClientInstance => {
    try {
      const client = new PrismaClient({
        adapter: new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL || 'file:./data/dev.db',
          timeout: dbConfig.timeout,
        }),
      })

      if (process.env.NODE_ENV !== 'test') {
        console.log('[Database] Prisma client initialized successfully')
      }

      return client
    } catch (error) {
      retries++

      if (retries < MAX_RETRIES) {
        console.warn(
          `[Database] Connection attempt ${retries} failed, retrying...`,
          error instanceof Error ? error.message : 'Unknown error'
        )

        return createRetryProxy(attemptConnection)
      }

      console.error(
        '[Database] Failed to initialize Prisma client after retries:',
        error
      )
      throw error
    }
  }

  return attemptConnection()
}

function createRetryProxy(
  retryFn: () => PrismaClientInstance
): PrismaClientInstance {
  let client: PrismaClientInstance | null = null

  return new Proxy({} as PrismaClientInstance, {
    get(target, prop: string | symbol) {
      if (!client) {
        client = retryFn()
      }
      return (client as Record<string | symbol, unknown>)[prop]
    },
  })
}

export const prisma = global.__dbPrisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.__dbPrisma = prisma
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[Database] Health check failed:', error)
    return false
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('[Database] Prisma client disconnected successfully')
  } catch (error) {
    console.error('[Database] Error disconnecting Prisma client:', error)
  }
}

export default prisma
