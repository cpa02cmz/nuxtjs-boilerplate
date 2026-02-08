# Development Setup Guide

This guide will help you set up the development environment for the Nuxt.js Boilerplate project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher (check `.nvmrc` for exact version)
- **npm**: Version 10 or higher
- **SQLite3**: Usually pre-installed on most systems
- **Git**: For version control

### Verify Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Quick Start

Get the project running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd nuxtjs-boilerplate

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Detailed Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate

# Install all dependencies
npm install
```

This will install:

- Nuxt.js 3 and Vue 3
- TypeScript and type definitions
- Prisma ORM and SQLite driver
- Testing framework (Vitest)
- Linting tools (ESLint, Stylelint, Prettier)
- All other project dependencies

### Step 2: Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```bash
# Required: Your application's canonical URL
NUXT_PUBLIC_CANONICAL_URL=http://localhost:3000

# Required: Database connection string
DATABASE_URL=file:./data/dev.db

# Optional: Site URL (defaults to CANONICAL_URL)
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Node environment
NODE_ENV=development
```

### Step 3: Database Setup

#### Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the TypeScript types and Prisma client based on the schema.

#### Run Migrations (if needed)

```bash
npm run prisma:migrate
```

This applies any pending database migrations.

#### Verify Database

```bash
# Open Prisma Studio to view and edit data
npm run prisma:studio
```

Prisma Studio will open at `http://localhost:5555`

### Step 4: Start Development Server

```bash
npm run dev
```

The development server will:

- Start at `http://localhost:3000`
- Enable hot module replacement (HMR)
- Watch for file changes and auto-reload
- Display build errors in the browser

### Step 5: Run Tests

Verify everything is working:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## Development Workflow

### Daily Development

1. **Start the dev server**: `npm run dev`
2. **Make your changes**: Edit files in `components/`, `pages/`, `composables/`, etc.
3. **Run tests**: `npm test` (before committing)
4. **Check linting**: `npm run lint` (before committing)

### Code Changes

When making changes:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Fix any linting issues: `npm run lint:fix`
5. Commit your changes: `git commit -m "feat: add new feature"`
6. Push to GitHub: `git push origin feature/your-feature`
7. Create a Pull Request

### Testing Your Changes

```bash
# Run specific test file
npx vitest run components/__tests__/SearchBar.test.ts

# Run tests matching a pattern
npx vitest run --reporter=verbose search

# Run with UI
npm run test:ui
```

## Troubleshooting

### Issue: Port 3000 is already in use

**Solution**:

```bash
# Use a different port
npm run dev -- --port 3001
```

### Issue: Cannot find module '@prisma/client'

**Solution**:

```bash
# Regenerate Prisma client
npm run prisma:generate

# If that doesn't work, clear caches
rm -rf node_modules/.cache
npm run prisma:generate
```

### Issue: TypeScript errors about '#app' or '#imports'

**Solution**:

```bash
# Nuxt needs to prepare the project
npm run postinstall

# Or restart the dev server
```

### Issue: Tests fail with timeout errors

**Solution**:

- Tests have a 10-second timeout by default
- Check for infinite loops or hanging async operations
- Run with verbose output: `npx vitest run --reporter=verbose`

### Issue: Build fails with memory error

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue: Database is locked or corrupted

**Solution**:

```bash
# Delete the database file (data will be lost!)
rm ./data/dev.db

# Regenerate
npm run prisma:migrate
```

## Environment Variables Reference

| Variable                    | Required | Default              | Description               |
| --------------------------- | -------- | -------------------- | ------------------------- |
| `NUXT_PUBLIC_CANONICAL_URL` | Yes      | -                    | Your site's canonical URL |
| `DATABASE_URL`              | Yes      | `file:./data/dev.db` | SQLite database path      |
| `NUXT_PUBLIC_SITE_URL`      | No       | CANONICAL_URL        | Site URL (if different)   |
| `NODE_ENV`                  | No       | `development`        | Node environment          |
| `VERCEL_URL`                | No       | -                    | Auto-set by Vercel        |

## Available Scripts

| Script                    | Description                |
| ------------------------- | -------------------------- |
| `npm run dev`             | Start development server   |
| `npm run build`           | Build for production       |
| `npm run generate`        | Generate static site       |
| `npm run preview`         | Preview production build   |
| `npm test`                | Run all tests              |
| `npm run test:ui`         | Run tests with UI          |
| `npm run test:coverage`   | Run tests with coverage    |
| `npm run lint`            | Run ESLint + Stylelint     |
| `npm run lint:fix`        | Fix linting issues         |
| `npm run format`          | Format code with Prettier  |
| `npm run prisma:generate` | Generate Prisma client     |
| `npm run prisma:migrate`  | Run database migrations    |
| `npm run prisma:studio`   | Open Prisma Studio         |
| `npm run audit`           | Run npm audit              |
| `npm run security`        | Audit high severity issues |

## IDE Setup

### VS Code Extensions (Recommended)

- **Volar**: Vue 3 official extension
- **TypeScript Vue Plugin**: TypeScript support for Vue
- **ESLint**: Linting integration
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind
- **Prisma**: Syntax highlighting for Prisma schema

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Next Steps

Now that you have the development environment set up:

1. **Read the Architecture Guide**: `docs/architecture.md`
2. **Explore the Code**: Start with `app.vue` and `pages/index.vue`
3. **Review Testing Strategy**: Run `npm test` to see existing tests
4. **Check API Documentation**: Visit `/api-docs` when running the dev server
5. **Read Contributing Guidelines**: See `CONTRIBUTING.md`

## Getting Help

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review existing [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
3. Check the [AGENTS.md](AGENTS.md) for project conventions
4. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

---

**Setup Time**: ~10 minutes  
**Last Updated**: 2026-02-08
