import prismaModule from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

type PrismaClient = typeof prismaModule.PrismaClient

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma =
  (globalThis as typeof global).prisma ??
  new prismaModule.PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || './data/dev.db',
    }),
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
