# Environment Variables Reference

## Overview

EzTest uses environment variables for configuration across development, testing, and production environments. All secrets and environment-specific settings should be managed through `.env` files that are **never committed** to version control.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your settings:**
   - Set a secure `NEXTAUTH_SECRET`
   - Configure `DATABASE_URL` for your PostgreSQL instance
   - Update `NEXTAUTH_URL` to match your domain
   - Set `ENABLE_SMTP=true` if using email features
   - Configure SMTP settings if email is enabled

3. **Generate secure secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

---

## Environment Files

| File | Purpose | Git Tracked | When Used |
|------|---------|-------------|-----------|
| `.env.example` | Template with defaults | ✅ Yes | Reference only |
| `.env.production.example` | Production template | ✅ Yes | Reference only |
| `.env.docker.example` | Docker configuration template | ✅ Yes | Docker Compose setup |


---

## Required Variables

### 🗄️ Database Configuration

#### `DATABASE_URL`
PostgreSQL connection string for Prisma ORM.

**Required:** Yes

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=[schema]
```

**Examples:**

```bash
# Local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/eztest?schema=public"

# Docker container (default)
DATABASE_URL="postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public"

# Remote server with SSL
DATABASE_URL="postgresql://user:pass@db.example.com:5432/eztest?schema=public&sslmode=require"

# With connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/eztest?schema=public&pool_size=10"
```

**Connection Parameters:**
- `schema=public` - Database schema to use
- `sslmode=require` - Force SSL connection (recommended for production)
- `pool_size=10` - Connection pool size
- `connection_limit=5` - Maximum connections

**Security Notes:**
- Use strong passwords (20+ characters, mixed case, numbers, symbols)
- Never expose publicly
- Use SSL in production (`sslmode=require`)
- Restrict database user permissions to only required operations

---

#### `POSTGRES_USER`
PostgreSQL username (used in Docker Compose).

```bash
POSTGRES_USER=eztest
POSTGRES_USER=postgres
```

**Default:** `eztest`

**Note:** Only used when starting PostgreSQL with Docker Compose.

---

#### `POSTGRES_PASSWORD`
PostgreSQL password (used in Docker Compose).

```bash
POSTGRES_PASSWORD=eztest_password
POSTGRES_PASSWORD=your_secure_password
```

**Default:** `eztest_password`

**Security:** Use a strong password in production!

---

#### `POSTGRES_DB`
PostgreSQL database name (used in Docker Compose).

```bash
POSTGRES_DB=eztest
POSTGRES_DB=test_management
```

**Default:** `eztest`

---

#### `DB_PORT`
Host port mapping for PostgreSQL container.

```bash
DB_PORT=5433    # Maps host:5433 to container:5432
DB_PORT=5432    # Use if no local PostgreSQL running
```

**Purpose:** Allows you to access PostgreSQL from your host machine.

**Default:** `5433` (avoids conflict with local PostgreSQL on 5432)

**Usage:**
- Connect from host: `postgresql://eztest:password@localhost:5433/eztest`
- Connect from container: Uses internal port 5432

---

#### `APP_PORT`
Host port mapping for the application container.

```bash
APP_PORT=3000    # Access app at http://localhost:3000
APP_PORT=8080    # Access app at http://localhost:8080
```

**Purpose:** Defines which port on your host machine maps to the app.

**Default:** `3000`

**Note:** Update `NEXTAUTH_URL` if you change this from 3000.

---

### 🔐 Authentication Configuration

#### `NEXTAUTH_SECRET`
Secret key used for encrypting JWT tokens and session data.

**⚠️ CRITICAL:** This must be unique and kept secret!

**Generate a secure secret:**
```bash
# Method 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ABC=
```

**Requirements:**
- Minimum 32 characters
- Use different secrets for each environment
- Change immediately after any security incident
- Rotate every 90 days for production

**Example:**
```bash
NEXTAUTH_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ABC="
```

---

