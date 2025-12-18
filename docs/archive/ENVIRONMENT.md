# Environment Configuration

## Overview

EZTest uses environment variables for configuration across development, testing, and production environments. All secrets and environment-specific settings should be managed through environment files.

## Environment Files

### `.env` (Runtime - Git Ignored)
Primary environment configuration file for the current environment.

**Create from template:**
```bash
cp .env.example .env
```

### `.env.example` (Git Tracked)
Template showing all required and optional variables.

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eztest

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development

# Optional
APP_URL=http://localhost:3000
DEBUG=false
```

### `.env.development` (Optional - Git Ignored)
Development-specific overrides (loaded by Next.js in development mode).

### `.env.production` (Optional - Git Ignored)
Production-specific settings (loaded in production).

### `.env.test` (Optional - Git Ignored)
Test-specific configuration.

---

## Environment Variables Reference

### Required Variables

#### `DATABASE_URL`
PostgreSQL connection string.

**Format:**
```
postgresql://[user[:password]@][host][:port][/database][?param=value]
```

**Examples:**
```env
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/eztest

# Docker container
DATABASE_URL=postgresql://eztest:eztest@postgres:5432/eztest

# Remote server
DATABASE_URL=postgresql://user:pass@db.example.com:5432/eztest
```

**Connection Parameters:**
- `sslmode=require` - Force SSL (recommended for production)
- `schema=public` - Use specific schema
- `pool_size=5` - Connection pool size

---

#### `NEXTAUTH_SECRET`
Secret key for JWT token signing and encryption.

**Generate New Secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Output example
aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ABC
```

**Guidelines:**
- Minimum 32 characters
- Generated automatically for production
- Different for each environment
- Never share or commit

**Set in `.env`:**
```env
NEXTAUTH_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ABC
```

---

#### `NEXTAUTH_URL`
Full URL where application is accessible.

**Development:**
```env
NEXTAUTH_URL=http://localhost:3000
```

**Production:**
```env
NEXTAUTH_URL=https://your-domain.com
```

**With Path:**
```env
NEXTAUTH_URL=https://your-domain.com/app
```

---

### Optional Variables

#### `NODE_ENV`
Node.js environment mode.

**Values:**
```env
NODE_ENV=development   # Enable debug logging, use development defaults
NODE_ENV=production    # Optimizations, error reporting
NODE_ENV=test          # Test configuration
```

**Default:** `development`

---

#### `APP_URL`
Application public URL (if different from NEXTAUTH_URL).

```env
APP_URL=https://eztest.example.com
```

Used for:
- Email links
- API callbacks
- OAuth redirects

---

#### `DEBUG`
Enable debug logging.

```env
DEBUG=true             # Verbose logging
DEBUG=false            # Normal logging (default)
```

Can be feature-specific:
```env
DEBUG=prisma:*         # Prisma debug
DEBUG=next-auth:*      # NextAuth debug
```

---

#### `MAX_FILE_SIZE`
Maximum upload file size in bytes.

```env
MAX_FILE_SIZE=10485760  # 10 MB (default)
MAX_FILE_SIZE=52428800  # 50 MB
```

---

#### `UPLOAD_DIR`
Directory for file uploads.

```env
UPLOAD_DIR=./uploads    # Local directory (development)
UPLOAD_DIR=/tmp/uploads # Temporary (Docker)
```

**Note:** For production, use cloud storage (S3, etc.)

---

#### `DATABASE_POOL_SIZE`
Connection pool size for database.

```env
DATABASE_POOL_SIZE=5   # Default for development
DATABASE_POOL_SIZE=20  # For production
```

---

#### `LOG_LEVEL`
Logging verbosity.

```env
LOG_LEVEL=debug        # Verbose
LOG_LEVEL=info         # Normal
LOG_LEVEL=warn         # Warnings only
LOG_LEVEL=error        # Errors only
```

---

## Environment Setup by Context

### Local Development

```env
# .env or .env.development
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/eztest
NEXTAUTH_SECRET=dev-secret-key-not-for-production
NEXTAUTH_URL=http://localhost:3000
DEBUG=true
```

**Setup:**
```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Create .env
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Setup database
npx prisma db push

# 5. Start dev server
npm run dev
```

---

### Docker Development

```env
# .env for docker-compose.dev.yml
NODE_ENV=development
DATABASE_URL=postgresql://eztest:eztest@postgres:5432/eztest
NEXTAUTH_SECRET=dev-secret-key
NEXTAUTH_URL=http://localhost:3000
DEBUG=true
```

**Setup:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

---

### Docker Production

```env
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://eztest:secure_password@postgres:5432/eztest
NEXTAUTH_SECRET=<secure-generated-secret>
NEXTAUTH_URL=https://your-domain.com
DEBUG=false
```

**Docker Compose:**
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
```

---

### CI/CD Pipeline

```env
# Environment on CI server
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/eztest_test
NEXTAUTH_SECRET=ci-test-secret
```

---

## Docker Environment Passing

### Via `.env` File

```bash
docker-compose up -d
# Reads from .env automatically
```

### Via Command Line

```bash
docker run -e DATABASE_URL=postgresql://... \
           -e NEXTAUTH_SECRET=... \
           your-image:latest
```

### Via Docker Compose

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/eztest
      - NEXTAUTH_SECRET=secret
```

### Via `.env` File in Compose

```bash
# docker-compose.yml references .env
env_file:
  - .env
```

---

## Environment Variable Validation

### On Application Start

