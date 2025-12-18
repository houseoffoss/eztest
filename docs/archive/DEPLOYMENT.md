# Deployment & Configuration

## Deployment Overview

EZTest is designed for self-hosting with Docker for easy deployment across environments.

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 14+ (or use provided container)
- 1+ CPU cores, 2GB+ RAM
- Internet connectivity for pulls

---

## Docker Deployment

### Quick Start (Recommended)

1. **Clone Repository**
   ```bash
   git clone https://github.com/houseoffoss/eztest.git
   cd eztest.houseoffoss.com
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Generate Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   # Add to .env as NEXTAUTH_SECRET=<value>
   ```

4. **Start Services**
   ```bash
   # Production setup
   docker-compose up -d

   # Or development setup
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Verify Deployment**
   ```bash
   # Check services running
   docker-compose ps

   # View logs
   docker-compose logs app
   ```

6. **Access Application**
   - Open http://localhost:3000
   - Login with credentials

---

## Production Deployment

### Environment Configuration

```env
# .env (Production)
NODE_ENV=production
DATABASE_URL=postgresql://user:secure_password@db.example.com:5432/eztest
NEXTAUTH_SECRET=<generated-32-char-secret>
NEXTAUTH_URL=https://your-domain.com
DEBUG=false
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/lib/eztest/uploads
```

### Docker Compose Production

```yaml
# docker-compose.yml (Production)
version: '3.8'

services:
  app:
    image: eztest:latest
    container_name: eztest-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:16
    container_name: eztest-postgres
    restart: always
    environment:
      - POSTGRES_USER=eztest
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=eztest
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eztest"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Build Production Image

```bash
# Build image
docker build -t eztest:latest .

# Or using Docker Compose
docker-compose build

# Tag for registry
docker tag eztest:latest your-registry/eztest:latest

# Push to registry
docker push your-registry/eztest:latest
```

---

## Reverse Proxy Setup

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/eztest
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 30d;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/eztest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Traefik Configuration

```yaml
# docker-compose.yml with Traefik
version: '3.8'

services:
  traefik:
    image: traefik:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./acme.json:/acme.json
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entryPoints.web.address=:80"
      - "--entryPoints.websecure.address=:443"
      - "--certificatesResolvers.letsencrypt.acme.httpChallenge.entryPoint=web"
      - "--certificatesResolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesResolvers.letsencrypt.acme.storage=/acme.json"

  app:
    image: eztest:latest
    restart: always
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.eztest.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.eztest.entrypoints=websecure"
      - "traefik.http.routers.eztest.tls.certresolver=letsencrypt"
      - "traefik.http.services.eztest.loadbalancer.server.port=3000"
    depends_on:
      - postgres
```

---

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal check
sudo systemctl status certbot.timer

# Manual renewal
sudo certbot renew
```

### Self-Signed Certificates (Development)

```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use in Nginx
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

---

## Database Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# backup.sh - Automated daily backup

CONTAINER="eztest-postgres"
BACKUP_DIR="/var/lib/eztest/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker exec $CONTAINER pg_dump -U eztest eztest | \
  gzip > $BACKUP_DIR/eztest_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "eztest_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/eztest_$DATE.sql.gz"
```

**Add to Crontab:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Manual Backup

```bash
# Backup database
docker exec eztest-postgres pg_dump -U eztest eztest > backup.sql

# Backup files
tar -czf uploads_backup.tar.gz uploads/

# Backup everything
tar -czf eztest_backup_$(date +%Y%m%d).tar.gz uploads/ backup.sql
```

### Restore from Backup

```bash
# Restore database
cat backup.sql | docker exec -i eztest-postgres psql -U eztest -d eztest

# Restore files
tar -xzf uploads_backup.tar.gz
```

---

## Monitoring & Health Checks

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: 'Database unavailable' },
      { status: 503 }
    );
  }
}
```

### Container Health Check

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Monitoring with Prometheus (Future)

```typescript
// Metrics endpoint
export async function GET() {
  const metrics = await collectMetrics();
  return new Response(metrics, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
```

---

## Performance Tuning

### Database Connection Pooling

```env
# .env - Connection pool configuration
DATABASE_URL=postgresql://user:pass@host/db?pool_size=20&statement_cache_size=200
```

