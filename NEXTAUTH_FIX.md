## NextAuth CLIENT_FETCH_ERROR - Resolution Guide

This error occurs when NextAuth cannot establish a connection to the authentication API endpoints, typically due to missing or misconfigured environment variables.

### Quick Fix (5 minutes)

#### Step 1: Create `.env` file
```bash
cp .env.example .env
```

#### Step 2: Set Required Variables
Edit `.env` and ensure these are set:

```env
# MUST be set for NextAuth to work
DATABASE_URL=postgresql://user:password@localhost:5432/eztest
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

#### Step 3: Generate a Secure Secret
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output to NEXTAUTH_SECRET in your .env file
```

#### Step 4: Restart Development Server
```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

---

### Root Causes & Solutions

#### ❌ Error: Missing `NEXTAUTH_SECRET`
**Problem:** `.env` file not created or `NEXTAUTH_SECRET` is empty

**Solution:**
```bash
# Generate secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET=<paste-generated-value>

# Restart server
npm run dev
```

---

#### ❌ Error: Missing `NEXTAUTH_URL`
**Problem:** `NEXTAUTH_URL` doesn't match browser URL

**Solution:**
```env
# Development (default)
NEXTAUTH_URL=http://localhost:3000

# If using Docker
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://your-domain.com
```

The URL must match exactly what you see in your browser address bar.

---

#### ❌ Error: Missing `DATABASE_URL`
**Problem:** Database connection string not configured

**Solution:**
```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Configure connection in .env
DATABASE_URL=postgresql://user:password@localhost:5432/eztest

# Apply migrations
npx prisma db push
```

---

### Environment Validation

The application now validates all required environment variables on startup. If any are missing, you'll see a clear error message showing exactly what's missing.

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT signing secret (32+ characters)
- `NEXTAUTH_URL` - Application URL (must match browser URL)

**Optional variables:**
- `NODE_ENV` - Set to `development`, `production`, or `test` (default: `development`)
- `APP_URL` - Public-facing URL for emails/redirects
- `DEBUG` - Enable debug logging (default: `false`)
- `MAX_FILE_SIZE` - Upload limit in bytes (default: 10MB)
- `UPLOAD_DIR` - Upload directory (default: `./uploads`)

---

### Middleware Configuration

The middleware has been updated to properly exclude NextAuth API routes (`/api/auth/*`) from middleware processing. This prevents authentication requests from being intercepted.

**If you still see auth errors after fixing environment variables:**

1. Clear browser cookies
   - DevTools → Application → Cookies → Clear all cookies for localhost:3000

2. Clear Next.js cache
   ```bash
   rm -rf .next
   npm run dev
   ```

3. Restart dev server
   ```bash
   # Kill current process
   Ctrl+C
   
   # Restart
   npm run dev
   ```

---

### Docker Deployment

If using Docker, ensure environment variables are passed correctly:

```bash
# Via .env file
docker-compose up -d

# Via CLI
docker run -e NEXTAUTH_SECRET=... -e NEXTAUTH_URL=... your-image:latest

# Via docker-compose.yml
environment:
  - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
  - NEXTAUTH_URL=${NEXTAUTH_URL}
  - DATABASE_URL=${DATABASE_URL}
```

---

### Troubleshooting Checklist

- [ ] `.env` file created from `.env.example`
- [ ] `NEXTAUTH_SECRET` is set and not empty
- [ ] `NEXTAUTH_URL` matches browser URL (including protocol and port)
- [ ] `DATABASE_URL` is correct and database is accessible
- [ ] No spaces around `=` in `.env` file
- [ ] Dev server restarted after editing `.env`
- [ ] Browser cookies cleared
- [ ] `.next` build cache deleted

If issues persist, check:
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.NEXTAUTH_SECRET, process.env.NEXTAUTH_URL)"

# Check if NextAuth API route is responding
curl http://localhost:3000/api/auth/providers
```

---

### More Help

See documentation:
- [`docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md) - Environment configuration details
- [`docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) - Deployment instructions
- [`docs/TROUBLESHOOTING.md`](../docs/TROUBLESHOOTING.md) - General troubleshooting
