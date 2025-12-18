# Operations Guide

Operations, deployment, and maintenance documentation for EZTest.

## Overview

This section covers:

- Deployment to various platforms
- Monitoring and logging
- Backup and recovery
- Troubleshooting

---

## Documentation Sections

| Section | Description |
|---------|-------------|
| [**Deployment**](./deployment/README.md) | Deploy to production |
| [**Monitoring**](./monitoring.md) | Monitoring and logging |
| [**Troubleshooting**](./troubleshooting.md) | Common issues and fixes |

---

## Quick Start

### Docker Deployment

```bash
# Clone and configure
git clone https://github.com/houseoffoss/eztest.git
cd eztest
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose up -d

# Initialize database
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed

# Check status
docker-compose ps
```

### Health Check

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

## System Requirements

### Minimum

| Resource | Specification |
|----------|---------------|
| CPU | 1 core |
| RAM | 2 GB |
| Storage | 10 GB |
| OS | Linux, macOS, Windows |

### Recommended (Production)

| Resource | Specification |
|----------|---------------|
| CPU | 2+ cores |
| RAM | 4+ GB |
| Storage | 20+ GB SSD |
| OS | Linux (Ubuntu 22.04) |

---

## Environment Checklist

### Before Production

- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] `DATABASE_URL` uses production database
- [ ] SSL/TLS enabled for all connections
- [ ] SMTP configured for emails
- [ ] S3 configured for attachments
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Logs configured

### Security Checklist

- [ ] Default passwords changed
- [ ] Unnecessary ports closed
- [ ] Firewall configured
- [ ] HTTPS enforced
- [ ] Admin access limited

---

## Common Operations

### Restart Services

```bash
# Docker Compose
docker-compose restart

# Individual service
docker-compose restart app
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U eztest eztest > backup.sql

# Restore
docker-compose exec -T postgres psql -U eztest eztest < backup.sql
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker-compose exec app npx prisma migrate deploy
```

---

## Service Ports

| Service | Default Port | Environment Variable |
|---------|--------------|----------------------|
| App | 3000 | PORT |
| PostgreSQL | 5432 | - |
| Prisma Studio | 5555 | - |

---

## File Locations

### Docker Volumes

| Volume | Purpose |
|--------|---------|
| `postgres_data` | Database files |

### Application Files

| Path | Purpose |
|------|---------|
| `.env` | Environment config |
| `docker-compose.yml` | Docker config |
| `prisma/schema.prisma` | Database schema |

---

## Support Contacts

- **Documentation:** This folder
- **GitHub Issues:** Report bugs
- **Maintainers:** 
  - Philip Moses (philip.moses@belsterns.com)
  - Kavin (kavin.p@belsterns.com)

---

## Related Documentation

- [Deployment Guide](./deployment/README.md)
- [Troubleshooting](./troubleshooting.md)
- [Configuration](../getting-started/configuration.md)
