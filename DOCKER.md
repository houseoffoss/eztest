# EzTest - Docker Deployment Guide

EzTest is a lightweight, self-hostable Test Management Application built with Next.js, Tailwind CSS, Radix UI, and PostgreSQL. It's designed to run efficiently on minimal hardware (1 core, 2GB RAM).

---

## 🔧 Development vs Production

EZTest provides **two separate Docker setups**:

### Development Setup (`docker-compose.dev.yml`)
- ✅ Hot reloading enabled
- ✅ Source code mounted as volumes
- ✅ Instant code changes without rebuild
- ✅ All dev dependencies included
- ✅ Separate database (port 5434)
- 🎯 **Best for**: Local development

### Production Setup (`docker-compose.yml`)
- ✅ Optimized multi-stage build
- ✅ Minimal image size
- ✅ Production dependencies only
- ✅ Better performance
- ✅ Security hardened
- 🎯 **Best for**: Deployment

---

## 🚀 Quick Start (Development)

For local development with hot reloading:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

**Development URLs:**
- App: `http://localhost:3000`
- Database: `localhost:5434`

---

## 🏭 Quick Start (Production)

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+
- At least 1 CPU core and 2GB RAM

### 1. Clone and Configure

```bash
# Clone the repository (or navigate to your project directory)
cd eztest.houseoffoss.com

# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env  # or your preferred editor
```

### 2. Important: Update Production Secrets

Before deploying to production, update these values in your `.env`:

```env
# Generate a secure random string for NEXTAUTH_SECRET
NEXTAUTH_SECRET="your-super-secure-random-string-here"

# Update to your domain or IP
APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"

# Strong database password
DATABASE_URL="postgresql://eztest:YOUR_STRONG_PASSWORD@postgres:5432/eztest?schema=public"
```

### 3. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access the Application

Open your browser and navigate to:
- Local: `http://localhost:3000`
- Production: `https://your-domain.com`

## Architecture

### Services

1. **app** - Next.js application (Port 3000)
   - Resource limits: 0.5 CPU, 1.5GB RAM
   - Auto-restarts on failure
   - Health checks enabled

2. **postgres** - PostgreSQL 16 Alpine (Port 5432)
   - Resource limits: 0.5 CPU, 512MB RAM
   - Persistent volume for data
   - Health checks enabled

### Volumes

- `postgres_data` - Database persistence
- `uploads` - User uploaded files (test attachments, screenshots)

### Network

- `eztest-network` - Bridge network for inter-service communication

## Database Schema

The application includes a comprehensive test management schema:

- **Users & Authentication** - User management with role-based access
- **Projects** - Multi-project support with team members
- **Test Suites** - Hierarchical test organization
- **Test Cases** - Detailed test case management with steps
- **Test Runs** - Test execution tracking
- **Test Results** - Result logging with attachments
- **Requirements** - Requirement traceability
- **Comments & Attachments** - Collaborative features

## Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Database Operations

#### Access Database Shell
```bash
docker-compose exec postgres psql -U eztest -d eztest
```

#### Backup Database
```bash
docker-compose exec postgres pg_dump -U eztest eztest > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore Database
```bash
cat backup_file.sql | docker-compose exec -T postgres psql -U eztest -d eztest
```

#### Run Migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

#### Reset Database (WARNING: Deletes all data)
```bash
docker-compose exec app npx prisma migrate reset --force
```

## Performance Optimization

### Resource Limits

The default configuration is optimized for 1 core / 2GB RAM:

- **App Container**: 0.5 CPU / 1.5GB RAM
- **Postgres Container**: 0.5 CPU / 512MB RAM

Adjust in `docker-compose.yml` if you have more resources:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'        # Increase for better performance
      memory: 2G
```

### Multi-stage Build

The Dockerfile uses a multi-stage build to minimize image size:
- Dependencies stage
- Build stage
- Minimal runtime stage (~200MB final image)

### Health Checks

Both services include health checks:
- App: HTTP check on `/api/health`
- Postgres: `pg_isready` check

## Monitoring

