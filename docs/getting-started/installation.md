# Installation Guide

This guide covers all installation methods for EZTest.

## Table of Contents

- [Docker Installation (Recommended)](#docker-installation)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Database Setup](#database-setup)
- [Verification](#verification)

---

## <a id="docker-installation"></a>Docker Installation (Recommended)

Docker provides the simplest way to deploy EzTest with all dependencies pre-configured.

### Prerequisites

- Docker 20.10 or later
- Docker Compose 2.0 or later
- 2GB RAM minimum

### Step 1: Clone the Repository

```bash
git clone https://github.com/houseoffoss/eztest.git
cd eztest
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your settings
nano .env  # or use your preferred editor
```

**Required environment variables:**

```env
# Database (auto-configured for Docker)
DATABASE_URL="postgresql://eztest:eztest@postgres:5432/eztest"

# Authentication (REQUIRED - generate a secure secret)
NEXTAUTH_SECRET="your-secret-key-at-least-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="production"
```

> 💡 **Tip**: Generate a secure secret with: `openssl rand -base64 32`

### Step 3: Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Initialize Database

```bash
# Run database migrations
docker-compose exec app npx prisma db push

# Seed with initial data (roles, permissions, sample data)
docker-compose exec app npx prisma db seed
```

### Step 5: Access EZTest

Open your browser and navigate to:

```
http://localhost:3000
```

Default credentials (if seeded):
- **Admin**: admin@example.com / Admin123!
- **Tester**: tester@example.com / Tester123!

---

## <a id="local-development"></a>Local Development

For development and contributing to EZTest.

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- PostgreSQL 14 or later (or Docker for database only)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/houseoffoss/eztest.git
cd eztest

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/eztest"

# Authentication
NEXTAUTH_SECRET="development-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Development mode
NODE_ENV="development"
```

### Step 3: Set Up Database

**Option A: Use Docker for PostgreSQL only**

```bash
# Start just the database
docker-compose up -d postgres

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://eztest:eztest@localhost:5432/eztest"
```

**Option B: Use existing PostgreSQL**

```bash
# Create database
createdb eztest

# Update DATABASE_URL in .env with your connection string
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |

---

## <a id="production-deployment"></a>Production Deployment

### Environment Configuration

For production, ensure these settings:

```env
# Production mode
NODE_ENV="production"

# Secure database connection
DATABASE_URL="postgresql://user:password@host:5432/eztest?sslmode=require"

# Strong authentication secret
NEXTAUTH_SECRET="your-very-secure-random-string-here"
NEXTAUTH_URL="https://your-domain.com"

# SMTP for email notifications (optional)
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@your-domain.com"

# S3 for file attachments (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
AWS_S3_PATH_PREFIX="prod"
```

### Docker Production Build

```bash
# Build production image
docker build -t eztest:latest .

# Run with docker-compose
docker-compose -f docker-compose.yml up -d
```

### Health Check

Verify the deployment:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## <a id="database-setup"></a>Database Setup

### Prisma Commands Reference

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database (dev) |
| `npx prisma migrate dev` | Create migration (dev) |
| `npx prisma migrate deploy` | Apply migrations (prod) |
| `npx prisma db seed` | Seed database |
| `npx prisma studio` | Open database GUI |

### Database Migrations

For production, use migrations instead of `db push`:

```bash
# Create a new migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

### Resetting Database

⚠️ **Warning**: This deletes all data!

```bash
# Reset and reseed
npx prisma db push --force-reset
npx prisma db seed
```

---

## <a id="verification"></a>Verification

### Check Installation

1. **Application running**: Visit `http://localhost:3000`
2. **API healthy**: `curl http://localhost:3000/api/health`
3. **Database connected**: Check Prisma Studio `npx prisma studio`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change port in `docker-compose.yml` or use `PORT=3001 npm run dev` |
| Database connection failed | Check `DATABASE_URL` in `.env` |
| Docker build failed | Ensure Docker daemon is running |
| Prisma generate failed | Run `npm install` first |

For more help, see [Troubleshooting Guide](../operations/troubleshooting.md).

---

## Next Steps

- [Quick Start Tutorial](./quickstart.md)
- [Configuration Reference](./configuration.md)
- [Create Your First Project](./first-project.md)

