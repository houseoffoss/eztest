# EzTest - Linux Server Deployment Guide

Complete guide for deploying EzTest on a Linux server using Docker.

---

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, or any modern Linux distribution
- **CPU**: 2+ cores recommended (minimum 1 core)
- **RAM**: 4GB recommended (minimum 2GB)
- **Storage**: 20GB+ available space
- **Network**: Open port 3000 (or your custom port)

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Git (for cloning repository)
- OpenSSL (for generating secrets)

---

## 🚀 Quick Start (Production)

### 1. Install Docker & Docker Compose

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**CentOS/RHEL:**
```bash
# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify
docker --version
docker compose version
```

### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/houseoffoss/eztest.git
cd eztest

# Or if you have a specific branch
git clone -b main https://github.com/houseoffoss/eztest.git
cd eztest
```

### 3. Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production.example .env

# Generate a secure NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"

# Generate a secure database password
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-25)
echo "Generated DB_PASSWORD: $DB_PASSWORD"

# Edit .env file with your values
nano .env
```

**Required changes in `.env`:**
```bash
# Update these critical values:
DATABASE_URL="postgresql://eztest:YOUR_DB_PASSWORD@postgres:5432/eztest?schema=public"
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"
NEXTAUTH_URL="https://your-domain.com"  # or http://your-server-ip:3000
APP_URL="https://your-domain.com"  # or http://your-server-ip:3000
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="YourStrongPassword123!"
```

### 4. Fix Line Endings (Important!)

The `docker-entrypoint.sh` script must have Unix line endings (LF) not Windows (CRLF):

```bash
# Install dos2unix if not available
sudo apt-get install -y dos2unix  # Ubuntu/Debian
# OR
sudo yum install -y dos2unix      # CentOS/RHEL

# Convert line endings
dos2unix docker-entrypoint.sh

# Verify it's executable
chmod +x docker-entrypoint.sh
```

### 5. Build and Start Services

```bash
# Build images (this may take 5-10 minutes)
docker compose build --no-cache

# Start services in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Wait for "Database setup completed!" message
# Press Ctrl+C to exit logs
```

### 6. Verify Deployment

```bash
# Check running containers
docker compose ps

# Should show both containers running:
# NAME                 STATUS              PORTS
# eztest-app           Up X minutes       0.0.0.0:3000->3000/tcp
# eztest-postgres      Up X minutes       0.0.0.0:5433->5432/tcp

# Check health
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"2025-11-25T..."}
```

### 7. Access Application

Open your browser and navigate to:
- Local: `http://localhost:3000`
- Remote: `http://your-server-ip:3000`
- Domain: `https://your-domain.com` (if configured with reverse proxy)

**Default Login:**
- Email: Value from `ADMIN_EMAIL` in `.env`
- Password: Value from `ADMIN_PASSWORD` in `.env`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

---

## 🔒 Production Security Checklist

### 1. Secure Secrets
- ✅ Generate strong `NEXTAUTH_SECRET` (32+ characters)
- ✅ Use strong database password (25+ characters, mixed case, numbers, symbols)
- ✅ Change default admin password immediately
- ✅ Never commit `.env` file to version control

### 2. Firewall Configuration
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow application port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 3. SSL/TLS Setup (Recommended)

**Option A: Using Nginx Reverse Proxy**
```bash
# Install Nginx
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/eztest

# Add configuration:
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/eztest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 4. Docker Security
```bash
# Run Docker as non-root user (optional)
sudo usermod -aG docker $USER
newgrp docker

# Enable Docker daemon security
sudo nano /etc/docker/daemon.json
# Add:
{
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}

sudo systemctl restart docker
```

### 5. Monitoring
```bash
# View container logs
docker compose logs -f app

# View database logs
docker compose logs -f postgres

# Monitor resource usage
docker stats

# Set up log rotation
sudo nano /etc/docker/daemon.json
# Add:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
cd eztest

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify
docker compose logs -f
```

### Backup Database
```bash
# Create backup
docker compose exec postgres pg_dump -U eztest eztest > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U eztest eztest < backup_20251125_120000.sql
```

### View Logs
```bash
# All services
docker compose logs -f

# Only app
docker compose logs -f app

# Only database
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 app
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart only app
docker compose restart app

# Full stop and start
docker compose down
docker compose up -d
```

---

## 🐛 Troubleshooting

### Issue: "bad interpreter: /bin/sh^M"
**Cause**: Windows line endings in shell script

**Solution**:
```bash
dos2unix docker-entrypoint.sh
chmod +x docker-entrypoint.sh
docker compose down
docker compose up -d --build
```

### Issue: Database connection failed
**Cause**: Database not ready or wrong credentials

**Solution**:
```bash
# Check if postgres is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Verify credentials in .env match docker-compose.yml
grep POSTGRES .env
```

### Issue: Container exits immediately
**Cause**: Missing environment variables or configuration error

**Solution**:
```bash
# Check container logs
docker compose logs app

# Rebuild without cache
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Issue: Port already in use
**Cause**: Another service using port 3000

**Solution**:
```bash
# Find process using port
sudo lsof -i :3000

# Option 1: Kill the process
sudo kill -9 <PID>

# Option 2: Change APP_PORT in .env
echo "APP_PORT=3001" >> .env
docker compose down
docker compose up -d
```

### Issue: Out of disk space
**Cause**: Docker images and volumes consuming space

**Solution**:
```bash
# Check disk usage
df -h
docker system df

# Clean up unused images
docker image prune -a

# Clean up unused volumes (WARNING: May delete data)
docker volume prune

# Clean everything (WARNING: Removes all unused containers, networks, images)
docker system prune -a --volumes
```

---

## 📊 Performance Tuning

### Increase Container Resources
Edit `docker-compose.yml`:
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'      # Increase from 0.5
          memory: 4G        # Increase from 1.5G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Database Performance
```bash
# Connect to database
docker compose exec postgres psql -U eztest

# Check database size
\l+

# Check table sizes
\dt+

# Create indexes (if needed)
-- Run in PostgreSQL
CREATE INDEX IF NOT EXISTS idx_project_members_user ON "ProjectMember"("userId");
CREATE INDEX IF NOT EXISTS idx_test_cases_project ON "TestCase"("projectId");
```

---

## 🌐 Scaling for Production

### Use External PostgreSQL
```bash
# Update .env
DATABASE_URL="postgresql://user:pass@external-db.example.com:5432/eztest?schema=public"

# Remove postgres service from docker-compose.yml
# Only run app service
docker compose up -d app
```

### Load Balancing (Multiple Instances)
```yaml
# docker-compose-scale.yml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

---

## 📞 Support

- **Documentation**: See `/docs` directory
- **Issues**: https://github.com/houseoffoss/eztest/issues
- **Email**: philip.moses@belsterns.com

---

## ✅ Post-Deployment Checklist

- [ ] Changed default admin password
- [ ] Configured strong database password
- [ ] Set up SSL/TLS certificate
- [ ] Configured firewall rules
- [ ] Set up automatic backups
- [ ] Configured monitoring/logging
- [ ] Tested password reset email (if configured)
- [ ] Verified health check endpoint
- [ ] Documented custom configuration
- [ ] Set up update schedule

---

**Congratulations! Your EzTest instance is now running on Linux! 🎉**
