# Linux Deployment Checklist

## Quick Start Checklist

### ✅ Prerequisites
- [ ] Linux server with Docker Engine 20.10+
- [ ] Docker Compose V2 installed
- [ ] Git installed
- [ ] Ports 3000 and 5435 available
- [ ] At least 2GB RAM available
- [ ] At least 10GB disk space

### ✅ Initial Setup

1. **Clone Repository**
```bash
cd /opt  # or your preferred location
git clone <repository-url> eztest
cd eztest
```

2. **Prepare Environment File**
```bash
# Copy template
cp .env.docker .env.docker.backup
nano .env.docker  # or vim, vi, etc.
```

3. **Generate Secure Secrets**
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

4. **Update .env.docker**
- [ ] Set `NEXTAUTH_SECRET` (from step 3)
- [ ] Set `POSTGRES_PASSWORD` (from step 3)
- [ ] Update `NEXTAUTH_URL` (your domain)
- [ ] Update `APP_URL` (your domain)
- [ ] Set `ADMIN_EMAIL`
- [ ] Set `ADMIN_PASSWORD` (strong password)
- [ ] Set `ENABLE_SMTP=true` (if using email features)
- [ ] Configure SMTP settings (if email is enabled)

### ✅ File Preparation

5. **Fix Line Endings (if cloned on Windows)**
```bash
# Install dos2unix if not available
sudo apt-get install dos2unix  # Debian/Ubuntu
# or
sudo yum install dos2unix      # CentOS/RHEL

# Fix line endings
dos2unix docker-entrypoint.sh
chmod +x docker-entrypoint.sh
```

6. **Verify File Permissions**
```bash
chmod 600 .env.docker  # Restrict access to env file
chmod 755 docker-entrypoint.sh
```

### ✅ Docker Deployment

7. **Pull Images**
```bash
docker compose pull
```

8. **Build Application**
```bash
docker compose build app
```

9. **Start Services**
```bash
docker compose up -d
```

10. **Verify Deployment**
```bash
# Check container status
docker compose ps

# Both should show "healthy"
# eztest-postgres  (healthy)
# eztest-app       (healthy)
```

### ✅ Verification

11. **Check Logs**
```bash
# Application logs
docker compose logs app --tail=50

# Should see:
# "Database setup completed!"
# "Ready in XXXms"

# No errors about authentication or connection
```

12. **Test Health Endpoint**
```bash
curl http://localhost:3000/api/health

# Expected response:
# {"status":"healthy","timestamp":"..."}
```

13. **Test Application Access**
```bash
# From server
curl -I http://localhost:3000

# Should return HTTP 200

# From external (if firewall allows)
curl -I http://your-server-ip:3000
```

### ✅ Post-Deployment

14. **Access Application**
- Open browser: `http://your-server-ip:3000`
- Login with admin credentials from .env.docker

15. **Configure Firewall**
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 3000/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

16. **Set Up Reverse Proxy** (Recommended)
```bash
# Install Nginx
sudo apt-get install nginx  # Ubuntu/Debian

# Configure SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### ✅ Security

17. **Security Hardening**
- [ ] Changed all default passwords
- [ ] Configured SSL/TLS (HTTPS)
- [ ] Set up firewall rules
- [ ] Restricted .env.docker permissions (chmod 600)
- [ ] Configured fail2ban (optional)
- [ ] Set up log rotation
- [ ] Disabled direct port access (use reverse proxy)

18. **Backup Setup**
```bash
# Create backup directory
sudo mkdir -p /backups/eztest

# Create backup script
sudo nano /usr/local/bin/backup-eztest.sh
```

Backup script content:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/eztest"

# Backup database
docker compose exec -T postgres pg_dump -U eztest eztest > "$BACKUP_DIR/eztest_$DATE.sql"

# Backup uploads
docker compose cp eztest-app:/app/uploads "$BACKUP_DIR/uploads_$DATE"

# Keep only last 7 days
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-eztest.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-eztest.sh") | crontab -
```

### ✅ Monitoring

19. **Set Up Monitoring**
```bash
# Install monitoring tools (optional)
# Portainer - Docker management UI
docker volume create portainer_data
docker run -d -p 9000:9000 \
  --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

20. **Configure Log Management**
```bash
# View logs
docker compose logs -f app

# Configure log rotation in docker-compose.yml
# (already configured with max-size and max-file)
```

### ✅ Maintenance

21. **Create Maintenance Scripts**

**/usr/local/bin/eztest-restart.sh**
```bash
#!/bin/bash
cd /opt/eztest
docker compose restart app
docker compose ps
```

**/usr/local/bin/eztest-update.sh**
```bash
#!/bin/bash
cd /opt/eztest
git pull
docker compose down
docker compose build app
docker compose up -d
docker compose ps
```

**/usr/local/bin/eztest-logs.sh**
```bash
#!/bin/bash
cd /opt/eztest
docker compose logs -f --tail=100 app
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/eztest-*.sh
```

## Common Issues and Fixes

### Issue: Container fails to start
```bash
# Check logs
docker compose logs app

# Check disk space
df -h

# Check memory
free -h

# Restart services
docker compose restart
```

### Issue: Database connection failed
```bash
# Check postgres is healthy
docker compose ps postgres

# Check postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres

# If needed, reset database (WARNING: Deletes data)
docker compose down -v
docker compose up -d
```

### Issue: Permission denied on docker-entrypoint.sh
```bash
# Fix line endings and permissions
dos2unix docker-entrypoint.sh
chmod +x docker-entrypoint.sh

# Rebuild
docker compose down
docker compose build app
docker compose up -d
```

### Issue: Port 3000 already in use
```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the process or change port in docker-compose.yml
# Edit docker-compose.yml:
# ports:
#   - "3001:3000"  # Changed host port to 3001
```

### Issue: Out of disk space
```bash
# Check space
df -h

# Clean up Docker
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

## Verification Checklist

After deployment, verify:

- [ ] Containers are running: `docker compose ps`
- [ ] Postgres is healthy: Status shows "(healthy)"
- [ ] App is healthy: Status shows "(healthy)"
- [ ] Health endpoint works: `curl http://localhost:3000/api/health`
- [ ] Application loads in browser
- [ ] Can login with admin credentials
- [ ] Database is accessible
- [ ] Uploads directory is writable
- [ ] No errors in logs: `docker compose logs app`

## Production URLs

Update these in .env.docker:
```bash
# Development
APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Production - Change to your domain
APP_URL=https://eztest.yourdomain.com
NEXTAUTH_URL=https://eztest.yourdomain.com
```

## Quick Commands Reference

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f app

# Check status
docker compose ps

# Rebuild after code changes
docker compose down
docker compose build app
docker compose up -d

# Reset everything (WARNING: Deletes data)
docker compose down -v
docker compose up -d

# Enter container shell
docker compose exec app sh

# Database shell
docker compose exec postgres psql -U eztest -d eztest

# Backup database
docker compose exec postgres pg_dump -U eztest eztest > backup.sql

# Restore database
docker compose exec -T postgres psql -U eztest eztest < backup.sql
```

## Support Files

Created during deployment:
- `DOCKER_DEPLOYMENT_SUCCESS.md` - Detailed success documentation
- `ENVIRONMENT_CONFIGURATION.md` - Environment variable guide
- `DEPLOYMENT_LINUX.md` - Complete deployment guide
- `DOCKER_STATUS.md` - Docker compatibility summary
- `check-deployment.sh` - Pre-deployment validation

---
**Status**: Ready for Production ✅
**Last Updated**: November 25, 2025