### Check Service Health
```bash
docker-compose ps
```

### View Resource Usage
```bash
docker stats
```

### Application Logs
```bash
docker-compose logs -f app
```

### Database Logs
```bash
docker-compose logs -f postgres
```

## Production Deployment

### Using Traefik (Recommended)

Add Traefik labels to `docker-compose.yml`:

```yaml
services:
  app:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.eztest.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.eztest.entrypoints=websecure"
      - "traefik.http.routers.eztest.tls.certresolver=letsencrypt"
```

### Using Nginx Reverse Proxy

Create nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS Setup

Use Certbot for Let's Encrypt certificates:

```bash
sudo certbot --nginx -d your-domain.com
```

## Backup Strategy

### Automated Backups

Create a backup script (`backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backups/eztest"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U eztest eztest > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
docker cp eztest-app:/app/uploads $BACKUP_DIR/uploads_$DATE

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

Add to cron:
```bash
0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### App Won't Start

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Database not ready: Wait for postgres health check
- Port conflict: Change port in docker-compose.yml
- Memory limit: Increase in docker-compose.yml

### Database Connection Failed

Verify postgres is running:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

Test connection:
```bash
docker-compose exec postgres psql -U eztest -d eztest -c "SELECT 1;"
```

### Out of Memory

Check memory usage:
```bash
docker stats
```

Solutions:
- Increase Docker memory limit
- Adjust container resource limits
- Add swap space to host

### Slow Performance

- Check resource usage: `docker stats`
- Increase CPU/memory limits
- Optimize database queries
- Add database indexes

## Security Considerations

1. **Change Default Passwords** - Always use strong, unique passwords
2. **Use HTTPS** - Deploy behind SSL/TLS in production
3. **Regular Updates** - Keep Docker images and dependencies updated
4. **Firewall** - Only expose necessary ports
5. **Backups** - Regular automated backups
6. **Environment Variables** - Never commit `.env` to version control

## 🔄 Switching Between Environments

### From Development to Production
```bash
# Stop development
docker-compose -f docker-compose.dev.yml down

# Start production
docker-compose up -d
```

### From Production to Development
```bash
# Stop production
docker-compose down

# Start development
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🛠️ Development-Specific Commands

### Install New Dependencies
When you add new npm packages, rebuild the development image:
```bash
docker-compose -f docker-compose.dev.yml build app
docker-compose -f docker-compose.dev.yml up -d
```

### Run Database Migrations (Dev)
```bash
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

### Seed Development Database
```bash
docker-compose -f docker-compose.dev.yml exec app npm run db:seed
```

### Access Development Database
```bash
docker-compose -f docker-compose.dev.yml exec postgres psql -U eztest -d eztest
```

### Shell into Development Container
```bash
docker-compose -f docker-compose.dev.yml exec app sh
```

### Clear Development Data
```bash
# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v

# Restart fresh
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📊 Comparison Table

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reloading | ✅ Yes | ❌ No |
| Code Mounting | ✅ Yes | ❌ No |
| Build Time | Fast (no build) | Slower (full build) |
| Image Size | ~800MB | ~200MB |
| Dependencies | All (dev + prod) | Production only |
| Database Port | 5434 | 5433 |
| Node Environment | development | production |
| Performance | Moderate | Optimized |
| Best For | Development | Deployment |

---

## 📝 Environment Variables

### Development (`.env.development`)
```bash
DATABASE_URL="postgresql://eztest:eztest_dev_password@localhost:5434/eztest?schema=public"
NODE_ENV="development"
NEXTAUTH_SECRET="dev-secret-change-in-production"
```

### Production (`.env`)
```bash
DATABASE_URL="postgresql://eztest:STRONG_PASSWORD@postgres:5432/eztest?schema=public"
NODE_ENV="production"
NEXTAUTH_SECRET="generate-a-secure-random-string"
APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"
```

## Support

For issues, questions, or contributions:
- GitHub Issues: [Repository URL]
- Documentation: [Docs URL]
- Email: support@example.com

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the [LICENSE](./LICENSE) file for details.
