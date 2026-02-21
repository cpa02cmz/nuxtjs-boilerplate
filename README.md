# Nuxt.js Boilerplate with Advanced Features

A comprehensive Nuxt.js 3 boilerplate with advanced features for building modern web applications. This project serves as a foundation for resource directory applications and includes community features, search capabilities, and admin tools.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cpa02cmz/nuxtjs-boilerplate)

[![Security Scan](https://github.com/cpa02cmz/nuxtjs-boilerplate/workflows/Security%20Scan/badge.svg)](https://github.com/cpa02cmz/nuxtjs-boilerplate/actions/workflows/security.yml)
[![CI/CD Pipeline](https://github.com/cpa02cmz/nuxtjs-boilerplate/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/cpa02cmz/nuxtjs-boilerplate/actions/workflows/ci.yml)

A production-ready Nuxt.js 3 template with authentication, search, analytics, and community features.

## 🚀 Features

- ⚡ **Modern, responsive design** with Nuxt.js 3
- 🔍 **Advanced search and filtering** capabilities with faceted search
- 🎨 **Performance-optimized** with Tailwind CSS
- 📱 **SEO-friendly and accessible**
- 👥 **Community features** with user profiles, comments, and voting
- 🛠️ **Nuxt 3** with Vue 3 and TypeScript
- 🔒 **Security scanning** with CodeQL and dependency review
- 📊 **Analytics and monitoring** with comprehensive tracking
- 🔗 **Resource management** with submission and moderation system
- ⚖️ **Comparison tools** for resource evaluation
- 🔔 **Webhook integration** for external service communication
- 🏗️ **Stable infrastructure** with resolved build and dependency issues

## 📋 Core Features

- **Resource Management** - Create, edit, and manage resources with submission system
- **Advanced Search** - Full-text search with filtering, sorting, and faceted search
- **User Preferences** - Client-side preference management and profiles (LocalStorage based)
- **Community Features** - Comments, voting, and user engagement tools
- **Analytics & Monitoring** - Comprehensive tracking and performance metrics
- **API Integration** - RESTful API with webhook support and rate limiting

## 🚀 Quick Start

Get started in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start development server
npm run dev
```

The application will be available at **http://localhost:3000**

📚 **See [AGENTS.md](AGENTS.md) for comprehensive development documentation**

### Prerequisites

- Node.js 20+ (check `.nvmrc` for exact version)
- npm 10+
- SQLite3 (usually pre-installed)

### Installation Details

1. **Clone the repository**

```bash
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate
```

2. **Install dependencies**

```bash
# Using npm (recommended)
npm install

# Using pnpm
pnpm install
```

> **Note**: The project uses `packageManager: npm` in package.json, so npm is the recommended package manager.

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
NUXT_PUBLIC_CANONICAL_URL=http://localhost:3000
DATABASE_URL=file:./data/dev.db
```

4. **Set up database**

```bash
# Generate Prisma client
npm run prisma:generate

# (Optional) Run migrations if needed
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

5. **Start development server**

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Verify Setup

Run tests to ensure everything is working:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 3, Vue.js 3, TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel/Netlify ready
- **Performance**: Optimized for Core Web Vitals

## 📚 Documentation

> **Note**: The comprehensive documentation is available in [AGENTS.md](AGENTS.md). The linked guides below are planned documentation that will be added in future updates.

### Getting Started

- [AGENTS.md](AGENTS.md) - **Comprehensive guide for AI assistants and developers (Start here!)**
- Development Setup Guide - Complete environment setup (planned)

### Development

- Development Guide - Development workflows and patterns (planned)
- Integration Patterns - Architecture and design patterns (planned)
- Testing Guide - Testing strategies and procedures (planned)

### API & Deployment

- API Reference - RESTful API documentation (planned)
- Deployment Guide - Production deployment instructions (planned)

### Troubleshooting

- Troubleshooting Guide - Common issues and solutions (planned)
- Repository Management - Project maintenance guidelines (planned)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📊 Repository Management

This project follows a structured approach to repository management. For information about our triage process, issue handling, and PR review workflow, see:

- [AGENTS.md](AGENTS.md) - Repository management and maintenance guidelines
- Repository Management Guide (planned)
- Triage Process (planned)

We're committed to maintaining a healthy repository with:

- **Quick response times**: Issues responded to within 48 hours
- **Regular maintenance**: Weekly reviews of open issues and PRs
- **Clear communication**: Regular updates on issue status
- **Community support**: Assistance for new contributors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔄 Project Architecture

This boilerplate implements a comprehensive architecture for modern web applications:

- **Modular Design**: Component-based architecture with clear separation of concerns
- **API-First**: RESTful API design with comprehensive endpoints
- **Authentication System**: Complete user authentication and authorization
- **Search & Discovery**: Advanced search with faceted filtering and recommendations
- **Community Features**: User engagement tools and moderation system

For more details, see the architecture documentation in [AGENTS.md](AGENTS.md).

## 🏗️ Infrastructure Status

This project has undergone infrastructure stabilization to ensure reliable development and deployment:

- ✅ **Build System**: ESLint configuration functional with minor warnings
- ✅ **Dependency Management**: All packages updated and vulnerabilities addressed
- ✅ **Testing**: Test suite functional with 1,345 tests passing (0 skipped)
- ✅ **Code Quality**: Linting passes with no critical issues
- ⚠️ **Security**: 40 vulnerabilities detected (dev dependencies only - see [VULNERABILITIES.md](VULNERABILITIES.md))

For more details about our infrastructure improvements, see [AGENTS.md](AGENTS.md).

**Last Updated**: 2026-02-21

---

Built with ❤️ for the developer community
