# Database Abstraction Layer

**Issue:** #3218 - Database abstraction layer for multi-database support  
**Status:** ✅ Implemented  
**Priority:** P2

## Overview

This document describes the database abstraction layer implementation that provides a unified interface for database operations across different providers. Currently supports PostgreSQL with planned support for SQLite and MySQL.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ PostgreSQL   │ │  SQLite     │ │   MySQL     │
│  Adapter     │ │  Adapter    │ │  Adapter    │
│  (Active)    │ │  (Planned)  │ │  (Planned)  │
└───────┬──────┘ └──────┬──────┘ └──────┬──────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
            ┌───────────▼───────────┐
            │   Database Factory    │
            │   (Singleton)         │
            └───────────┬───────────┘
                        │
            ┌───────────▼───────────┐
            │  Database Interface   │
            │  (IDatabaseAdapter)   │
            └───────────────────────┘
```

## Components

### 1. Core Interface (`database-abstraction.ts`)

Defines the contract that all database adapters must implement:

- **Connection Management:** `connect()`, `disconnect()`, `isConnected()`
- **Query Operations:** `query()`, `execute()`
- **Transactions:** `beginTransaction()`
- **Schema Operations:** `getTables()`, `getTableSchema()`, `getIndexes()`
- **Backup & Restore:** `createBackup()`, `restoreBackup()`, `verifyBackup()`
- **Health Monitoring:** `getHealthStatus()`, `getDatabaseSize()`
- **Migration Support:** `getMigrationStatus()`

### 2. PostgreSQL Adapter (`postgresql-adapter.ts`)

Full implementation of `IDatabaseAdapter` for PostgreSQL using Prisma ORM and native pg driver:

- Connection pooling with configurable min/max connections
- Raw SQL query execution
- Transaction support
- Schema introspection
- Backup/restore using `pg_dump` and `psql`
- Health checks with latency measurement

### 3. Database Factory (`database-factory.ts`)

Singleton factory pattern for creating and caching database adapters:

```typescript
import { databaseFactory, createAdapterFromEnv } from '~/server/database'

// Create adapter from environment variables
const adapter = createAdapterFromEnv()

// Or use factory directly
const adapter = databaseFactory.createAdapter({
  provider: 'postgresql',
  url: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
})
```

## Usage Examples

### Basic Query

```typescript
import { createAdapterFromEnv } from '~/server/database'

const adapter = createAdapterFromEnv()
await adapter.connect()

// Execute parameterized query
const users = await adapter.query('SELECT * FROM users WHERE active = $1', [
  true,
])

await adapter.disconnect()
```

### Health Check

```typescript
const health = await adapter.getHealthStatus()
console.log({
  connected: health.connected,
  latency: `${health.latencyMs}ms`,
  connections: {
    active: health.activeConnections,
    idle: health.idleConnections,
  },
})
```

### Backup Creation

```typescript
const backup = await adapter.createBackup({
  type: 'full',
  compression: true,
  destination: '/backups',
  tags: ['daily', 'automated'],
})

console.log(`Backup created: ${backup.id}`)
console.log(`Checksum: ${backup.checksum}`)
```

### Schema Introspection

```typescript
const tables = await adapter.getTables()
for (const tableName of tables) {
  const schema = await adapter.getTableSchema(tableName)
  console.log(`Table: ${schema.name}`)
  console.log(`Columns: ${schema.columns.map(c => c.name).join(', ')}`)
}
```

## Configuration

### Environment Variables

| Variable                | Default      | Description                      |
| ----------------------- | ------------ | -------------------------------- |
| `DATABASE_URL`          | Required     | PostgreSQL connection string     |
| `DIRECT_URL`            | DATABASE_URL | Direct connection for migrations |
| `DB_PROVIDER`           | postgresql   | Database provider type           |
| `DB_POOL_MIN`           | 2            | Minimum pool connections         |
| `DB_POOL_MAX`           | 10           | Maximum pool connections         |
| `DB_ACQUIRE_TIMEOUT_MS` | 3000         | Connection acquire timeout       |
| `DB_IDLE_TIMEOUT_MS`    | 10000        | Connection idle timeout          |

### Connection URL Format

```
postgresql://username:password@hostname:port/database?schema=public
```

Example:

```
postgresql://admin:secret@localhost:5432/myapp?schema=public
```

## Migration from Direct Prisma Usage

### Before (Direct Prisma)

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const users = await prisma.user.findMany({ where: { active: true } })
```

### After (Abstraction Layer)

```typescript
import { createAdapterFromEnv } from '~/server/database'
const adapter = createAdapterFromEnv()

// Using Prisma client through adapter
const prisma = adapter.getRawClient()
const users = await prisma.user.findMany({ where: { active: true } })

// Or using raw SQL
const users = await adapter.query('SELECT * FROM users WHERE active = $1', [
  true,
])
```

## Future Roadmap

### Phase 1: PostgreSQL (✅ Complete)

- Full PostgreSQL adapter implementation
- Backup/restore support
- Schema introspection
- Health monitoring

### Phase 2: SQLite (Planned)

- File-based database support
- Backup as file copy
- Migration from SQLite to PostgreSQL

### Phase 3: MySQL (Planned)

- MySQL/MariaDB support
- Compatible backup format
- Cross-database migrations

## Repository Pattern (Future Enhancement)

Base repository interfaces are defined for future implementation:

```typescript
interface IRepository<T, CreateInput, UpdateInput, WhereInput> {
  findMany(params): Promise<T[]>
  findUnique(where): Promise<T | null>
  create(data): Promise<T>
  update(params): Promise<T>
  delete(where): Promise<T>
  count(where?): Promise<number>
}

interface ISoftDeleteRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
> extends IRepository<T, CreateInput, UpdateInput, WhereInput> {
  softDelete(where): Promise<T>
  restore(where): Promise<T>
}
```

## Testing

Run tests to verify the abstraction layer:

```bash
# Run all tests
npm test

# Run database-specific tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## Benefits

1. **Database Independence:** Switch between PostgreSQL, SQLite, or MySQL without changing application code
2. **Testability:** Easy to mock database adapters for unit testing
3. **Flexibility:** Support multiple database providers in different environments
4. **Monitoring:** Built-in health checks and performance metrics
5. **Backup Management:** Unified backup/restore interface across providers

## Security Considerations

- Connection strings should never be hardcoded
- Use environment variables for all database credentials
- Enable SSL for production connections
- Regular backup verification
- Connection pooling limits prevent resource exhaustion

## Related Issues

- Issue #3218: Database abstraction layer for multi-database support
- Issue #3073: Webhook Retry Logic Consistency
- Issue #2783: Frontend Performance Optimization

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Node.js Driver](https://node-postgres.com/)
- [Database Abstraction Pattern](https://martinfowler.com/eaaCatalog/repository.html)
