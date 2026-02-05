# EZTest - Self-Hostable Test Management Platform

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## Overview

EZTest is a lightweight, open-source test management platform built with Next.js and designed for self-hosting. It provides an efficient alternative to commercial tools like Testiny and TestRail, optimized to run on minimal hardware (1 CPU core, 2GB RAM). EZTest combines a modern UI with powerful test management capabilities, featuring project management, test organization, execution tracking, and team collaboration—all deployable with Docker.

> 👥 **New User?** Check out the [**User Guide**](docs/USER_GUIDE.md) - a simple, non-technical guide explaining what EZTest is and how to use it.

**Current Status:** Active Development (v0.1.0)  
**Demo Site:** [eztest.houseoffoss.com](https://eztest.houseoffoss.com/)  

**License:** AGPL-3.0  
**Maintainers:** Philip Moses (philip.moses@belsterns.com), Kavin (kavin.p@belsterns.com)

## 🛡️ The Philosophy: Breaking the "SaaS Tax"

Software used to be a tool you owned; today, it’s a subscription you rent. 

Test management tools today are just **glorified, overpriced spreadsheets.** They charge $20 to $40 per user, per month for basic CRUD operations. A price that is no longer defensible in the age of AI Coding Agents.

**EZTest** was born out of that simple realization: **If an AI agent costs $20/month and can build a software in no time, why pay $20/per/month just to rent one?**

The goal isn't to reinvent the wheel. It's to break the cycle of mediocre, overpriced software. 

We use **Claude Code and Cursor** to compress the cost of development to near-zero, and we are passing that "Efficiency Dividend" to the community.

## 📸 Screenshots

<div align="center">

### Public Homepage

![Home Page](./docs/images/screenshots/Home_Page.png)

### Main Application

| **Projects Dashboard** | **Test Cases** |
|:---:|:---:|
| ![Projects](./docs/images/screenshots/Project_List_Page.png) | ![Test Cases](./docs/images/screenshots/TestCase_List_Page.png) |

| **Test Runs** | **Defect Tracking** |
|:---:|:---:|
| ![Test Runs](./docs/images/screenshots/TestRun_List_Page.png) | ![Defects](./docs/images/screenshots/Defects_List_Page.png) |

</div>

### 🎯 Core Features Status

| Feature | Status | Details |
|---------|--------|---------|
| **Authentication & Authorization** | ✅ Complete | Email/password auth, RBAC, permissions |
| **User Management** | ✅ Complete | CRUD, team management, member roles |
| **Modules** | ✅ Complete | Project organization, feature grouping |
| **Test Suites** | ✅ Complete | Hierarchical organization For Execution |
| **Test Cases** | ✅ Complete | Full CRUD, steps, priorities, statuses |
| **Test Runs** | ✅ Complete | Execution tracking, results, progress monitoring |
| **Test Results** | ✅ Complete | Multiple statuses, comments, duration tracking |
| **File Attachments** | ✅ Complete | Direct S3 upload, up to 500MB, presigned URLs |
| **Comments & Collaboration** | ✅ Complete | Discussions on Defect |
| **Dashboard & Analytics** | 🚧 In Progress | Basic metrics available |
| **Requirements Traceability** | 📋 Planned | Link tests to requirements |
| **API Integrations** | 📋 Planned | Jira, GitHub, Azure DevOps |
| **Automation Integration** | 📋 Planned | CI/CD, test frameworks |

---

## ⚠️ Security Notice for Open Source Project

**IMPORTANT:** This project requires AWS S3 credentials for file attachments. 

🔒 **Never commit real AWS credentials to the repository!**

- ✅ `.env.local` is in `.gitignore` and won't be committed
- ✅ Use `.env.example` as a template (contains placeholders only)
- ✅ For deployment, use environment variables or AWS IAM roles
- ✅ Create a dedicated IAM user with S3-only permissions (see [Attachments Documentation](./docs/features/attachments/README.md))
- ✅ Rotate credentials immediately if accidentally exposed

---

## 🚀 Quick Start

**Try EZTest with Docker** - fastest way to get started!

**Requirements:** Docker & Docker Compose

```bash
# Clone the repository
git clone https://github.com/houseoffoss/eztest.git
cd eztest

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start the application
docker-compose up -d

# Initialize database
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed

# Open http://localhost:3000
```

**Default Admin Credentials :**
- **Email**: `admin@eztest.local`
- **Password**: `Admin@123456`

> 💡 You can also register a new account, or customize admin credentials by setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before seeding.

📖 For production deployment and advanced configuration, see [DOCKER.md](./DOCKER.md)

---

## 💻 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15.5.6 |
| **UI Library** | React | 19.1.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** |  Radix UI | Latest |
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

**Contributing to EZTest?** Set up your local development environment.

**Requirements:** Node.js 18+, PostgreSQL 16

### Setup

```bash
# Clone and install dependencies
git clone https://github.com/houseoffoss/eztest.git
cd eztest
npm install

# Configure environment
cp .env.example .env
# Update DATABASE_URL and other variables

# Start PostgreSQL (or use your own server)
docker-compose up -d postgres

# Set up database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
# Open http://localhost:3000
```

### Common Commands

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run lint             # Check code quality
npx prisma studio        # Visual database editor
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Update database schema
npx prisma db seed       # Add sample data
```

### Workflow

1. Make code/schema changes
2. If schema changed: `npx prisma generate && npx prisma db push`
3. Test at http://localhost:3000
4. Run `npm run lint`
5. Commit changes

📖 **Full developer guide:** [Development Setup](./docs/contributing/development-setup.md) | [Code Patterns](./docs/architecture/patterns.md)

---

## 📚 Documentation

**For Users:**
- [User Guide](./docs/USER_GUIDE.md) - Non-technical introduction
- [Docker Deployment](./DOCKER.md) - Production setup

**For Developers:**
- [Documentation Home](./docs/README.md) - Complete documentation index
- [Architecture](./docs/architecture/README.md) - System design and patterns
- [API Documentation](./docs/api/README.md) - Internal API reference for developers

**Planning:**
- [ROADMAP](./ROADMAP.md) - Feature tracking and future plans

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
- Use existing component patterns
- Write meaningful commit messages
- Update documentation for new features
- Ensure all linting passes before submitting PR

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

**If you modify this software and run it as a network service, you must provide the complete corresponding source code to users of the service, as required by the AGPL.**

See the [LICENSE](./LICENSE) file for full details.

**Copyright © 2025 Belsterns**

---

## 📞 Support & Contact

**Demo:** [eztest.houseoffoss.com](https://eztest.houseoffoss.com/)  
**Documentation:** [/docs](./docs/README.md)  
**Issues:** Use GitHub Issues tab above

**Maintainers:**  
### Maintainers
- **Philip Moses**
  - Email: philip.moses@belsterns.com
  - Organization: House of FOSS
- **Kavin**
  - Email: kavin.p@belsterns.com
  - Organization: House of FOSS


## 🌟 Acknowledgments

Built with modern, open-source technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Lucide](https://lucide.dev/) - Icon library

---

**EZTest** - Making test management accessible for everyone 🚀
