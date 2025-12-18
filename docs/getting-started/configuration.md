# Configuration Reference

Complete reference for all EZTest configuration options.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Database Configuration](#database-configuration)
- [Authentication Configuration](#authentication-configuration)
- [Email Configuration](#email-configuration)
- [File Storage Configuration](#file-storage-configuration)
- [Application Settings](#application-settings)
- [Docker Configuration](#docker-configuration)

---

## <a id="environment-variables"></a>Environment Variables

All configuration is done through environment variables in the `.env` file.

### Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ Yes | - | Authentication secret key |
| `NEXTAUTH_URL` | ✅ Yes | - | Application URL |
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Application port |
| `APP_URL` | No | `NEXTAUTH_URL` | Application base URL |
| `DEBUG` | No | `false` | Enable debug logging |
| `ENABLE_ATTACHMENTS` | No | `false` | Enable file attachments |
| `MAX_FILE_SIZE` | No | `10485760` | Max file size in bytes (10MB) |
| `UPLOAD_DIR` | No | `./uploads` | Local upload directory |
| `ENABLE_SMTP` | No | `false` | Enable email features |
| `S3_CHUNK_SIZE` | No | `10485760` | S3 multipart chunk size (10MB) |
| `AWS_ACCESS_KEY_ID` | No* | - | AWS access key (required for S3) |
| `AWS_SECRET_ACCESS_KEY` | No* | - | AWS secret key (required for S3) |
| `AWS_REGION` | No* | - | AWS region (required for S3) |
| `AWS_S3_BUCKET` | No* | - | S3 bucket name (required for S3) |
| `AWS_S3_ENDPOINT` | No | - | Custom S3 endpoint |
| `SMTP_HOST` | No* | - | SMTP server (required if ENABLE_SMTP=true) |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_USER` | No* | - | SMTP username (required if ENABLE_SMTP=true) |
| `SMTP_PASS` | No* | - | SMTP password (required if ENABLE_SMTP=true) |
| `SMTP_FROM` | No* | - | Sender email (required if ENABLE_SMTP=true) |
| `SMTP_SECURE` | No | `false` | Use SSL/TLS (true for port 465) |

\* Required if the related feature is enabled

---

## <a id="database-configuration"></a>Database Configuration

### DATABASE_URL

PostgreSQL connection string.

```env
# Format
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/eztest"

# Docker Compose (internal network)
DATABASE_URL="postgresql://eztest:eztest@postgres:5432/eztest"

# Production with SSL
DATABASE_URL="postgresql://user:pass@host:5432/eztest?sslmode=require"

# Connection pooling (recommended for production)
DATABASE_URL="postgresql://user:pass@host:5432/eztest?connection_limit=10"
```

### Database Connection Options

| Option | Description |
|--------|-------------|
| `sslmode=require` | Require SSL connection |
| `connection_limit=N` | Max connections in pool |
| `pool_timeout=N` | Connection timeout in seconds |
| `connect_timeout=N` | Initial connection timeout |

---

## <a id="authentication-configuration"></a>Authentication Configuration

### NEXTAUTH_SECRET

**Required.** Secret key for signing JWT tokens and encrypting session data.

```env
# Generate a secure secret (minimum 32 characters)
NEXTAUTH_SECRET="your-very-secure-random-string-at-least-32-chars"

# Generate using OpenSSL
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="K8mX9pL2qR5tV7wY0zA3bC6dE9fG1hJ4="
```

> ⚠️ **Security**: Never commit your secret to version control. Use environment variables in production.

### NEXTAUTH_URL

**Required.** The canonical URL of your application.

```env
# Development
NEXTAUTH_URL="http://localhost:3000"

# Production
NEXTAUTH_URL="https://eztest.yourdomain.com"

# With custom port
NEXTAUTH_URL="http://localhost:8080"
```

### Session Configuration

Sessions are configured in `lib/auth.ts`. Default settings:

| Setting | Value | Description |
|---------|-------|-------------|
| Strategy | `jwt` | JSON Web Token sessions |
| Max Age | 30 days | Session expiration |
| Update Age | 24 hours | Token refresh interval |

---

## <a id="email-configuration"></a>Email Configuration

Required for password reset, notifications, and test run reports.

### SMTP Settings

```env
# Enable email features
ENABLE_SMTP="true"

# SMTP Server
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"  # Use 465 for SSL, 587 for TLS

# Authentication
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Note: Use SMTP_PASS (not SMTP_PASSWORD)

# Sender address
SMTP_FROM="EZTest <noreply@yourdomain.com>"

# Security
SMTP_SECURE="false"  # true for port 465 (SSL), false for port 587 (TLS)
```

**Important Notes:**
- Use `SMTP_PASS` (not `SMTP_PASSWORD`) - the code expects `SMTP_PASS`
- Set `SMTP_SECURE="true"` for port 465 (SSL)
- Set `SMTP_SECURE="false"` for port 587 (TLS/STARTTLS)
- Set `ENABLE_SMTP="true"` to enable email features

### Provider Examples

**Gmail:**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_SECURE="false"  # false for port 587, true for port 465
```

> 💡 Use [Gmail App Passwords](https://support.google.com/accounts/answer/185833) for SMTP authentication.

**SendGrid:**
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

**Mailgun:**
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_SECURE="false"
```

**Amazon SES:**
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
SMTP_SECURE="false"
```

---

## <a id="file-storage-configuration"></a>File Storage Configuration

For file attachments on test cases, defects, and comments.

### AWS S3 Configuration

```env
# AWS Credentials
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# S3 Settings
AWS_REGION="us-east-1"
AWS_S3_BUCKET="eztest-attachments"

# Optional: Custom endpoint (for S3-compatible services)
AWS_S3_ENDPOINT="https://s3.us-east-1.amazonaws.com"

# Optional: S3 multipart chunk size (default: 10MB)
S3_CHUNK_SIZE="10485760"
```

### S3 Bucket Policy

Recommended bucket policy for attachments:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT:user/eztest-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::eztest-attachments",
        "arn:aws:s3:::eztest-attachments/*"
      ]
    }
  ]
}
```

### S3 CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-eztest-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Alternative Storage Options

**MinIO (Self-hosted S3-compatible):**
```env
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_S3_ENDPOINT="http://localhost:9000"
AWS_S3_BUCKET="eztest"
AWS_REGION="us-east-1"
```

**DigitalOcean Spaces:**
```env
AWS_ACCESS_KEY_ID="your-spaces-key"
AWS_SECRET_ACCESS_KEY="your-spaces-secret"
AWS_S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
AWS_S3_BUCKET="your-space-name"
AWS_REGION="nyc3"
```

---

## <a id="application-settings"></a>Application Settings

### NODE_ENV

Application environment mode.

```env
# Development (enables hot reload, verbose logging)
NODE_ENV="development"

# Production (optimized builds, minimal logging)
NODE_ENV="production"

# Test (for running tests)
NODE_ENV="test"
```

### PORT

Application port (default: 3000).

```env
PORT="3000"
PORT="8080"  # Custom port
```

### APP_URL

Application base URL (falls back to `NEXTAUTH_URL` if not set).

```env
APP_URL="http://localhost:3000"
APP_URL="https://eztest.yourdomain.com"
```

### DEBUG

Enable debug logging and verbose output.

```env
# Enable debug mode
DEBUG="true"

# Prisma query logging
DEBUG="prisma:query"

# All debug output
DEBUG="*"
```

### File Attachments

```env
# Enable file attachments feature
ENABLE_ATTACHMENTS="true"

# Maximum file size in bytes (default: 10MB)
MAX_FILE_SIZE="10485760"  # 10MB
MAX_FILE_SIZE="52428800"  # 50MB
MAX_FILE_SIZE="524288000" # 500MB

# Local upload directory (if not using S3)
UPLOAD_DIR="./uploads"
UPLOAD_DIR="/var/uploads"
```

### S3 Configuration (Advanced)

```env
# S3 multipart upload chunk size (default: 10MB)
S3_CHUNK_SIZE="10485760"  # 10MB chunks

# Custom S3 endpoint (for S3-compatible services)
AWS_S3_ENDPOINT="https://s3.us-east-1.amazonaws.com"
AWS_S3_ENDPOINT="http://localhost:9000"  # MinIO
```

---

## <a id="docker-configuration"></a>Docker Configuration

### docker-compose.yml Settings

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: eztest
      POSTGRES_PASSWORD: eztest
      POSTGRES_DB: eztest
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Example Configurations

### Development (.env)

```env
# Database
DATABASE_URL="postgresql://eztest:eztest@localhost:5432/eztest"

# Auth
NEXTAUTH_SECRET="development-secret-not-for-production"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"

# Email (optional for dev)
ENABLE_SMTP="false"

# Attachments (optional for dev)
ENABLE_ATTACHMENTS="false"
```

### Production (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@db.host.com:5432/eztest?sslmode=require"

# Auth
NEXTAUTH_SECRET="K8mX9pL2qR5tV7wY0zA3bC6dE9fG1hJ4kL5mN6oP7qR8="
NEXTAUTH_URL="https://eztest.yourdomain.com"

# Environment
NODE_ENV="production"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="EZTest <noreply@yourdomain.com>"
SMTP_SECURE="false"
ENABLE_SMTP="true"

# Attachments
ENABLE_ATTACHMENTS="true"
MAX_FILE_SIZE="524288000"  # 500MB

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="eztest-production"
```

---

## Security Best Practices

1. **Never commit `.env` to version control**
2. **Use strong secrets** (minimum 32 characters)
3. **Rotate credentials regularly**
4. **Use environment-specific configurations**
5. **Enable SSL for database connections in production**
6. **Use IAM roles instead of keys when possible**

---

## Next Steps

- [Installation Guide](./installation.md)
- [First Project](./first-project.md)
- [Deployment Guide](../operations/deployment/README.md)
