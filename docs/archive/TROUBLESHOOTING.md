# Troubleshooting Guide

Quick solutions for common issues encountered while developing, deploying, or running EZTest.

---

## Development Issues

### Port 3000 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Option 1: Find and kill process on port 3000
lsof -i :3000
# Kill by PID
kill -9 <PID>

# Option 2: Use different port
PORT=3001 npm run dev

# Option 3: Check what's using the port
netstat -tlnp | grep 3000
```

---

### Module Not Found Errors

**Problem**: `Module not found: Can't resolve '@/lib/auth'`

**Solutions:**

```bash
# 1. Verify path alias in tsconfig.json
cat tsconfig.json | grep -A 5 '"paths"'

# 2. Restart dev server
npm run dev

# 3. Clear Next.js cache
rm -rf .next/
npm run dev

# 4. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### TypeScript Errors

**Problem**: `Type 'X' is not assignable to type 'Y'`

**Solutions:**

```bash
# 1. Generate Prisma types
npx prisma generate

# 2. Check TypeScript version
npm list typescript

# 3. Rebuild TypeScript
npx tsc --noEmit

# 4. Clear build cache
rm -rf .next
npm run build
```

---

### Prisma Client Issues

**Problem**: `PrismaClient is unable to be run in the browser`

**Solution**: Never import Prisma client in client components. Use API routes instead:

```typescript
// ✗ Wrong - In client component
'use client';
import { prisma } from '@/lib/prisma'; // ERROR!

// ✓ Correct - In server component or API route
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.project.findMany();
}
```

---

### Prisma Migration Issues

**Problem**: `"0" error(s) found during migration validation`

**Solutions:**

```bash
# 1. Force reset (development only!)
npx prisma db push --force-reset

# 2. Manual migration
npx prisma migrate dev --name migration_name

# 3. Check schema status
npx prisma db pull

