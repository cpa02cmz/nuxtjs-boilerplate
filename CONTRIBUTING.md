# Contributing to Nuxt.js Boilerplate

Thank you for your interest in contributing to this project! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Issues

- Check if the issue already exists
- Provide detailed information about the bug or feature request
- Include steps to reproduce for bugs
- Share your environment details (OS, Node version, etc.)

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our code standards
3. **Run tests** to ensure nothing is broken
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Development Setup

1. Fork the repository and clone it locally
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and configure
4. Run `npm run prisma:generate` to set up the database
5. Run `npm run dev` to start the development server

> See the [README.md](./README.md) for complete setup instructions.

### Code Standards

We follow these guidelines:

- **TypeScript**: Strict mode enabled, prefer explicit types
- **Components**: Use Vue 3 Composition API with `<script setup>`
- **Styling**: Tailwind CSS for all styling
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Git**: Feature branches with conventional commits

> See the [README.md](./README.md) for project architecture details.

### Commit Message Convention

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test updates
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example: `feat: add user authentication`

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure all tests pass
3. Request review from maintainers
4. Address any feedback
5. Once approved, your PR will be merged

## 📝 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 💬 Questions?

Feel free to open an issue for questions or join our discussions.

Thank you for contributing! 🎉
