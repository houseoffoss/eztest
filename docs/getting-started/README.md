# Getting Started

Welcome to EZTest! This section will help you get up and running quickly.

## Overview

EZTest is a self-hostable test management platform that can be deployed using Docker or run locally for development. Choose the path that best fits your needs:

### 🚀 Quick Path (Recommended)

For users who want to get started quickly:

1. **[Quick Start](./quickstart.md)** - Get running in 5 minutes with Docker
2. **[First Project](./first-project.md)** - Create your first test project

### 📦 Complete Setup

For production deployments or custom configurations:

1. **[Installation](./installation.md)** - Full installation guide
2. **[Configuration](./configuration.md)** - All configuration options

---

## Prerequisites

Before you begin, ensure you have the following installed:

### For Docker Deployment (Recommended)

| Requirement | Version | Description |
|-------------|---------|-------------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Multi-container orchestration |

### For Local Development

| Requirement | Version | Description |
|-------------|---------|-------------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 14+ | Database (or use Docker) |

---

## Quick Links

| Guide | Time | Description |
|-------|------|-------------|
| [Quick Start](./quickstart.md) | 5 min | Fastest way to get running |
| [Installation](./installation.md) | 15 min | Complete installation guide |
| [Configuration](./configuration.md) | 10 min | Environment variables |
| [First Project](./first-project.md) | 10 min | Create your first project |

---

## System Requirements

### Minimum Requirements

| Resource | Specification |
|----------|---------------|
| CPU | 1 core |
| RAM | 2 GB |
| Storage | 10 GB |
| Network | Internet access for initial setup |

### Recommended for Production

| Resource | Specification |
|----------|---------------|
| CPU | 2+ cores |
| RAM | 4+ GB |
| Storage | 20+ GB SSD |
| Network | Dedicated server/VPS |

---

## Deployment Options

### 1. Docker Compose (Recommended)

Best for: **Production deployments**, **quick demos**

```bash
git clone https://github.com/houseoffoss/eztest.git
cd eztest
docker-compose up -d
```

[Full Docker Guide →](./installation.md#docker-installation)

### 2. Local Development

Best for: **Development**, **contributions**

```bash
git clone https://github.com/houseoffoss/eztest.git
cd eztest
npm install
npm run dev
```

[Full Local Setup Guide →](./installation.md#local-development)

### 3. Cloud Platforms

Deploy to your favorite cloud platform:

- **AWS** - EC2 or ECS with RDS
- **DigitalOcean** - Droplets or App Platform
- **Google Cloud** - GCE or Cloud Run
- **Azure** - Container Instances or App Service

[Cloud Deployment Guide →](../operations/deployment/README.md)

---

## What's Next?

After installation, explore these guides:

1. **[Create Your First Project](./first-project.md)** - Set up your first test project
2. **[Features Overview](../features/README.md)** - Explore all features
3. **[API Reference](../api/README.md)** - Integrate with your systems

---

## Need Help?

- **Troubleshooting**: See [Troubleshooting Guide](../operations/troubleshooting.md)
- **GitHub Issues**: [Report a bug](https://github.com/houseoffoss/eztest/issues)
- **Community**: Join our discussions
