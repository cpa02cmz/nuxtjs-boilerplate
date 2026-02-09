# AGENTS.md - Repository Guide for AI Assistants

## Project Overview

**Project Name**: Nuxt.js Boilerplate - Free Stuff on the Internet
**Type**: Full-stack Nuxt.js 3 application
**Purpose**: Resource discovery platform for free developer tools and services

## Tech Stack

### Core Technologies

- **Framework**: Nuxt.js ^3.20.2 (Vue ^3.5.26)
- **Language**: TypeScript 5.9.3
- **Database**: SQLite with Prisma ORM 7.3.0
- **Styling**: Tailwind CSS with custom configuration
- **Testing**: Vitest 3.2.0 with Vue Test Utils

### Key Dependencies

- **State Management**: Vue Composition API
- **Image Optimization**: @nuxt/image with IPX provider
- **PWA**: @vite-pwa/nuxt for offline support
- **Search**: Fuse.js for fuzzy search
- **Validation**: Zod for schema validation
- **Security**: DOMPurify for XSS protection

## Available Commands

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run generate         # Generate static site
npm run preview          # Preview production build
```

### Testing

```bash
npm test                 # Run all tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run test:watch       # Run tests in watch mode
```

### Code Quality

```bash
npm run lint             # Run ESLint + Stylelint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
```

### Security

```bash
npm run audit            # Run npm audit
npm run security         # Audit high severity only
```

### Database

```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## Project Structure

```
├── app/                  # App directory (Nuxt 3)
├── app.vue              # Root app component
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components
│   └── __tests__/       # Component tests
├── composables/         # Vue composables
├── configs/             # Configuration files
├── data/                # Static data files
├── docs/                # Documentation
├── layouts/             # Nuxt layouts
├── modules/             # Custom Nuxt modules
├── pages/               # Page components
├── plugins/             # Nuxt plugins
├── prisma/              # Database schema
├── public/              # Public static files
├── server/              # Server-side code
│   ├── api/            # API endpoints
│   ├── plugins/        # Server plugins
│   └── utils/          # Server utilities
├── types/               # TypeScript types
├── utils/               # Utility functions
└── __tests__/           # Test files
```

## Code Conventions

### File Naming