### Nginx Caching

```nginx
# Cache static assets
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location ~* \.(js|css|woff|woff2)$ {
    proxy_cache my_cache;
    proxy_cache_valid 200 7d;
    add_header Cache-Control "public, max-age=604800";
}
```

### Application Optimization

```env
# Production environment
NODE_ENV=production
DEBUG=false

# Optimize for performance
DATABASE_POOL_SIZE=20
```

---

## Security Hardening

### Environment Variables

```bash
# Use .env with restricted permissions
chmod 600 .env

# Use secrets manager in production
docker secret create nextauth_secret - < secret.txt
```

### Database Security

```sql
-- Create restricted user
CREATE USER eztest_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE eztest TO eztest_app;
GRANT USAGE ON SCHEMA public TO eztest_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eztest_app;

-- Revoke dangerous permissions
REVOKE SUPERUSER ON eztest FROM eztest_app;
```

### Container Security

```yaml
# docker-compose.yml security
services:
  app:
    security_opt:
      - no-new-privileges:true
    read_only: true
    volumes:
      - /tmp
      - ./uploads
    networks:
      - internal
```

### Firewall Rules

```bash
# UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Scaling Considerations

### Horizontal Scaling

```yaml
# Multiple app instances behind load balancer
version: '3.8'
services:
  app1:
    image: eztest:latest
    environment:
      - NODE_ENV=production
  app2:
    image: eztest:latest
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - app1
      - app2
```

### Database Scaling

- **Read Replicas**: Set up PostgreSQL replicas for read-heavy workloads
- **Connection Pooling**: Use PgBouncer or similar
- **Partitioning**: Partition large tables for better performance

### Caching Layer

```yaml
# Add Redis for caching
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## Disaster Recovery

### Backup Strategy

1. **Daily backups** - Database dumps
2. **Weekly archives** - Full system backup
3. **Monthly verification** - Test restore process
4. **Off-site storage** - Store backups securely

### Recovery Time Objective (RTO)

- **Target**: < 1 hour
- **Database restore**: ~5-10 minutes
- **Application restart**: ~1-2 minutes
- **Verification**: ~5-10 minutes

### Recovery Point Objective (RPO)

- **Target**: < 1 hour of data loss
- **Backup frequency**: Daily
- **Database logging**: Enabled

---

## Troubleshooting Deployment

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues
# - Port already in use
# - Database connection failed
# - Missing environment variables
```

### Database Connection Issues

```bash
# Test connection
docker exec eztest-postgres psql -U eztest -d eztest -c "SELECT 1"

# Check network
docker network inspect eztest_default
```

### High Memory Usage

```bash
# Monitor container
docker stats eztest-app

# Limit memory
docker-compose.yml: mem_limit: 2g
```

### Slow Performance

```bash
# Check database
docker exec eztest-postgres psql -U eztest -d eztest -c "SELECT * FROM pg_stat_statements LIMIT 10"

# Analyze Nginx logs
tail -f /var/log/nginx/access.log
```

---

## Maintenance Tasks

### Regular Updates

```bash
# Weekly: Check for updates
docker pull postgres:16
docker pull node:18

# Monthly: Update dependencies
docker-compose pull
docker-compose up -d
```

### Log Rotation

```bash
# Set up logrotate
cat > /etc/logrotate.d/eztest << EOF
/var/log/eztest/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
}
EOF
```

### Database Maintenance

```bash
# Weekly: Vacuum and analyze
docker exec eztest-postgres vacuumdb -U eztest -d eztest -a

# Monthly: Reindex
docker exec eztest-postgres reindexdb -U eztest -d eztest -a
```

---

## Deployment Checklist

- [ ] Clone repository
- [ ] Configure .env with production values
- [ ] Generate NEXTAUTH_SECRET
- [ ] Set up PostgreSQL (or use container)
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Configure SSL/TLS
- [ ] Set up automated backups
- [ ] Configure monitoring/health checks
- [ ] Test health endpoint
- [ ] Set up firewall rules
- [ ] Test disaster recovery
- [ ] Document deployment
- [ ] Set up alerting
- [ ] Perform security audit