#### `NEXTAUTH_URL`
Full URL where the application is accessible. Used for authentication callbacks.

**Development:**
```bash
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**
```bash
NEXTAUTH_URL="https://eztest.yourdomain.com"
```

**With subfolder:**
```bash
NEXTAUTH_URL="https://yourdomain.com/eztest"
```

**Requirements:**
- Must be a complete URL with protocol
- Use `https://` in production
- Must match the actual domain users access
- No trailing slash

---

## Optional Variables

### 🚀 Application Configuration

#### `NODE_ENV`
Specifies the runtime environment.

**Values:**
```bash
NODE_ENV="development"  # Development mode (default)
NODE_ENV="production"   # Production mode (optimized)
NODE_ENV="test"         # Testing mode
```

**Effects:**
- `development`: Verbose logging, hot reload, debug info
- `production`: Optimizations, minification, error reporting
- `test`: Test database, mock services

**Default:** `development`

---

#### `APP_URL`
Public URL of the application (if different from NEXTAUTH_URL).

```bash
APP_URL="https://eztest.yourdomain.com"
```

**Used for:**
- Email notification links
- Password reset URLs
- Public API endpoints
- OAuth redirects

---

### 👤 Initial Admin User

These variables create the first admin user on initial setup.

#### `ADMIN_EMAIL`
Email address for the default admin account.

```bash
ADMIN_EMAIL="admin@eztest.local"
```

**Default:** `admin@eztest.local`

---

#### `ADMIN_PASSWORD`
Password for the default admin account.

```bash
ADMIN_PASSWORD="Admin@123456"
```

**⚠️ Security Warning:**
- Change immediately after first login!
- Use a strong, unique password
- Consider using a password manager

**Default:** `Admin@123456`

---

#### `ADMIN_NAME`
Display name for the default admin user.

```bash
ADMIN_NAME="System Administrator"
```

**Default:** `System Administrator`

---

### 📁 File Upload Configuration

#### `MAX_FILE_SIZE`
Maximum file upload size in bytes.

```bash
MAX_FILE_SIZE=10485760   # 10 MB (default)
MAX_FILE_SIZE=52428800   # 50 MB
MAX_FILE_SIZE=104857600  # 100 MB
```

**Size Reference:**
- 1 MB = 1,048,576 bytes
- 10 MB = 10,485,760 bytes
- 50 MB = 52,428,800 bytes
- 100 MB = 104,857,600 bytes

**Default:** `10485760` (10 MB)

**Considerations:**
- Larger sizes require more memory
- Increase nginx/proxy timeouts for large files
- Balance user needs with server resources

---

#### `UPLOAD_DIR`
Directory path for storing uploaded files.

```bash
# Local development
UPLOAD_DIR="./uploads"

# Docker container
UPLOAD_DIR="/app/uploads"

# Custom path
UPLOAD_DIR="/var/www/eztest/uploads"
```

**Requirements:**
- Directory must exist or be creatable
- Write permissions required
- Sufficient disk space
- Regular backups recommended

**Default:** `/app/uploads`

**Production Recommendations:**
- Use external storage (S3, Azure Blob, etc.)
- Regular backups
- Implement file retention policies
- Monitor disk usage

---

### 📧 Email / SMTP Configuration

Required for password reset emails and notifications.

#### `ENABLE_SMTP`
Enable or disable email functionality globally.

```bash
ENABLE_SMTP=true   # Enable email sending (OTP, notifications, password reset)
ENABLE_SMTP=false  # Disable all email operations
```

**Required:** Yes

**Default:** `false`

**When to set to `true`:**
- Production environments with configured SMTP server
- Environments that require user authentication via OTP
- When email notifications are needed (defects, test runs, user management)

**When to set to `false`:**
- Development/testing without email capability
- When SMTP server is not available
- Environments where email functionality is not required

**Note:** When `ENABLE_SMTP=false`, all email-related functions will return early without attempting to send emails. This includes:
- OTP verification emails (login/register)
- Password reset emails
- Defect assignment notifications
- Test run report emails
- User management notifications (invite, update, delete)
- Project membership notifications