# 4. Clear migrations
rm -rf prisma/migrations/*
npx prisma migrate resolve --rolled-back <migration_name>
```

---

## Database Issues

### Cannot Connect to Database

**Problem**: `Can't reach database server at 'localhost:5432'`

**Solutions:**

```bash
# 1. Verify PostgreSQL is running
# For Docker
docker-compose ps postgres

# For local PostgreSQL
psql --version
sudo service postgresql status

# 2. Check DATABASE_URL
cat .env | grep DATABASE_URL

# 3. Test connection
psql postgresql://user:password@localhost:5432/dbname

# 4. Verify credentials
# Check docker-compose.yml for POSTGRES_USER and POSTGRES_PASSWORD
docker-compose config | grep POSTGRES_
```

---

### Database Connection Timeout

**Problem**: `Client request timeout`

**Solutions:**

```bash
# 1. Increase connection timeout
DATABASE_URL="postgresql://...?connect_timeout=30"

# 2. Check network connectivity
ping <database-host>

# 3. Verify firewall
# For remote database, check if port 5432 is open
telnet <host> 5432

# 4. Restart PostgreSQL
docker-compose restart postgres
```

---

### Database Migration Failed

**Problem**: Migration errors prevent startup

**Solutions:**

```bash
# 1. Check migration status
npx prisma migrate status

# 2. View failed migration
cat prisma/migrations/<failed_migration>/migration.sql

# 3. Resolve failed migration
npx prisma migrate resolve --rolled-back

# 4. Try again
npx prisma migrate dev --name my_migration
```

---

### Database Corruption

**Problem**: Queries returning errors or unexpected behavior

**Solutions:**

```bash
# 1. Backup current database
docker exec eztest-postgres pg_dump -U eztest eztest > backup.sql

# 2. Vacuum database
docker exec eztest-postgres vacuumdb -U eztest -d eztest

# 3. Reindex all tables
docker exec eztest-postgres reindexdb -U eztest -d eztest

# 4. Check table integrity
docker exec eztest-postgres psql -U eztest -d eztest -c "CHECK TABLE users;"

# 5. Reset if necessary
npx prisma db push --force-reset
npm run db:seed
```

---

## Authentication Issues

### Login Not Working

**Problem**: Login fails, redirect loops, or session not set

**Solutions:**

```bash
# 1. Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# 2. Check NEXTAUTH_URL matches deployment
# .env: NEXTAUTH_URL=http://localhost:3000
# Should match browser URL

# 3. Verify credentials provider configured
cat lib/auth.ts | grep CredentialsProvider

# 4. Check database has users
npx prisma studio
# Navigate to User table

# 5. Restart dev server
npm run dev

# 6. Clear browser cookies
# DevTools > Application > Cookies > Clear all
```

---

### Session Not Persisting

**Problem**: User logged in but session lost on page refresh

**Solutions:**

```bash
# 1. Verify NEXTAUTH_SECRET is consistent
# Should be same across all instances

# 2. Check cookie settings
# In lib/auth.ts, verify session strategy is 'jwt'

# 3. Verify session maxAge
# lib/auth.ts: maxAge: 30 * 24 * 60 * 60

# 4. Check browser cookie storage
# DevTools > Application > Cookies > Check next-auth.session-token

# 5. Verify database adapter
cat lib/auth.ts | grep PrismaAdapter
```

---

### Password Reset Not Working

**Problem**: Cannot reset password, email not sent

**Solutions:**

```bash
# 1. No password reset implemented yet
# This is a future feature

# 2. For now, manual reset in database
npx prisma studio
# Find user in User table
# Update password hash directly
```

---

## UI/Frontend Issues

### Tailwind CSS Styles Not Applying

**Problem**: Styles not showing, classes not working

**Solutions:**

```bash
# 1. Rebuild Tailwind
npm run build

# 2. Check tailwind.config.ts
cat tailwind.config.ts | grep content

# 3. Verify CSS file imported
grep -r "globals.css" app/

# 4. Restart dev server
npm run dev

# 5. Clear build cache
rm -rf .next
npm run dev
```

---

### Radix UI Components Not Rendering

**Problem**: Components missing styles or not displaying

**Solutions:**

```bash
# 1. Verify components installed
ls elements/

# 2. Reinstall Radix UI components
npm install @radix-ui/react-*

# 3. Check component imports
grep -r "from '@/elements'" app/

# 4. Verify components.json
cat components.json

# 5. Rebuild styles
npm run build
```

---

### Layout Shifts or Hydration Errors

**Problem**: Page layout changes between SSR and client rendering

**Solutions:**

```bash
# 1. Avoid browser APIs in Server Components
// ✗ Wrong
export default async function Page() {
  const isMobile = window.innerWidth < 768; // ERROR in SSR

// ✓ Correct
'use client';
export default function Page() {
  const isMobile = window.innerWidth < 768;
}

# 2. Check for dynamic imports
import dynamic from 'next/dynamic';
const Component = dynamic(() => import('./Component'));

# 3. Suppress hydration warnings (if necessary)
<div suppressHydrationWarning>{content}</div>
```

---

## Docker Issues

### Docker Desktop Not Running (Windows)

**Problem**: Error `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`

**Cause**: Docker Desktop is not running on Windows.

**Solutions:**

```bash
# 1. Start Docker Desktop
# - Open Docker Desktop from Start Menu
# - Wait for the whale icon to be steady in system tray
# - Verify it's running: docker version

# 2. Verify Docker is running
docker version
docker info

# 3. If Docker Desktop won't start:
# - Restart Windows
# - Check if WSL 2 is installed and updated
# - Reinstall Docker Desktop if needed

# 4. Check Docker service status
Get-Service -Name com.docker.service
# Should show "Running"
```

---

### Missing Environment Variables

**Problem**: Warnings like `The "DB_PORT" variable is not set. Defaulting to a blank string.`

**Cause**: Required environment variables not defined in `.env` file.

**Solutions:**

```bash
# 1. Create .env file from example
cp .env.example .env

# 2. Ensure these variables are set:
DB_PORT=5433
APP_PORT=3000
POSTGRES_USER=eztest
POSTGRES_PASSWORD=eztest_password
POSTGRES_DB=eztest

# 3. Verify variables are loaded
docker-compose config

# 4. Restart compose with new variables
docker-compose down
docker-compose up -d
```

---

### Container Won't Start

**Problem**: Container exits immediately or won't start

**Solutions:**

```bash
# 1. View detailed logs
docker-compose logs app

# 2. Check environment variables
docker-compose config | grep NEXT

# 3. Verify image built
docker images | grep eztest

# 4. Rebuild image
docker-compose build --no-cache

# 5. Check dependencies
docker-compose up postgres
# Verify postgres starts first

# 6. Try running with debug
docker run -it eztest:latest /bin/bash
npm run dev
```

---

### Database Container Issues

**Problem**: PostgreSQL won't start or connect

**Solutions:**

```bash
# 1. Check PostgreSQL logs
docker-compose logs postgres

# 2. Verify volume permissions
ls -la ./data/postgres

# 3. Reset database (careful!)
docker-compose down -v
docker-compose up -d postgres

# 4. Check database exists
docker exec eztest-postgres psql -U eztest -c "SELECT datname FROM pg_database;"

# 5. Restore from backup if needed
cat backup.sql | docker exec -i eztest-postgres psql -U eztest -d eztest
```

---

### Port Binding Issues

**Problem**: `bind: address already in use`

**Solutions:**

```bash
# 1. Find what's using the port
lsof -i :3000
lsof -i :5432

# 2. Stop conflicting container
docker stop <container_id>

# 3. Change port mapping
# In docker-compose.yml change ports: "8000:3000"
docker-compose up -d

# 4. Verify port free
netstat -tlnp | grep 3000
```

---

### Out of Disk Space

**Problem**: Docker builds fail, containers can't write files

**Solutions:**

```bash
# 1. Check disk usage
docker system df

# 2. Clean up unused images
docker image prune

# 3. Remove unused volumes
docker volume prune

# 4. Clear build cache
docker builder prune

# 5. Full cleanup (careful!)
docker system prune -a --volumes
```

---

## Performance Issues

### Slow Application Response

**Problem**: API requests taking > 1-2 seconds

**Solutions:**

```bash
# 1. Check database performance
# Run in Prisma Studio
SELECT COUNT(*) FROM "TestCase";

# 2. Identify slow queries
SET log_statement = 'all';
SHOW slow_query_log_file;

# 3. Monitor resource usage
docker stats eztest-app

# 4. Check network latency
ping <database-host>

# 5. Optimize database queries
# Add missing indexes in schema.prisma
@@index([projectId])
```

---

### High Memory Usage

**Problem**: Container using 500MB+, OutOfMemory errors

**Solutions:**

```bash
# 1. Monitor memory
docker stats --no-stream eztest-app

# 2. Check for memory leaks
# Review Node logs for warnings

# 3. Limit container memory
# In docker-compose.yml
services:
  app:
    mem_limit: 2g

# 4. Reduce connection pool
DATABASE_POOL_SIZE=5

# 5. Enable garbage collection
node --max-old-space-size=1024
```

---

### Slow Build Times

**Problem**: Build takes > 1 minute

**Solutions:**

```bash
# 1. Clear cache
rm -rf .next node_modules/.cache

# 2. Use Turbopack (faster builds)
npm run build  # Already uses --turbopack

# 3. Check for unnecessary dependencies
npm list | grep "deduped"

# 4. Profile build time
PROFILE=true npm run build
```

---

## Deployment Issues

### Application Not Accessible After Deployment

**Problem**: Can't reach deployed application

**Solutions:**

```bash
# 1. Verify container running
docker ps | grep eztest

# 2. Check port mapping
docker port eztest-app

# 3. Test localhost access
curl http://localhost:3000

# 4. Check firewall rules
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 5. Verify reverse proxy
curl http://localhost:3000
# vs
curl https://your-domain.com

# 6. Check DNS
nslookup your-domain.com
ping your-domain.com
```

---

### SSL/TLS Certificate Issues

**Problem**: HTTPS not working, certificate errors

**Solutions:**

```bash
# 1. Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/domain/cert.pem -text -noout

# 2. Renew certificate
sudo certbot renew

# 3. Test certificate
openssl s_client -connect your-domain.com:443

# 4. Check Nginx configuration
nginx -t

# 5. View certificate details
certbot certificates
```

---

### Database Not Persisting Between Deployments

**Problem**: Data lost after container restart

**Solutions:**

```bash
# 1. Verify volume mounted
docker inspect eztest-postgres | grep Mounts

# 2. Check volume exists
docker volume ls

# 3. Mount volume properly
# docker-compose.yml
volumes:
  - postgres_data:/var/lib/postgresql/data

# 4. Backup before testing
docker exec eztest-postgres pg_dump ... > backup.sql

# 5. Verify backup strategy
ls -la /var/lib/eztest/backups/
```

---

## Monitoring & Logging

### View Application Logs

```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs app --tail=100

# Specific service
docker-compose logs postgres

# With timestamps
docker-compose logs --timestamps
```

---

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or specific component
DEBUG=prisma:* npm run dev
DEBUG=next-auth:* npm run dev

# View in logs
docker-compose logs app | grep DEBUG
```

---

## Getting Help

### Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Community

- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions
- Documentation: Check docs folder

### Debugging Tips

1. **Check logs** - Always check Docker or dev server logs first
2. **Reproduce locally** - Try to reproduce issue locally
3. **Isolate problem** - Test components in isolation
4. **Search existing issues** - Check GitHub issues for similar problems
5. **Create minimal example** - Provide minimal reproducible example

### Diagnostic Commands

```bash
# System info
node --version
npm --version
docker --version

# Application status
docker-compose ps
docker-compose logs

# Database check
docker exec eztest-postgres psql -U eztest -d eztest -c "\dt"

# Network check
docker network inspect eztest_default

# Full diagnostic
docker-compose config
env | grep NEXT
```

---

## Performance Monitoring

### Database Queries

```sql
-- View slowest queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- View table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### API Response Times

```bash
# Measure API response
curl -w "Response time: %{time_total}s\n" http://localhost:3000/api/projects

# Monitor over time
watch -n 1 "curl -w 'Time: %{time_total}s\n' -o /dev/null -s http://localhost:3000/api/health"
```

---

## Quick Fix Checklist

When something goes wrong:

- [ ] Check error message carefully
- [ ] Read associated logs
- [ ] Verify environment variables
- [ ] Restart relevant services
- [ ] Clear build cache
- [ ] Check database connection
- [ ] Verify permissions
- [ ] Test in isolation
- [ ] Check documentation
- [ ] Search GitHub issues
- [ ] Create diagnostic report

