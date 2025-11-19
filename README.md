# 🆓 Free Stuff Website

A comprehensive Nuxt.js platform that curates and displays free resources available online for developers, students, and tech enthusiasts.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cpa02cmz/nuxtjs-boilerplate)

Discover free AI tools, cloud services, hosting, databases, and more valuable resources across various categories.

## 📋 Project Overview

This platform helps users find and access high-quality free resources including:

- 🤖 AI Tools and Services
- ☁️ Cloud Hosting & Storage
- 🗄️ Databases & APIs
- 🛠️ Development Tools
- 📚 Learning Resources
- 🎨 Design Assets

## 🚀 Features

- **Curated Resources**: Hand-picked free tools and services
- **Category Organization**: Resources organized by type and use case
- **Search & Filter**: Find exactly what you need quickly
- **Responsive Design**: Works seamlessly on all devices
- **Regular Updates**: New resources added continuously

Built with [Nuxt 3](https://nuxt.com) for optimal performance and developer experience.

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Stylelint

## 📦 Installation

### Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/cpa02cmz/nuxtjs-boilerplate.git
cd nuxtjs-boilerplate
```

2. **Install dependencies**

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install
```

3. **Environment setup**

Create a `.env` file in the root directory:

```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME="Free Stuff Website"
```

## 🚀 Development

Start the development server:

```bash
pnpm dev
```

The application will be available at <http://localhost:3000>

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Prettier
```

## 📁 Project Structure

```
nuxtjs-boilerplate/
├── assets/            # Static assets (CSS, images)
├── components/        # Vue components
├── layouts/           # Nuxt layouts
├── pages/             # Vue pages (auto-routing)
├── plugins/           # Nuxt plugins
├── server/            # Server-side code
├── docs/              # Project documentation
├── public/            # Public static files
├── .github/           # GitHub workflows and templates
├── nuxt.config.ts     # Nuxt configuration
├── package.json       # Dependencies and scripts
└── README.md          # Project overview
```

## 🤝 Contributing

We welcome contributions! Please read our [Development Guidelines](./docs/development.md) for details on:

- Code standards and conventions
- Git workflow
- Testing practices
- Pull request process

## 📚 Documentation

- [Getting Started](./docs/getting-started.md) - Detailed setup and development guide
- [Development Guidelines](./docs/development.md) - Coding standards and best practices
- [Architecture Documentation](./docs/architecture/) - System design and technical decisions
- [Deployment Guides](./docs/deployment/) - Platform-specific deployment instructions

## 🐛 Troubleshooting

For common issues and solutions, check our [Troubleshooting Guide](./docs/maintenance/troubleshooting.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the developer community