---

### 📎 Attachments Feature

#### `ENABLE_ATTACHMENTS`
Enable or disable file attachment functionality throughout the application.

```bash
ENABLE_ATTACHMENTS=true   # Enable attachments (show upload buttons, display files)
ENABLE_ATTACHMENTS=false  # Disable attachments (hide all attachment UI)
```

**Required:** No

**Default:** `false`

**When to set to `true`:**
- Standard deployment with full features
- When AWS S3 is configured and available
- When users need to attach files to test cases, defects, and comments

**When to set to `false`:**
- To reduce AWS S3 storage costs
- When file uploads are restricted by policy
- For lite versions of the application
- During testing without S3 dependencies

**What gets hidden when disabled:**
- Attachment upload buttons (paperclip icon) in text areas
- Attachment display thumbnails and previews
- Attachment field components in forms
- All attachment-related UI elements

**Components affected:**
- `TextareaWithAttachments` - Hides attachment button and thumbnails
- `AttachmentField` - Hides the entire attachment interface
- `AttachmentDisplay` - Doesn't render attachment previews
- `AttachmentUpload` - Doesn't render the upload interface

**Important notes:**
- Disabling this feature only hides UI elements
- Backend APIs and existing data remain intact
- Attachments stored in S3 are preserved
- You can re-enable the feature later without data loss
- **Requires server restart** after changing the value

---

#### `SMTP_HOST`
SMTP server hostname.

```bash
# Gmail
SMTP_HOST="smtp.gmail.com"

# Office 365
SMTP_HOST="smtp.office365.com"

# Custom server
SMTP_HOST="smtp.example.com"
```

---

#### `SMTP_PORT`
SMTP server port.

```bash
SMTP_PORT=587    # STARTTLS (recommended)
SMTP_PORT=465    # SSL/TLS
SMTP_PORT=25     # Unencrypted (not recommended)
```

**Port Guide:**
- **587** - STARTTLS (recommended for most providers)
- **465** - SSL/TLS (use with `SMTP_SECURE=true`)
- **25** - Unencrypted (avoid in production)

**Default:** `587`

---

#### `SMTP_USER`
Username for SMTP authentication.

```bash
SMTP_USER="your-email@example.com"
```

**Examples:**
```bash
# Gmail
SMTP_USER="your-email@gmail.com"

# Office 365
SMTP_USER="your-email@company.com"

# Custom
SMTP_USER="notifications@eztest.com"
```

---

#### `SMTP_PASS`
Password or app-specific password for SMTP authentication.

```bash
SMTP_PASS="your-smtp-password"
```

**⚠️ Security Notes:**
- Use app-specific passwords (Gmail, Office 365)
- Never commit to version control
- Store securely (vault, secrets manager)
- Rotate regularly

**Gmail App Password:**
1. Enable 2-factor authentication
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use generated password here

---

#### `SMTP_FROM`
"From" email address for outgoing emails.

```bash
SMTP_FROM="noreply@eztest.local"
SMTP_FROM="EzTest <notifications@yourdomain.com>"
```

**Format Options:**
```bash
# Simple
SMTP_FROM="noreply@example.com"

# With display name
SMTP_FROM="EzTest <noreply@example.com>"
SMTP_FROM="Test Team <team@example.com>"
```

**Default:** `noreply@eztest.local`

---

#### `SMTP_SECURE`
Enable SSL/TLS for SMTP connection.

```bash
SMTP_SECURE=false   # For port 587 (STARTTLS)
SMTP_SECURE=true    # For port 465 (SSL/TLS)
```

**Configuration Guide:**
- Port 587 → `SMTP_SECURE=false` (uses STARTTLS)
- Port 465 → `SMTP_SECURE=true` (uses SSL/TLS)

**Default:** `false`

---

## Environment-Specific Configurations

### 🛠️ Local Development

