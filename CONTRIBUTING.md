# Contributing to EZTest

Thank you for your interest in contributing to EZTest! This document provides guidelines and instructions for contributing.

## Quick Links

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/eztest.git
   cd eztest
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

See our [Development Setup Guide](./docs/contributing/development-setup.md) for detailed instructions.

### Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start database
docker-compose up -d postgres

# Run migrations
npx prisma db push

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

## Project Structure

```
eztest/
├── app/                    # Next.js App Router pages
├── backend/               # Backend logic (controllers, services, validators)
├── components/            # Composite components (layout, pages, design system)
├── config/                # Configuration files
├── devops/                # CI/CD Docker configurations
├── docs/                  # Documentation
├── elements/              # Base UI components (buttons, inputs, etc.)
├── frontend/components/   # Feature-specific business logic components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and shared code
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── scripts/               # Utility scripts
└── types/                 # TypeScript type definitions
```

See [docs/PROJECT_EXPLANATION.md](./docs/PROJECT_EXPLANATION.md) for detailed architecture.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing naming conventions:
  - `PascalCase` for components, types, interfaces
  - `camelCase` for functions, variables
  - `kebab-case` for file names (except components)
  - `SCREAMING_SNAKE_CASE` for constants

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### Code Style

- Run `npm run lint` before committing
- Follow the existing code patterns
- Write meaningful commit messages
- Add comments for complex logic

See [docs/contributing/coding-standards.md](./docs/contributing/coding-standards.md) for detailed guidelines.

## Submitting Changes

1. **Ensure your code passes linting**:
   ```bash
   npm run lint
   ```

2. **Test your changes** thoroughly

3. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add user profile editing"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** on GitHub:
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure CI checks pass

See [docs/contributing/pull-requests.md](./docs/contributing/pull-requests.md) for PR guidelines.

## Types of Contributions

### Bug Fixes

- Search existing issues first
- Create an issue if one doesn't exist
- Reference the issue in your PR

### New Features

- Discuss in an issue before implementing large features
- Follow the existing architecture patterns
- Update documentation as needed

### Documentation

- Documentation improvements are always welcome
- Update relevant docs when changing functionality
- Check for typos and clarity

### Testing

- Add tests for new features
- Ensure existing tests pass
- Report test failures as issues

## Questions?

- Check the [documentation](./docs/README.md)
- Search [existing issues](https://github.com/houseoffoss/eztest/issues)
- Create a new issue for questions

## License

By contributing, you agree that your contributions will be licensed under the AGPL-3.0 License.

---

Thank you for contributing to EZTest! 🚀
