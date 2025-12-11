# EzTest - Self-Hostable Test Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Overview

EzTest is a lightweight, open-source test management platform built with Next.js and designed for self-hosting. It provides an efficient alternative to commercial tools like Testiny and TestRail, optimized to run on minimal hardware (1 CPU core, 2GB RAM). EzTest combines a modern UI with powerful test management capabilities, featuring project management, test organization, execution tracking, and team collaboration—all deployable with Docker.

**Current Status:** Active Development (v0.1.0)  
**Repository:** [github.com/houseoffoss/eztest](https://github.com/houseoffoss/eztest)  
**License:** MIT  
**Maintainer:** Philip Moses (philip.moses@belsterns.com)

### 🎯 Core Features Status

| Feature | Status | Details |
|---------|--------|---------|
| **Authentication & Authorization** | ✅ Complete | Email/password auth, RBAC, permissions |
| **Project Management** | ✅ Complete | CRUD, team management, member roles |
| **Test Suites** | ✅ Complete | Hierarchical organization, unlimited nesting |
| **Test Cases** | ✅ Complete | Full CRUD, steps, priorities, statuses |
| **Test Runs** | ✅ Complete | Execution tracking, results, progress monitoring |
| **Test Results** | ✅ Complete | Multiple statuses, comments, duration tracking |
| **File Attachments** | ✅ Complete | Direct S3 upload, up to 500MB, presigned URLs |
| **Dashboard & Analytics** | 🚧 In Progress | Basic metrics available |
| **Requirements Traceability** | 📋 Planned | Link tests to requirements |
| **Comments & Collaboration** | 📋 Planned | Discussions on tests |
| **API Integrations** | 📋 Planned | Jira, GitHub, Azure DevOps |
| **Automation Integration** | 📋 Planned | CI/CD, test frameworks |

---

## ⚠️ Security Notice for Open Source Project

**IMPORTANT:** This project requires AWS S3 credentials for file attachments. 

🔒 **Never commit real AWS credentials to the repository!**

- ✅ `.env.local` is in `.gitignore` and won't be committed
- ✅ Use `.env.example` as a template (contains placeholders only)
- ✅ For deployment, use environment variables or AWS IAM roles
- ✅ Create a dedicated IAM user with S3-only permissions (see `docs/S3_CORS_SETUP.md`)
- ✅ Rotate credentials immediately if accidentally exposed

---

## ✨ Features

### ✅ Implemented Features

#### Authentication & Security
- **User Authentication**
  - Secure email/password authentication with bcrypt hashing
  - JWT-based session management via NextAuth.js
  - Password reset with email token validation
  - User profile management with soft-delete capabilities

- **Role-Based Access Control (RBAC)**
  - System roles: ADMIN, PROJECT_MANAGER, TESTER, VIEWER
  - Project roles: OWNER, ADMIN, TESTER, VIEWER
  - 27 granular permissions across 6 resources
  - Admin-only project member management
  - Project visibility based on membership

#### Project Management
- **Complete CRUD Operations**
  - Create, read, update, and delete projects
  - Unique project keys (e.g., ECOM, MAT)
  - Project descriptions and metadata
  - Project statistics and counts

- **Team Management**
  - Add/remove team members
  - Assign project-level roles
  - Member invitation by email
  - Role-based permissions enforcement
  - View team member lists with roles

- **Project Organization**
  - Multi-project workspace support
  - Project visibility based on membership
  - Admin can view all projects
  - Project search and filtering

#### Test Organization
- **Test Suites (Hierarchical)**
  - Create nested test suites (unlimited depth)
  - Parent-child relationships
  - Move suites within hierarchy
  - Reorder suites by display order
  - Organize test cases by suite
  - View suite statistics (test case counts)

- **Test Cases**
  - Full CRUD operations for test cases
  - Auto-generated sequential IDs (tc1, tc2, tc3...)
  - Priority levels: CRITICAL, HIGH, MEDIUM, LOW
  - Status tracking: ACTIVE, DRAFT, DEPRECATED
  - Rich descriptions and expected results
  - Preconditions and postconditions
  - Estimated execution time

- **Test Steps**
  - Detailed step-by-step test procedures
  - Action and expected result per step
  - Sequential step numbering
  - Update and reorder steps
  - View step execution history

#### Test Execution & Tracking
- **Test Runs**
  - Create and manage test runs
  - Assign runs to team members
  - Environment-specific execution (Staging, QA, Production)
  - Run status: PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  - Start and complete test runs
  - Track execution timeline

- **Test Results**
  - Record test results: PASSED, FAILED, BLOCKED, SKIPPED, RETEST
  - Add execution comments and notes
  - Track execution duration per test
  - Error messages and details
  - View execution history per test case
  - Result statistics and pass rates

- **Execution Management**
  - Bulk test case selection for runs
  - Individual result recording
  - Real-time progress tracking
  - Execution metrics and analytics

#### User Interface
- **Modern Design**
  - Clean glass morphism aesthetic
  - Built with Tailwind CSS v4 and Radix UI
  - Responsive layout (mobile, tablet, desktop)
  - Accessibility-focused components

- **Key Pages**
  - Projects list and detail views
  - Test suites hierarchy view
  - Test cases list and detail pages
  - Test runs execution interface
  - Team member management pages
  - User profile and settings

#### Developer Experience
- **Development Tools**
  - Comprehensive technical documentation
  - Docker containerization with Docker Compose
  - TypeScript for type safety
  - ESLint configuration
  - Prisma ORM with migrations
  - Database seeding with sample data

### 🚧 In Development
- Dashboard with advanced metrics and charts
- Requirements traceability matrix
- Comments and collaboration features
- File attachments for test cases and results

### 📋 Planned
- Requirements traceability matrix
- Comments and collaboration features
- File attachments
- API integrations (Jira, GitHub, Azure DevOps)
- Test automation framework integration
- Advanced reporting and analytics
- Multi-factor authentication (MFA)
- OAuth providers (Google, GitHub)

See [ROADMAP.md](./ROADMAP.md) for the complete feature roadmap.

### 📈 What's Built

- **11 Database Models** - Complete Prisma schema for all features
- **27 Permissions** - Granular access control across 6 resource types
- **4 Major Features** - Projects, Test Suites, Test Cases, Test Runs (all complete)
- **25+ API Endpoints** - RESTful API with full CRUD operations
- **Multiple UI Pages** - List views, detail pages, execution interfaces
- **Role-Based Security** - 4 system roles, project-level permissions
- **Comprehensive Documentation** - 15+ detailed documentation files

---

## 🚀 Quick Start

### Requirements

- **Docker & Docker Compose** (recommended for deployment)
- **Node.js 18+** (for local development)
- **PostgreSQL 16** (included in Docker setup)

### Docker Installation (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/houseoffoss/eztest.git
   cd eztest
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (database, NextAuth secret, etc.)
   # See docs/ENVIRONMENT_VARIABLES.md for detailed variable documentation
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database:**
   ```bash
   docker-compose exec app npx prisma db push
   docker-compose exec app npx prisma db seed
   ```

5. **Access the application:**
   - Open http://localhost:3000 in your browser
   - Use seeded credentials or register a new account

For detailed Docker deployment, production setup, and advanced configuration, see [DOCKER.md](./DOCKER.md).

### Local Development Installation

1. **Clone and install:**
   ```bash
   git clone https://github.com/houseoffoss/eztest.git
   cd eztest
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update DATABASE_URL and other variables in .env
   # See docs/ENVIRONMENT_VARIABLES.md for complete variable reference
   ```

3. **Set up database:**
   ```bash
   # Start PostgreSQL container (or use your own PostgreSQL server)
   docker-compose up -d postgres

   # Generate Prisma client
   npx prisma generate

   # Push database schema
   npx prisma db push

   # Seed database with roles, permissions, and sample data
   npx prisma db seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open http://localhost:3000

---

## 💻 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15.5.6 |
| **UI Library** | React | 19.1.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | Radix UI | Latest |
| **Database** | PostgreSQL | 16 |
| **ORM** | Prisma | 5.22.0 |
| **Authentication** | NextAuth.js | 4.24.11 |
| **Password Hashing** | bcryptjs | 3.0.2 |
| **Email** | Nodemailer | 6.10.1 |
| **Validation** | Zod | 4.1.12 |
| **Icons** | Lucide React | 0.546.0 |
| **Deployment** | Docker & Docker Compose | Latest |

---

## 📊 System Requirements

| Specification | Minimum | Recommended | Production |
|--------------|---------|-------------|------------|
| **CPU Cores** | 1 | 2 | 4+ |
| **RAM** | 2GB | 4GB | 8GB+ |
| **Storage** | 10GB | 20GB | 50GB+ |
| **Database** | PostgreSQL 14+ | PostgreSQL 16 | PostgreSQL 16+ |
| **Node.js** | 18.x | 20.x | 20.x LTS |

---

## 🛠️ Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Seed database with sample data
npm run db:seed
```

### Database Management

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create a new migration (production)
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Seed database with roles, permissions, and sample data
npx prisma db seed
```

### Development Workflow

1. Make changes to code or database schema
2. If schema changed: `npx prisma generate` and `npx prisma db push`
3. Test changes in browser at http://localhost:3000
4. Run linter: `npm run lint`
5. Commit changes

---

## 📚 Documentation

### Core Documentation
- **[Technical Overview](./docs/INDEX.md)** - Complete technical documentation index
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[Database Schema](./docs/DATABASE.md)** - Data models and relationships
- **[API Documentation](./docs/API.md)** - REST API endpoints and usage
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup and workflow guide
- **[Code Patterns](./docs/CODE_PATTERNS.md)** - Best practices and conventions

### Deployment & Operations
- **[Docker Deployment](./DOCKER.md)** - Production setup with Docker
- **[Environment Configuration](./docs/ENVIRONMENT.md)** - Environment setup guide
- **[Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)** - Complete variable reference
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Feature Documentation
- **[Authorization & Roles](./docs/AUTHORIZATION_AND_ROLES.md)** - RBAC system details
- **[RBAC Permissions](./docs/RBAC_PERMISSIONS.md)** - Permission matrix
- **[User Management](./docs/USER_MANAGEMENT.md)** - User operations
- **[Project Management](./docs/PROJECT_FEATURES.md)** - Project features guide

### Roadmap & Planning
- **[Development Roadmap](./ROADMAP.md)** - Feature tracking and build sequence
- **[Implementation Status](./IMPLEMENTATION_COMPLETE.md)** - Recent completions

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our code patterns
4. **Test thoroughly** (ensure `npm run lint` passes)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns (see `docs/CODE_PATTERNS.md`)
- Write meaningful commit messages
- Update documentation for new features
- Ensure all linting passes before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

**Copyright © 2025 Belsterns*

---

## 📞 Support & Contact

### Getting Help
- **GitHub Issues**: [github.com/houseoffoss/eztest/issues](https://github.com/houseoffoss/eztest/issues)
- **Documentation**: See `/docs` directory
- **Troubleshooting**: See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

### Maintainer
- **Name**: Philip Moses
- **Email**: philip.moses@belsterns.com
- **Organization**: House of FOSS

### Links
- **Repository**: [github.com/houseoffoss/eztest](https://github.com/houseoffoss/eztest)
- **Issues**: [github.com/houseoffoss/eztest/issues](https://github.com/houseoffoss/eztest/issues)
- **Releases**: [github.com/houseoffoss/eztest/releases](https://github.com/houseoffoss/eztest/releases)

---

## 🌟 Acknowledgments

Built with modern, open-source technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon library

---

**EzTest** - Making test management accessible for everyone 🚀