```bash
# .env for local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/eztest?schema=public"
NODE_ENV="development"
APP_URL="http://localhost:3000"

NEXTAUTH_SECRET="dev-secret-not-for-production-use-only"
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="admin@eztest.local"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Dev Admin"

MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Optional: Skip email in development
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="dev@localhost"
SMTP_SECURE=false
```

**Setup Steps:**
```bash
# 1. Create .env
cp .env.example .env

# 2. Start PostgreSQL
docker-compose up -d postgres

# 3. Install dependencies
npm install

# 4. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Start dev server
npm run dev
```

---

### 🐳 Docker Development

```bash
# .env.docker for docker-compose.yml
DATABASE_URL="postgresql://eztest:eztest_password@postgres:5432/eztest?schema=public"
NODE_ENV="production"
APP_URL="http://localhost:3000"

NEXTAUTH_SECRET="docker-dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

ADMIN_EMAIL="admin@eztest.local"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Docker Admin"

MAX_FILE_SIZE=10485760
UPLOAD_DIR="/app/uploads"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@eztest.local"
SMTP_SECURE=false
```

**Start Docker:**
```bash
docker-compose up -d
```

---

### 🚀 Production Deployment

```bash
# .env for production
DATABASE_URL="postgresql://eztest:SECURE_PASSWORD_HERE@postgres:5432/eztest?schema=public&sslmode=require"
NODE_ENV="production"
APP_URL="https://eztest.yourdomain.com"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="CHANGE_ME_GENERATE_SECURE_SECRET"
NEXTAUTH_URL="https://eztest.yourdomain.com"

ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="CHANGE_IMMEDIATELY_AFTER_FIRST_LOGIN"
ADMIN_NAME="Admin"

MAX_FILE_SIZE=52428800
UPLOAD_DIR="/app/uploads"

SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT=587
SMTP_USER="notifications@yourdomain.com"
SMTP_PASS="SECURE_SMTP_PASSWORD"
SMTP_FROM="EzTest <noreply@yourdomain.com>"
SMTP_SECURE=false
```

**Production Checklist:**
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Use strong database password
- [ ] Enable SSL for database (`sslmode=require`)
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Change default admin password immediately
- [ ] Configure production SMTP
- [ ] Set up regular backups
- [ ] Enable HTTPS
- [ ] Review file upload limits
- [ ] Set appropriate `MAX_FILE_SIZE`

---

## Security Best Practices

### 🔒 Secret Management

1. **Never Commit Secrets**
   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   
   # Remove if accidentally committed
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   ```

2. **Use Strong Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate database password
   openssl rand -base64 24
   ```

3. **Rotate Secrets Regularly**
   - Change `NEXTAUTH_SECRET` every 90 days
   - Update database passwords quarterly
   - Rotate SMTP credentials annually

4. **Use Secrets Management**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - 1Password / BitWarden for teams

---

### 🛡️ File Permissions

```bash
# Restrict .env file access (Linux/Mac)
chmod 600 .env
chmod 600 .env.docker

# Verify permissions
ls -la .env
# Should show: -rw------- (600)
```

---

### 🚫 Common Mistakes to Avoid

```bash
# ❌ DON'T: Use weak secrets
NEXTAUTH_SECRET="secret123"
ADMIN_PASSWORD="admin"

# ✅ DO: Use generated secrets
NEXTAUTH_SECRET="aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890ABC="
ADMIN_PASSWORD="Str0ng!Pass@2024#Secure"

# ❌ DON'T: Hardcode production values
DATABASE_URL="postgresql://admin:admin@localhost/db"



## Validation & Troubleshooting

### ✅ Validate Configuration

```bash
# Check if .env exists
ls -la .env

# Verify required variables
node -e "
const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const missing = required.filter(v => !process.env[v]);
if (missing.length) {
  console.error('Missing:', missing);
  process.exit(1);
}
console.log('All required variables set ✓');
"
```

---

### 🔧 Test Database Connection

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Or with Docker
docker exec -it eztest-postgres psql -U eztest -d eztest -c "\dt"
```

