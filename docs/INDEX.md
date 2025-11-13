# EZTest Technical Documentation

Welcome to the EZTest technical documentation. This directory contains comprehensive guides for understanding the codebase, architecture, and workflows.

## Documentation Index

### Getting Started
- **[Architecture Overview](./ARCHITECTURE.md)** - High-level system design and component structure
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Directory layout and file organization
- **[Project Features](./PROJECT_FEATURES.md)** - Comprehensive guide to all project management features

### Core Systems
- **[Database Schema](./DATABASE.md)** - Data models, relationships, and design patterns
- **[Authentication & Authorization](./AUTHENTICATION.md)** - User management, roles, permissions, and security
- **[API Documentation](./API.md)** - REST API endpoints and request/response examples

### Development
- **[Development Workflows](./DEVELOPMENT.md)** - Local setup, running tests, building, debugging
- **[Code Patterns](./CODE_PATTERNS.md)** - Common patterns, conventions, and best practices
- **[Environment Configuration](./ENVIRONMENT.md)** - Environment variables and configuration management

### Operations
- **[Deployment & Configuration](./DEPLOYMENT.md)** - Docker setup, production configuration, monitoring
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## Quick Links

- **Main Repository**: See README.md in project root
- **Docker Guide**: See DOCKER.md in project root
- **Environment Setup**: See `.env.example` in project root

---

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Node.js 18+
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: NextAuth.js with JWT sessions
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS v4
- **Containerization**: Docker & Docker Compose

---

## Key Features

- **Multi-project Test Management** - Organize tests across multiple projects
- **Hierarchical Test Organization** - Nested test suites and comprehensive test cases
- **Role-Based Access Control** - Project-level roles with fine-grained permissions
- **Test Execution Tracking** - Real-time test run management and result logging
- **Requirements Traceability** - Link test cases to requirements
- **Collaboration** - Comments, attachments, and team coordination
- **Self-Hosting** - Complete Docker-based deployment with minimal resources

---

## Document Maintenance

All documentation should be kept up-to-date with code changes. When modifying core functionality:

1. Update relevant documentation sections
2. Add examples if new patterns are introduced
3. Update API documentation for endpoint changes
4. Update database documentation if schema changes
5. Add troubleshooting entries for known issues

