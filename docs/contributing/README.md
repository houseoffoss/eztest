# Contributing to EZTest

Welcome! We're excited that you want to contribute to EZTest. This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- **Be respectful** - Treat everyone with respect
- **Be inclusive** - Welcome newcomers
- **Be constructive** - Provide helpful feedback
- **Be patient** - Remember we're all learning

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- PostgreSQL 14 or later (or Docker)
- Git

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/eztest.git
   cd eztest
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/houseoffoss/eztest.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

6. **Set up database**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres

   # Set up schema
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

7. **Start development server**

   ```bash
   npm run dev
   ```

See [Development Setup](./development-setup.md) for detailed instructions.

---

## How to Contribute

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 **Bug Fixes** | Fix issues and bugs |
| ✨ **Features** | Add new functionality |
| 📝 **Documentation** | Improve or add docs |
| 🎨 **UI/UX** | Improve the interface |
| ⚡ **Performance** | Optimize code |
| 🧪 **Tests** | Add or improve tests |

### Finding Work

1. **Check Issues** - Look for `good first issue` or `help wanted` labels
2. **Check Discussions** - Join conversations about features
3. **Check Roadmap** - See planned features in [ROADMAP.md](../../ROADMAP.md)

### Before Starting

1. **Check existing issues** - Avoid duplicate work
2. **Open an issue first** - For significant changes
3. **Discuss approach** - For major features

---

## Development Workflow

### Branch Naming

```
feature/short-description
fix/short-description
docs/short-description
refactor/short-description
```

**Examples:**
- `feature/add-test-export`
- `fix/login-redirect-error`
- `docs/update-api-guide`

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(testcases): add bulk export functionality

fix(auth): resolve redirect loop on login

docs(api): update authentication examples
```

### Development Commands

```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Database commands
npx prisma studio      # Open database GUI
npx prisma db push     # Push schema changes
npx prisma db seed     # Seed database
```

---

## Pull Request Process

### 1. Create Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature
```

### 2. Make Changes

- Follow coding standards (see [Coding Standards](./coding-standards.md))
- Write clear commit messages
- Update documentation if needed
- Add tests if applicable

### 3. Test Changes

```bash
# Run linter
npm run lint

# Build to check for errors
npm run build

# Test locally
npm run dev
```

### 4. Push Changes

```bash
git push origin feature/your-feature
```

### 5. Open Pull Request

1. Go to GitHub and click "New Pull Request"
2. Select your branch
3. Fill in the PR template:

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Other

## Testing
How did you test this?

## Screenshots
If UI changes, add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Linter passes
```

### 6. Review Process

- Maintainers will review your PR
- Address feedback and make changes
- Once approved, maintainers will merge

### PR Tips

- Keep PRs focused and small
- One feature/fix per PR
- Write clear descriptions
- Respond to feedback promptly

---

## Coding Standards

See [Coding Standards](./coding-standards.md) for detailed guidelines:

- **TypeScript** - Use proper types
- **ESLint** - Pass all linting rules
- **Formatting** - Consistent style
- **Components** - Follow patterns
- **API** - RESTful conventions

---

## Documentation

When contributing documentation:

1. Use clear, concise language
2. Include code examples
3. Follow existing format
4. Update table of contents
5. Check links work

---

## Community

### Getting Help

- **GitHub Discussions** - Ask questions
- **GitHub Issues** - Report bugs
- **Documentation** - Read the docs

### Maintainers

- **Philip Moses** - philip.moses@belsterns.com
- **Kavin** - kavin.p@belsterns.com

### Recognition

Contributors are recognized in:
- README contributors section
- Release notes
- Our eternal gratitude 🙏

---

## License

By contributing, you agree that your contributions will be licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

---

## Thank You!

Thank you for contributing to EZTest! Every contribution helps make test management more accessible for everyone.

🚀 Happy coding!