---

### 📧 Test SMTP Connection

```bash
# Using Node.js
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify((error, success) => {
  if (error) console.error('SMTP Error:', error);
  else console.log('SMTP Ready ✓');
});
"
```

---

### 🐛 Common Issues

#### Issue: "Invalid `prisma.user.findMany()` invocation"
**Solution:** Check `DATABASE_URL` format and database connectivity
```bash
# Verify connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check Prisma schema
npx prisma validate

# Regenerate client
npx prisma generate
```

---

#### Issue: "NextAuth: Missing secret"
**Solution:** Ensure `NEXTAUTH_SECRET` is set
```bash
# Generate new secret
openssl rand -base64 32 > .secret

# Add to .env
echo "NEXTAUTH_SECRET=$(cat .secret)" >> .env

# Restart application
npm run dev
```

---

#### Issue: "SMTP connection refused"
**Solution:** Verify SMTP settings
```bash
# Check connectivity
telnet $SMTP_HOST $SMTP_PORT

# Verify credentials with mail provider
# Common ports: 587 (STARTTLS), 465 (SSL), 25 (plain)
```

---

#### Issue: "Upload directory not writable"
**Solution:** Fix permissions
```bash
# Create directory
mkdir -p ./uploads

# Set permissions (Linux/Mac)
chmod 755 ./uploads

# Docker: Ensure volume mount
docker-compose down
docker-compose up -d
```

---

## Environment Variable Reference Table

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| **Database** |
| `DATABASE_URL` | ✅ Yes | - | `postgresql://user:pass@host:5432/eztest` |
| `POSTGRES_USER` | No (Docker) | `eztest` | `eztest` |
| `POSTGRES_PASSWORD` | No (Docker) | `eztest_password` | `secure_pass123` |
| `POSTGRES_DB` | No (Docker) | `eztest` | `eztest` |
| `DB_PORT` | No (Docker) | `5433` | `5433` |
| `APP_PORT` | No (Docker) | `3000` | `3000` or `8080` |
| **Authentication** |
| `NEXTAUTH_SECRET` | ✅ Yes | - | `aBcDeFgH...32chars` |
| `NEXTAUTH_URL` | ✅ Yes | - | `https://eztest.com` |
| **Application** |
| `NODE_ENV` | No | `development` | `production` |
| `APP_URL` | No | `NEXTAUTH_URL` | `https://eztest.com` |
| **Admin User** |
| `ADMIN_EMAIL` | No | `admin@eztest.local` | `admin@company.com` |
| `ADMIN_PASSWORD` | No | `Admin@123456` | `Secure!Pass123` |
| `ADMIN_NAME` | No | `System Administrator` | `John Doe` |
| **File Uploads** |
| `MAX_FILE_SIZE` | No | `10485760` | `52428800` (50MB) |
| `UPLOAD_DIR` | No | `/app/uploads` | `./uploads` |
| **Email / SMTP** |
| `SMTP_HOST` | No | - | `smtp.gmail.com` |
| `SMTP_PORT` | No | `587` | `587` or `465` |
| `SMTP_USER` | No | - | `user@gmail.com` |
| `SMTP_PASS` | No | - | `app-password` |
| `SMTP_FROM` | No | `noreply@eztest.local` | `team@company.com` |
| `SMTP_SECURE` | No | `false` | `true` (for 465) |

---

## Additional Resources

- **[Environment Configuration Guide](./ENVIRONMENT.md)** - Detailed environment setup
- **[Docker Deployment](../DOCKER.md)** - Docker-specific configuration
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues
- **[Security Best Practices](./ARCHITECTURE.md#security)** - Security guidelines

---

## Quick Commands

```bash
# Create .env from example
cp .env.example .env

# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Validate environment
npx prisma validate

# Test database connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Start development
npm run dev

# Start with Docker
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

**Last Updated:** November 2025  
**Maintainer:** Philip Moses (philip.moses@belsterns.com)