- **Components**: PascalCase (e.g., `SearchBar.vue`)
- **Composables**: camelCase with 'use' prefix (e.g., `useSearch.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Pages**: kebab-case (e.g., `search-results.vue`)

### Component Structure

```vue
<template>
  <!-- Template content -->
</template>

<script setup lang="ts">
// Imports first
import { ref, computed } from 'vue'

// Types/interfaces
interface Props {
  title: string
}

// Props and emits
const props = defineProps<Props>()
const emit = defineEmits<['update']>()

// Reactive state
const count = ref(0)

// Computed properties
const doubled = computed(() => count.value * 2)

// Methods
const increment = () => {
  count.value++
}

// Lifecycle hooks
onMounted(() => {
  // Component mounted
})
</script>
```

### TypeScript Guidelines

- Always use strict mode
- Define interfaces for complex objects
- Avoid `any` type
- Use proper error handling with typed errors

### Testing Patterns

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' },
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

## Environment Setup

### Prerequisites

- Node.js 18+ (check .nvmrc for exact version)
- npm 10+
- SQLite3 (usually pre-installed)

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd nuxtjs-boilerplate

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start development
npm run dev
```

### Environment Variables

Create `.env` file:

```bash
# Required
NUXT_PUBLIC_CANONICAL_URL=http://localhost:3000
DATABASE_URL=file:./data/dev.db

# Optional
NODE_ENV=development
VERCEL_URL=                      # Set by Vercel
```

## Common Issues and Solutions

### Issue: Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`
**Solution**:

```bash
npm run prisma:generate
```

### Issue: Build Warnings - Duplicate Keys

**Error**: `[esbuild] Duplicate key "provider"`
**Solution**: Fixed by explicitly setting `provider: 'ipx'` in the image configuration in nuxt.config.ts. This prevents the duplicate key that occurs when @nuxt/image merges its default configuration with the custom configuration.

### Issue: Vue Component Resolution in Tests

**Error**: `[Vue warn]: Failed to resolve component: LazyXxx`
**Solution**: Components are stubbed in test-setup.ts. Ensure stubs are defined for lazy-loaded components.

### Issue: TypeScript Errors

**Error**: `Cannot find module '#app'` or similar
**Solution**:

```bash
# Restart TypeScript server in IDE
# Or run:
npm run postinstall
```

### Issue: Test Timeouts

**Error**: Tests fail with timeout
**Solution**: Tests use 10s timeout by default. Check for infinite loops or async issues.

## Key Architectural Decisions

### State Management

- No Vuex/Pinia - using Composition API with composables
- Shared state through reactive refs in composables
- Server state managed via API calls

### Database Strategy

- SQLite for development (simple, file-based)
- Prisma ORM for type-safe database operations
- Migrations tracked in version control

### Security Measures

- CSP headers configured in server/plugins/security-headers.ts
- DOMPurify for all user-generated content
- Rate limiting on API endpoints
- Input validation with Zod schemas

### Performance Optimizations

- Lazy loading of components with ClientOnly
- Image optimization via @nuxt/image
- PWA for offline support
- Prerendering of static pages

## Testing Strategy

### Test Types

1. **Unit Tests**: Test composables and utilities in isolation
2. **Component Tests**: Test Vue components with mocks
3. **Integration Tests**: Test API endpoints and database
4. **E2E Tests**: Full user flow testing

### Test Configuration

- Vitest for all test types
- jsdom environment for component tests
- Global stubs configured in test-setup.ts
- Coverage threshold: 80% for all metrics

### Running Tests

```bash
# All tests
npm test

# Specific test file
npx vitest run __tests__/useSearch.test.ts

# With coverage
npm run test:coverage

# Debug mode
npx vitest --reporter=verbose
```

## API Structure

### REST Endpoints

```
/api/v1/resources        # CRUD for resources
/api/v1/webhooks         # Webhook management
/api/analytics           # Analytics tracking
/api/moderation          # Content moderation
/api/search              # Search functionality
```

### API Conventions

- RESTful design with HTTP verbs
- JSON request/response bodies
- Consistent error format
- Rate limiting applied

### Error Format

```json
{
  "statusCode": 400,
  "statusMessage": "Bad Request",
  "message": "Invalid input data"
}
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Environment variables configured in Vercel dashboard
3. Automatic deployments on push to main
4. Preview deployments for PRs

### Manual Deployment

```bash
# Build
npm run build

# Start server
node .output/server/index.mjs
```

## Maintenance Tasks

### Regular Tasks (Weekly)

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Check test coverage trends
- [ ] Review and merge dependabot PRs
- [ ] Clean up old preview deployments

### Monthly Tasks

- [ ] Update dependencies (minor versions)
- [ ] Review and optimize bundle size
- [ ] Check for deprecated APIs
- [ ] Update documentation

### Quarterly Tasks

- [ ] Major dependency updates
- [ ] Security audit
- [ ] Performance review
- [ ] Accessibility audit

## Troubleshooting Build Issues

### Slow Build Times

- Disable sourcemaps in production: `sourcemap: false`
- Use `experimental.payloadExtraction: true`
- Enable Nitro minification

### Memory Issues During Build

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Cache Issues

```bash
# Clear all caches
rm -rf .nuxt dist .output node_modules/.cache
npm run postinstall
```

## Contributing Guidelines

### Before Starting Work

1. Check existing issues and PRs
2. Create feature branch: `git checkout -b feature/description`
3. Ensure tests pass: `npm test`
4. Ensure lint passes: `npm run lint`

### Commit Messages

Follow conventional commits:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `test: add tests`
- `refactor: improve code structure`
- `chore: maintenance tasks`

### PR Requirements

- [ ] All tests passing
- [ ] Lint checks passing
- [ ] No console errors
- [ ] Documentation updated (if needed)
- [ ] Descriptive PR title and description

## External Resources

### Documentation

- [Nuxt.js Docs](https://nuxt.com/docs)
- [Vue.js Docs](https://vuejs.org/guide/introduction.html)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Tools

- [Fuse.js](https://fusejs.io/) - Fuzzy search
- [Zod](https://zod.dev/) - Schema validation
- [Vitest](https://vitest.dev/) - Testing framework

---

_Last Updated: 2026-02-09 20:18:55_
_Repository: nuxtjs-boilerplate_
_RepoKeeper Run: Maintenance completed - updated test count (1096), documented 8 moderate security vulnerabilities in dev dependencies, pruned 5 stale remote branches_
