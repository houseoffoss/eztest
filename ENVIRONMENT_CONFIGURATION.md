# Environment Configuration Guide

## Overview
EzTest uses separate environment files for different deployment scenarios:

- `.env.local` - Local development (not used by Docker)
- `.env.docker` - Docker Compose deployment
- `.env.production.example` - Template for production deployment

## File Priority and Loading

### Docker Compose Behavior
Docker Compose automatically loads files in this order:
1. `.env` - **Automatically loaded if exists** (highest priority)
2. Files specified in `env_file:` directive in docker-compose.yml
3. Environment variables in `environment:` section
4. Default values using `${VAR:-default}` syntax

### Important Note
⚠️ **Do NOT name your Docker environment file `.env`** - Docker Compose will load it automatically and it may conflict with local development settings.

## Current Setup

### .env.local (Local Development)
```dotenv
# Used for local development outside Docker
DATABASE_URL="postgresql://postgres:Kavin369@localhost:5433/eztest?schema=public"
# ... other local settings
```

**Usage**: 
- Used when running `npm run dev` locally
- PostgreSQL running on localhost:5433
- Not read by Docker Compose

### .env.docker (Docker Deployment)
```dotenv
# Used by docker-compose
DATABASE_URL="postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public"
POSTGRES_USER=eztest
POSTGRES_PASSWORD=eztest_password
POSTGRES_DB=eztest
# ... other Docker settings
```

**Usage**:
- Loaded by docker-compose.yml via `env_file: - .env.docker`
- Uses Docker service name 'postgres' as host
- Port 5432 (internal Docker network)

### .env.production.example (Production Template)
```dotenv
# Template - Copy to .env.docker and customize
DATABASE_URL="postgresql://username:password@postgres:5432/database?schema=public"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
# ... other production settings
```

**Usage**:
- Template for production deployment
- Copy and customize for your environment
- Never commit with actual credentials

## Docker Compose Configuration

### docker-compose.yml
```yaml
services:
  postgres:
    env_file:
      - .env.docker  # Explicit file reference
    environment:
      # Fallback defaults if not in .env.docker
      POSTGRES_USER: ${POSTGRES_USER:-eztest}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-eztest_password}
      POSTGRES_DB: ${POSTGRES_DB:-eztest}

  app:
    env_file:
      - .env.docker  # Explicit file reference
    environment:
      # Override or provide additional variables
      DATABASE_URL: ${DATABASE_URL:-postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public}
      NODE_ENV: production
```

## Migration from .env to .env.docker

If you previously used `.env` for Docker, migrate as follows:

1. **Rename existing .env**:
   ```powershell
   # Windows
   Move-Item .env .env.local

   # Linux
   mv .env .env.local
   ```

2. **Create .env.docker**:
   ```powershell
   # Windows
   Copy-Item .env.local .env.docker

   # Linux
   cp .env.local .env.docker
   ```

3. **Update .env.docker**:
   - Change `localhost` to `postgres` (Docker service name)
   - Change port from `5433` to `5432` (internal Docker port)
   - Update DATABASE_URL accordingly

4. **Restart Docker**:
   ```powershell
   docker compose down -v
   docker compose up -d
   ```

## Environment Variable Priority

### Example Conflict Scenario
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.docker          # DATABASE_URL=postgres:5432
    environment:
      DATABASE_URL: ${DATABASE_URL:-postgresql://...}  # Uses value from .env if exists
```

If `.env` file exists with:
```
DATABASE_URL="postgresql://...@localhost:5433/..."
```

Docker Compose will:
1. Load `.env` automatically → DATABASE_URL=localhost:5433
2. Load `.env.docker` → DATABASE_URL=postgres:5432 (ignored, already set)
3. Use localhost:5433 (WRONG for Docker!)

**Solution**: Rename `.env` to `.env.local` so it's not automatically loaded.

## Verification

### Check Which Variables Are Loaded
```powershell
# View all environment variables in container
docker compose exec app env

# Check specific variable
docker compose exec app sh -c 'echo $DATABASE_URL'

# Expected output for Docker:
postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public
```

### Common Issues

#### Issue 1: Connection to localhost:5433
**Symptom**: App logs show "localhost:5433"
**Cause**: `.env` file exists and is being read
**Fix**: 
```powershell
Move-Item .env .env.local -Force
docker compose down
docker compose up -d
```

#### Issue 2: Authentication Failed
**Symptom**: "provided database credentials are not valid"
**Cause**: Old PostgreSQL volume with different credentials
**Fix**:
```powershell
docker compose down -v  # Remove volumes
docker compose up -d
```

#### Issue 3: Variables Not Updated
**Symptom**: Changes to .env.docker not reflected
**Cause**: Container needs restart or rebuild
**Fix**:
```powershell
# For config changes only
docker compose down
docker compose up -d

# For code changes
docker compose down
docker compose build app
docker compose up -d
```

## Best Practices

### 1. Never Commit Sensitive Data
```gitignore
# .gitignore
.env
.env.local
.env.docker
.env.production

# Exception: templates are OK
!.env.production.example
```

### 2. Use Strong Secrets in Production
```bash
# Generate secure NEXTAUTH_SECRET
openssl rand -base64 32

# Generate secure passwords
openssl rand -base64 24
```

### 3. Document Required Variables
Create `.env.docker.example`:
```dotenv
# Required Variables
DATABASE_URL=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Optional Variables
ADMIN_EMAIL=admin@eztest.local
MAX_FILE_SIZE=10485760
```

### 4. Validate Environment Before Deployment
```powershell
# Check all required variables are set
docker compose config

# Should not show warnings about unset variables
```

### 5. Use Docker Secrets for Production
For sensitive data in production, use Docker secrets:
```yaml
services:
  app:
    secrets:
      - db_password
      - nextauth_secret

secrets:
  db_password:
    external: true
  nextauth_secret:
    external: true
```

## Quick Reference

| Scenario | File to Use | Host | Port |
|----------|------------|------|------|
| Local development | `.env.local` | localhost | 5433 |
| Docker Compose | `.env.docker` | postgres | 5432 |
| Production | `.env.docker` (customized) | postgres | 5432 |
| CI/CD | Environment variables | varies | varies |

## Troubleshooting Commands

```powershell
# List all env files
Get-ChildItem -Filter "*.env*"

# Check docker-compose will use correct file
docker compose config | Select-String "DATABASE_URL"

# Verify app container environment
docker compose exec app env | Select-String "DATABASE"

# Test database connection from app container
docker compose exec app npx prisma db push --skip-generate

# View compose warnings (shows unset variables)
docker compose config
```

## Security Checklist

For production deployment:
- [ ] Changed default POSTGRES_PASSWORD
- [ ] Generated secure NEXTAUTH_SECRET (32+ characters)
- [ ] Updated ADMIN_PASSWORD (strong password)
- [ ] Set proper NEXTAUTH_URL (your domain)
- [ ] Configured APP_URL (your domain)
- [ ] Updated SMTP credentials
- [ ] Removed or secured .env.local
- [ ] Never committed .env.docker with real credentials
- [ ] Set restrictive file permissions (chmod 600 .env.docker)
- [ ] Documented which variables are required
- [ ] Tested deployment in staging environment

---
**Last Updated**: November 25, 2025
**Status**: Complete ✅
