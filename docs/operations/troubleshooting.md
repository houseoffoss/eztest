# Troubleshooting Guide

Common issues and solutions for EzTest.

## Quick Diagnostics

### Health Check

```bash
# API health
curl http://localhost:3000/api/health

# Docker services
docker-compose ps

# Logs
docker-compose logs --tail=50 app
```

### Expected Health Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Common Issues

### Application Won't Start

#### Symptom: Container exits immediately

**Check logs:**
```bash
docker-compose logs app
```

**Common causes:**

1. **Missing environment variables**
   ```bash
   # Verify .env exists
   cat .env
   
   # Check required variables
   grep NEXTAUTH_SECRET .env
   grep DATABASE_URL .env
   ```

2. **Database not ready**
   ```bash
   # Wait for database
   docker-compose up -d postgres
   sleep 10
   docker-compose up -d app
   ```

3. **Port already in use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill process or change port in docker-compose.yml
   ```

---

### Database Connection Issues

#### Symptom: "Can't reach database server"

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   docker-compose ps postgres
   ```

2. **Verify connection string:**
   ```bash
   # For Docker
   DATABASE_URL="postgresql://eztest:eztest@postgres:5432/eztest"
   
   # For local PostgreSQL
   DATABASE_URL="postgresql://user:pass@localhost:5432/eztest"
   ```

3. **Test connection:**
   ```bash
   docker-compose exec postgres psql -U eztest -d eztest -c "SELECT 1"
   ```

4. **Check network:**
   ```bash
   docker network ls
   docker-compose exec app ping postgres
   ```

---

### Authentication Issues

#### Symptom: "Invalid credentials" or session errors

**Solutions:**

1. **Verify NEXTAUTH_SECRET:**
   ```bash
   # Must be at least 32 characters
   echo $NEXTAUTH_SECRET | wc -c
   ```

2. **Check NEXTAUTH_URL:**
   ```bash
   # Must match actual URL (including port)
   NEXTAUTH_URL="http://localhost:3000"
   # or for production
   NEXTAUTH_URL="https://eztest.yourdomain.com"
   ```

3. **Clear browser cookies:**
   - Clear all cookies for the site
   - Try incognito mode

4. **Reset user password:**
   ```bash
   docker-compose exec app npx prisma db seed
   ```

---

### Prisma Issues

#### Symptom: "Prisma client not found"

**Solution:**
```bash
docker-compose exec app npx prisma generate
docker-compose restart app
```

#### Symptom: "Migration failed"

**Solutions:**

1. **Reset database (DEV ONLY - DELETES DATA):**
   ```bash
   docker-compose exec app npx prisma db push --force-reset
   docker-compose exec app npx prisma db seed
   ```

2. **Check migration status:**
   ```bash
   docker-compose exec app npx prisma migrate status
   ```

3. **Deploy pending migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

---

### Build Errors

#### Symptom: Docker build fails

**Solutions:**

1. **Clear Docker cache:**
   ```bash
   docker-compose build --no-cache
   ```

2. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

3. **Clean Docker:**
   ```bash
   docker system prune -a
   ```

#### Symptom: npm install fails

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   ```

---

### Performance Issues

#### Symptom: Slow page loads

**Solutions:**

1. **Check resources:**
   ```bash
   docker stats
   ```

2. **Check database indexes:**
   ```bash
   docker-compose exec app npx prisma db push
   ```

3. **Check for large queries:**
   - Review browser network tab
   - Check API response times

#### Symptom: High memory usage

**Solutions:**

1. **Restart services:**
   ```bash
   docker-compose restart
   ```

2. **Increase container limits:**
   ```yaml
   # docker-compose.yml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 2G
   ```

---

### Email Issues

#### Symptom: Emails not sending

**Solutions:**

1. **Verify SMTP settings:**
   ```bash
   grep SMTP .env
   ```

2. **Test SMTP connection:**
   ```bash
   curl http://localhost:3000/api/email/status
   ```

3. **Check SMTP credentials:**
   - Verify username/password
   - For Gmail, use App Password
   - Check sender email is verified

4. **Check spam folder** for test emails

---

### File Upload Issues

#### Symptom: Attachments fail to upload

**Solutions:**

1. **Verify S3 settings:**
   ```bash
   grep AWS .env
   ```

2. **Check S3 bucket:**
   - Bucket exists
   - CORS configured
   - IAM permissions set

3. **Check file size:**
   - Max 500MB per file
   - Try smaller file

4. **Check browser console** for errors

---

## Logs & Debugging

### View Application Logs

```bash
# All logs
docker-compose logs -f

# App only
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# With timestamps
docker-compose logs -t app
```

### View Database Logs

```bash
docker-compose logs -f postgres
```

### Enable Debug Mode

Add to `.env`:
```env
DEBUG=prisma:query
```

### Browser DevTools

1. **Network tab** - Check API responses
2. **Console** - JavaScript errors
3. **Application > Cookies** - Session tokens

---

## Recovery Procedures

### Reset Admin Password

```bash
# Re-seed creates default users
docker-compose exec app npx prisma db seed
```

### Database Recovery

```bash
# Restore from backup
cat backup.sql | docker-compose exec -T postgres psql -U eztest eztest
```

### Full Reset (DEV ONLY)

```bash
# Stop everything
docker-compose down -v

# Remove data
docker volume rm eztest_postgres_data

# Start fresh
docker-compose up -d
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

---

## Getting Help

### Before Asking

1. Check this guide
2. Search existing issues
3. Review logs

### Reporting Issues

Include:
- EzTest version
- OS and Docker version
- Error messages
- Steps to reproduce
- Relevant logs

### Resources

- **GitHub Issues:** [Report bugs](https://github.com/houseoffoss/eztest/issues)
- **Discussions:** [Ask questions](https://github.com/houseoffoss/eztest/discussions)
- **Documentation:** This docs folder

---

## Related Documentation

- [Installation](../getting-started/installation.md)
- [Configuration](../getting-started/configuration.md)
- [Deployment](./deployment/README.md)
