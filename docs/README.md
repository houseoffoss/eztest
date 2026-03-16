# EZTest Documentation

<p align="center">
  <strong>A Self-Hostable Test Management Platform</strong>
</p>

<p align="center">
  <a href="#getting-started">Getting Started</a> •
  <a href="#features">Features</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#ui-components">UI Components</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Welcome to EZTest

EZTest is a lightweight, open-source test management platform built with Next.js 15, designed for self-hosting. It provides an efficient alternative to commercial tools like Testiny and TestRail, optimized to run on minimal hardware.

> 👥 **New User?** Start with the [**User Guide**](./USER_GUIDE.md) - a simple, non-technical guide for end users.

### Why EZTest?

- **🚀 Self-Hosted** - Full control over your data and infrastructure
- **💡 Lightweight** - Runs on 1 CPU core and 2GB RAM
- **🔒 Secure** - Role-based access control with 27 granular permissions
- **📊 Complete** - Projects, Test Cases, Test Runs, Defects, and more
- **🎨 Modern UI** - Beautiful glass morphism design with Tailwind CSS

---

## Project Explanation

> 📖 **New to EZTest?** Start with the [**Project Explanation**](./PROJECT_EXPLANATION.md) to understand what EZTest is, how it works, and why it exists.

> 🤖 **Using an AI coding agent?** See the [**Coding Agent Guide**](./coding-agent/README.md) for an agent‑optimized overview of the architecture, domains, and change patterns.

---

## Documentation Structure

> 📍 **Looking for a specific document?** Check the [**Documentation Paths Index**](./PATHS.md) for a complete map of all files.

```
docs/
├── README.md                    # This file - Documentation home
├── PATHS.md                     # Complete documentation paths index
├── getting-started/             # Quick start guides
│   ├── README.md               # Getting started overview
│   ├── installation.md         # Installation guide
│   ├── quickstart.md           # Quick start tutorial
│   ├── configuration.md        # Configuration reference
│   └── first-project.md        # Creating your first project
│
├── features/                    # Feature documentation
│   ├── README.md               # Features overview
│   ├── authentication/         # Auth & security features
│   ├── projects/               # Project management
│   ├── test-cases/             # Test case management
│   ├── test-suites/            # Test suite organization
│   ├── test-runs/              # Test execution
│   ├── defects/                # Defect tracking
│   └── attachments/            # File attachments
│
├── api/                         # API reference
│   ├── README.md               # API overview
│   ├── authentication.md       # Auth endpoints
│   ├── projects.md             # Project endpoints
│   ├── test-cases.md           # Test case endpoints
│   ├── test-suites.md          # Test suite endpoints
│   ├── test-runs.md            # Test run endpoints
│   ├── defects.md              # Defect endpoints
│   ├── users.md                # User endpoints
│   ├── modules.md              # Module endpoints
│   ├── attachments.md          # Attachment endpoints
│   └── comments.md             # Comment endpoints
│
├── ui/                          # UI component documentation
│   ├── README.md               # UI overview
│   ├── components/             # Component reference
│   ├── design-system/          # Design system guide
│   └── pages/                  # Page documentation
│
├── architecture/               # Technical architecture
│   ├── README.md               # Architecture overview
│   ├── database.md             # Database schema
│   ├── security.md             # Security architecture
│   └── patterns.md             # Code patterns
│
├── operations/                  # Operations & deployment
│   ├── README.md               # Operations overview
│   ├── deployment/             # Deployment guides
│   ├── monitoring.md           # Monitoring & logging
│   └── troubleshooting.md      # Troubleshooting guide
│
├── integrations/               # Automation tool integrations
│   ├── README.md               # Integrations overview
│   └── testng-maven-integration.md  # TestNG/Maven integration
│
└── contributing/               # Contribution guides
    ├── README.md               # Contribution overview
    ├── development-setup.md    # Dev environment setup
    ├── coding-standards.md     # Coding standards
    └── pull-requests.md        # PR guidelines
```

---

## <a id="getting-started"></a>Getting Started

### For End Users

| Guide | Description |
|-------|-------------|
| [**User Guide**](./USER_GUIDE.md) | Simple guide for end users - what EZTest is and how to use it |
| [**First Project**](./getting-started/first-project.md) | Step-by-step guide to create your first test project |

### For Administrators & Developers

| Guide | Description |
|-------|-------------|
| [**Installation**](./getting-started/installation.md) | Complete installation guide for Docker and local development |
| [**Quick Start**](./getting-started/quickstart.md) | Get up and running in 5 minutes |
| [**Configuration**](./getting-started/configuration.md) | Environment variables and configuration options |

