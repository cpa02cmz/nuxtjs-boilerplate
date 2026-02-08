# AGENTS.md - Repository Guide for AI Assistants

## Project Overview

This is a **Nuxt.js 3 Boilerplate** with advanced features for building modern web applications, particularly resource directory applications with community features.

- **Framework**: Nuxt.js 3 with Vue 3 and TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Testing**: Vitest with @nuxt/test-utils
- **Linting**: ESLint + Stylelint + Prettier

## Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint + Stylelint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage

# Security
npm run security         # Run security audit
npm audit                # General audit

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## Project Structure

```
├── app/              # App directory (Nuxt 3)
├── assets/           # Static assets
├── components/       # Vue components
├── composables/      # Vue composables
├── docs/             # Documentation
├── layouts/          # Nuxt layouts
├── middleware/       # Nuxt middleware
├── pages/            # Nuxt pages
├── prisma/           # Database schema
├── public/           # Public static files
├── server/           # Server API routes
├── types/            # TypeScript types
├── utils/            # Utility functions
├── __tests__/        # Test files
└── configs/          # Configuration files
```

## Code Conventions

### TypeScript

- Use strict TypeScript configuration
- Prefer `type` over `interface` for object shapes
- Use explicit return types on exported functions
- Avoid `any` types

### Vue/Nuxt

- Use Composition API with `<script setup>`
- Components use PascalCase
- Composables use camelCase with `use` prefix
- Props should be typed with TypeScript

### Styling

- Use Tailwind CSS utility classes
- Component-specific styles go in `<style scoped>`
- Follow mobile-first responsive design

### Testing

- Write tests for composables and utilities
- Use `@nuxt/test-utils` for component tests
- Mock external dependencies

## Important Notes

1. **Database**: Uses SQLite via Prisma. Global `__dbPrisma` variable is used in development for hot-reload compatibility.

2. **Environment Variables**: Copy `.env.example` to `.env` and configure:
   - `DATABASE_URL` - SQLite database path
   - Other API keys as needed

3. **Build Requirements**:
   - Prisma client must be generated before build
   - No TypeScript errors allowed
   - All lint checks must pass

4. **Git Workflow**:
   - Create feature branches from `main`
   - Ensure branch is up-to-date before PR
   - All checks must pass before merging

## Common Issues

### Build Failures

- Run `npm run prisma:generate` first
- Check for TypeScript errors with `npx tsc --noEmit`
- Clear `.nuxt` cache if needed: `rm -rf .nuxt`

### Lint Errors

- Run `npm run lint:fix` to auto-fix
- Check for unused imports or variables
- Ensure proper TypeScript types

### Test Failures

- Check component mocks in `test-mocks/`
- Verify test environment setup in `test-setup.ts`

## Maintenance Tasks

### Weekly

- Run `npm audit` and fix vulnerabilities
- Review and merge dependabot PRs
- Clean up stale branches

### Monthly

- Update dependencies: `npm update`
- Review documentation for accuracy
- Archive old feature branches

## Documentation Structure

- `docs/README.md` - Documentation index
- `docs/development.md` - Development guide
- `docs/deployment/` - Deployment instructions
- `docs/api/` - API reference
- `docs/architecture/` - Architecture docs

## External Resources

- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vue 3 Docs](https://vuejs.org/guide/introduction.html)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
