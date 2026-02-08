import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

declare global {
  var __dbPrisma: PrismaClient | undefined
}

export const prisma =
  global.__dbPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || './data/dev.db',
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  global.__dbPrisma = prisma
}

export default prisma
