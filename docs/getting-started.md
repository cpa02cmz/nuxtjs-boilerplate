# Getting Started

This guide will help you set up the "Free Stuff on the Internet" project for development and deployment. This is a comprehensive directory of free resources for developers, students, and tech enthusiasts.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (recommended) or pnpm
- **Git**: For version control
- **Code Editor**: VS Code (recommended) with Vue extensions

### Optional Tools

- **Vue DevTools**: Browser extension for Vue development
- **Nuxt DevTools**: Built-in development tools

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate
```

### 2. Install Dependencies

**Using npm (Recommended):**

```bash
npm install
```

**Using pnpm:**

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

> **Note**: The project uses `packageManager: npm` in package.json, so npm is the recommended package manager.

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Development
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME="Free Stuff Website"

# Optional: Analytics and monitoring
NUXT_PUBLIC_GA_ID=""
NUXT_PUBLIC_SENTRY_DSN=""
```

## 🛠️ Development

### Start Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

The development server will start at `http://localhost:3000`.

### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build

# Code Quality
npm run lint          # Run linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier

# Testing (when implemented)
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
│   └── css/           # Global stylesheets
├── components/        # Vue components
│   ├── ResourceCard.vue     # Display individual resources
│   ├── SearchBar.vue        # Search functionality
│   └── ResourceFilters.vue  # Resource filtering
├── layouts/           # Nuxt layouts
│   └── default.vue   # Main layout with header and footer
├── pages/             # Vue pages (auto-routing)
│   ├── index.vue     # Home page with resource grid and search
│   ├── ai-keys.vue   # AI tools and resources page
│   ├── about.vue     # About page
│   ├── search.vue    # Search results page
│   └── submit.vue    # Resource submission page
├── composables/       # Vue composables (useResources, useUrlSync)
├── plugins/           # Nuxt plugins
│   └── performance.client.ts  # Performance monitoring
├── data/              # Resource data files (JSON)
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 🎨 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit files in the appropriate directories
- Follow the coding standards outlined in [Development Guidelines](./development.md)
- Test your changes locally

### 3. Run Quality Checks

```bash
npm run lint
npm run format
npm run test  # When tests are implemented
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## 🔧 Configuration

### Nuxt Configuration

The main configuration is in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  routeRules: {
    '/': { prerender: true },
  },
})
```

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in the `tailwind.config.js` file (auto-generated).

### ESLint and Prettier

- **ESLint**: Code linting and error detection
- **Prettier**: Code formatting
- **Stylelint**: CSS/SCSS linting

Configuration files:

- `.eslintrc.cjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.stylelintrc` - Stylelint configuration

## 🚨 Current Known Issues (2025-11-23)

### Critical Infrastructure Issues

**⚠️ IMPORTANT**: The repository currently has critical infrastructure issues that must be resolved before normal development:

#### 1. Build System Issues

- **ESLint Configuration**: Flat config not detected properly
- **Package Manager**: Inconsistency between npm and pnpm usage
- **Dependency Conflicts**: Vitest version incompatibilities

#### 2. Security Vulnerabilities

- **XSS Protection**: Needed in ResourceCard.vue
- **Hardcoded Secrets**: URLs and configuration values
- **CSP Headers**: Missing Content Security Policy

#### 3. Development Environment

- **Test Framework**: Vitest setup incomplete
- **Error Handling**: Missing global error boundaries
- **Performance**: No monitoring or optimization

### Temporary Workarounds

#### For Development Setup

```bash
# Use npm instead of pnpm for now
npm install
npm run dev
```

#### For Linting Issues

```bash
# Run ESLint with legacy config if needed
npx eslint --config .eslintrc.cjs .
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependency Installation Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. ESLint Configuration Not Found

```bash
# Check ESLint version and configuration
npx eslint --version
ls -la eslint.config.js
```

#### 3. Build Fails

```bash
# Clean build
rm -rf .nuxt .output
npm build
```

#### 4. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

#### 5. Test Framework Issues

```bash
# If Vitest fails, check dependencies
npm list vitest
npm install --save-dev vitest@latest
```

### Getting Help

- Check the [Troubleshooting Guide](./maintenance/troubleshooting.md)
- Review [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
- Consult [Nuxt Documentation](https://nuxt.com/docs)

## 📚 Next Steps

- Read the [Development Guidelines](./development.md)
- Explore the [Architecture Documentation](./architecture/)
- Check [Deployment Guides](./deployment/)

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./development.md) for details on our code of conduct and the process for submitting pull requests.

---

## 📋 Current Development Status

### 🚨 Critical Issues Being Addressed

- **Issue #152**: Security vulnerabilities and hardcoded secrets
- **Issue #153**: Error handling and loading states
- **Issue #154**: Performance optimization needs
- **Issue #155**: Testing infrastructure gaps
- **Issue #156**: Accessibility compliance requirements

### 🔄 Recent Improvements

- Comprehensive repository analysis completed
- 5 new high-priority issues created
- Project management framework established
- Task breakdown and resource allocation completed

### 📞 Getting Help

- Check the [Troubleshooting Guide](./maintenance/troubleshooting.md)
- Review [GitHub Issues](https://github.com/cpa02cmz/nuxtjs-boilerplate/issues)
- Consult [Nuxt Documentation](https://nuxt.com/docs)
- Check [Project Management](./project-management.md) for current priorities

---

_Last Updated: 2025-11-23_