---

## <a id="features"></a>Features

Detailed guides for each feature:

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| [**Authentication**](./features/authentication/README.md) | User authentication, roles, and permissions | ✅ Complete |
| [**Projects**](./features/projects/README.md) | Project management and team collaboration | ✅ Complete |
| [**Test Cases**](./features/test-cases/README.md) | Test case creation and management | ✅ Complete |
| [**Test Suites**](./features/test-suites/README.md) | Hierarchical test organization | ✅ Complete |
| [**Test Runs**](./features/test-runs/README.md) | Test execution and result tracking | ✅ Complete |
| [**Defects**](./features/defects/README.md) | Defect tracking and management | ✅ Complete |
| [**Attachments**](./features/attachments/README.md) | File attachments with S3 support | ✅ Complete |
| [**Email Notifications**](./features/email/README.md) | Email notifications and SMTP | ✅ Complete |

---

## <a id="api-reference"></a>API Reference

Internal API documentation for developers:

| Resource | Description |
|----------|-------------|
| [**API Overview**](./api/README.md) | Authentication, response formats, error handling |
| [**Authentication API**](./api/authentication.md) | Login, register, password reset, OTP |
| [**Projects API**](./api/projects.md) | Project CRUD operations |
| [**Test Cases API**](./api/test-cases.md) | Test case management |
| [**Test Suites API**](./api/test-suites.md) | Test suite organization |
| [**Test Runs API**](./api/test-runs.md) | Test execution |
| [**Defects API**](./api/defects.md) | Defect tracking |
| [**Users API**](./api/users.md) | User management |
| [**Modules API**](./api/modules.md) | Module organization |
| [**Attachments API**](./api/attachments.md) | File uploads |
| [**Comments API**](./api/comments.md) | Comment management |

---

## <a id="ui-components"></a>UI Components

Component library and design system:

| Section | Description |
|---------|-------------|
| [**UI Overview**](./ui/README.md) | UI architecture and principles |
| [**Components**](./ui/components/README.md) | Reusable component reference |
| [**Design System**](./ui/design-system/README.md) | Colors, typography, spacing |
| [**Pages**](./ui/pages/README.md) | Page layouts and structure |

---

## <a id="architecture"></a>Architecture

Technical documentation for developers:

| Document | Description |
|----------|-------------|
| [**Architecture Overview**](./architecture/README.md) | System architecture and design decisions |
| [**Database Schema**](./architecture/database.md) | Data models and relationships |
| [**Security**](./architecture/security.md) | Security implementation |
| [**Code Patterns**](./architecture/patterns.md) | Coding patterns and conventions |

---

## <a id="contributing"></a>Contributing

Join the community and contribute:

| Guide | Description |
|-------|-------------|
| [**Contribution Overview**](./contributing/README.md) | How to contribute to EZTest |
| [**Development Setup**](./contributing/development-setup.md) | Setting up your dev environment |
| [**Coding Standards**](./contributing/coding-standards.md) | Code style and best practices |
| [**Pull Requests**](./contributing/pull-requests.md) | PR submission guidelines |

---

## Quick Links

### Navigation
- [**📍 Documentation Paths Index**](./PATHS.md) - Complete map of all documentation files

### For Users
- [Installation Guide](./getting-started/installation.md)
- [Feature Guides](./features/README.md)
- [Troubleshooting](./operations/troubleshooting.md)

### For Developers
- [API Reference](./api/README.md)
- [Architecture](./architecture/README.md)
- [Contributing](./contributing/README.md)

### For Operations
- [Deployment Guides](./operations/deployment/README.md)
- [Configuration](./getting-started/configuration.md)
- [Monitoring](./operations/monitoring.md)

### For Automation
- [Integrations Overview](./integrations/README.md)
- [TestNG/Maven Integration](./integrations/testng-maven-integration.md)

---

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js | 15.5.6 |
| **UI Library** | React | 19.1.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | Radix UI | Latest |
| **Database** | PostgreSQL | 16 |
| **ORM** | Prisma | 5.22.0 |
| **Authentication** | NextAuth.js | 4.24.11 |
| **Deployment** | Docker | Latest |

---

## Support

- **GitHub Issues**: [github.com/houseoffoss/eztest/issues](https://github.com/houseoffoss/eztest/issues)
- **Documentation**: You're here! 📚
- **License**: [AGPL-3.0 License](../LICENSE)

---

<p align="center">
  <strong>EZTest</strong> - Making test management accessible for everyone 🚀
</p>
