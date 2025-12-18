# Deployment Guide

Complete guide to deploying EzTest in production.

## Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| [Docker Compose](#docker-compose) | Self-hosted, VPS | Low |
| [Cloud Platforms](#cloud-platforms) | Scalability | Medium |
| [Manual](#manual-deployment) | Custom setups | High |

---

## <a id="docker-compose"></a>Docker Compose (Recommended)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain name (optional but recommended)
- SSL certificate (optional but recommended)

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin
```

### Step 2: Clone Repository

```bash
git clone https://github.com/houseoffoss/eztest.git
cd eztest
```

### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
```

Production `.env`:

```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://eztest.yourdomain.com
NEXTAUTH_SECRET=your-very-secure-random-string-at-least-32-characters

# Database
DATABASE_URL=postgresql://eztest:secure-password@postgres:5432/eztest

# Email (optional)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# S3 (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=eztest-attachments
```

### Step 4: Start Services

```bash
# Build and start
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Initialize Database

```bash
# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed initial data
docker-compose exec app npx prisma db seed
```

### Step 6: Verify Deployment

```bash
# Health check
curl http://localhost:3000/api/health

# Access application
# http://your-server-ip:3000
```

---

## SSL/HTTPS Setup

### Using Nginx Reverse Proxy

1. **Install Nginx:**

```bash
sudo apt install nginx
```

2. **Configure Nginx:**

```nginx
# /etc/nginx/sites-available/eztest
server {
    listen 80;
    server_name eztest.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eztest.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/eztest.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eztest.yourdomain.com/privkey.pem;

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
```

3. **Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/eztest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Get SSL Certificate (Let's Encrypt):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d eztest.yourdomain.com
```

---

## <a id="cloud-platforms"></a>Cloud Platform Deployment

### DigitalOcean

1. **Create Droplet:**
   - Ubuntu 22.04
   - 2GB RAM / 1 vCPU minimum
   - Enable backups

2. **Follow Docker Compose steps above**

### AWS (EC2 + RDS)

1. **Create RDS PostgreSQL instance**
2. **Create EC2 instance (t3.small minimum)**
3. **Configure Security Groups:**
   - EC2: Allow 80, 443, 22
   - RDS: Allow 5432 from EC2

4. **Deploy application on EC2**
5. **Update DATABASE_URL to point to RDS**

### Railway / Render

1. **Connect GitHub repository**
2. **Set environment variables**
3. **Add PostgreSQL database**
4. **Deploy**

---

## <a id="manual-deployment"></a>Manual Deployment

### Without Docker

1. **Install Node.js 18+**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

2. **Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb eztest
sudo -u postgres createuser eztest -P
```

3. **Clone and build**

```bash
git clone https://github.com/houseoffoss/eztest.git
cd eztest
npm install
npm run build
```

4. **Configure environment**

```bash
cp .env.example .env
# Edit .env with production values
```

5. **Initialize database**

```bash
npx prisma migrate deploy
npx prisma db seed
```

6. **Start with PM2**

```bash
npm install -g pm2
pm2 start npm --name eztest -- start
pm2 save
pm2 startup
```

---

## Production Checklist

### Before Going Live

- [ ] Strong NEXTAUTH_SECRET configured
- [ ] DATABASE_URL points to production database
- [ ] SSL/HTTPS enabled
- [ ] Domain DNS configured
- [ ] Email/SMTP configured
- [ ] S3 configured (if using attachments)
- [ ] Firewall rules set
- [ ] Backups enabled
- [ ] Monitoring set up
- [ ] Default admin password changed

### Performance

- [ ] Database indexes verified
- [ ] Appropriate server resources
- [ ] CDN for static assets (optional)

### Security

- [ ] Latest security patches
- [ ] Minimal exposed ports
- [ ] Secrets not in code
- [ ] Regular updates planned

---

## Maintenance

### Updates

```bash
# Pull latest
cd eztest
git pull origin main

# Rebuild
docker-compose down
docker-compose up -d --build

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Backups

```bash
# Database backup
docker-compose exec postgres pg_dump -U eztest eztest > backup-$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U eztest eztest
```

### Monitoring

```bash
# View logs
docker-compose logs -f app

# Resource usage
docker stats

# Health check
curl http://localhost:3000/api/health
```

---

## Troubleshooting

See [Troubleshooting Guide](../troubleshooting.md)

---

## Related Documentation

- [Configuration](../../getting-started/configuration.md)
- [Troubleshooting](../troubleshooting.md)
- [Docker Documentation](../../DOCKER.md)
