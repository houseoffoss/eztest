# Development Setup

Complete guide to setting up your development environment for EzTest.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| Git | Latest | Version control |
| PostgreSQL | 14+ | Database (or Docker) |

### Optional (Recommended)

| Software | Purpose |
|----------|---------|
| Docker | Run PostgreSQL easily |
| VS Code | Recommended editor |
| Prisma Extension | Database tools |

---

## Step-by-Step Setup

### 1. Fork & Clone

```bash
# Fork on GitHub first, then:
git clone https://github.com/YOUR-USERNAME/eztest.git
cd eztest

# Add upstream remote
git remote add upstream https://github.com/houseoffoss/eztest.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DATABASE_URL="postgresql://eztest:eztest@localhost:5432/eztest"

# Auth (generate a random string)
NEXTAUTH_SECRET="your-development-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

### 4. Database Setup

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Verify it's running
docker-compose ps
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb eztest

# Create user
createuser eztest -P
# Enter password: eztest

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE eztest TO eztest;"
```

### 5. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with initial data
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 7. Login

Use seeded credentials:
- **Admin:** admin@example.com / Admin123!
- **Tester:** tester@example.com / Tester123!

---

## Development Tools

### Prisma Studio

Visual database editor:

```bash
npx prisma studio
```

Opens at http://localhost:5555

### Linting

```bash
# Run ESLint
npm run lint
```

### Building

```bash
# Production build (check for errors)
npm run build
```

---

## VS Code Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Common Issues

### Port 3000 in use

```bash
# Find process using port
lsof -i :3000

# Or use different port
PORT=3001 npm run dev
```

### Database connection failed

1. Check PostgreSQL is running:
   ```bash
   docker-compose ps
   # or
   pg_isready
   ```

2. Verify DATABASE_URL in `.env`

3. Check credentials match

### Prisma client error

```bash
# Regenerate client
npx prisma generate
```

### Node modules issues

```bash
# Clear and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

## Syncing with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main
```

---

## Next Steps

- [Coding Standards](./coding-standards.md) - Code style guide
- [Pull Request Guide](./pull-requests.md) - Submit changes
- [Architecture](../architecture/README.md) - Understand the codebase