```typescript
// pages/api/health.ts - Check variables on startup
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

requiredVars.forEach(variable => {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
});
```

### Environment Validation Script

```bash
#!/bin/bash
# scripts/validate-env.sh

required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: $var is not set"
    exit 1
  fi
done

echo "All required environment variables are set"
```

---

## Security Best Practices

### Secret Management

1. **Never Commit Secrets**
   ```bash
   # .env in .gitignore
   git rm --cached .env
   echo ".env" >> .gitignore
   git commit -m "Remove .env from tracking"
   ```

2. **Use Secure Secrets**
   ```bash
   # Generate strong secret
   openssl rand -base64 32

   # Or using node
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Rotate Secrets**
   - Change NEXTAUTH_SECRET every 90 days
   - Change DATABASE_URL credentials on deployment
   - Use vault services for secret management

4. **Audit Access**
   - Control who can see .env files
   - Use file permissions (600)
   - Monitor secret access

---

### Environment File Permissions

```bash
# Restrict .env file access
chmod 600 .env
chmod 600 .env.development

# Only owner can read/write
# Group and others cannot access
```

---

### Avoid Common Mistakes

```env
# ✗ DON'T: Hardcode secrets
NEXTAUTH_SECRET=this-is-not-secure
PASSWORD=admin123

# ✓ DO: Use generated secrets
NEXTAUTH_SECRET=<generated-value>

# ✗ DON'T: Log secrets
console.log("Secret:", process.env.NEXTAUTH_SECRET);

# ✓ DO: Log anonymized values
console.log("Secret configured:", !!process.env.NEXTAUTH_SECRET);

# ✗ DON'T: Expose in browser
export NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

# ✓ DO: Only in server environment
const secret = process.env.NEXTAUTH_SECRET; // Server-side only
```

---

## Environment-Specific Configurations

### Development Configuration

```typescript
// lib/config.ts
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  debug: isDevelopment || process.env.DEBUG === 'true',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  databaseUrl: process.env.DATABASE_URL,
};
```

### Feature Flags by Environment

```env
# Development
FEATURE_DEBUG_PANEL=true
FEATURE_MOCK_API=true

# Production
FEATURE_DEBUG_PANEL=false
FEATURE_MOCK_API=false
```

```typescript
const hasDebugPanel = process.env.FEATURE_DEBUG_PANEL === 'true';
```

---

## Database-Specific Environment Variables

### PostgreSQL Connection

```env
# Standard format
DATABASE_URL=postgresql://user:password@host:port/database

# With options
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require&pool_size=5
```

### Connection Options

```
?sslmode=require        # Require SSL
?schema=public          # Use specific schema
?pool_size=5            # Connection pool
?statement_cache_size=0 # Disable prepared statements
```

---

## Prisma-Specific Variables

### Prisma Configuration

```env
# Prisma CLI
PRISMA_CLIENT_ENGINE_TYPE=binary    # Use binary engine
DATABASE_URL_SHADOW=...             # Shadow database for migrations

# Debug logging
DEBUG=prisma:*
```

### Shadow Database

For safe migrations on production databases:

```env
# .env.production
DATABASE_URL=postgresql://user:pass@prod-db/eztest
DATABASE_URL_SHADOW=postgresql://user:pass@shadow-db/eztest
```

---

## Checking Environment at Runtime

### In Server Component

```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div>
      {isDev && <div>Development Mode</div>}
    </div>
  );
}
```

### In API Route

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    environment: process.env.NODE_ENV,
    debug: process.env.DEBUG === 'true',
  });
}
```

### Environment Detection

```typescript
// lib/env.ts
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  debug: process.env.DEBUG === 'true',
  databaseUrl: process.env.DATABASE_URL || '',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};
```

---

## Troubleshooting Environment Issues

### Variable Not Loading

```bash
# 1. Verify .env exists
ls -la .env

# 2. Check syntax
cat .env | grep DATABASE_URL

# 3. Verify in process
node -e "console.log(process.env.DATABASE_URL)"

# 4. Restart dev server
npm run dev
```

### Connection String Issues

```bash
# Test connection
psql "$DATABASE_URL"

# Or with psql in Docker
docker exec eztest-postgres psql -U eztest -d eztest -c "\dt"
```

### Secret Not Working

```bash
# 1. Verify secret is set
echo $NEXTAUTH_SECRET

# 2. Check .env syntax
# Should be: VAR=value (no spaces around =)

# 3. Regenerate secret
openssl rand -base64 32
```

---

## NextAuth.js Environment Variables

### Required for NextAuth

```env
# JWT signing key
NEXTAUTH_SECRET=<generated-32-char-key>

# Full URL where NextAuth runs
NEXTAUTH_URL=http://localhost:3000
```

### For Production

```env
# Must be HTTPS URL
NEXTAUTH_URL=https://your-domain.com

# Generate new secret
NEXTAUTH_SECRET=<production-secret>
```

### Optional Provider Variables (Future)

```env
# Google OAuth (future feature)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth (future feature)
GITHUB_ID=...
GITHUB_SECRET=...
```

---

## Quick Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://...` | Prisma connection |
| `NEXTAUTH_SECRET` | Yes | `<32-char-key>` | JWT secret |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Auth callback URL |
| `NODE_ENV` | No | `development` | Set automatically |
| `DEBUG` | No | `true` | Enable debug logging |
| `MAX_FILE_SIZE` | No | `10485760` | Upload limit |
| `UPLOAD_DIR` | No | `./uploads` | Upload directory |

